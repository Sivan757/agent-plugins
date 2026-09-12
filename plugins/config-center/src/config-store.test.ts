import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  rmSync,
  statSync,
  chmodSync,
  readdirSync,
} from 'fs';
import { tmpdir, homedir } from 'os';
import { join } from 'path';

const originalHome = homedir();
let tmpHome: string;
let configStore: {
  CACHE_DIR: string;
  configDir: (name: string) => string;
  configPath: (name: string) => string;
  artifactsDir: (name: string) => string;
  migrateLegacyConfig: (name: string) => Promise<void>;
  loadConfig: <T extends Record<string, unknown>>(name: string) => Promise<T | null>;
  saveConfig: (name: string, data: Record<string, unknown>, options?: { merge?: boolean }) => Promise<void>;
  requireConfig: <T extends Record<string, unknown>>(name: string) => Promise<T>;
};

before(() => {
  tmpHome = mkdtempSync(join(tmpdir(), 'cc-'));
  process.env.HOME = tmpHome;
  // Clear require cache so the module evaluates with the test HOME
  for (const key of Object.keys(require.cache)) {
    if (key.endsWith('config-store.ts')) delete require.cache[key];
  }
  configStore = require('./config-store.ts');
});

after(() => {
  process.env.HOME = originalHome;
  rmSync(tmpHome, { recursive: true, force: true });
});

test('configPath returns directory-layout path', () => {
  assert.equal(
    configStore.configPath('demo'),
    join(tmpHome, '.cache', 'agent-plugins', 'demo', 'config.json')
  );
});

test('configDir returns the per-plugin configuration directory', () => {
  assert.equal(
    configStore.configDir('demo'),
    join(tmpHome, '.cache', 'agent-plugins', 'demo')
  );
});

test('artifactsDir returns the per-plugin artifacts directory', () => {
  assert.equal(
    configStore.artifactsDir('demo'),
    join(tmpHome, '.cache', 'agent-plugins', 'demo', 'artifacts')
  );
});

test('CACHE_DIR is a constant under homedir/.cache/agent-plugins', () => {
  assert.equal(configStore.CACHE_DIR, join(tmpHome, '.cache', 'agent-plugins'));
});

test('migrateLegacyConfig migrates flat legacy file to directory layout', async () => {
  const legacyFlat = join(tmpHome, '.cache', 'agent-plugins', 'demo.json');
  mkdirSync(join(tmpHome, '.cache', 'agent-plugins'), { recursive: true });
  writeFileSync(legacyFlat, JSON.stringify({ key: 'legacy' }), 'utf-8');

  assert.equal(existsSync(configStore.configPath('demo')), false);

  await configStore.migrateLegacyConfig('demo');

  assert.equal(existsSync(configStore.configPath('demo')), true);
  assert.equal(existsSync(legacyFlat), false);

  // Cleanup
  rmSync(configStore.configDir('demo'), { recursive: true, force: true });
});

test('migrateLegacyConfig migrates even-older legacy path (~/.cache/ap/ex-plugin/<name>.json)', async () => {
  const olderLegacy = join(tmpHome, '.cache', 'ap', 'ex-plugin', 'demo.json');
  mkdirSync(join(tmpHome, '.cache', 'ap', 'ex-plugin'), { recursive: true });
  writeFileSync(olderLegacy, JSON.stringify({ key: 'older' }), 'utf-8');

  assert.equal(existsSync(configStore.configPath('demo')), false);

  await configStore.migrateLegacyConfig('demo');

  assert.equal(existsSync(configStore.configPath('demo')), true);
  assert.equal(existsSync(olderLegacy), false);

  // Cleanup
  rmSync(configStore.configDir('demo'), { recursive: true, force: true });
  rmSync(join(tmpHome, '.cache', 'ap'), { recursive: true, force: true });
});

test('migrateLegacyConfig is idempotent (directory layout already exists)', async () => {
  const dir = configStore.configDir('demo');
  mkdirSync(dir, { recursive: true });
  writeFileSync(configStore.configPath('demo'), JSON.stringify({ key: 'already' }), 'utf-8');

  // Also create a stale legacy flat file — migration should NOT overwrite
  const legacyFlat = join(tmpHome, '.cache', 'agent-plugins', 'demo.json');
  writeFileSync(legacyFlat, JSON.stringify({ key: 'stale' }), 'utf-8');

  await configStore.migrateLegacyConfig('demo');

  // Directory-layout file should still be the original
  const { readFile } = await import('fs/promises');
  const content = JSON.parse(await readFile(configStore.configPath('demo'), 'utf-8'));
  assert.equal(content.key, 'already');

  // Legacy flat file should still exist (migration skipped)
  assert.equal(existsSync(legacyFlat), true);

  // Cleanup
  rmSync(dir, { recursive: true, force: true });
  rmSync(legacyFlat, { force: true });
});

