# PostgreSQL Plugin

Enables Claude to execute SQL queries against PostgreSQL databases with multi-connection support, schema discovery, and parameterized queries.

## Setup

1. Run the setup hook to install dependencies:

```bash
bash postgresql/hooks/postgresql-setup.sh
```

2. Initialize the config file:

```bash
node postgresql/scripts/postgresql.mjs --init
```

3. Edit `~/.cache/apex-plugin/postgresql.json` to add your connections.

## Usage

```bash
# List available connections
node postgresql/scripts/postgresql.mjs --list

# Test connections
node postgresql/scripts/postgresql.mjs --test

# Query (default limit: 1 row, CSV output)
node postgresql/scripts/postgresql.mjs myconn "SELECT * FROM public.users LIMIT 5"

# Column listing (schema defaults to 'public')
node postgresql/scripts/postgresql.mjs --columns myconn public users

# Schema discovery
node postgresql/scripts/postgresql.mjs --find-table myconn orders
node postgresql/scripts/postgresql.mjs --schemas myconn
node postgresql/scripts/postgresql.mjs --databases myconn

# Output formats: csv (default), table, json, compact
node postgresql/scripts/postgresql.mjs myconn "SELECT id, name FROM users" --format=table

# Parameterized query
node postgresql/scripts/postgresql.mjs myconn "SELECT * FROM users WHERE id = $1" --params='[1]'

# Unlimited rows
node postgresql/scripts/postgresql.mjs myconn "SELECT * FROM users" --limit=0
```

## Features

- Named multi-connection support (config stored globally)
- Schema discovery (`--find-table`, `--schemas`, `--databases`)
- Column introspection (`--columns`)
- Multiple output formats (csv, table, json, compact)
- Parameterized queries
- SSL auto-detection for non-localhost connections
- Token-efficient defaults (limit=1, CSV format)
