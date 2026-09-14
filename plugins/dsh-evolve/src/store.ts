/**
 * Every path and every read or write the plugin performs.
 *
 * Plugin-owned data — session traces, the turn counter, the registry, the ledger,
 * staged drafts and archived skills — is built with `pluginFilePath()` and written
 * with `writePluginFile()`, so it lands in this plugin's own directory under the
 * shared cache root and honours `AGENT_PLUGINS_CACHE_DIR`. The one path outside
 * that tree is the skills root, which is an output location the user names.
 */

import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import {
  ensurePrivatePluginDirSync,
  pluginFilePath,
  writePluginFile,
} from "@agent-plugins/config-center";
import { EMITTED_LIMIT, PLUGIN_NAME, STATE_SEGMENTS, TRACE_LIMIT } from "./config.js";
import type { TraceEntry } from "./detect.js";

// ── Sessions ────────────────────────────────────────────────────────────────

/** One session's accumulated trace and the findings already delivered. */
export interface SessionState {
  readonly sessionId: string;
  /** Session workspace, recorded so `status` can show where the work happened. */
  readonly cwd: string;
  /** Every call recorded this session, including ones `entries` has dropped. */
  readonly toolCalls: number;
  /** Most recent calls, oldest first, bounded by `TRACE_LIMIT`. */
  readonly entries: TraceEntry[];
  /** Finding signatures already delivered, bounded by `EMITTED_LIMIT`. */
  readonly emitted: string[];
  /** ISO timestamp of the last update. */
  readonly updatedAt: string;
}

/** Session ids that are already safe as a path segment. */
const SAFE_ID = /^[A-Za-z0-9_-]+$/;

/**
 * Turn a session id into one path segment.
 *
 * @param sessionId - the id as the host reported it.
 * @returns a single filename segment; an unusual id is replaced by a digest so it
 *   cannot escape the state directory or collide with another.
 */
export function stateKey(sessionId: string): string {
  if (SAFE_ID.test(sessionId)) return sessionId;
  return `h${createHash("sha256").update(sessionId).digest("hex").slice(0, 16)}`;
}

function sessionsDir(): string {
  return pluginFilePath(PLUGIN_NAME, ...STATE_SEGMENTS);
}

function sessionPath(sessionId: string): string {
  return pluginFilePath(PLUGIN_NAME, ...STATE_SEGMENTS, `${stateKey(sessionId)}.json`);
}

function isTraceEntry(value: unknown): value is TraceEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.tool === "string" &&
    typeof entry.paramsHash === "string" &&
    typeof entry.ok === "boolean"
  );
}

/**
 * Read one session's state.
 *
 * @param sessionId - the id as the host reported it.
 * @returns the stored state, or `null` when none exists or the file is unusable.
 */
export function loadSession(sessionId: string): SessionState | null {
  const path = sessionPath(sessionId);
  if (!existsSync(path)) return null;

  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8")) as Record<string, unknown>;
    return {
      sessionId,
      cwd: typeof parsed.cwd === "string" ? parsed.cwd : "",
      toolCalls: typeof parsed.toolCalls === "number" ? parsed.toolCalls : 0,
      entries: Array.isArray(parsed.entries) ? parsed.entries.filter(isTraceEntry) : [],
      emitted: Array.isArray(parsed.emitted)
        ? parsed.emitted.filter((value): value is string => typeof value === "string")
        : [],
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return null;
  }
}

/** Start a session's state from nothing. */
export function emptySession(sessionId: string, cwd: string): SessionState {
  return { sessionId, cwd, toolCalls: 0, entries: [], emitted: [], updatedAt: "" };
}

/**
 * Persist one session's state, atomically and at 0600.
 *
 * @param state - the state to write.
 */
export async function saveSession(state: SessionState): Promise<void> {
  ensurePrivatePluginDirSync(PLUGIN_NAME, ...STATE_SEGMENTS);
  const bounded: SessionState = {
    ...state,
    entries: state.entries.slice(-TRACE_LIMIT),
    emitted: state.emitted.slice(-EMITTED_LIMIT),
    updatedAt: new Date().toISOString(),
  };
  await writePluginFile(
    PLUGIN_NAME,
    [...STATE_SEGMENTS, `${stateKey(state.sessionId)}.json`],
    `${JSON.stringify(bounded, null, 2)}\n`,
  );
}

/**
 * Append one call to a session's state.
 *
 * @param state - the state to extend.
 * @param entry - the call just observed.
 * @returns a new state; the input is not mutated.
 */
export function withCall(state: SessionState, entry: TraceEntry): SessionState {
  return { ...state, toolCalls: state.toolCalls + 1, entries: [...state.entries, entry] };
}

/**
 * Mark finding signatures as delivered.
 *
 * @param state - the state to extend.
 * @param signatures - signatures that were just sent to the model.
 * @returns a new state; the input is not mutated.
 */
export function withEmitted(state: SessionState, signatures: readonly string[]): SessionState {
  return { ...state, emitted: [...state.emitted, ...signatures] };
}

/**
 * List every session that has a trace.
 *
 * @returns session keys, as they are named on disk.
 */
export function listSessionIds(): string[] {
  const dir = sessionsDir();
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.slice(0, -".json".length));
}

// ── Request counter ─────────────────────────────────────────────────────────

function requestsPath(): string {
  return pluginFilePath(PLUGIN_NAME, "state", "requests");
}