test('loadConfig returns parsed config from directory layout', async () => {
  mkdirSync(configStore.configDir('demo'), { recursive: true });
  writeFileSync(
    configStore.configPath('demo'),
    JSON.stringify({ apiKey: 'abc123' }),
    'utf-8'
  );

  const config = await configStore.loadConfig<{ apiKey: string }>('demo');
  assert.notEqual(config, null);
  assert.equal(config!.apiKey, 'abc123');

  // Cleanup
  rmSync(configStore.configDir('demo'), { recursive: true, force: true });
});

test('loadConfig returns null when no config exists', async () => {
  const config = await configStore.loadConfig('nonexistent');
  assert.equal(config, null);
});

test('loadConfig migrates legacy flat file before reading (auto-migration)', async () => {
  const legacyFlat = join(tmpHome, '.cache', 'agent-plugins', 'demo.json');
  mkdirSync(join(tmpHome, '.cache', 'agent-plugins'), { recursive: true });
  writeFileSync(legacyFlat, JSON.stringify({ migrated: true }), 'utf-8');

  const config = await configStore.loadConfig<{ migrated: boolean }>('demo');
  assert.notEqual(config, null);
  assert.equal(config!.migrated, true);

  assert.equal(existsSync(legacyFlat), false);
  assert.equal(existsSync(configStore.configPath('demo')), true);

  // Cleanup
  rmSync(configStore.configDir('demo'), { recursive: true, force: true });
});

test('loadConfig throws CONFIG_INVALID on bad JSON', async () => {
  mkdirSync(configStore.configDir('demo'), { recursive: true });
  writeFileSync(configStore.configPath('demo'), 'not valid json {{{', 'utf-8');

  await assert.rejects(
    () => configStore.loadConfig('demo'),
    (err: any) => err.code === 'CONFIG_INVALID'
  );

  // Cleanup
  rmSync(configStore.configDir('demo'), { recursive: true, force: true });
});

test('saveConfig writes to directory layout', async () => {
  await configStore.saveConfig('demo', { key: 'value' }, { merge: false });

  assert.equal(existsSync(configStore.configPath('demo')), true);
  const { readFile } = await import('fs/promises');
  const content = JSON.parse(await readFile(configStore.configPath('demo'), 'utf-8'));
  assert.equal(content.key, 'value');

  // Cleanup
  rmSync(configStore.configDir('demo'), { recursive: true, force: true });
});

test('saveConfig with merge=true deep-merges with existing config', async () => {
  // First save: base config
  await configStore.saveConfig('demo', { a: 1, nested: { x: 1 } }, { merge: false });

  // Second save: merge new data
  await configStore.saveConfig('demo', { b: 2, nested: { y: 2 } }, { merge: true });

  const { readFile } = await import('fs/promises');
  const content = JSON.parse(await readFile(configStore.configPath('demo'), 'utf-8'));
  assert.deepEqual(content, { a: 1, b: 2, nested: { x: 1, y: 2 } });

  // Cleanup
  rmSync(configStore.configDir('demo'), { recursive: true, force: true });
});

test('saveConfig without merge overwrites existing config', async () => {
  await configStore.saveConfig('demo', { first: true }, { merge: false });
  await configStore.saveConfig('demo', { second: true }, { merge: false });

  const { readFile } = await import('fs/promises');
  const content = JSON.parse(await readFile(configStore.configPath('demo'), 'utf-8'));
  assert.deepEqual(content, { second: true });

  // Cleanup
  rmSync(configStore.configDir('demo'), { recursive: true, force: true });
});

test('saveConfig default (no options) overwrites, does not merge', async () => {
  await configStore.saveConfig('demo', { a: 1, nested: { x: 1 } });

  // Second call with no options — overwrite, not merge
  await configStore.saveConfig('demo', { b: 2 });

  const { readFile } = await import('fs/promises');
  const content = JSON.parse(await readFile(configStore.configPath('demo'), 'utf-8'));
  assert.deepEqual(content, { b: 2 });

  // Cleanup
  rmSync(configStore.configDir('demo'), { recursive: true, force: true });
});

