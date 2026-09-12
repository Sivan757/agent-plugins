import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  describeCharset,
  describeSecret,
  fingerprintAll,
  maskFully,
  fingerprintOf,
  redact,
  redactStructure,
} from './redact.ts';

test('redact masks middle of long values', () => {
  assert.equal(redact('abcdefghij'), 'ab•••••hij');
  assert.equal(redact('temu_secret_key'), 'te••••••••••key');
});

test('redact fully masks short values', () => {
  assert.equal(redact('abc'), '•••');
  assert.equal(redact('1234567'), '•••••••');
});

test('redact marks absent values', () => {
  assert.equal(redact(''), '<not set>');
  assert.equal(redact(undefined as unknown as string), '<not set>');
});

test('redactStructure flattens nested objects to dotted paths, masked whole', () => {
  const lines = redactStructure('connections', {
    local: { host: '127.0.0.1', password: 'super-secret-phrase' },
  });
  assert.deepEqual(lines, [
    'connections.local.host=•••••••••',
    'connections.local.password=•••••••••••••••••••',
  ]);
  // Nothing of either value survives: no prefix, no suffix.
  const joined = lines.join('');
  assert.equal(joined.includes('127'), false);
  assert.equal(joined.includes('secret'), false);
});

test('redactStructure summarizes containers beyond the depth cap and empties', () => {
  // Four containers deep is one past the cap; the field itself is not named.
  const deep = { a: { b: { c: { d: 'x'.repeat(20) } } } };
  assert.deepEqual(redactStructure('root', deep), [
    'root.a.b.c=<object: 1 key>',
  ]);
  assert.deepEqual(redactStructure('empty', {}), ['empty=<object: 0 keys>']);
  assert.deepEqual(redactStructure('items', []), ['items=<array: 0 items>']);
  assert.deepEqual(
    redactStructure('tags', ['alpha-one-two-three', 'beta']),
    [`tags[0]=${maskFully('alpha-one-two-three')}`, `tags[1]=${maskFully('beta')}`],
  );
});

test('redactStructure keeps absent markers and scalars intact', () => {
  assert.deepEqual(redactStructure('gone', undefined), ['gone=<not set>']);
  assert.deepEqual(redactStructure('nul', null), ['nul=<not set>']);
  assert.deepEqual(redactStructure('flag', true), ['flag=true']);
});

test('redactStructure masks every string, whether or not it looks secret', () => {
  const lines = redactStructure('config', {
    region: 'cn-north-4',
    somethingUnremarkable: 'plain text',
  });
  assert.deepEqual(lines, [maskFully('cn-north-4'), maskFully('plain text')].map(
    (masked, index) => `${['config.region', 'config.somethingUnremarkable'][index]}=${masked}`,
  ));
  assert.equal(lines.some((line) => line.includes('cn-north-4')), false);
});

test('redactStructure reveals only the paths the caller vouches for', () => {
  const spelled = (path: string): boolean => path === 'config.region';
  const lines = redactStructure(
    'config',
    { region: 'cn-north-4', password: 'hunter2-hunter2' },
    { reveal: spelled },
  );
  assert.deepEqual(lines, ['config.region=cn-north-4', `config.password=${maskFully('hunter2-hunter2')}`]);
});

test('redactStructure can add each value length', () => {
  const region = 'cn-north-4';
  assert.deepEqual(redactStructure('region', region, { lengths: true }), [
    `region=${maskFully(region)}  len=${region.length}`,
  ]);
  // A value the caller vouches for is printed as-is, so a length would be noise.
  assert.deepEqual(redactStructure('region', region, { lengths: true, reveal: () => true }), [
    `region=${region}`,
  ]);
  // A number or a toggle carries no length: there is nothing to mask.
  assert.deepEqual(redactStructure('port', 5432, { lengths: true }), ['port=5432']);
  assert.deepEqual(redactStructure('gone', undefined, { lengths: true }), ['gone=<not set>']);
});

