#!/usr/bin/env node
/**
 * prompt-forge CLI entry point.
 *
 * Image-generation prompt library backed by a local SQLite database.
 * Uses node:sqlite (Node 22+ built-in) so the bundled .mjs runs standalone
 * with no native addons. The DB lives under the agent-plugins cache artifacts
 * directory for prompt-forge; run `pf init` to create and seed it.
 */

import { Command, CommanderError } from 'commander';
import { DatabaseSync } from 'node:sqlite';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { mkdirSync, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { artifactsDir } from '@agent-plugins/config-center';
import { SCHEMA_SQL } from './schema.js';

export interface CLIOutput {
  stdout: (s: string) => void;
  stderr: (s: string) => void;
}

const defaultOutput: CLIOutput = {
  stdout: (s: string) => process.stdout.write(s),
  stderr: (s: string) => process.stderr.write(s),
};

/**
 * Resolve the seed-data directory.
 *
 * - Bundled (.mjs at dist/prompt-forge.mjs): ../skills/prompt-forge/data/
 * - Dev (.ts at src/prompt-forge.ts):        ../skills/prompt-forge/data/
 *
 * PF_DATA_DIR overrides for tests.
 */
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.PF_DATA_DIR
  ? resolve(process.env.PF_DATA_DIR)
  : join(SCRIPT_DIR, '..', 'skills', 'prompt-forge', 'data');

function dbPath(): string {
  return join(artifactsDir('prompt-forge'), 'prompts.db');
}

function nowISO(): string {
  return new Date().toISOString().replace(/\.\d+Z$/, 'Z');
}

function openDB(): DatabaseSync {
  mkdirSync(artifactsDir('prompt-forge'), { recursive: true });
  const db = new DatabaseSync(dbPath());
  db.exec(SCHEMA_SQL);
  return db;
}

/** Rebuild the external-content FTS5 index from the prompts table. */
function rebuildFTS(db: DatabaseSync): void {
  try {
    db.exec("INSERT INTO prompts_fts(prompts_fts) VALUES('rebuild');");
  } catch {
    // FTS5 may be unavailable in some SQLite builds; non-fatal.
  }
}

function shortId(id: string): string {
  return id.slice(0, 8);
}

function pad(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length);
}

/**
 * Resolve a user-provided id (possibly a prefix) to a full prompt id.
 * Returns null if no prompt matches.
 */
function resolvePromptId(db: DatabaseSync, idOrPrefix: string): string | null {
  const row = db
    .prepare('SELECT id FROM prompts WHERE id = ? OR id LIKE ?')
    .get(idOrPrefix, `${idOrPrefix}%`) as { id: string } | undefined;
  return row ? row.id : null;
}

// ---------------------------------------------------------------------------
// Record import (shared by `init` and `source import`)
// ---------------------------------------------------------------------------

interface ImportRecord {
  text: string;
  sig: string;
}

/** Extract the dedup signature and prompt text from a JSONL record. */
function extractRecord(rec: Record<string, unknown>): ImportRecord | null {
  const text = String(rec.prompt_text ?? rec.title ?? rec.slug ?? '').trim();
  if (!text) return null;
  const sig = createHash('sha256').update(text).digest('hex').slice(0, 16);
  return { text, sig };
}

/** Import a single record with sha256-prefix dedup. Returns true if inserted. */
function importRecord(db: DatabaseSync, rec: Record<string, unknown>): boolean {
  const extracted = extractRecord(rec);
  if (!extracted) return false;
  const { text, sig } = extracted;
  const existing = db
    .prepare('SELECT id FROM prompts WHERE id LIKE ?')
    .get(`${sig}%`) as { id: string } | undefined;
  if (existing) return false;
  const uid = sig + randomUUID().replace(/-/g, '').slice(0, 8);
  const now = nowISO();
  db.prepare(
    'INSERT INTO prompts(id, title, category, prompt_text, source_url, source_type, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?)'
  ).run(
    uid,
    String(rec.title ?? rec.slug ?? ''),
    String(rec.category ?? 'unclassified'),
    text,
    String(rec.source_url ?? ''),
    String(rec.source_type ?? 'import'),
    now,
    now,
  );
  return true;
}

