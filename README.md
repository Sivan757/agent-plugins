# Agent Plugins

[English](README.md) | [简体中文](README.zh-CN.md)

A curated collection of useful plugins for real agent workflows.

Works with Codex and Claude Code.

## What You Can Do

- Investigate production issues from Alibaba Cloud logs
- Query MySQL and PostgreSQL directly from your agent workflow
- Search unfamiliar codebases semantically through MCP
- Manage TickTick tasks, habits, and focus workflows
- Keep lightweight local notebook memory across Codex and Claude Code
- Get structured guidance for SHEIN and Temu platform APIs
- Turn vague prompts into clear, actionable development requests

## Example Workflows

These are the kinds of jobs this collection is built for:

- "Check recent payment failures in production logs"
- "Show me the schema for the orders table in Postgres"
- "Run this MySQL query against the reporting database"
- "Find where this service builds auth headers"
- "Create a TickTick task for today's release checklist"
- "Remember this project pitfall in the local notebook"
- "Explain the Temu order and webhook flow"
- "Rewrite this rough feature request into a precise coding prompt"

## Browse The Collection

### Observe systems

| Plugin | What it does |
| --- | --- |
| [aliyunlog](plugins/aliyunlog) | Query Alibaba Cloud SLS logs with environment and service-based lookup |

### Query data

| Plugin | What it does |
| --- | --- |
| [mysql](plugins/mysql) | Run MySQL queries with multi-connection support |
| [postgresql](plugins/postgresql) | Run PostgreSQL queries with schema discovery and parameterized queries |

### Search code and context

| Plugin | What it does |
| --- | --- |
| [augment-mcp](plugins/augment-mcp) | Connect Augment Context Engine as an MCP server for semantic codebase search |

### Shape requests

| Plugin | What it does |
| --- | --- |
| [prompt-enhancer](plugins/prompt-enhancer) | Rewrite vague prompts into clear, actionable development requests |

### Manage personal execution

| Plugin | What it does |
| --- | --- |
| [notebook](plugins/notebook) | Keep local Markdown notebook memory with startup context, audits, and transcript-backed insights |
| [ticktick](plugins/ticktick) | Manage TickTick tasks, projects, habits, and productivity workflows |

### Work with commerce APIs

| Plugin | What it does |
| --- | --- |
| [ecommerce-expert](plugins/ecommerce-expert) | Navigate SHEIN and Temu integration APIs with structured reference material |

## Quick Start

Use the official client installation and plugin management flows first, then install plugins from this collection.

### Use in Codex

1. Install Codex using the official docs.
2. Open the plugin directory:
   App: `Plugins`
   CLI: `/plugins`
3. Add this repository as a plugin source using the official plugin management flow.
4. Install the plugin you want from this collection.

References:
- [Codex plugins overview](https://developers.openai.com/codex/plugins)
- [Build Codex plugins](https://developers.openai.com/codex/plugins/build)

### Use in Claude Code

1. Install Claude Code using the official docs.
2. Add this repository as a marketplace:

```text
/plugin marketplace add Sivan757/agent-plugins
```

3. Install the plugin you want:

```text
/plugin install mysql@agent-plugins
```

4. Repeat for any other plugin in the collection.

References:
- [Claude Code setup](https://docs.anthropic.com/en/docs/claude-code/setup)
- [Discover plugins in Claude Code](https://code.claude.com/docs/en/discover-plugins)

## Why This Repo Exists

Most plugin repositories either focus on one client or treat the plugin code as an implementation detail hidden behind internal tooling. This repository takes the opposite approach: the plugin collection is the product.

The shared source tree matters because it keeps the plugins easier to maintain, but that is not the main value proposition. The main value proposition is that this repository collects practical plugins for logs, databases, task management, code search, and API-heavy workflows in one place.

## Repository Layout

```text
plugins/   local plugin implementations
packages/  shared runtime code and helpers
docs/      development notes and references
scripts/   repository tooling and migration helpers
```

## For Plugin Authors

If you want to contribute plugins or improve the shared tooling:

- Add or update plugins in [`plugins/`](plugins/)
- Keep Codex and Claude metadata aligned
- Run validation before submitting changes

Useful commands:

```bash
npm run validate:plugins
bash scripts/check-plugin-versions.sh
bun test ./.github/scripts/tests
```

## Further Reading

- [Codex plugin development notes](docs/plugin-development/codex.md)
- [Claude Code plugin development notes](docs/plugin-development/claude-code.md)
- [Recommended external plugins](docs/recommended-plugins.md)
- [AGENTS.md](AGENTS.md)

## Contributing

Contributions are welcome if they improve the plugin catalog, shared tooling, or cross-client compatibility of the repository.
