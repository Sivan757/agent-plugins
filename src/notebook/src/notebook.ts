#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import {
  appendFile,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { homedir } from 'node:os';
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
} from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';

export type NotebookScope = 'global' | 'project' | 'both';
export type SingleScope = 'global' | 'project';
export type MemoryType =
  | 'user'
  | 'style'
  | 'rule'
  | 'project'
  | 'mistake'
  | 'reference';
export type Confidence = 'high' | 'medium' | 'low';
export type Sensitivity = 'public' | 'internal' | 'redacted';

export interface NotebookRoot {
  root: string;
  bootstrap: string;
  index: string;
  topics: string;
  pending: string;
  ledger: string;
  sources: string;
  cache: string;
}

export interface NotebookPaths {
  global: NotebookRoot;
  project: NotebookRoot;
  projectRoot: string;
}

export interface ResolvePathOptions {
  globalRoot?: string;
  projectRoot?: string;
}

export interface InitOptions extends ResolvePathOptions {
  scope?: NotebookScope;
}

export interface AddMemoryOptions extends ResolvePathOptions {
  scope: SingleScope;
  type: MemoryType;
  title: string;
  content: string;
  confidence?: Confidence;
  sensitivity?: Sensitivity;
  source?: string;
}

export interface SearchOptions extends ResolvePathOptions {
  scope?: NotebookScope;
  query: string;
  type?: MemoryType;
  confidence?: Confidence;
  before?: string;
  includePending?: boolean;
  limit?: number;
}

export interface DeleteOptions extends SearchOptions {
  yes?: boolean;
  file?: string;
}

export interface ContextOptions extends ResolvePathOptions {
  scope?: NotebookScope;
  query?: string;
  bootstrapOnly?: boolean;
  includePending?: boolean;
  budget?: number;
  format?: 'text' | 'hook' | 'json';
  maxTopics?: number;
}

export interface PromoteOptions extends ResolvePathOptions {
  scope: SingleScope;
  query: string;
  yes?: boolean;
}

export interface AuditOptions extends ResolvePathOptions {
  scope?: NotebookScope;
}

export interface InsightsOptions extends ResolvePathOptions {
  scope?: NotebookScope;
  since?: string;
  platform?: 'claude' | 'codex' | 'auto';
}

export interface ResummarizeOptions extends ResolvePathOptions {
  scope: SingleScope;
  query: string;
}

export interface MemoryMatch {
  scope: SingleScope;
  path: string;
  title: string;
  type?: MemoryType;
  confidence?: Confidence;
  description?: string;
  excerpt: string;
  mtimeMs: number;
}

interface Frontmatter {
  title?: string;
  type?: MemoryType;
  scope?: SingleScope;
  confidence?: Confidence;
  sensitivity?: Sensitivity;
  created_at?: string;
  last_verified?: string;
  validity?: string;
  description?: string;
}

const DEFAULT_CONTEXT_BUDGET = 12_000;
const DEFAULT_TOPIC_BYTES = 4_096;
const DEFAULT_TOPIC_LIMIT = 5;
const INDEX_LINE_LIMIT = 200;
const INDEX_BYTE_LIMIT = 25_000;
const MAX_ENTRY_CHARS = 2_000;
const REQUIRED_SECTIONS = ['Why', 'Where', 'What', 'Not'] as const;
const MISTAKE_SECTIONS = [
  'Problem',
  'Root Cause',
  'Fix',
  'Verification',
] as const;

