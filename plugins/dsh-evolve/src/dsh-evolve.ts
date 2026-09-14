#!/usr/bin/env node
/**
 * dsh-evolve CLI entry point.
 *
 * `hook` is what `hooks/hooks.json` runs: one short-lived process per tool call
 * and per turn. `status`, `draft` and `library` are the surfaces the agent and the
 * user drive.
 *
 * The hook path never fails the host. Any error there is reported on stderr and
 * the process still exits 0, because a plugin that breaks every tool call is worse
 * than one that observes nothing.
 */

import { Command, CommanderError } from "commander";
import { readFileSync } from "node:fs";
import { PLUGIN_NAME, resolveConfig } from "./config.js";
import { checkDraft, draftBytes, dropDraft, listDrafts, promoteDraft, stageDraft, validateManifest, type DraftManifest } from "./draft.js";
import { dispatchHook, type HookInput } from "./hook.js";
import { curate, describe, listArchived, listMembers, mergeInto } from "./library.js";
import {
  bumpRequests,
  loadRegistry,
  readLedger,
  requestCount,
  retirementCauses,
} from "./store.js";

const VERSION = "0.2.0";

function readStdin(): string {
  try {
    return readFileSync(0, "utf-8");
  } catch {
    return "";
  }
}

function parseJson(text: string): unknown {
  const trimmed = text.trim();
  return trimmed === "" ? null : JSON.parse(trimmed);
}

function shortKey(key: string): string {
  return key.length > 12 ? `${key.slice(0, 12)}…` : key;
}

const program = new Command();

program
  .name(PLUGIN_NAME)
  .version(VERSION)
  .description("Count tool activity, stage skill drafts, and keep the accumulated library honest.");

program
  .command("hook")
  .argument("<event>", "hook event name as the host reports it")
  .description("run one hook invocation; reads the host payload from stdin")
  .action(async (event: string) => {
    try {
      let input: HookInput = {};
      try {
        const parsed = parseJson(readStdin());
        if (parsed !== null && typeof parsed === "object") input = parsed as HookInput;
      } catch {
        return; // a payload we cannot parse is one we do not act on
      }

      if (event === "Stop") {
        await bumpRequests();
        return;
      }

      const config = await resolveConfig();
      const outcome = await dispatchHook(event, input, config);
      if (outcome?.output != null) process.stdout.write(`${JSON.stringify(outcome.output)}\n`);
    } catch (error) {
      process.stderr.write(`[${PLUGIN_NAME}] ${(error as Error).message}\n`);
    }
  });

program
  .command("status")
  .argument("[session]", "one session key; omit to list every recorded session")
  .description("show the trace, the library, and the thresholds in force")
  .action(async (session: string | undefined) => {
    const config = await resolveConfig();
    process.stdout.write(
      `${PLUGIN_NAME} ${VERSION}\n` +
        `thresholds: activity=${config.activityQuantum} repeat=${config.repeatCalls} streak=${config.errorStreak}\n` +
        `skills root: ${config.skillsRoot || "(unset)"}\n` +
        `survival: maturity=${config.maturity} turns capacity=${config.capacity}\n` +
        `turns seen: ${requestCount()}\n\n`,
    );

    const members = listMembers();
    process.stdout.write(`library: ${members.length} installed, ${listArchived().length} archived\n`);
    for (const member of members) {
      const entry = loadRegistry()[member.name];
      if (entry !== undefined) process.stdout.write(`  ${describe(member.name, entry, requestCount())}\n`);
    }

    const staged = listDrafts();
    process.stdout.write(`\ndrafts: ${staged.length} staged\n`);
    for (const name of staged) process.stdout.write(`  ${name} (${draftBytes(name)} bytes)\n`);

    process.stdout.write("\n");
    const keys = session !== undefined ? [session] : [];
    if (session === undefined) {
      const { listSessionIds } = await import("./store.js");
      keys.push(...listSessionIds());
    }
    if (keys.length === 0) {
      process.stdout.write("no session has recorded a tool call yet\n");
      return;
    }
    for (const key of keys) {
      const { loadSession } = await import("./store.js");
      const state = loadSession(key);
      if (state === null) {
        process.stdout.write(`${key}: no state\n`);
        continue;
      }
      const failures = state.entries.filter((entry) => !entry.ok).length;
      process.stdout.write(
        `session ${shortKey(key)} calls=${state.toolCalls} recent=${state.entries.length} ` +
          `failures=${failures} reported=${state.emitted.length}\n`,
      );
    }
  });

const draft = program.command("draft").description("stage, check, promote, and discard skill drafts");