test('requireConfig loads existing config', async () => {
  mkdirSync(configStore.configDir('demo'), { recursive: true });
  writeFileSync(configStore.configPath('demo'), JSON.stringify({ key: 'required' }), 'utf-8');

  const config = await configStore.requireConfig<{ key: string }>('demo');
  assert.equal(config.key, 'required');

  // Cleanup
  rmSync(configStore.configDir('demo'), { recursive: true, force: true });
});

test('requireConfig throws CONFIG_MISSING when no config exists', async () => {
  await assert.rejects(
    () => configStore.requireConfig('nonexistent'),
    (err: any) => err.code === 'CONFIG_MISSING'
  );
});

test('AGENT_PLUGINS_CACHE_DIR redirects every config path without a re-import', async () => {
  // Isolation for previews and tests must not depend on when HOME was read.
  // Setting HOME inside a script does not move the cache; this override does.
  const scratch = mkdtempSync(join(tmpdir(), 'cc-scratch-'));
  const previous = process.env.AGENT_PLUGINS_CACHE_DIR;
  process.env.AGENT_PLUGINS_CACHE_DIR = scratch;
  try {
    assert.equal(configStore.configDir('demo'), join(scratch, 'demo'));
    assert.equal(configStore.configPath('demo'), join(scratch, 'demo', 'config.json'));
    assert.equal(configStore.artifactsDir('demo'), join(scratch, 'demo', 'artifacts'));

    await configStore.saveConfig('demo', { gateway: 'https://scratch.example' });
    assert.equal(existsSync(join(scratch, 'demo', 'config.json')), true);
    const loaded = await configStore.loadConfig<{ gateway: string }>('demo');
    assert.equal(loaded?.gateway, 'https://scratch.example');
  } finally {
    if (previous === undefined) delete process.env.AGENT_PLUGINS_CACHE_DIR;
    else process.env.AGENT_PLUGINS_CACHE_DIR = previous;
    rmSync(scratch, { recursive: true, force: true });
  }
});

// ── Private storage ─────────────────────────────────────────────────────────
//
// The mode checks are POSIX-only: Windows has no mode to check, so these are
// skipped there rather than asserting something the platform cannot express.

const POSIX = process.platform !== 'win32';

function modeOf(path: string): number {
  return statSync(path).mode & 0o777;
}

test('saveConfig writes the config 0600 inside a 0700 plugin directory', { skip: !POSIX }, async () => {
  await configStore.saveConfig('demo', { password: 'secret' });

  assert.equal(modeOf(configStore.configDir('demo')).toString(8), '700');
  assert.equal(modeOf(configStore.configPath('demo')).toString(8), '600');

  // Cleanup
  rmSync(configStore.configDir('demo'), { recursive: true, force: true });
});

test('loadConfig tightens a config left readable by other users', { skip: !POSIX }, async () => {
  // Reproduces a config written before permissions were enforced.
  const dir = configStore.configDir('demo');
  mkdirSync(dir, { recursive: true });
  writeFileSync(configStore.configPath('demo'), JSON.stringify({ a: 1 }), 'utf-8');
  chmodSync(dir, 0o755);
  chmodSync(configStore.configPath('demo'), 0o644);

  const loaded = await configStore.loadConfig<{ a: number }>('demo');
  assert.equal(loaded?.a, 1);
  assert.equal(modeOf(dir).toString(8), '700');
  assert.equal(modeOf(configStore.configPath('demo')).toString(8), '600');

  // Cleanup
  rmSync(dir, { recursive: true, force: true });
});

test('saveConfig replaces an existing readable config with a private one', { skip: !POSIX }, async () => {
  const dir = configStore.configDir('demo');
  mkdirSync(dir, { recursive: true });
  writeFileSync(configStore.configPath('demo'), JSON.stringify({ old: true }), 'utf-8');
  chmodSync(configStore.configPath('demo'), 0o644);

  await configStore.saveConfig('demo', { password: 'secret' });

  assert.equal(modeOf(configStore.configPath('demo')).toString(8), '600');

  // Cleanup
  rmSync(dir, { recursive: true, force: true });
});

test('saveConfig leaves no temporary file behind', async () => {
  const dir = configStore.configDir('demo');

  await configStore.saveConfig('demo', { first: true });
  await configStore.saveConfig('demo', { second: true }, { merge: true });

  // The write goes through a sibling temporary file, so a leftover would show up
  // here and would also mean the rename never completed.
  assert.deepEqual(readdirSync(dir), ['config.json']);

  // Cleanup
  rmSync(dir, { recursive: true, force: true });
});

