/**
 * The plugin's configuration and the paths every other module builds on.
 *
 * Defaults live here and every one is overridable from the plugin's stored
 * `config.json`, so tuning the loop never means editing the bundle.
 */

import { loadConfig } from "@agent-plugins/config-center";
import type { Thresholds } from "./detect.js";

export const PLUGIN_NAME = "dsh-evolve";

/** Where the fast loop keeps its per-session trace, relative to the plugin directory. */
export const STATE_SEGMENTS = ["state", "sessions"] as const;

/** How many recent calls one session keeps. Older ones still count toward totals. */
export const TRACE_LIMIT = 200;

/** How many finding signatures one session remembers, bounding the state file. */
export const EMITTED_LIMIT = 50;

/** A tool result whose text starts like this counts as a failure. */
export const DEFAULT_ERROR_PATTERN = String.raw`^\s*(?:Error|ERROR)\b`;

/**
 * The defaults that do not depend on the environment.
 *
 * The skills root is deliberately absent: it is resolved per call so a changed
 * home or an override takes effect without re-importing this module.
 */
export const DEFAULT_THRESHOLDS: Thresholds & { readonly errorPattern: string } = {
  activityQuantum: 20,
  repeatCalls: 2,
  errorStreak: 3,
  errorPattern: DEFAULT_ERROR_PATTERN,
};

/** Longest accepted skill description. The session catalog truncates at 500. */
export const DESCRIPTION_MAX_CHARS = 500;

/** Longest accepted `verify.command`. */
export const VERIFY_COMMAND_MAX_CHARS = 500;

/** Largest accepted single staged file. */
export const FILE_MAX_BYTES = 256 * 1024;

/** The only directory segments a draft may ship files under. */
export const SUBFILE_DIRS = ["scripts", "references", "assets", "templates"] as const;

export interface Config extends Thresholds {
  /** Source text of the pattern that marks a failed tool result. */
  readonly errorPattern: string;
  /** Directory promoted skills are installed into. */
  readonly skillsRoot: string;
  /** Turns that must pass after install before a skill leaves probation. */
  readonly maturity: number;
  /** How many graduated skills the root keeps before the lowest-rate ones retire. */
  readonly capacity: number;
  /** How long one `draft check` may run, in milliseconds. */
  readonly verifyTimeoutMs: number;
}

/**
 * The default skill root: `~/.agents/skills`, which both Claude Code and DeepSeek
 * Harness scan.
 *
 * This is an output location a person can name, not plugin storage, so it is a
 * `Config` field rather than a path derived from the plugin's cache directory.
 * The plugin's own data still lives under the cache root and honours
 * `AGENT_PLUGINS_CACHE_DIR`; only the promoted artifacts go here.
 */
function defaultSkillsRoot(): string {
  const home = (process.env.HOME ?? process.env.USERPROFILE ?? "").trim();
  return home === "" ? "" : `${home}/.agents/skills`;
}

/**
 * Read the stored config, falling back per field.
 *
 * @returns the effective configuration; a missing, unreadable or partial
 *   `config.json` yields the defaults rather than failing the hook.
 */
export async function resolveConfig(): Promise<Config> {
  let stored: Record<string, unknown> | null = null;
  try {
    stored = await loadConfig<Record<string, unknown>>(PLUGIN_NAME);
  } catch {
    // A malformed config must not break the hook that every tool call runs.
    stored = null;
  }

  const fallback: Config = {
    ...DEFAULT_THRESHOLDS,
    skillsRoot: defaultSkillsRoot(),
    maturity: 100,
    capacity: 20,
    verifyTimeoutMs: 60_000,
  };
  if (stored === null) return fallback;

  return {
    activityQuantum: positiveInt(stored.activityQuantum, fallback.activityQuantum),
    repeatCalls: positiveInt(stored.repeatCalls, fallback.repeatCalls),
    errorStreak: positiveInt(stored.errorStreak, fallback.errorStreak),
    errorPattern: nonEmpty(stored.errorPattern, fallback.errorPattern),
    skillsRoot: nonEmpty(stored.skillsRoot, fallback.skillsRoot),
    maturity: positiveInt(stored.maturity, fallback.maturity),
    capacity: positiveInt(stored.capacity, fallback.capacity),
    verifyTimeoutMs: positiveInt(stored.verifyTimeoutMs, fallback.verifyTimeoutMs),
  };
}

/**
 * The skill root, or a failure naming what to configure.
 *
 * @param config - resolved configuration.
 * @returns the absolute skills root.
 * @throws Error when no root could be resolved and none was configured.
 */
export function requireSkillsRoot(config: Config): string {
  if (config.skillsRoot.trim() === "") {
    throw new Error(
      `no skills root: set "skillsRoot" in ${PLUGIN_NAME}'s config.json to the directory accumulated skills should be installed into`,
    );
  }
  return config.skillsRoot;
}

function positiveInt(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : fallback;
}

function nonEmpty(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

/**
 * Compile the failure pattern, degrading to the default when the stored one is
 * not a valid regular expression.
 *
 * @param config - resolved configuration.
 * @returns a pattern that never throws on a tool result.
 */
export function failurePattern(config: Config): RegExp {
  try {
    return new RegExp(config.errorPattern);
  } catch {
    return new RegExp(DEFAULT_ERROR_PATTERN);
  }
}