test('redactStructure honours the depth cap', () => {
  // Two levels of containers are kept by default, which is exactly enough for a
  // collection of objects (`connections.local.host`).
  const nested = { connections: { local: { host: 'localhost' } } };
  assert.deepEqual(redactStructure('config', nested), [
    `config.connections.local.host=${maskFully('localhost')}`,
  ]);

  // The default cap summarises anything deeper, and a lower cap summarises sooner.
  const deeper = { a: { b: { c: { d: 'x' } } } };
  assert.deepEqual(redactStructure('root', deeper), ['root.a.b.c=<object: 1 key>']);
  assert.deepEqual(redactStructure('root', deeper, { maxDepth: 1 }), ['root.a=<object: 1 key>']);
  assert.deepEqual(redactStructure('root', deeper, { maxDepth: 4 }), ['root.a.b.c.d=•']);
});

// ── Judge a secret without reading it ───────────────────────────────────────

const AK_SHAPE = { pattern: /^[A-Z0-9]{20}$/, description: '20 uppercase letters and digits' };

test('describeSecret judges a well-formed value without revealing it', () => {
  const report = describeSecret('EXAMPLEKEY0000000001', AK_SHAPE);
  assert.equal(report.shape, 'ok');
  assert.equal(report.length, 20);
  assert.equal(report.shapeHint, undefined);
});

test('describeSecret explains a mismatch instead of just failing', () => {
  const report = describeSecret('sk-live-not-a-huawei-key-000', AK_SHAPE);
  assert.equal(report.shape, 'unexpected');
  assert.match(report.shapeHint ?? '', /expected 20 uppercase letters and digits/);
  assert.match(report.shapeHint ?? '', /got base64-ish, 28 chars/);
});

test('describeSecret reports unset values', () => {
  assert.deepEqual(describeSecret(undefined), { length: null, shape: 'unset' });
  assert.deepEqual(describeSecret(''), { length: null, shape: 'unset' });
});

test('describeCharset names the classes a user would have to fix', () => {
  assert.equal(describeCharset('deadBEEF01'), 'hex');
  assert.equal(describeCharset('EXAMPLEKEY0000000001'), 'alphanumeric');
  assert.equal(describeCharset('https://iam.example.com'), 'url');
  assert.equal(describeCharset('has space in it'), 'contains whitespace');
  assert.equal(describeCharset('aGVsbG8+/d29ybGQ='), 'base64-ish');
  assert.equal(describeCharset('中文密钥'), 'mixed');
});

test('fingerprintOf is stable, one-way, and distinguishes values', () => {
  assert.equal(fingerprintOf('x'.repeat(20)), fingerprintOf('x'.repeat(20)));
  assert.notEqual(fingerprintOf('x'.repeat(20)), fingerprintOf('y'.repeat(20)));
  assert.equal(fingerprintOf('x'.repeat(20)).includes('x'), false);
});

test('fingerprintAll refuses combinations too short to be safe', () => {
  assert.equal(fingerprintAll([]), undefined);
  assert.equal(fingerprintAll([undefined, '  ']), undefined);
  assert.equal(fingerprintAll(['too-short']), undefined);
  // A short AK plus a long SK still has a guessable half, so no digest.
  assert.equal(fingerprintAll(['sh0rt', 'a'.repeat(40)]), undefined);
  assert.ok(fingerprintAll(['EXAMPLEKEY0000000001', 'a'.repeat(40)]));
});

test('fingerprintAll notices a single changed field', () => {
  const base = ['EXAMPLEKEY0000000001', 'sk-aaaaaaaaaaaaaaaaaaaa'];
  const changed = ['EXAMPLEKEY0000000001', 'sk-bbbbbbbbbbbbbbbbbbbb'];
  assert.equal(fingerprintAll(base), fingerprintAll([...base]));
  assert.notEqual(fingerprintAll(base), fingerprintAll(changed));
});
