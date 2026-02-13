# Troubleshooting

## Common Errors

- **`Connection "xxx" not found`** - Run `--list` to see available connection names. **NEVER guess.**
- **`Unknown column 'xxx'`** - Run `--describe <conn> <table>` to see actual column names. **NEVER guess columns.**
- **`mysql2 package not found`** - Run `npm install --prefix ${CLAUDE_PLUGIN_ROOT}`
- **`config not found`** - Run with `--init` flag to create template
- **`Connection refused`** - Verify host, port, and that MySQL server is running
- **`Access denied`** - Check username and password in config
- **`Unknown database`** - Verify the database name exists
- **`_load_nvm: command not found`** - Harmless shell profile noise; can be ignored

## Security Guidelines

- **Never hardcode credentials** in SQL or scripts; always use `.claude/.mysql-connections.json`
- **Add `.claude/.mysql-connections.json` to `.gitignore`** to prevent credential leaks
- **Use parameterized queries** (`--params`) for any dynamic values
- **Use read-only credentials** for production databases when only querying data
- **Prefer SSL** connections for remote databases (see `config-schema.md`)
