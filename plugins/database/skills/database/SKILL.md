---
name: database
description: >-
  This skill should be used when the user asks to "query the database", "run
  SQL", "run a query", "execute SQL", "check the database", "query MySQL",
  "query PostgreSQL", "show tables", "describe table", "select from", "insert
  into", "find records", "look up in the database", "database schema", "count
  rows", "cross-database comparison", "compare databases", or "analyze
  database". Provides the ability to execute SQL against MySQL and PostgreSQL
  through one CLI: every connection carries its engine, with multi-connection
  support, database/schema discovery, column listing, table location search,
  foreign-key tracing, table profiling, parameterized queries, several output
  formats, and a guard that refuses write statements until the user confirms.
---

# Database Query Execution

Run SQL against MySQL and PostgreSQL through one CLI. Each stored connection
carries the engine it speaks, so a single config reaches both — and a mixed set
of connections is normal, not a special case.

## Command Path Setup

`${CLAUDE_PLUGIN_ROOT}` points at this plugin. Fail fast when it is not set
rather than running `node /dist/database.mjs`.

```bash
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:?CLAUDE_PLUGIN_ROOT is not set}"
DB_BIN="$PLUGIN_ROOT/dist/database.mjs"
node "$DB_BIN" list
```

## Engine Differences

Pick the connection by name; the engine follows from the connection. What a
command means depends on the engine:

| | MySQL | PostgreSQL |
|---|---|---|
| Table namespace | database | schema |
| Namespace discovery | `databases` | `schemas`, `databases` |
| `columns` default namespace | the connection's database | `public` |
| Column types in output | yes, from `DESCRIBE` | yes, from `information_schema` |

These commands exist only for MySQL connections and say so on any other engine:

| Command | Purpose |
|---|---|
| `search-columns <conn> <pattern>` | Find price/amount/quantity columns across every database |
| `relationships <conn> <table>` | Foreign keys in both directions plus likely join columns |
| `profile <conn> <table>` | Row estimate and the date range each datetime column covers |

Everything else — `query`, `list`, `test`, `config`, `setup`, `init`, `columns`,
`databases`, `find-table`, `copy-connection` — works on both.

## Choosing A Database

`database` is **optional** on a connection. A connection can describe just a
server — host, port, user, password — and leave the database to each command.
That is the right shape when several connections share one server, so the name
is not re-typed per connection.

```bash
# What is on this server?
node "$DB_BIN" databases <conn>

# Run one command against a specific database, without saving anything
node "$DB_BIN" query <conn> "SELECT ..." --database analytics

# Or qualify the table and need no default at all
node "$DB_BIN" query <conn> "SELECT * FROM analytics.users LIMIT 1"
```

`--database` is available on `query`, `test`, `columns`, `databases`, `schemas`,
`find-table`, `relationships` and `profile`.

What a database-less connection can see differs by engine:

- **MySQL** — one connection reaches every database on the server, so `databases`,
  `find-table` and `search-columns` work with no default set.
- **PostgreSQL** — a connection sees only inside the database it is connected to.
  With none stored it points at `postgres`; move between databases with
  `databases` and `--database`. Cross-database queries are not possible in one
  connection.

When a command needs a namespace and neither the connection nor the argument
supplies one, the CLI says so and names both ways to fix it instead of sending an
unqualified table to the server.

## CRITICAL: Credential Security

**NEVER read, open, cat, or view `~/.cache/agent-plugins/database/config.json`
directly.** Use `config`, `list`, and `test` instead. `config` prints the stored
connections with passwords masked.

**Opening the form is your job, not the user's.** When the user wants to set up,
change, or look at the configuration, run `config --ui` yourself as a background
task — do not print the command and wait for them to type it. The form is served
by that process, so it stays alive until the user saves or the session times out;
continue with other work and read the configuration back afterwards.

The four cases where you open it yourself: first-time setup, a change to what is
stored, showing the user what is stored, and a command that cannot continue until
the connection is fixed.

## CRITICAL: Write Operations Need Explicit Confirmation

**NEVER execute INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, RENAME, or
any data-modifying SQL without explicit user confirmation.** This applies to every
engine. You MUST:

1. Show the user the exact SQL you intend to execute
2. Explicitly ask the user to confirm
3. Only after the user confirms, re-run with `--user-confirmed`

The flag is the enforcement point — the CLI refuses write SQL without it, on both
MySQL and PostgreSQL. Never add it yourself; it must come from an explicit user
confirmation.

```bash
# REFUSED — exits with an error, no statement reaches the server
node "$DB_BIN" query prod "UPDATE users SET status = 'active' WHERE id = 1"

# ALLOWED — only after the user explicitly confirms
node "$DB_BIN" --user-confirmed query prod "UPDATE users SET status = 'active' WHERE id = 1"
```

## MANDATORY: Connection Confirmation

**You MUST confirm the connection name with the user before querying.**

1. Run `list` to see available connections and their engines
2. Ask the user which connection they want
3. After the user confirms, ask: "Save this as the default connection in the project instructions file (AGENTS.md or CLAUDE.md)?"

If the user specifies a connection name explicitly, use it directly.

