/**
 * The hook boundary: read the host's payload, update what the plugin counts, and
 * answer with whatever the model should see.
 *
 * The host runs one short-lived process per tool call, so this module holds no
 * state between invocations and every decision comes from what the host sent plus
 * what the previous invocation persisted.
 *
 * Two counters are maintained here and they are deliberately different. The trace
 * drives the fast loop and answers "is this session repeating itself". The usage
 * counters answer "is this installed skill earning its place", and they feed the
 * slow loop's survival rate.
 */

import { createHash } from "node:crypto";
import { failurePattern, type Config } from "./config.js";
import { detect, unemitted, type Finding } from "./detect.js";
import {
  emptySession,
  loadRegistry,
  loadSession,
  saveRegistry,
  saveSession,
  withCall,
  withEmitted,
  type SessionState,
} from "./store.js";

/** The subset of the host payload this plugin reads. */
export interface HookInput {
  readonly session_id?: unknown;
  readonly cwd?: unknown;
  readonly hook_event_name?: unknown;
  readonly tool_name?: unknown;
  readonly tool_input?: unknown;
  readonly tool_response?: unknown;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

/**
 * Serialize a value with its object keys sorted, so two calls carrying the same
 * arguments in a different key order hash the same.
 *
 * @param value - a JSON-derived value from the host payload.
 * @param depth - remaining recursion budget; beyond it the value is summarized.
 * @returns a deterministic string.
 */
export function canonical(value: unknown, depth = 12): string {
  if (depth <= 0) return '"…"';
  if (value === null || typeof value === "number" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonical(item, depth - 1)).join(",")}]`;
  if (typeof value === "object") {
    const entries = value as Record<string, unknown>;
    const body = Object.keys(entries)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(entries[key], depth - 1)}`)
      .join(",");
    return `{${body}}`;
  }
  return '""';
}

/**
 * Digest one call's arguments.
 *
 * @param tool - tool name.
 * @param input - the arguments the host reported.
 * @returns a short hex digest identifying this call's arguments.
 */
export function paramsHash(tool: string, input: unknown): string {
  return createHash("sha256").update(`${tool}\u0000${canonical(input)}`).digest("hex").slice(0, 16);
}

/**
 * Whether a tool result reads as a failure.
 *
 * The host surfaces a failed tool as text beginning with `Error:`. That is the
 * only failure signal carried in the payload, so it is matched from config and
 * can be retuned without a rebuild.
 *
 * @param response - the result text the host sent.
 * @param config - resolved configuration.
 * @returns `true` when the result reads as a failure.
 */
export function isFailure(response: string, config: Config): boolean {
  return failurePattern(config).test(response);
}

/** What one hook invocation produced. */
export interface HookOutcome {
  /** Payload to print, or `null` to stay silent. */
  readonly output: Record<string, unknown> | null;
  /** Findings delivered by this invocation. */
  readonly delivered: readonly Finding[];
  /** Usage counters this invocation advanced, if any. */
  readonly counted: { readonly skill: string; readonly kind: "use" | "view" } | null;
}

/**
 * Which installed skill, if any, one tool call exercised.
 *
 * A load is the `skill` tool naming an installed skill. A view is a read of a file
 * inside one, which is how a session consumes a skill it did not load through the
 * tool. Only installed skills are counted; anything the user wrote is invisible
 * here, which is what keeps the plugin from scoring work it did not produce.
 *
 * @param tool - the tool name the host reported.
 * @param input - the tool arguments.
 * @returns the skill name and which counter it advances, or `null`.
 */
export function usageOf(tool: string, input: unknown): { skill: string; kind: "use" | "view" } | null {
  const args = record(input);
  const installed = loadRegistry();

  if (tool === "skill") {
    const name = str(args.name);
    return installed[name] === undefined ? null : { skill: name, kind: "use" };
  }

  if (tool === "Read") {
    const path = str(args.file_path) !== "" ? str(args.file_path) : str(args.path);
    for (const [name, entry] of Object.entries(installed)) {
      if (entry.path !== "" && path.startsWith(`${entry.path}/`)) return { skill: name, kind: "view" };
    }
  }

  return null;
}

async function recordUsage(usage: { skill: string; kind: "use" | "view" }): Promise<void> {
  const registry = loadRegistry();
  const entry = registry[usage.skill];
  if (entry === undefined) return;
  registry[usage.skill] =
    usage.kind === "use" ? { ...entry, use: entry.use + 1 } : { ...entry, view: entry.view + 1 };
  await saveRegistry(registry);
}

/**
 * Handle one `PostToolUse` payload: record the call, advance any usage counter,
 * run the rules, and report only findings this session has not already reported.
 *
 * @param input - the host payload.
 * @param config - resolved configuration.
 * @returns the hook output plus what was recorded.
 */
export async function handlePostToolUse(input: HookInput, config: Config): Promise<HookOutcome> {
  const sessionId = str(input.session_id);
  const tool = str(input.tool_name);
  const cwd = str(input.cwd);

  const usage = usageOf(tool, input.tool_input);
  if (usage !== null) await recordUsage(usage);

  const state = loadSession(sessionId) ?? emptySession(sessionId, cwd);
  const recorded = withCall(state, {
    tool,
    paramsHash: paramsHash(tool, input.tool_input),
    ok: !isFailure(str(input.tool_response), config),
  });

  const delivered = unemitted(
    detect({ entries: recorded.entries, toolCalls: recorded.toolCalls, thresholds: config }),
    recorded.emitted,
  );
  const next: SessionState = withEmitted(recorded, delivered.map((finding) => finding.signature));
  await saveSession(next);

  if (delivered.length === 0) return { output: null, delivered, counted: usage };

  return {
    output: {
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: delivered.map((finding) => finding.message).join("\n\n"),
      },
    },
    delivered,
    counted: usage,
  };
}

/**
 * Route one hook payload to its handler.
 *
 * @param event - the event name as the host reported it.
 * @param input - the host payload.
 * @param config - resolved configuration.
 * @returns the hook output, or `null` for events this plugin does not act on.
 */
export async function dispatchHook(
  event: string,
  input: HookInput,
  config: Config,
): Promise<HookOutcome | null> {
  if (event === "PostToolUse") return handlePostToolUse(input, config);
  return null;
}
