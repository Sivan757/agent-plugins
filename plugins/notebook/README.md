# Notebook

Cross-agent local notebook memory for Codex and Claude Code.

Notebook stores lightweight startup memory, detailed topic notes, audit findings, and transcript-backed insights in local Markdown files. It is intended for durable user preferences, verified project pitfalls, and working-memory context that should survive across sessions without being committed into project source.

## Storage

- Global notebook: `~/.cache/agent-plugins/notebook/`
- Project notebook: `<projectRoot>/.notebook/`

## Common Commands

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/notebook.mjs init --scope both
node ${CLAUDE_PLUGIN_ROOT}/dist/notebook.mjs context --query "<topic>" --scope project
node ${CLAUDE_PLUGIN_ROOT}/dist/notebook.mjs add --scope project --type mistake --title "<short title>" --content "<verified note>"
node ${CLAUDE_PLUGIN_ROOT}/dist/notebook.mjs audit --scope both
```

The plugin also ships a `SessionStart` hook that injects bootstrap context when the host client supports plugin hooks.
