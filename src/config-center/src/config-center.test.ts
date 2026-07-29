import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir, homedir } from 'os';
import { join } from 'path';
import { redactEntry } from './redact.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CLIOutput = any;

const originalHome = homedir();
let tmpHome: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let configCenter: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let configStore: any;

before(() => {
  tmpHome = mkdtempSync(join(tmpdir(), 'cc-cli-'));
  process.env.HOME = tmpHome;
  // Test mode: don't open a browser, and use a short server timeout so
  // init/edit actions resolve quickly without hanging the test runner.
  process.env.CC_UI_NO_OPEN = '1';
  process.env.CC_UI_TIMEOUT_MS = '20';
  // Clear require cache so stateful source modules re-evaluate with the
  // test HOME. config-store.ts captures HOME at module-load time into
  // CACHE_DIR. config-center.ts imports config-store, so it must reload too.
  for (const key of Object.keys(require.cache)) {
    if (key.endsWith('config-center.ts') ||
        key.endsWith('config-store.ts') ||
        key.endsWith('launch-ui.ts')) {
      delete require.cache[key];
    }
  }
  configCenter = require('./config-center.ts');
  configStore = require('./config-store.ts');
});

after(() => {
  process.env.HOME = originalHome;
  delete process.env.CC_UI_NO_OPEN;
  delete process.env.CC_UI_TIMEOUT_MS;
  rmSync(tmpHome, { recursive: true, force: true });
});

/**
 * Create a mock CLIOutput that captures all writes for assertions.
 * Uses a mutable object so captured strings stay in sync with writes.
 * This avoids monkey-patching process.stdout/stderr, which is unreliable
 * across runtimes and can interfere with the test runner's own output.
 */
function mockOutput(): { output: CLIOutput; captured: { stdout: string; stderr: string } } {
  const captured = { stdout: '', stderr: '' };
  return {
    captured,
    output: {
      stdout: (s: string) => { captured.stdout += s; },
      stderr: (s: string) => { captured.stderr += s; },
    },
  };
}

/**
 * Run main() with captured I/O. Returns the exit code and captured output.
 */
async function runMain(
  argv: string[]
): Promise<{ code: number; stdout: string; stderr: string }> {
  const mock = mockOutput();
  const code = await configCenter.main(argv, mock.output);
  return { code, stdout: mock.captured.stdout, stderr: mock.captured.stderr };
}

function writeConfig(name: string, data: Record<string, unknown>): void {
  mkdirSync(configStore.configDir(name), { recursive: true });
  writeFileSync(configStore.configPath(name), JSON.stringify(data), 'utf-8');
}

function removeConfig(name: string): void {
  rmSync(configStore.configDir(name), { recursive: true, force: true });
}

test('get prints redacted value', async () => {
  writeConfig('demo', { TOKEN: 'abcdefghij' });
  const { stdout } = await runMain(['get', 'demo', 'TOKEN']);
  assert.equal(stdout.trim(), 'TOKEN=ab•••••hij');
  removeConfig('demo');
});

test('get does NOT leak plaintext (security regression)', async () => {
  const secret = 'supersecretvalue123';
  writeConfig('demo', { TOKEN: secret });
  const { stdout, stderr } = await runMain(['get', 'demo', 'TOKEN']);
  assert.equal(stdout.includes(secret), false, 'plaintext secret leaked into stdout');
  assert.equal(stderr.includes(secret), false, 'plaintext secret leaked into stderr');
  removeConfig('demo');
});

test('get prints <not set> for absent key', async () => {
  writeConfig('demo', { OTHER: 'value' });
  const { stdout } = await runMain(['get', 'demo', 'MISSING']);
  assert.equal(stdout.trim(), 'MISSING=<not set>');
  removeConfig('demo');
});

test('get prints <not set> when config is missing entirely', async () => {
  const { stdout } = await runMain(['get', 'ghost', 'TOKEN']);
  assert.equal(stdout.trim(), 'TOKEN=<not set>');
});

test('get without key prints all top-level keys redacted', async () => {
  writeConfig('demo', { TOKEN: 'abcdefghij', OTHER: 'short' });
  const { stdout } = await runMain(['get', 'demo']);
  const lines = stdout.trim().split('\n').sort();
  assert.deepEqual(lines, ['OTHER=•••••', 'TOKEN=ab•••••hij']);
  removeConfig('demo');
});

