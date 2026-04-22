# Query Examples

## Check Column Names First

**ALWAYS run `--columns` before writing any SELECT.** Never guess column names.

```bash
# List column names of a table
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs --columns default users
# Output: id, name, email, status, created_at (one per line)
```

## SELECT Queries

**NEVER use `SELECT *`.** Always specify only the columns relevant to the user's question.

```bash
# Specify columns explicitly (after --columns!)
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs default "SELECT id, name, email FROM users"

# JSON format for programmatic processing
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs default "SELECT id, status FROM orders ORDER BY id DESC" --format=json
```

## Parameterized Queries

Always use parameterized queries when incorporating user-provided values:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs default "SELECT id, name FROM users WHERE id = ?" --params='[42]'
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs default "SELECT id, total FROM orders WHERE status = ? AND created_at > ?" --params='["pending","2024-01-01"]'
```

## Cross-Database Queries

For tables in a different database, prefix with the database name:

```bash
# Query a table in another database on the same connection
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs prod "SELECT t_account_id, amount FROM robot_finance.trading_account_record WHERE order_code = ?" --params='["SO-xxx"]' --limit=5
```

## Schema Inspection

```bash
# List all tables
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs default "SHOW TABLES"

# Show CREATE TABLE statement
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs default "SHOW CREATE TABLE users" --format=json
```

## Data Modification (DML)

INSERT, UPDATE, DELETE statements return affected row counts:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs default "INSERT INTO logs (message, level) VALUES (?, ?)" --params='["test entry","info"]'
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs default "UPDATE users SET status = ? WHERE id = ?" --params='["active",5]'
```

## Cross-Database Analysis

A key feature of multi-connection support. To compare data across databases:

```bash
# Query staging
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs staging "SELECT COUNT(*) as count FROM users" --format=json

# Query production
node ${CLAUDE_PLUGIN_ROOT}/scripts/mysql.mjs production "SELECT COUNT(*) as count FROM users" --format=json
```

When performing cross-database comparison:
1. Run the same query against each connection
2. Compare results programmatically or present side-by-side

## Output Formats

| Format | Flag | Best For |
|--------|------|----------|
| csv | `--format=csv` (default) | Token-efficient, AI-friendly |
| table | `--format=table` | Human-readable display |
| json | `--format=json` | Programmatic processing, complex data |
