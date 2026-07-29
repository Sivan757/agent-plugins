import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pf: any;

const originalHome = process.env.HOME;
let tmpHome: string;
let tmpDataDir: string;

before(async () => {
  // Set HOME before importing the module so config-center's artifactsDir
  // resolves to a temp directory. config-store.ts captures HOME at module
  // load time, so the dynamic import must be the first time the module loads.
  tmpHome = mkdtempSync(join(tmpdir(), 'pf-test-'));
  process.env.HOME = tmpHome;

  // Create a tiny fixture data dir so `pf init` seeds from a small known
  // corpus instead of the full 4.3MB bundled data.
  tmpDataDir = mkdtempSync(join(tmpdir(), 'pf-data-'));
  const fixture = [
    JSON.stringify({
      title: 'Flat lay cosmetics',
      category: 'Product & E-commerce',
      prompt_text: 'Overhead flat lay of cosmetics on marble, studio lighting, no text',
      source_type: 'test',
      source_url: 'https://example.test/1',
    }),
    JSON.stringify({
      title: 'Fashion editorial portrait',
      category: 'Photography',
      prompt_text: 'Fashion editorial portrait, East Asian woman, silk shirt, cinematic',
      source_type: 'test',
      source_url: 'https://example.test/2',
    }),
    JSON.stringify({
      title: 'Duplicate flat lay',
      category: 'Product & E-commerce',
      prompt_text: 'Overhead flat lay of cosmetics on marble, studio lighting, no text',
      source_type: 'test',
      source_url: 'https://example.test/3',
    }),
  ].join('\n');
  writeFileSync(join(tmpDataDir, 'fixture.jsonl'), fixture, 'utf-8');

  // Override the data dir for the CLI.
  process.env.PF_DATA_DIR = tmpDataDir;

  // Dynamic import so config-store captures the temp HOME.
  pf = await import('./prompt-forge.ts');
});

after(() => {
  process.env.HOME = originalHome;
  delete process.env.PF_DATA_DIR;
  rmSync(tmpHome, { recursive: true, force: true });
  rmSync(tmpDataDir, { recursive: true, force: true });
});

interface Captured {
  stdout: string;
  stderr: string;
}

function mockOutput(): { output: pf.CLIOutput; captured: Captured } {
  const captured = { stdout: '', stderr: '' };
  return {
    captured,
    output: {
      stdout: (s: string) => { captured.stdout += s; },
      stderr: (s: string) => { captured.stderr += s; },
    },
  };
}

async function runMain(argv: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  const mock = mockOutput();
  const code = await pf.main(argv, mock.output);
  return { code, stdout: mock.captured.stdout, stderr: mock.captured.stderr };
}

test('pf init creates and seeds the database from fixture data', async () => {
  const { code, stdout } = await runMain(['init']);
  assert.equal(code, 0);
  // 3 records in fixture, 1 is a duplicate -> 2 imported.
  assert.match(stdout, /Initialized prompt-forge: 2 prompts imported/);
  // The DB file should exist in the artifacts dir.
  const dbPath = join(tmpHome, '.cache', 'agent-plugins', 'prompt-forge', 'artifacts', 'prompts.db');
  assert.ok(existsSync(dbPath), 'database file was not created');
});

test('pf prompt list returns seeded rows', async () => {
  const { code, stdout } = await runMain(['prompt', 'list', '--limit', '10']);
  assert.equal(code, 0);
  assert.ok(stdout.includes('Flat lay cosmetics'), `expected title in output: ${stdout}`);
  assert.ok(stdout.includes('Fashion editorial portrait'), `expected title in output: ${stdout}`);
  assert.ok(stdout.includes('2 total prompts'), `expected total in output: ${stdout}`);
});

test('pf prompt list --category filters by category', async () => {
  const { code, stdout } = await runMain([
    'prompt', 'list', '--category', 'Photography', '--limit', '10',
  ]);
  assert.equal(code, 0);
  assert.ok(stdout.includes('Fashion editorial portrait'));
  assert.ok(!stdout.includes('Flat lay cosmetics'));
  // The total line always reports the overall DB count (matching pf.py),
  // not the filtered count.
  assert.match(stdout, /\d+ total prompts/);
});

