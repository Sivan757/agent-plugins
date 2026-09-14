# Query Examples

Every example uses the shell shape from `SKILL.md`:

```bash
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:?CLAUDE_PLUGIN_ROOT is not set}"
DB_BIN="$PLUGIN_ROOT/dist/database.mjs"
```

The engine comes from the connection, so the command line is the same for MySQL
and PostgreSQL except where noted.

## Check Column Names First

**ALWAYS run `columns` before writing any SELECT.** Never guess column names.

```bash
# MySQL: table in the connection's default database
node "$DB_BIN" columns default users

# Either engine: name the namespace explicitly
node "$DB_BIN" columns prod public users
# Output, one per line: id (integer, nullable), email (text), created_at (timestamp, nullable)
```

## SELECT Queries

**NEVER use `SELECT *`.** Select only the columns the question needs.

```bash
# After columns, so the names are real
node "$DB_BIN" query default "SELECT id, name, email FROM users"

# JSON when the result feeds further processing
node "$DB_BIN" query default "SELECT id, status FROM orders ORDER BY id DESC" --format=json
```

## Parameterized Queries

Always parameterize values that came from the user. PostgreSQL numbers its
placeholders; MySQL uses `?`.

```bash
# MySQL
node "$DB_BIN" query default "SELECT id, name FROM users WHERE id = ?" --params='[42]'
node "$DB_BIN" query default "SELECT id, total FROM orders WHERE status = ? AND created_at > ?" --params='["pending","2024-01-01"]'

# PostgreSQL
node "$DB_BIN" query prod "SELECT id, name FROM users WHERE id = \$1" --params='[42]'
```

## Cross-Namespace Queries

A table in another database (MySQL) or schema (PostgreSQL) is qualified, not a
reason to add a connection.

```bash
# Locate it first
node "$DB_BIN" find-table prod "%payment%"

# MySQL: database.table
node "$DB_BIN" query prod "SELECT account_id, amount FROM billing.payment_record WHERE order_code = ?" --params='["SO-xxx"]' --limit=5

# PostgreSQL: schema.table
node "$DB_BIN" query prod "SELECT account_id, amount FROM billing.payment_record WHERE order_code = \$1" --params='["SO-xxx"]' --limit=5
```

## A Connection With No Default Database

A connection may describe only a server. Then every command picks its own
database, which is what you want when several connections share one host.

```bash
# What is over there?
node "$DB_BIN" databases server

# One command against a specific one
node "$DB_BIN" query server "SELECT COUNT(*) FROM analytics.users" --database analytics

# No default needed at all, if the statement qualifies its tables
node "$DB_BIN" query server "SELECT id, name FROM analytics.users LIMIT 5"

# Columns from a named database
node "$DB_BIN" columns server analytics users
```

On PostgreSQL the connection must land somewhere; with none stored it points at
`postgres`, and `--database` moves it. On MySQL the connection already sees every
database on the server.

## Structure Inspection

```bash
# MySQL
node "$DB_BIN" query default "SHOW TABLES"
node "$DB_BIN" query default "SHOW CREATE TABLE users" --format=json

# PostgreSQL
node "$DB_BIN" query prod "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
node "$DB_BIN" schemas prod
```

## Data Modification (DML)

INSERT, UPDATE and DELETE return an affected-row summary. They are refused unless
the user has confirmed and the command carries `--user-confirmed`.

```bash
node "$DB_BIN" --user-confirmed query default "INSERT INTO logs (message, level) VALUES (?, ?)" --params='["test entry","info"]'
node "$DB_BIN" --user-confirmed query default "UPDATE users SET status = ? WHERE id = ?" --params='["active",5]'
```

## Comparing Two Environments

One connection per environment, then run the same query against each:

```bash
node "$DB_BIN" query staging "SELECT COUNT(*) AS count FROM users" --format=json
node "$DB_BIN" query production "SELECT COUNT(*) AS count FROM users" --format=json
```

Compare the two results and present them side by side. Both connections may point
at the same engine or at different ones — the CLI does not care.

## Output Formats

| Format | Flag | Best for |
|--------|------|----------|
| csv | `--format=csv` (default) | Token-efficient, agent-friendly |
| table | `--format=table` | Human-readable display |
| json | `--format=json` | Programmatic processing, complex data |
| compact | `--format=compact` | Tab-delimited, least overhead |
