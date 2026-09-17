import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

let sandbox: string;
let previousOverride: string | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let bridge: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let configStore: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let configCenter: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pluginSpecModule: any;
let specPath: string;

before(() => {
  sandbox = mkdtempSync(join(tmpdir(), 'cc-bridge-'));
  previousOverride = process.env.AGENT_PLUGINS_CACHE_DIR;
  process.env.AGENT_PLUGINS_CACHE_DIR = join(sandbox, 'cache', 'agent-plugins');
  // No browser, short server session: a missing-config run must open the form,
  // fail to save, and fail fast instead of hanging the runner.
  process.env.CC_UI_NO_OPEN = '1';
  process.env.CC_UI_TIMEOUT_MS = '20';
  process.env.AGENT_PLUGINS_UI_TIMEOUT_MS = '20';
  bridge = require('./bridge.ts');
  configStore = require('./config-store.ts');
  configCenter = require('./config-center.ts');
  pluginSpecModule = require('./plugin-spec.ts');

  // A spec file the same way a skill would ship one: plain data naming the
  // storage directory, the form, the command and the variable mapping.
  specPath = join(sandbox, 'fake.spec.json');
  writeFileSync(
    specPath,
    JSON.stringify({
      plugin: 'fake-cli',
      reason: 'test spec',
      command: 'node',
      env: { FAKE_URL: 'url', FAKE_TOKEN: 'token' },
      requiredKeys: ['url'],
      requiredAny: [['token']],
      form: {
        root: 'page',
        elements: {
          page: { type: 'Header', props: { title: 't', description: null, configPath: null } },
        },
      },
    }),
    'utf-8',
  );
});

after(() => {
  if (previousOverride === undefined) delete process.env.AGENT_PLUGINS_CACHE_DIR;
  else process.env.AGENT_PLUGINS_CACHE_DIR = previousOverride;
  delete process.env.CC_UI_NO_OPEN;
  delete process.env.CC_UI_TIMEOUT_MS;
  delete process.env.AGENT_PLUGINS_UI_TIMEOUT_MS;
  rmSync(sandbox, { recursive: true, force: true });
});

function mockOutput() {
  const captured = { stdout: '', stderr: '' };
  return {
    captured,
    output: {
      stdout: (s: string) => { captured.stdout += s; },
      stderr: (s: string) => { captured.stderr += s; },
    },
  };
}

function loadSpec(): any {
  return bridge;
}

function specFromLoader(): any {
  // loadPluginSpec is exercised through the CLI tests below; these unit tests
  // use the parsed object directly.
  return JSON.parse(require('fs').readFileSync(specPath, 'utf-8'));
}

test('loadPluginSpec accepts a valid spec and names its source', () => {
  const pluginSpec = pluginSpecModule.loadPluginSpec(specPath);
  assert.equal(pluginSpec.plugin, 'fake-cli');
  assert.equal(pluginSpec.command, 'node');
  assert.equal(pluginSpec.sourcePath, specPath);
});

test('loadPluginSpec rejects a spec with a bad storage name or missing form', () => {
  const badPath = join(sandbox, 'bad.spec.json');
  writeFileSync(badPath, JSON.stringify({ plugin: '../escape', form: {} }), 'utf-8');
  assert.throws(() => pluginSpecModule.loadPluginSpec(badPath), (err: Error) => {
    assert.match(err.message, /may only contain letters/);
    return true;
  });

  const noFormPath = join(sandbox, 'noform.spec.json');
  writeFileSync(noFormPath, JSON.stringify({ plugin: 'x' }), 'utf-8');
  assert.throws(() => pluginSpecModule.loadPluginSpec(noFormPath), (err: Error) => {
    assert.match(err.message, /"form" must be the config form spec/);
    return true;
  });
});

test('checkEnvReadiness reports every gap, including the any-of group', () => {
  const spec = specFromLoader();
  assert.deepEqual(bridge.checkEnvReadiness(spec, null), ['url', 'token']);
  assert.deepEqual(
    bridge.checkEnvReadiness(spec, { url: 'https://x.example', token: '' }),
    ['token'],
  );
  assert.deepEqual(
    bridge.checkEnvReadiness(spec, { url: 'https://x.example', token: 'tok' }),
    [],
  );
});

