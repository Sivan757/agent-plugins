# Claude Code Plugin Development Notes

Repository-specific knowledge for keeping the shared `plugins/` tree compatible with Claude Code.

## Current Repo Model

- Claude Code compatibility is maintained from the same `plugins/` source tree used by Codex
- Every local plugin includes a Claude manifest at `.claude-plugin/plugin.json`
- `.claude-plugin/` stays manifest-only: keep only `plugin.json` there
- Claude marketplace lives at `.claude-plugin/marketplace.json`
- Local Claude marketplace entries point at `./plugins/<name>`
- Claude-compatible hook config is mirrored at `hooks/hooks.json`
- When hook config exists, `hooks/hooks.json` must stay JSON-identical to plugin-root `hooks.json`

## Manifest And Component Conventions

- Keep Claude components at plugin root, not under `.claude-plugin/`: `commands/`, `agents/`, `skills/`, `hooks/`, and `.mcp.json`
- Prefer Claude default auto-discovery over explicit manifest paths
- If `.claude-plugin/plugin.json` declares hooks, use `./hooks/hooks.json`
- If `.claude-plugin/plugin.json` declares MCP config, use `./.mcp.json`
- `hooks/hooks.json` should use the Claude plugin wrapper format with an optional `description` plus a top-level `hooks` object
- Use `${CLAUDE_PLUGIN_ROOT}` anywhere Claude-executed config or content needs a plugin-local path

## What Still Matters For Claude

- Claude marketplace metadata still carries versioned local entries
- Claude supports external plugin references in the marketplace via remote `source` objects
- We currently use the Claude marketplace for curated external plugins while the Codex marketplace tracks local plugins only

## Practical Lessons

- Supporting Claude and Codex from one tree is workable if manifests and marketplace entries are validated together
- Hook compatibility is the easiest place for drift to appear, so keep `hooks.json` and `hooks/hooks.json` aligned whenever hook behavior changes
- Claude-oriented path tokens may survive migrations; treat `${CLAUDE_PLUGIN_ROOT}` as a review point, not something to auto-rewrite blindly
- Version mismatches between `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `package.json`, and marketplace metadata create noisy breakage; use the repo scripts instead of manual edits

## External Plugin Experience

Claude marketplace entries can reference external repositories directly. This repo currently uses that for curated third-party plugins.

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
bash scripts/dev.sh --target claude
npm run validate:plugins
bash scripts/check-plugin-versions.sh
bun test ./.github/scripts/tests
```

## Maintenance Notes

- Restart Claude Code after manifest, hook, or marketplace changes
- When adding an external plugin, update only the marketplace file that should expose it
- Do not reintroduce a second local source tree for Claude-specific copies
