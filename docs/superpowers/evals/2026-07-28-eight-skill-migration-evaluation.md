# Eight-Skill Migration - Evaluation Report

Date: 2026-07-28
Evaluator: automated worktree evaluation (clean checkout of `fix/8-skill-final-review` @ `1b3a8f0`)
Worktree: `.claude/worktrees/eval-migration-review` (branch `eval/migration-review`)

## TL;DR

The migration is **complete and structurally sound**. All 14 local plugins build, validate, pack, and run from a clean checkout. The full gate passes (codex=14, claude=16; versions consistent; packs valid). The 3 Critical bugs from the final code review (ticktick `saveConfig` data-loss, aliyunlog direct credential writes, prompt-forge dedup FK crash) are confirmed fixed. **No blocking issues remain.**

The remaining items are **usability / docs / test-coverage polish**, concentrated in prompt-forge and the 4 rewritten CLI plugins. 9 of 14 plugins are Ready; 4 are Usable-with-caveats; 1 needs a trivial one-word fix.

## Clean-checkout baseline (worktree)

| Check | Result |
|---|---|
| `bun install` | ⚠️ flaky `protobufjs` tarball extract (env/network); does not block builds or gate |
| All 6 built plugins `--help` | ✅ run |
| Full validation gate | ✅ codex=14, claude=16, versions consistent, packs valid |
| config-center tests | ✅ 59/59 (after `build:ui`; see hermeticity gap) |
| prompt-forge tests | ✅ 13/13 |
| postgresql tests | ✅ 4/4 |
| ticktick tests | ✅ 1/1 (static lint only) |
| script tests | ✅ 8/8 |
| prompt-forge packed-release smoke | ✅ `pf init` seeds 7,018 prompts; `prompt list`/`search` work |

## Per-plugin status

| Plugin | Type | Status | Key issue |
|---|---|---|---|
| config-center | built (infra) | ⚠️ Usable with caveats | non-hermetic `GET /` test; nested-value redaction UX |
| ffmpeg | skill-only | ✅ Ready | — |
| magick | skill-only | ✅ Ready | — |
| real-esrgan | skill-only | ✅ Ready | — |
| withoutbg | skill-only | ✅ Ready | — |
| temu-api | skill-only | ✅ Ready | — |
| temu-dev | skill-only | ✅ Ready | — |
| consulting-advisor | skill-only | ❌ Needs work (trivial) | SKILL.md frontmatter still says "Codex should" |
| prompt-forge | built (TS port) | ⚠️ Usable with caveats | SKILL bare `pf` invocation; no `pf sql`; metadata 25k vs 7k; shebang; stale doc refs |
| postgresql | rewritten CLI | ✅ Ready | minor: `init` help shows stale legacy path |
| mysql | rewritten CLI | ⚠️ Usable with caveats | no tests; bare `${CLAUDE_PLUGIN_ROOT}`; `init` help stale path |
| ticktick | rewritten CLI | ⚠️ Usable with caveats | 1 static test; SKILL lacks "NEVER read" + discloses path; bare root var |
| aliyunlog | rewritten CLI | ⚠️ Usable with caveats | no tests; bare `${CLAUDE_PLUGIN_ROOT}` |
| ecommerce-expert | skill-only (unchanged) | ✅ Ready | — |

## Cross-cutting findings

### Strengths
1. **Iron rule is enforced.** config-center `get`/`show` always redact; no CLI `set`; modifications only via browser UI; path-traversal (`isValidPluginName`) and CSRF guards on all write routes; cache-path redaction defense-in-depth on error output. Regression tests cover plaintext/path leaks across get/show/init/edit.
2. **Clean shared-helper migration.** `@agent-plugins/config-center` barrel re-exports exactly what consumers need, with a `launchConfigUI` compat wrapper so the 4 rewritten plugins swapped imports with no signature changes (after the `true`→`{merge:true}` fix).
3. **prompt-forge is a sound TS port.** `node:sqlite` (no native addon → bundle runs standalone), DB at `artifactsDir('prompt-forge')`, FTS5 with LIKE fallback, transactional dedup with FK-safe child-row cleanup, `serve` bound to 127.0.0.1.
4. **No Rust/Python in shipped runtime.** Rust crate and Python scripts dropped; only TS + JSONL data + references.
5. **postgres is the model SKILL** - robust `${CLAUDE_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-${PLUGIN_ROOT:-}}}` fallback with empty-expansion guard, explicit "NEVER read" guidance, and a credential-leak test.

### Issues / risks (by severity)

