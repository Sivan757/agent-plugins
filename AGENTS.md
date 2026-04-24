# Agent Plugins

General repository guidelines for maintaining the shared `plugins/` source tree.

## Source of Truth

- Local plugin implementations live under `plugins/`
- Shared runtime packages live under `packages/`
- Do not keep a parallel local `plugin/` tree
- `CLAUDE.md` is a symlink to this file; keep broad repository guidance here

## Required Plugin Shape

- Every local plugin must carry both `.codex-plugin/plugin.json` and `.claude-plugin/plugin.json`
- Keep both manifest directories minimal: `.codex-plugin/` and `.claude-plugin/` should contain only `plugin.json`
- Codex bundle content belongs at plugin root: `skills/`, `hooks.json`, `.mcp.json`, `.app.json`, and `assets/` when present
- Codex manifest paths must use the root-standard locations: `./skills/`, `./hooks.json`, `./.mcp.json`, `./.app.json`, and `./assets/...`
- Claude auto-discovery content belongs at plugin root, not under `.claude-plugin/`: `commands/`, `agents/`, `skills/`, `hooks/`, and `.mcp.json`
- Prefer Claude default discovery paths over manifest overrides; if `.claude-plugin/plugin.json` declares `hooks` or `mcpServers`, use `./hooks/hooks.json` and `./.mcp.json`
- Claude-compatible hook config lives at `hooks/hooks.json`
- Claude hook config must use the plugin wrapper format with a top-level `hooks` object
- If hook config exists, keep `hooks.json` and `hooks/hooks.json` together and JSON-identical
- Codex manifest paths must stay `./`-relative to the plugin root and point at real files or directories
- Each skill directory must contain `SKILL.md` with minimal compatible frontmatter: `name` + `description`
- Optional per-skill Codex metadata may live in `agents/openai.yaml`
- Use `${CLAUDE_PLUGIN_ROOT}` for Claude-side path-sensitive references in hooks, MCP configs, commands, agents, and skills

## Marketplace Rules

- Codex registry: `.agents/plugins/marketplace.json`
- Claude Code registry: `.claude-plugin/marketplace.json`
- Local plugins must be registered in both marketplace files at `./plugins/<name>`
- Codex marketplace local entries must use `{ "source": "local", "path": "./plugins/<name>" }`
- Codex marketplace entries must always include `policy.installation`, `policy.authentication`, and `category`

## Repository Rules

- Store credentials in `~/.cache/agent-plugins/<plugin>.json`, never in project-local files
- Version bumps must update both manifests and `package.json` when the plugin has a buildable workspace
- Use `bash scripts/bump-plugin-version.sh <plugin> <version>` instead of manual multi-file edits
- Run `bash scripts/check-plugin-versions.sh` after plugin metadata changes
- Run `npm run validate:plugins` before submitting changes that affect manifests, marketplaces, or skill metadata
- When changing validator scripts, run `bun test ./.github/scripts/tests`
- Stage plugin changes explicitly by path; do not use `git add -A` in this repo

## Development Commands

- `bash scripts/dev.sh --target codex`
- `bash scripts/dev.sh --target claude`
- `bash scripts/dev.sh --list`
- `npm run validate:plugins`
- `bash scripts/check-plugin-versions.sh`

## Platform References

Platform-specific knowledge, migration notes, and practical experience live in reference docs instead of this file:

- Codex plugin development: [docs/plugin-development/codex.md](docs/plugin-development/codex.md)
- Claude Code plugin development: [docs/plugin-development/claude-code.md](docs/plugin-development/claude-code.md)

Official upstream references:

- Codex build docs: [developers.openai.com/codex/plugins/build](https://developers.openai.com/codex/plugins/build)
- Codex skills docs: [developers.openai.com/codex/skills](https://developers.openai.com/codex/skills)