const SECRET_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'private_key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/i },
  { name: 'token_assignment', pattern: /\b(api[_-]?key|token|secret|password)\b\s*[:=]\s*['"]?[A-Za-z0-9_\-./+=]{16,}/i },
  { name: 'cookie', pattern: /\bcookie\b\s*[:=]/i },
];

const MEMORY_TYPES: MemoryType[] = ['user', 'style', 'rule', 'project', 'mistake', 'reference'];
const CONFIDENCE_VALUES: Confidence[] = ['high', 'medium', 'low'];
const SENSITIVITY_VALUES: Sensitivity[] = ['public', 'internal', 'redacted'];
const CONTEXT_FORMATS: Array<NonNullable<ContextOptions['format']>> = ['text', 'hook', 'json'];
const INSIGHT_PLATFORMS: Array<NonNullable<InsightsOptions['platform']>> = ['claude', 'codex', 'auto'];

export function defaultGlobalRoot(): string {
  return join(homedir(), '.cache', 'agent-plugins', 'notebook');
}

export function resolveProjectRoot(explicitProjectRoot?: string): string {
  if (explicitProjectRoot) return resolve(explicitProjectRoot);

  try {
    const out = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (out) return out;
  } catch {
    // Fall through to cwd for non-git directories.
  }
  return process.cwd();
}

export function resolveNotebookPaths(options: ResolvePathOptions = {}): NotebookPaths {
  const projectRoot = resolveProjectRoot(options.projectRoot);
  const globalRoot = resolve(options.globalRoot ?? defaultGlobalRoot());
  const projectNotebookRoot = join(projectRoot, '.notebook');

  return {
    projectRoot,
    global: rootLayout(globalRoot),
    project: rootLayout(projectNotebookRoot),
  };
}

function rootLayout(root: string): NotebookRoot {
  return {
    root,
    bootstrap: join(root, 'bootstrap.md'),
    index: join(root, 'index.md'),
    topics: join(root, 'topics'),
    pending: join(root, 'pending.md'),
    ledger: join(root, 'ledger.md'),
    sources: join(root, 'sources.md'),
    cache: join(root, 'cache'),
  };
}

function singleScopes(scope: NotebookScope = 'both'): SingleScope[] {
  if (scope === 'both') return ['global', 'project'];
  return [scope];
}

function rootFor(paths: NotebookPaths, scope: SingleScope): NotebookRoot {
  return scope === 'global' ? paths.global : paths.project;
}

export async function initNotebook(options: InitOptions = {}): Promise<void> {
  const scope = options.scope ?? 'both';
  const paths = resolveNotebookPaths(options);
  await Promise.all(singleScopes(scope).map(s => ensureRoot(rootFor(paths, s))));
}

async function ensureRoot(root: NotebookRoot): Promise<void> {
  await mkdir(root.topics, { recursive: true });
  await mkdir(join(root.cache, 'session-meta'), { recursive: true });
  await mkdir(join(root.cache, 'facets'), { recursive: true });
  await mkdir(join(root.cache, 'reports'), { recursive: true });
  await ensureFile(root.bootstrap, '# Notebook Bootstrap\n\n');
  await ensureFile(root.index, '# Notebook Index\n\n');
  await ensureFile(root.pending, '# Notebook Pending\n\n');
  await ensureFile(root.ledger, '# Notebook Ledger\n\n');
  await ensureFile(root.sources, '# Notebook Sources\n\n');
}

async function ensureFile(path: string, content: string): Promise<void> {
  if (existsSync(path)) return;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, { encoding: 'utf8', mode: 0o600 });
}

export async function addMemory(options: AddMemoryOptions): Promise<{
  path: string;
  created: boolean;
  title: string;
}> {
  validateSingleScope(options.scope);
  const paths = resolveNotebookPaths(options);
  const root = rootFor(paths, options.scope);
  await ensureRoot(root);

  const title = options.title.trim();
  if (!title) throw new Error('title is required');
  if (!options.content.trim()) throw new Error('content is required');
  if (options.content.length > MAX_ENTRY_CHARS) {
    throw new Error(`content is too long (${options.content.length} chars; limit ${MAX_ENTRY_CHARS})`);
  }
  const type = parseMemoryType(options.type);
  const confidence = parseConfidence(options.confidence ?? 'medium');
  const sensitivity = parseSensitivity(options.sensitivity ?? 'internal');

  const fileName = `${type}-${slugify(title)}.md`;
  const topicPath = join(root.topics, fileName);
  const created = !existsSync(topicPath);
  const now = localIsoString(new Date());
  const description = firstSentence(options.content);
  const frontmatter: Frontmatter = {
    title,
    type,
    scope: options.scope,
    confidence,
    sensitivity,
    created_at: now,
    last_verified: now.slice(0, 10),
    validity: 'until-changed',
    description,
  };

  const body = buildTopicBody(type, options.content, options.scope);
  await writeFile(topicPath, serializeTopic(frontmatter, body), {
    encoding: 'utf8',
    mode: 0o600,
  });

  await updateIndex(root, topicPath, frontmatter);
  await appendLedger(root, {
    action: created ? 'add' : 'update',
    scope: options.scope,
    type,
    title,
    path: topicPath,
    source: options.source,
  });

  return { path: topicPath, created, title };
}

function buildTopicBody(type: MemoryType, content: string, scope: SingleScope): string {
  const trimmed = content.trim();
  const base = [
    '## Why',
    trimmed,
    '',
    '## Where',
    scope === 'global' ? 'Global notebook memory.' : 'Project notebook memory.',
    '',
    '## What',
    trimmed,
    '',
    '## Not',
    'Do not apply beyond the scope and limits described here without checking current context.',
    '',
  ];

  if (type === 'mistake') {
    base.push(
      '## Problem',
      trimmed,
      '',
      '## Root Cause',
      'Root cause must be verified before relying on this memory.',
      '',
      '## Fix',
      'Use the verified fix or re-check current project state before acting.',
      '',
      '## Verification',
      'Re-run the relevant command or inspect current evidence before asserting this still applies.',
      '',
    );
  }

  return base.join('\n');
}

