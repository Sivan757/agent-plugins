# Claude Code Plugin Development Notes

Repository-specific knowledge for building and maintaining plugins for Claude Code.

## Current Repo Model

- `plugins/<name>/` is the plugin: the directory Claude Code installs, and the place every native file is authored
- `plugins/<name>/plugin.config.ts` is the metadata source of truth
- `.claude-plugin/plugin.json` is generated next to each plugin and stays manifest-only: keep only `plugin.json` in that directory
- Claude marketplace lives at `.claude-plugin/marketplace.json` and is the only marketplace file
- Local Claude marketplace entries point at `./plugins/<name>` and are generated from `plugin.config.ts`
- There is no packaging step and no second tree. A native file has exactly one home

## Manifest And Component Conventions

- Do not hand-edit `.claude-plugin/plugin.json`; edit `plugins/<name>/plugin.config.ts`, then run `npm run generate:plugins`
- Keep Claude components at plugin root, not under `.claude-plugin/`: `commands/`, `agents/`, `skills/`, `hooks/`, and `.mcp.json`
- Prefer Claude default auto-discovery over explicit manifest paths
- Do not declare the standard `./hooks/hooks.json` in `.claude-plugin/plugin.json`; Claude auto-discovers that file and treats a manifest reference as a duplicate load
- If future Claude metadata declares MCP config, it must use `./.mcp.json`
- Hook config is optional: add `hooks/hooks.json` (Claude wrapper format with an optional `description` plus a top-level `hooks` object) only when the plugin actually defines hooks. Do not ship empty placeholders
- Use `${CLAUDE_PLUGIN_ROOT}` anywhere Claude-executed config or content needs a plugin-local path, and only name paths the plugin ships; `npm run validate:claude-layout` checks both

## CLI Bundles

- A plugin with a CLI keeps its TypeScript source in `plugins/<name>/src/` and the esbuild bundle in `plugins/<name>/dist/`
- The bundle is committed, because this repository is installed as a git marketplace and consumers cannot build it
- `bash scripts/build-plugin.sh <plugin-name> <entry>` writes `dist/<plugin-name>.mjs` and stages the shared config UI into `dist/config-ui/` only when the bundle actually resolves it; a bundle that does not serve the form has no copy and no leftover copy
- `dist/` is the whole shipped runtime surface: a hand-maintained asset such as aliyunlog's `sls.proto` sits beside the bundle, and a generated one such as codearts' `api-catalog.json` is written there by `npm run extract`. No `runtime/` shadow copy exists
- Bundles are self-contained: `npx esbuild --bundle` inlines every dependency, so no plugin directory needs `npm install` at runtime. Troubleshooting text that told users to run `npm install --prefix` inside a plugin was wrong
- Build ordering: the root `npm run build` builds the shared UI first, and `build-plugin.sh` fails loudly when a plugin serves the form while the UI has not been built

## Config Forms

- One shared React app renders every plugin's credential form. The per-plugin part
  is data — `plugins/<name>/src/config-ui.ts` exporting `CONFIG_UI` — so no plugin
  ships its own renderer, and the validator can read a form without running its CLI
- The vocabulary is `plugins/config-center/ui/src/shared/catalog-contract.ts`,
  tied to the renderer by `satisfies`: a component or action in one but not the
  other is a type error
- `npm run validate:config-ui` checks every spec, requires the shared HTML exactly
  when a bundle serves the form, and rejects stale copies by comparing them to each
  other. See [authoring-a-plugin.md](authoring-a-plugin.md) for the authoring steps

## What Still Matters For Claude

- Claude marketplace metadata carries versioned local entries
- Claude supports external plugin references in the marketplace via remote `source` objects; this repo uses that for curated third-party plugins

## Practical Lessons

- Version numbers are declared in up to four places — `plugin.config.ts`, `package.json`, the generated manifest and marketplace entry, and the CLI's own `.version()` string. `npm run validate:plugin-metadata` reads all of them, because the CLI's `--version` is what an agent reads back when diagnosing an install
- An instruction that names a path the plugin does not ship sends the agent to a command that cannot run. Three shipped skills pointed at `${CLAUDE_PLUGIN_ROOT}/scripts/<name>.mjs` after the bundle had moved to `dist/`; `npm run validate:claude-layout` now fails on that
- Stripping a client from the repository leaves traces in prose, not just code: "for Codex and Claude Code" survived in CLI descriptions, skill troubleshooting sections and READMEs

## External Plugin Experience

Claude marketplace entries can reference external repositories directly.

Remote URL source example:

```json
{
  "name": "plugin-name",
  "description": "What it does",
  "source": {
    "source": "url",
    "url": "https://github.com/owner/repo.git"
  },
  "homepage": "https://github.com/owner/repo"
}
```

Git subdirectory example:

```json
{
  "name": "plugin-name",
  "description": "What it does",
  "source": {
    "source": "git-subdir",
    "url": "https://github.com/owner/repo.git",
    "path": "plugins/plugin-name"
  },
  "homepage": "https://github.com/owner/repo"
}
```

## Local Workflow

```bash
bash scripts/dev.sh              # launch Claude Code against plugins/, no build needed
bash scripts/dev.sh --build      # rebuild bundles first
npm run generate:plugins         # only after metadata changes
npm run validate:plugins
bun test ./.github/scripts/tests
```

## Maintenance Notes

- Restart Claude Code after manifest, hook, or marketplace changes
- When adding an external plugin, update only the marketplace file that should expose it
- Do not reintroduce a second local source tree, a packing step, or a `.agents/` marketplace
