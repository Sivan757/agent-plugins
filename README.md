# Agent Plugins

Curated plugin repository with a shared `plugins/` source tree for both Codex and Claude Code.

Local plugin implementations live under `plugins/`. Shared runtime packages stay in `packages/`.

Marketplace files:
- Codex: `.agents/plugins/marketplace.json`
- Claude Code: `.claude-plugin/marketplace.json`

## Codex Plugin Baseline

This repository now enforces the current Codex plugin shape from the official docs:

- Every local plugin must have `.codex-plugin/plugin.json`, and that directory should contain only `plugin.json`
- Optional Codex surfaces stay at the plugin root and are referenced from the manifest with canonical `./` paths: `./skills/`, `./hooks.json`, `./.mcp.json`, `./.app.json`, and `./assets/...`
- If hook config exists, keep `hooks.json` and `hooks/hooks.json` together and JSON-identical
- Every skill directory must contain `SKILL.md` with minimal compatible frontmatter: `name` and `description`
- Optional per-skill Codex metadata can live in `agents/openai.yaml`
- The Codex marketplace is `.agents/plugins/marketplace.json`; local entries must use `{ "source": "local", "path": "./plugins/<name>" }`
- Every Codex marketplace entry must include `policy.installation`, `policy.authentication`, and `category`

Codex can also consume a Claude-style marketplace source, but this repo keeps a dedicated Codex marketplace and a Claude marketplace in sync because we support both clients from the same `plugins/` tree.

## Claude Plugin Baseline

This repository also enforces the Claude/plugin-dev structure for the same shared plugin source tree:

- Every local plugin must have `.claude-plugin/plugin.json`, and that directory should contain only `plugin.json`
- Claude components stay at plugin root, not inside `.claude-plugin/`: `commands/`, `agents/`, `skills/`, `hooks/`, and `.mcp.json`
- Prefer default Claude auto-discovery locations; if the Claude manifest explicitly points at hooks or MCP config, use `./hooks/hooks.json` and `./.mcp.json`
- `hooks/hooks.json` must use the Claude plugin wrapper format with a top-level `hooks` object
- Use `${CLAUDE_PLUGIN_ROOT}` for path-sensitive Claude runtime references inside hooks, MCP config, commands, agents, and skills

Upstream references:
- [Build Codex plugins](https://developers.openai.com/codex/plugins/build)
- [Codex skills](https://developers.openai.com/codex/skills)

Platform notes:
- [Codex plugin development notes](docs/plugin-development/codex.md)
- [Claude Code plugin development notes](docs/plugin-development/claude-code.md)

## Quick Start

```bash
# Launch Codex from the repo root
bash scripts/dev.sh --target codex

# Launch Claude Code with local plugins loaded via --plugin-dir
bash scripts/dev.sh --target claude

# List available local plugins
bash scripts/dev.sh --list

# Build selected plugins, then launch a target client
bash scripts/dev.sh --target codex mysql ticktick
bash scripts/dev.sh --target claude mysql ticktick
```

## Plugin Directory

### Local Plugins

| Plugin | Version | Description |
|--------|---------|-------------|
| [aliyunlog](./plugins/aliyunlog) | 1.6.0 | Query Alibaba Cloud SLS logs with environment and service-based quick lookup |
| [augment-mcp](./plugins/augment-mcp) | 0.1.1 | Augment Context Engine MCP for semantic codebase search across repositories |
| [ecommerce-expert](./plugins/ecommerce-expert) | 1.0.0 | SHEIN (173 endpoints) + Temu (124 endpoints) API knowledge base -- two independent skills, one plugin |
| [mysql](./plugins/mysql) | 0.11.0 | SQL queries against MySQL databases with multi-connection support |
| [postgresql](./plugins/postgresql) | 0.5.0 | SQL queries against PostgreSQL databases with schema inspection |
| [ticktick](./plugins/ticktick) | 0.6.0 | TickTick (Dida365) task management, habits, focus sessions, and stats |

### External Plugins (curated from other repos)

Curated external plugins are currently exposed through the Claude marketplace file. The Codex marketplace currently tracks local plugins only.

| Plugin | Origin | Description |
|--------|--------|-------------|
| understand-anything | [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) | Transform codebases into interactive knowledge graphs |

To add more external plugins for Claude Code, add a URL source entry to `.claude-plugin/marketplace.json`:

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

For plugins inside a larger repo (like `claude-plugins-official`), use `git-subdir`:

```json
{
  "name": "plugin-name",
  "description": "What it does",
  "source": {
    "source": "git-subdir",
    "url": "https://github.com/anthropics/claude-plugins-official.git",
    "path": "plugins/plugin-name"
  },
  "homepage": "https://github.com/anthropics/claude-plugins-official"
}
```

See **[docs/recommended-plugins.md](docs/recommended-plugins.md)** for a curated list of external plugins worth adding.

## Development

### Local development

```bash
bash scripts/dev.sh --target codex
bash scripts/dev.sh --target claude
bash scripts/dev.sh --target codex mysql ticktick
bash scripts/dev.sh --target claude mysql ticktick
bash scripts/dev.sh --list             # List available plugins with versions
```

If you change manifests, hooks, or marketplace wiring, restart the client you are testing.

### Version management

```bash
bash scripts/check-plugin-versions.sh              # Verify version consistency
bash scripts/bump-plugin-version.sh <plugin> <ver>  # Bump version across all files
npm run validate:plugins                           # Run Claude layout + Codex layout + marketplace + version validation
bun test ./.github/scripts/tests                   # Run validator script tests when changing repo checks
```

### Convert a Claude plugin into the shared layout

```bash
npm run convert-to-codex -- --source /path/to/claude-plugin/mysql --marketplace-root .
```

This writes a shared plugin to `plugins/<name>` by default, creates both `.codex-plugin/plugin.json` and `.claude-plugin/plugin.json`, mirrors hook config to both Codex and Claude-compatible locations, normalizes `SKILL.md` frontmatter down to Codex-compatible `name` + `description`, and optionally updates both marketplace files.
The converter intentionally warns instead of guessing when it finds Claude-specific runtime assumptions such as nested hook configs or `${CLAUDE_PLUGIN_ROOT}` references.

### Creating a new plugin

See the [Plugin Development Guide](CLAUDE.md) for repository-wide rules, then use the platform notes for client-specific experience:

- [Codex plugin development notes](docs/plugin-development/codex.md)
- [Claude Code plugin development notes](docs/plugin-development/claude-code.md)

## Contributing

1. Create a branch for your plugin changes
2. Follow the [Plugin Development SOP](CLAUDE.md#sop-plugin-development--optimization)
3. Run `npm run validate:plugins` and `bash scripts/check-plugin-versions.sh` before submitting
4. Open a PR -- CI will validate Codex layout, both marketplace files, frontmatter, and manifest consistency

## License

Internal use.
