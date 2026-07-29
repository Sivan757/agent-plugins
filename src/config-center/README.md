# Config Center

Local configuration center for managing plugin credentials and environment state across the agent-plugins collection. Agent-facing reads are redacted; modifications require the HTML UI opened for a human.

## CLI Reference

| Command | Behavior |
| --- | --- |
| `init [<plugin>]` | Bootstraps `~/.cache/agent-plugins/<name>/`; if a schema is registered, opens the HTML UI for human entry. |
| `edit [<plugin>]` | The sole modification path. Opens the HTML UI only. No CLI `set`. |
| `get <plugin> [key]` | Prints redacted value(s) (`te•••••key` or `<not set>`). Default redact; used by the Agent to confirm a key is set. |
| `show <plugin>` | Prints all keys redacted. Never raw. |
| `which <plugin>` | Prints only whether a config file exists and its age — never the path or contents. |

## Iron Rules

- No subcommand prints the cache path or plaintext. `get`/`show` always mask.
- Modification only via the HTML UI (`init`/`edit`). There is no CLI `set`.
- SKILL.md never writes the cache path literal; the Agent never `cat`/`Read`s cache files; no subcommand prints the storage path or plaintext.