function serializeTopic(frontmatter: Frontmatter, body: string): string {
  const lines = Object.entries(frontmatter)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}: ${String(value).replace(/\n/g, ' ')}`);
  return `---\n${lines.join('\n')}\n---\n\n${body.trim()}\n`;
}

function parseTopic(content: string): { frontmatter: Frontmatter; body: string } {
  if (!content.startsWith('---\n')) return { frontmatter: {}, body: content };
  const end = content.indexOf('\n---', 4);
  if (end === -1) return { frontmatter: {}, body: content };
  const raw = content.slice(4, end).trim();
  const frontmatter: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return {
    frontmatter: frontmatter as Frontmatter,
    body: content.slice(end + 4).trim(),
  };
}

async function updateIndex(root: NotebookRoot, topicPath: string, fm: Frontmatter): Promise<void> {
  await ensureFile(root.index, '# Notebook Index\n\n');
  const rel = relative(root.root, topicPath);
  const line = `- [${fm.title ?? basename(topicPath)}](${rel}) - ${fm.description ?? ''}; ${fm.type ?? 'memory'}; ${fm.confidence ?? 'medium'}; updated ${localIsoString(new Date()).slice(0, 10)}.`;
  const current = await readFile(root.index, 'utf8');
  const lines = current.split('\n').filter(existing => !existing.includes(`](${rel})`));
  if (!lines.some(existing => existing.trim() === '# Notebook Index')) {
    lines.unshift('# Notebook Index', '');
  }
  lines.push(line);
  await writeFile(root.index, normalizeTrailingNewline(lines.join('\n')), 'utf8');
}

async function removeIndexEntries(root: NotebookRoot, paths: string[]): Promise<void> {
  if (!existsSync(root.index)) return;
  const rels = new Set(paths.map(p => relative(root.root, p)));
  const current = await readFile(root.index, 'utf8');
  const lines = current
    .split('\n')
    .filter(line => ![...rels].some(rel => line.includes(`](${rel})`)));
  await writeFile(root.index, normalizeTrailingNewline(lines.join('\n')), 'utf8');
}

async function appendLedger(
  root: NotebookRoot,
  event: {
    action: string;
    scope: SingleScope;
    type?: string;
    title: string;
    path: string;
    source?: string;
  },
): Promise<void> {
  await ensureFile(root.ledger, '# Notebook Ledger\n\n');
  const rel = relative(root.root, event.path);
  const source = event.source ? ` | source=${sanitizeInline(event.source)}` : '';
  await appendFile(
    root.ledger,
    `- ${localIsoString(new Date())} | ${event.action} | ${event.scope}/${event.type ?? 'memory'} | ${sanitizeInline(event.title)} | ${rel}${source}\n`,
    'utf8',
  );
}

export async function searchNotebook(options: SearchOptions): Promise<{ matches: MemoryMatch[] }> {
  const paths = resolveNotebookPaths(options);
  const scopes = singleScopes(options.scope ?? 'both');
  const all: MemoryMatch[] = [];
  for (const scope of scopes) {
    const root = rootFor(paths, scope);
    all.push(...(await searchRoot(root, scope, options)));
  }
  all.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return { matches: all.slice(0, options.limit ?? 50) };
}

async function searchRoot(
  root: NotebookRoot,
  scope: SingleScope,
  options: SearchOptions,
): Promise<MemoryMatch[]> {
  if (!existsSync(root.topics)) return [];
  const entries = await readdir(root.topics, { withFileTypes: true });
  const query = options.query.trim().toLowerCase();
  const matches: MemoryMatch[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const path = join(root.topics, entry.name);
    const content = await readFile(path, 'utf8');
    const parsed = parseTopic(content);
    const fm = parsed.frontmatter;
    if (options.type && fm.type !== options.type) continue;
    if (options.confidence && fm.confidence !== options.confidence) continue;
    const st = await stat(path);
    if (options.before && st.mtime >= new Date(options.before)) continue;
    const haystack = `${entry.name}\n${fm.title ?? ''}\n${fm.description ?? ''}\n${content}`.toLowerCase();
    if (query && !haystack.includes(query)) continue;
    matches.push({
      scope,
      path,
      title: fm.title ?? entry.name.replace(/\.md$/, ''),
      type: fm.type,
      confidence: fm.confidence,
      description: fm.description,
      excerpt: excerptFor(content, query),
      mtimeMs: st.mtimeMs,
    });
  }

  return matches;
}

export async function deleteMemories(options: DeleteOptions): Promise<{
  matches: MemoryMatch[];
  deleted: string[];
}> {
  const paths = resolveNotebookPaths(options);
  const matches = options.file
    ? await matchExplicitFile(options.file, paths, options)
    : (await searchNotebook(options)).matches;

  if (!options.yes) return { matches, deleted: [] };

  const deleted: string[] = [];
  for (const match of matches) {
    await unlink(match.path).catch(() => undefined);
    deleted.push(match.path);
  }

  for (const scope of singleScopes(options.scope ?? 'both')) {
    const root = rootFor(paths, scope);
    await removeIndexEntries(root, deleted);
    if (deleted.length > 0) {
      await appendLedger(root, {
        action: 'delete',
        scope,
        title: options.query || options.file || 'delete',
        path: root.root,
      });
    }
  }

  return { matches, deleted };
}

async function matchExplicitFile(
  file: string,
  paths: NotebookPaths,
  options: DeleteOptions,
): Promise<MemoryMatch[]> {
  const resolved = isAbsolute(file) ? file : resolve(file);
  if (!existsSync(resolved)) return [];
  const content = await readFile(resolved, 'utf8');
  const parsed = parseTopic(content);
  const st = await stat(resolved);
  const scope: SingleScope = resolved.startsWith(paths.project.root) ? 'project' : 'global';
  return [{
    scope,
    path: resolved,
    title: parsed.frontmatter.title ?? basename(resolved),
    type: parsed.frontmatter.type,
    confidence: parsed.frontmatter.confidence,
    description: parsed.frontmatter.description,
    excerpt: excerptFor(content, options.query),
    mtimeMs: st.mtimeMs,
  }];
}

export async function contextNotebook(options: ContextOptions = {}): Promise<{
  text: string;
  warnings: string[];
}> {
  const paths = resolveNotebookPaths(options);
  const scopes = singleScopes(options.scope ?? 'both');
  const budget = options.budget ?? DEFAULT_CONTEXT_BUDGET;
  const warnings: string[] = [];
  const parts: string[] = [];

  for (const scope of scopes) {
    const root = rootFor(paths, scope);
    if (!existsSync(root.bootstrap)) continue;
    const bootstrap = await readFile(root.bootstrap, 'utf8');
    if (bootstrap.trim()) {
      parts.push(`## ${capitalize(scope)} Bootstrap\n\n${bootstrap.trim()}`);
    }
  }

  if (!options.bootstrapOnly && options.query?.trim()) {
    const result = await searchNotebook({
      ...options,
      scope: options.scope ?? 'both',
      query: options.query,
      limit: options.maxTopics ?? DEFAULT_TOPIC_LIMIT,
    });
    for (const match of result.matches.slice(0, options.maxTopics ?? DEFAULT_TOPIC_LIMIT)) {
      const full = await readFile(match.path, 'utf8');
      const truncated = full.length > DEFAULT_TOPIC_BYTES;
      const content = truncated ? full.slice(0, DEFAULT_TOPIC_BYTES) : full;
      if (truncated) {
        warnings.push(`${match.path} truncated at ${DEFAULT_TOPIC_BYTES} bytes`);
      }
      const freshness = freshnessWarning(match.mtimeMs);
      parts.push(`## ${capitalize(match.scope)} Topic: ${match.title}\n\n${freshness}${content.trim()}`);
    }
  }

  let text = parts.join('\n\n---\n\n');
  if (text.length > budget) {
    warnings.push(`context truncated at ${budget} characters`);
    text = text.slice(0, budget) + '\n\n> WARNING: notebook context was truncated by budget.';
  }

  if (options.format === 'hook' && text.trim()) {
    text = `<notebook_context>\n${text}\n</notebook_context>`;
  }

  if (warnings.length > 0) {
    text += `\n\n${warnings.map(w => `> WARNING: ${w}`).join('\n')}`;
  }

  return { text: text.trim(), warnings };
}

