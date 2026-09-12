# Authoring A Plugin

How to add a plugin to this repository and what the gates will check before it
ships. Read this with [`claude-code.md`](claude-code.md) (platform conventions)
and [`../decisions/`](../decisions/README.md) (why the tree looks like this).

## The shape

A plugin is a directory under `plugins/`. Every directory there is installable
as-is — there is no separate release tree, no packing step, and no second copy of
anything.

| Path | Required | Authored or generated |
| --- | --- | --- |
| `plugin.config.ts` | yes | authored — the metadata source of truth |
| `.claude-plugin/plugin.json` | yes | **generated** by `npm run generate:plugins` |
| `skills/<skill>/SKILL.md` | when the plugin teaches behavior | authored |
| `commands/`, `agents/`, `hooks/hooks.json`, `assets/`, `.mcp.json` | optional | authored |
| `README.md` | optional | authored |
| `package.json`, `tsconfig.json` | only if the plugin builds or tests | authored |
| `src/` | only for a plugin with a CLI | authored |
| `dist/` | only for a plugin with a CLI | **generated** by `npm run build`, committed |

`node_modules/` is never committed, and `plugins/config-center/ui/dist/` is the
Vite intermediate, not a shipped file.

## A skills-only plugin

```bash
mkdir -p plugins/<name>/skills/<name>
```

1. Write `plugin.config.ts` (see [Metadata](#metadata)).
2. Write `skills/<name>/SKILL.md` whose frontmatter has at least `name` and
   `description`.
3. `npm run generate:plugins && npm run validate:plugins`.

No `package.json` is needed: `plugin.config.ts` already carries the name,
version and description, and a second copy only invites drift.

## A plugin with a CLI

1. Put the entry at `src/<name>.ts`, and in `package.json`:

   ```json
   "scripts": {
     "build": "bash ../../scripts/build-plugin.sh <name> src/<name>.ts",
     "dev": "tsx src/<name>.ts",
     "typecheck": "tsc --noEmit"
   }
   ```

2. `npm run build` writes `plugins/<name>/dist/<name>.mjs` **and that file is
   committed**: this repository is installed as a git marketplace, so consumers
   cannot build it.
3. Refer to it from skill text as `${CLAUDE_PLUGIN_ROOT}/dist/<name>.mjs`.
   `npm run validate:claude-layout` fails if the path does not exist.
4. Anything the bundle reads at runtime — a `.proto`, a generated catalog —
   belongs in `dist/` beside the bundle. There is no shadow copy elsewhere.
5. Add dependencies to the plugin's `package.json`. esbuild inlines them, so an
   installed plugin never needs `npm install`; the shared credential layer comes
   from the workspace package `@agent-plugins/config-center`.

## Config forms

A plugin that stores credentials should serve the shared browser form instead of
asking the user to edit JSON.

1. Declare the form as **plain data** in `src/config-ui.ts`, exporting
   `CONFIG_UI`:

   ```ts
   import type { ConfigUIOptions } from '@agent-plugins/config-center';

   export const CONFIG_UI: ConfigUIOptions = {
     setupCommand: 'config --ui',
     reason: 'Why the plugin cannot run unconfigured, in the user’s terms.',
     spec: { root: 'page', elements: { /* … */ } },
   };
   ```

   Keep the module free of side effects: `npm run validate:config-ui` imports it
   without running your CLI, which is why the CLI entry is not a valid home.

2. Open it from the CLI with `openConfigUI(name, CONFIG_UI)` (explicit) or
   `requireConfigWithSetup(name, CONFIG_UI)` (opens it when config is missing or
   incomplete and hands back the reloaded config).
3. The vocabulary is fixed by
   [`catalog-contract.ts`](../../plugins/config-center/ui/src/shared/catalog-contract.ts):
   five components (`Header`, `Section`, `Collection`, `Field`, `SaveBar`) and six
   field types (`text`, `password`, `select`, `number`, `textarea`, `checkbox`).
   `validate:config-ui` rejects anything else, plus unreachable elements and
   `children` entries that name a missing element.
4. Skill text must stand alone: never tell the reader to consult another
   plugin's skill for a rule, because installing one plugin must be enough.

## Metadata

| Field | Notes |
| --- | --- |
| `name` | must equal the directory name |
| `version` | also lives in `package.json` and in the CLI's `.version(…)` when it declares one |
| `description` | shown in `plugin.json`; keep it to what the plugin does |
| `author`, `keywords` | optional |
| `marketplace.description` | optional longer wording for the marketplace listing; omit it when `description` already reads well there |

`npm run validate:versions` compares every place a version appears and fails on
any mismatch.

## Commands

```bash
npm run generate:plugins   # rewrite plugin.json + the marketplace entry
npm run build              # shared config UI first, then every bundle
npm run validate:plugins   # every gate below
bun test ./.github/scripts/tests
bash scripts/dev.sh <name> # launch Claude Code against the plugin directory
```

## What the gates enforce

| Gate | Catches |
| --- | --- |
| `validate:plugin-metadata` | a manifest or marketplace entry that no longer matches `plugin.config.ts` |
| `validate:claude-layout` | a missing/extra file in `.claude-plugin/`, malformed hooks or MCP config, and any `${CLAUDE_PLUGIN_ROOT}` path the plugin does not ship |
| `validate:config-ui` | a form spec the renderer cannot draw, a plugin that serves the form without shipping the HTML (or ships it without serving it), and stale HTML copies |
| `validate:marketplace` | a local entry that points somewhere other than `./plugins/<name>`, or at a directory that does not exist |
| `validate:versions` | a version that disagrees between `plugin.config.ts`, `package.json`, the CLI, the manifest and the marketplace |
| `validate:frontmatter` | skill/command/agent frontmatter that is not valid YAML with the required fields |
| `validate:no-secrets` | credential material in any human-authored surface |
| CI `validate-committed-bundles` | a committed artifact under `plugins/*/dist` that no longer matches its source |

## Before you publish

- [ ] `npm run validate:plugins` passes
- [ ] `npm run build` leaves no diff under `plugins/*/dist`
- [ ] if the plugin stores credentials, `config --ui` opens the form and a save
      round-trips
- [ ] the CLI runs from a copy of the plugin directory with no `node_modules`