/** Import every JSONL line from `filePath`. Returns the count inserted. */
function importFile(db: DatabaseSync, filePath: string): number {
  const content = readFileSync(filePath, 'utf-8');
  let count = 0;
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let rec: Record<string, unknown>;
    try {
      rec = JSON.parse(trimmed);
    } catch {
      continue; // skip malformed lines
    }
    if (importRecord(db, rec)) count++;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Command implementations
// ---------------------------------------------------------------------------

function cmdInit(output: CLIOutput): void {
  const db = openDB();
  let count = 0;
  if (existsSync(DATA_DIR)) {
    const files = readdirSync(DATA_DIR)
      .filter((f) => f.endsWith('.jsonl'))
      .sort();
    for (const file of files) {
      count += importFile(db, join(DATA_DIR, file));
    }
  }
  rebuildFTS(db);
  db.close();
  output.stdout(`Initialized prompt-forge: ${count} prompts imported (deduped)\n`);
}

function cmdPromptList(
  opts: { category?: string; rating?: number; limit: string },
  output: CLIOutput,
): void {
  const db = openDB();
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (opts.category) {
    where.push('category = ?');
    params.push(opts.category);
  }
  if (opts.rating !== undefined) {
    where.push('rating >= ?');
    params.push(opts.rating);
  }
  const limit = parseInt(opts.limit, 10);
  let sql = 'SELECT id, title, category, rating FROM prompts';
  if (where.length > 0) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY rating DESC LIMIT ?';
  params.push(limit);
  const rows = db.prepare(sql).all(...params) as {
    id: string;
    title: string;
    category: string;
    rating: number;
  }[];
  for (const r of rows) {
    output.stdout(
      `${shortId(r.id)}  ${r.rating.toFixed(1)}★  ${pad(r.category, 30)}  ${r.title}\n`,
    );
  }
  const total = db.prepare('SELECT COUNT(*) as n FROM prompts').get() as { n: number };
  output.stdout(`\n${total.n} total prompts\n`);
  db.close();
}

function cmdPromptSearch(query: string, output: CLIOutput): void {
  const db = openDB();
  type Row = { id: string; title: string; category: string; rating: number };
  let rows: Row[] = [];
  let usedFTS = false;
  try {
    rows = db
      .prepare(
        `SELECT p.id, p.title, p.category, p.rating
         FROM prompts_fts f
         JOIN prompts p ON p.rowid = f.rowid
         WHERE prompts_fts MATCH ?
         ORDER BY rank
         LIMIT 20`,
      )
      .all(query) as Row[];
    usedFTS = true;
  } catch {
    // FTS5 unavailable or query syntax error; fall back to LIKE.
  }
  // FTS5's default tokenizer does not segment CJK text, so CJK queries (and
  // other tokenization edge cases) return 0 rows without error. Fall back to
  // LIKE so users searching in Chinese still get matches.
  if (!usedFTS || rows.length === 0) {
    rows = db
      .prepare(
        `SELECT id, title, category, rating FROM prompts
         WHERE title LIKE ? OR prompt_text LIKE ?
         LIMIT 20`,
      )
      .all(`%${query}%`, `%${query}%`) as Row[];
  }
  for (const r of rows) {
    output.stdout(
      `${shortId(r.id)}  ${r.rating.toFixed(1)}★  ${pad(r.category, 30)}  ${r.title}\n`,
    );
  }
  db.close();
}

function cmdPromptShow(id: string, full: boolean, output: CLIOutput): void {
  const db = openDB();
  const row = db
    .prepare('SELECT * FROM prompts WHERE id = ? OR id LIKE ?')
    .get(id, `${id}%`) as Record<string, unknown> | undefined;
  if (!row) {
    output.stdout(`Prompt ${id} not found\n`);
    db.close();
    return;
  }
  for (const [k, v] of Object.entries(row)) {
    let s = v === null ? '' : String(v);
    if (!full && s.length > 200) s = s.slice(0, 200) + '...';
    output.stdout(`${k}: ${s}\n`);
  }
  db.close();
}

function cmdPromptAdd(
  opts: { title: string; category: string; text: string; source: string },
  output: CLIOutput,
): void {
  const db = openDB();
  const uid = randomUUID().replace(/-/g, '').slice(0, 16);
  const now = nowISO();
  const result = db
    .prepare(
      'INSERT INTO prompts(id, title, category, prompt_text, source_type, created_at, updated_at) VALUES(?,?,?,?,?,?,?)',
    )
    .run(uid, opts.title, opts.category, opts.text, opts.source, now, now);
  // Keep the external-content FTS5 index in sync.
  try {
    db.prepare(
      'INSERT INTO prompts_fts(rowid, title, description, prompt_text, tags) VALUES (?, ?, ?, ?, ?)',
    ).run(Number(result.lastInsertRowid), opts.title, '', opts.text, '[]');
  } catch {
    // Non-fatal: search will fall back to LIKE.
  }
  db.close();
  output.stdout(`Added: ${uid}\n`);
}

function cmdImageLink(promptId: string, imagePath: string, output: CLIOutput): void {
  if (!existsSync(imagePath)) {
    output.stdout(`Error: ${imagePath} not found\n`);
    return;
  }
  const db = openDB();
  const fullId = resolvePromptId(db, promptId);
  if (!fullId) {
    output.stdout(`Prompt ${promptId} not found\n`);
    db.close();
    return;
  }
  const stat = statSync(imagePath);
  const uid = randomUUID().replace(/-/g, '').slice(0, 16);
  db.prepare(
    'INSERT INTO images(id, prompt_id, file_path, file_size, created_at) VALUES(?,?,?,?,?)',
  ).run(uid, fullId, resolve(imagePath), stat.size, nowISO());
  db.close();
  output.stdout(`Linked: ${uid} -> ${promptId}\n`);
}

function cmdImageRate(promptId: string, scoreStr: string, output: CLIOutput): void {
  const score = parseInt(scoreStr, 10);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    output.stdout('Score must be 1-5\n');
    return;
  }
  const db = openDB();
  const fullId = resolvePromptId(db, promptId);
  if (!fullId) {
    output.stdout(`Prompt ${promptId} not found\n`);
    db.close();
    return;
  }
  const uid = randomUUID().replace(/-/g, '').slice(0, 16);
  db.prepare(
    'INSERT INTO ratings(id, prompt_id, score, created_at) VALUES(?,?,?,?)',
  ).run(uid, fullId, score, nowISO());
  const avgRow = db
    .prepare('SELECT AVG(score) as avg FROM ratings WHERE prompt_id = ?')
    .get(fullId) as { avg: number | null };
  const avg = avgRow.avg ?? 0;
  db.prepare('UPDATE prompts SET rating = ? WHERE id = ?').run(avg, fullId);
  db.close();
  output.stdout(`Rated: ${promptId} = ${score}/5 (avg: ${avg.toFixed(1)})\n`);
}

