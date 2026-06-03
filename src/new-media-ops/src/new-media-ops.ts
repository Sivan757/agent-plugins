#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createServer, connect } from 'node:net';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Command } from 'commander';
import { marked } from 'marked';

import {
  configPath,
  launchConfigUI,
  requireConfigWithSetup,
} from '@agent-plugins/core';
import type { ConfigUIOptions } from '@agent-plugins/core';

export type PlatformTarget = 'wechat-article' | 'wechat-newspic' | 'xiaohongshu';

export interface ContentPackage {
  version: 1;
  slug: string;
  title: string;
  summary?: string;
  author?: string;
  sourceInputs: string[];
  target: PlatformTarget;
  files: {
    brief?: string;
    markdown: string;
    html?: string;
    cover?: string;
    images?: string[];
    platformCopy?: string;
  };
  quality: {
    score: number;
    warnings: string[];
    checkedAt: string;
  };
}

export interface CommandResult {
  success: boolean;
  target?: PlatformTarget;
  packageDir?: string;
  files?: Record<string, string>;
  warnings: string[];
  nextSteps: string[];
  remote?: {
    mediaId?: string;
    draftUrl?: string;
    endpoint?: string;
    dryRun?: boolean;
    articleType?: string;
  };
}

interface WechatAccountConfig {
  appId: string;
  appSecret: string;
  author?: string;
  defaultTheme?: string;
  needOpenComment?: boolean | string | number;
  onlyFansCanComment?: boolean | string | number;
  publishMethod?: 'api' | 'remote-api' | 'manual';
  remotePublishHost?: string;
  remotePublishUser?: string;
  remotePublishPort?: number | string;
  remotePublishIdentityFile?: string;
  remotePublishKnownHostsFile?: string;
  remotePublishStrictHostKeyChecking?: string;
  remotePublishConnectTimeout?: number | string;
  remotePublishProxyJump?: string;
}

interface NewMediaOpsConfig extends Record<string, unknown> {
  wechat?: {
    accounts?: Record<string, WechatAccountConfig>;
  };
  xiaohongshu?: {
    profiles?: Record<string, Record<string, unknown>>;
  };
  defaults?: {
    brandVoice?: string;
    contentDir?: string;
    imageBackend?: string;
    target?: PlatformTarget;
  };
}

interface DraftPackageOptions {
  input: string;
  target: PlatformTarget | string;
  outDir?: string;
  slug?: string;
  title?: string;
  summary?: string;
  author?: string;
  images?: string[];
  cover?: string;
}

interface RenderOptions {
  theme?: string;
  citeLinks?: boolean;
  color?: string;
}

interface WechatDraftPayloadOptions {
  target: PlatformTarget;
  title: string;
  html?: string;
  markdown?: string;
  coverMediaId?: string;
  imageMediaIds?: string[];
  author?: string;
  summary?: string;
  needOpenComment?: boolean;
  onlyFansCanComment?: boolean;
}

interface PublishDraftOptions {
  packageDir: string;
  accountName: string;
  coverMediaId?: string;
  imageMediaIds?: string[];
  dryRun?: boolean;
  minimumScore?: number;
}

interface MarkdownRenderResult {
  html: string;
  warnings: string[];
}

interface AnalysisResult {
  title: string;
  source: string;
  characters: number;
  headings: string[];
  links: string[];
  images: string[];
  suggestedAngles: string[];
  platformFit: Record<PlatformTarget, string>;
  risks: string[];
}

interface WechatApiError {
  errcode?: number;
  errmsg?: string;
}

interface WechatTokenResponse extends WechatApiError {
  access_token?: string;
  expires_in?: number;
}

interface WechatMediaResponse extends WechatApiError {
  media_id?: string;
  url?: string;
}

interface WechatDraftResponse extends WechatApiError {
  media_id?: string;
}

interface WechatTransport {
  requestJson<T>(url: string, init?: RequestInit): Promise<T>;
  uploadMaterialImage(accessToken: string, imagePath: string): Promise<string>;
  close(): Promise<void>;
}

const PLUGIN_NAME = 'new-media-ops';
const DEFAULT_MINIMUM_SCORE = 70;
const PLATFORM_TARGETS = ['wechat-article', 'wechat-newspic', 'xiaohongshu'] as const;

