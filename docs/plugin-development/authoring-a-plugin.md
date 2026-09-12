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
   incomplete and hands back the reloaded config). `validate` returning `true`
   means the config is incomplete, and `setupCommand` is the command the error
   messages tell the reader to run when the form is skipped — it defaults to
   `setup`, so set it when your entry point differs.
3. The vocabulary is fixed by
   [`catalog-contract.ts`](../../plugins/config-center/ui/src/shared/catalog-contract.ts):
   five components (`Header`, `Section`, `Collection`, `Field`, `SaveBar`) and six
   field types (`text`, `password`, `select`, `number`, `textarea`, `checkbox`).
   `validate:config-ui` rejects anything else, plus unreachable elements and
   `children` entries that name a missing element.
4. A `Collection` element needs two declarations, and they are the same fact in two
   shapes. The form keeps a list (`spec.state` holds
   `connections: [{ _name: 'default', … }]`) and the config file keeps an object
   keyed by that name (`connections: { default: { … } }`), so a collection the form
   renders must also appear in `collections: [{ statePath: '/connections' }]`. That
   mapping is what converts between the two on load and on save, and it is what
   makes the save replace the whole list: the form is showing every entry, so an
   entry the user deleted has to disappear from the file.
5. The shared HTML ships inside your bundle, and only when the bundle serves it:
   `scripts/build-plugin.sh` copies it after a build that contains the marker, and
   `npm run validate:config-ui` fails a plugin that serves the form without
   shipping the copy, or ships it without serving it. `npm run build` handles it —
   do not copy the HTML by hand.
6. Skill text must stand alone: never tell the reader to consult another
   plugin's skill for a rule, because installing one plugin must be enough.

### What happens when the form opens

`openConfigUI` starts a server on `127.0.0.1` with an OS-assigned port, prints the
URL to stderr (stdout stays clean for the plugin's own output) and waits. The
server answers `GET /` with the bundled HTML plus four inline globals — the spec,
the current state, a CSRF token and the plugin name — and it answers the form's
`POST /save`, which converts the state back to the config shape, merges it over the
stored file (your collection paths excepted, see step 4), writes it, replies
`{ ok: true }` and shuts itself down. `handle.done` then resolves `true`, or `false`
if the session timed out or was closed: nothing was saved, and the caller decides
what to do.

For a headless run — a test, a screenshot, a preview — set
`AGENT_PLUGINS_NO_BROWSER=1` to skip the browser and `AGENT_PLUGINS_UI_TIMEOUT_MS`
to shorten the wait, and always point `AGENT_PLUGINS_CACHE_DIR` at a scratch
directory so the run cannot read or rewrite the operator's real credentials.

## Metadata

| Field | Notes |
| --- | --- |
| `name` | must equal the directory name |
| `version` | also lives in `package.json` and in the CLI's `.version(…)` when it declares one |
| `description` | shown in `plugin.json`; keep it to what the plugin does |
| `author`, `keywords` | optional |
| `marketplace.description` | optional longer wording for the marketplace listing; omit it when `description` already reads well there |

A version is declared by hand in `plugin.config.ts`, in `package.json` when the
plugin has one, and in the CLI's own `.version()` when it declares one.
`npm run validate:plugin-metadata` compares all of them, along with the generated
manifest and marketplace entry, and fails on any mismatch.

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
| `validate:plugin-metadata` | a manifest, marketplace entry or version that no longer matches `plugin.config.ts` |
| `validate:claude-layout` | a missing/extra file in `.claude-plugin/`, malformed hooks or MCP config, any `${CLAUDE_PLUGIN_ROOT}` path the plugin does not ship, and skill/command/agent frontmatter that is not valid YAML with the fields Claude Code reads |
| `validate:config-ui` | a form spec the renderer cannot draw, a plugin that serves the form without shipping the HTML (or ships it without serving it), and stale HTML copies |
| `validate:persistence` | a runtime source that takes a storage location from the temporary directory, the home directory or the working directory instead of the shared cache root |
| `validate:marketplace` | a malformed or duplicate marketplace entry; the generated entries are already compared byte for byte by `validate:plugin-metadata` |
| `validate:no-secrets` | credential material in any human-authored surface |
| CI `validate-generated` | a committed artifact under `plugins/*/dist` that no longer matches its source |

## Before you publish

- [ ] `npm run validate:plugins` passes
- [ ] `npm run build` leaves no diff under `plugins/*/dist`
- [ ] if the plugin stores credentials, `config --ui` opens the form and a save
      round-trips
- [ ] the CLI runs from a copy of the plugin directory with no `node_modules`
