---
name: postgresql
description: >-
  This skill should be used when the user asks to "query the database",
  "run SQL", "run a query", "execute SQL", "check the database",
  "query PostgreSQL", "show tables", "describe table", "select from",
  "insert into", "find records", "look up in the database",
  "database schema", "count rows", or "analyze database".
  Provides the ability to execute SQL queries against PostgreSQL databases via a
  Node.js script with multi-connection support, including schema inspection,
  parameterized queries, and multiple output formats.
allowed-tools: Bash(node:*), Read, AskUserQuestion
---

# PostgreSQL Query Execution

Execute SQL queries via `pg` Node.js script with multi-connection support.

## CRITICAL: Credential Security

**NEVER read, open, cat, or view `~/.cache/apex-plugin/postgresql.json` directly.** Use `list`, `test`, `init` subcommands instead.

## CRITICAL: Write Operations

**NEVER execute INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, or any data-modifying SQL without explicit user confirmation.** You MUST:

1. Show the user the exact SQL you intend to execute
2. Explicitly ask the user to confirm
3. Only after the user confirms, proceed with execution

## MANDATORY: Connection Confirmation

**You MUST confirm the connection name with the user before querying.**

1. Run `list` to see available connections
2. Use `AskUserQuestion` to confirm which connection the user wants
3. After the user confirms, ask: "Save this as default connection in project CLAUDE.md?"

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/postgresql.mjs list
```

## MANDATORY: Check Columns Before Writing SQL

**NEVER guess column names.** Always run `columns` first to see actual column names and types:

```bash
# Step 1: List columns (schema defaults to 'public' if omitted)
node ${CLAUDE_PLUGIN_ROOT}/dist/postgresql.mjs columns <connection> <schema> <table>
# Example: node ${CLAUDE_PLUGIN_ROOT}/dist/postgresql.mjs columns prod public orders

# Step 2: Only THEN write SELECT using actual column names
node ${CLAUDE_PLUGIN_ROOT}/dist/postgresql.mjs <conn> "SELECT col1, col2 FROM schema.table WHERE ..."
```

## MANDATORY: Schema Discovery Before Cross-Schema Queries

PostgreSQL uses **schemas** (not databases) to organize tables. If a table doesn't exist, **do NOT guess** — use discovery:

```bash
# Step 1: Find which schema a table belongs to
node ${CLAUDE_PLUGIN_ROOT}/dist/postgresql.mjs find-table <conn> <table_name>
# Example output: public.orders (~1234 rows)

# Step 2: Use schema.table syntax in your query
node ${CLAUDE_PLUGIN_ROOT}/dist/postgresql.mjs <conn> "SELECT * FROM public.orders WHERE ..."

# Fuzzy search with % pattern
node ${CLAUDE_PLUGIN_ROOT}/dist/postgresql.mjs find-table <conn> "%warehouse%"

# List all schemas in the database
node ${CLAUDE_PLUGIN_ROOT}/dist/postgresql.mjs schemas <conn>

# List all non-system databases
node ${CLAUDE_PLUGIN_ROOT}/dist/postgresql.mjs databases <conn>
```

**NEVER create additional connections for the same host.** Use `schema.table` syntax instead.

## Command Reference

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/postgresql.mjs query <connection> "<sql>" [options]
```

| Option | Description |
|--------|-------------|
| `--format csv\|table\|json\|compact` | Output format (default: csv; compact = tab-delimited) |
| `--params '<json>'` | Parameterized query values |
| `--limit <n>` | Max rows (default: 1, 0=unlimited) |
| `--col-width <n>` | Max column width (default: 40) |

Subcommands: `init`, `list`, `test [name]`, `columns <conn> [schema] <table>`, `databases <conn>`, `schemas <conn>`, `find-table <conn> <table|%pat%>`, `--help`

## Token Optimization Rules

1. **Preview first** — default limit is 1 row; check the data shape before requesting more with `--limit=N`
2. **NEVER `SELECT *`** — run `--columns` first, then pick minimal columns
3. **Aggregate first** — `COUNT(*)`, `GROUP BY`, `SUM()` over raw rows
4. **Filter with WHERE** — narrow server-side, not by scanning results
5. **Default CSV** — most token-efficient format; use `--format=compact` for less overhead

## Reference Files

- [config-schema.md](references/config-schema.md) — Connection config schema, SSL, multi-environment
- [troubleshooting.md](references/troubleshooting.md) — Error resolution and security guidelines