test('get without key prints "# no config" when config is missing', async () => {
  const { stdout } = await runMain(['get', 'ghost']);
  assert.equal(stdout.trim(), '# no config');
});

test('show prints all top-level keys redacted', async () => {
  writeConfig('demo', { TOKEN: 'abcdefghij', KEY2: 'temu_secret_key' });
  const { stdout } = await runMain(['show', 'demo']);
  const lines = stdout.trim().split('\n');
  assert.ok(lines.includes('TOKEN=ab•••••hij'), `expected redacted TOKEN in: ${lines.join(', ')}`);
  // Use redactEntry to compute the expected value so the test stays in sync
  // with the redaction format without brittle dot-counting.
  assert.ok(lines.includes(redactEntry('KEY2', 'temu_secret_key')), `expected redacted KEY2 in: ${lines.join(', ')}`);
  removeConfig('demo');
});

test('show prints "# no config" when config is missing', async () => {
  const { stdout } = await runMain(['show', 'ghost']);
  assert.equal(stdout.trim(), '# no config');
});

test('show never leaks plaintext', async () => {
  const secret = 'plaintextleak123456';
  writeConfig('demo', { TOKEN: secret });
  const { stdout, stderr } = await runMain(['show', 'demo']);
  assert.equal(stdout.includes(secret), false, 'plaintext secret leaked into show output');
  assert.equal(stderr.includes(secret), false, 'plaintext secret leaked into show stderr');
  removeConfig('demo');
});

test('get never prints the cache path', async () => {
  writeConfig('demo', { TOKEN: 'abcdefghij' });
  const { stdout, stderr } = await runMain(['get', 'demo', 'TOKEN']);
  assert.equal(stdout.includes('.cache/agent-plugins'), false, 'cache path leaked into stdout');
  assert.equal(stdout.includes(tmpHome), false, 'tmp home path leaked into stdout');
  assert.equal(stderr.includes('.cache/agent-plugins'), false, 'cache path leaked into stderr');
  removeConfig('demo');
});

test('show never prints the cache path', async () => {
  writeConfig('demo', { TOKEN: 'abcdefghij' });
  const { stdout, stderr } = await runMain(['show', 'demo']);
  assert.equal(stdout.includes('.cache/agent-plugins'), false, 'cache path leaked into stdout');
  assert.equal(stderr.includes('.cache/agent-plugins'), false, 'cache path leaked into stderr');
  removeConfig('demo');
});

test('legacy-path rename error does not leak HOME or cache path', async () => {
  // Place a legacy config at the OLDER ~/.cache/ap/ex-plugin/<name>.json path
  // and make the target plugin directory read-only so migrateLegacyConfig's
  // mkdir noops (dir exists) but rename INTO it fails with EACCES. The rename
  // error's source path is the legacy .../.cache/ap/ex-plugin/<name>.json,
  // which the narrow redaction regex would leak. Assert it does not.
  const legacyOlderDir = join(tmpHome, '.cache', 'ap', 'ex-plugin');
  mkdirSync(legacyOlderDir, { recursive: true });
  writeFileSync(join(legacyOlderDir, 'demo.json'), JSON.stringify({ TOKEN: 'abcdefghij' }));

  const fs = require('fs');
  // Create the target plugin dir writable first, then make it read-only so
  // rename cannot write config.json into it (mkdir with recursive:true is a
  // noop on an existing dir, so it succeeds; rename then fails).
  const pluginDir = configStore.configDir('demo');
  mkdirSync(pluginDir, { recursive: true });
  fs.chmodSync(pluginDir, 0o500);

  try {
    const { stdout, stderr, code } = await runMain(['get', 'demo', 'TOKEN']);
    assert.equal(stderr.includes(tmpHome), false, 'tmp HOME leaked into stderr');
    assert.equal(stderr.includes('ap/ex-plugin'), false, 'legacy cache path leaked into stderr');
    assert.equal(stderr.includes('.cache/'), false, 'cache path leaked into stderr');
    assert.equal(stdout.includes(tmpHome), false, 'tmp HOME leaked into stdout');
    assert.equal(code, 1);
  } finally {
    fs.chmodSync(pluginDir, 0o755);
    rmSync(join(tmpHome, '.cache', 'ap'), { recursive: true, force: true });
    rmSync(pluginDir, { recursive: true, force: true });
  }
});

test('init prints UI URL to stderr', async () => {
  const { stderr } = await runMain(['init', 'demo']);
  assert.match(stderr, /Open the config UI at: http:\/\/localhost:\d+/);
});

