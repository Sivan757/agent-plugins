/**
 * Shared presentation layer for the SQL CLI plugins (`mysql`, `postgresql`).
 *
 * Both plugins run a statement and then render the result set the same way:
 * the same four formatters, the same truncation rule, the same summary line.
 * Keeping that here means the two CLIs cannot drift in how they display a
 * result, and a formatting fix lands once.
 *
 * Dialect specifics stay in each plugin: how a connection is created, which
 * catalog queries back `columns`/`databases`/`find-table`, and what a
 * non-row result looks like.
 */

export const DEFAULT_ROW_LIMIT = 1;
export const DEFAULT_COL_WIDTH = 40;

export type RowFormat = 'table' | 'json' | 'csv' | 'compact';

export function truncate(value: unknown, maxLen: number): string {
  const s = value == null ? 'NULL' : String(value);
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 3) + '...';
}

export function formatCompact(rows: Record<string, unknown>[], colWidth: number): string {
  if (!rows || rows.length === 0) return '(empty)';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join('\t')];
  for (const row of rows) {
    lines.push(headers.map((h) => truncate(row[h], colWidth)).join('\t'));
  }
  return lines.join('\n');
}

export function formatCSV(rows: Record<string, unknown>[], colWidth: number): string {
  if (!rows || rows.length === 0) return '(empty result set)';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown): string => {
    const s = truncate(v, colWidth);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

export function formatTable(rows: Record<string, unknown>[], colWidth: number): string {
  if (!rows || rows.length === 0) return '(empty result set)';
  const headers = Object.keys(rows[0]);
  const cells = rows.map((r) => headers.map((h) => truncate(r[h], colWidth)));
  const widths = headers.map((h, i) =>
    Math.min(colWidth, Math.max(h.length, ...cells.map((c) => c[i].length)))
  );
  const sep = '+' + widths.map((w) => '-'.repeat(w + 2)).join('+') + '+';
  const fmt = (vals: string[]): string =>
    '|' + vals.map((v, i) => ' ' + v.padEnd(widths[i]) + ' ').join('|') + '|';

  return [sep, fmt(headers), sep, ...cells.map((c) => fmt(c)), sep].join('\n');
}

/** The option shape every `query` command declares. */
export interface RawQueryOptions {
  format: string;
  params?: string;
  limit: string;
  colWidth: string;
}

export interface QueryOptions {
  format: RowFormat;
  params: unknown[];
  rowLimit: number;
  colWidth: number;
}

/**
 * Parse and validate the options the `query` command shares across both
 * plugins. Invalid input exits with the message the caller prints; there is no
 * partial-parse fallback.
 */
export function resolveQueryOptions(opts: RawQueryOptions): QueryOptions {
  let params: unknown[] = [];
  if (opts.params) {
    try {
      params = JSON.parse(opts.params) as unknown[];
    } catch (e) {
      console.error(`Error: Invalid --params JSON: ${(e as Error).message}`);
      process.exit(1);
    }
  }

  const rowLimit = parseInt(opts.limit, 10);
  if (isNaN(rowLimit) || rowLimit < 0) {
    console.error('Error: Invalid --limit value. Must be a non-negative integer.');
    process.exit(1);
  }

  const colWidth = parseInt(opts.colWidth, 10);

  return { format: opts.format as RowFormat, params, rowLimit, colWidth };
}

/**
 * Print a result set in the requested format, followed by the row-count line.
 * Callers handle the non-row case (DDL/DML) themselves, because what a driver
 * reports for it is dialect-specific.
 */
export function renderRows(
  rows: Record<string, unknown>[],
  options: Pick<QueryOptions, 'format' | 'rowLimit' | 'colWidth'>
): void {
  const { format, rowLimit, colWidth } = options;

  if (rows.length === 0) {
    console.log('(empty result set)');
    return;
  }

  const totalRows = rows.length;
  const truncated = rowLimit > 0 && totalRows > rowLimit;
  const displayRows = truncated ? rows.slice(0, rowLimit) : rows;

  switch (format) {
    case 'json':
      console.log(JSON.stringify(displayRows));
      break;
    case 'compact':
      console.log(formatCompact(displayRows, colWidth));
      break;
    case 'csv':
      console.log(formatCSV(displayRows, colWidth));
      break;
    case 'table':
    default:
      console.log(formatTable(displayRows, colWidth));
      break;
  }

  if (truncated) {
    console.log(`(${rowLimit} of ${totalRows} rows shown, use --limit=0 for all)`);
  } else {
    console.log(`(${totalRows} rows)`);
  }
}

// Write-protection guard: refuse data-modifying SQL unless the user has
// explicitly confirmed and the caller passed --user-confirmed.
export const WRITE_STATEMENT_PATTERN = /^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|RENAME)\b/i;

export function assertWriteAllowed(sql: string, userConfirmed: boolean): void {
  if (userConfirmed || !WRITE_STATEMENT_PATTERN.test(sql)) {
    return;
  }
  console.error(
    'Error: Refusing write statement without --user-confirmed. ' +
      'Show the exact SQL to the user, get explicit confirmation, then re-run with --user-confirmed.'
  );
  process.exit(1);
}
