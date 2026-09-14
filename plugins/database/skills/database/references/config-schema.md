# Connection Config Schema

Stored at `~/.cache/agent-plugins/database/config.json`. Never read it directly —
use `config` (masked), `list`, and `test`.

## Shape

One file holds every connection. Each carries the engine it speaks in `type`, and
`database` is optional — a connection may describe only a server:

```json
{
  "connections": {
    "orders": {
      "type": "mysql",
      "host": "127.0.0.1",
      "port": 3306,
      "user": "root",
      "password": "",
      "ssl": false
    },
    "reporting": {
      "type": "postgresql",
      "host": "db.internal",
      "user": "analyst",
      "password": "",
      "database": "reporting"
    }
  }
}
```

`orders` above stores no database. Commands against it reach any database on that
server, either by qualifying the table (`analytics.users`) or by naming one for a
single command (`--database analytics`). Use that shape when several connections
share one server — there is no reason to repeat the database name.

## Fields

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `mysql` or `postgresql`. A connection with any other value is refused by name, and the known engines are listed |
| `host` | yes | Hostname or IP |
| `port` | no | Omit it to use the engine default — 3306 for MySQL, 5432 for PostgreSQL |
| `user` | yes | Database user |
| `password` | yes | May be empty, but must be present |
| `database` | no | The connection's default. Omit it to describe only a server and choose the database per command |
| `ssl` | no | `true`, `false`, or a TLS options object |

## What The Engines Differ On

- **MySQL** — `database` is the namespace tables live in, and one connection
  reaches every database on the server. `databases`, `find-table` and
  `search-columns` work with no default set. `--database <name>` points a single
  command at another database; it does not change the stored config.
- **PostgreSQL** — `database` is the database you connect to; tables live in
  *schemas* inside it. A connection sees only inside its own database, and
  cross-database queries are not possible in one connection. With no database
  stored it connects to `postgres`; use `databases` to see what exists, then
  `--database <name>` to move between them.

`--database` is accepted by `query`, `test`, `columns`, `databases`, `schemas`,
`find-table`, `relationships` and `profile` on both engines.

## SSL

- **MySQL** — off unless `ssl` is set on the connection.
- **PostgreSQL** — `ssl` when set is honoured; when it is absent, any host other
  than `localhost`, `127.0.0.1` or `::1` gets `{ rejectUnauthorized: false }`.

## Editing

Open the browser form; it is the only supported way to change credentials.

```bash
node "$DB_BIN" config --ui   # or: node "$DB_BIN" setup
```

Use `copy-connection` when only the database differs — it reuses host, user and
password under a new name without printing any of them.

```bash
node "$DB_BIN" copy-connection orders orders_archive --database orders_archive
```

## Connections From The Former Plugins

`mysql` and `postgresql` used to be separate plugins with separate config files.
The first time this plugin finds no config of its own, it reads those two files,
tags every connection with the engine it came from, and writes them here. It
reports what it moved; a name present in both files keeps its MySQL connection
under the original name and the other gains a `-<engine>` suffix.

The old files are left in place and are never read again once this plugin has its
own config.