const CONFIG_UI: ConfigUIOptions = {
  spec: {
    root: 'page',
    elements: {
      page: {
        type: 'Header',
        props: {
          title: { en: 'New Media Ops', zh: '新媒体运营' },
          description: { en: 'Configure draft-first content operations accounts', zh: '配置草稿优先的新媒体运营账号' },
          configPath: null,
        },
        children: ['wechat', 'xiaohongshu', 'defaults', 'save'],
      },
      wechat: {
        type: 'Collection',
        props: {
          title: { en: 'WeChat Official Account', zh: '微信公众号' },
          itemLabel: { en: 'Account', zh: '账号' },
          statePath: '/wechat/accounts',
          nameEditable: true,
        },
        children: [
          'wechat-app-id',
          'wechat-app-secret',
          'wechat-author',
          'wechat-theme',
          'wechat-method',
          'wechat-comment',
          'wechat-fans-comment',
          'wechat-remote-host',
          'wechat-remote-user',
        ],
      },
      'wechat-app-id': {
        type: 'Field',
        props: { label: { en: 'App ID', zh: 'App ID' }, type: 'text', required: true, help: null, placeholder: 'wx...', options: null, statePath: 'appId' },
      },
      'wechat-app-secret': {
        type: 'Field',
        props: { label: { en: 'App Secret', zh: 'App Secret' }, type: 'password', required: true, help: null, placeholder: null, options: null, statePath: 'appSecret' },
      },
      'wechat-author': {
        type: 'Field',
        props: { label: { en: 'Default Author', zh: '默认作者' }, type: 'text', required: false, help: null, placeholder: null, options: null, statePath: 'author' },
      },
      'wechat-theme': {
        type: 'Field',
        props: { label: { en: 'Default Theme', zh: '默认主题' }, type: 'select', required: false, help: null, placeholder: null, options: ['default', 'grace', 'simple', 'modern'], statePath: 'defaultTheme' },
      },
      'wechat-method': {
        type: 'Field',
        props: { label: { en: 'Publish Method', zh: '草稿方式' }, type: 'select', required: false, help: { en: 'MVP supports API staging; manual keeps output local.', zh: 'MVP 支持 API 暂存；manual 仅生成本地素材。' }, placeholder: null, options: ['api', 'remote-api', 'manual'], statePath: 'publishMethod' },
      },
      'wechat-comment': {
        type: 'Field',
        props: { label: { en: 'Open Comments', zh: '开启留言' }, type: 'checkbox', required: false, help: null, placeholder: null, options: null, statePath: 'needOpenComment' },
      },
      'wechat-fans-comment': {
        type: 'Field',
        props: { label: { en: 'Fans Only Comments', zh: '仅粉丝留言' }, type: 'checkbox', required: false, help: null, placeholder: null, options: null, statePath: 'onlyFansCanComment' },
      },
      'wechat-remote-host': {
        type: 'Field',
        props: { label: { en: 'Remote API Host', zh: '远程白名单主机' }, type: 'text', required: false, help: null, placeholder: 'server.example.com', options: null, statePath: 'remotePublishHost' },
      },
      'wechat-remote-user': {
        type: 'Field',
        props: { label: { en: 'Remote API User', zh: '远程主机用户' }, type: 'text', required: false, help: null, placeholder: 'deploy', options: null, statePath: 'remotePublishUser' },
      },
      xiaohongshu: {
        type: 'Collection',
        props: {
          title: { en: 'Xiaohongshu Profiles', zh: '小红书账号' },
          itemLabel: { en: 'Profile', zh: '账号' },
          statePath: '/xiaohongshu/profiles',
          nameEditable: true,
        },
        children: ['xhs-browser-profile', 'xhs-default-images', 'xhs-title-limit', 'xhs-body-limit'],
      },
      'xhs-browser-profile': {
        type: 'Field',
        props: { label: { en: 'Browser Profile Path', zh: '浏览器 Profile 路径' }, type: 'text', required: false, help: null, placeholder: null, options: null, statePath: 'browserProfilePath' },
      },
      'xhs-default-images': {
        type: 'Field',
        props: { label: { en: 'Default Image Count', zh: '默认图片数量' }, type: 'number', required: false, help: null, placeholder: '6', options: null, statePath: 'defaultImageCount' },
      },
      'xhs-title-limit': {
        type: 'Field',
        props: { label: { en: 'Title Limit', zh: '标题字数上限' }, type: 'number', required: false, help: null, placeholder: '20', options: null, statePath: 'titleLimit' },
      },
      'xhs-body-limit': {
        type: 'Field',
        props: { label: { en: 'Body Limit', zh: '正文长度上限' }, type: 'number', required: false, help: null, placeholder: '1000', options: null, statePath: 'bodyLimit' },
      },
      defaults: {
        type: 'Section',
        props: { title: { en: 'Defaults', zh: '默认设置' }, description: null, collapsible: true, defaultOpen: false },
        children: ['default-brand-voice', 'default-content-dir', 'default-target', 'default-image-backend'],
      },
      'default-brand-voice': {
        type: 'Field',
        props: { label: { en: 'Brand Voice', zh: '品牌语气' }, type: 'textarea', required: false, help: null, placeholder: null, options: null, statePath: '/defaults/brandVoice' },
      },
      'default-content-dir': {
        type: 'Field',
        props: { label: { en: 'Content Directory', zh: '内容目录' }, type: 'text', required: false, help: null, placeholder: './new-media-ops', options: null, statePath: '/defaults/contentDir' },
      },
      'default-target': {
        type: 'Field',
        props: { label: { en: 'Default Target', zh: '默认平台' }, type: 'select', required: false, help: null, placeholder: null, options: [...PLATFORM_TARGETS], statePath: '/defaults/target' },
      },
      'default-image-backend': {
        type: 'Field',
        props: { label: { en: 'Image Backend', zh: '图片后端' }, type: 'text', required: false, help: null, placeholder: 'codex-imagegen', options: null, statePath: '/defaults/imageBackend' },
      },
      save: {
        type: 'SaveBar',
        props: { saveLabel: null, resetLabel: null },
      },
    },
    state: {
      wechat: {
        accounts: [
          {
            _name: 'default',
            appId: '',
            appSecret: '',
            author: '',
            defaultTheme: 'default',
            publishMethod: 'api',
            needOpenComment: 'false',
            onlyFansCanComment: 'false',
            remotePublishHost: '',
            remotePublishUser: '',
          },
        ],
      },
      xiaohongshu: {
        profiles: [
          {
            _name: 'default',
            browserProfilePath: '',
            defaultImageCount: '6',
            titleLimit: '20',
            bodyLimit: '1000',
          },
        ],
      },
      defaults: {
        brandVoice: '',
        contentDir: './new-media-ops',
        target: 'wechat-article',
        imageBackend: 'codex-imagegen',
      },
    },
  },
  collections: [
    { statePath: '/wechat/accounts' },
    { statePath: '/xiaohongshu/profiles' },
  ],
  validate: isConfigIncomplete,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isPlatformTarget(value: string): value is PlatformTarget {
  return (PLATFORM_TARGETS as readonly string[]).includes(value);
}

function parsePlatformTarget(value: string): PlatformTarget {
  if (!isPlatformTarget(value)) {
    throw new Error(`Unsupported target "${value}". Expected one of: ${PLATFORM_TARGETS.join(', ')}`);
  }
  return value;
}

function toBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true' || value === 'yes';
}

