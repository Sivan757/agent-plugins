import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { openConfigUI, reconfigure, summarizeConfig } from './config-flow.ts';
import type { ConfigSpec } from './launch-ui.ts';

// Redirect the cache so a launch can never render the operator's real config.
// Restored afterwards: an env var left set leaks into the next test file.
const ENV = 'AGENT_PLUGINS_CACHE_DIR';
const sandbox = mkdtempSync(join(tmpdir(), 'config-flow-test-'));
const inherited = process.env[ENV];

before(() => {
  process.env[ENV] = sandbox;
});

after(() => {
  if (inherited === undefined) delete process.env[ENV];
  else process.env[ENV] = inherited;
  rmSync(sandbox, { recursive: true, force: true });
});

const collect = (stderr: string[]): { stderr: (s: string) => void; stdout: (s: string) => void } => ({
  stderr: (s: string) => void stderr.push(s),
  stdout: () => {},
});

// ── Reading a configuration back ────────────────────────────────────────────

/** A spec shaped like the ones plugins pass in. */
function specOf(fields: Record<string, { type: string; statePath?: string }>): ConfigSpec {
  return {
    root: 'page',
    elements: {
      ...Object.fromEntries(
        Object.entries(fields).map(([id, field]) => [
          id,
          { type: 'Field', props: { ...field, statePath: field.statePath ?? id } },
        ]),
      ),
    },
  } as unknown as ConfigSpec;
}

test('summarizeConfig masks a field the form declares as a password', () => {
  const secret = 'hunter2-hunter2';
  const lines = summarizeConfig(
    { username: 'someone', password: secret },
    { spec: specOf({ username: { type: 'text' }, password: { type: 'password' } }) },
  ).join('\n');

  assert.match(lines, /^username=someone$/m);
  assert.equal(lines.includes(secret), false);
  // Masked whole: the form itself obscures this one, so no characters survive.
  assert.match(lines, /^password=•+ {2}len=15$/m);
  assert.equal(lines.includes('hu'), false);
});

test('summarizeConfig shows fields the form declares as ordinary inputs', () => {
  const lines = summarizeConfig(
    {
      region: 'cn-north-4',
      authType: 'aksk',
      insecure: false,
      authProjectId: '8005a922dbd8456b8251af474b125d32',
    },
    {
      spec: specOf({
        region: { type: 'text' },
        authType: { type: 'select' },
        insecure: { type: 'checkbox' },
        authProjectId: { type: 'text' },
      }),
    },
  ).join('\n');

  // A field the form renders in the clear is not a secret, so it stays useful -
  // this is what keeps `authType` and the routing values readable.
  assert.match(lines, /^region=cn-north-4$/m);
  assert.match(lines, /^authType=aksk$/m);
  assert.match(lines, /^insecure=false$/m);
  assert.match(lines, /^authProjectId=8005a922dbd8456b8251af474b125d32$/m);
});

test('summarizeConfig masks a value the form says nothing about', () => {
  // The property that keeps this safe: ticktick stores a session token and a
  // client secret that its form never declares. Not being in the spec is never
  // a reason to print.
  const lines = summarizeConfig(
    {
      host: 'api.ticktick.com',
      password: 'EXAMPLE-PASSWORD-01',
      accessToken: 'EXAMPLE-ACCESS-TOKEN-1',
      clientSecret: 'EXAMPLE-CLIENT-SECRET-1',
    },
    { spec: specOf({ host: { type: 'text' }, password: { type: 'password' } }) },
  ).join('\n');

  assert.match(lines, /^host=api\.ticktick\.com$/m);
  for (const undeclared of ['EXAMPLE-ACCESS-TOKEN-1', 'EXAMPLE-CLIENT-SECRET-1']) {
    assert.equal(lines.includes(undeclared), false, `leaked ${undeclared}`);
  }
  assert.match(lines, /^accessToken=•+ {2}len=22$/m);
  assert.match(lines, /^clientSecret=•+ {2}len=23$/m);
});

test('summarizeConfig masks everything when no spec is given', () => {
  const lines = summarizeConfig({ region: 'cn-north-4', password: 'EXAMPLE-PASSWORD-01' }).join('\n');
  assert.equal(lines.includes('cn-north-4'), false);
  assert.match(lines, /^region=•+ {2}len=10$/m);
});

