# PostgreSQL Plugin

Enables Claude to execute SQL queries against PostgreSQL databases with multi-connection support, schema discovery, and parameterized queries.

## Setup

1. Run the setup hook to install dependencies:

```bash
bash plugins/postgresql/hooks/postgresql-setup.sh
```

2. Open the browser setup form:

```bash
node plugins/postgresql/dist/postgresql.mjs setup
```

3. Add or edit your connections in the browser form. Credentials are written to
   `~/.cache/agent-plugins/postgresql.json` without exposing them to the agent.

## Usage

```bash
# List available connections
node plugins/postgresql/dist/postgresql.mjs list

# Test connections
node plugins/postgresql/dist/postgresql.mjs test

# Query (default limit: 1 row, CSV output)
node plugins/postgresql/dist/postgresql.mjs query myconn "SELECT * FROM public.users LIMIT 5"

# Temporarily switch database without changing saved config
node plugins/postgresql/dist/postgresql.mjs query myconn "SELECT current_database()" --database=analytics

# Column listing (schema defaults to 'public')
node plugins/postgresql/dist/postgresql.mjs columns myconn public users

# Schema discovery
node plugins/postgresql/dist/postgresql.mjs find-table myconn orders
node plugins/postgresql/dist/postgresql.mjs schemas myconn
node plugins/postgresql/dist/postgresql.mjs databases myconn

# Output formats: csv (default), table, json, compact
node plugins/postgresql/dist/postgresql.mjs query myconn "SELECT id, name FROM users" --format=table

# Parameterized query
node plugins/postgresql/dist/postgresql.mjs query myconn "SELECT * FROM users WHERE id = $1" --params='[1]'

# Unlimited rows
node plugins/postgresql/dist/postgresql.mjs query myconn "SELECT * FROM users" --limit=0

# Copy an existing connection and only change the database name
node plugins/postgresql/dist/postgresql.mjs copy-connection myconn analytics --database=analytics
```

## Features

- Named multi-connection support (config stored globally)
- Schema discovery (`--find-table`, `--schemas`, `--databases`)
- Column introspection (`--columns`)
- Multiple output formats (csv, table, json, compact)
- Parameterized queries
- Temporary database override with `--database`
- Credential-safe connection copying with `copy-connection`
- Browser config UI via `setup` and when configuration must be fixed
- SSL auto-detection for non-localhost connections
- Token-efficient defaults (limit=1, CSV format)
