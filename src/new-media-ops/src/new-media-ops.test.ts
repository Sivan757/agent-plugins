import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import {
  buildRemoteSshArgs,
  buildWechatDraftPayload,
  createDraftPackage,
  renderMarkdownToWechatHtml,
} from './new-media-ops.js';

async function withTempDir<T>(fn: (root: string) => Promise<T>): Promise<T> {
  const root = await mkdtemp(join(tmpdir(), 'new-media-ops-test-'));
  try {
    return await fn(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function runCli(home: string, args: string[]) {
  const cli = join(process.cwd(), 'src/new-media-ops.ts');
  const tsx = join(process.cwd(), '../../node_modules/tsx/dist/cli.mjs');
  return spawnSync(process.execPath, [tsx, cli, ...args], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      HOME: home,
      USERPROFILE: home,
    },
    encoding: 'utf8',
  });
}

test('createDraftPackage writes a stable v1 Xiaohongshu package', async () => {
  await withTempDir(async (root) => {
    const input = join(root, 'source.md');
    await writeFile(input, '# AI 工具选题\n\n这是一篇面向创作者的内容。\n', 'utf8');

    const result = await createDraftPackage({
      input,
      target: 'xiaohongshu',
      outDir: join(root, 'packages'),
      slug: 'ai-tools',
      title: 'AI 工具选题',
      images: ['cover.png'],
    });

    assert.equal(result.success, true);
    assert.equal(result.target, 'xiaohongshu');
    assert.ok(result.packageDir);

    const pkgPath = join(result.packageDir, 'content-package.json');
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
    assert.equal(pkg.version, 1);
    assert.equal(pkg.slug, 'ai-tools');
    assert.equal(pkg.target, 'xiaohongshu');
    assert.equal(pkg.files.markdown, 'final.md');
    assert.equal(pkg.files.platformCopy, 'xiaohongshu-copy.md');
    assert.deepEqual(pkg.files.images, ['cover.png']);
    assert.ok(pkg.quality.score >= 70);
  });
});

test('renderMarkdownToWechatHtml converts markdown into WeChat-ready HTML with citations', () => {
  const rendered = renderMarkdownToWechatHtml(
    [
      '# 标题',
      '',
      '正文包含 [外部链接](https://example.com)。',
      '',
      '```ts',
      'console.log("ok");',
      '```',
      '',
      '![配图](./cover.png)',
    ].join('\n'),
    { theme: 'default', citeLinks: true },
  );

  assert.equal(rendered.warnings.length, 0);
  assert.match(rendered.html, /data-new-media-ops="wechat-article"/);
  assert.match(rendered.html, /<h1[^>]*>标题<\/h1>/);
  assert.match(rendered.html, /<pre><code class="language-ts">/);
  assert.match(rendered.html, /<img[^>]+src="\.\/cover\.png"/);
  assert.match(rendered.html, /参考链接/);
  assert.match(rendered.html, /https:\/\/example\.com/);
});

test('buildWechatDraftPayload maps article and newspic targets safely', () => {
  const article = buildWechatDraftPayload({
    target: 'wechat-article',
    title: '公众号文章',
    html: '<p>正文</p>',
    coverMediaId: 'cover-media-id',
    author: '运营',
    summary: '摘要',
    needOpenComment: false,
    onlyFansCanComment: false,
  });
  assert.equal(article.articles[0]?.article_type, 'news');
  assert.equal(article.articles[0]?.thumb_media_id, 'cover-media-id');

  const newspic = buildWechatDraftPayload({
    target: 'wechat-newspic',
    title: '微信贴图',
    markdown: '短正文',
    imageMediaIds: ['img-1', 'img-2'],
  });
  assert.equal(newspic.articles[0]?.article_type, 'newspic');
  assert.deepEqual(newspic.articles[0]?.image_info, {
    image_list: [{ image_media_id: 'img-1' }, { image_media_id: 'img-2' }],
  });

  assert.throws(
    () => buildWechatDraftPayload({
      target: 'wechat-newspic',
      title: '过多图片',
      markdown: '短正文',
      imageMediaIds: Array.from({ length: 10 }, (_, index) => `img-${index}`),
    }),
    /at most 9 images/,
  );
});

test('buildRemoteSshArgs creates a SOCKS tunnel command without local secrets', () => {
  const args = buildRemoteSshArgs({
    appId: 'wx-test',
    appSecret: 'do-not-print-this-secret',
    publishMethod: 'remote-api',
    remotePublishHost: 'wechat-egress.example.com',
    remotePublishUser: 'deploy',
    remotePublishPort: 2222,
    remotePublishIdentityFile: '~/.ssh/id_ed25519',
  }, 19080);

  assert.deepEqual(args, [
    '-N',
    '-D',
    '127.0.0.1:19080',
    '-o',
    'ExitOnForwardFailure=yes',
    '-o',
    'ConnectTimeout=10',
    '-i',
    '~/.ssh/id_ed25519',
    '-p',
    '2222',
    'deploy@wechat-egress.example.com',
  ]);
  assert.doesNotMatch(args.join(' '), /do-not-print-this-secret/);
});

test('publish-draft dry-run does not print configured WeChat secrets', async () => {
  await withTempDir(async (root) => {
    const home = join(root, 'home');
    const packageDir = join(root, 'package');
    await mkdir(packageDir, { recursive: true });
    await writeFile(join(packageDir, 'article.html'), '<p>正文</p>', 'utf8');
    await writeFile(join(packageDir, 'final.md'), '# 标题\n\n正文\n', 'utf8');
    await writeJson(join(packageDir, 'content-package.json'), {
      version: 1,
      slug: 'wechat-post',
      title: '公众号文章',
      summary: '摘要',
      author: '运营',
      sourceInputs: ['input.md'],
      target: 'wechat-article',
      files: { markdown: 'final.md', html: 'article.html' },
      quality: { score: 88, warnings: [], checkedAt: new Date(0).toISOString() },
    });
    await writeJson(join(home, '.cache/agent-plugins/new-media-ops.json'), {
      wechat: {
        accounts: {
          default: {
            appId: 'wx-test-app',
            appSecret: 'do-not-print-this-secret',
            author: '运营',
            publishMethod: 'api',
          },
        },
      },
    });

    const result = runCli(home, [
      'publish-draft',
      packageDir,
      '--account',
      'default',
      '--cover-media-id',
      'cover-media-id',
      '--dry-run',
      '--format',
      'json',
    ]);

    assert.equal(result.status, 0, result.stderr);
    assert.doesNotMatch(result.stdout + result.stderr, /do-not-print-this-secret/);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.success, true);
    assert.equal(parsed.remote.endpoint, 'draft/add');
    assert.equal(parsed.remote.dryRun, true);
  });
});

