# Query Examples

## SELECT Queries

**NEVER use `SELECT *`.** Always specify only the columns relevant to the user's question.

```bash
# Specify columns explicitly (after DESCRIBE!)
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js default "SELECT id, name, email FROM users"

# JSON format for programmatic processing
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js default "SELECT id, status FROM orders ORDER BY id DESC" --format=json
```

## Parameterized Queries

Always use parameterized queries when incorporating user-provided values:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js default "SELECT id, name FROM users WHERE id = ?" --params='[42]'
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js default "SELECT id, total FROM orders WHERE status = ? AND created_at > ?" --params='["pending","2024-01-01"]'
```

## Cross-Database Queries

For tables in a different database, prefix with the database name:

```bash
# Query a table in another database on the same connection
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js prod "SELECT t_account_id, amount FROM robot_finance.trading_account_record WHERE order_code = ?" --params='["SO-xxx"]' --limit=5
```

## Schema Inspection

```bash
# List all tables
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js default "SHOW TABLES"

# Describe table structure (auto-cached)
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js --describe default users

# Show CREATE TABLE statement
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js default "SHOW CREATE TABLE users" --format=json

# List all columns with details
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js default "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'"
```

## Data Modification (DML)

INSERT, UPDATE, DELETE statements return affected row counts:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js default "INSERT INTO logs (message, level) VALUES (?, ?)" --params='["test entry","info"]'
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js default "UPDATE users SET status = ? WHERE id = ?" --params='["active",5]'
```

## Cross-Database Analysis

A key feature of multi-connection support. To compare data across databases:

```bash
# Query staging
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js staging "SELECT COUNT(*) as count FROM users" --format=json

# Query production
node ${CLAUDE_PLUGIN_ROOT}/scripts/sql.js production "SELECT COUNT(*) as count FROM users" --format=json
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