export async function promoteMemory(options: PromoteOptions): Promise<{
  promoted: boolean;
  candidate: string;
  path?: string;
}> {
  const paths = resolveNotebookPaths(options);
  const root = rootFor(paths, options.scope);
  await ensureRoot(root);
  const matches = (await searchNotebook({
    ...options,
    scope: options.scope,
    query: options.query,
    limit: 1,
  })).matches;
  const first = matches[0];
  if (!first) return { promoted: false, candidate: '' };
  const candidate = `- ${first.title}: ${first.description || first.excerpt} Not: verify if stale before acting.`;
  if (!options.yes) return { promoted: false, candidate, path: first.path };

  const current = existsSync(root.bootstrap) ? await readFile(root.bootstrap, 'utf8') : '# Notebook Bootstrap\n\n';
  if (!current.includes(candidate)) {
    await writeFile(root.bootstrap, normalizeTrailingNewline(`${current.trim()}\n\n${candidate}`), 'utf8');
  }
  await appendLedger(root, {
    action: 'promote',
    scope: options.scope,
    type: first.type,
    title: first.title,
    path: first.path,
  });
  return { promoted: true, candidate, path: first.path };
}

export async function auditNotebook(options: AuditOptions = {}): Promise<{
  issues: Array<{ scope: SingleScope; file: string; code: string; message: string }>;
}> {
  const paths = resolveNotebookPaths(options);
  const issues: Array<{ scope: SingleScope; file: string; code: string; message: string }> = [];

  for (const scope of singleScopes(options.scope ?? 'both')) {
    const root = rootFor(paths, scope);
    if (!existsSync(root.root)) continue;

    if (existsSync(root.bootstrap)) {
      const content = await readFile(root.bootstrap, 'utf8');
      if (content.length > 16_384) {
        issues.push({ scope, file: root.bootstrap, code: 'bootstrap_too_large', message: 'bootstrap.md exceeds 16KB target' });
      }
      collectSecretIssues(scope, root.bootstrap, content, issues);
    }

    if (existsSync(root.index)) {
      const content = await readFile(root.index, 'utf8');
      const lineCount = content.trim() ? content.trim().split('\n').length : 0;
      if (lineCount > INDEX_LINE_LIMIT || content.length > INDEX_BYTE_LIMIT) {
        issues.push({ scope, file: root.index, code: 'index_too_long', message: 'index.md exceeds 200 lines or 25KB target' });
      }
    }

    if (!existsSync(root.topics)) continue;
    const entries = await readdir(root.topics, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
      const path = join(root.topics, entry.name);
      const content = await readFile(path, 'utf8');
      const parsed = parseTopic(content);
      for (const key of ['title', 'type', 'description'] as const) {
        if (!parsed.frontmatter[key]) {
          issues.push({ scope, file: path, code: 'topic_missing_frontmatter', message: `missing frontmatter field: ${key}` });
        }
      }
      for (const section of REQUIRED_SECTIONS) {
        if (!hasSection(parsed.body, section)) {
          issues.push({ scope, file: path, code: 'topic_missing_section', message: `missing section: ${section}` });
        }
      }
      if (parsed.frontmatter.type === 'mistake') {
        for (const section of MISTAKE_SECTIONS) {
          if (!hasSection(parsed.body, section)) {
            issues.push({ scope, file: path, code: 'mistake_missing_section', message: `missing mistake section: ${section}` });
          }
        }
      }
      collectSecretIssues(scope, path, content, issues);
    }
  }

  return { issues };
}