test('publish-draft dry-run accepts local image assets by using placeholder media IDs', async () => {
  await withTempDir(async (root) => {
    const home = join(root, 'home');
    const articleDir = join(root, 'article-package');
    const newspicDir = join(root, 'newspic-package');
    await mkdir(articleDir, { recursive: true });
    await mkdir(newspicDir, { recursive: true });
    await writeFile(join(articleDir, 'article.html'), '<p>正文</p>', 'utf8');
    await writeFile(join(articleDir, 'final.md'), '# 公众号文章\n\n正文内容足够用于草稿校验。\n', 'utf8');
    await writeFile(join(newspicDir, 'final.md'), '# 微信贴图\n\n短正文内容。\n', 'utf8');
    await writeJson(join(articleDir, 'content-package.json'), {
      version: 1,
      slug: 'wechat-post',
      title: '公众号文章',
      sourceInputs: ['input.md'],
      target: 'wechat-article',
      files: { markdown: 'final.md', html: 'article.html', cover: join(root, 'cover.png') },
      quality: { score: 88, warnings: [], checkedAt: new Date(0).toISOString() },
    });
    await writeJson(join(newspicDir, 'content-package.json'), {
      version: 1,
      slug: 'wechat-newspic',
      title: '微信贴图',
      sourceInputs: ['input.md'],
      target: 'wechat-newspic',
      files: { markdown: 'final.md', images: [join(root, 'card-1.png'), join(root, 'card-2.png')] },
      quality: { score: 88, warnings: [], checkedAt: new Date(0).toISOString() },
    });
    await writeJson(join(home, '.cache/agent-plugins/new-media-ops.json'), {
      wechat: {
        accounts: {
          default: {
            appId: 'wx-test-app',
            appSecret: 'do-not-print-this-secret',
            author: '运营',
            publishMethod: 'api',
          },
        },
      },
    });

    const article = runCli(home, [
      'publish-draft',
      articleDir,
      '--account',
      'default',
      '--dry-run',
      '--format',
      'json',
    ]);
    assert.equal(article.status, 0, article.stderr);
    const parsedArticle = JSON.parse(article.stdout);
    assert.equal(parsedArticle.remote.articleType, 'news');
    assert.match(parsedArticle.warnings.join('\n'), /placeholder cover media ID/);

    const newspic = runCli(home, [
      'publish-draft',
      newspicDir,
      '--account',
      'default',
      '--dry-run',
      '--format',
      'json',
    ]);
    assert.equal(newspic.status, 0, newspic.stderr);
    const parsedNewspic = JSON.parse(newspic.stdout);
    assert.equal(parsedNewspic.remote.articleType, 'newspic');
    assert.match(parsedNewspic.warnings.join('\n'), /placeholder image media IDs/);
  });
});
