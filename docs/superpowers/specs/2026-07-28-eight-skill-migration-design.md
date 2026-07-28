# Eight-Skill Migration + config-center — Design

Date: 2026-07-28
Status: Draft (pending user review)

## Goal

Migrate 8 skills (`ffmpeg`, `magick`, `prompt-forge`, `temu-api`, `temu-dev`, `withoutbg`, `consulting-advisor`, `real-esrgan`) from `~/.agents/skills/` into this plugin repo as first-class plugins, following the repo's plugin-development conventions. Add a 9th plugin — `config-center` — that owns credential/env management. Rewrite the 4 existing CLI plugins to use the new shared helper. Delete `packages/core` and `packages/config-ui` after their functionality is absorbed into `config-center`.

## Hard constraints (from user)

1. **All skill-only**, single **TypeScript** toolchain. No Rust, no Python in the shipped runtime. (Rust crate and 394 MB `target/` from prompt-forge are discarded.)
2. **Every plugin's initialization state, install artifacts, and credentials live under `~/.cache/agent-plugins/<name>/`**, partitioned per plugin. Layout:
   - `~/.cache/agent-plugins/<name>/config.json` — credentials + init state (plaintext JSON).
   - `~/.cache/agent-plugins/<name>/artifacts/` — install products (e.g. prompt-forge's seeded SQLite DB).
3. **Config-center credential access is an iron rule:**
   - `config-center get <plugin> [key]` / `show <plugin>` **silently redact** secrets (middle of value masked with `•`) by default. Agent never receives plaintext, never receives the storage path. Used by Agent only to confirm a key is set vs. not set.
   - Modification **only** via HTML UI opened for a human. There is **no** CLI `set`. `init` and `edit` open the UI.
   - **Strictly forbidden:** any SKILL.md writing the cache path literal; the Agent `cat`/`Read`-ing cache files; any config-center subcommand printing the storage path or plaintext.
4. **Existing 4 CLI plugins** (`ticktick`, `postgresql`, `mysql`, `aliyunlog`) are rewritten to the new convention. `packages/core` and `packages/config-ui` are deleted; their shared functionality moves into `config-center`.
5. **Plugin CLIs read the cache plaintext directly** at runtime (they need real creds to run queries). The **Agent** is still forbidden from reading the cache — only plugin processes and config-center may read plaintext. The shared helper enforces the directory layout; SKILL instructions never hand the Agent the cache path.
6. **Build artifacts never committed; committed artifacts must be directly runnable.** Matches current repo: `src/*/dist/`, `target/`, `.build/` are gitignored; `plugins/<name>/dist/<name>.mjs` + `plugins/<name>/dist/config-ui/dist/index.html` are committed.

## Approach chosen

- **TypeScript CLI via esbuild**, reusing and absorbing the existing React/Vite config UI (formerly `packages/config-ui`) into `config-center`. Single toolchain, single build pipeline (existing esbuild + `build-plugin.sh`).
- config-center is the single home for: credential reading/writing, the HTML config UI, env/secret redaction, and the directory-layout helper.

## Batch plan

| Batch | Plugins | Notes |
|---|---|---|
| 0 | **config-center** (new) | Built first. Owns the shared helper the other plugins depend on. |
| 1 — Media CLI | `ffmpeg`, `magick`, `real-esrgan` | Skill-only, zero state/creds. Closest to existing `ecommerce-expert` archetype. Note cross-refs (real-esrgan + withoutbg use `magick identify`). |
| 2 — Temu | `temu-api`, `temu-dev` | Skill-only + large `references/temu-openapi/` doc mirrors (2.4 M / 4.3 M). SKILL points Agent at `config-center get temu-* --redact` to confirm `TEMU_APPKEY/APPSECRET/TOKEN`. |
| 3 — Knowledge / prompt | `consulting-advisor`, `prompt-forge` | consulting-advisor is purest knowledge. prompt-forge is the heavy one (TS port of `pf.py`, SQLite, seeded DB). |

Batches run sequentially; each batch closes its own `generate:plugins` → `validate:plugins` → `pack:plugins` loop before the next starts.

## Canonical plugin structure

### Skill-only plugins (6 of 8 migrated: ffmpeg, magick, real-esrgan, withoutbg, temu-api, temu-dev, consulting-advisor — 7 actually, but prompt-forge is built)

```
src/<name>/
├── plugin.config.ts        # name=dir, version, description, category, surfaces={skills:true, hooks:"native"}
├── package.json            # {name, version, scripts.build (no-op or omitted)}
├── hooks.json              # {"hooks": {}}
├── hooks/hooks.json        # identical
├── .gitignore              # dist/ if any, *.local
├── skills/<name>/SKILL.md  # frontmatter name+description
└── skills/<name>/references/...
```

No `build.entry`, no `src/*.ts`. The "CLI" is either the external binary (ffmpeg/magick/realesrgan/withoutbg) invoked from SKILL.md via published commands, or pure reference docs (temu-api/temu-dev/consulting-advisor).

### Built plugins (config-center, prompt-forge, and the 4 rewritten CLIs)

```
src/<name>/
├── plugin.config.ts        # + build.entry: "src/<name>.ts", output: "dist/<name>.mjs"
├── package.json            # + scripts.build→build-plugin.sh, deps via workspace
├── tsconfig.json           # extends ../../tsconfig.base.json
├── src/<name>.ts
├── dist/                   # gitignored (source-side)
└── ... skills/hooks ...
```

Release tree carries the committed runnable `dist/<name>.mjs` (+ `dist/config-ui/dist/index.html` for any plugin that serves the UI).

### prompt-forge specifics

- Discard `src/main.rs`, `Cargo.toml`, `src/migrations/` Rust path, and `src/target/` (394 MB).
- Port `pf.py` (281 lines: prompt CRUD, FTS5 search, source-scrape, serve) to TypeScript `src/prompt-forge.ts`.
- Use `better-sqlite3` (esbuild-bundleable). Embed the schema (`001_init.sql`) in the TS module; `pf init` applies it.
- Keep `data/*.jsonl` (~4 M, 4 corpora) as committed reference data under `skills/prompt-forge/data/` or `assets/`; `pf init` seeds the DB from them.
- DB lives at `~/.cache/agent-plugins/prompt-forge/artifacts/prompts.db` (gitignored, machine-local). `pf init` creates + seeds it; subsequent `pf` calls open it read/search.
- `pf serve` (local web viewer) optional; same stdio launch pattern as config-center UI if retained.
- Subagent persona `.md` files (`curator/evaluator/synthesizer`) migrate as `skills/prompt-forge/references/*.md` (documentation, not Claude-format agents).

## config-center design

### CLI surface (`dist/config-center.mjs`)

| Command | Behavior |
|---|---|
| `init [<plugin>]` | Bootstraps `~/.cache/agent-plugins/<name>/`; if a schema is registered for `<plugin>`, opens HTML UI for human entry. |
| `edit [<plugin>]` | **Only** opens HTML UI. The sole modification path. No `set`. |
| `get <plugin> [key]` | Prints redacted value(s): `TEMU_APPKEY=te•••••key` or `TEMU_APPKEY=<not set>`. **Silent**, default redact. Used by Agent to confirm presence. |
| `show <plugin>` | Prints all keys redacted. Never raw. |
| `which <plugin>` | Prints only whether a config file exists and its age — never the path or contents. (Optional confidence helper.) |

**Iron rules enforced in code:**
- No subcommand prints the cache path or plaintext. `get`/`show` always mask.
- No file-system output of the absolute cache path. (The directory-layout helper computes it internally; never to stdout unless behind a developer `--debug` flag that is off in release.)
- Returning values use masking: first 2 + last 3 chars preserved for length ≥ 8, else fully masked; `<not set>` otherwise.

### HTML config UI

- Source of the existing `packages/config-ui` React/Vite app is moved into `config-center` (e.g. `src/config-center/ui/`). Built by Vite to `dist/config-ui/dist/index.html`, then copied into each serving plugin's `dist/config-ui/` at pack time (matches today's `plugins/*/dist/config-ui/dist/index.html` convention).
- Add an **env / plugin-selector tab** to the UI (existing UI only handled per-plugin schema fields). Human enters creds → browser POSTs to local HTTP server → config-center writes `~/.cache/agent-plugins/<name>/config.json`. Nothing flows through the LLM.
- `init`/`edit` launch this UI over local HTTP and print a `localhost:<port>` URL for the human (not the Agent) to visit.

