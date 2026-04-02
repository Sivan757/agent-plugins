---
name: __PLUGIN__
description: >-
  __DESCRIPTION__
model: sonnet
allowed-tools: Bash(node:*), Read, AskUserQuestion
---

# __PLUGIN_TITLE__

## Usage

All commands follow the pattern:

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/__PLUGIN__.mjs <command> [options]
```

## Commands

- `--help` — Show usage
- `--test` — Test configuration
- `--list` — List available items

## Setup

If CONFIG_MISSING error appears, configure credentials:
```bash
node ${CLAUDE_PLUGIN_ROOT}/../../scripts/dist/config-ui.mjs --config ~/.cache/apex-plugin/__PLUGIN__.json --schema '{"title":"__PLUGIN_TITLE__","fields":[{"key":"apiKey","label":"API Key","type":"password","required":true}]}'
```