function collectSecretIssues(
  scope: SingleScope,
  file: string,
  content: string,
  issues: Array<{ scope: SingleScope; file: string; code: string; message: string }>,
): void {
  for (const { name, pattern } of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      issues.push({ scope, file, code: 'possible_secret', message: `possible unredacted sensitive value: ${name}` });
    }
  }
}

export async function compactNotebook(options: AuditOptions & { target?: string; yes?: boolean } = {}): Promise<{
  text: string;
}> {
  const audit = await auditNotebook(options);
  const lines = ['# Notebook Compact Suggestions', ''];
  if (audit.issues.length === 0) {
    lines.push('No compact suggestions. Notebook files are within current quality thresholds.');
  } else {
    for (const issue of audit.issues) {
      lines.push(`- ${issue.scope}: ${issue.code}: ${issue.file} - ${issue.message}`);
    }
  }
  if (options.yes) {
    lines.push('', 'Automatic destructive compact is intentionally not implemented; use search/delete/promote with explicit filters.');
  }
  return { text: lines.join('\n') };
}

export async function insightsNotebook(options: InsightsOptions = {}): Promise<{
  reportPath: string;
  memoryCandidates: string[];
  bootstrapCandidates: string[];
  staleCandidates: string[];
  frictionCandidates: string[];
}> {
  const paths = resolveNotebookPaths(options);
  const scope = options.scope === 'both' ? 'project' : (options.scope ?? 'project');
  const root = rootFor(paths, scope);
  await ensureRoot(root);

  const transcriptPaths = await readTranscriptPaths(root.sources);
  const snippets = await collectTranscriptSnippets(transcriptPaths, '');
  const memoryCandidates = unique(snippets.userTexts.filter(text => /remember|记住|记录|always|以后|每次/i.test(text))).slice(0, 10);
  const frictionCandidates = unique(snippets.userTexts.filter(text => /wrong|skipped|failed|不对|错了|失败|漏了|不要/i.test(text))).slice(0, 10);
  const bootstrapCandidates = memoryCandidates.filter(text => /always|以后|每次|必须|must/i.test(text)).slice(0, 5);
  const staleCandidates: string[] = [];

  const report = [
    '# Notebook Insights',
    '',
    `Generated at: ${localIsoString(new Date())}`,
    `Scope: ${scope}`,
    '',
    '## Memory Candidates',
    ...bulletLines(memoryCandidates),
    '',
    '## Bootstrap Candidates',
    ...bulletLines(bootstrapCandidates),
    '',
    '## Friction Candidates',
    ...bulletLines(frictionCandidates),
  ].join('\n');

  const reportPath = join(root.cache, 'reports', `insights-${safeTimestamp()}.md`);
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, report, { encoding: 'utf8', mode: 0o600 });

  return { reportPath, memoryCandidates, bootstrapCandidates, staleCandidates, frictionCandidates };
}

