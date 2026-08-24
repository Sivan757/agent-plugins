---
name: mysql
description: >-
  This skill should be used when the user asks to "query the database", "run
  SQL", "run a query", "execute SQL", "check the database", "query MySQL",
  "show tables", "describe table", "select from", "insert into", "find
  records", "look up in the database", "database schema", "count rows",
  "cross-database comparison", "compare databases", or "analyze database".
  Provides the ability to execute SQL queries against MySQL databases via a
  Node.js script with multi-connection support, including schema inspection,
  parameterized queries, and multiple output formats.
---

# MySQL Query Execution

Execute SQL queries via `mysql2` Node.js script with multi-connection support.

## CRITICAL: Credential Security

**NEVER read, open, cat, or view `~/.cache/agent-plugins/mysql/config.json` directly.** Use `list`, `test`, `init` subcommands instead.

When config is missing or incomplete, the CLI automatically opens a browser
setup form and prints the local URL to stderr — tell the user to fill it in.
Once saved in the browser, the same command resumes on its own (no re-run
needed). If the user skips the form, the CLI exits with
`No config found. Run: mysql init` — run `init` to reopen the form.

## CRITICAL: Write Operations FORBIDDEN

**NEVER execute INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, RENAME, or any data-modifying SQL without explicit user confirmation.** This rule has NO exceptions — even if the user's request implies a write operation, you MUST:

1. Show the user the exact SQL you intend to execute
2. Explicitly ask the user to confirm
3. Only after the user confirms, re-run with `--user-confirmed` flag

A PreToolUse hook enforces this — write SQL will be **blocked** unless `--user-confirmed` is present.

```bash
# BLOCKED — will be intercepted by hook
node ${CLAUDE_PLUGIN_ROOT}/dist/mysql.mjs prod "UPDATE users SET status = 'active' WHERE id = 1"

# ALLOWED — only after user explicitly confirms
node ${CLAUDE_PLUGIN_ROOT}/dist/mysql.mjs prod "UPDATE users SET status = 'active' WHERE id = 1" --user-confirmed
```

## MANDATORY: Connection Confirmation

**You MUST confirm the connection name with the user before querying.**

1. Run `list` to see available connections
2. Use `ask the user` to confirm which connection the user wants
3. After the user confirms, ask: "Save this as the default connection in the project instructions file (AGENTS.md or CLAUDE.md)?"

If the user specifies a connection name explicitly, use it directly.

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/mysql.mjs list
```

## MANDATORY: Check Columns Before Writing SQL

**NEVER guess column names.** This is the #1 source of query failures.

Before writing ANY SELECT, always run `columns` first to see actual column names:

```bash
# Step 1: List column names of the target table
node ${CLAUDE_PLUGIN_ROOT}/dist/mysql.mjs columns <connection> <table>

# Supports database.table syntax for cross-database tables
node ${CLAUDE_PLUGIN_ROOT}/dist/mysql.mjs columns <connection> <database.table>

# Step 2: Only THEN write SELECT using actual column names
node ${CLAUDE_PLUGIN_ROOT}/dist/mysql.mjs <conn> "SELECT col1, col2 FROM table WHERE ..."
```

### Common Mistakes to Avoid

| Wrong Guess | Why | Rule |
|-------------|-----|------|
| `total_price`, `order_amount` | Business-specific names | `columns` first |
| `id` as primary key | Tables use `t_xxx_id` pattern | `columns` first |
| `sub_order_code` | May be `origin_code` | `columns` first |
| `PO-211-xxx` as `order_code` | Actually `origin_code` | `columns` first |
| Stale table data | Table may have old data only | `profile` first |

## MANDATORY: Database Discovery Before Cross-DB Queries

Each connection has a default database. If a table doesn't exist in the default database, **do NOT guess** — use discovery:

```bash
# Step 1: Find which database a table belongs to
node ${CLAUDE_PLUGIN_ROOT}/dist/mysql.mjs find-table <conn> <table_name>
# Example output: robot_fulfillment.fulfillment_main_data (~1234 rows)

# Step 2: Use database.table syntax in your query
node ${CLAUDE_PLUGIN_ROOT}/dist/mysql.mjs <conn> "SELECT * FROM robot_fulfillment.fulfillment_main_data WHERE ..."

# Fuzzy search with % pattern
node ${CLAUDE_PLUGIN_ROOT}/dist/mysql.mjs find-table <conn> "%warehouse%"

# List all databases on a connection
node ${CLAUDE_PLUGIN_ROOT}/dist/mysql.mjs databases <conn>
```

**NEVER create additional connections for the same host.** Use `database.table` syntax instead.

## Command Reference

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/mysql.mjs query <connection> "<sql>" [options]
```

| Option | Description |
|--------|-------------|
| `--format csv\|table\|json\|compact` | Output format (default: csv; compact = tab-delimited, minimal) |
| `--params '<json>'` | Parameterized query values |
| `--limit <n>` | Max rows (default: 1, 0=unlimited) |
| `--col-width <n>` | Max column width (default: 40) |

Subcommands: `init`, `list`, `test [name]`, `columns <conn> <table>`, `databases <conn>`, `find-table <conn> <table|%pat%>`, `search-columns <conn> <pattern>`, `profile <conn> <table>`, `relationships <conn> <table>`, `--help`

## Token Optimization Rules

1. **Preview first** — default limit is 1 row; check the data shape before requesting more with `--limit=N`
2. **NEVER `SELECT *`** — run `columns` first, then pick minimal columns
3. **Aggregate first** — `COUNT(*)`, `GROUP BY`, `SUM()` over raw rows
4. **Filter with WHERE** — narrow server-side, not by scanning results
5. **Default CSV** — most token-efficient format; use `--format=compact` for even less overhead

## Analytical Query Workflow

For multi-table analysis tasks (e.g., "total revenue last month", "order breakdown by category"):

1. **Locate candidate tables** — `find-table` with pattern matching
   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/dist/mysql.mjs find-table <conn> "%order%"
   ```

2. **Find tables with relevant metrics** — `search-columns` to find price/amount/quantity columns across all databases without checking tables one by one
   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/dist/mysql.mjs search-columns <conn> "%price%"
   node ${CLAUDE_PLUGIN_ROOT}/dist/mysql.mjs search-columns <conn> "%amount%"
   ```

3. **Check data freshness** — `profile` to verify tables have data in the target time range before writing queries against them
   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/dist/mysql.mjs profile <conn> <table>
   ```

4. **Discover join paths** — `relationships` to find foreign keys and potential join columns instead of guessing
   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/dist/mysql.mjs relationships <conn> <table>
   ```

5. **Write aggregate queries** — only after steps 1-4 confirm the right tables, columns, and joins

This workflow prevents common pitfalls: joining on wrong keys, querying tables with stale data, and missing the table that actually has the metrics you need.

## Reference Files

- [query-examples.md](references/query-examples.md) — SELECT, parameterized, cross-DB, DML examples
- [config-schema.md](references/config-schema.md) — Connection config schema, SSL, multi-environment
- [troubleshooting.md](references/troubleshooting.md) — Error resolution and security guidelines
