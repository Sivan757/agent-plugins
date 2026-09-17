# Config Center

Local configuration center for managing plugin credentials and environment state across the agent-plugins collection. Agent-facing reads are redacted; modifications require the HTML UI opened for a human. The mechanism is generic: a skill that wants a structured form or credential injection ships a plain-JSON spec file beside its SKILL.md, and this plugin renders that form and drives that mapping — no plugin-specific knowledge is built in.

## CLI Reference

| Command | Behavior |
| --- | --- |
| `init [<plugin>]` | Bootstraps `~/.cache/agent-plugins/<name>/`; with `--spec <file>`, opens the structured form the spec declares. |
| `edit [<plugin>]` | The sole modification path. Opens the HTML UI only. No CLI `set`. `--spec <file>` renders the spec's structured form instead of the generic key/value editor. |
| `form <plugin> [--spec <file>]` | Opens the spec's structured form and reports whether anything was saved. |
| `run <plugin> --spec <file> [args...]` | Runs the spec's command with the stored values injected as the spec's environment variables; the child's streams pass through and its exit code is returned. |
| `get <plugin> [key]` | Prints value(s) masked whole with their length (`••••••••••  len=10`), or `<not set>`; used by the Agent to confirm a key is set. |
| `show <plugin>` | Prints all keys redacted. Never raw. |
| `which <plugin>` | Prints only whether a config file exists and its age — never the path or contents. |

A spec file is plain JSON with `plugin` (storage directory, must match the command-line name), `form` (the form spec), and, for `run`, `command`, `env` (variable → key), `requiredKeys`, `requiredAny` and `reason`. A complete, copy-ready example lives in [`examples/toolx.spec.json`](examples/toolx.spec.json) with its field-by-field guide in [`examples/README.md`](examples/README.md); a real one in use is `plugins/zentao/skills/zentao-cli/zentao.spec.json`.

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
| `plugin-spec.ts` | `loadPluginSpec` — reads and validates a skill-shipped spec file |
| `bridge.ts` | `runWithEnv` — injects a spec's credential mapping into a child process |
| `redact.ts` | Masking, fingerprints and secret reports for agent-facing reads |
| `verification.ts` | Recorded credential checks and `assessCredentials` |
| `sql-output.ts` | Result rendering shared by the `database` CLI: the four formatters, row limiting, the summary line, `query` option parsing, and the write-statement guard |
