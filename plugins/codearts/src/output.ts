//
// output.ts — rendering helpers shared by every codearts command.
//
// Default output is a compact Markdown table because the primary reader is an
// agent; `--format json` is available whenever a caller needs to post-process.

export type OutputFormat = "table" | "json" | "text";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Read `a.b[0].c` from a nested structure without throwing. */
export function valueAtPath(value: unknown, path: string): unknown {
  if (!path) return value;
  let current: unknown = value;
  for (const segment of path.split(".")) {
    if (current === null || current === undefined) return undefined;
    const indexed = segment.match(/^([^[\]]*)((?:\[\d+\])*)$/);
    if (!indexed) return undefined;
    const [, key, indexes] = indexed;
    if (key) {
      if (!isRecord(current)) return undefined;
      current = current[key];
    }
    for (const index of indexes.matchAll(/\[(\d+)\]/g)) {
      if (!Array.isArray(current)) return undefined;
      current = current[Number(index[1])];
    }
  }
  return current;
}

/** Find the first array reachable through a list of candidate paths, else the deepest array. */
export function findArray(value: unknown, candidatePaths: string[]): unknown[] | null {
  for (const path of candidatePaths) {
    const found = valueAtPath(value, path);
    if (Array.isArray(found)) return found;
  }
  const queue: unknown[] = [value];
  while (queue.length > 0) {
    const current = queue.shift();
    if (Array.isArray(current)) return current;
    if (isRecord(current)) queue.push(...Object.values(current));
  }
  return null;
}

/** Flatten one level so nested objects render readably inside a table cell. */
function cell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    const json = JSON.stringify(value);
    return json.length > 60 ? `${json.slice(0, 57)}…` : json;
  }
  const text = String(value);
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function columnValue(row: unknown, column: string): unknown {
  if (!isRecord(row)) return row;
  if (column in row) return row[column];
  return valueAtPath(row, column);
}

/** Render rows as a Markdown table over the given columns. */
export function renderTable(rows: unknown[], columns: string[]): string {
  if (rows.length === 0) return "(no rows)";
  const header = `| ${columns.join(" | ")} |`;
  const divider = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map(
    (row) => `| ${columns.map((column) => cell(columnValue(row, column))).join(" | ")} |`
  );
  return [header, divider, ...body].join("\n");
}

/** Choose presentable columns from the first row when the caller gave none. */
export function inferColumns(rows: unknown[], preferred: string[]): string[] {
  const first = rows.find(isRecord);
  if (!first) return ["value"];
  const available = Object.keys(first);
  const chosen = preferred.filter((column) => available.includes(column));
  if (chosen.length > 0) return chosen;
  return available.slice(0, 8);
}

export interface RenderOptions {
  format: OutputFormat;
  /** Columns to show in table mode; ignored by other formats. */
  columns?: string[];
  /** Path to the array to render in table mode. */
  arrayPath?: string;
}

/**
 * Render an API payload. Table mode always tries to show a list, because that
 * is what makes a response readable at a glance; JSON mode is exact.
 */
export function renderValue(value: unknown, options: RenderOptions): string {
  if (options.format === "json") return JSON.stringify(value ?? null, null, 2);
  if (options.format === "text") {
    if (typeof value === "string") return value;
    return JSON.stringify(value ?? null, null, 2);
  }

  const rows = options.arrayPath
    ? valueAtPath(value, options.arrayPath)
    : findArray(value, []);

  if (Array.isArray(rows) && rows.length > 0) {
    const columns = options.columns?.length ? options.columns : inferColumns(rows, []);
    const table = renderTable(rows, columns);
    return `${table}\n\n${rows.length} row(s). Use --format json for the full payload.`;
  }

  if (isRecord(value)) {
    const entries = Object.entries(value);
    if (entries.length > 0) {
      const rows = entries.map(([key, item]) => ({ key, value: item }));
      const scalarOnly = entries.every(([, item]) => typeof item !== "object" || item === null);
      if (scalarOnly) return renderTable(rows, ["key", "value"]);
    }
  }

  return JSON.stringify(value ?? null, null, 2);
}

/** Keep only the requested dotted paths from a payload. */
export function pickPaths(value: unknown, paths: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const path of paths) {
    result[path] = valueAtPath(value, path);
  }
  return result;
}

/** Exit non-zero after printing a diagnostic, without a stack trace. */
export function fail(message: string, code = 1): never {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}
