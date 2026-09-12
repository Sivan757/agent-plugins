# Single-Tree Plugin Layout Design

**Date:** 2026-09-12
**Status:** Implemented
**Supersedes:** the 2026-05-02 plugin compiled release pipeline design, which is retired along with the generated release tree it introduced.

## Problem

The repository maintained two trees for the same thing. `src/<name>/` held the
hand-authored plugin — skills, commands, hooks, CLI source, `plugin.config.ts` —
and `plugins/<name>/` was emitted from it by `npm run pack:plugins`. The release
tree carried a generated `.claude-plugin/plugin.json` plus a `dist/` bundle
copied out of a `.build/plugin-dist/` staging directory.

That indirection was introduced to render one source tree into two clients'
native layouts, Codex and Claude. Commit `0a17ace` removed the Codex target,
which left the second tree with no job: for the ten skill-only plugins the whole
generate-and-pack chain copied files that had not changed, and for the seven
CLI plugins it was a build step standing between an edit and an installable
plugin.

The concrete cost was that editing a `SKILL.md` required
`generate:plugins` + `build` + `pack:plugins` before Claude Code saw it, and the
two trees could silently drift.

## Decision

A Claude Code plugin is a directory. Make the directory the thing.

- `plugins/<name>/` is the plugin. It is authored by hand and is what Claude Code
  installs; there is no release tree, no packing step, and no `.build/`.
- `plugins/<name>/plugin.config.ts` remains the metadata source of truth, and
  `npm run generate:plugins` still writes `.claude-plugin/plugin.json` and the
  marketplace entry. Metadata is mechanical and duplicated across files, so it
  stays generated rather than hand-copied; only the plugin *tree* stopped being
  generated.
- CLI TypeScript source moves inside the plugin (`plugins/<name>/src/`) and
  `scripts/build-plugin.sh` writes the esbuild bundle straight to
  `plugins/<name>/dist/<name>.mjs`. Bundles stay committed: the repository is
  installed as a git marketplace, so consumers cannot build.
- `PluginConfig` shrinks to what Claude reads — `name`, `version`,
  `description`, `author`, `keywords`, `marketplace.description`. The Codex-era
  `interface`, `category`, `surfaces`, `artifact`, and `build` fields existed to
  drive manifest rendering and packing, and are gone.
- `package.json` exists only where npm does work (build, test, typecheck).
  Nine plugins carried one that duplicated `plugin.config.ts` field for field.
- The pack stage's gate value is replaced by a stronger one: every
  `${CLAUDE_PLUGIN_ROOT}/…` path named in skills, commands, agents, hooks, or
  README text must exist inside the plugin.
- Because the bundle is now the shipped artifact rather than a staging output,
  CI rebuilds it and fails when the committed `.mjs` differs from its source.
  `npm run build` also builds the shared config UI first, so one pass refreshes
  every plugin's `dist/config-ui/`; the previous workspace ordering silently
  skipped `aliyunlog` and `codearts`.

## Alternatives Rejected

- **Keep the release tree and delete `src/` instead.** Rejected because the
  marketplace, `dev.sh`, and every `--plugin-dir` invocation already point at
  `plugins/`; the release path is the installable one and the name matches.
- **Keep the bundle out of the plugin directory.** Rejected because a git
  marketplace consumer has no build step; an absent `dist/` is a broken plugin.
- **Hand-write `plugin.json` and the marketplace entry.** Rejected. Metadata is
  repeated on purpose in several places (the CLI's version string, the
  marketplace entry, the manifest), and a generator plus a validator is how the
  repository keeps them from drifting. Removing the generator would move that
  risk back onto whoever edits metadata.

## Consequences

- Editing a skill, command, agent, or hook needs no command at all. `dev.sh`
  launches `claude --plugin-dir plugins/<name>` directly, and `--build` is opt-in.
- The installed plugin now carries its own `src/`, `package.json`, and
  `tsconfig.json`. Claude Code ignores them; the cost is directory size.
- `plugins/*/dist/` must not be gitignored, and `config-center`/`prompt-forge`
  had to drop their local `dist/` ignore rules, which had been written for the
  old source-tree layout.
- `dist/` is the whole shipped runtime surface. An asset the bundle reads at
  runtime lives beside it, either committed there (aliyunlog's `sls.proto`, which
  the vendor SDK resolves relative to its own bundled `__dirname`) or written
  there by its generator (codearts' `api-catalog.json`). A `runtime/` directory
  that shadows `dist/` was removed rather than maintained in two places.
- Development-only scratch stays out of `plugins/`: whatever sits in a plugin
  directory ships to every consumer. The `ticktick` plugin's dead `scripts/`
  directory and the credential `.env` inside it were removed for that reason.

## Verification

- `npm run validate:plugins` (metadata, layout, marketplace, versions,
  frontmatter, secret scan) passes.
- `bun test ./.github/scripts/tests` passes, with new cases for the
  `${CLAUDE_PLUGIN_ROOT}` path gate and the CLI version check.
- Each bundle runs from a directory with no `node_modules`, which is what the
  installed plugin cache looks like.
- Both new gates were verified negatively: injecting a missing path and a
  mismatched CLI version each fail their gate.
- All 17 plugin directories load through the host CLI
  (`claude --plugin-dir plugins/<name> plugin details <name>`), which reports
  the expected skills, hooks and MCP servers for each.
- Two consecutive `npm run build` runs produce byte-identical bundles, so the
  committed-bundle CI check is not expected to be flaky. It is scoped to
  `plugins/*/dist/*.mjs`: the Vite-produced `dist/config-ui/` HTML was not
  verified for cross-platform reproducibility.