export async function resummarizeNotebook(options: ResummarizeOptions): Promise<{ text: string }> {
  const paths = resolveNotebookPaths(options);
  const root = rootFor(paths, options.scope);
  await ensureRoot(root);
  const transcriptPaths = await readTranscriptPaths(root.sources);
  const snippets = await collectTranscriptSnippets(transcriptPaths, options.query);
  const lines = [
    '# Notebook Resummarize Candidates',
    '',
    `Query: ${options.query}`,
    '',
    ...snippets.matches.slice(0, 20).map(s => `- ${s}`),
  ];
  return { text: lines.join('\n') };
}

async function readTranscriptPaths(sourcesPath: string): Promise<string[]> {
  if (!existsSync(sourcesPath)) return [];
  const content = await readFile(sourcesPath, 'utf8');
  const paths: string[] = [];
  for (const line of content.split('\n')) {
    const match = line.match(/Transcript:\s*(.+)$/i);
    if (match?.[1]) paths.push(match[1].trim());
  }
  return paths.filter(path => existsSync(path));
}

async function collectTranscriptSnippets(paths: string[], query: string): Promise<{
  userTexts: string[];
  matches: string[];
}> {
  const userTexts: string[] = [];
  const matches: string[] = [];
  const q = query.toLowerCase();

  for (const path of paths.slice(0, 50)) {
    const content = await readFile(path, 'utf8').catch(() => '');
    if (!content) continue;
    for (const line of content.split('\n')) {
      if (!line.trim()) continue;
      const text = extractTranscriptText(line);
      if (!text) continue;
      if (line.includes('"type":"user"') || line.includes('"type": "user"')) {
        userTexts.push(text);
      }
      if (!q || text.toLowerCase().includes(q)) {
        matches.push(`${basename(path)}: ${text.slice(0, 240)}`);
      }
    }
  }

  return { userTexts, matches };
}

function extractTranscriptText(line: string): string {
  try {
    const parsed = JSON.parse(line) as {
      message?: { content?: unknown };
      content?: unknown;
      type?: string;
    };
    return extractText(parsed.message?.content ?? parsed.content);
  } catch {
    return line;
  }
}

