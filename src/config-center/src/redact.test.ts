import { test } from 'node:test';
import assert from 'node:assert/strict';
import { redact, redactEntry, redactStructure } from './redact.ts';

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

test('redactEntry formats KEY=value', () => {
  assert.equal(redactEntry('TEMU_APPKEY', 'temukey1234567'), 'TEMU_APPKEY=te•••••••••567');
});

test('redactStructure flattens nested objects to dotted paths', () => {
  const lines = redactStructure('connections', {
    local: { host: '127.0.0.1', password: 'super-secret-phrase' },
  });
  assert.deepEqual(lines, [
    'connections.local.host=12••••0.1',
    'connections.local.password=su••••••••••••••ase',
  ]);
});

test('redactStructure summarizes containers beyond the depth cap and empties', () => {
  const deep = { a: { b: { c: { d: 'x'.repeat(20) } } } };
  assert.deepEqual(redactStructure('root', deep), [
    'root.a.b=<object: 1 key>',
  ]);
  assert.deepEqual(redactStructure('empty', {}), ['empty=<object: 0 keys>']);
  assert.deepEqual(redactStructure('items', []), ['items=<array: 0 items>']);
  assert.deepEqual(
    redactStructure('tags', ['alpha-one-two-three', 'beta']),
    ['tags[0]=al••••••••••••••ree', 'tags[1]=••••'],
  );
});

test('redactStructure keeps absent markers and scalars intact', () => {
  assert.deepEqual(redactStructure('gone', undefined), ['gone=<not set>']);
  assert.deepEqual(redactStructure('nul', null), ['nul=<not set>']);
  assert.deepEqual(redactStructure('flag', true), ['flag=true']);
});