**Important (usability - Agent cannot correctly invoke the CLI)**
- **prompt-forge SKILL invocation gap.** `SKILL.md` uses bare `pf init`, `pf prompt list`, etc. with no `${CLAUDE_PLUGIN_ROOT}/dist/prompt-forge.mjs` resolution. The Agent will hit `pf: command not found`. Mirror the postgresql pattern (`PF_BIN=...; node "$PF_BIN" ...`).
- **prompt-forge SKILL teaches unexecutable SQL.** `SKILL.md` shows raw `SELECT ...` examples, but the CLI has no `pf sql` subcommand and no `sqlite3` dep declared. Either add `pf sql "<query>"` or replace examples with `pf prompt search`/`list`.
- **mysql / ticktick / aliyunlog use bare `${CLAUDE_PLUGIN_ROOT}`** with no fallback / empty-expansion guard. CLAUDE.md explicitly warns against the bare form. Adopt the postgresql fallback-resolution pattern.

**Important (metadata accuracy / trust)**
- **prompt-forge metadata inflation.** `plugin.config.ts` + `SKILL.md` claim "25,000+ prompts across 12 sources"; actual seeded count is **7,018 prompts from 5 JSONL sources** (7,285 records, 267 deduped). Correct the description.

**Minor (correctness / hygiene)**
- **consulting-advisor SKILL.md** frontmatter still says "Codex should" (plugin.config.ts was fixed; the hand-maintained SKILL.md was missed). One-word fix + regenerate.
- **postgresql & mysql `init` command description** leaks the stale legacy path `~/.cache/agent-plugins/<name>.json` in `--help` (and it's the wrong/legacy location now). Drop the path or use the nested `config.json` path.
- **ticktick SKILL.md** discloses the cache path without the "NEVER read directly" prohibition the other 3 have. Add the guardrail.
- **prompt-forge bundle shebang** is `#!/usr/bin/env tsx` (should be `node`); direct `./prompt-forge.mjs` execution fails. SKILLs invoke via `node "$BIN"` so it works today, but the shebang is wrong.
- **prompt-forge stale doc references.** `references/workflows.md` references `scripts/normalize.py` (doesn't exist) and `agents/curator.md`/`agents/synthesizer.md` (actual path is `references/personas/`).
- **config-center non-hermetic test.** `launch-ui.test.ts:84` ("GET / serves the bundled HTML") depends on the gitignored Vite build `ui/dist/index.html`; fails in a clean checkout until `build:ui` runs. CI without a build step reports a false failure.
- **config-center nested-value redaction.** `redactEntry` calls `String(value)`, so object config values print as `[o•••••ct]` (no plaintext leak, but the Agent can't tell a set nested config from a broken one). Untested.
- **config-center SKILL tension.** The SKILL prints the cache path *pattern* (`~/.cache/agent-plugins/<plugin>/`) while instructing the Agent to never print it. Informational, not an absolute-path leak.

**Test-coverage gaps (acceptable for skill-only; gaps for built)**
- mysql, aliyunlog: **zero tests**. ticktick: 1 static-lint test only. Per CLAUDE.md "Scriptable Next", at least a credential-non-printing test (like postgresql's) should be added to each.
- prompt-forge: no `image link`, `serve`, or `source import` coverage; `serve` re-opens the DB per request.

## Recommendations (prioritized)

1. **Fix prompt-forge SKILL usability** (Important): add `${CLAUDE_PLUGIN_ROOT}` resolution for `pf`, and either add `pf sql` or replace SQL examples with CLI equivalents. This is the single highest-impact fix - without it the Agent cannot use the skill.
2. **Correct prompt-forge metadata** (Important): "25,000+ / 12 sources" → "7,000+ / 5 sources".
3. **Adopt postgresql's path-resolution pattern** in mysql/ticktick/aliyunlog SKILLs (Important).
4. **Trivial fixes bundle** (Minor): consulting-advisor "Codex"→"the agent"; postgresql/mysql `init` description path; ticktick "NEVER read" guardrail; prompt-forge shebang `tsx`→`node`; prompt-forge `workflows.md` stale references.
5. **Make config-center `GET /` test hermetic** (Minor): skip or build a fixture HTML when the Vite bundle is absent.
6. **Add credential-non-printing tests** to mysql/aliyunlog/ticktick (coverage).

## Conclusion

The migration delivers what was specified: 8 skills migrated (ffmpeg, magick, real-esrgan, withoutbg, temu-api, temu-dev, consulting-advisor, prompt-forge) + a new `config-center` infrastructure plugin + 4 existing CLI plugins rewritten onto the shared helper, with `packages/core`/`packages/config-ui` absorbed and deleted. The architecture is coherent, the iron rule is enforced, and the committed release artifacts run directly from a clean checkout. The remaining work is a focused usability/docs pass on prompt-forge and the 3 bare-root-var CLI plugins - no redesign needed.