function safeSlug(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return slug || `content-${Date.now()}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function extractFirstHeading(markdown: string): string | undefined {
  const match = markdown.match(/^#\s+(.+?)\s*$/m);
  return match?.[1]?.trim();
}

function stripFirstHeading(markdown: string): string {
  return markdown.replace(/^#\s+.+?\s*\n+/, '').trim();
}

function extractMarkdownImages(markdown: string): string[] {
  return [...markdown.matchAll(/!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map(match => match[1]);
}

function extractMarkdownLinks(markdown: string): string[] {
  return [...markdown.matchAll(/(^|[^!])\[[^\]\n]+]\((https?:\/\/[^)\s]+)(?:\s+"[^"]*")?\)/g)]
    .map(match => match[2]);
}

function extractMarkdownHeadings(markdown: string): string[] {
  return [...markdown.matchAll(/^#{1,3}\s+(.+?)\s*$/gm)].map(match => match[1].trim());
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function readUint24LE(buffer: Buffer, offset: number): number {
  return buffer.readUIntLE(offset, 3);
}

function readJpegDimensions(buffer: Buffer): { width: number; height: number } | undefined {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return undefined;

  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    if (marker === 0xd9 || marker === 0xda) return undefined;
    const segmentLength = buffer.readUInt16BE(offset + 2);
    if (segmentLength < 2) return undefined;
    const isStartOfFrame = (
      marker >= 0xc0 && marker <= 0xcf &&
      ![0xc4, 0xc8, 0xcc].includes(marker)
    );
    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + segmentLength;
  }

  return undefined;
}

async function readImageDimensions(imagePath: string): Promise<{ width: number; height: number }> {
  const resolved = resolve(imagePath);
  const buffer = await readFile(resolved);

  if (
    buffer.length >= 24 &&
    buffer[0] === 0x89 &&
    buffer.toString('ascii', 1, 4) === 'PNG' &&
    buffer.toString('ascii', 12, 16) === 'IHDR'
  ) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  const jpeg = readJpegDimensions(buffer);
  if (jpeg) return jpeg;

  if (buffer.length >= 30 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = buffer.toString('ascii', 12, 16);
    if (chunk === 'VP8X') {
      return {
        width: readUint24LE(buffer, 24) + 1,
        height: readUint24LE(buffer, 27) + 1,
      };
    }
  }

  throw new Error(`Unsupported image format for WeChat newspic portrait validation: ${imagePath}`);
}

function resolveDraftImagePath(imagePath: string, input: string): string {
  if (isHttpUrl(imagePath)) return imagePath;
  if (existsSync(imagePath)) return resolve(imagePath);
  if (existsSync(input)) return resolve(dirname(input), imagePath);
  return resolve(imagePath);
}

async function validateWechatNewspicImages(images: string[], options: { packageDir?: string; input?: string } = {}): Promise<void> {
  if (images.length === 0) {
    throw new Error('wechat-newspic requires at least 1 portrait image.');
  }
  if (images.length > 9) {
    throw new Error('wechat-newspic supports at most 9 images.');
  }

  for (const image of images) {
    if (isHttpUrl(image)) {
      throw new Error(`wechat-newspic image assets must be local portrait images: ${image}`);
    }
    const resolved = options.packageDir
      ? resolvePackageFile(options.packageDir, image)
      : resolveDraftImagePath(image, options.input || '');
    if (!resolved) {
      throw new Error(`wechat-newspic image path is empty: ${image}`);
    }
    const dimensions = await readImageDimensions(resolved);
    if (dimensions.height <= dimensions.width) {
      throw new Error(`wechat-newspic image must be portrait: ${image} is ${dimensions.width}x${dimensions.height}.`);
    }
  }
}

function truncateText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function scoreMarkdown(markdown: string, target: PlatformTarget, title: string, images: string[]): ContentPackage['quality'] {
  const warnings: string[] = [];
  let score = 100;
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[[^\]]+]\([^)]+\)/g, '$1')
    .replace(/[#>*_`-]/g, '')
    .trim();

  if (!title.trim()) {
    warnings.push('Missing title.');
    score -= 25;
  }
  if (target === 'wechat-newspic') {
    if (images.length === 0) {
      warnings.push('WeChat image-text posts require at least one portrait image.');
      score -= 35;
    }
    if (images.length > 9) {
      warnings.push('WeChat image-text posts support at most 9 images.');
      score -= 35;
    }
    if (plainText.length > 180) {
      warnings.push('WeChat image-text copy should stay brief; move the main content and viewpoint into portrait images.');
      score -= 15;
    }
  } else if (plainText.length < 80) {
    warnings.push('Content is short; review depth before staging.');
    score -= 15;
  }
  if (target === 'xiaohongshu' && images.length === 0) {
    warnings.push('Xiaohongshu packages should include at least one cover or card image.');
    score -= 10;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    warnings,
    checkedAt: new Date().toISOString(),
  };
}

