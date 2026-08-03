---
name: config-center
description: >-
  Manage plugin credentials and environment configuration. Use when the user
  needs to set up, check, or edit credentials for any agent plugin (TickTick,
  PostgreSQL, MySQL, Aliyun SLS, Temu, withoutbg, prompt-forge, etc.), or when
  a plugin reports missing/unconfigured credentials. Provides redacted
  credential checks (the Agent never sees plaintext) and a browser-based config
  UI for human-only editing.
---

# Config Center

Local configuration center for managing plugin credentials and environment
state. Every plugin in this collection stores its credentials under
`~/.cache/agent-plugins/<plugin>/`. Config Center is the single sanctioned way
to check and edit that store.

## CRITICAL: Credential Security (iron rule)

**NEVER read, open, `cat`, or `Read` any file under `~/.cache/agent-plugins/`.**
**NEVER print or echo the cache path.** You do not need the path, and you must
not seek it. Config Center is the only sanctioned interface.

- **Reads are always redacted.** `get` and `show` mask every value (middle of
  each value replaced with `•`). You will only ever see whether a key is set,
  never its plaintext. Do not attempt to recover plaintext - it is intentionally
  withheld from you.
- **Modifications are human-only.** There is no CLI command to write
  credentials. To add or change credentials, run `init` or `edit`, which opens
  a browser UI for the user. The user enters values directly in the browser;
  nothing flows through you.
- If a plugin command fails with a missing-credential error, do NOT try to read
  the config file. Run `config-center get <plugin> <key>` to confirm the key is
  unset, then tell the user to run `config-center edit <plugin>`.

## Command Path Setup

Use the installed plugin root. In Claude Code, `${CLAUDE_PLUGIN_ROOT}` points
at this plugin. In Codex, prefer `${CODEX_PLUGIN_ROOT}` or `${PLUGIN_ROOT}`. If
no root variable is set, locate the installed plugin cache or repo-local
release artifact before running; do not run the command when the root expands
to empty.

```bash
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-${PLUGIN_ROOT:-}}}"
test -n "$PLUGIN_ROOT"
CC_BIN="$PLUGIN_ROOT/dist/config-center.mjs"
node "$CC_BIN" get <plugin> <key>
```

## Commands

### `get <plugin> [key]` - confirm a credential is set (redacted)

Prints the redacted value of `<key>`, or `<key>=<not set>` if absent. With no
`<key>`, prints all top-level keys redacted. **Silent, always redacted.** Use
this to check whether a plugin is configured before running its commands.

```bash
# Is the TickTick token configured? (key names are plugin-specific; run
# `get <plugin>` with no key to list every key redacted, then check a
# specific one. TickTick uses camelCase keys like accessToken.)
node "$CC_BIN" get ticktick
# host=di••••••com
# username=zi••••••com
# accessToken=23••••••d1d   (set)
# ...
node "$CC_BIN" get ticktick accessToken
# -> accessToken=23••••••d1d   (set)
# -> accessToken=<not set>      (not set)

# What keys does temu-api have?
node "$CC_BIN" get temu-api
# TEMU_APPKEY=te••••••key
# TEMU_APPSECRET=te••••••ret
# TEMU_ACCESS_TOKEN=<not set>
```

### `show <plugin>` - list all keys redacted

Same as `get <plugin>` with no key. Prints every top-level key redacted, or
`# no config` if the plugin has no config file yet.

### `init [<plugin>]` - first-time setup (opens browser UI)

Bootstraps the plugin's config directory and opens the HTML config UI in the
user's browser. The user fills in credentials and saves. The CLI prints
`Open the config UI at: http://localhost:<port>` to **stderr** (stdout stays
empty so you can detect completion programmatically) and waits until the user
saves or the session times out.

### `edit [<plugin>]` - edit existing config (opens browser UI)

The **only** way to modify credentials. Opens the same HTML UI. There is no
`set` command and no `--plaintext` flag; if you need a credential changed,
direct the user to run `edit`.

## Workflow: a plugin reports missing credentials

1. Run `get <plugin> <key>` to confirm the key is `<not set>` (not a typo or a
   wrong key name).
2. If unset, tell the user: "Run `config-center edit <plugin>` to set your
   credentials in the browser UI." Do not attempt to set it yourself.
3. After the user confirms they saved, re-run `get <plugin> <key>` to confirm it
   is now set (redacted), then retry the original plugin command.

## What you must NEVER do

- Read, `cat`, or `Read` any file under `~/.cache/agent-plugins/`.
- Print or echo the cache directory path.
- Attempt to obtain plaintext credentials from the CLI (it will not give them to
  you).
- Write credentials yourself - there is no command for it. Always route the user
  to `edit`.