test('pf prompt search finds matching prompts', async () => {
  const { code, stdout } = await runMain(['prompt', 'search', 'cosmetics']);
  assert.equal(code, 0);
  assert.ok(stdout.includes('Flat lay cosmetics'), `expected match in: ${stdout}`);
});

test('pf prompt search finds via prompt_text', async () => {
  const { code, stdout } = await runMain(['prompt', 'search', 'cinematic']);
  assert.equal(code, 0);
  assert.ok(stdout.includes('Fashion editorial portrait'), `expected match in: ${stdout}`);
});

test('pf prompt show displays prompt details', async () => {
  // First list to get an id prefix.
  const listMock = mockOutput();
  await pf.main(['prompt', 'list', '--limit', '1'], listMock.output);
  const idMatch = listMock.captured.stdout.match(/^(\S{8})\s/);
  assert.ok(idMatch, `could not extract id from list output: ${listMock.captured.stdout}`);
  const idPrefix = idMatch[1];

  const { code, stdout } = await runMain(['prompt', 'show', idPrefix]);
  assert.equal(code, 0);
  assert.ok(stdout.includes('title:'));
  assert.ok(stdout.includes('category:'));
  assert.ok(stdout.includes('prompt_text:'));
});

test('pf prompt show reports not found for unknown id', async () => {
  const { code, stdout } = await runMain(['prompt', 'show', 'nonexistent']);
  assert.equal(code, 0);
  assert.match(stdout, /not found/);
});

test('pf prompt add inserts a new prompt', async () => {
  const { code, stdout } = await runMain([
    'prompt', 'add',
    '--title', 'Test Prompt',
    '--category', 'Illustration & Art',
    '--text', 'A watercolor painting of a mountain lake at dawn',
  ]);
  assert.equal(code, 0);
  assert.match(stdout, /^Added: [0-9a-f]{16}$/m);
});

test('pf image rate rejects invalid scores', async () => {
  // Need a valid prompt id first.
  const listMock = mockOutput();
  await pf.main(['prompt', 'list', '--limit', '1'], listMock.output);
  const idMatch = listMock.captured.stdout.match(/^(\S{8})\s/);
  assert.ok(idMatch, 'could not extract id');
  const idPrefix = idMatch[1];

  const { code, stdout } = await runMain(['image', 'rate', idPrefix, '9']);
  assert.equal(code, 0);
  assert.match(stdout, /Score must be 1-5/);
});

test('pf image rate updates prompt rating for valid score', async () => {
  const listMock = mockOutput();
  await pf.main(['prompt', 'list', '--limit', '1'], listMock.output);
  const idMatch = listMock.captured.stdout.match(/^(\S{8})\s/);
  assert.ok(idMatch, 'could not extract id');
  const idPrefix = idMatch[1];

  const { code, stdout } = await runMain(['image', 'rate', idPrefix, '4']);
  assert.equal(code, 0);
  assert.match(stdout, /Rated:.*= 4\/5 \(avg: 4\.0\)/);
});

test('pf source dedup removes exact-text duplicates', async () => {
  // Add a duplicate via source import, then dedup.
  const dupFile = join(tmpDataDir, 'dedup-fixture.jsonl');
  writeFileSync(
    dupFile,
    JSON.stringify({
      title: 'Another dup',
      prompt_text: 'Overhead flat lay of cosmetics on marble, studio lighting, no text',
      category: 'Product & E-commerce',
      source_type: 'test',
    }) + '\n',
    'utf-8',
  );

  const importResult = await runMain(['source', 'import', dupFile]);
  assert.equal(importResult.code, 0);
  // The duplicate should be skipped by sha256 dedup during import.
  assert.match(importResult.stdout, /Imported: 0 prompts/);

  const { code, stdout } = await runMain(['source', 'dedup']);
  assert.equal(code, 0);
  assert.match(stdout, /Deduped:/);
});

test('pf main returns 1 on unknown command', async () => {
  const { code } = await runMain(['bogus']);
  assert.equal(code, 1);
});

test('pf output never leaks the cache path', async () => {
  const { stdout, stderr } = await runMain(['prompt', 'list', '--limit', '1']);
  assert.equal(stdout.includes('.cache/agent-plugins'), false, 'cache path leaked into stdout');
  assert.equal(stderr.includes('.cache/agent-plugins'), false, 'cache path leaked into stderr');
  assert.equal(stdout.includes(tmpHome), false, 'tmp HOME leaked into stdout');
});