function writeResult(result: CommandResult | AnalysisResult | Record<string, unknown>, format: string): void {
  if (format === 'json') {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if ('success' in result) {
    const commandResult = result as CommandResult;
    console.log(commandResult.success ? 'OK' : 'FAILED');
    if (commandResult.target) console.log(`Target: ${commandResult.target}`);
    if (commandResult.packageDir) console.log(`Package: ${commandResult.packageDir}`);
    for (const warning of commandResult.warnings) console.log(`Warning: ${warning}`);
    for (const step of commandResult.nextSteps) console.log(`Next: ${step}`);
    return;
  }

  const analysis = result as AnalysisResult;
  console.log(`# ${analysis.title}`);
  console.log('');
  console.log(`Source: ${analysis.source}`);
  console.log(`Characters: ${analysis.characters}`);
  console.log('');
  console.log('## Suggested Angles');
  for (const angle of analysis.suggestedAngles) console.log(`- ${angle}`);
  console.log('');
  console.log('## Risks');
  for (const risk of analysis.risks) console.log(`- ${risk}`);
}

async function ensureDirectory(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

async function readTextInput(input: string): Promise<string> {
  if (existsSync(input)) {
    return readFile(input, 'utf8');
  }
  return input;
}

function relativeFromPackage(packageDir: string, filePath: string): string {
  const resolvedPackage = resolve(packageDir);
  const resolvedFile = resolve(filePath);
  const rel = relative(resolvedPackage, resolvedFile);
  return rel.startsWith('..') ? filePath : rel || basename(filePath);
}

async function writePackageJson(packageDir: string, pkg: ContentPackage): Promise<void> {
  await writeFile(join(packageDir, 'content-package.json'), `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
}

async function readContentPackage(packageDir: string): Promise<ContentPackage> {
  const packagePath = join(packageDir, 'content-package.json');
  const parsed = JSON.parse(await readFile(packagePath, 'utf8')) as unknown;
  if (!isRecord(parsed) || parsed.version !== 1) {
    throw new Error(`${packagePath}: expected content package version 1`);
  }
  if (typeof parsed.title !== 'string' || typeof parsed.slug !== 'string' || typeof parsed.target !== 'string') {
    throw new Error(`${packagePath}: missing required content package fields`);
  }
  const target = parsePlatformTarget(parsed.target);
  if (!isRecord(parsed.files) || typeof parsed.files.markdown !== 'string') {
    throw new Error(`${packagePath}: files.markdown is required`);
  }
  if (!isRecord(parsed.quality) || typeof parsed.quality.score !== 'number' || !Array.isArray(parsed.quality.warnings)) {
    throw new Error(`${packagePath}: quality score and warnings are required`);
  }
  void target;
  return parsed as unknown as ContentPackage;
}

function buildXiaohongshuCopy(title: string, markdown: string): string {
  const body = stripFirstHeading(markdown)
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .trim();
  return [
    title,
    '',
    body,
    '',
    '#新媒体运营 #AI写作 #内容创作',
  ].join('\n');
}

function buildNewspicCopy(title: string, markdown: string): string {
  const body = stripFirstHeading(markdown)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/^#{1,6}\s+.+$/gm, '')
    .replace(/\[[^\]]+]\([^)]+\)/g, '$1')
    .split(/\n{2,}/)
    .map(part => part
      .replace(/^[-*]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      .replace(/^>\s?/gm, '')
      .replace(/\s+/g, ' ')
      .trim())
    .find(Boolean);
  const viewpoint = truncateText(body || title, 42);
  return [title, '', `主要观点看图：${viewpoint}`].join('\n').trim();
}

function stripNewspicCopyTitle(copy: string, title: string): string {
  const withoutHeading = stripFirstHeading(copy);
  const lines = withoutHeading.split(/\r?\n/);
  if (lines[0]?.trim() === title.trim()) {
    return lines.slice(1).join('\n').trim();
  }
  return withoutHeading.trim();
}

function applyCitations(markdown: string): string {
  const refs: Array<{ text: string; url: string }> = [];
  const body = markdown.replace(/(^|[^!])\[([^\]\n]+)]\((https?:\/\/[^)\s]+)(?:\s+"[^"]*")?\)/g, (_match, prefix: string, text: string, url: string) => {
    refs.push({ text, url });
    return `${prefix}${text}<sup>[${refs.length}]</sup>`;
  });

  if (refs.length === 0) return body;

  return [
    body.trimEnd(),
    '',
    '## 参考链接',
    '',
    ...refs.map((ref, index) => `${index + 1}. ${ref.text}: ${ref.url}`),
  ].join('\n');
}

function themeStyles(theme: string, color?: string): string {
  const primary = color || {
    default: '#07c160',
    grace: '#5b6f91',
    simple: '#222222',
    modern: '#2563eb',
  }[theme] || '#07c160';

  return [
    '<style>',
    '.nmo-wechat{font-size:16px;line-height:1.78;color:#1f2933;word-break:break-word;}',
    `.nmo-wechat h1{font-size:24px;line-height:1.35;margin:0 0 1em;color:${primary};font-weight:700;}`,
    `.nmo-wechat h2{font-size:20px;line-height:1.45;margin:1.6em 0 .8em;border-left:4px solid ${primary};padding-left:.7em;}`,
    '.nmo-wechat p{margin:1em 0;}',
    '.nmo-wechat blockquote{margin:1.2em 0;padding:.8em 1em;background:#f6f8fa;border-left:4px solid #d0d7de;color:#57606a;}',
    '.nmo-wechat pre{margin:1em 0;padding:1em;overflow:auto;background:#0f172a;color:#e2e8f0;border-radius:6px;}',
    '.nmo-wechat code{font-family:Menlo,Consolas,monospace;font-size:.92em;}',
    '.nmo-wechat img{max-width:100%;display:block;margin:1em auto;border-radius:4px;}',
    `.nmo-wechat a{color:${primary};text-decoration:none;}`,
    '.nmo-wechat ul,.nmo-wechat ol{padding-left:1.4em;}',
    '</style>',
  ].join('');
}

export function renderMarkdownToWechatHtml(markdown: string, options: RenderOptions = {}): MarkdownRenderResult {
  const warnings: string[] = [];
  const theme = options.theme || 'default';
  const markdownForRender = options.citeLinks ? applyCitations(markdown) : markdown;
  const rendered = marked.parse(markdownForRender, { async: false, gfm: true, breaks: false }) as string;
  const html = [
    `<section data-new-media-ops="wechat-article" class="nmo-wechat nmo-theme-${escapeHtml(theme)}">`,
    themeStyles(theme, options.color),
    rendered.trim(),
    '</section>',
  ].join('\n');

  return { html, warnings };
}

export async function createDraftPackage(options: DraftPackageOptions): Promise<CommandResult> {
  const target = parsePlatformTarget(options.target);
  const markdown = await readTextInput(options.input);
  const title = options.title?.trim() || extractFirstHeading(markdown) || basename(options.input, extname(options.input));
  const slug = safeSlug(options.slug || title);
  const outDir = resolve(options.outDir || 'new-media-ops');
  const packageDir = join(outDir, slug);
  const rawImages = options.images ?? extractMarkdownImages(markdown);
  const images = target === 'wechat-newspic'
    ? rawImages.map(image => resolveDraftImagePath(image, options.input))
    : rawImages;
  const cover = options.cover;
  const qualityMarkdown = target === 'wechat-newspic' ? buildNewspicCopy(title, markdown) : markdown;

  if (target === 'wechat-newspic') {
    await validateWechatNewspicImages(images, { input: options.input });
  }

  await ensureDirectory(packageDir);
  await writeFile(join(packageDir, 'final.md'), markdown.trimEnd() + '\n', 'utf8');

  const files: ContentPackage['files'] = {
    markdown: 'final.md',
  };
  if (cover) files.cover = cover;
  if (images.length > 0) files.images = images;

  const writtenFiles: Record<string, string> = {
    markdown: join(packageDir, 'final.md'),
  };

  if (target === 'xiaohongshu') {
    files.platformCopy = 'xiaohongshu-copy.md';
    await writeFile(join(packageDir, files.platformCopy), buildXiaohongshuCopy(title, markdown) + '\n', 'utf8');
    writtenFiles.platformCopy = join(packageDir, files.platformCopy);
  }

  if (target === 'wechat-newspic') {
    files.platformCopy = 'wechat-newspic-copy.md';
    await writeFile(join(packageDir, files.platformCopy), buildNewspicCopy(title, markdown) + '\n', 'utf8');
    writtenFiles.platformCopy = join(packageDir, files.platformCopy);
  }

  const contentPackage: ContentPackage = {
    version: 1,
    slug,
    title,
    ...(options.summary ? { summary: options.summary } : {}),
    ...(options.author ? { author: options.author } : {}),
    sourceInputs: [options.input],
    target,
    files,
    quality: scoreMarkdown(qualityMarkdown, target, title, images),
  };

  await writePackageJson(packageDir, contentPackage);
  writtenFiles.package = join(packageDir, 'content-package.json');

  return {
    success: true,
    target,
    packageDir,
    files: writtenFiles,
    warnings: contentPackage.quality.warnings,
    nextSteps: target === 'wechat-article'
      ? ['Run format to generate WeChat-compatible HTML.', 'Run publish-draft with --dry-run before API staging.']
      : ['Review the platform copy and image assets before staging.'],
  };
}

export async function formatContentPackage(packageDir: string, options: RenderOptions = {}): Promise<CommandResult> {
  const pkg = await readContentPackage(packageDir);
  const markdownPath = join(packageDir, pkg.files.markdown);
  const markdown = await readFile(markdownPath, 'utf8');
  const warnings = [...pkg.quality.warnings];
  const writtenFiles: Record<string, string> = {};

  if (pkg.target === 'wechat-article') {
    const rendered = renderMarkdownToWechatHtml(markdown, options);
    warnings.push(...rendered.warnings);
    pkg.files.html = 'article.html';
    await writeFile(join(packageDir, pkg.files.html), rendered.html + '\n', 'utf8');
    writtenFiles.html = join(packageDir, pkg.files.html);
  } else if (pkg.target === 'xiaohongshu') {
    pkg.files.platformCopy = pkg.files.platformCopy || 'xiaohongshu-copy.md';
    await writeFile(join(packageDir, pkg.files.platformCopy), buildXiaohongshuCopy(pkg.title, markdown) + '\n', 'utf8');
    writtenFiles.platformCopy = join(packageDir, pkg.files.platformCopy);
  } else {
    await validateWechatNewspicImages(pkg.files.images ?? [], { packageDir });
    pkg.files.platformCopy = pkg.files.platformCopy || 'wechat-newspic-copy.md';
    await writeFile(join(packageDir, pkg.files.platformCopy), buildNewspicCopy(pkg.title, markdown) + '\n', 'utf8');
    writtenFiles.platformCopy = join(packageDir, pkg.files.platformCopy);
  }

  const qualityMarkdown = pkg.target === 'wechat-newspic' ? buildNewspicCopy(pkg.title, markdown) : markdown;
  pkg.quality = scoreMarkdown(qualityMarkdown, pkg.target, pkg.title, pkg.files.images ?? []);
  await writePackageJson(packageDir, pkg);
  writtenFiles.package = join(packageDir, 'content-package.json');

  return {
    success: true,
    target: pkg.target,
    packageDir,
    files: writtenFiles,
    warnings,
    nextSteps: ['Inspect generated files and run publish-draft --dry-run before staging.'],
  };
}

export function buildWechatDraftPayload(options: WechatDraftPayloadOptions): { articles: Array<Record<string, unknown>> } {
  if (options.target === 'wechat-article') {
    if (!options.html?.trim()) {
      throw new Error('wechat-article requires HTML content.');
    }
    if (!options.coverMediaId?.trim()) {
      throw new Error('wechat-article requires a cover media ID.');
    }
    return {
      articles: [
        {
          article_type: 'news',
          title: options.title,
          author: options.author || '',
          digest: options.summary || '',
          content: options.html,
          thumb_media_id: options.coverMediaId,
          need_open_comment: options.needOpenComment ? 1 : 0,
          only_fans_can_comment: options.onlyFansCanComment ? 1 : 0,
        },
      ],
    };
  }

  if (options.target === 'wechat-newspic') {
    const imageMediaIds = options.imageMediaIds ?? [];
    if (imageMediaIds.length === 0) {
      throw new Error('wechat-newspic requires at least 1 image media ID.');
    }
    if (imageMediaIds.length > 9) {
      throw new Error('wechat-newspic supports at most 9 images.');
    }
    return {
      articles: [
        {
          article_type: 'newspic',
          title: options.title,
          content: options.markdown || '',
          image_info: {
            image_list: imageMediaIds.map(image_media_id => ({ image_media_id })),
          },
        },
      ],
    };
  }

  throw new Error('Xiaohongshu does not support WeChat draft payloads.');
}

export async function analyzeInput(input: string): Promise<AnalysisResult> {
  const content = await readTextInput(input);
  const title = extractFirstHeading(content) || (existsSync(input) ? basename(input, extname(input)) : 'Untitled content');
  const links = extractMarkdownLinks(content);
  const images = extractMarkdownImages(content);
  const headings = extractMarkdownHeadings(content);
  const risks = [
    links.length === 0 ? 'No source links found; fact-sensitive claims need verification notes.' : '',
    images.length === 0 ? 'No image assets found; visual-first platforms need cover/card planning.' : '',
    content.length < 800 ? 'Content is short for a full article; confirm whether this is an outline or short post.' : '',
  ].filter(Boolean);

  return {
    title,
    source: existsSync(input) ? resolve(input) : 'inline-text',
    characters: content.length,
    headings,
    links,
    images,
    suggestedAngles: [
      'Problem-solution angle: identify the audience pain point, then explain the practical method.',
      'Trend interpretation angle: connect the topic to a current platform or industry shift.',
      'Checklist angle: turn the content into repeatable steps with examples and pitfalls.',
    ],
    platformFit: {
      'wechat-article': 'Best for long-form reasoning, cases, and citations.',
      'wechat-newspic': 'Best for short visual explanations with 1-9 image cards.',
      xiaohongshu: 'Best for high-density hooks, image cards, tags, and experience-led copy.',
    },
    risks,
  };
}

function isConfigIncomplete(config: Record<string, unknown>): boolean {
  const wechat = config.wechat;
  if (!isRecord(wechat)) return true;
  const accounts = wechat.accounts;
  if (!isRecord(accounts) || Object.keys(accounts).length === 0) return true;
  return Object.values(accounts).some(account => {
    if (!isRecord(account)) return true;
    return !String(account.appId ?? '').trim() || !String(account.appSecret ?? '').trim();
  });
}

async function loadConfig(): Promise<NewMediaOpsConfig> {
  return requireConfigWithSetup<NewMediaOpsConfig>(PLUGIN_NAME, CONFIG_UI);
}

function resolveWechatAccount(config: NewMediaOpsConfig, name: string): WechatAccountConfig {
  const account = config.wechat?.accounts?.[name];
  if (!account) {
    const available = Object.keys(config.wechat?.accounts ?? {});
    throw new Error(`WeChat account "${name}" is not configured. Available accounts: ${available.join(', ') || '(none)'}`);
  }
  if (!account.appId || !account.appSecret) {
    throw new Error(`WeChat account "${name}" is missing appId or appSecret. Run setup.`);
  }
  return account;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const parsed = await response.json() as T;
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from WeChat API`);
  }
  const maybeError = parsed as WechatApiError;
  if (maybeError.errcode && maybeError.errcode !== 0) {
    throw new Error(`WeChat API error ${maybeError.errcode}: ${maybeError.errmsg || 'unknown error'}`);
  }
  return parsed;
}

async function uploadWechatMaterialImageDirect(accessToken: string, imagePath: string): Promise<string> {
  const resolved = resolve(imagePath);
  const stats = await stat(resolved);
  if (!stats.isFile()) {
    throw new Error(`Image path is not a file: ${imagePath}`);
  }
  const form = new FormData();
  const bytes = await readFile(resolved);
  form.set('media', new Blob([bytes]), basename(resolved));
  const url = new URL('https://api.weixin.qq.com/cgi-bin/material/add_material');
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('type', 'image');
  const uploaded = await requestJson<WechatMediaResponse>(url.toString(), {
    method: 'POST',
    body: form,
  });
  if (!uploaded.media_id) {
    throw new Error('WeChat image upload did not return media_id.');
  }
  return uploaded.media_id;
}

export function buildRemoteSshArgs(account: WechatAccountConfig, localSocksPort: number): string[] {
  if (!account.remotePublishHost?.trim()) {
    throw new Error('remote-api requires remotePublishHost.');
  }

  const connectTimeout = String(account.remotePublishConnectTimeout || 10);
  const args = [
    '-N',
    '-D',
    `127.0.0.1:${localSocksPort}`,
    '-o',
    'ExitOnForwardFailure=yes',
    '-o',
    `ConnectTimeout=${connectTimeout}`,
  ];

  if (account.remotePublishKnownHostsFile) {
    args.push('-o', `UserKnownHostsFile=${account.remotePublishKnownHostsFile}`);
  }
  if (account.remotePublishStrictHostKeyChecking) {
    args.push('-o', `StrictHostKeyChecking=${account.remotePublishStrictHostKeyChecking}`);
  }
  if (account.remotePublishProxyJump) {
    args.push('-J', account.remotePublishProxyJump);
  }
  if (account.remotePublishIdentityFile) {
    args.push('-i', account.remotePublishIdentityFile);
  }
  if (account.remotePublishPort) {
    args.push('-p', String(account.remotePublishPort));
  }

  const host = account.remotePublishUser
    ? `${account.remotePublishUser}@${account.remotePublishHost}`
    : account.remotePublishHost;
  args.push(host);
  return args;
}

async function findFreeLocalPort(): Promise<number> {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(() => resolvePort(port));
    });
  });
}

