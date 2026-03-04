# Apex Plugins

## Plugin Design Principles
1. Configuration stored globally in `~/.cache/apex-plugin` — never in project directories
2. Initial configuration guided through a visual interface with unified style — accept credentials via UI, not session input
3. Every plugin must include: initialization/setup guidance, usage documentation, and troubleshooting
4. Primary goal: serve users. Secondary: optimize interaction frequency and reduce token usage

## Plugin Development Rules
- Always loading the plugin-dev skill
- Every plugin modification requires a version bump (synced across `plugin.json`, `package.json`, and `marketplace.json`)
- All plugins must support both token-saving mode and native mode
- Use plugin-specific script names (e.g., `ticktick-setup.sh`, not `setup.sh`) to avoid hook misjudgment
- Run `bash scripts/check-plugin-versions.sh` to verify version consistency
- Run `bash scripts/bump-plugin-version.sh <plugin> <version>` to bump versions across all files

## Architecture

**8 plugins across 3 types:**
- **CLI-based** (mysql, aliyunlog, ticktick): Bundled Node.js scripts in `scripts/`, skills in `skills/`
- **MCP-based** (feishu, augment, jetbrains): `.mcp.json` configures external MCP servers
- **Policy/rules** (security, p3c): Hooks-only, no scripts or MCP

**Standard directory layout:**
```
<plugin>/
  .claude-plugin/plugin.json   # Required: name, version, description, author
  hooks/hooks.json             # Required: SessionStart (setup) and/or PreToolUse (guards)
  hooks/<plugin>-setup.sh      # SessionStart hook — must exit 0 (never block session)
  skills/<plugin>/SKILL.md     # Skill with frontmatter (name, description, model, allowed-tools)
  skills/<plugin>/references/  # config-schema.md, troubleshooting.md, etc.
  scripts/<plugin>.mjs         # CLI script (CLI-based plugins)
  .mcp.json                    # MCP server config (MCP-based plugins)
```

**Marketplace registry:** `.claude-plugin/marketplace.json` — all plugins must be listed here

## Conventions
- `${CLAUDE_PLUGIN_ROOT}` resolves to plugin install path at runtime — use in SKILL.md and hooks
- SessionStart hooks exit 0 (success) always — log warnings but never block
- PreToolUse hooks exit 2 to block, exit 0 to allow; support `permissionDecision: "ask"` for soft blocks
- SKILL.md frontmatter: `model: sonnet`, `allowed-tools: Bash(node:*)` for CLI plugins
- Token-saving mode: enforce limits (default limit=1-10), prefer CSV over JSON, aggregate before detail, server-side filtering
- Credentials: store in `.claude/<plugin>.json` or `scripts/.env` (gitignored), never read directly in sessions
