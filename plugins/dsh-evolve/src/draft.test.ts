/**
 * Behaviour tests for the draft pipeline, run against a scratch cache directory
 * and a scratch skills root so nothing here touches the operator's real ones.
 *
 * The two that matter most are the last pair: a draft whose check fails must not
 * reach the skills root, and one whose check passes must arrive complete.
 */

import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const CACHE = mkdtempSync(join(tmpdir(), "dsh-evolve-cache-"));
const SKILLS = mkdtempSync(join(tmpdir(), "dsh-evolve-skills-"));
process.env.AGENT_PLUGINS_CACHE_DIR = CACHE;

const { DEFAULT_ERROR_PATTERN } = await import("./config.js");
import type { Config } from "./config.js";
const { checkDraft, listDrafts, promoteDraft, renderSkill, stageDraft, subfileError, validateManifest } =
  await import("./draft.js");
const { loadRegistry } = await import("./store.js");

function config(): Config {
  return {
    activityQuantum: 20,
    repeatCalls: 2,
    errorStreak: 3,
    errorPattern: DEFAULT_ERROR_PATTERN,
    skillsRoot: SKILLS,
    maturity: 100,
    capacity: 20,
    verifyTimeoutMs: 20_000,
  };
}

function manifest(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: "auto-demo",
    description: "Prove the pipeline works. Use when a test needs a staged draft.",
    body: "# Demo\n\nRun the check.\n",
    verify: { command: "node scripts/check.mjs", expectExit: 0 },
    files: { "scripts/check.mjs": "process.exit(0)\n" },
    ...overrides,
  };
}

test("a manifest with no runnable file is rejected", () => {
  const errors = validateManifest(manifest({ files: { "references/notes.md": "hi" } }));
  assert.ok(errors.some((error) => error.includes("scripts/")), errors.join("; "));
});

test("a manifest with an empty file map is rejected", () => {
  const errors = validateManifest(manifest({ files: {} }));
  assert.ok(errors.some((error) => error.includes("at least one file")), errors.join("; "));
});

test("names must carry the reserved prefix", () => {
  assert.ok(validateManifest(manifest({ name: "demo" })).some((error) => error.includes("name must match")));
  assert.deepEqual(validateManifest(manifest()), []);
});

test("a description longer than the catalog cap is rejected", () => {
  const errors = validateManifest(manifest({ description: "x".repeat(501) }));
  assert.ok(errors.some((error) => error.includes("truncates")), errors.join("; "));
});

test("escaping and stray paths are rejected", () => {
  assert.match(subfileError("../../etc/passwd") ?? "", /relative|\.\./);
  assert.match(subfileError("/etc/passwd") ?? "", /relative/);
  assert.match(subfileError("scripts/../../x.js") ?? "", /\.\./);
  assert.match(subfileError("src/thing.js") ?? "", /first segment/);
  assert.match(subfileError("scripts/") ?? "", /usable path segment|not a usable/);
  assert.equal(subfileError("scripts/check.mjs"), null);
  assert.equal(subfileError("references/manual.md"), null);
});

test("renderSkill writes the frontmatter the loaders read", () => {
  const rendered = renderSkill({
    name: "auto-demo",
    description: "Does a thing. Use when the thing is needed.",
    body: "# Demo\n",
    verify: { command: "true", expectExit: 0 },
    files: {},
  });
  assert.ok(rendered.startsWith("---\nname: auto-demo\ndescription: "));
  assert.ok(rendered.includes("\n---\n# Demo\n"));
});

test("a check that fails keeps the draft out of the skills root", async () => {
  stageDraft(
    manifest({
      name: "auto-broken",
      files: { "scripts/check.mjs": "process.exit(3)\n" },
    }) as never,
  );
  const outcome = checkDraft("auto-broken", config());
  assert.equal(outcome.ok, false);
  assert.equal(outcome.exitCode, 3);
  await assert.rejects(() => promoteDraft("auto-broken", config()), /refusing to promote/);
  assert.deepEqual(
    loadRegistry()["auto-broken"],
    undefined,
    "a failed draft must not reach the registry",
  );
});

test("a check that passes installs the skill complete and records it", async () => {
  stageDraft(manifest({ name: "auto-working" }) as never);
  const outcome = checkDraft("auto-working", config());
  assert.equal(outcome.ok, true, outcome.stderr);

  const target = await promoteDraft("auto-working", config());
  const skill = readFileSync(join(target, "SKILL.md"), "utf-8");
  assert.ok(skill.includes("name: auto-working"));
  assert.ok(skill.includes("description: Prove the pipeline works"));
  assert.ok(
    readFileSync(join(target, "scripts", "check.mjs"), "utf-8").includes("process.exit(0)"),
    "the script ships with the skill",
  );

  const registry = loadRegistry();
  assert.ok(registry["auto-working"] !== undefined, "the installed skill is registered");
  assert.equal(registry["auto-working"]?.use, 0);
  assert.equal(registry["auto-working"]?.path, target);

  assert.ok(!listDrafts().includes("auto-working"), "promotion consumes the staged draft");
});

test("a staged draft survives a round trip through the staging manifest", () => {
  stageDraft(manifest({ name: "auto-roundtrip" }) as never);
  assert.ok(listDrafts().includes("auto-roundtrip"));
  const staged = checkDraft("auto-roundtrip", config());
  assert.equal(staged.ok, true);
});

test("re-promoting an installed skill patches it without resetting its history", async () => {
  stageDraft(manifest({ name: "auto-updatable" }) as never);
  await promoteDraft("auto-updatable", config());
  const first = loadRegistry()["auto-updatable"];
  assert.equal(first?.patches, 0);

  stageDraft(manifest({ name: "auto-updatable", body: "# Demo\n\nSecond revision.\n" }) as never);
  const target = await promoteDraft("auto-updatable", config());
  const second = loadRegistry()["auto-updatable"];

  assert.equal(second?.patches, 1, "an update is recorded as a patch");
  assert.equal(second?.anchor, first?.anchor, "an update does not reset probation");
  assert.equal(second?.createdAt, first?.createdAt, "installation time is preserved");
  assert.ok(readFileSync(join(target, "SKILL.md"), "utf-8").includes("Second revision"));
});

test("the scratch roots really were scratch", () => {
  assert.ok(CACHE.startsWith(tmpdir()));
  assert.ok(SKILLS.startsWith(tmpdir()));
  writeFileSync(join(CACHE, "sentinel"), "ok\n");
});