### Shared helper (the successor to `@agent-plugins/core`)

The 4 rewritten CLIs and prompt-forge need to **read plaintext** to run. config-center exports a small internal Node API (not exposed to the Agent via a CLI command) that the other plugins import as a workspace dependency:

- `configPath(name)`, `loadConfig(name)`, `saveConfig(name, data, {merge})`, `requireConfig(name)`, `requireConfigWithSetup(name, uiOptions)` — same names as today's `@agent-plugins/core`, so the 4 rewrites are mostly import-path + layout changes.
- New **directory layout**: `configPath(name)` → `~/.cache/agent-plugins/<name>/config.json` (was flat `<name>.json`). Migration of the existing 5 plugins' flat files → directory layout happens lazily on first read (helper detects legacy flat file, moves it into `/<name>/config.json`, removes old file) OR via an explicit `init` migration. (Implementation choice; documented as a single behavior.)
- `PluginError` codes unchanged (`CONFIG_MISSING`, `CONFIG_INVALID`, `AUTH_FAILED`, `QUERY_FAILED`).

**Dependency wiring:** config-center is published as a workspace package `@agent-plugins/config-center`. The 4 CLI plugins + prompt-forge declare it as a workspace dependency. `npm run build` order must build config-center first (so its `dist/` exists before dependents bundle it).

