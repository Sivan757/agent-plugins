# Agent Plugins

IMPORTANT: Always use the 'plugin-dev' skill to develop plugins. Always load the 'plugin-dev' skill.

## Plugin Design Principles
1. Configuration stored globally in `~/.cache/agent-plugins` — never in project directories
2. Use playground and frontend-design create initial configuration page, guided through a visual interface with unified style — accept credentials via UI, not session input
3. Every plugin must include: initialization/setup guidance, usage documentation, and troubleshooting
4. Primary goal: serve users. Secondary: optimize interaction frequency and reduce token usage

## Plugin Development Rules
- Every plugin modification requires a version bump (synced across `plugin.json`, `package.json`, and `marketplace.json`)
- All plugins must support both token-saving mode and native mode
- Use plugin-specific script names (e.g., `ticktick-setup.sh`, not `setup.sh`) to avoid hook misjudgment
- Run `bash scripts/check-plugin-versions.sh` to verify version consistency
- Run `bash scripts/bump-plugin-version.sh <plugin> <version>` to bump versions across all files

## Architecture

**Plugin types** (see `.claude-plugin/marketplace.json` for the full list):
- **CLI-based**: Bundled Node.js scripts in `scripts/`, skills in `skills/`
- **MCP-based**: `.mcp.json` configures external MCP servers
- **Knowledge-base**: Skills with reference docs, no scripts (e.g., `ecommerce-expert` with separate shein/temu skills)
- **External (URL source)**: References to external repos via URL/git-subdir in marketplace.json
- **Location**: local plugin implementations and templates live under `plugin/`, shared runtime packages under `packages/`

**Marketplace registry:** `.claude-plugin/marketplace.json` — all plugins must be listed here
- Local plugins: `"source": "./dir"` with `version` field
- External plugins: `"source": { "source": "url", "url": "https://..." }` or `"source": { "source": "git-subdir", "url": "...", "path": "..." }` — no version field

## Development
- `bash scripts/dev.sh` — launch Claude Code with all local plugins loaded
- `bash scripts/dev.sh mysql ticktick` — load specific plugins only
- `bash scripts/dev.sh --list` — list available plugins with versions
- Changes are picked up with `/reload-plugins` inside the session (no restart needed)

## Config UI
- Architecture: `packages/config-ui/` — json-render React app bundled as single HTML via Vite + vite-plugin-singlefile
- Server: `packages/core/src/config-ui.ts` — injects spec/state as `window.__CONFIG_SPEC__` / `window.__CONFIG_STATE__`, serves `/save` endpoint
- Plugins define declarative specs (e.g., `MYSQL_CONFIG_UI`) with components: Header, Section, Collection, Field, SaveBar
- Field types: `text`, `password`, `select`, `number`, `textarea`, `checkbox`
- Collections: object↔array conversion — config files use object keys (`{default: {...}}`), UI state uses arrays with `_name` field
- i18n: `LocalizedString` type (`{ en: "...", zh: "..." }` or plain string), auto-detects browser language, toggle button in Header
- Credentials go browser → file, never through the LLM
- Use in setup hooks when config is missing (see `plugin/ticktick/hooks/ticktick-setup.sh` for example)
- Build: `cd packages/config-ui && npm run build` — outputs `dist/index.html`
- All 4 credential plugins integrated: ticktick, mysql, postgresql, aliyunlog

## CI Validation
- GitHub Actions workflow (`.github/workflows/validate-plugins.yml`) runs on PRs:
  - **validate-marketplace**: required fields, no duplicates, alphabetical sort
  - **validate-frontmatter**: skills need `description`/`when_to_use`, agents need `name`+`description`
  - **validate-versions**: cross-file version consistency for local plugins
- Validation scripts in `.github/scripts/` — run locally with `bun run .github/scripts/<script>.ts`
- `check-marketplace-sorted.ts --fix` auto-sorts marketplace.json

## Conventions
- Installed marketplace (`~/.claude/plugins/marketplaces/agent-plugins/`) is a separate copy — edit workspace, then sync with `cp` or `scripts/dev.sh` for testing
- `${CLAUDE_PLUGIN_ROOT}` resolves to plugin install path at runtime — use in SKILL.md and hooks
- SessionStart hooks exit 0 (success) always — log warnings but never block
- PreToolUse hooks exit 2 to block, exit 0 to allow; support `permissionDecision: "ask"` for soft blocks
- SKILL.md frontmatter: `model: sonnet`, `allowed-tools: Bash(node:*)` for CLI plugins
- Token-saving mode: enforce limits (default limit=1-10), prefer CSV over JSON, aggregate before detail, server-side filtering
- Credentials: store in `~/.cache/agent-plugins/<plugin>.json` (global), never read directly in sessions
- Version bumps: use `bump-plugin-version.sh` instead of editing 3 files manually — avoids version-check hook firing mid-edit
- AI-facing help text (--help, SKILL.md): avoid fuzzy natural language for defaults — say "omit = auto" not "default: 15 min ago"
- Commits: stage plugin files by name (`git add <plugin>/... marketplace.json`) — don't use `git add -A` since unrelated plugin work may be in-tree
- Multi-skill plugins: group related API knowledge bases under one plugin with separate skills (e.g., `plugin/ecommerce-expert/skills/shein-api-expert/` + `plugin/ecommerce-expert/skills/temu-api-expert/`)
- Adding external plugins: add URL source entry to marketplace.json — do NOT add plugins the user didn't ask for
- CJK font fallback: always include `PingFang SC`, `Noto Sans SC`, `Microsoft YaHei` in font stacks for Chinese support

## SOP: Plugin Development & Optimization

### Phase 1 — Audit (read-only)

1. **Structure check**: verify all files exist per standard directory layout above
2. **Naming check**: `<plugin>.mjs`, `<plugin>-setup.sh`, not `query.js`/`setup.sh`
3. **Config check**: credentials at `~/.cache/agent-plugins/<plugin>.json`, not project-local
4. **Version check**: `bash scripts/check-plugin-versions.sh` — all 3 files in sync
5. **Hook check**: `set -euo pipefail`, silent when deps exist, only print on first install
6. **SKILL.md check**: has frontmatter (`name`, `description`, `model`, `allowed-tools`), `AskUserQuestion` if interactive confirmation needed
7. **Help text check**: no fuzzy language ("15 min ago"), use "omit = auto" style
8. **Init template check**: no hardcoded internal names, empty or generic placeholders only
9. **Doc check**: references/ has config-schema.md, troubleshooting.md at minimum

### Phase 2 — Fix (in priority order)

1. **Bugs first** — correctness issues (falsy skipping, NaN params, unhandled parse errors)
2. **Security** — config location migration, credential exposure, gitignore gaps
3. **Convention compliance** — file renames, hook hardening, noise removal
4. **Documentation** — SKILL.md rewrite, help text, reference docs
5. **Version bump last** — `bash scripts/bump-plugin-version.sh <plugin> <new-version>`

### Rules for AI-facing interfaces

- **--help output is a prompt** — AI reads it literally; "default: 15 min ago" → AI passes `--from="15 min ago"`
- **SKILL.md is a system prompt** — write instructions the AI must follow, not descriptions for humans
- **Use `AskUserQuestion`** when user input has multiple valid interpretations (env→project mapping, ambiguous service names)
- **Offer to persist** — after interactive confirmation, ask "save to CLAUDE.md?" so future sessions skip the question
- **No default mappings** — `--init` creates empty config; user fills in via UI or interactive flow, never baked-in assumptions
