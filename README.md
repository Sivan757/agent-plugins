# Agent Plugins

[English](README.md) | [简体中文](README.zh-CN.md)

A curated collection of useful plugins for real agent workflows.

## What You Can Do

- Investigate production issues from Alibaba Cloud logs
- Query MySQL and PostgreSQL directly from your agent workflow
- Manage TickTick tasks, habits, and focus workflows
- Get structured guidance for SHEIN and Temu platform APIs
- Drive the Apifox CLI to manage API projects, run automation tests, and handle branch collaboration
- Plan, format, package, and stage Chinese new-media drafts for WeChat and Xiaohongshu

## Example Workflows

These are the kinds of jobs this collection is built for:

- "Check recent payment failures in production logs"
- "Show me the schema for the orders table in Postgres"
- "Run this MySQL query against the reporting database"
- "Find where this service builds auth headers"
- "Create a TickTick task for today's release checklist"
- "Explain the Temu order and webhook flow"
- "Run the Apifox test suite for the checkout API and upload the report"
- "Turn this article into a WeChat Official Account draft package"

## Browse The Collection

### Observe systems

| Plugin | What it does |
| --- | --- |
| [aliyunlog](plugins/aliyunlog) | Query Alibaba Cloud SLS logs with environment and service-based lookup |

### Query data

| Plugin | What it does |
| --- | --- |
| [mysql](plugins/mysql) | Run MySQL queries with multi-connection support and a write-statement confirmation guard |
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

### Manage project delivery

| Plugin | What it does |
| --- | --- |
| [zentao](plugins/zentao) | Query and operate ZenTao (禅道) project-management data — stories, bugs, tasks, executions, test runs — through the `zentao` CLI (ported from easysoft/zentao-skills) |

### Manage credentials

| Plugin | What it does |
| --- | --- |
| [config-center](plugins/config-center) | Manage plugin credentials and env config; redacted reads, browser-UI edits |

### Work with commerce APIs

| Plugin | What it does |
| --- | --- |
| [ecommerce-expert](plugins/ecommerce-expert) | Navigate SHEIN and Temu integration APIs with structured reference material, plus offline Temu OpenAPI mirrors (209 endpoint docs, 23 developer guides) |

### Manage API projects

| Plugin | What it does |
| --- | --- |
| [apifox](plugins/apifox) | Manage Apifox project resources, run interface automation tests, import/export API docs, and handle branch collaboration through the `apifox` CLI (official Apifox CLI skills) |

### Run the development-to-operations chain

| Plugin | What it does |
| --- | --- |
| [codearts](plugins/codearts) | Drive Huawei Cloud CodeArts end to end — run pipelines and builds, execute code checks, manage merge requests, deploy applications, move artifacts, and read wiki documents — through one bundled `codearts` CLI, with 782 documented API operations reachable behind it |

## Quick Start

Use the official client installation and plugin management flows first, then install plugins from this collection.

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

Each plugin directory is written by hand and is exactly what Claude Code installs. Nothing is compiled, copied, or repacked to produce it, so what you read in [`plugins/`](plugins/) is what runs.

## Repository Layout

```text
plugins/   the plugins themselves — each directory is installable as-is
docs/      development notes and references
scripts/   metadata generation, bundling, validation, and development helpers
```

A plugin directory holds its own native files (`skills/`, `commands/`, `agents/`, `hooks/`, `.mcp.json`, `assets/`), its metadata source `plugin.config.ts`, and — for plugins with a CLI — the TypeScript source in `src/` next to the committed bundle in `dist/`.

Shared runtime code lives inside the `config-center` plugin (`plugins/config-center/src`), which CLI plugins depend on as the workspace package `@agent-plugins/config-center`.

## For Plugin Authors

If you want to contribute plugins or improve the shared tooling:

- Add or update the plugin directly in [`plugins/<name>/`](plugins/)
- Keep its metadata in `plugins/<name>/plugin.config.ts`
- Run `npm run generate:plugins` after metadata changes; it refreshes `.claude-plugin/plugin.json` and the marketplace entry
- Run `npm run build` only when you change CLI source; the bundle lands in that plugin's own `dist/`
- Run validation before submitting changes; [docs/plugin-development/authoring-a-plugin.md](docs/plugin-development/authoring-a-plugin.md) is the full checklist

Useful commands:

```bash
npm run generate:plugins
npm run build
npm run validate:plugins
bun test ./.github/scripts/tests
bash scripts/dev.sh --list
```

## Further Reading

- [Claude Code plugin development notes](docs/plugin-development/claude-code.md)
- [Recommended external plugins](docs/recommended-plugins.md)
- [AGENTS.md](AGENTS.md)

## Contributing

Contributions are welcome if they improve the plugin catalog or the shared tooling.
