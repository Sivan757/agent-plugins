---
name: notebook
description: This skill should be used when the user asks to remember, record, recall, audit, clean, search, or manage local notebook memory; when starting work that may depend on user preferences or project-specific working memory; when a repeated mistake, verified project pitfall, or durable collaboration preference should be captured; or when running notebook insights over Codex or Claude Code transcripts.
---

# Notebook

Notebook is a cross-agent local memory system backed by Markdown files. It keeps short startup memory in `bootstrap.md`, detailed memories in topic files, and retrospective evidence pointers in `sources.md`.

## Storage

Global notebook:

```bash
~/.cache/agent-plugins/notebook/
```

Project notebook:

```bash
<projectRoot>/.notebook/
```

Project root is the Git root when available, otherwise the current working directory. Use `--project-root <path>` when the root must be explicit.

## Required Startup Behavior

The plugin installs a `SessionStart` hook for `startup|resume`. The hook resolves the plugin root from `CLAUDE_PLUGIN_ROOT`, `CODEX_PLUGIN_ROOT`, `PLUGIN_ROOT`, a repo-local `plugins/notebook` checkout, or installed plugin cache paths, then runs:

```bash
node <notebook-plugin-root>/dist/notebook.mjs context --bootstrap-only --format hook
```

Codex requires hooks to be enabled:

```toml
[features]
codex_hooks = true
```

If notebook context is expected but absent in Codex, tell the user to enable `codex_hooks`. Claude Code loads the hook through the plugin hook system.

## CLI Resolution

In command examples, `${CLAUDE_PLUGIN_ROOT}` means the installed notebook plugin root. If that variable is unavailable, use `$CODEX_PLUGIN_ROOT`, `$PLUGIN_ROOT`, or the repo-local path `plugins/notebook` when working in this repository. Do not guess a path; search installed plugin cache paths only when needed.

## When To Read

Read notebook memory when:

- The user asks to recall, remember, search, audit, or clean notebook memory.
- A task depends on user profile, collaboration style, safety boundaries, or project working memory.
- You are debugging, changing architecture, making commits, touching deployment, or handling repeated failures in a repository.
- The user references prior conversations, repeated mistakes, or "we already learned this".

Use:

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/notebook.mjs context --query "<specific terms>" --scope project
node ${CLAUDE_PLUGIN_ROOT}/dist/notebook.mjs search --query "<specific terms>" --scope both
```

Prefer narrow terms such as file names, error text, feature names, or concrete concepts. Do not read all topic files by default.

## When To Write

Write notebook memory when:

- The user explicitly says to remember, record, save, or add something to the notebook.
- The user corrects how the agent should behave in future sessions.
- The user confirms a non-obvious approach should be repeated.
- A debugging, testing, deployment, or integration issue has a clear root cause and verification command.
- A project rule or pitfall is likely to prevent future mistakes and is not already obvious from code, Git history, or project docs.

Use:

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/notebook.mjs add --scope global --type style --title "<short title>" --content "<Why/Where/What/Not-worthy content>" --confidence high --sensitivity internal
node ${CLAUDE_PLUGIN_ROOT}/dist/notebook.mjs add --scope project --type mistake --title "<short title>" --content "<verified pitfall>" --confidence high --sensitivity redacted
```

Low-risk, durable information can be written silently. Uncertain information should go to `pending.md` only when supported by a future command. High-risk or sensitive conclusions require user confirmation before writing.

## What Not To Save

Do not save:

- Raw API keys, tokens, passwords, private keys, cookies, or verification codes.
- Unredacted customer, order, personal, or financial data.
- Current task scratch state, transient plans, or activity logs.
- Code structure, file paths, or implementation facts that are cheap to derive from the current repository.
- Git history or recent changes that `git log` can answer.
- Failure logs without a verified root cause.
- Anything already documented in `AGENTS.md` or `CLAUDE.md`.

Sensitive operational knowledge may be saved only after redaction, using `sensitivity: redacted`, and must keep enough structure to guide future judgment without storing raw secrets.

## Memory Shape

Topic files must include:

- Frontmatter with `title`, `type`, `scope`, `confidence`, `sensitivity`, `created_at`, `last_verified`, `validity`, and `description`.
- Body sections: `Why`, `Where`, `What`, `Not`.
- For `mistake` topics: also include `Problem`, `Root Cause`, `Fix`, and `Verification`.

`index.md` is an index, not a memory body. Keep each entry short and link to a topic file.

`bootstrap.md` is only for high-confidence, stable, short rules that affect startup behavior. Do not promote ordinary notes to bootstrap.

## Governance Commands

Audit quality:

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/notebook.mjs audit --scope both
```

Preview and delete:

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/notebook.mjs delete --scope project --query "<term>"
node ${CLAUDE_PLUGIN_ROOT}/dist/notebook.mjs delete --scope project --query "<term>" --yes
```

Promote to bootstrap:

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/notebook.mjs promote --scope project --query "<term>"
node ${CLAUDE_PLUGIN_ROOT}/dist/notebook.mjs promote --scope project --query "<term>" --yes
```

Generate cleanup suggestions:

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/notebook.mjs compact --scope both
```

## Insights

Use insights only when the user asks for notebook review, memory cleanup, behavior improvement, or transcript-backed reflection. Insights is explicit and does not run in startup hooks.

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/notebook.mjs insights --scope project --since 30d
node ${CLAUDE_PLUGIN_ROOT}/dist/notebook.mjs resummarize --scope project --query "<specific term>"
```

`sources.md` stores pointers to transcript/source files. It does not store raw transcript copies. Transcript analysis must be narrow and explicit.

## Trust And Freshness

Notebook entries are point-in-time observations. If a memory names a current file, command, endpoint, deployment setting, or safety conclusion, verify current state before acting on it. If current evidence contradicts memory, trust current evidence and update or delete the stale notebook entry.
