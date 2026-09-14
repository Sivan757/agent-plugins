/**
 * The slow loop: what the accumulated library keeps, what it folds, and what it
 * retires.
 *
 * The survival rule is a rate, not a clock. A skill competes on how often it is
 * loaded per turn it has been available for, so one installed during a quiet week
 * is not retired for being young, and one that is never loaded after its
 * probation is not kept for being recent.
 *
 * `evaluate` is a pure function of the registry, the turn count and the
 * thresholds. It touches no disk, so the same library always reaches the same
 * verdict and the decision can be dry-run before it is applied.
 */

import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { requireSkillsRoot, type Config } from "./config.js";
import {
  appendLedger,
  archiveDir,
  loadRegistry,
  requestCount,
  saveRegistry,
  type RegistryEntry,
} from "./store.js";

/** One installed skill as the survival rule sees it. */
export interface Member {
  readonly name: string;
  /** Turn count when it was installed. */
  readonly anchor: number;
  readonly use: number;
  readonly view: number;
}

/** The thresholds the survival rule reads. */
export interface LifecycleOptions {
  /** Turns that must pass after install before a skill leaves probation. */
  readonly maturity: number;
  /** How many graduated skills the root keeps. */
  readonly capacity: number;
}

/** What one evaluation decided, by group. */
export interface LibraryDecision {
  /** Still inside probation: never retired, whatever its use count. */
  readonly probation: string[];
  /** Past probation with no use, but read at least once: spared, and outside the pool. */
  readonly spared: string[];
  /** Past probation and used at least once, competing for capacity. */
  readonly pool: string[];
  /** The skills to retire, lowest rate first where capacity decided it. */
  readonly archive: string[];
}

/** Turns a skill has been available for, which is the rate's denominator. */
export function turnsAvailable(member: Member, requests: number): number {
  return Math.max(0, requests - member.anchor);
}

/** Loads per available turn; 0 when it has not been available for a turn yet. */
export function rate(member: Member, requests: number): number {
  const turns = turnsAvailable(member, requests);
  return turns === 0 ? 0 : member.use / turns;
}

/**
 * Decide what the library retires.
 *
 * @param members - every installed skill.
 * @param requests - turns seen since installation began.
 * @param options - maturity and capacity.
 * @returns each skill's group and the retirement list.
 */
export function evaluate(
  members: readonly Member[],
  requests: number,
  options: LifecycleOptions,
): LibraryDecision {
  const probation: string[] = [];
  const spared: string[] = [];
  const dormant: string[] = [];
  const contested: Array<{ name: string; rate: number }> = [];

  for (const member of [...members].sort((left, right) => left.name.localeCompare(right.name))) {
    if (turnsAvailable(member, requests) < options.maturity) {
      probation.push(member.name);
    } else if (member.use === 0 && member.view > 0) {
      // Read but never loaded: it had recall value, so it is spared — and it does
      // not take a slot in the pool it never competed for.
      spared.push(member.name);
    } else if (member.use === 0) {
      dormant.push(member.name);
    } else {
      contested.push({ name: member.name, rate: rate(member, requests) });
    }
  }

  const archive = [...dormant];
  if (contested.length > options.capacity) {
    const ranked = [...contested].sort((left, right) =>
      left.rate === right.rate ? left.name.localeCompare(right.name) : left.rate - right.rate,
    );
    archive.push(...ranked.slice(0, ranked.length - options.capacity).map((entry) => entry.name));
  }
  const retiring = new Set(archive);

  return {
    probation,
    spared,
    pool: contested.filter((entry) => !retiring.has(entry.name)).map((entry) => entry.name).sort(),
    archive: archive.sort(),
  };
}

/**
 * Read the installed library as survival-rule members.
 *
 * @returns every installed skill.
 */
export function listMembers(): Member[] {
  const registry = loadRegistry();
  return Object.entries(registry).map(([name, entry]) => ({
    name,
    anchor: entry.anchor,
    use: entry.use,
    view: entry.view,
  }));
}

