import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const originalHome = homedir();
let tmpHome: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let launchUI: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let configStore: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let captured: any;

/**
 * The "GET / serves the bundled HTML" test depends on the Vite-built
 * config-ui bundle (src/config-center/ui/dist/index.html), which is
 * gitignored and only present after `npm run build:ui`. Detect the bundle
 * the same way loadBundledHTML does so the test can skip cleanly in a fresh
 * checkout instead of reporting a false failure.
 */
function bundledHtmlAvailable(): boolean {
  const here = typeof __dirname !== 'undefined'
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(here, 'config-ui', 'dist', 'index.html'), // packed: dist/config-ui/dist/
    resolve(here, '..', 'ui', 'dist', 'index.html'), // dev: src/ui/dist/
    resolve(here, '..', '..', '..', 'src', 'config-center', 'ui', 'dist', 'index.html'),
  ];
  return candidates.some((p) => existsSync(p));
}

before(() => {
  tmpHome = mkdtempSync(join(tmpdir(), 'cc-launch-'));
  process.env.HOME = tmpHome;
  // Clear require cache so stateful source modules re-evaluate with the
  // test HOME. config-store.ts captures HOME at module-load time into CACHE_DIR.
  for (const key of Object.keys(require.cache)) {
    if (key.endsWith('launch-ui.ts') ||
        key.endsWith('config-store.ts') ||
        key.endsWith('config-center.ts')) {
      delete require.cache[key];
    }
  }
  launchUI = require('./launch-ui.ts');
  configStore = require('./config-store.ts');

  captured = { stdout: '', stderr: '' };
});

after(() => {
  process.env.HOME = originalHome;
  rmSync(tmpHome, { recursive: true, force: true });
});

function mockOutput() {
  return {
    stdout: (s: string) => { captured.stdout += s; },
    stderr: (s: string) => { captured.stderr += s; },
  };
}

/**
 * Fetch helper that follows the convention of the global fetch.
 * Returns { status, headers, body }.
 */
async function get(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const body = await res.text();
  return { status: res.status, body, headers: res.headers };
}

test('launchUI starts server and prints URL to stderr', async () => {
  const handle = launchUI.launchUI('test-basic', {
    output: mockOutput(),
    open: false,
    timeoutMs: 5000,
  });
  await handle.ready;

  assert.match(captured.stderr, /Open the config UI at: http:\/\/localhost:\d+/);
  assert.equal(handle.port > 0, true);
  assert.equal(handle.url, `http://localhost:${handle.port}`);

  await handle.close();
});

test('launchUI does not write to stdout', async () => {
  captured.stdout = '';
  captured.stderr = '';
  const handle = launchUI.launchUI('test-stdout', {
    output: mockOutput(),
    open: false,
    timeoutMs: 5000,
  });
  await handle.ready;
  assert.equal(captured.stdout, '');
  await handle.close();
});

test('GET / serves the bundled HTML', { skip: !bundledHtmlAvailable() ? 'config-ui bundle not built (run `npm run build:ui` in src/config-center)' : false }, async () => {
  const handle = launchUI.launchUI('test-html', {
    output: mockOutput(),
    open: false,
    timeoutMs: 5000,
  });
  await handle.ready;

  const res = await get(handle.url);
  // The HTML should contain the injected globals (proves injectGlobals ran).
  assert.equal(res.status, 200);
  assert.ok(res.body.includes('__CONFIG_SPEC__'), 'HTML missing __CONFIG_SPEC__');
  assert.ok(res.body.includes('__CSRF_TOKEN__'), 'HTML missing __CSRF_TOKEN__');
  assert.ok(res.body.includes('__PLUGIN_NAME__'), 'HTML missing __PLUGIN_NAME__');

  await handle.close();
});

test('GET /api/plugins returns the known plugin list', async () => {
  const handle = launchUI.launchUI(undefined, {
    output: mockOutput(),
    open: false,
    timeoutMs: 5000,
  });
  await handle.ready;

  const res = await get(`${handle.url}/api/plugins`);
  assert.equal(res.status, 200);
  const plugins = JSON.parse(res.body);
  assert.ok(Array.isArray(plugins));
  // Hardcoded known plugins should be present.
  assert.ok(plugins.includes('ticktick'), `expected ticktick in: ${JSON.stringify(plugins)}`);
  assert.ok(plugins.includes('postgresql'), `expected postgresql in: ${JSON.stringify(plugins)}`);

  await handle.close();
});

test('GET /api/config/<plugin> returns empty object for new plugin', async () => {
  const handle = launchUI.launchUI(undefined, {
    output: mockOutput(),
    open: false,
    timeoutMs: 5000,
  });
  await handle.ready;

  const res = await get(`${handle.url}/api/config/test-new-plugin`);
  assert.equal(res.status, 200);
  assert.deepEqual(JSON.parse(res.body), {});

  await handle.close();
});

test('GET /api/config/<plugin> returns existing config (plaintext to browser)', async () => {
  // Pre-write a config.
  mkdirSync(configStore.configDir('test-existing'), { recursive: true });
  writeFileSync(
    configStore.configPath('test-existing'),
    JSON.stringify({ TOKEN: 'supersecret123' }),
    'utf-8',
  );

  const handle = launchUI.launchUI(undefined, {
    output: mockOutput(),
    open: false,
    timeoutMs: 5000,
  });
  await handle.ready;

  const res = await get(`${handle.url}/api/config/test-existing`);
  assert.equal(res.status, 200);
  const config = JSON.parse(res.body);
  assert.equal(config.TOKEN, 'supersecret123');

  // Cleanup
  rmSync(configStore.configDir('test-existing'), { recursive: true, force: true });
  await handle.close();
});

