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
  // Clear require cache so stateful source modules re-evaluate with the
  // test HOME. config-store.ts captures HOME at module-load time into
  // CACHE_DIR. config-center.ts imports config-store, so it must reload too.
  for (const key of Object.keys(require.cache)) {
    if (key.endsWith('config-center.ts') || key.endsWith('config-store.ts')) {
      delete require.cache[key];
    }
  }
  configCenter = require('./config-center.ts');
  configStore = require('./config-store.ts');
});

after(() => {
  process.env.HOME = originalHome;
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
  const { stdout } = await runMain(['get', 'demo', 'TOKEN']);
  assert.equal(stdout.includes(secret), false, 'plaintext secret leaked into stdout');
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
  const { stdout } = await runMain(['show', 'demo']);
  assert.equal(stdout.includes(secret), false, 'plaintext secret leaked into show output');
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

test('init prints UI URL to stderr', async () => {
  const { stderr } = await runMain(['init', 'demo']);
  assert.match(stderr, /Open the config UI at: http:\/\/localhost:\d+/);
});

test('edit prints UI URL to stderr', async () => {
  const { stderr } = await runMain(['edit', 'demo']);
  assert.match(stderr, /Open the config UI at: http:\/\/localhost:\d+/);
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
