/**
 * The fast loop's detection rules.
 *
 * Every rule is a total function of the recorded trace plus its thresholds, so
 * one trace always yields the same findings and nothing here reads or writes the
 * filesystem. Each finding carries a signature the caller uses to report it once.
 *
 * These rules are deterministic on purpose: the hook that runs them is not an
 * inference step, and a trigger the model could talk itself out of would not be
 * a trigger.
 */

/** One tool call, reduced to the fields the rules compare. */
export interface TraceEntry {
  /** Tool name exactly as the host reported it. */
  readonly tool: string;
  /** Digest of the call arguments; equal digests mean identical arguments. */
  readonly paramsHash: string;
  /** Whether the call succeeded. */
  readonly ok: boolean;
}

/** When each rule speaks up. */
export interface Thresholds {
  /** Recorded calls in one session before the volume rule fires. */
  readonly activityQuantum: number;
  /** Occurrences of one tool-and-arguments pair before the repeat rule fires. */
  readonly repeatCalls: number;
  /** Trailing failures before the streak rule fires. */
  readonly errorStreak: number;
}

export type FindingKind = "repeat-call" | "error-streak" | "high-activity";

/** One rule that fired, plus the identity that makes it reportable once. */
export interface Finding {
  readonly kind: FindingKind;
  /** Stable while the same situation holds; the caller suppresses repeats by it. */
  readonly signature: string;
  /** Model-facing text. */
  readonly message: string;
}

/** The trace a session has accumulated, plus the totals the ring buffer drops. */
export interface DetectionInput {
  /** Most recent calls, oldest first. */
  readonly entries: readonly TraceEntry[];
  /** Every call this session recorded, including ones `entries` no longer holds. */
  readonly toolCalls: number;
  readonly thresholds: Thresholds;
}

/** How many tool names a streak or repeat message names before it summarizes. */
const NAMED_TOOLS = 3;

function listTools(tools: readonly string[]): string {
  const unique = [...new Set(tools)];
  const named = unique.slice(0, NAMED_TOOLS).map((tool) => `\`${tool}\``).join(", ");
  return unique.length > NAMED_TOOLS ? `${named} and ${unique.length - NAMED_TOOLS} more` : named;
}

function trailingFailures(entries: readonly TraceEntry[]): TraceEntry[] {
  const failed: TraceEntry[] = [];
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    if (entry === undefined || entry.ok) break;
    failed.push(entry);
  }
  return failed;
}

/**
 * Run every rule against one session's trace.
 *
 * @param input - the trace, its lifetime total, and the active thresholds.
 * @returns every rule currently firing, in a stable order; an empty array when
 *   the session is behaving normally.
 */
export function detect(input: DetectionInput): Finding[] {
  const { entries, toolCalls, thresholds } = input;
  const findings: Finding[] = [];
  const last = entries.at(-1);

  if (last !== undefined) {
    const repeats = entries.filter(
      (entry) => entry.tool === last.tool && entry.paramsHash === last.paramsHash,
    ).length;
    if (repeats >= thresholds.repeatCalls) {
      findings.push({
        kind: "repeat-call",
        signature: `repeat-call:${last.tool}:${last.paramsHash}`,
        message:
          `\`${last.tool}\` ran ${repeats} times with identical arguments and this is the same call repeating. ` +
          `Identical input rarely produces a different result: change the arguments, or skip the call and do the step another way.`,
      });
    }

    const failed = trailingFailures(entries);
    if (failed.length >= thresholds.errorStreak) {
      findings.push({
        kind: "error-streak",
        signature: `error-streak:${failed.length}:${[...new Set(failed.map((entry) => entry.tool))].sort().join(",")}`,
        message:
          `The last ${failed.length} tool calls failed (${listTools(failed.map((entry) => entry.tool))}). ` +
          `Calling them again in the same shape will not clear this: change the approach, or report the blocker instead of looping.`,
      });
    }
  }

  if (toolCalls >= thresholds.activityQuantum) {
    const milestone = Math.floor(toolCalls / thresholds.activityQuantum);
    findings.push({
      kind: "high-activity",
      signature: `high-activity:${milestone}`,
      message:
        `${toolCalls} tool calls in this session. If a repeatable procedure emerged, fold it into a skill now while the steps ` +
        `are still in context; load the \`skill-evolution\` skill for when that is worth doing and when it is not.`,
    });
  }

  return findings;
}

/**
 * Keep only the findings this session has not already reported.
 *
 * @param findings - everything currently firing.
 * @param emitted - signatures already delivered to the model.
 * @returns the findings worth delivering now.
 */
export function unemitted(findings: readonly Finding[], emitted: readonly string[]): Finding[] {
  const seen = new Set(emitted);
  return findings.filter((finding) => !seen.has(finding.signature));
}
