# Troubleshooting

## Common Errors

- **`Connection "xxx" not found`** — the CLI prints the connections that exist right below the error. Use one of those; never guess a name.
- **`Connection "xxx" has type missing; expected one of: mysql, postgresql`** — the stored entry has no usable `type`. Fix it through `config --ui`.
- **`schemas` / `search-columns` / `relationships` / `profile` is not available for …** — that command is engine-specific. The error names the engines that support it.
- **`Cannot tell which database "orders" is in`** — the connection stores no default database and the table was not qualified. Name it as `database.table`, pass the database as an argument, or set a default through `config --ui`.
- **`Unknown column 'xxx'`** — run `columns <conn> <table>` for the real names. Never guess columns.
- **`relation "xxx" does not exist`** (PostgreSQL) — the table may be in another schema, or the connection is pointed at the wrong database. Run `find-table <conn> <table>`, or `databases <conn>` then `--database <name>`.
- **`FATAL: database "xxx" does not exist`** (PostgreSQL) — set or change the connection's default through `config --ui`, or target another database with `--database <name>`.
- **`Table 'xxx' doesn't exist`** (MySQL) — same answer: `find-table` locates it across databases.
- **`Cannot find module '/dist/database.mjs'`** — `${CLAUDE_PLUGIN_ROOT}` was empty. Check it is set before running the command.
- **`Refusing write statement without --user-confirmed`** — expected. Show the SQL, get explicit confirmation, then re-run with `--user-confirmed`.
- **`unknown option '--format=table'` on `databases`/`schemas`** — `--format`, `--params`, `--limit` and `--col-width` are `query` options only.
- **`syntax error at or near "<number>"` after `DO $$`** — the shell expanded `$$` to the process id. Single-quote or escape the dollar signs.
- **`Connection refused`** — verify host, port, and that the server is running.
- **`Access denied` / `password authentication failed`** — check the username and password through `config --ui`.
- **`Unknown database` / `database "xxx" does not exist`** — run `databases <conn>` to list what exists.
- **`Failed to parse config`** — malformed JSON in the config file. Reopen it through `config --ui`.
- **Only the database name differs between two connections** — use `copy-connection <src> <dst> --database <db>` instead of reading the config file.

## Security Guidelines

- **Never read the config file directly** — use `config` (masked), `list`, `test`, and `copy-connection`.
- Config is stored at `~/.cache/agent-plugins/database/config.json`; it is created 0600 inside a 0700 directory, so it needs no entry in a project `.gitignore`.
- **Use parameterized queries** (`--params`) for any dynamic value.
- **Use read-only credentials** for production databases when the work is only reading.
- **Prefer SSL** for remote databases; PostgreSQL enables it automatically for non-local hosts.
- **Write statements** require an explicit user confirmation plus `--user-confirmed`; the CLI is the enforcement point, not just the skill text.