draft
  .command("stage")
  .option("--file <path>", "read the manifest from this file instead of stdin")
  .description("validate and stage a draft from a JSON manifest")
  .action(async (options: { file?: string }) => {
    const text = options.file === undefined ? readStdin() : readFileSync(options.file, "utf-8");
    const manifest = parseJson(text);
    const errors = validateManifest(manifest);
    if (errors.length > 0) {
      process.stderr.write(`[${PLUGIN_NAME}] the manifest was rejected:\n`);
      for (const error of errors) process.stderr.write(`  - ${error}\n`);
      process.exit(1);
    }
    const dir = stageDraft(manifest as DraftManifest);
    process.stdout.write(`staged ${(manifest as DraftManifest).name} at ${dir}\n`);
    process.stdout.write(`next: ${PLUGIN_NAME} draft check ${(manifest as DraftManifest).name}\n`);
  });

draft
  .command("list")
  .description("list staged drafts")
  .action(() => {
    const names = listDrafts();
    if (names.length === 0) {
      process.stdout.write("no staged drafts\n");
      return;
    }
    for (const name of names) process.stdout.write(`${name} (${draftBytes(name)} bytes)\n`);
  });

draft
  .command("check")
  .argument("<name>", "staged draft name")
  .description("run the draft's own check; this is the only pass or fail that counts")
  .action(async (name: string) => {
    const outcome = checkDraft(name, await resolveConfig());
    if (outcome.stdout.trim() !== "") process.stdout.write(`${outcome.stdout.trimEnd()}\n`);
    if (outcome.stderr.trim() !== "") process.stderr.write(`${outcome.stderr.trimEnd()}\n`);
    process.stdout.write(`${name}: ${outcome.ok ? "PASS" : "FAIL"} (exit ${outcome.exitCode ?? "none"})\n`);
    process.exit(outcome.ok ? 0 : 1);
  });

draft
  .command("promote")
  .argument("<name>", "staged draft name")
  .description("re-run the check and install the draft into the skills root only if it passes")
  .action(async (name: string) => {
    const target = await promoteDraft(name, await resolveConfig());
    process.stdout.write(`promoted ${name} to ${target}\n`);
  });

draft
  .command("drop")
  .argument("<name>", "staged draft name")
  .option("--reason <text>", "why it was discarded", "discarded by the agent")
  .description("discard a staged draft")
  .action((name: string, options: { reason: string }) => {
    const removed = dropDraft(name, options.reason);
    process.stdout.write(removed ? `dropped ${name}\n` : `no staged draft named ${name}\n`);
    process.exit(removed ? 0 : 1);
  });

const library = program.command("library").description("inspect and maintain the accumulated skills");

library
  .command("list")
  .description("list installed skills with their usage rate")
  .action(() => {
    const members = listMembers();
    const requests = requestCount();
    if (members.length === 0) {
      process.stdout.write("the library is empty\n");
      return;
    }
    const registry = loadRegistry();
    for (const member of members) {
      const entry = registry[member.name];
      if (entry !== undefined) process.stdout.write(`${describe(member.name, entry, requests)}\n`);
    }
  });

library
  .command("curate")
  .option("--apply", "retire the skills the decision names; without it, only report")
  .description("apply the survival rule")
  .action(async (options: { apply?: boolean }) => {
    const config = await resolveConfig();
    const { decision, retired } = await curate(config, options.apply === true);
    process.stdout.write(`probation: ${decision.probation.join(", ") || "-"}\n`);
    process.stdout.write(`spared:    ${decision.spared.join(", ") || "-"}\n`);
    process.stdout.write(`pool:      ${decision.pool.join(", ") || "-"}\n`);
    process.stdout.write(`retire:    ${decision.archive.join(", ") || "-"}\n`);
    if (options.apply !== true && decision.archive.length > 0) {
      process.stdout.write(`\nre-run with --apply to retire them\n`);
    }
    if (retired.length > 0) process.stdout.write(`\nretired: ${retired.join(", ")}\n`);
  });

library
  .command("merge")
  .argument("<narrow>", "the skill being absorbed")
  .requiredOption("--into <umbrella>", "the installed skill that keeps the content")
  .option("--reason <text>", "why they were folded together", "overlapping scope")
  .description("fold one skill into another, recording what absorbed it")
  .action(async (narrow: string, options: { into: string; reason: string }) => {
    const archived = await mergeInto(await resolveConfig(), narrow, options.into, options.reason);
    process.stdout.write(`merged ${narrow} into ${options.into}; archived at ${archived}\n`);
  });

library
  .command("ledger")
  .description("print the append-only record, and how skills have left the library")
  .action(() => {
    const entries = readLedger();
    for (const entry of entries) {
      const absorbed = entry.absorbedInto === undefined ? "" : ` absorbed-into=${entry.absorbedInto}`;
      process.stdout.write(`${entry.at} ${entry.action} ${entry.name}${absorbed} — ${entry.reason}\n`);
    }
    const causes = retirementCauses(entries);
    process.stdout.write(`\nretired: ${causes.absorbed} absorbed, ${causes.pruned} pruned\n`);
  });

try {
  await program.parseAsync(process.argv);
} catch (error) {
  if (error instanceof CommanderError) process.exit(error.exitCode);
  process.stderr.write(`[${PLUGIN_NAME}] ${(error as Error).message}\n`);
  process.exit(1);
}
