/**
 * The draft pipeline: stage, check, promote.
 *
 * A draft is a skill that has been written but not yet trusted. It becomes a
 * skill only after the command it ships with actually runs and exits as declared,
 * which is the whole point of the layer: a note can be wrong for a year without
 * anyone noticing, but a script that fails is a fact.
 *
 * Nothing here is written by the model directly. The model produces a manifest,
 * this module validates every field and path, and only then does anything reach
 * the disk.
 */

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  DESCRIPTION_MAX_CHARS,
  FILE_MAX_BYTES,
  PLUGIN_NAME,
  SUBFILE_DIRS,
  VERIFY_COMMAND_MAX_CHARS,
  requireSkillsRoot,
  type Config,
} from "./config.js";
import { appendLedger, loadRegistry, requestCount, saveRegistry } from "./store.js";
import { ensurePrivatePluginDirSync, pluginFilePath } from "@agent-plugins/config-center";

/** The one prefix an accumulated skill may carry. */
const SKILL_NAME = /^auto-[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** One path segment of a shipped subfile. */
const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** The staging manifest, as the model produces it. */
export interface DraftManifest {
  readonly name: string;
  /** Goes into the skill frontmatter; the only field the catalog shows. */
  readonly description: string;
  /** The `SKILL.md` body, below the frontmatter. */
  readonly body: string;
  /** How to prove the draft still works. */
  readonly verify: { readonly command: string; readonly expectExit: number };
  /** Subfiles to ship, keyed by their path inside the skill directory. */
  readonly files: Record<string, string>;
}

/** What a check run produced. */
export interface CheckOutcome {
  readonly ok: boolean;
  readonly exitCode: number | null;
  readonly timedOut: boolean;
  readonly stdout: string;
  readonly stderr: string;
}

function draftsDir(): string {
  return pluginFilePath(PLUGIN_NAME, "library", "drafts");
}

/** Absolute path of one staged draft. */
export function draftDir(name: string): string {
  return join(draftsDir(), name);
}

function draftManifestPath(name: string): string {
  return join(draftDir(name), "draft.json");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Whether one shipped subfile path is safe and allowed.
 *
 * @param path - the path as the model wrote it.
 * @returns a message when the path is rejected, or `null` when it is acceptable.
 */
export function subfileError(path: string): string | null {
  if (path.trim() === "") return "a file path is empty";
  if (path.includes("\\")) return `${path}: use forward slashes`;
  if (path.startsWith("/") || /^[A-Za-z]:/.test(path)) return `${path}: must be relative`;
  const segments = path.split("/");
  if (segments.length < 2) return `${path}: must be inside one of ${SUBFILE_DIRS.join(", ")}`;
  if (segments.some((segment) => segment === ".." || segment === ".")) {
    return `${path}: must not contain . or ..`;
  }
  if (!(SUBFILE_DIRS as readonly string[]).includes(segments[0] ?? "")) {
    return `${path}: the first segment must be one of ${SUBFILE_DIRS.join(", ")}`;
  }
  const bad = segments.find((segment) => !SEGMENT.test(segment));
  return bad === undefined ? null : `${path}: "${bad}" is not a usable path segment`;
}

/**
 * Validate an untrusted manifest.
 *
 * @param value - the parsed manifest.
 * @returns every problem found; an empty array means the manifest may be staged.
 */
export function validateManifest(value: unknown): string[] {
  const errors: string[] = [];
  if (!isRecord(value)) return ["manifest must be a JSON object"];

  const name = value.name;
  if (typeof name !== "string" || !SKILL_NAME.test(name)) {
    errors.push(`name must match ${SKILL_NAME} (for example "auto-gate-check")`);
  }

  const description = value.description;
  if (typeof description !== "string" || description.trim() === "") {
    errors.push("description must be a non-empty string");
  } else if (description.length > DESCRIPTION_MAX_CHARS) {
    errors.push(`description is ${description.length} characters; the catalog truncates at ${DESCRIPTION_MAX_CHARS}`);
  }

  if (typeof value.body !== "string" || value.body.trim() === "") {
    errors.push("body must be the SKILL.md content below the frontmatter");
  }

  const verify = value.verify;
  if (!isRecord(verify)) {
    errors.push("verify must be an object with command and expectExit");
  } else {
    const command = verify.command;
    if (typeof command !== "string" || command.trim() === "") {
      errors.push("verify.command must be a non-empty string");
    } else if (command.length > VERIFY_COMMAND_MAX_CHARS) {
      errors.push(`verify.command is longer than ${VERIFY_COMMAND_MAX_CHARS} characters`);
    }
    if (typeof verify.expectExit !== "number" || !Number.isInteger(verify.expectExit)) {
      errors.push("verify.expectExit must be an integer");
    }
  }

  const files = value.files;
  if (!isRecord(files)) {
    errors.push("files must be an object mapping each relative path to its content");
  } else {
    const paths = Object.keys(files);
    if (paths.length === 0) {
      errors.push("files must ship at least one file; a skill with nothing runnable is a note, not a skill");
    }
    for (const path of paths) {
      const problem = subfileError(path);
      if (problem !== null) errors.push(problem);
      const content = files[path];
      if (typeof content !== "string") {
        errors.push(`${path}: content must be a string`);
      } else if (Buffer.byteLength(content, "utf-8") > FILE_MAX_BYTES) {
        errors.push(`${path}: larger than ${FILE_MAX_BYTES} bytes`);
      }
    }
    if (!paths.some((path) => path.startsWith("scripts/"))) {
      errors.push("files must include at least one path under scripts/ for verify to run");
    }
  }

  return errors;
}

/**
 * Render the `SKILL.md` a manifest describes.
 *
 * @param manifest - a validated manifest.
 * @returns frontmatter plus body, in the shape the skill loaders read.
 */
export function renderSkill(manifest: DraftManifest): string {
  const frontmatter = ["---", `name: ${manifest.name}`, `description: ${manifest.description}`, "---", ""].join("\n");
  return `${frontmatter}${manifest.body.trimEnd()}\n`;
}

/**
 * Write a validated manifest into the staging area.
 *
 * @param manifest - a validated manifest.
 * @returns the staged directory.
 */
export function stageDraft(manifest: DraftManifest): string {
  const dir = draftDir(manifest.name);
  rmSync(dir, { recursive: true, force: true });
  ensurePrivatePluginDirSync(PLUGIN_NAME, "library", "drafts", manifest.name);

  for (const [path, content] of Object.entries(manifest.files)) {
    const target = join(dir, ...path.split("/"));
    mkdirSync(join(target, ".."), { recursive: true });
    writeFileSync(target, content, { encoding: "utf-8", mode: 0o600 });
  }
  writeFileSync(join(dir, "SKILL.md"), renderSkill(manifest), { encoding: "utf-8", mode: 0o600 });
  writeFileSync(
    draftManifestPath(manifest.name),
    `${JSON.stringify({ name: manifest.name, description: manifest.description, verify: manifest.verify }, null, 2)}\n`,
    { encoding: "utf-8", mode: 0o600 },
  );
  return dir;
}

/**
 * Read a staged draft's staging manifest.
 *
 * The `SKILL.md` is not re-read here: promotion copies the staged tree, so the
 * only fields worth parsing back are the name and the check it declares.
 *
 * @param name - the staged skill name.
 * @returns the parsed manifest, or `null` when it is missing or unreadable.
 */
export function readDraftManifest(name: string): DraftManifest | null {
  const path = draftManifestPath(name);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8")) as Record<string, unknown>;
    const verify = isRecord(parsed.verify) ? parsed.verify : {};
    return {
      name: typeof parsed.name === "string" ? parsed.name : name,
      description: typeof parsed.description === "string" ? parsed.description : "",
      body: "",
      verify: {
        command: typeof verify.command === "string" ? verify.command : "",
        expectExit: typeof verify.expectExit === "number" ? verify.expectExit : 0,
      },
      files: {},
    };
  } catch {
    return null;
  }
}

/**
 * List staged drafts.
 *
 * @returns every staged draft name.
 */
export function listDrafts(): string[] {
  const dir = draftsDir();
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/**
 * Run a draft's own check.
 *
 * This is the only signal the plugin treats as ground truth: the draft either
 * produces its result on demand or it does not.
 *
 * @param name - the staged draft name.
 * @param config - resolved configuration.
 * @returns what the run produced; a missing draft fails rather than throwing.
 */
export function checkDraft(name: string, config: Config): CheckOutcome {
  const manifest = readDraftManifest(name);
  if (manifest === null) {
    return { ok: false, exitCode: null, timedOut: false, stdout: "", stderr: `no staged draft named ${name}` };
  }
  if (manifest.verify.command.trim() === "") {
    return { ok: false, exitCode: null, timedOut: false, stdout: "", stderr: "the draft declares no verify command" };
  }

  const result = spawnSync(manifest.verify.command, {
    shell: true,
    cwd: draftDir(name),
    timeout: config.verifyTimeoutMs,
    encoding: "utf-8",
    maxBuffer: FILE_MAX_BYTES,
    env: { ...process.env, DSH_EVOLVE_DRAFT: name },
  });

  const timedOut = result.error !== undefined && (result.error as NodeJS.ErrnoException).code === "ETIMEDOUT";
  const exitCode = result.status;
  return {
    ok: !timedOut && exitCode === manifest.verify.expectExit,
    exitCode,
    timedOut,
    stdout: (result.stdout ?? "").slice(0, 4000),
    stderr: timedOut
      ? `timed out after ${config.verifyTimeoutMs}ms`
      : (result.stderr ?? "").slice(0, 4000),
  };
}

/**
 * Install a checked draft into the skills root.
 *
 * The check runs again here rather than trusting an earlier one, because the
 * thing being promoted is the thing that just ran.
 *
 * The registry write is awaited: this runs in a short-lived process, and a
 * fire-and-forget write would be lost when the process exits before it lands.
 *
 * @param name - the staged draft name.
 * @param config - resolved configuration.
 * @returns the installed directory.
 * @throws Error when the draft is missing or its check does not pass.
 */
export async function promoteDraft(name: string, config: Config): Promise<string> {
  const manifest = readDraftManifest(name);
  if (manifest === null) throw new Error(`no staged draft named ${name}`);

  const outcome = checkDraft(name, config);
  if (!outcome.ok) {
    throw new Error(
      `refusing to promote ${name}: its check did not pass ` +
        `(exit ${outcome.exitCode ?? "none"}${outcome.timedOut ? ", timed out" : ""}).\n` +
        `${outcome.stderr.trim() || outcome.stdout.trim() || "no output"}`,
    );
  }

  const root = requireSkillsRoot(config);
  const target = join(root, name);
  mkdirSync(root, { recursive: true });
  rmSync(target, { recursive: true, force: true });
  cpSync(draftDir(name), target, {
    recursive: true,
    filter: (source) => !source.endsWith("draft.json"),
  });

  const registry = loadRegistry();
  const existing = registry[name];
  registry[name] = {
    // An update keeps the original anchor and usage history: replacing a skill's
    // content must not hand it a fresh probation or erase what it has earned.
    anchor: existing?.anchor ?? requestCount(),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    use: existing?.use ?? 0,
    view: existing?.view ?? 0,
    patches: existing === undefined ? 0 : existing.patches + 1,
    path: target,
  };
  await saveRegistry(registry);
  appendLedger(
    existing === undefined
      ? { name, action: "create", reason: "check passed; installed into the skills root" }
      : { name, action: "patch", reason: "check passed; replaced the installed content" },
  );
  rmSync(draftDir(name), { recursive: true, force: true });
  return target;
}

/**
 * Discard a staged draft.
 *
 * @param name - the staged draft name.
 * @param reason - why it was discarded, recorded in the ledger.
 * @returns whether anything was removed.
 */
export function dropDraft(name: string, reason: string): boolean {
  const dir = draftDir(name);
  if (!existsSync(dir)) return false;
  rmSync(dir, { recursive: true, force: true });
  appendLedger({ name, action: "drop", reason });
  return true;
}

/**
 * Size of a staged draft, for the status report.
 *
 * @param name - the staged draft name.
 * @returns total bytes of its files, or 0 when it does not exist.
 */
export function draftBytes(name: string): number {
  const dir = draftDir(name);
  if (!existsSync(dir)) return 0;
  let total = 0;
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) total += statSync(full).size;
    }
  };
  walk(dir);
  return total;
}
