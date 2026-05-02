import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  addMemory,
  auditNotebook,
  contextNotebook,
  deleteMemories,
  initNotebook,
  insightsNotebook,
  promoteMemory,
  resolveNotebookPaths,
  resummarizeNotebook,
  searchNotebook,
} from './notebook.js';

async function tempRoot(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'notebook-test-'));
}

async function cleanup(path: string): Promise<void> {
  await rm(path, { recursive: true, force: true });
}

test('init creates global and project notebook layout', async () => {
  const root = await tempRoot();
  try {
    const globalRoot = join(root, 'global');
    const projectRoot = join(root, 'repo');
    await initNotebook({ scope: 'both', globalRoot, projectRoot });

    const paths = resolveNotebookPaths({ globalRoot, projectRoot });
    assert.match(await readFile(paths.global.bootstrap, 'utf8'), /Notebook Bootstrap/);
    assert.match(await readFile(paths.global.index, 'utf8'), /Notebook Index/);
    assert.match(await readFile(paths.project.bootstrap, 'utf8'), /Notebook Bootstrap/);
    assert.match(await readFile(paths.project.index, 'utf8'), /Notebook Index/);
  } finally {
    await cleanup(root);
  }
});

test('add writes a topic, index entry, and ledger entry', async () => {
  const root = await tempRoot();
  try {
    const globalRoot = join(root, 'global');
    await initNotebook({ scope: 'global', globalRoot });

    const result = await addMemory({
      scope: 'global',
      globalRoot,
      type: 'style',
      title: 'Terse final responses',
      content: 'Prefer concise final responses after engineering tasks.',
      confidence: 'high',
      sensitivity: 'internal',
      source: 'user-confirmed',
    });

    assert.equal(result.created, true);
    assert.match(result.path, /style-terse-final-responses\.md$/);
    assert.match(await readFile(result.path, 'utf8'), /## Why/);
    assert.match(await readFile(result.path, 'utf8'), /Prefer concise final responses/);
    assert.match(await readFile(join(globalRoot, 'index.md'), 'utf8'), /Terse final responses/);
    assert.match(await readFile(join(globalRoot, 'ledger.md'), 'utf8'), /add/);
  } finally {
    await cleanup(root);
  }
});

test('add rejects invalid runtime enum values', async () => {
  const root = await tempRoot();
  try {
    const globalRoot = join(root, 'global');
    await initNotebook({ scope: 'global', globalRoot });

    await assert.rejects(
      addMemory({
        scope: 'global',
        globalRoot,
        type: 'unknown' as never,
        title: 'Bad type',
        content: 'Invalid runtime values should fail before writing.',
      }),
      /--type must be one of/,
    );
  } finally {
    await cleanup(root);
  }
});

test('context injects bootstrap and query-matched topic with budget limits', async () => {
  const root = await tempRoot();
  try {
    const globalRoot = join(root, 'global');
    const projectRoot = join(root, 'repo');
    await initNotebook({ scope: 'both', globalRoot, projectRoot });
    await writeFile(join(globalRoot, 'bootstrap.md'), '# Notebook Bootstrap\n\n- Global rule\n');
    await writeFile(join(projectRoot, '.notebook', 'bootstrap.md'), '# Notebook Bootstrap\n\n- Project rule\n');
    await addMemory({
      scope: 'project',
      globalRoot,
      projectRoot,
      type: 'mistake',
      title: 'OAuth callback leak',
      content: 'Shared test context leaked configured callback URLs.',
      confidence: 'high',
      sensitivity: 'redacted',
    });

    const bootstrapOnly = await contextNotebook({
      scope: 'both',
      globalRoot,
      projectRoot,
      bootstrapOnly: true,
      budget: 1000,
      format: 'text',
    });
    assert.match(bootstrapOnly.text, /Global rule/);
    assert.match(bootstrapOnly.text, /Project rule/);
    assert.doesNotMatch(bootstrapOnly.text, /OAuth callback leak/);

    const withTopic = await contextNotebook({
      scope: 'project',
      globalRoot,
      projectRoot,
      query: 'callback',
      budget: 4000,
      format: 'text',
    });
    assert.match(withTopic.text, /OAuth callback leak/);
    assert.match(withTopic.text, /Shared test context/);
  } finally {
    await cleanup(root);
  }
});

test('search and delete operate on topic files with preview by default', async () => {
  const root = await tempRoot();
  try {
    const globalRoot = join(root, 'global');
    await initNotebook({ scope: 'global', globalRoot });
    const added = await addMemory({
      scope: 'global',
      globalRoot,
      type: 'rule',
      title: 'Discuss security changes first',
      content: 'Discuss security sensitive config changes before editing.',
      confidence: 'high',
      sensitivity: 'internal',
    });

    const found = await searchNotebook({ scope: 'global', globalRoot, query: 'security' });
    assert.equal(found.matches.length, 1);
    assert.equal(found.matches[0]?.path, added.path);

    const preview = await deleteMemories({ scope: 'global', globalRoot, query: 'security', yes: false });
    assert.equal(preview.deleted.length, 0);
    assert.equal(preview.matches.length, 1);

    const deleted = await deleteMemories({ scope: 'global', globalRoot, query: 'security', yes: true });
    assert.equal(deleted.deleted.length, 1);

    const after = await searchNotebook({ scope: 'global', globalRoot, query: 'security' });
    assert.equal(after.matches.length, 0);
  } finally {
    await cleanup(root);
  }
});

test('promote previews by default and writes bootstrap with --yes semantics', async () => {
  const root = await tempRoot();
  try {
    const projectRoot = join(root, 'repo');
    await initNotebook({ scope: 'project', projectRoot });
    await addMemory({
      scope: 'project',
      projectRoot,
      type: 'rule',
      title: 'Keep notebook local',
      content: 'Keep personal notebook entries local and promote team rules to AGENTS.md.',
      confidence: 'high',
      sensitivity: 'internal',
    });

    const preview = await promoteMemory({ scope: 'project', projectRoot, query: 'local', yes: false });
    assert.equal(preview.promoted, false);
    assert.match(preview.candidate, /Keep notebook local/);

    const promoted = await promoteMemory({ scope: 'project', projectRoot, query: 'local', yes: true });
    assert.equal(promoted.promoted, true);
    assert.match(await readFile(join(projectRoot, '.notebook', 'bootstrap.md'), 'utf8'), /Keep notebook local/);
  } finally {
    await cleanup(root);
  }
});

test('audit reports missing sections and oversized index files', async () => {
  const root = await tempRoot();
  try {
    const globalRoot = join(root, 'global');
    await initNotebook({ scope: 'global', globalRoot });
    await writeFile(join(globalRoot, 'topics', 'rule-bad.md'), '---\ntitle: Bad\ntype: rule\n---\n\nNo sections\n');
    await writeFile(join(globalRoot, 'index.md'), `${'# Notebook Index\n\n'}${'- x\n'.repeat(205)}`);

    const audit = await auditNotebook({ scope: 'global', globalRoot });
    assert.ok(audit.issues.some(issue => issue.code === 'index_too_long'));
    assert.ok(audit.issues.some(issue => issue.code === 'topic_missing_section'));
  } finally {
    await cleanup(root);
  }
});

test('insights and resummarize use indexed transcript sources without copying raw sessions', async () => {
  const root = await tempRoot();
  try {
    const projectRoot = join(root, 'repo');
    await initNotebook({ scope: 'project', projectRoot });
    const transcript = join(root, 'session.jsonl');
    await writeFile(
      transcript,
      [
        JSON.stringify({ type: 'user', message: { content: 'Please remember to run tests before final answers.' }, timestamp: '2026-05-02T10:00:00.000Z' }),
        JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'I will do that.' }] }, timestamp: '2026-05-02T10:01:00.000Z' }),
        JSON.stringify({ type: 'user', message: { content: 'That was wrong, you skipped the verification command.' }, timestamp: '2026-05-02T10:02:00.000Z' }),
      ].join('\n'),
    );
    await writeFile(join(projectRoot, '.notebook', 'sources.md'), `# Notebook Sources\n\n- Platform: claude-code\n- Transcript: ${transcript}\n`);

    const insights = await insightsNotebook({ scope: 'project', projectRoot, since: '30d' });
    assert.ok(insights.memoryCandidates.some(candidate => /run tests/i.test(candidate)));
    assert.ok(insights.frictionCandidates.some(candidate => /skipped the verification/i.test(candidate)));

    const resummary = await resummarizeNotebook({ scope: 'project', projectRoot, query: 'verification' });
    assert.match(resummary.text, /verification command/);
  } finally {
    await cleanup(root);
  }
});