test('GET /api/config/<plugin> rejects path traversal via %2F encoding', async () => {
  // Create a sentinel file OUTSIDE the cache dir that the traversal would
  // reach if validation were missing. configPath('..%2F..%2Fconfig') decodes
  // to '../../config' which resolves to <tmpHome>/config/config.json.
  const sentinelDir = join(tmpHome, 'config');
  mkdirSync(sentinelDir, { recursive: true });
  const sentinelSecret = 'TRAVERSAL_SENTINEL_98765';
  writeFileSync(
    join(sentinelDir, 'config.json'),
    JSON.stringify({ secret: sentinelSecret }),
    'utf-8',
  );

  const handle = launchUI.launchUI(undefined, {
    output: mockOutput(),
    open: false,
    timeoutMs: 5000,
  });
  await handle.ready;

  try {
    // %2F is URL-encoded /. After decodeURIComponent, ..%2F..%2Fconfig
    // becomes ../../config. Without validation, configPath would resolve
    // OUTSIDE the cache dir. The route must reject this.
    const res = await get(`${handle.url}/api/config/..%2F..%2Fconfig`);
    assert.ok(res.status >= 400 && res.status < 500,
      `expected 4xx for path traversal attempt, got ${res.status}`);
    assert.equal(res.body.includes(sentinelSecret), false,
      'path traversal read sentinel file outside cache dir');
  } finally {
    await handle.close();
    rmSync(sentinelDir, { recursive: true, force: true });
  }
});

test('POST /api/config/<plugin> writes config via saveConfig', async () => {
  const handle = launchUI.launchUI(undefined, {
    output: mockOutput(),
    open: false,
    timeoutMs: 5000,
  });
  await handle.ready;

  try {
    const res = await get(`${handle.url}/api/config/test-write`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': handle.csrfToken,
      },
      body: JSON.stringify({ KEY1: 'value1', KEY2: 'value2' }),
    });
    assert.equal(res.status, 200);
    assert.deepEqual(JSON.parse(res.body), { ok: true });

    // The server closes after a successful POST; wait for done.
    const saved = await handle.done;
    assert.equal(saved, true);

    // Verify the file was written via loadConfig (the production read path).
    const loaded = await configStore.loadConfig('test-write');
    assert.deepEqual(loaded, { KEY1: 'value1', KEY2: 'value2' });
  } finally {
    // Cleanup
    await handle.close();
    rmSync(configStore.configDir('test-write'), { recursive: true, force: true });
  }
});

test('POST /api/config/<plugin> rejects without CSRF token', async () => {
  const handle = launchUI.launchUI(undefined, {
    output: mockOutput(),
    open: false,
    timeoutMs: 5000,
  });
  await handle.ready;

  const res = await get(`${handle.url}/api/config/test-csrf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ KEY: 'value' }),
  });
  assert.equal(res.status, 403);
  const body = JSON.parse(res.body);
  assert.equal(body.ok, false);
  assert.match(body.error, /CSRF/i);

  // Verify nothing was written.
  assert.equal(existsSync(configStore.configPath('test-csrf')), false);

  await handle.close();
});

test('POST /save writes config for schema-driven form (with collections)', async () => {
  // Use the collections converter: the form posts arrays with _name, the file
  // stores keyed objects.
  const spec = {
    root: 'root',
    elements: {},
    state: {},
  };
  const collections = [{ statePath: '/connections' }];

  const handle = launchUI.launchUI('test-schema', {
    spec,
    collections,
    output: mockOutput(),
    open: false,
    timeoutMs: 5000,
  });
  await handle.ready;

  try {
    // The schema form posts UI state (arrays with _name).
    const formState = {
      connections: [
        { _name: 'default', host: 'localhost', port: 5432 },
        { _name: 'qa', host: 'qa.db', port: 5433 },
      ],
    };

    const res = await get(`${handle.url}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': handle.csrfToken,
      },
      body: JSON.stringify(formState),
    });
    assert.equal(res.status, 200);
    assert.deepEqual(JSON.parse(res.body), { ok: true });

    const saved = await handle.done;
    assert.equal(saved, true);

    // Verify the config was written in keyed-object format (arrays -> objects).
    const loaded = await configStore.loadConfig('test-schema');
    assert.deepEqual(loaded, {
      connections: {
        default: { host: 'localhost', port: 5432 },
        qa: { host: 'qa.db', port: 5433 },
      },
    });
  } finally {
    // Cleanup
    await handle.close();
    rmSync(configStore.configDir('test-schema'), { recursive: true, force: true });
  }
});

test('POST /save rejects without CSRF token', async () => {
  const handle = launchUI.launchUI('test-schema-csrf', {
    output: mockOutput(),
    open: false,
    timeoutMs: 5000,
  });
  await handle.ready;

  const res = await get(`${handle.url}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ KEY: 'value' }),
  });
  assert.equal(res.status, 403);

  await handle.close();
});

test('handle.done resolves false on timeout', async () => {
  const handle = launchUI.launchUI('test-timeout', {
    output: mockOutput(),
    open: false,
    timeoutMs: 50,
  });
  await handle.ready;

  try {
    const saved = await handle.done;
    assert.equal(saved, false);
  } finally {
    await handle.close();
  }
});

test('handle.close() is idempotent and settles done', async () => {
  const handle = launchUI.launchUI('test-close', {
    output: mockOutput(),
    open: false,
    timeoutMs: 5000,
  });
  await handle.ready;

  await handle.close();
  await handle.close(); // should not throw

  const saved = await handle.done;
  assert.equal(saved, false);
});
