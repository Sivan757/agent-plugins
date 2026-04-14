# Apex Plugins

Aikero's curated Claude Code plugin directory -- internal tools and recommended external plugins, **all installable from one marketplace**.

## Quick Start

```bash
# Add this marketplace (one-time)
/plugin marketplace add apex-plugins

# Install any plugin -- internal or external
/plugin install <plugin-name>@apex-plugins
```

## Plugin Directory

### Internal Plugins (built by us)

| Plugin | Version | Description |
|--------|---------|-------------|
| [aliyunlog](./aliyunlog) | 1.6.0 | Query Alibaba Cloud SLS logs with environment and service-based quick lookup |
| [augment-mcp](./augment) | 0.1.1 | Augment Context Engine MCP for semantic codebase search across repositories |
| [company-knowledge](./company-knowledge) | 0.2.1 | Aikero knowledge base -- Blade, team conventions, Gradle, Kotlin/Spring Boot/Jimmer |
| [find-skills](./find-skills) | 0.1.1 | Discover and install agent skills from the skills.sh ecosystem |
| [jetbrains-mcp](./jetbrains) | 0.1.0 | JetBrains MCP for IDE-level file operations, refactoring, and code navigation |
| [mysql](./mysql) | 0.11.0 | SQL queries against MySQL databases with multi-connection support |
| [p3c](./p3c) | 0.1.0 | Alibaba P3C Java coding guidelines as Claude Code rules |
| [postgresql](./postgresql) | 0.5.0 | SQL queries against PostgreSQL databases with schema inspection |
| [ecommerce-expert](./ecommerce-expert) | 1.0.0 | SHEIN (173 endpoints) + Temu (124 endpoints) API knowledge base -- two independent skills, one plugin |
| [ticktick](./ticktick) | 0.6.0 | TickTick (Dida365) task management, habits, focus sessions, and stats |

### External Plugins (curated from other repos)

External plugins are referenced by URL in our marketplace -- install them the same way: `/plugin install <name>@apex-plugins`

| Plugin | Origin | Description |
|--------|--------|-------------|
| understand-anything | [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) | Transform codebases into interactive knowledge graphs |

To add more external plugins, add a URL source entry to `.claude-plugin/marketplace.json`:

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
bash scripts/dev.sh                    # Load all plugins
bash scripts/dev.sh mysql ticktick     # Load specific plugins
bash scripts/dev.sh --list             # List available plugins with versions
```

Changes are picked up with `/reload-plugins` inside the session (no restart needed).

### Version management

```bash
bash scripts/check-plugin-versions.sh              # Verify version consistency
bash scripts/bump-plugin-version.sh <plugin> <ver>  # Bump version across all files
```

### Creating a new plugin

See the [Plugin Development Guide](CLAUDE.md) and the [plugin-dev skill](https://github.com/anthropics/claude-plugins-official) for scaffolding and best practices.

## Contributing

1. Create a branch for your plugin changes
2. Follow the [Plugin Development SOP](CLAUDE.md#sop-plugin-development--optimization)
3. Run `bash scripts/check-plugin-versions.sh` before submitting
4. Open a PR -- CI will validate marketplace.json, frontmatter, and version consistency

## License

Internal use -- Aikero team.
