//
// cli-helpers.ts — shared command behaviour: error handling and output.
//
// Keeping these in one place means every command fails and renders the same
// way, whether it is a hand-written scenario or a catalog-driven call.

import type { Command } from "commander";
import { PluginError } from "@agent-plugins/config-center";
import { DryRunSignal } from "./http.js";
import { inferColumns, pickPaths, renderTable, renderValue, valueAtPath } from "./output.js";
import type { OutputFormat } from "./output.js";

/** Wrap an async action so PluginErrors exit cleanly instead of dumping stacks. */
export function action<A extends unknown[]>(
  fn: (...args: A) => Promise<void>
): (...args: A) => Promise<void> {
  return async (...args: A) => {
    try {
      await fn(...args);
    } catch (error) {
      // `--dry-run` printed the request; there is nothing left to do.
      if (error instanceof DryRunSignal) return;
      if (error instanceof PluginError) {
        process.stderr.write(`${error.message}\n`);
        process.exit(error.exitCode);
      }
      const err = error as Error;
      process.stderr.write(`${err.message}\n`);
      if (process.env.CODEARTS_DEBUG) process.stderr.write(`${err.stack}\n`);
      process.exit(1);
    }
  };
}

export interface EmitOptions {
  /** Path to the array to render as a table. */
  arrayPath?: string;
  /** Columns to show in table mode. */
  columns?: string[];
  /** Extra sentence printed after a table. */
  footnote?: string;
}

/** Print a payload in the requested format, honouring `--fields`. */
export function emit(command: Command, payload: unknown, options: EmitOptions = {}): void {
  const { format, fields } = command.optsWithGlobals() as {
    format?: OutputFormat;
    fields?: string[];
  };
  const value = fields && fields.length > 0 ? pickPaths(payload, fields) : payload;
  const resolvedFormat = format ?? "table";

  if (resolvedFormat === "table") {
    const rows = options.arrayPath ? valueAtPath(value, options.arrayPath) : value;
    if (Array.isArray(rows) && rows.length > 0) {
      const columns = options.columns ?? inferColumns(rows, []);
      const footnote = options.footnote ?? `${rows.length} row(s). Use --format json for the full payload.`;
      process.stdout.write(`${renderTable(rows, columns)}\n\n${footnote}\n`);
      return;
    }
  }

  process.stdout.write(
    `${renderValue(value, {
      format: resolvedFormat,
      columns: options.columns,
      arrayPath: options.arrayPath,
    })}\n`
  );
}

/** Print extra context only in verbose mode. */
export function note(command: Command, message: string): void {
  const { verbose } = command.optsWithGlobals() as { verbose?: boolean };
  if (verbose) process.stderr.write(`${message}\n`);
}

/** Normalise a possibly-undefined array payload. */
export function asRows(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/** Print a request preview for `--dry-run` and verbose runs. */
export function renderPreview(preview: {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}): string {
  const lines = [`${preview.method} ${preview.url}`];
  for (const [name, value] of Object.entries(preview.headers)) {
    lines.push(`${name}: ${value}`);
  }
  if (preview.body) lines.push("", preview.body);
  return lines.join("\n");
}