function canConnect(port: number): Promise<boolean> {
  return new Promise((resolveConnect) => {
    const socket = connect({ host: '127.0.0.1', port });
    socket.once('connect', () => {
      socket.end();
      resolveConnect(true);
    });
    socket.once('error', () => resolveConnect(false));
    socket.setTimeout(250, () => {
      socket.destroy();
      resolveConnect(false);
    });
  });
}

async function waitForSocksPort(port: number, child: ChildProcess): Promise<void> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 10_000) {
    if (child.exitCode !== null) {
      throw new Error(`SSH SOCKS tunnel exited with code ${child.exitCode}.`);
    }
    if (await canConnect(port)) return;
    await new Promise(resolveTimer => setTimeout(resolveTimer, 150));
  }
  throw new Error('Timed out waiting for SSH SOCKS tunnel.');
}

async function startRemoteSocksTunnel(account: WechatAccountConfig): Promise<{ proxy: string; child: ChildProcess }> {
  const port = await findFreeLocalPort();
  const args = buildRemoteSshArgs(account, port);
  const child = spawn('ssh', args, { stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  child.stderr?.on('data', chunk => {
    stderr += String(chunk);
  });

  try {
    await waitForSocksPort(port, child);
  } catch (err) {
    child.kill('SIGTERM');
    const detail = stderr.trim() ? ` ${stderr.trim()}` : '';
    throw new Error(`${(err as Error).message}${detail}`);
  }

  return { proxy: `127.0.0.1:${port}`, child };
}

function curlHeaders(headers: HeadersInit | undefined): string[] {
  if (!headers) return [];
  if (headers instanceof Headers) {
    return [...headers.entries()].flatMap(([key, value]) => ['--header', `${key}: ${value}`]);
  }
  if (Array.isArray(headers)) {
    return headers.flatMap(([key, value]) => ['--header', `${key}: ${value}`]);
  }
  return Object.entries(headers).flatMap(([key, value]) => ['--header', `${key}: ${value}`]);
}

function requestJsonViaCurl<T>(url: string, socksProxy: string, init?: RequestInit): T {
  const method = init?.method || 'GET';
  const body = typeof init?.body === 'string' ? init.body : undefined;
  const args = [
    '--silent',
    '--show-error',
    '--socks5-hostname',
    socksProxy,
    '--request',
    method,
    ...curlHeaders(init?.headers),
  ];
  if (body !== undefined) {
    args.push('--data-binary', '@-');
  }
  args.push(url);

  const result = spawnSync('curl', args, {
    input: body,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`curl request failed: ${result.stderr || result.stdout}`);
  }

  const parsed = JSON.parse(result.stdout) as T;
  const maybeError = parsed as WechatApiError;
  if (maybeError.errcode && maybeError.errcode !== 0) {
    throw new Error(`WeChat API error ${maybeError.errcode}: ${maybeError.errmsg || 'unknown error'}`);
  }
  return parsed;
}

function uploadWechatMaterialImageViaCurl(accessToken: string, imagePath: string, socksProxy: string): string {
  const resolved = resolve(imagePath);
  const url = new URL('https://api.weixin.qq.com/cgi-bin/material/add_material');
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('type', 'image');
  const result = spawnSync('curl', [
    '--silent',
    '--show-error',
    '--socks5-hostname',
    socksProxy,
    '--form',
    `media=@${resolved}`,
    url.toString(),
  ], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`curl upload failed: ${result.stderr || result.stdout}`);
  }
  const uploaded = JSON.parse(result.stdout) as WechatMediaResponse;
  if (uploaded.errcode && uploaded.errcode !== 0) {
    throw new Error(`WeChat API error ${uploaded.errcode}: ${uploaded.errmsg || 'unknown error'}`);
  }
  if (!uploaded.media_id) {
    throw new Error('WeChat image upload did not return media_id.');
  }
  return uploaded.media_id;
}

async function createWechatTransport(account: WechatAccountConfig): Promise<WechatTransport> {
  if ((account.publishMethod || 'api') !== 'remote-api') {
    return {
      requestJson,
      uploadMaterialImage: uploadWechatMaterialImageDirect,
      close: async () => {},
    };
  }

  const tunnel = await startRemoteSocksTunnel(account);
  return {
    requestJson: async <T>(url: string, init?: RequestInit) => requestJsonViaCurl<T>(url, tunnel.proxy, init),
    uploadMaterialImage: async (accessToken: string, imagePath: string) => uploadWechatMaterialImageViaCurl(accessToken, imagePath, tunnel.proxy),
    close: async () => {
      tunnel.child.kill('SIGTERM');
    },
  };
}

async function withWechatTransport<T>(account: WechatAccountConfig, fn: (transport: WechatTransport) => Promise<T>): Promise<T> {
  const transport = await createWechatTransport(account);
  try {
    return await fn(transport);
  } finally {
    await transport.close();
  }
}

async function getWechatAccessToken(account: WechatAccountConfig, transport: WechatTransport): Promise<string> {
  const url = new URL('https://api.weixin.qq.com/cgi-bin/token');
  url.searchParams.set('grant_type', 'client_credential');
  url.searchParams.set('appid', account.appId);
  url.searchParams.set('secret', account.appSecret);
  const token = await transport.requestJson<WechatTokenResponse>(url.toString());
  if (!token.access_token) {
    throw new Error('WeChat API did not return access_token.');
  }
  return token.access_token;
}

async function addWechatDraft(accessToken: string, payload: { articles: Array<Record<string, unknown>> }, transport: WechatTransport): Promise<string> {
  const url = new URL('https://api.weixin.qq.com/cgi-bin/draft/add');
  url.searchParams.set('access_token', accessToken);
  const result = await transport.requestJson<WechatDraftResponse>(url.toString(), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!result.media_id) {
    throw new Error('WeChat draft/add did not return media_id.');
  }
  return result.media_id;
}

function resolvePackageFile(packageDir: string, maybeRelative?: string): string | undefined {
  if (!maybeRelative) return undefined;
  return resolve(packageDir, maybeRelative);
}

async function buildPayloadFromPackage(
  packageDir: string,
  pkg: ContentPackage,
  account: WechatAccountConfig,
  options: PublishDraftOptions,
): Promise<{ payload: { articles: Array<Record<string, unknown>> }; warnings: string[] }> {
  const warnings = [...pkg.quality.warnings];
  if (pkg.target === 'wechat-article') {
    let html = '';
    if (pkg.files.html) {
      html = await readFile(join(packageDir, pkg.files.html), 'utf8');
    } else {
      const markdown = await readFile(join(packageDir, pkg.files.markdown), 'utf8');
      const rendered = renderMarkdownToWechatHtml(markdown, { theme: account.defaultTheme || 'default', citeLinks: true });
      html = rendered.html;
      warnings.push('Package had no HTML file; rendered Markdown in memory for this draft payload.');
    }
    const coverMediaId = options.coverMediaId
      || (options.dryRun && pkg.files.cover ? '__dry_run_cover_media_id__' : undefined);
    if (!options.coverMediaId && coverMediaId) {
      warnings.push('Dry run used a placeholder cover media ID for the local cover asset; real staging uploads the image first.');
    }
    return {
      payload: buildWechatDraftPayload({
        target: pkg.target,
        title: pkg.title,
        html,
        coverMediaId,
        author: pkg.author || account.author,
        summary: pkg.summary,
        needOpenComment: toBoolean(account.needOpenComment),
        onlyFansCanComment: toBoolean(account.onlyFansCanComment),
      }),
      warnings,
    };
  }

  if (pkg.target === 'wechat-newspic') {
    await validateWechatNewspicImages(pkg.files.images ?? [], { packageDir });
    const contentPath = pkg.files.platformCopy
      ? join(packageDir, pkg.files.platformCopy)
      : join(packageDir, pkg.files.markdown);
    const markdown = await readFile(contentPath, 'utf8');
    const imageMediaIds = options.imageMediaIds?.length
      ? options.imageMediaIds
      : (options.dryRun && pkg.files.images?.length
          ? pkg.files.images.slice(0, 9).map((_, index) => `__dry_run_image_media_id_${index + 1}__`)
          : options.imageMediaIds);
    if (!options.imageMediaIds?.length && imageMediaIds?.length) {
      warnings.push('Dry run used placeholder image media IDs for local image assets; real staging uploads each image first.');
    }
    return {
      payload: buildWechatDraftPayload({
        target: pkg.target,
        title: pkg.title,
        markdown: stripNewspicCopyTitle(markdown, pkg.title),
        imageMediaIds,
      }),
      warnings,
    };
  }

  throw new Error('Xiaohongshu packages are draft assets only; use browser/manual staging.');
}

export async function publishDraft(options: PublishDraftOptions): Promise<CommandResult> {
  const packageDir = resolve(options.packageDir);
  const pkg = await readContentPackage(packageDir);
  const minimumScore = options.minimumScore ?? DEFAULT_MINIMUM_SCORE;
  if (pkg.quality.score < minimumScore) {
    throw new Error(`Quality score ${pkg.quality.score} is below the staging gate ${minimumScore}.`);
  }

  const config = await loadConfig();
  const account = resolveWechatAccount(config, options.accountName);
  if ((account.publishMethod || 'api') === 'manual') {
    throw new Error(`WeChat account "${options.accountName}" is configured for manual output only.`);
  }

  const finalOptions = { ...options };
  if (options.dryRun) {
    const { payload, warnings } = await buildPayloadFromPackage(packageDir, pkg, account, finalOptions);
    return {
      success: true,
      target: pkg.target,
      packageDir,
      warnings,
      nextSteps: ['Dry run only. Re-run without --dry-run to stage the WeChat draft after reviewing the payload constraints.'],
      remote: {
        endpoint: 'draft/add',
        dryRun: true,
        articleType: String(payload.articles[0]?.article_type || ''),
      },
    };
  }

  return withWechatTransport(account, async (transport) => {
    const accessToken = await getWechatAccessToken(account, transport);
    if (!finalOptions.coverMediaId && pkg.target === 'wechat-article' && pkg.files.cover) {
      finalOptions.coverMediaId = await transport.uploadMaterialImage(accessToken, resolvePackageFile(packageDir, pkg.files.cover)!);
    }
    if ((!finalOptions.imageMediaIds || finalOptions.imageMediaIds.length === 0) && pkg.target === 'wechat-newspic' && pkg.files.images?.length) {
      finalOptions.imageMediaIds = [];
      for (const image of pkg.files.images.slice(0, 9)) {
        finalOptions.imageMediaIds.push(await transport.uploadMaterialImage(accessToken, resolvePackageFile(packageDir, image)!));
      }
    }

    const built = await buildPayloadFromPackage(packageDir, pkg, account, finalOptions);
    const mediaId = await addWechatDraft(accessToken, built.payload, transport);
    return {
      success: true,
      target: pkg.target,
      packageDir,
      warnings: built.warnings,
      nextSteps: ['Open WeChat Official Account draft box and review before final publishing.'],
      remote: { mediaId, endpoint: 'draft/add', articleType: String(built.payload.articles[0]?.article_type || '') },
    };
  });
}

async function preflight(format: string): Promise<void> {
  const cfgPath = configPath(PLUGIN_NAME);
  const configured = existsSync(cfgPath);
  const result: CommandResult = {
    success: configured,
    warnings: configured ? [] : [`No config found at ${cfgPath}. Run setup before API staging.`],
    nextSteps: configured
      ? ['Run draft-package, format, and publish-draft --dry-run for a target package.']
      : ['Run setup to configure accounts, or use draft-package/format without API staging.'],
  };
  writeResult(result, format);
}

async function inspectPackage(packageDir: string, format: string): Promise<void> {
  const pkg = await readContentPackage(resolve(packageDir));
  writeResult({
    success: true,
    target: pkg.target,
    packageDir: resolve(packageDir),
    files: Object.fromEntries(
      Object.entries(pkg.files)
        .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
        .map(([key, value]) => [key, join(resolve(packageDir), value)]),
    ),
    warnings: pkg.quality.warnings,
    nextSteps: pkg.target === 'wechat-article'
      ? ['Run format if article.html is missing.', 'Run publish-draft --dry-run before staging.']
      : ['Review platform copy and images before browser/manual staging.'],
  }, format);
}

async function main(): Promise<void> {
  const program = new Command();
  program
    .name('new-media-ops')
    .description('Draft-first new-media operations for WeChat and Xiaohongshu')
    .version('0.1.3');

  program
    .command('setup')
    .description('Open the browser configuration form')
    .action(async () => {
      await launchConfigUI(PLUGIN_NAME, CONFIG_UI);
    });

  program
    .command('preflight')
    .description('Check local configuration readiness')
    .option('--format <format>', 'Output format: text|json', 'text')
    .action(async (options: { format: string }) => {
      await preflight(options.format);
    });

  program
    .command('analyze')
    .description('Analyze an article, Markdown file, URL notes, or pasted text')
    .argument('<input>', 'Input file path or inline text')
    .option('--format <format>', 'Output format: markdown|json', 'markdown')
    .action(async (input: string, options: { format: string }) => {
      writeResult(await analyzeInput(input), options.format);
    });

  program
    .command('draft-package')
    .description('Create a stable v1 content package')
    .argument('<input>', 'Markdown file path or inline text')
    .requiredOption('--target <target>', `Target platform: ${PLATFORM_TARGETS.join('|')}`)
    .option('--out-dir <dir>', 'Output directory', 'new-media-ops')
    .option('--slug <slug>', 'Package slug')
    .option('--title <title>', 'Override package title')
    .option('--summary <summary>', 'Summary/digest')
    .option('--author <author>', 'Author name')
    .option('--cover <path>', 'Cover image path')
    .option('--image <path...>', 'Image paths for image-text or Xiaohongshu packages')
    .option('--format <format>', 'Output format: text|json', 'text')
    .action(async (input: string, options: {
      target: string;
      outDir: string;
      slug?: string;
      title?: string;
      summary?: string;
      author?: string;
      cover?: string;
      image?: string[];
      format: string;
    }) => {
      writeResult(await createDraftPackage({
        input,
        target: options.target,
        outDir: options.outDir,
        slug: options.slug,
        title: options.title,
        summary: options.summary,
        author: options.author,
        cover: options.cover,
        images: options.image,
      }), options.format);
    });

  program
    .command('format')
    .description('Generate platform-specific formatted files for a content package')
    .argument('<package-dir>', 'Content package directory')
    .option('--theme <theme>', 'WeChat theme', 'default')
    .option('--color <color>', 'Primary color')
    .option('--cite', 'Move external Markdown links to bottom citations', false)
    .option('--format <format>', 'Output format: text|json', 'text')
    .action(async (packageDir: string, options: { theme: string; color?: string; cite: boolean; format: string }) => {
      writeResult(await formatContentPackage(resolve(packageDir), {
        theme: options.theme,
        color: options.color,
        citeLinks: options.cite,
      }), options.format);
    });

  program
    .command('inspect-package')
    .description('Inspect a content package')
    .argument('<package-dir>', 'Content package directory')
    .option('--format <format>', 'Output format: text|json', 'text')
    .action(async (packageDir: string, options: { format: string }) => {
      await inspectPackage(packageDir, options.format);
    });

  program
    .command('publish-draft')
    .description('Stage a WeChat draft or dry-run the draft payload. Never final-publishes.')
    .argument('<package-dir>', 'Content package directory')
    .requiredOption('--account <name>', 'WeChat account config name')
    .option('--cover-media-id <id>', 'Existing WeChat cover thumb media ID')
    .option('--image-media-id <id...>', 'Existing WeChat image media IDs for newspic')
    .option('--minimum-score <score>', 'Minimum package quality score', String(DEFAULT_MINIMUM_SCORE))
    .option('--dry-run', 'Validate and build payload without calling WeChat', false)
    .option('--format <format>', 'Output format: text|json', 'text')
    .action(async (packageDir: string, options: {
      account: string;
      coverMediaId?: string;
      imageMediaId?: string[];
      minimumScore: string;
      dryRun: boolean;
      format: string;
    }) => {
      writeResult(await publishDraft({
        packageDir,
        accountName: options.account,
        coverMediaId: options.coverMediaId,
        imageMediaIds: options.imageMediaId,
        minimumScore: Number.parseInt(options.minimumScore, 10),
        dryRun: options.dryRun,
      }), options.format);
    });

  await program.parseAsync(process.argv);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
const modulePath = resolve(fileURLToPath(import.meta.url));
if (invokedPath === modulePath || pathToFileURL(invokedPath).href === import.meta.url) {
  main().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`ERROR: ${message}`);
    process.exit(1);
  });
}