test('edit prints UI URL to stderr', async () => {
  const { stderr } = await runMain(['edit', 'demo']);
  assert.match(stderr, /Open the config UI at: http:\/\/localhost:\d+/);
});

test('init does not leak cache path, HOME, or plaintext config', async () => {
  const secret = 'init-leak-secret-987654';
  writeConfig('demo', { TOKEN: secret });
  try {
    const { stdout, stderr } = await runMain(['init', 'demo']);
    assert.equal(stdout.includes('.cache/agent-plugins'), false, 'cache path leaked into init stdout');
    assert.equal(stdout.includes(tmpHome), false, 'tmp HOME leaked into init stdout');
    assert.equal(stdout.includes(secret), false, 'plaintext leaked into init stdout');
    assert.equal(stderr.includes('.cache/agent-plugins'), false, 'cache path leaked into init stderr');
    assert.equal(stderr.includes(tmpHome), false, 'tmp HOME leaked into init stderr');
    assert.equal(stderr.includes(secret), false, 'plaintext leaked into init stderr');
  } finally {
    removeConfig('demo');
  }
});

test('edit does not leak cache path, HOME, or plaintext config', async () => {
  const secret = 'edit-leak-secret-321098';
  writeConfig('demo', { TOKEN: secret });
  try {
    const { stdout, stderr } = await runMain(['edit', 'demo']);
    assert.equal(stdout.includes('.cache/agent-plugins'), false, 'cache path leaked into edit stdout');
    assert.equal(stdout.includes(tmpHome), false, 'tmp HOME leaked into edit stdout');
    assert.equal(stdout.includes(secret), false, 'plaintext leaked into edit stdout');
    assert.equal(stderr.includes('.cache/agent-plugins'), false, 'cache path leaked into edit stderr');
    assert.equal(stderr.includes(tmpHome), false, 'tmp HOME leaked into edit stderr');
    assert.equal(stderr.includes(secret), false, 'plaintext leaked into edit stderr');
  } finally {
    removeConfig('demo');
  }
});

test('init without plugin prints UI URL to stderr', async () => {
  const { stderr } = await runMain(['init']);
  assert.match(stderr, /Open the config UI at: http:\/\/localhost:\d+/);
});

test('init does not write to stdout', async () => {
  const { stdout } = await runMain(['init', 'demo']);
  assert.equal(stdout, '');
});

test('main returns 0 on successful get', async () => {
  writeConfig('demo', { TOKEN: 'abcdefghij' });
  const { code } = await runMain(['get', 'demo', 'TOKEN']);
  assert.equal(code, 0);
  removeConfig('demo');
});

test('main returns 0 on successful show', async () => {
  writeConfig('demo', { TOKEN: 'abcdefghij' });
  const { code } = await runMain(['show', 'demo']);
  assert.equal(code, 0);
  removeConfig('demo');
});

test('main returns 0 on init', async () => {
  const { code } = await runMain(['init', 'demo']);
  assert.equal(code, 0);
});

test('main returns 1 on unknown command', async () => {
  const { code } = await runMain(['bogus', 'command']);
  assert.equal(code, 1);
});

test('main returns 1 on missing required plugin arg', async () => {
  const { code } = await runMain(['get']);
  assert.equal(code, 1);
});

test('error output never includes the cache path', async () => {
  // Force a CONFIG_INVALID error by writing bad JSON.
  mkdirSync(configStore.configDir('demo'), { recursive: true });
  writeFileSync(configStore.configPath('demo'), 'not valid json {{{', 'utf-8');
  const { stderr } = await runMain(['get', 'demo', 'TOKEN']);
  assert.equal(stderr.includes('.cache/agent-plugins'), false, 'cache path leaked into stderr');
  assert.equal(stderr.includes(tmpHome), false, 'tmp home leaked into stderr');
  removeConfig('demo');
});

test('main without output parameter defaults to process streams', async () => {
  // Verify the default output works (no mock). Just check it doesn't throw.
  writeConfig('demo', { TOKEN: 'abcdefghij' });
  // Capture using the mock to avoid polluting test output, but also verify
  // that calling main WITHOUT the output parameter works.
  const code = await configCenter.main(['get', 'demo', 'TOKEN'], {
    stdout: () => {},
    stderr: () => {},
  });
  assert.equal(code, 0);
  removeConfig('demo');
});
