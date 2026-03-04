---
name: mysql
description: >-
  This skill should be used when the user asks to "query the database",
  "run SQL", "run a query", "execute SQL", "check the database",
  "query MySQL", "show tables", "describe table", "select from",
  "insert into", "find records", "look up in the database",
  "database schema", "count rows", "cross-database comparison",
  "compare databases", or "analyze database".
  Provides the ability to execute SQL queries against MySQL databases via a bundled
  Node.js script with multi-connection support, including schema inspection,
  parameterized queries, and multiple output formats.
model: sonnet
allowed-tools: Bash(node:*), Read, AskUserQuestion
---

# MySQL Query Execution

Execute SQL queries via the bundled `mysql2` Node.js script with multi-connection support.

## CRITICAL: Credential Security

**NEVER read, open, cat, or view `~/.cache/apex-plugin/mysql.json` directly.** Use `--list`, `--test`, `--init` instead.

## CRITICAL: Write Operations FORBIDDEN

**NEVER execute INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, RENAME, or any data-modifying SQL without explicit user confirmation.** This rule has NO exceptions — even if the user's request implies a write operation, you MUST:

1. Show the user the exact SQL you intend to execute
2. Explicitly ask the user to confirm
3. Only after the user confirms, re-run with `--user-confirmed` flag

A PreToolUse hook enforces this — write SQL will be **blocked** unless `--user-confirmed` is present.

```bash
# BLOCKED — will be intercepted by hook
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs prod "UPDATE users SET status = 'active' WHERE id = 1"

# ALLOWED — only after user explicitly confirms
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs prod "UPDATE users SET status = 'active' WHERE id = 1" --user-confirmed
```

## MANDATORY: Connection Confirmation

**You MUST confirm the connection name with the user before querying.**

1. Run `--list` to see available connections
2. Use `AskUserQuestion` to confirm which connection the user wants
3. After the user confirms, ask: "Save this as default connection in project CLAUDE.md?"

If the user specifies a connection name explicitly, use it directly.

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs --list
```

## MANDATORY: Check Columns Before Writing SQL

**NEVER guess column names.** This is the #1 source of query failures.

Before writing ANY SELECT, always run `--columns` first to see actual column names:

```bash
# Step 1: List column names of the target table
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs --columns <connection> <table>

# Step 2: Only THEN write SELECT using actual column names
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs <conn> "SELECT col1, col2 FROM table WHERE ..."
```

### Common Mistakes to Avoid

| Wrong Guess | Why | Rule |
|-------------|-----|------|
| `total_price`, `order_amount` | Business-specific names | `--columns` first |
| `id` as primary key | Tables use `t_xxx_id` pattern | `--columns` first |
| `sub_order_code` | May be `origin_code` | `--columns` first |
| `PO-211-xxx` as `order_code` | Actually `origin_code` | `--columns` first |

## Command Reference

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs <connection> "<sql>" [options]
```

| Option | Description |
|--------|-------------|
| `--format=csv\|table\|json` | Output format (default: csv) |
| `--params='["val"]'` | Parameterized query values |
| `--limit=N` | Max rows (default: 10, 0=unlimited) |
| `--col-width=N` | Max column width (default: 80) |

Subcommands: `--init`, `--list`, `--test [name]`, `--columns <conn> <table>`, `--help`

## Token Optimization Rules

1. **NEVER `SELECT *`** — run `--columns` first, then pick minimal columns
2. **Aggregate first** — `COUNT(*)`, `GROUP BY`, `SUM()` over raw rows
3. **Keep default `--limit=10`** — only increase when explicitly needed
4. **Filter with WHERE** — narrow server-side, not by scanning results
5. **Default CSV** — most token-efficient format

## Reference Files

- [query-examples.md](references/query-examples.md) — SELECT, parameterized, cross-DB, DML examples
- [config-schema.md](references/config-schema.md) — Connection config schema, SSL, multi-environment
- [troubleshooting.md](references/troubleshooting.md) — Error resolution and security guidelines
