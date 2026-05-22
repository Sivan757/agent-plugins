# Troubleshooting

## Common Errors

- **`Connection "xxx" not found`** - Run `list` to see available connection names, then run `setup` if the connection must be added. **NEVER guess.**
- **`relation "xxx" does not exist`** - Table may be in a different schema. Run `--find-table <conn> <table>` to locate it.
- **`pg package not found`** - Run `npm install --prefix ${CLAUDE_PLUGIN_ROOT}` or restart the session to trigger auto-install
- **`No config found`** - Run `setup` to open the browser configuration UI
- **`Failed to parse config`** - Check for trailing commas, missing quotes, or other JSON syntax errors
- **`Cannot find module '/dist/postgresql.mjs'`** - The plugin root variable was empty; resolve `${CLAUDE_PLUGIN_ROOT}`, `${CODEX_PLUGIN_ROOT}`, `${PLUGIN_ROOT}`, or the installed cache path before running commands
- **Only the database name differs** - Use `copy-connection <source> <target> --database <db>` instead of reading the config file
- **`unknown option '--format=table'` on `databases`/`schemas`** - `--format`, `--limit`, and `--params` are only valid for `query`
- **`syntax error at or near "<number>"` after using `DO $$`** - Shell expanded `$$` to the process id; single-quote or escape the dollar signs
- **`Connection refused`** - Verify host, port, and that PostgreSQL server is running
- **`FATAL: password authentication failed`** - Check username and password in config
- **`FATAL: database "xxx" does not exist`** - Verify the database name exists, or run `--databases <conn>` to list available databases

## PostgreSQL-Specific Errors

- **`column undefined`** - Column name not found. Run `--columns <conn> [schema] <table>` to see actual column names.
- **`schema "xxx" does not exist`** - Schema may not exist. Run `--schemas <conn>` to list available schemas.
- **`42P01: undefined_table`** - Table not found. Use `--find-table` to locate it across all schemas.

## npm Install Failures

- **Network issues** - Check proxy settings or try `npm install --prefix <plugin-dir> --registry https://registry.npmmirror.com`
- **Permission denied** - Ensure write access to the plugin directory's `node_modules`
- **Corrupted node_modules** - Delete `node_modules` and `package-lock.json`, then re-run `npm install --prefix <plugin-dir>`

## Security Guidelines

- **Never read config directly** — use `list`, `test`, `setup`, and `copy-connection`
- Config is stored globally at `~/.cache/agent-plugins/postgresql.json` — no gitignore needed
- **Use parameterized queries** (`--params`) for any dynamic values
- **Use read-only credentials** for production databases when only querying data
- **SSL is auto-detected** — non-localhost connections use SSL by default
