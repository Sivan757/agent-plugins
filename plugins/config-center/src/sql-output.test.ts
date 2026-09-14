import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_COL_WIDTH,
  DEFAULT_ROW_LIMIT,
  WRITE_STATEMENT_PATTERN,
  formatCSV,
  formatTable,
  renderRows,
  resolveQueryOptions,
  truncate,
} from './sql-output.ts';

test('truncate renders null as NULL and elides long values', () => {
  assert.equal(truncate(null, 40), 'NULL');
  assert.equal(truncate(undefined, 40), 'NULL');
  assert.equal(truncate('short', 40), 'short');
  assert.equal(truncate('x'.repeat(50), 10), `${'x'.repeat(7)}...`);
});

test('formatCSV escapes separators and quotes', () => {
  const rows = [{ a: 'plain', b: 'has,comma', c: 'has"quote' }];
  assert.equal(formatCSV(rows, DEFAULT_COL_WIDTH), 'a,b,c\nplain,"has,comma","has""quote"');
});

test('formatTable pads every column to the widest cell', () => {
  const rows = [
    { id: 1, name: 'ab' },
    { id: 2, name: 'cdef' },
  ];
  const lines = formatTable(rows, DEFAULT_COL_WIDTH).split('\n');
  assert.equal(lines.length, 6);
  assert.equal(lines[0], '+----+------+');
  assert.equal(lines[1], '| id | name |');
  assert.equal(lines[3], '| 1  | ab   |');
  assert.equal(lines[4], '| 2  | cdef |');
});

test('formatTable clamps a wide column to --col-width', () => {
  const rows = [{ long: 'x'.repeat(30) }];
  const header = formatTable(rows, 10).split('\n')[1];
  assert.equal(header, `| ${'long'.padEnd(10)} |`);
});

test('resolveQueryOptions parses params, limit and width', () => {
  const resolved = resolveQueryOptions({
    format: 'json',
    params: '[1,"two"]',
    limit: '5',
    colWidth: '12',
  });
  assert.deepEqual(resolved, { format: 'json', params: [1, 'two'], rowLimit: 5, colWidth: 12 });
});

test('resolveQueryOptions defaults to no params', () => {
  const resolved = resolveQueryOptions({
    format: 'csv',
    limit: String(DEFAULT_ROW_LIMIT),
    colWidth: String(DEFAULT_COL_WIDTH),
  });
  assert.deepEqual(resolved.params, []);
});

test('renderRows prints the summary line and truncates at the row limit', () => {
  const printed: string[] = [];
  const original = console.log;
  console.log = (line?: unknown) => {
    printed.push(String(line));
  };
  try {
    renderRows([{ a: 1 }, { a: 2 }, { a: 3 }], { format: 'csv', rowLimit: 2, colWidth: DEFAULT_COL_WIDTH });
  } finally {
    console.log = original;
  }

  assert.equal(printed[0], 'a\n1\n2');
  assert.equal(printed[1], '(2 of 3 rows shown, use --limit=0 for all)');
});

test('renderRows reports an empty result set', () => {
  const printed: string[] = [];
  const original = console.log;
  console.log = (line?: unknown) => {
    printed.push(String(line));
  };
  try {
    renderRows([], { format: 'csv', rowLimit: DEFAULT_ROW_LIMIT, colWidth: DEFAULT_COL_WIDTH });
  } finally {
    console.log = original;
  }

  assert.deepEqual(printed, ['(empty result set)']);
});

test('WRITE_STATEMENT_PATTERN matches data-modifying statements only', () => {
  for (const sql of ['INSERT INTO t VALUES (1)', '  delete from t', 'DROP TABLE t', 'ALTER TABLE t ADD c int', 'truncate t']) {
    assert.ok(WRITE_STATEMENT_PATTERN.test(sql), `expected a match: ${sql}`);
  }
  for (const sql of ['SELECT * FROM t', 'WITH x AS (SELECT 1) SELECT * FROM x', 'SHOW TABLES']) {
    assert.equal(WRITE_STATEMENT_PATTERN.test(sql), false, `expected no match: ${sql}`);
  }
});
