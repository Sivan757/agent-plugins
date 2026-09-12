import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  assessCredentials,
  clearVerification,
  readVerification,
  recordVerification,
  verificationPath,
} from './verification.ts';

// Redirect the cache so these tests never touch the operator's real config.
// cacheRoot() re-reads the variable on every call, so setting it in a hook is
// enough — but it must be unset again, or the next test file inherits it.
const ENV = 'AGENT_PLUGINS_CACHE_DIR';
const sandbox = mkdtempSync(join(tmpdir(), 'verification-test-'));
const inherited = process.env[ENV];

before(() => {
  process.env[ENV] = sandbox;
});

after(() => {
  if (inherited === undefined) delete process.env[ENV];
  else process.env[ENV] = inherited;
  rmSync(sandbox, { recursive: true, force: true });
});

const AK = 'EXAMPLEKEY0000000001';
const SK = 'sk-aaaaaaaaaaaaaaaaaaaaaaaa';

test('an unverified plugin says so instead of blaming the key', () => {
  const assessment = assessCredentials('checks-unverified', [AK, SK]);
  assert.equal(assessment.verification, null);
  assert.equal(assessment.changedSinceVerification, false);
  assert.match(assessment.summary, /have not been used successfully yet/);
  assert.match(assessment.fingerprint ?? '', /^[0-9a-f]{10}$/);
});

test('a recorded success is reported back without exposing the secret', async () => {
  await recordVerification('checks-ok', {
    endpoint: 'https://example.invalid',
    authType: 'aksk',
    fingerprint: assessCredentials('checks-ok', [AK, SK]).fingerprint,
  });

  const stored = await readVerification('checks-ok');
  assert.ok(stored);
  assert.equal(stored.endpoint, 'https://example.invalid');
  assert.equal(JSON.stringify(stored).includes(SK), false);

  const assessment = assessCredentials('checks-ok', [AK, SK]);
  assert.equal(assessment.changedSinceVerification, false);
  assert.match(assessment.summary, /same credentials worked/);
  assert.match(assessment.summary, /so the key itself is unlikely to be the problem/);
});

test('swapped credentials are detected, which points at the key', async () => {
  await recordVerification('checks-swapped', {
    fingerprint: assessCredentials('checks-swapped', [AK, SK]).fingerprint,
  });

  const assessment = assessCredentials('checks-swapped', [AK, 'sk-bbbbbbbbbbbbbbbbbbbbbbbb']);
  assert.equal(assessment.changedSinceVerification, true);
  assert.match(assessment.summary, /have changed since they last worked/);
  assert.match(assessment.summary, /a wrong or mis-pasted key is the first thing to check/);
});

test('without a digest it reports the last success without judging the key', async () => {
  await recordVerification('checks-nodigest', { verifiedAt: '2021-06-01T12:00:00.000Z' });
  const assessment = assessCredentials('checks-nodigest', ['0123456789'], new Date('2021-06-01T12:02:00.000Z'));
  assert.equal(assessment.changedSinceVerification, false);
  assert.equal(assessment.fingerprint, undefined);
  assert.equal(assessment.summary, 'The last authenticated call succeeded 2 minutes ago.');
  assert.equal(/key/.test(assessment.summary), false, 'must not guess about the key');
});

test('a record keeps the timestamp it was given', async () => {
  await recordVerification('checks-timed', { verifiedAt: '2020-01-01T00:00:00.000Z' });
  assert.equal((await readVerification('checks-timed'))?.verifiedAt, '2020-01-01T00:00:00.000Z');

  const soon = assessCredentials('checks-timed', [AK, SK], new Date('2020-01-01T00:10:00.000Z'));
  assert.match(soon.summary, /10 minutes ago/);

  const later = assessCredentials('checks-timed', [AK, SK], new Date('2020-01-04T00:00:00.000Z'));
  assert.match(later.summary, /3 days ago/);
});

test('unhashable credentials never claim a change', async () => {
  await recordVerification('checks-short', {});
  const assessment = assessCredentials('checks-short', ['tiny']);
  assert.equal(assessment.fingerprint, undefined);
  assert.equal(assessment.changedSinceVerification, false);
});

test('a corrupt record degrades to "not verified" rather than throwing', async () => {
  mkdirSync(join(sandbox, 'checks-corrupt'), { recursive: true });
  writeFileSync(verificationPath('checks-corrupt'), '{ not json', 'utf-8');
  assert.equal(await readVerification('checks-corrupt'), null);
  assert.match(
    assessCredentials('checks-corrupt', [AK, SK]).summary,
    /not been used successfully yet/,
  );
});

test('clearing removes the record', async () => {
  await recordVerification('checks-cleared', {});
  assert.ok(await readVerification('checks-cleared'));
  await clearVerification('checks-cleared');
  assert.equal(await readVerification('checks-cleared'), null);
});