test('summarizeConfig resolves collection item fields by name', () => {
  // mysql and postgresql declare `host`/`password` relative to the connection
  // item, so the same field name appears under every connection.
  const lines = summarizeConfig(
    {
      connections: {
        local: { host: '127.0.0.1', port: 5432, user: 'postgres', password: 'local-secret' },
        prod: { host: 'db.internal', port: 5432, user: 'app', password: 'prod-secret' },
      },
    },
    {
      spec: specOf({
        host: { type: 'text', statePath: 'host' },
        port: { type: 'number', statePath: 'port' },
        user: { type: 'text', statePath: 'user' },
        password: { type: 'password', statePath: 'password' },
      }),
    },
  ).join('\n');

  assert.match(lines, /^connections\.local\.host=127\.0\.0\.1$/m);
  assert.match(lines, /^connections\.prod\.user=app$/m);
  assert.match(lines, /^connections\.local\.port=5432$/m);
  for (const leaked of ['local-secret', 'prod-secret']) {
    assert.equal(lines.includes(leaked), false, `leaked ${leaked}`);
  }
});

test('summarizeConfig falls back to the spec-declared path for nested fields', () => {
  const secret = 'EXAMPLE-SLS-SECRET-1';
  const lines = summarizeConfig(
    { credentials: { accessKeyId: 'EXAMPLEKEY0000000001', accessKeySecret: secret, endpoint: 'sls.example.com' } },
    {
      spec: specOf({
        id: { type: 'text', statePath: '/credentials/accessKeyId' },
        secret: { type: 'password', statePath: '/credentials/accessKeySecret' },
        endpoint: { type: 'text', statePath: '/credentials/endpoint' },
      }),
    },
  ).join('\n');

  assert.match(lines, /^credentials\.accessKeyId=EXAMPLEKEY0000000001$/m);
  assert.match(lines, /^credentials\.endpoint=sls\.example\.com$/m);
  assert.equal(lines.includes(secret), false);
  assert.match(lines, new RegExp(`^credentials\\.accessKeySecret=•+ {2}len=${secret.length}$`, 'm'));
});

test('summarizeConfig summarizes deep containers and keeps non-secret types', () => {
  assert.equal(
    summarizeConfig({ a: { b: { c: { d: { e: 'x' } } } } }).join('\n'),
    'a.b.c.d=<object: 1 key>',
  );

  assert.deepEqual(summarizeConfig({}), ['<empty configuration>']);
  assert.deepEqual(summarizeConfig({ empty: {} }), ['empty=<object: 0 keys>']);
  assert.deepEqual(summarizeConfig({ tags: [] }), ['tags=<array: 0 items>']);
  assert.deepEqual(summarizeConfig({ gone: undefined }), ['gone=<not set>']);
  // A number or a toggle cannot carry a credential, so the type - not a field
  // list - is what keeps them readable.
  assert.deepEqual(summarizeConfig({ ssl: false, port: 3306 }), ['ssl=false', 'port=3306']);
});

// ── Opening the form ────────────────────────────────────────────────────────

test('openConfigUI serves the form, prints why, and reports an abandoned session', async () => {
  const stderr: string[] = [];
  const result = await openConfigUI('flow-view', {
    output: collect(stderr),
    open: false,
    timeoutMs: 40,
    intent: 'view',
    reason: 'The gateway address is not configured yet.',
  });

  assert.equal(result.opened, true);
  assert.match(result.url, /^http:\/\/localhost:\d+$/);
  assert.equal(result.saved, false, 'a timed-out session is not a save');

  const log = stderr.join('');
  assert.match(log, /\[flow-view\] Opening the configuration form\./);
  assert.match(log, /The gateway address is not configured yet\./);
  assert.match(log, /Saving is optional here/);
});

test('openConfigUI words the create and edit intents differently', async () => {
  for (const [intent, expected] of [
    ['create', /No configuration yet — opening the configuration form\./],
    ['edit', /Opening the configuration form to change the configuration\./],
  ] as const) {
    const stderr: string[] = [];
    await openConfigUI(`flow-${intent}`, { output: collect(stderr), open: false, timeoutMs: 30, intent });
    assert.match(stderr.join(''), expected);
    assert.equal(
      stderr.join('').includes('Saving is optional'),
      false,
      'only a view session softens the save requirement',
    );
  }
});

test('openConfigUI defaults to the edit intent', async () => {
  const stderr: string[] = [];
  await openConfigUI('flow-default', { output: collect(stderr), open: false, timeoutMs: 30 });
  assert.match(stderr.join(''), /to change the configuration/);
});

test('reconfigure returns null when the user does not save', async () => {
  const reloaded = await reconfigure('flow-unsaved', { output: collect([]), open: false, timeoutMs: 30 }, 'nothing stored');
  assert.equal(reloaded, null);
});
