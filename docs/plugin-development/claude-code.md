# Claude Code Plugin Development Notes

Repository-specific knowledge for building and maintaining plugins for Claude Code. This repository targets Claude Code only.

## Current Repo Model

- `plugins/` is the generated release tree referenced by local marketplace entries
- Every local plugin keeps `plugin.config.ts` as generated metadata source of truth
- Release artifacts include a generated Claude manifest at `.claude-plugin/plugin.json`
- `.claude-plugin/` stays manifest-only in release artifacts: keep only generated `plugin.json` there
- Claude marketplace lives at `.claude-plugin/marketplace.json` and is the only marketplace file
- Local Claude marketplace entries point at `./plugins/<name>` and are generated from `plugin.config.ts`

## Manifest And Component Conventions

- Do not hand-edit `.claude-plugin/plugin.json`; edit `src/<name>/plugin.config.ts`, then regenerate and repack
- Keep Claude components at plugin root, not under `.claude-plugin/`: `commands/`, `agents/`, `skills/`, `hooks/`, and `.mcp.json`
- Prefer Claude default auto-discovery over explicit manifest paths
- Do not declare the standard `./hooks/hooks.json` in `.claude-plugin/plugin.json`; Claude auto-discovers that file and treats a manifest reference as a duplicate load
- If future Claude metadata declares MCP config, it must use `./.mcp.json`
- Hook config is optional: add `hooks/hooks.json` (Claude wrapper format with an optional `description` plus a top-level `hooks` object) only when the plugin actually defines hooks. Do not ship empty placeholders
- Use `${CLAUDE_PLUGIN_ROOT}` anywhere Claude-executed config or content needs a plugin-local path

## Release Artifacts

- Development source stays under `src/<name>`
- Buildable plugins emit runtime bundles under `.build/plugin-dist/<name>/`
- Clean installable artifacts are generated and committed under `plugins/<name>`
- Source-tree plugins must not contain `.claude-plugin/`
- Packed artifacts include generated manifests plus native runtime surfaces such as `README.md`, `skills/`, `hooks/`, `.mcp.json`, `.app.json`, `assets/`, and `dist/`
- Packed artifacts exclude source-only files such as `src/`, `package.json`, `package-lock.json`, `tsconfig.json`, `plugin.config.ts`, and `node_modules/`
- Hooks stay native to the host agent; the pack pipeline copies `hooks/` when present but does not translate hook semantics

## What Still Matters For Claude

- Claude marketplace metadata carries versioned local entries
- Claude supports external plugin references in the marketplace via remote `source` objects; this repo uses that for curated third-party plugins

## Practical Lessons

- Claude-oriented path tokens may survive migrations; treat `${CLAUDE_PLUGIN_ROOT}` as a review point, not something to auto-rewrite blindly
- Version mismatches between `plugin.config.ts`, `package.json`, generated manifests, and marketplace metadata create noisy breakage; update metadata first, regenerate, then validate

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
bash scripts/dev.sh
npm run generate:plugins
npm run validate:plugin-metadata
npm run build
npm run pack:plugins
npm run validate:plugin-packs
npm run validate:plugins
bun test ./.github/scripts/tests
```

## Maintenance Notes

- Restart Claude Code after manifest, hook, or marketplace changes
- When adding an external plugin, update only the marketplace file that should expose it
- Do not reintroduce a second local source tree for cross-client copies
