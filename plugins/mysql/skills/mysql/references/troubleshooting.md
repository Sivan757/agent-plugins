# Troubleshooting

## Common Errors

- **`Connection "xxx" not found`** - Run `--list` to see available connection names. **NEVER guess.**
- **`Unknown column 'xxx'`** - Run `--columns <conn> <table>` to see actual column names. **NEVER guess columns.**
- **`mysql2 package not found`** - Run `npm install --prefix ${CLAUDE_PLUGIN_ROOT}` or restart the session to trigger auto-install
- **`No config found`** - Run `--init` to create `~/.cache/agent-plugins/mysql.json`
- **`Failed to parse config`** - Check for trailing commas, missing quotes, or other JSON syntax errors
- **`Connection refused`** - Verify host, port, and that MySQL server is running
- **`Access denied`** - Check username and password in config
- **`Unknown database`** - Verify the database name exists

## npm Install Failures

- **Network issues** - Check proxy settings or try `npm install --prefix <plugin-dir> --registry https://registry.npmmirror.com`
- **Permission denied** - Ensure write access to the plugin directory's `node_modules`
- **Corrupted node_modules** - Delete `node_modules` and `package-lock.json`, then re-run `npm install --prefix <plugin-dir>`

## Security Guidelines

- **Never read config directly** — use `--list`, `--test`, `--init`
- Config is stored globally at `~/.cache/agent-plugins/mysql.json` — no gitignore needed
- **Use parameterized queries** (`--params`) for any dynamic values
- **Use read-only credentials** for production databases when only querying data
- **Prefer SSL** connections for remote databases (see `config-schema.md`)
- **Legacy config**: If upgrading, migrate `.claude/.mysql-connections.json` to the global path
