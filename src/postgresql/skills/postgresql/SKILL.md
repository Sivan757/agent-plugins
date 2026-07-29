---
name: postgresql
description: >-
  This skill should be used when the user asks to "query the database", "run
  SQL", "run a query", "execute SQL", "check the database", "query
  PostgreSQL", "show tables", "describe table", "select from", "insert into",
  "find records", "look up in the database", "database schema", "count rows",
  or "analyze database". Provides the ability to execute SQL queries against
  PostgreSQL databases via a Node.js script with multi-connection support,
  including schema inspection, parameterized queries, and multiple output
  formats.
---

# PostgreSQL Query Execution

Execute SQL queries via `pg` Node.js script with multi-connection support.

## CRITICAL: Credential Security

**NEVER read, open, cat, or view `~/.cache/agent-plugins/postgresql/config.json` directly.** Use `list`, `test`, `setup`, and `copy-connection` subcommands instead.

## Command Path Setup

Use the installed plugin root, not a literal empty variable. In Claude Code,
`${CLAUDE_PLUGIN_ROOT}` should point at this plugin. In Codex, first prefer
`${CODEX_PLUGIN_ROOT}` or `${PLUGIN_ROOT}` when available. If no root variable
is set, locate the installed plugin cache or repo-local release artifact before
running commands; do not run `node ${CLAUDE_PLUGIN_ROOT}/dist/postgresql.mjs`
when that expands to `/dist/postgresql.mjs`.

```bash
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-${PLUGIN_ROOT:-}}}"
test -n "$PLUGIN_ROOT"
PG_BIN="$PLUGIN_ROOT/dist/postgresql.mjs"
node "$PG_BIN" list
```

## CRITICAL: Write Operations

**NEVER execute INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, or any data-modifying SQL without explicit user confirmation.** You MUST:

1. Show the user the exact SQL you intend to execute
2. Explicitly ask the user to confirm
3. Only after the user confirms, proceed with execution

The PostgreSQL CLI has no `--user-confirm`, `--user-confirmed`, or equivalent
confirmation flag. After confirmation, run the command directly.

## MANDATORY: Connection Confirmation

**You MUST confirm the connection name with the user before querying.**

1. Run `list` to see available connections
2. Use `ask the user` to confirm which connection the user wants
3. After the user confirms, ask: "Save this as the default connection in the project instructions file (AGENTS.md or CLAUDE.md)?"

**Exception for read-only queries on an already-confirmed connection:** Read-only queries that the user explicitly requested against an already-confirmed connection (e.g., `SELECT 1`, schema inspection via `columns`, `schemas`, `databases`, `find-table`) may proceed without re-confirming each time. The mandatory confirmation applies to choosing WHICH connection and to any write/DDL operation (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `CREATE`).

If the requested connection is missing, run `setup` to open the browser config
UI. To reuse the same host/user/password with a different database, use
`copy-connection` instead of reading the config file:

```bash
node "$PG_BIN" list
node "$PG_BIN" setup
node "$PG_BIN" copy-connection <source> <target> --database <database>
```

## MANDATORY: Check Columns Before Writing SQL

**NEVER guess column names.** Always run `columns` first to see actual column names and types:

```bash
# Step 1: List columns (schema defaults to 'public' if omitted)
node "$PG_BIN" columns <connection> <schema> <table>
# Example: node "$PG_BIN" columns prod public orders

# Step 2: Only THEN write SELECT using actual column names
node "$PG_BIN" query <conn> "SELECT col1, col2 FROM schema.table WHERE ..."
```

## MANDATORY: Schema Discovery Before Cross-Schema Queries

PostgreSQL uses **schemas** (not databases) to organize tables. If a table doesn't exist, **do NOT guess** — use discovery:

```bash
# Step 1: Find which schema a table belongs to
node "$PG_BIN" find-table <conn> <table_name>
# Example output: public.orders (~1234 rows)

# Step 2: Use schema.table syntax in your query
node "$PG_BIN" query <conn> "SELECT * FROM public.orders WHERE ..."

# Fuzzy search with % pattern
node "$PG_BIN" find-table <conn> "%warehouse%"

# List all schemas in the database
node "$PG_BIN" schemas <conn>

# List all non-system databases
node "$PG_BIN" databases <conn>
```

**NEVER create additional connections for the same host.** Use `schema.table` syntax instead.

## Command Reference

```bash
node "$PG_BIN" query <connection> "<sql>" [options]
```

| Option | Description |
|--------|-------------|
| `--format csv\|table\|json\|compact` | Output format (default: csv; compact = tab-delimited) |
| `--params '<json>'` | Parameterized query values |
| `--limit <n>` | Max rows (default: 1, 0=unlimited) |
| `--col-width <n>` | Max column width (default: 40) |
| `--database <name>` | Temporarily connect to another database without saving config |

Subcommands: `setup`, `init`, `list`, `test [name]`, `copy-connection <source> <target> --database <db>`, `columns <conn> [schema] <table>`, `databases <conn>`, `schemas <conn>`, `find-table <conn> <table|%pat%>`, `--help`

`--format`, `--params`, `--limit`, and `--col-width` are `query` options only.
Do not add them to `databases`, `schemas`, `find-table`, or `columns`.

PostgreSQL dollar-quoted SQL like `DO $$ ... $$` must be single-quoted or
escaped in shell commands, because unescaped `$$` expands to the shell PID.

## Token Optimization Rules

1. **Preview first** — default limit is 1 row; check the data shape before requesting more with `--limit=N`
2. **NEVER `SELECT *`** — run `columns` first, then pick minimal columns
3. **Aggregate first** — `COUNT(*)`, `GROUP BY`, `SUM()` over raw rows
4. **Filter with WHERE** — narrow server-side, not by scanning results
5. **Default CSV** — most token-efficient format; use `--format=compact` for less overhead

## Reference Files

- [config-schema.md](references/config-schema.md) — Connection config schema, SSL, multi-environment
- [troubleshooting.md](references/troubleshooting.md) — Error resolution and security guidelines