function cmdSourceImport(file: string, output: CLIOutput): void {
  if (!existsSync(file)) {
    output.stdout(`Error: ${file} not found\n`);
    return;
  }
  const db = openDB();
  const count = importFile(db, file);
  rebuildFTS(db);
  db.close();
  output.stdout(`Imported: ${count} prompts (deduped)\n`);
}

function cmdSourceDedup(output: CLIOutput): void {
  const db = openDB();
  const dups = db
    .prepare(
      'SELECT prompt_text, COUNT(*) as c, GROUP_CONCAT(id) as ids FROM prompts GROUP BY prompt_text HAVING c > 1',
    )
    .all() as { prompt_text: string; c: number; ids: string }[];
  let removed = 0;
  const deleteRatings = db.prepare('DELETE FROM ratings WHERE prompt_id = ?');
  const deleteImages = db.prepare('DELETE FROM images WHERE prompt_id = ?');
  const deletePrompt = db.prepare('DELETE FROM prompts WHERE id = ?');
  db.exec('BEGIN');
  try {
    for (const r of dups) {
      const ids = r.ids.split(',');
      for (const dupId of ids.slice(1)) {
        // Delete child rows first to satisfy PRAGMA foreign_keys=ON
        // (schema has no ON DELETE CASCADE on images/ratings).
        deleteRatings.run(dupId);
        deleteImages.run(dupId);
        deletePrompt.run(dupId);
        removed++;
      }
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    db.close();
    throw e;
  }
  rebuildFTS(db);
  db.close();
  output.stdout(`Deduped: ${removed} duplicates removed from ${dups.length} groups\n`);
}

function cmdServe(opts: { port: string }, output: CLIOutput): void {
  const port = parseInt(opts.port, 10);
  const server = createServer((req, res) => {
    if (req.url === '/api/stats') {
      const db = openDB();
      const total = db.prepare('SELECT COUNT(*) as n FROM prompts').get() as { n: number };
      const cats = db.prepare(
        'SELECT category, COUNT(*) as n FROM prompts GROUP BY category',
      ).all() as { category: string; n: number }[];
      db.close();
      const body = JSON.stringify({
        total: total.n,
        categories: Object.fromEntries(cats.map((c) => [c.category, c.n])),
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(body);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });
  server.listen(port, '127.0.0.1', () => {
    output.stdout(`Serving on http://localhost:${port}\n`);
  });
}

// ---------------------------------------------------------------------------
// commander wiring
// ---------------------------------------------------------------------------

function configureCmdRecursive(cmd: Command, output: CLIOutput): void {
  cmd.configureOutput({
    writeOut: (str: string) => output.stdout(str),
    writeErr: (str: string) => output.stderr(str),
  });
  cmd.exitOverride();
  for (const sub of cmd.commands) {
    configureCmdRecursive(sub, output);
  }
}

function buildProgram(output: CLIOutput): Command {
  const program = new Command();
  program
    .name('pf')
    .description(
      'Prompt Forge CLI - image-generation prompt library backed by local SQLite.',
    );

  program
    .command('init')
    .description('Create the database, apply schema, and seed from bundled data/*.jsonl.')
    .action(() => cmdInit(output));

  const promptCmd = program.command('prompt').description('Manage prompts.');
  promptCmd
    .command('list')
    .description('List prompts ordered by rating.')
    .option('--category <category>', 'Filter by category')
    .option('--rating <rating>', 'Minimum rating', (v: string) => parseFloat(v))
    .option('--limit <limit>', 'Maximum number of results', '50')
    .action((opts: { category?: string; rating?: number; limit: string }) =>
      cmdPromptList(opts, output),
    );
  promptCmd
    .command('search <query>')
    .description('Full-text search (FTS5 with LIKE fallback).')
    .action((query: string) => cmdPromptSearch(query, output));
  promptCmd
    .command('show <id>')
    .description('Show details of a prompt by id or id prefix.')
    .option('--full', 'Do not truncate long field values.', false)
    .action((id: string, opts: { full: boolean }) => cmdPromptShow(id, opts.full, output));
  promptCmd
    .command('add')
    .description('Add a prompt manually.')
    .requiredOption('--title <title>', 'Prompt title')
    .option('--category <category>', 'Prompt category', 'unclassified')
    .requiredOption('--text <text>', 'Prompt text')
    .option('--source <source>', 'Source type', 'manual')
    .action((opts: { title: string; category: string; text: string; source: string }) =>
      cmdPromptAdd(opts, output),
    );

  const imageCmd = program.command('image').description('Manage generated images.');
  imageCmd
    .command('link <promptId> <imagePath>')
    .description('Link an image file to a prompt.')
    .action((promptId: string, imagePath: string) =>
      cmdImageLink(promptId, imagePath, output),
    );
  imageCmd
    .command('rate <promptId> <score>')
    .description('Rate a prompt (score 1-5) and update its average.')
    .action((promptId: string, score: string) => cmdImageRate(promptId, score, output));

  const sourceCmd = program.command('source').description('Bulk import and dedup.');
  sourceCmd
    .command('import <file>')
    .description('Import prompts from a JSONL file (sha256 dedup).')
    .action((file: string) => cmdSourceImport(file, output));
  sourceCmd
    .command('dedup')
    .description('Remove duplicate prompts by exact prompt_text match.')
    .action(() => cmdSourceDedup(output));

  program
    .command('serve')
    .description('Start a minimal HTTP server returning /api/stats JSON.')
    .option('--port <port>', 'Port number', '8765')
    .action((opts: { port: string }) => cmdServe(opts, output));

  configureCmdRecursive(program, output);
  return program;
}

/**
 * Entry point for programmatic invocation and tests.
 * Returns the exit code (0 on success, 1 on error) without calling process.exit.
 */
export async function main(argv: string[], output: CLIOutput = defaultOutput): Promise<number> {
  const program = buildProgram(output);
  try {
    await program.parseAsync(argv, { from: 'user' });
    return 0;
  } catch (err) {
    if (err instanceof CommanderError) {
      return typeof err.exitCode === 'number' ? err.exitCode : 1;
    }
    output.stderr(`${String((err as Error)?.message ?? err)}\n`);
    return 1;
  }
}

// Run when invoked directly (not when imported by tests or other modules).
try {
  if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main(process.argv.slice(2))
      .then((code) => process.exit(code))
      .catch(() => process.exit(1));
  }
} catch {
  // Not invoked directly (e.g. imported by a test or another module).
}
