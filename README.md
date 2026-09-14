<div align="center">

  # Agent Plugins

  *Practical plugins for real agent workflows*

  [English](README.md) · [简体中文](README.zh-CN.md)

  [![Validate Plugins](https://img.shields.io/github/actions/workflow/status/Sivan757/agent-plugins/validate-plugins.yml?style=flat-square&label=validate)](https://github.com/Sivan757/agent-plugins/actions/workflows/validate-plugins.yml)
  [![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22-3c873a?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
  [![Claude Code plugin](https://img.shields.io/badge/Claude%20Code-plugin-d97757?style=flat-square)](https://code.claude.com/docs/en/discover-plugins)

  [What you can do](#what-you-can-do) · [Examples](#example-workflows) · [Install](#install) · [The collection](#the-collection) · [Troubleshooting](#troubleshooting)

</div>

A collection of plugins that give your agent real leverage: the credentials and
API knowledge to reach your systems, the command-line tools to operate them, and
the procedures to do it consistently.

Every plugin is a directory in this repository. What you install is what you can
read — no build step stands between the two.

## What You Can Do

- **Investigate production** — chase an error through Alibaba Cloud SLS logs by environment and service
- **Query data** — run MySQL and PostgreSQL statements over saved connections, with schema discovery and parameterized values
- **Process media** — compress, convert, resize, upscale, and cut out images, audio, and video
- **Design interfaces** — audit or rebuild a page that reads as machine-made, or extract the design DNA from a reference
- **Find prompts** — search, rate, and synthesize image-generation prompts from a local library
- **Decide with a framework** — work an ambiguous problem through an authoritative model chosen for the domain
- **Keep delivery moving** — ZenTao stories and bugs, TickTick tasks and habits, and Apifox API projects without opening another web UI
- **Integrate** — look up SHEIN and Temu API details offline, and run the Huawei Cloud CodeArts chain from pipeline to deploy
- **Keep a codebase healthy** — review standards, pre-push checks, CI flake diagnosis, docs and notes hygiene, and prose passes
- **Handle credentials** — read configuration redacted, and edit it through a local browser form instead of pasting secrets into chat

## Example Workflows

These are the kinds of jobs this collection is built for:

- "Check recent payment failures in production logs"
- "Show me the schema for the orders table in Postgres"
- "Compress this 4K clip to 1080p and verify it plays"
- "Remove the background from these product photos"
- "This landing page feels generic — audit it and fix the worst offenders"
- "Create a TickTick task for today's release checklist"
- "Which story is blocking the current execution?"
- "Explain the Temu order and webhook flow"
- "Run the Apifox test suite for the checkout API and upload the report"
- "Why did the build on our CodeArts pipeline fail?"

## Requirements

- **Claude Code**, installed through the [official docs](https://docs.anthropic.com/en/docs/claude-code/setup)
- **Node.js 22 or newer**, for the plugins that bundle a CLI. They run as
  `node ${CLAUDE_PLUGIN_ROOT}/dist/<plugin>.mjs`; `prompt-forge` uses the built-in
  `node:sqlite`, which is where the floor comes from

Plugins that only carry skills need nothing beyond Claude Code.

## Quick Start

### Install

1. Add this repository as a marketplace:

   ```text
   /plugin marketplace add Sivan757/agent-plugins
   ```

2. Install the plugin you want:

   ```text
   /plugin install mysql@agent-plugins
   ```

3. Repeat for any other plugin in [the collection](#the-collection).

> [!NOTE]
> Plugins install one at a time. Install only the ones you need — each one adds
> its descriptions to every session.

## The Collection

### Observe systems

| Plugin | What it does |
| --- | --- |
| [aliyunlog](plugins/aliyunlog) | Query Alibaba Cloud SLS logs, with environment and service-based lookup |

### Query data

| Plugin | What it does |
| --- | --- |
| [database](plugins/database) | Run MySQL and PostgreSQL statements over saved connections — each connection carries its engine — with database and schema discovery, column listing, table profiling, and a guard on write statements |

### Process media

| Plugin | What it does |
| --- | --- |
| [ffmpeg](plugins/ffmpeg) | Build and verify FFmpeg and ffprobe commands for video, audio, and images |
| [magick](plugins/magick) | Build ImageMagick workflows — conversion, resizing, mockups, compositing — and run Real-ESRGAN upscaling and withoutbg background removal as verified steps in the same pipeline |

### Design interfaces

| Plugin | What it does |
| --- | --- |
| [hallmark](plugins/hallmark) | Audit, redesign, or build a page against an anti-slop design rule set, and extract the design DNA from a reference |

### Work across engineering domains

| Plugin | What it does |
| --- | --- |
| [teams](plugins/teams) | Nine domain agents — product, design, frontend, backend, data, api, test, ops, analytics — backed by a knowledge library where each domain routes to the one topic document that answers the question |

### Manage prompts

| Plugin | What it does |
| --- | --- |
| [prompt-forge](plugins/prompt-forge) | Search, classify, rate, and synthesize image-generation prompts from a local library of 25k+ examples |

### Get advice

| Plugin | What it does |
| --- | --- |
| [consulting-advisor](plugins/consulting-advisor) | Work through an ambiguous problem with an authoritative framework, chosen for the domain |

### Manage personal execution

| Plugin | What it does |
| --- | --- |
| [ticktick](plugins/ticktick) | Manage TickTick tasks, projects, tags, habits, kanban columns, and focus sessions |

### Manage project delivery

| Plugin | What it does |
| --- | --- |
| [zentao](plugins/zentao) | Query and operate ZenTao data — stories, bugs, tasks, executions, test runs — through the `zentao` CLI |

### Manage API projects

| Plugin | What it does |
| --- | --- |
| [apifox](plugins/apifox) | Deliver a set of APIs end to end — design, environments, mocks, tests, doc export, branch merge — and manage Apifox project resources |

### Work with commerce APIs

| Plugin | What it does |
| --- | --- |
| [ecommerce-expert](plugins/ecommerce-expert) | Navigate SHEIN and Temu integration APIs, with a compiled Temu handbook and an offline mirror of 232 captured Partner Platform documents |

### Run the development-to-operations chain

| Plugin | What it does |
| --- | --- |
| [codearts](plugins/codearts) | Drive Huawei Cloud CodeArts end to end — pipelines, builds, code checks, merge requests, deploys, artifacts, wiki — through one bundled CLI over 782 documented API operations |

### Work on DeepSeek Harness

| Plugin | What it does |
| --- | --- |
| [dsh-workflow](plugins/dsh-workflow) | Review standards, pre-push checks, CI flake diagnosis, docs lifecycle, Agent Notes hygiene, prose and simplification passes, stacked PRs, and browser GIF demos |
| [dsh-evolve](plugins/dsh-evolve) | Hooks that count tool activity, spot repeated calls and failure streaks, and nudge the agent to fold repeated work into a reusable skill |
| [dsh-plugin-creator](plugins/dsh-plugin-creator) | Author, package, install, and debug DeepSeek Harness plugins in a separate repository |

### Manage credentials

| Plugin | What it does |
| --- | --- |
| [config-center](plugins/config-center) | Inspect and edit stored plugin credentials; agent-facing reads are redacted, edits go through the browser form |

## How It Works

A plugin is two kinds of thing: **skills** that tell the agent how to do a job,
and — when the job needs to talk to a service — a **bundled CLI** that does it.
The CLI is built with esbuild, which inlines every dependency, so an installed
plugin never runs `npm install` and carries no `node_modules`.

Credentials and environment state live outside this repository, in
`~/.cache/agent-plugins/<plugin>/config.json`. Each plugin opens a local browser
form to edit them — the agent runs it as a background task, in this shape:

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/<plugin>.mjs" config --ui    # the plugin's own form
node "${CLAUDE_PLUGIN_ROOT}/dist/config-center.mjs" edit mysql # the shared editor
```

> [!IMPORTANT]
> Reads of stored configuration are always redacted, and no subcommand prints the
> cache path or a plaintext secret. The agent is expected to open the form for you
> rather than typing credentials.

This marketplace also curates a small number of third-party plugins alongside the
local ones; see [recommended external plugins](docs/recommended-plugins.md).

## Troubleshooting

**A plugin says nothing is configured yet.** The agent should open the setup form
for you. If it does not, ask it to open the plugin's own form (`config --ui`).
Configuration lives in `~/.cache/agent-plugins/<plugin>/config.json` and never
inside your project.

**A bundled CLI fails with a module error.** `aliyunlog`, `codearts`,
`config-center`, `database`, `prompt-forge`, and `ticktick` run as Node
programs and need Node.js 22 or newer. The skills-only plugins do not.

**A plugin is missing from a running session.** Check what is installed and
enabled with `/plugin`; a plugin installed mid-session needs a restart.

**You want to know what a plugin will do before installing it.** Read it — each
directory under [`plugins/`](plugins/) contains the `SKILL.md` instructions the
agent receives and a `plugin.config.ts` with the plugin's metadata.

## Development

Each directory under [`plugins/`](plugins/) is the plugin itself, and the source
you edit is the artifact that ships.

```text
plugins/   the plugins — each directory is installable as-is
docs/      development notes and decision records
scripts/   metadata generation, bundling, validation, and development helpers
```

```bash
bash scripts/dev.sh --list        # list plugins
bash scripts/dev.sh mysql         # load one plugin straight from this checkout
npm run generate:plugins          # after changing plugin.config.ts
npm run build                     # after changing CLI source
npm run validate:plugins          # every gate
```

> [!TIP]
> `bash scripts/dev.sh <plugin>` loads the plugin from this working tree, so a
> skill or command edit takes effect after `/reload-plugins` — no build needed.

Adding a plugin: [docs/plugin-development/authoring-a-plugin.md](docs/plugin-development/authoring-a-plugin.md)
is the full checklist.

## Resources

- [Adding a plugin](docs/plugin-development/authoring-a-plugin.md)
- [Claude Code plugin development notes](docs/plugin-development/claude-code.md)
- [Decision records](docs/decisions/README.md)
- [Recommended external plugins](docs/recommended-plugins.md)
- [Repository guidelines](AGENTS.md)
- [Discover plugins in Claude Code](https://code.claude.com/docs/en/discover-plugins)