function extractText(content: unknown): string {
  if (typeof content === 'string') return content.replace(/\s+/g, ' ').trim();
  if (!Array.isArray(content)) return '';
  return content
    .map(block => {
      if (typeof block === 'string') return block;
      if (block && typeof block === 'object' && 'text' in block) {
        return String((block as { text?: unknown }).text ?? '');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function bulletLines(items: string[]): string[] {
  return items.length ? items.map(item => `- ${item}`) : ['- None'];
}

function unique(items: string[]): string[] {
  return [...new Set(items.map(item => item.trim()).filter(Boolean))];
}

function validateSingleScope(scope: NotebookScope): asserts scope is SingleScope {
  if (scope !== 'global' && scope !== 'project') {
    throw new Error('scope must be global or project for this command');
  }
}

function slugify(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return slug || 'memory';
}

function firstSentence(input: string): string {
  const text = input.trim().replace(/\s+/g, ' ');
  const idx = text.search(/[.!?。！？]/);
  return (idx >= 0 ? text.slice(0, idx + 1) : text).slice(0, 200);
}

function excerptFor(content: string, query: string): string {
  const normalized = content.replace(/\s+/g, ' ').trim();
  const q = query.toLowerCase();
  const idx = q ? normalized.toLowerCase().indexOf(q) : -1;
  if (idx === -1) return normalized.slice(0, 240);
  return normalized.slice(Math.max(0, idx - 80), idx + 160);
}

function hasSection(body: string, section: string): boolean {
  return new RegExp(`^##\\s+${escapeRegex(section)}\\s*$`, 'im').test(body);
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function freshnessWarning(mtimeMs: number): string {
  const days = Math.max(0, Math.floor((Date.now() - mtimeMs) / 86_400_000));
  if (days <= 1) return '';
  return `> This memory is ${days} days old. Verify current state before acting on it.\n\n`;
}

function sanitizeInline(input: string): string {
  return input.replace(/\s+/g, ' ').replace(/\|/g, '/').trim();
}

function normalizeTrailingNewline(input: string): string {
  return input.replace(/\s+$/g, '') + '\n';
}

function capitalize(input: string): string {
  return input.slice(0, 1).toUpperCase() + input.slice(1);
}

function localIsoString(date: Date): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const pad = (n: number) => String(n).padStart(2, '0');
  const offset = `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${offset}`;
}

function safeTimestamp(): string {
  return localIsoString(new Date()).replace(/[^0-9A-Za-z]/g, '-');
}

function parseScope(value: string | undefined): NotebookScope {
  if (value === 'global' || value === 'project' || value === 'both') return value;
  throw new Error('--scope must be global, project, or both');
}

function parseSingleScope(value: string | undefined): SingleScope {
  if (value === 'global' || value === 'project') return value;
  throw new Error('--scope must be global or project');
}

function parseMemoryType(value: string | undefined): MemoryType {
  if (MEMORY_TYPES.includes(value as MemoryType)) return value as MemoryType;
  throw new Error(`--type must be one of: ${MEMORY_TYPES.join(', ')}`);
}

function parseOptionalMemoryType(value: string | undefined): MemoryType | undefined {
  return value === undefined ? undefined : parseMemoryType(value);
}

function parseConfidence(value: string | undefined): Confidence {
  if (CONFIDENCE_VALUES.includes(value as Confidence)) return value as Confidence;
  throw new Error(`--confidence must be one of: ${CONFIDENCE_VALUES.join(', ')}`);
}

function parseOptionalConfidence(value: string | undefined): Confidence | undefined {
  return value === undefined ? undefined : parseConfidence(value);
}

function parseSensitivity(value: string | undefined): Sensitivity {
  if (SENSITIVITY_VALUES.includes(value as Sensitivity)) return value as Sensitivity;
  throw new Error(`--sensitivity must be one of: ${SENSITIVITY_VALUES.join(', ')}`);
}

function parseContextFormat(value: string | undefined): NonNullable<ContextOptions['format']> {
  if (CONTEXT_FORMATS.includes(value as NonNullable<ContextOptions['format']>)) {
    return value as NonNullable<ContextOptions['format']>;
  }
  throw new Error(`--format must be one of: ${CONTEXT_FORMATS.join(', ')}`);
}

function parseInsightPlatform(value: string | undefined): NonNullable<InsightsOptions['platform']> {
  if (INSIGHT_PLATFORMS.includes(value as NonNullable<InsightsOptions['platform']>)) {
    return value as NonNullable<InsightsOptions['platform']>;
  }
  throw new Error(`--platform must be one of: ${INSIGHT_PLATFORMS.join(', ')}`);
}

function commonPathOptions(opts: { globalRoot?: string; projectRoot?: string }): ResolvePathOptions {
  return {
    globalRoot: opts.globalRoot,
    projectRoot: opts.projectRoot,
  };
}

export async function main(argv = process.argv): Promise<void> {
  const program = new Command();
  program
    .name('notebook')
    .description('Local file-based multi-level memory for Codex and Claude Code')
    .option('--global-root <path>', 'Override global notebook root')
    .option('--project-root <path>', 'Override project root');

  program
    .command('init')
    .option('--scope <scope>', 'global|project|both', 'both')
    .action(async opts => {
      const rootOpts = program.opts<{ globalRoot?: string; projectRoot?: string }>();
      await initNotebook({ ...commonPathOptions(rootOpts), scope: parseScope(opts.scope) });
      console.log('Notebook initialized.');
    });

  program
    .command('context')
    .option('--scope <scope>', 'global|project|both', 'both')
    .option('--query <query>')
    .option('--bootstrap-only')
    .option('--include-pending')
    .option('--budget <chars>', 'context character budget', value => Number(value), DEFAULT_CONTEXT_BUDGET)
    .option('--format <format>', 'text|hook|json', 'text')
    .action(async opts => {
      const rootOpts = program.opts<{ globalRoot?: string; projectRoot?: string }>();
      const format = parseContextFormat(opts.format);
      const result = await contextNotebook({
        ...commonPathOptions(rootOpts),
        scope: parseScope(opts.scope),
        query: opts.query,
        bootstrapOnly: Boolean(opts.bootstrapOnly),
        includePending: Boolean(opts.includePending),
        budget: Number(opts.budget),
        format,
      });
      if (format === 'json') console.log(JSON.stringify(result, null, 2));
      else if (result.text) console.log(result.text);
    });

  program
    .command('add')
    .requiredOption('--scope <scope>', 'global|project')
    .requiredOption('--type <type>', 'user|style|rule|project|mistake|reference')
    .requiredOption('--title <title>')
    .requiredOption('--content <content>')
    .option('--confidence <confidence>', 'high|medium|low', 'medium')
    .option('--sensitivity <sensitivity>', 'public|internal|redacted', 'internal')
    .option('--source <source>')
    .action(async opts => {
      const rootOpts = program.opts<{ globalRoot?: string; projectRoot?: string }>();
      const result = await addMemory({
        ...commonPathOptions(rootOpts),
        scope: parseSingleScope(opts.scope),
        type: parseMemoryType(opts.type),
        title: opts.title,
        content: opts.content,
        confidence: parseConfidence(opts.confidence),
        sensitivity: parseSensitivity(opts.sensitivity),
        source: opts.source,
      });
      console.log(`${result.created ? 'Created' : 'Updated'}: ${result.path}`);
    });

  program
    .command('search')
    .requiredOption('--query <query>')
    .option('--scope <scope>', 'global|project|both', 'both')
    .option('--type <type>')
    .option('--confidence <confidence>')
    .option('--before <date>')
    .action(async opts => {
      const rootOpts = program.opts<{ globalRoot?: string; projectRoot?: string }>();
      const result = await searchNotebook({
        ...commonPathOptions(rootOpts),
        scope: parseScope(opts.scope),
        query: opts.query,
        type: parseOptionalMemoryType(opts.type),
        confidence: parseOptionalConfidence(opts.confidence),
        before: opts.before,
      });
      for (const match of result.matches) {
        console.log(`${match.scope}\t${match.type ?? '-'}\t${match.title}\t${match.path}`);
      }
    });

  program
    .command('delete')
    .requiredOption('--query <query>')
    .option('--scope <scope>', 'global|project|both', 'both')
    .option('--type <type>')
    .option('--file <path>')
    .option('--yes')
    .action(async opts => {
      const rootOpts = program.opts<{ globalRoot?: string; projectRoot?: string }>();
      const result = await deleteMemories({
        ...commonPathOptions(rootOpts),
        scope: parseScope(opts.scope),
        query: opts.query,
        type: parseOptionalMemoryType(opts.type),
        file: opts.file,
        yes: Boolean(opts.yes),
      });
      if (!opts.yes) {
        console.log(`Preview: ${result.matches.length} match(es). Re-run with --yes to delete.`);
        for (const match of result.matches) console.log(match.path);
      } else {
        console.log(`Deleted ${result.deleted.length} file(s).`);
      }
    });

  program
    .command('promote')
    .requiredOption('--scope <scope>', 'global|project')
    .requiredOption('--query <query>')
    .option('--yes')
    .action(async opts => {
      const rootOpts = program.opts<{ globalRoot?: string; projectRoot?: string }>();
      const result = await promoteMemory({
        ...commonPathOptions(rootOpts),
        scope: parseSingleScope(opts.scope),
        query: opts.query,
        yes: Boolean(opts.yes),
      });
      console.log(result.promoted ? `Promoted: ${result.candidate}` : `Candidate: ${result.candidate || 'none'}`);
    });

  program
    .command('audit')
    .option('--scope <scope>', 'global|project|both', 'both')
    .action(async opts => {
      const rootOpts = program.opts<{ globalRoot?: string; projectRoot?: string }>();
      const result = await auditNotebook({ ...commonPathOptions(rootOpts), scope: parseScope(opts.scope) });
      if (result.issues.length === 0) {
        console.log('No notebook audit issues.');
        return;
      }
      for (const issue of result.issues) {
        console.log(`${issue.scope}\t${issue.code}\t${issue.file}\t${issue.message}`);
      }
    });

  program
    .command('compact')
    .option('--scope <scope>', 'global|project|both', 'both')
    .option('--target <target>')
    .option('--yes')
    .action(async opts => {
      const rootOpts = program.opts<{ globalRoot?: string; projectRoot?: string }>();
      const result = await compactNotebook({
        ...commonPathOptions(rootOpts),
        scope: parseScope(opts.scope),
        target: opts.target,
        yes: Boolean(opts.yes),
      });
      console.log(result.text);
    });

  program
    .command('insights')
    .option('--scope <scope>', 'global|project|both', 'project')
    .option('--since <duration>', 'duration such as 30d', '30d')
    .option('--platform <platform>', 'claude|codex|auto', 'auto')
    .action(async opts => {
      const rootOpts = program.opts<{ globalRoot?: string; projectRoot?: string }>();
      const result = await insightsNotebook({
        ...commonPathOptions(rootOpts),
        scope: parseScope(opts.scope),
        since: opts.since,
        platform: parseInsightPlatform(opts.platform),
      });
      console.log(`Report: ${result.reportPath}`);
      console.log(`Memory candidates: ${result.memoryCandidates.length}`);
      console.log(`Friction candidates: ${result.frictionCandidates.length}`);
    });

  program
    .command('resummarize')
    .requiredOption('--scope <scope>', 'global|project')
    .requiredOption('--query <query>')
    .action(async opts => {
      const rootOpts = program.opts<{ globalRoot?: string; projectRoot?: string }>();
      const result = await resummarizeNotebook({
        ...commonPathOptions(rootOpts),
        scope: parseSingleScope(opts.scope),
        query: opts.query,
      });
      console.log(result.text);
    });

  await program.parseAsync(argv);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch(error => {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
