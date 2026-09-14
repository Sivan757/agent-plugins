---
name: config-center
description: >-
  Manage plugin credentials and environment configuration. Use when the user
  needs to set up, check, or edit credentials for any agent plugin (TickTick,
  Database, Aliyun SLS, CodeArts, prompt-forge, etc.), or when
  a plugin reports missing/unconfigured credentials. Provides redacted
  credential checks (the Agent never sees plaintext) and a browser-based config
  UI for human-only editing. Opening that UI is the Agent's job: when the user
  wants to set up, change, or inspect configuration, run `<plugin> config --ui`
  or `config-center edit <plugin>` as a background task.
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
- **Modifications are human-only, but opening the form is your job.** There is
  no CLI command to write credentials and nothing should flow through you. Run
  `edit` (here) or `<plugin> config --ui` **yourself, as a background task** —
  do not hand the command to the user and wait for them to type it. The browser
  opens on their machine, they enter the values, and you read the configuration
  again afterwards.
- If a plugin command fails with a missing-credential error, do NOT try to read
  the config file. Run `config-center get <plugin> <key>` to confirm the key is
  unset, then open the form yourself (see "When to open the form").

## When to open the form

Opening the form is the same operation in four situations that look different to
a user. In all four, open it yourself instead of printing text and telling the
user to run something:

| The user… | Do this |
| --- | --- |
| wants to configure a plugin for the first time | open the form; the CLI also opens it on its own when a command finds nothing configured |
| wants to change something already configured | open the form pre-filled with what is stored |
| wants to see what is configured | open the form, and/or print the masked summary (`<plugin> config`) |
| has to change something before you can continue | the CLI opens the form by itself when configuration is missing or incomplete; when a command names a missing item (a connection, a project), it opens the form and reloads after a save |

How to open it:

```bash
# Any plugin: pre-filled form, secrets masked in the printed summary
node "$PLUGIN_ROOT/dist/<plugin>.mjs" config --ui
# The generic equivalent, for a plugin whose own CLI you do not have at hand
node "$CC_BIN" edit <plugin>
```

Run it as a **background task**: the form is served by that process, so it stays
alive until the user saves or the session times out (5 minutes by default). Do
not block on it in the foreground — continue, and read the configuration back
afterwards. `AGENT_PLUGINS_NO_BROWSER=1` serves the form without launching a
browser and `AGENT_PLUGINS_UI_TIMEOUT_MS` shortens the session, both for headless
hosts and tests.

## Command Path Setup

`${CLAUDE_PLUGIN_ROOT}` points at this plugin. Fail fast when it is not set
rather than running the command with an empty root.

```bash
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:?CLAUDE_PLUGIN_ROOT is not set}"
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

The **only** way to modify credentials. Opens the same HTML UI pre-filled with
what is stored. There is no `set` command and no `--plaintext` flag. Run it
yourself as a background task when the user needs something changed; plugin
CLIs expose the same thing as `<plugin> config --ui`.

## Workflow: a plugin reports missing credentials

1. Run `get <plugin> <key>` to confirm the key is `<not set>` (not a typo or a
   wrong key name).
2. If unset, open the form yourself as a background task:
   `node "$CC_BIN" edit <plugin>` (or `<plugin> config --ui`). Say which value is
   missing and why the command needs it, so the user knows what to fill in.
3. When the form closes, re-run `get <plugin> <key>` to confirm it is now set
   (redacted), then retry the original plugin command. If nothing was saved,
   report that and stop rather than retrying the same command.

## What you must NEVER do

- Read, `cat`, or `Read` any file under `~/.cache/agent-plugins/`.
- Print or echo the cache directory path.
- Attempt to obtain plaintext credentials from the CLI (it will not give them to
  you).
- Write credentials yourself - there is no command for it. Open `edit` (or
  `<plugin> config --ui`) and let the user type them into the form.
- Ask the user to paste a credential into the conversation. Open the form
  instead; a secret that passes through a chat is a secret that has to be
  rotated.
