---
name: MySQL Query
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
---

# MySQL Query Execution

Execute SQL queries against MySQL databases using a bundled Node.js helper script with the `mysql2` package. Supports multiple named database connections for cross-database analysis and comparison.

## CRITICAL: Credential Security

**NEVER read, open, cat, or view `mysql-connections.json` directly.** This file contains database passwords. All interaction with connection configuration MUST go through the bundled script:

- To see available connections: `--list` (shows names and databases only, no credentials)
- To verify connections work: `--test` (attempts real connections, reports OK/FAILED)
- To create the config file: `--init` (generates a template for the user to edit)

If the user needs to modify connection details, instruct them to edit `mysql-connections.json` manually. Never read its contents into the conversation.

## Prerequisites

- **Node.js** installed and available in PATH
- **mysql2** npm package installed in the plugin directory. Run once: `npm install --prefix ${CLAUDE_PLUGIN_ROOT}`. This installs mysql2 inside the plugin's own `node_modules/` and never touches the user's project.
- **mysql-connections.json** in the project root (current working directory) with connection configurations. The config file must exist in the directory where Claude Code is running.

## Quick Start

### 1. Initialize Configuration

If no `mysql-connections.json` exists in the project root, create one:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js --init
```

This creates a template file. Edit it to add actual database credentials. Refer to `references/config-schema.md` for the full schema and multi-environment examples.

### 2. Execute Queries

Use the bundled script via Bash tool:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js <connection-name> "<sql>" [options]
```

Options:
- `--format=table|json|csv` - Output format (default: table)
- `--params='["val1"]'` - Parameterized query values
- `--limit=N` - Max rows to return (default: 10, use 0 for unlimited)
- `--col-width=N` - Max column character width (default: 80, truncates with `...`)

## Core Operations

### Listing Connections

To see available connection names (no credentials exposed):

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js --list
```

### Testing Connections

To verify connections are reachable without exposing credentials:

```bash
# Test all connections
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js --test

# Test a specific connection
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js --test production
```

Output shows only name, database, and OK/FAILED status.

### SELECT Queries

**NEVER use `SELECT *`.** Always specify only the columns relevant to the user's question. First inspect the schema with `DESCRIBE`, then select the minimal set of columns needed.

```bash
# Specify columns explicitly
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js default "SELECT id, name, email FROM users"

# JSON format for programmatic processing
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js default "SELECT id, status FROM orders ORDER BY id DESC" --format=json

# CSV format for export
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js default "SELECT COUNT(*) as total FROM orders" --format=csv
```

### Parameterized Queries

Always use parameterized queries when incorporating user-provided values to prevent SQL injection:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js default "SELECT id, name, email FROM users WHERE id = ?" --params='[42]'
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js default "SELECT id, total FROM orders WHERE status = ? AND created_at > ?" --params='["pending","2024-01-01"]'
```

### Schema Inspection

```bash
# List all tables
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js default "SHOW TABLES"

# Describe table structure
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js default "DESCRIBE users"

# Show CREATE TABLE statement
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js default "SHOW CREATE TABLE users" --format=json

# List all columns with details
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js default "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'"
```

### Data Modification (DML)

INSERT, UPDATE, DELETE statements return affected row counts:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js default "INSERT INTO logs (message, level) VALUES (?, ?)" --params='["test entry","info"]'
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js default "UPDATE users SET status = ? WHERE id = ?" --params='["active",5]'
```

## Cross-Database Analysis

A key feature of this setup is multi-connection support. To compare data across databases:

```bash
# Query staging
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js staging "SELECT COUNT(*) as count FROM users" --format=json

# Query production
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js production "SELECT COUNT(*) as count FROM users" --format=json
```

When performing cross-database comparison:
1. Run the same query against each connection
2. Use `--format=json` for consistent output parsing
3. Compare results programmatically or present side-by-side

## Output Formats

| Format | Flag | Best For |
|--------|------|----------|
| table | `--format=table` (default) | Human-readable display |
| json | `--format=json` | Programmatic processing, complex data |
| csv | `--format=csv` | Data export, spreadsheet compatibility |

## Token Optimization

Result sets consume context tokens. Follow this mandatory workflow:

### Required: Schema-First Approach

Before querying any table, ALWAYS inspect its schema first to identify the relevant columns:

```bash
# Step 1: Get table list
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js default "SHOW TABLES"

# Step 2: Inspect the target table schema
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js default "DESCRIBE orders"

# Step 3: Select ONLY the columns relevant to the user's question
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js default "SELECT id, status, total FROM orders WHERE status = 'pending'"
```

### Rules

1. **NEVER use `SELECT *`** - Always pick the minimal set of columns after inspecting the schema
2. **Aggregate first** - Prefer `COUNT(*)`, `GROUP BY`, `SUM()` over fetching raw rows
3. **Keep default row limit** - The script caps at 10 rows. Only increase with `--limit=N` when the user explicitly needs more
4. **Filter with WHERE** - Narrow results server-side, not by scanning returned rows
5. **Use `--col-width`** - For tables with text columns, reduce with `--col-width=40`
6. **Prefer CSV for large results** - CSV is more compact than table or JSON format

## Error Handling

Common errors and resolutions:

- **`mysql2 package not found`** - Run `npm install --prefix ${CLAUDE_PLUGIN_ROOT}` to install in the plugin directory
- **`mysql-connections.json not found`** - Run with `--init` flag to create template
- **`Connection refused`** - Verify host, port, and that MySQL server is running
- **`Access denied`** - Check username and password in config
- **`Unknown database`** - Verify the database name exists

## Security Guidelines

- **Never hardcode credentials** in SQL or scripts; always use `mysql-connections.json`
- **Add `mysql-connections.json` to `.gitignore`** to prevent credential leaks
- **Use parameterized queries** (`--params`) for any dynamic values
- **Use read-only credentials** for production databases when only querying data
- **Prefer SSL** connections for remote databases (see `references/config-schema.md`)

## Additional Resources

### Reference Files

- **`references/config-schema.md`** - Full configuration schema, multi-environment examples, SSL setup, and security notes
