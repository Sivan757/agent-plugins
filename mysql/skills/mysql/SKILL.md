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
allowed-tools: Bash(node:*), Read
---

# MySQL Query Execution

Execute SQL queries via the bundled `mysql2` Node.js script with multi-connection support.

## CRITICAL: Credential Security

**NEVER read, open, cat, or view `.claude/.mysql-connections.json` directly.** Use `--list`, `--test`, `--init` instead.

## CRITICAL: Write Operations FORBIDDEN

**NEVER execute INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, RENAME, or any data-modifying SQL without explicit user confirmation.** This rule has NO exceptions — even if the user's request implies a write operation, you MUST:

1. Show the user the exact SQL you intend to execute
2. Explicitly ask the user to confirm
3. Only after the user confirms, re-run with `--user-confirmed` flag

A PreToolUse hook enforces this — write SQL will be **blocked** unless `--user-confirmed` is present.

```bash
# ❌ BLOCKED — will be intercepted by hook
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js prod "UPDATE users SET status = 'active' WHERE id = 1"

# ✅ ALLOWED — only after user explicitly confirms
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js prod "UPDATE users SET status = 'active' WHERE id = 1" --user-confirmed
```

## MANDATORY: First-Time Setup

**Before ANY query, run `--list` first.** NEVER guess connection names.

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js --list
```

## MANDATORY: Schema-First Workflow

**NEVER guess column names.** This is the #1 source of query failures.

```bash
# Step 1: Check cached schema (no DB round-trip)
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js --cached-schema <connection> <table>

# Step 2: If not cached, DESCRIBE and auto-cache
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js --describe <connection> <table>

# Step 3: Only THEN write SELECT using actual column names
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js <conn> "SELECT col1, col2 FROM table WHERE ..."

# List all cached schemas
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js --schemas [connection]
```

### Common Mistakes to Avoid

| Wrong Guess | Why | Rule |
|-------------|-----|------|
| `total_price`, `order_amount` | Business-specific names | DESCRIBE first |
| `id` as primary key | Tables use `t_xxx_id` pattern | DESCRIBE first |
| `sub_order_code` | May be `origin_code` | DESCRIBE first |
| `PO-211-xxx` as `order_code` | Actually `origin_code` | DESCRIBE first |

## Command Reference

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js <connection> "<sql>" [options]
```

| Option | Description |
|--------|-------------|
| `--format=csv\|table\|json` | Output format (default: csv) |
| `--params='["val"]'` | Parameterized query values |
| `--limit=N` | Max rows (default: 10, 0=unlimited) |
| `--col-width=N` | Max column width (default: 80) |

Subcommands: `--init`, `--list`, `--test [name]`, `--describe <conn> <table>`, `--schemas [conn]`, `--cached-schema <conn> <table>`

## Token Optimization Rules

1. **NEVER `SELECT *`** — pick minimal columns after DESCRIBE
2. **Aggregate first** — `COUNT(*)`, `GROUP BY`, `SUM()` over raw rows
3. **Keep default `--limit=10`** — only increase when explicitly needed
4. **Filter with WHERE** — narrow server-side, not by scanning results
5. **Default CSV** — most token-efficient format

## Reference Files

- [query-examples.md](references/query-examples.md) — SELECT, parameterized, cross-DB, DML examples
- [config-schema.md](references/config-schema.md) — Connection config schema, SSL, multi-environment
- [troubleshooting.md](references/troubleshooting.md) — Error resolution and security guidelines