/**
 * The number of turns this installation has seen.
 *
 * It is the denominator of every survival rate, so it only ever grows: a counter
 * that could reset would silently reset every skill's probation.
 *
 * @returns the current count, or 0 when nothing has been recorded.
 */
export function requestCount(): number {
  const path = requestsPath();
  if (!existsSync(path)) return 0;
  const parsed = Number.parseInt(readFileSync(path, "utf-8").trim(), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

/**
 * Advance the turn counter by one.
 *
 * @returns the new count.
 */
export async function bumpRequests(): Promise<number> {
  const next = requestCount() + 1;
  ensurePrivatePluginDirSync(PLUGIN_NAME, "state");
  await writePluginFile(PLUGIN_NAME, ["state", "requests"], `${next}\n`);
  return next;
}

// ── Registry ────────────────────────────────────────────────────────────────

/** One installed skill's identity and usage counters. */
export interface RegistryEntry {
  /** Turn count when the skill was installed; probation starts here. */
  readonly anchor: number;
  /** ISO timestamp of installation. */
  readonly createdAt: string;
  /** Times the skill tool loaded it. */
  readonly use: number;
  /** Times a session read a file inside its directory. */
  readonly view: number;
  /** Times its content was replaced. */
  readonly patches: number;
  /** Where it was installed. */
  readonly path: string;
}

export type Registry = Record<string, RegistryEntry>;

function registryPath(): string {
  return pluginFilePath(PLUGIN_NAME, "library", "registry.json");
}

/**
 * Read the registry.
 *
 * @returns every installed skill, keyed by name; empty when nothing is installed.
 */
export function loadRegistry(): Registry {
  const path = registryPath();
  if (!existsSync(path)) return {};
  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8")) as Record<string, unknown>;
    const registry: Registry = {};
    for (const [name, value] of Object.entries(parsed)) {
      if (typeof value !== "object" || value === null) continue;
      const entry = value as Record<string, unknown>;
      registry[name] = {
        anchor: typeof entry.anchor === "number" ? entry.anchor : 0,
        createdAt: typeof entry.createdAt === "string" ? entry.createdAt : "",
        use: typeof entry.use === "number" ? entry.use : 0,
        view: typeof entry.view === "number" ? entry.view : 0,
        patches: typeof entry.patches === "number" ? entry.patches : 0,
        path: typeof entry.path === "string" ? entry.path : "",
      };
    }
    return registry;
  } catch {
    return {};
  }
}

/**
 * Persist the registry.
 *
 * @param registry - the registry to write.
 */
export async function saveRegistry(registry: Registry): Promise<void> {
  ensurePrivatePluginDirSync(PLUGIN_NAME, "library");
  await writePluginFile(PLUGIN_NAME, ["library", "registry.json"], `${JSON.stringify(registry, null, 2)}\n`);
}

// ── Ledger ──────────────────────────────────────────────────────────────────

/** What happened to one skill. Append-only; nothing is ever rewritten. */
export interface LedgerEntry {
  readonly at: string;
  readonly name: string;
  readonly action: "create" | "patch" | "archive" | "merge" | "drop";
  readonly reason: string;
  /** Set only when `action` is `merge`: the skill that absorbed this one. */
  readonly absorbedInto?: string;
}

function ledgerPath(): string {
  return pluginFilePath(PLUGIN_NAME, "library", "ledger.jsonl");
}

/**
 * Read the whole ledger.
 *
 * @returns every recorded action in order; a corrupt line is skipped rather than
 *   failing the read, because the ledger outlives any single write.
 */
export function readLedger(): LedgerEntry[] {
  const path = ledgerPath();
  if (!existsSync(path)) return [];
  const entries: LedgerEntry[] = [];
  for (const line of readFileSync(path, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    try {
      const parsed = JSON.parse(trimmed) as LedgerEntry;
      if (typeof parsed.name === "string" && typeof parsed.action === "string") entries.push(parsed);
    } catch {
      continue;
    }
  }
  return entries;
}

/**
 * Append one action.
 *
 * @param entry - the action to record, without its timestamp.
 */
export function appendLedger(entry: Omit<LedgerEntry, "at">): void {
  ensurePrivatePluginDirSync(PLUGIN_NAME, "library");
  appendFileSync(ledgerPath(), `${JSON.stringify({ at: new Date().toISOString(), ...entry })}\n`, {
    encoding: "utf-8",
    mode: 0o600,
  });
}

/**
 * How each retired skill left the library.
 *
 * A merge is shape convergence, not mortality, so the split is what makes the
 * library's history readable: without it every fold looks like a death.
 *
 * @param entries - the whole ledger.
 * @returns counts by cause.
 */
export function retirementCauses(entries: readonly LedgerEntry[]): {
  absorbed: number;
  pruned: number;
} {
  const last = new Map<string, LedgerEntry>();
  for (const entry of entries) {
    if (entry.action === "archive" || entry.action === "merge") last.set(entry.name, entry);
  }
  let absorbed = 0;
  let pruned = 0;
  for (const entry of last.values()) {
    if (entry.absorbedInto !== undefined && entry.absorbedInto !== "") absorbed += 1;
    else pruned += 1;
  }
  return { absorbed, pruned };
}

// ── Archives ────────────────────────────────────────────────────────────────

/** Where retired skills are moved, so a retirement is reversible by hand. */
export function archiveDir(): string {
  const dir = pluginFilePath(PLUGIN_NAME, "library", "archive");
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  return dir;
}
