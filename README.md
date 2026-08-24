# Agent Plugins

[English](README.md) | [简体中文](README.zh-CN.md)

A curated collection of useful plugins for real agent workflows.

Works with Codex and Claude Code.

## What You Can Do

- Investigate production issues from Alibaba Cloud logs
- Query MySQL and PostgreSQL directly from your agent workflow
- Manage TickTick tasks, habits, and focus workflows
- Get structured guidance for SHEIN and Temu platform APIs
- Plan, format, package, and stage Chinese new-media drafts for WeChat and Xiaohongshu

## Example Workflows

These are the kinds of jobs this collection is built for:

- "Check recent payment failures in production logs"
- "Show me the schema for the orders table in Postgres"
- "Run this MySQL query against the reporting database"
- "Find where this service builds auth headers"
- "Create a TickTick task for today's release checklist"
- "Explain the Temu order and webhook flow"
- "Turn this article into a WeChat Official Account draft package"

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

### Process media

| Plugin | What it does |
| --- | --- |
| [ffmpeg](plugins/ffmpeg) | Build and verify FFmpeg/ffprobe commands for video, audio, and image media |
| [magick](plugins/magick) | Build ImageMagick workflows for conversion, resizing, mockups, and compositing |
| [real-esrgan](plugins/real-esrgan) | Upscale and enhance raster images with Real-ESRGAN, verified via ImageMagick |
| [withoutbg](plugins/withoutbg) | Remove image backgrounds with the withoutbg CLI |

### Manage prompts

| Plugin | What it does |
| --- | --- |
| [prompt-forge](plugins/prompt-forge) | Image-generation prompt library with RAG search, synthesis, and rating over a local SQLite DB |

### Get advice

| Plugin | What it does |
| --- | --- |
| [consulting-advisor](plugins/consulting-advisor) | Structured cross-domain consulting using authoritative frameworks |

### Manage personal execution

| Plugin | What it does |
| --- | --- |
| [ticktick](plugins/ticktick) | Manage TickTick tasks, projects, habits, and productivity workflows |

### Manage credentials

| Plugin | What it does |
| --- | --- |
| [config-center](plugins/config-center) | Manage plugin credentials and env config; redacted reads, browser-UI edits |

### Work with commerce APIs

| Plugin | What it does |
| --- | --- |
| [ecommerce-expert](plugins/ecommerce-expert) | Navigate SHEIN and Temu integration APIs with structured reference material, plus offline Temu OpenAPI mirrors (209 endpoint docs, 23 developer guides) |

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

The shared source tree matters because it keeps the plugins easier to maintain, but that is not the main value proposition. The main value proposition is that this repository collects practical plugins for logs, databases, task management, code search, content operations, and API-heavy workflows in one place.

## Repository Layout

```text
src/       local plugin source and metadata
plugins/   generated installable plugin artifacts
docs/      development notes and references
scripts/   metadata generation, packaging, validation, and migration helpers
```

Shared runtime code lives inside the `config-center` plugin (`src/config-center`), which CLI plugins depend on as the workspace package `@agent-plugins/config-center`.

## For Plugin Authors

If you want to contribute plugins or improve the shared tooling:

- Add or update plugin source in [`src/`](src/)
- Keep shared metadata in `src/<name>/plugin.config.ts`
- Run `npm run generate:plugins` after metadata changes
- Run `npm run build` for buildable plugins
- Use `npm run pack:plugins` to refresh clean installable artifacts under [`plugins/`](plugins/)
- Run validation before submitting changes

Useful commands:

```bash
npm run generate:plugins
npm run pack:plugins
npm run validate:plugin-metadata
npm run validate:plugin-packs
npm run validate:plugins
bun test ./.github/scripts/tests
```

## Further Reading

- [Codex plugin development notes](docs/plugin-development/codex.md)
- [Claude Code plugin development notes](docs/plugin-development/claude-code.md)
- [Recommended external plugins](docs/recommended-plugins.md)
- [AGENTS.md](AGENTS.md)

## Contributing

Contributions are welcome if they improve the plugin catalog, shared tooling, or cross-client compatibility of the repository.