### Existing 4 CLI plugins — rewrite scope

Per-plugin changes (mechanical, low-risk):
- `package.json`: dep `@agent-plugins/core` → `@agent-plugins/config-center`; keep `build-plugin.sh`.
- `src/<name>.ts`: import path `@agent-plugins/core` → `@agent-plugins/config-center`. Function names unchanged, so this is a 1-line edit per import block.
- Cache files for existing users: helper handles flat→directory migration.
- `SKILL.md`: scrub any cache-path literal; replace Agent-facing credential checks with `node ${CLAUDE_PLUGIN_ROOT}/dist/config-center.mjs get <name> --redact`. (config-center's `dist` is shipped in its own plugin, so cross-plugin invocation uses the marketplace-resolved path — see Open Question below.)
- Tags/category unchanged.

## Migration mechanics (each migrated skill)

For each of the 8 source skills:
1. Read `~/.agents/skills/<name>/SKILL.md` + `references/`.
2. Create `src/<name>/` with canonical structure.
3. Adapt `SKILL.md`: ensure `name`+`description` frontmatter; rewrite any `${...}`/path refs to plugin-root conventions; for credentialed skills (temu-api, temu-dev, withoutbg) replace env-var-instructions with `config-center` flow and the iron rule language.
4. Copy `references/` verbatim (doc mirrors are already secret-redacted per recon).
5. Drop `agents/openai.yaml` Codex stubs (not Claude-format agents) unless a Codex manifest surface is wanted — see Open Question.
6. For prompt-forge: also port `pf.py` → TS, keep `data/*.jsonl`, discard Rust + `target/`.
7. Add `plugin.config.ts` (name, version "0.1.0", description, category).
8. `npm run generate:plugins` → `validate:plugins` → `pack:plugins` → `validate:plugin-packs`.

## Validation gates (run per batch, matching CLAUDE.md)

- `npm run generate:plugins`
- `npm run validate:plugin-metadata`
- `npm run validate:claude-layout` / `validate:codex-layout`
- `npm run validate:marketplace` / `validate:versions`
- `bun test ./.github/scripts/tests`
- `npm run pack:plugins` + `npm run validate:plugin-packs`

## Categories (proposed)

| Plugin | Category |
|---|---|
| config-center | Productivity |
| ffmpeg | Coding |
| magick | Coding |
| real-esrgan | Coding |
| withoutbg | Coding |
| temu-api | Coding |
| temu-dev | Coding |
| consulting-advisor | Productivity |
| prompt-forge | Coding |
| ticktick (existing) | Productivity (unchanged) |

## Versions

All new plugins start at `0.1.0`. Rewritten existing plugins: bump patch for the refactor (e.g. ticktick 0.6.4→0.6.5) — content of the bump is the import-path + cache-layout migration.

## Resolved decisions

1. **Cross-plugin invocation — workspace import (recommended, confirmed).** Credentialed skill plugins do NOT shell out to `config-center`; they bundle `@agent-plugins/config-center` as a workspace dependency and `import` the shared helper in-process. This keeps each plugin self-contained (`${CLAUDE_PLUGIN_ROOT}` resolves correctly), avoids cross-plugin path fragility, and respects the "Agent never touches cache" rule — the plugin reads plaintext, never the Agent. `config-center` the *standalone plugin* is reserved for the human-facing UI (`init`/`edit`) and the Agent's redacted `get`/`show` confirmation tool.
2. **Codex `agents/openai.yaml` stubs — drop (recommended, confirmed).** They are Codex-CLI interface stubs, not Claude-format agents. Not carried into plugin source. The generator emits Codex `interface` metadata from `plugin.config.ts` when needed.
3. **prompt-forge `serve` local web viewer — keep, marked optional (recommended, confirmed).** Retain `pf serve` in the TS port for the corpora-rating/browsing workflow; flagged optional so it can be pruned later without breaking the core CLI.

## Open Questions

(none remaining)

## Scope decomposition note

This is a single spec but spans multiple independent deliverables (config-center + 4 rewrites; 4 skill-only media; 2 Temu; 2 knowledge/prompt). Each batch is independently shippable; the writing-plans skill may split the plan into per-batch implementation tracks.