test('envForConfig maps only the declared, non-empty keys', () => {
  const spec = specFromLoader();
  assert.deepEqual(
    bridge.envForConfig(spec, { url: 'https://x.example', token: 'tok', extra: 'ignored' }),
    { FAKE_URL: 'https://x.example', FAKE_TOKEN: 'tok' },
  );
  assert.deepEqual(bridge.envForConfig(spec, { url: 'https://x.example', token: '   ' }), {
    FAKE_URL: 'https://x.example',
  });
});

test('runWithEnv injects the variables into the child process', async () => {
  await configStore.saveConfig('fake-cli', {
    url: 'https://x.example',
    token: 'tok-123456',
  });

  const pluginSpec = pluginSpecModule.loadPluginSpec(specPath);
  const { exitCode } = await bridge.runWithEnv(pluginSpec, {
    args: [
      '-e',
      'process.exit(process.env.FAKE_URL === "https://x.example" && process.env.FAKE_TOKEN === "tok-123456" ? 0 : 2)',
    ],
    baseEnv: { PATH: process.env.PATH },
  });
  assert.equal(exitCode, 0);
});

test('runWithEnv surfaces the child exit code through ChildExitError', async () => {
  const pluginSpec = pluginSpecModule.loadPluginSpec(specPath);
  await assert.rejects(
    bridge.runWithEnv(pluginSpec, {
      args: ['-e', 'process.exit(3)'],
      baseEnv: { PATH: process.env.PATH },
    }),
    (err: Error) => {
      assert.ok(err instanceof bridge.ChildExitError);
      assert.equal((err as any).exitCode, 3);
      return true;
    },
  );
});

test('runWithEnv refuses a spec without a command before touching the config', async () => {
  const commandLess = pluginSpecModule.loadPluginSpec(specPath);
  delete commandLess.command;
  await assert.rejects(
    bridge.runWithEnv(commandLess, { baseEnv: { PATH: process.env.PATH } }),
    (err: Error) => {
      assert.match(err.message, /no "command"/);
      return true;
    },
  );
});

test('runWithEnv opens the form when nothing is stored, then fails without a save', async () => {
  rmSync(configStore.configDir('fake-cli'), { recursive: true, force: true });
  const pluginSpec = pluginSpecModule.loadPluginSpec(specPath);
  await assert.rejects(
    bridge.runWithEnv(pluginSpec, {
      args: ['-e', 'process.exit(0)'],
      baseEnv: { PATH: process.env.PATH },
    }),
    (err: Error) => {
      assert.match(err.message, /No configuration was saved/);
      assert.match(err.message, /config-center edit --spec/);
      return true;
    },
  );
});

test('run <plugin> checks that the spec file and the plugin name agree', async () => {
  const { captured, output } = mockOutput();
  const code = await configCenter.main(['run', '--spec', specPath, 'other-cli'], output);
  assert.equal(code, 1);
  assert.match(captured.stderr, /does not match the plugin named on the command line/);
});

test('run <plugin> opens the form on first use and reports the missing save', async () => {
  rmSync(configStore.configDir('fake-cli'), { recursive: true, force: true });
  const { captured, output } = mockOutput();
  const code = await configCenter.main(
    ['run', '--spec', specPath, 'fake-cli', '-e', 'process.exit(0)'],
    output,
  );
  assert.equal(code, 1);
  // The form was offered (its URL went to stderr) before the run gave up.
  assert.match(captured.stderr, /Open the config UI at: http:\/\/localhost:\d+/);
  assert.match(captured.stderr, /No configuration was saved/);
  // No credential value can appear because nothing was stored yet.
  assert.equal(captured.stdout, '');
});

test('form <plugin> opens the spec form and reports an unsaved session', async () => {
  rmSync(configStore.configDir('fake-cli'), { recursive: true, force: true });
  mkdirSync(configStore.configDir('fake-cli'), { recursive: true });
  const { captured, output } = mockOutput();
  const code = await configCenter.main(['form', '--spec', specPath, 'fake-cli'], output);
  assert.equal(code, 0);
  assert.match(captured.stderr, /Open the config UI at: http:\/\/localhost:\d+/);
  assert.match(captured.stderr, /Nothing was saved/);
});