/**
 * Move one installed skill out of the skills root and into the archive.
 *
 * Retiring is a move, never a delete: the directory keeps its files, and the
 * ledger keeps the reason, so the decision can be reviewed and reversed by hand.
 *
 * @param name - the installed skill name.
 * @param config - resolved configuration.
 * @param options - the ledger action plus, for a fold, what absorbed it.
 * @returns the archive path, or `null` when the skill was not installed.
 */
export async function retire(
  name: string,
  config: Config,
  options: { action: "archive" | "merge"; reason: string; absorbedInto?: string },
): Promise<string | null> {
  const registry = loadRegistry();
  const entry = registry[name];
  if (entry === undefined) return null;

  const source = entry.path !== "" ? entry.path : join(requireSkillsRoot(config), name);
  const destination = join(archiveDir(), name);
  if (existsSync(source)) {
    rmSync(destination, { recursive: true, force: true });
    cpSync(source, destination, { recursive: true });
    rmSync(source, { recursive: true, force: true });
  }

  delete registry[name];
  await saveRegistry(registry);
  appendLedger({
    name,
    action: options.action,
    reason: options.reason,
    ...(options.absorbedInto === undefined ? {} : { absorbedInto: options.absorbedInto }),
  });
  return destination;
}

/**
 * Apply the survival rule.
 *
 * @param config - resolved configuration.
 * @param apply - when false, report the decision without touching the root.
 * @returns the decision and what was actually retired.
 */
export async function curate(
  config: Config,
  apply: boolean,
): Promise<{ decision: LibraryDecision; retired: string[] }> {
  const requests = requestCount();
  const decision = evaluate(listMembers(), requests, {
    maturity: config.maturity,
    capacity: config.capacity,
  });
  if (!apply) return { decision, retired: [] };

  const retired: string[] = [];
  for (const name of decision.archive) {
    const archived = await retire(name, config, {
      action: "archive",
      reason: `never loaded after ${config.maturity} turns of probation, or the lowest rate above capacity ${config.capacity}`,
    });
    if (archived !== null) retired.push(name);
  }
  return { decision, retired };
}

/**
 * Fold one skill into another.
 *
 * The absorbing skill must be installed, must be a different skill, and must be
 * known to this library; a name the model invented fails here rather than
 * retiring a skill into a destination that does not exist.
 *
 * @param config - resolved configuration.
 * @param narrow - the skill being absorbed.
 * @param umbrella - the skill that keeps the content.
 * @param reason - why they were folded together.
 * @returns the archive path.
 * @throws Error when either name is unusable.
 */
export async function mergeInto(
  config: Config,
  narrow: string,
  umbrella: string,
  reason: string,
): Promise<string> {
  const registry = loadRegistry();
  if (registry[narrow] === undefined) throw new Error(`${narrow} is not an installed skill`);
  const umbrellaEntry = registry[umbrella];
  if (umbrellaEntry === undefined) throw new Error(`${umbrella} is not an installed skill`);
  if (narrow === umbrella) throw new Error("a skill cannot absorb itself");

  registry[umbrella] = { ...umbrellaEntry, patches: umbrellaEntry.patches + 1 };
  await saveRegistry(registry);

  appendLedger({ name: umbrella, action: "patch", reason: `absorbed ${narrow}` });
  const archived = await retire(narrow, config, { action: "merge", reason, absorbedInto: umbrella });
  if (archived === null) throw new Error(`could not retire ${narrow}`);
  return archived;
}

/**
 * List what has been archived, newest name first.
 *
 * @returns archived skill names.
 */
export function listArchived(): string[] {
  const dir = archiveDir();
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/**
 * Describe one installed skill for the report.
 *
 * @param name - the installed skill name.
 * @param entry - its registry entry.
 * @param requests - the current turn count.
 * @returns a one-line summary.
 */
export function describe(name: string, entry: RegistryEntry, requests: number): string {
  const turns = turnsAvailable({ name, anchor: entry.anchor, use: entry.use, view: entry.view }, requests);
  const perTurn = turns === 0 ? 0 : entry.use / turns;
  return `${name} use=${entry.use} view=${entry.view} turns=${turns} rate=${perTurn.toFixed(4)} patches=${entry.patches}`;
}
