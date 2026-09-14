# Config Center

Local configuration center for managing plugin credentials and environment state across the agent-plugins collection. Agent-facing reads are redacted; modifications require the HTML UI opened for a human.

## CLI Reference

| Command | Behavior |
| --- | --- |
| `init [<plugin>]` | Bootstraps `~/.cache/agent-plugins/<name>/`; if a schema is registered, opens the HTML UI for human entry. |
| `edit [<plugin>]` | The sole modification path. Opens the HTML UI only. No CLI `set`. |
| `get <plugin> [key]` | Prints value(s) masked whole with their length (`••••••••••  len=10`), or `<not set>`; used by the Agent to confirm a key is set. |
| `show <plugin>` | Prints all keys redacted. Never raw. |
| `which <plugin>` | Prints only whether a config file exists and its age — never the path or contents. |

## Iron Rules

- No subcommand prints the cache path or plaintext. `get`/`show` always mask.
- Modification only via the HTML UI (`init`/`edit`). There is no CLI `set`.
- SKILL.md never writes the cache path literal; the Agent never `cat`/`Read`s cache files; no subcommand prints the storage path or plaintext.

## Shared Runtime

This plugin is also where the runtime code the other plugins import lives. They depend on it as the workspace package `@agent-plugins/config-center`, and every export of `src/index.ts` is part of that surface.

| Module | What it provides |
| --- | --- |
| `config-store.ts` | Cache paths, private-directory creation, config load/save, deep merge |
| `launch-ui.ts` | The browser form: spec vocabulary, state conversion, the server, `requireConfigWithSetup` |
| `config-flow.ts` | `openConfigUI` / `reconfigure` — the shape a plugin's `config` command calls |
| `redact.ts` | Masking, fingerprints and secret reports for agent-facing reads |
| `verification.ts` | Recorded credential checks and `assessCredentials` |
| `sql-output.ts` | Result rendering shared by the `database` CLI: the four formatters, row limiting, the summary line, `query` option parsing, and the write-statement guard |