**Exception for read-only queries on an already-confirmed connection:** reads the
user asked for against a connection already chosen in this session — `SELECT`,
`columns`, `databases`, `schemas`, `find-table` — may proceed without
re-confirming. Confirmation applies to choosing WHICH connection, and to every
write or DDL statement.

If the requested connection is missing, the CLI lists the connections that exist
rather than guessing. To reuse the same host/user/password against another
database, use `copy-connection` instead of reading the config file:

```bash
node "$DB_BIN" list
node "$DB_BIN" config --ui
node "$DB_BIN" copy-connection <source> <target> --database <database>
```

## MANDATORY: Check Columns Before Writing SQL

**NEVER guess column names.** This is the #1 source of query failures. Run
`columns` first to see the real names and types:

```bash
# MySQL: a table in the connection's database, or the one named as an argument
node "$DB_BIN" columns <connection> <table>

# Either engine: name the namespace explicitly
node "$DB_BIN" columns <connection> <database-or-schema> <table>
# PostgreSQL example: node "$DB_BIN" columns prod public orders

# Step 2: only THEN write the SELECT, using the names you just read
node "$DB_BIN" query <conn> "SELECT col1, col2 FROM schema.table WHERE ..."
```

### Common Mistakes to Avoid

| Wrong guess | Why | Rule |
|-------------|-----|------|
| `total_price`, `order_amount` | Business-specific names | `columns` first |
| `id` as primary key | Tables may use `t_xxx_id` | `columns` first |
| `sub_order_code` | May be `origin_code` | `columns` first |
| Stale table data | The table may hold only old rows | `profile` first (MySQL) |

## MANDATORY: Discover Before Reaching Across Namespaces

A table outside the connection's default namespace is a lookup, not a guess:

```bash
# Step 1: which database/schema holds the table
node "$DB_BIN" find-table <conn> <table_name>
# MySQL output:      robot_fulfillment.fulfillment_main_data (~1234 rows)
# PostgreSQL output: public.orders (~1234 rows)

# Fuzzy search
node "$DB_BIN" find-table <conn> "%warehouse%"

# Step 2: qualify the name in the query
node "$DB_BIN" query <conn> "SELECT * FROM robot_fulfillment.fulfillment_main_data WHERE ..."

# What namespaces exist
node "$DB_BIN" databases <conn>   # both engines
node "$DB_BIN" schemas <conn>     # PostgreSQL only
```

**NEVER create additional connections for the same host.** Qualify the table
name instead, or pass `--database <name>` to reach another database on that
server for one command.

## Command Reference

```bash
node "$DB_BIN" query <connection> "<sql>" [options]
```

| Option | Description |
|--------|-------------|
| `--format csv\|table\|json\|compact` | Output format (default: csv; compact = tab-delimited, minimal) |
| `--params '<json>'` | Parameterized query values |
| `--limit <n>` | Max rows (default: 1, 0=unlimited) |
| `--col-width <n>` | Max column display width (default: 40) |
| `--database <name>` | Use another database for this one command |
| `--user-confirmed` | Global flag; required to run a write statement |

`--format`, `--params`, `--limit` and `--col-width` are `query` options only.
Do not add them to `databases`, `schemas`, `find-table`, or `columns`.

Subcommands:

| Command | Purpose |
|---------|---------|
| `config [--ui]` | Print stored connections (masked), or open the browser form |
| `setup` | Alias for `config --ui` |
| `init` | Write an empty config template |
| `list` | List connections with their engine |
| `test [name]` | Prove one connection, or all of them, can connect |
| `columns <conn> [namespace] <table>` | Column names and types |
| `databases <conn>` | Databases on the server |
| `schemas <conn>` | Schemas in the database (PostgreSQL) |
| `find-table <conn> <table\|%pat%>` | Where a table lives |
| `copy-connection <src> <dst> --database <db>` | Reuse host/user/password under a new name |
| `search-columns`, `relationships`, `profile` | MySQL-only discovery (see above) |

PostgreSQL dollar-quoted SQL like `DO $$ ... $$` must be single-quoted or escaped
in shell commands, because unescaped `$$` expands to the shell PID.

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
   node "$DB_BIN" find-table <conn> "%order%"
   ```
2. **Find tables with relevant metrics** — on MySQL, `search-columns` finds price/amount/quantity columns across every database without checking tables one by one
   ```bash
   node "$DB_BIN" search-columns <conn> "%price%"
   node "$DB_BIN" search-columns <conn> "%amount%"
   ```
3. **Check data freshness** — on MySQL, `profile` verifies the table covers the target time range before you write queries against it
   ```bash
   node "$DB_BIN" profile <conn> <table>
   ```
4. **Discover join paths** — on MySQL, `relationships` finds foreign keys and likely join columns instead of guessing
   ```bash
   node "$DB_BIN" relationships <conn> <table>
   ```
5. **Write aggregate queries** — only after steps 1–4 confirm the tables, columns and joins

This prevents the usual pitfalls: joining on the wrong keys, querying a table that
holds only stale data, and missing the table that actually has the metrics.

## Reference Files

- [query-examples.md](references/query-examples.md) — SELECT, parameterized, cross-namespace and DML examples for both engines
- [config-schema.md](references/config-schema.md) — Connection schema, the engine `type`, SSL, multi-environment
- [troubleshooting.md](references/troubleshooting.md) — Error resolution and security guidelines
