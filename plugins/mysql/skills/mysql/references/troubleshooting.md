# Troubleshooting

## Common Errors

- **`Connection "xxx" not found`** - Run `--list` to see available connection names. **NEVER guess.**
- **`Unknown column 'xxx'`** - Run `--columns <conn> <table>` to see actual column names. **NEVER guess columns.**
- **`Cannot find module '/dist/mysql.mjs'`** - `${CLAUDE_PLUGIN_ROOT}` was empty. Check that it is set before running the command
- **`No config found`** - Run `--init` to create `~/.cache/agent-plugins/mysql.json`
- **`Failed to parse config`** - Check for trailing commas, missing quotes, or other JSON syntax errors
- **`Connection refused`** - Verify host, port, and that MySQL server is running
- **`Access denied`** - Check username and password in config
- **`Unknown database`** - Verify the database name exists

## Security Guidelines

- **Never read config directly** — use `--list`, `--test`, `--init`
- Config is stored globally at `~/.cache/agent-plugins/mysql.json` — no gitignore needed
- **Use parameterized queries** (`--params`) for any dynamic values
- **Use read-only credentials** for production databases when only querying data
- **Prefer SSL** connections for remote databases (see `config-schema.md`)
- **Legacy config**: If upgrading, migrate `.claude/.mysql-connections.json` to the global path
