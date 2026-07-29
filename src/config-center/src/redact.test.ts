import { test } from 'node:test';
import assert from 'node:assert/strict';
import { redact, redactEntry } from './redact.ts';

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
