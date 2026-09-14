# Database

Query MySQL and PostgreSQL through one CLI. Every connection carries the engine
it speaks, so a single config reaches both and a mixed set of connections is
normal. The database is optional on a connection: describe a server once and
choose the database per command instead of repeating it.

## Setup

Open the browser configuration form and add a connection per server:

```bash
node plugins/database/dist/database.mjs setup
```

The form takes an engine type, host, port, user, password, database and SSL flag
per connection. Credentials are written to
`~/.cache/agent-plugins/database/config.json` without passing through the agent.
Reads of stored configuration are masked.

## Usage

```bash
DB="node plugins/database/dist/database.mjs"

# List connections and which engine each one uses
$DB list

# Test every connection (or just one)
$DB test
$DB test orders

# Query — the engine comes from the connection
$DB query orders "SELECT id, status FROM orders LIMIT 5"
$DB query reporting "SELECT id, status FROM public.orders LIMIT 5" --format=table

# Columns, with types and nullability
$DB columns orders users
$DB columns reporting public users

# Discovery
$DB find-table orders "%order%"
$DB databases orders
$DB schemas reporting

# A connection may describe only a server; --database picks the database
$DB databases reporting
$DB query reporting "SELECT current_database()" --database analytics
$DB query orders "SELECT id FROM analytics.users LIMIT 5"

# Reuse host/user/password under a new name, changing only the database
$DB copy-connection orders orders_archive --database orders_archive

# Writes are refused until the user confirms; the flag is the enforcement point
$DB --user-confirmed query orders "UPDATE users SET status = 'active' WHERE id = 1"
```

MySQL-only discovery, for multi-table analysis:

```bash
$DB search-columns orders "%price%"
$DB relationships orders orders
$DB profile orders orders
```

## Features

- One config, many engines: `type` per connection, mixed freely
- Optional database per connection — describe a server, choose the database per command
- Named multi-connection support
- Query output as csv (default), table, json or compact
- Parameterized statements
- Column listing with types and nullability on both engines
- Table location search across databases (MySQL) or schemas (PostgreSQL)
- Database and schema discovery
- Foreign-key and join hunting, plus table profiling, on MySQL
- Credential-safe connection copying
- Browser config form, with masked agent-facing reads
- A guard that refuses write statements until the user explicitly confirms
- Token-efficient defaults (limit 1 row, CSV)

## Layout

```
plugins/database/
├── plugin.config.ts
├── src/
│   ├── database.ts        CLI shell: config, lookup, sessions, rendering, gating
│   ├── config-ui.ts       the browser form (plain data)
│   ├── legacy-config.ts   one-time adoption of the former mysql/postgresql configs
│   └── drivers/
│       ├── types.ts       the engine seam
│       ├── mysql.ts       mysql2 driver
│       ├── postgresql.ts  pg driver
│       └── index.ts       registry: type → driver
├── skills/database/       SKILL.md and references
└── dist/database.mjs      the shipped CLI
```

Adding an engine means one driver file plus a registry entry; the shell, the
write guard, result rendering and the config form are already engine-independent.

## Migrating From The Former Plugins

`mysql` and `postgresql` used to be separate plugins. The first time this plugin
has no config of its own, it reads those two files, tags each connection with its
engine, and reports what it moved. A name present in both keeps its MySQL
connection under the original name; the other gains a `-<engine>` suffix. The old
files are left untouched and are not read again.
