//
// scenarios/helpers.ts — shared behaviour for hand-written scenario commands.
//
// Scenario commands exist to remove bookkeeping from the caller: they resolve a
// name to an id, chain the calls that always go together, and report the result
// in the vocabulary of the task rather than the API. When a name cannot be
// resolved they answer with the candidates, never with a bare "not found".

import { PluginError } from "@agent-plugins/config-center";
import { loadCatalog } from "../catalog.js";
import type { ApiResponse } from "../http.js";
import { isRecord, valueAtPath } from "../output.js";
import { coerceValue } from "../runtime.js";
import type { CodeartsClient } from "../runtime.js";

export interface MatchOptions {
  /** Keys that may hold the identifier, most specific first. */
  idKeys: string[];
  /** Keys that may hold the human-facing name. */
  nameKeys: string[];
  /** What the item is called in messages, e.g. "pipeline". */
  label: string;
  /** Command that lists the items, used in recovery hints. */
  listHint: string;
  /** How many candidates to print on failure. */
  limit?: number;
}

function textOf(item: unknown, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = isRecord(item) ? valueAtPath(item, key) : undefined;
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

/**
 * Resolve a user-supplied id-or-name against a list. Accepts an exact id, an
 * exact name, or a unique substring of a name.
 */
export function matchOne<T>(items: T[], reference: string, options: MatchOptions): T {
  const needle = reference.trim();
  const limit = options.limit ?? 20;

  const byId = items.filter((item) => textOf(item, options.idKeys) === needle);
  if (byId.length === 1) return byId[0];

  const byName = items.filter((item) => textOf(item, options.nameKeys) === needle);
  if (byName.length === 1) return byName[0];

  const bySubstring = items.filter((item) => {
    const name = textOf(item, options.nameKeys);
    return name !== undefined && name.toLowerCase().includes(needle.toLowerCase());
  });
  if (bySubstring.length === 1) return bySubstring[0];

  if (byName.length > 1 || bySubstring.length > 1) {
    const candidates = byName.length > 1 ? byName : bySubstring;
    throw new PluginError(
      `"${needle}" matches ${candidates.length} ${options.label}s; use the exact id:\n` +
        candidates
          .slice(0, limit)
          .map((item) => `  ${describe(item, options)}`)
          .join("\n"),
      "QUERY_FAILED"
    );
  }

  throw new PluginError(
    `No ${options.label} matches "${needle}".\n` +
      (items.length > 0
        ? `Available ${options.label}s:\n${items
            .slice(0, limit)
            .map((item) => `  ${describe(item, options)}`)
            .join("\n")}${items.length > limit ? `\n  … and ${items.length - limit} more` : ""}`
        : `Nothing is visible yet. List candidates with: ${options.listHint}`),
    "QUERY_FAILED"
  );
}

function describe(item: unknown, options: MatchOptions): string {
  const id = textOf(item, options.idKeys) ?? "?";
  const name = textOf(item, options.nameKeys) ?? "";
  return `${id}  ${name}`.trim();
}

export interface PollOptions {
  /** Stop when this returns true. */
  isDone: (value: unknown) => boolean;
  timeoutMs?: number;
  intervalMs?: number;
  /** Called after each completed attempt. */
  onTick?: (value: unknown, elapsedMs: number) => void;
}

/** Poll a producer until it reports done, or fail with the last observation. */
export async function poll<T>(
  producer: () => Promise<T>,
  options: PollOptions
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 15 * 60 * 1000;
  const intervalMs = options.intervalMs ?? 5_000;
  const started = Date.now();
  let last: T | undefined;

  for (;;) {
    last = await producer();
    if (options.isDone(last)) return last;
    const elapsed = Date.now() - started;
    if (options.onTick) options.onTick(last, elapsed);
    if (elapsed + intervalMs > timeoutMs) {
      throw new PluginError(
        `Gave up waiting after ${Math.round(elapsed / 1000)}s; the task is still running.\n` +
          `Re-check it later, or raise the wait with --watch-timeout <seconds>.`,
        "QUERY_FAILED"
      );
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

/** Pipeline and build statuses that mean "no more progress will happen". */
export const TERMINAL_STATUSES = new Set([
  "COMPLETED",
  "SUCCESS",
  "SUCCEEDED",
  "FAILED",
  "CANCELED",
  "CANCELLED",
  "ABORTED",
  "STOPPED",
  "TIMEOUT",
  "TIMED_OUT",
  "SKIPPED",
  "IGNORED",
  "FINISHED",
  "ERROR",
  "EXPIRED",
]);

export function isTerminalStatus(status: unknown): boolean {
  if (status === null || status === undefined) return false;
  return TERMINAL_STATUSES.has(String(status).toUpperCase());
}

/** Parse a comma-separated or repeated option into a record. */
export function parseAssignments(values: string[] | undefined, label: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const entry of values ?? []) {
    const index = entry.indexOf("=");
    if (index <= 0) {
      throw new PluginError(
        `Invalid ${label} value: ${entry}\nExpected the form ${label} <name>=<value>`,
        "CONFIG_INVALID"
      );
    }
    result[entry.slice(0, index)] = entry.slice(index + 1);
  }
  return result;
}

/** `now` shifted by a negative duration such as `-7d`, `-12h`, `-30m`. */
export function shiftTime(spec: string | undefined, fallbackMs: number): number {
  if (!spec) return Date.now() - fallbackMs;
  const match = spec.trim().match(/^-(\d+)([smhdw])$/i);
  if (!match) {
    const parsed = Date.parse(spec);
    if (Number.isNaN(parsed)) {
      throw new PluginError(
        `Invalid time value: ${spec}\nUse a relative form such as -7d, -12h or an ISO timestamp.`,
        "CONFIG_INVALID"
      );
    }
    return parsed;
  }
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const factor =
    unit === "s" ? 1000 : unit === "m" ? 60_000 : unit === "h" ? 3_600_000 : unit === "d" ? 86_400_000 : 604_800_000;
  return Date.now() - amount * factor;
}

/** Render an epoch-millisecond or ISO timestamp for display. */
export function formatTimestamp(value: unknown): string {
  // 0 is the "never happened" sentinel these APIs return, not 1970.
  if (value === null || value === undefined || value === "" || value === 0) return "";
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toISOString().replace("T", " ").slice(0, 19);
  }
  return String(value);
}

/** Flatten a recursive tree (`children`) into depth-tagged rows. */
export function flattenTree(
  nodes: unknown,
  options: { childrenKey?: string; depth?: number } = {}
): Array<Record<string, unknown> & { depth: number }> {
  const childrenKey = options.childrenKey ?? "children";
  const depth = options.depth ?? 0;
  if (!Array.isArray(nodes)) return [];
  return nodes.flatMap((node) => {
    if (!isRecord(node)) return [];
    const children = node[childrenKey];
    return [
      { ...node, depth, [childrenKey]: undefined },
      ...flattenTree(children, { childrenKey, depth: depth + 1 }),
    ];
  });
}


// ── Deployment-aware calls ──────────────────────────────────────────────────

/** The gateway answers this when a path carries no published API. */
export const NOT_PUBLISHED = /APIGW\.0101/;

export interface VariantCall {
  /** Catalog id of the variant that answered. */
  operation: string;
  response: ApiResponse;
}

/**
 * Call the first variant of an operation that this deployment actually
 * publishes.
 *
 * CodeArts documents several generations of the same endpoint (`/v4`, `/v2`,
 * `/v1`). A private deployment publishes the subset its console uses, and which
 * subset that is cannot be known from the documentation — a real deployment was
 * found serving the legacy `/v2` merge-request group while the `/v4` group was
 * absent. Trying the variants in order turns that deployment difference into a
 * non-event instead of a 404.
 */
export async function callAny(
  client: CodeartsClient,
  candidates: string[],
  params: Record<string, string | number> = {},
  body?: Record<string, unknown>
): Promise<VariantCall> {
  const catalog = loadCatalog();
  const skipped: string[] = [];

  for (const id of candidates) {
    const operation = catalog.operations.find((entry) => entry.id === id);
    if (!operation) continue;

    const pathParams: Record<string, string> = {};
    const query: Record<string, string | number | boolean> = {};
    for (const param of operation.pathParams) {
      const value = params[param.name];
      if (value !== undefined) pathParams[param.name] = String(value);
    }
    for (const param of operation.queryParams) {
      const value = params[param.name];
      if (value !== undefined) {
        query[param.name] = coerceValue(String(value), param.type) as string | number | boolean;
      }
    }

    try {
      const response = await client.request({
        service: operation.service,
        method: operation.method,
        path: operation.path,
        pathParams,
        query,
        ...(body !== undefined ? { body } : {}),
      });
      return { operation: id, response };
    } catch (error) {
      if (NOT_PUBLISHED.test((error as Error).message ?? "")) {
        skipped.push(id);
        continue;
      }
      throw error;
    }
  }

  throw new PluginError(
    `This deployment publishes none of the documented variants for this call.\n` +
      `Tried: ${candidates.join(", ")}\n` +
      (skipped.length > 0 ? `Not published here: ${skipped.join(", ")}\n` : "") +
      `Find an alternative with: codearts api list <service> --search <keyword>`,
    "QUERY_FAILED"
  );
}

/** Unwrap the common `{ result: ... }` / `{ data: ... }` envelopes. */
export function unwrap(payload: unknown): unknown {
  if (!isRecord(payload)) return payload;
  for (const key of ["result", "data"]) {
    const inner = payload[key];
    if (inner !== undefined && inner !== null) return inner;
  }
  return payload;
}

/** First array found on the payload itself or under a named key. */
export function arrayFrom(payload: unknown, keys: string[]): unknown[] {
  const body = unwrap(payload);
  if (Array.isArray(body)) return body;
  for (const key of keys) {
    const found = valueAtPath(body, key);
    if (Array.isArray(found)) return found;
  }
  return [];
}
