# postgresql.json Configuration Schema

## Config Location

Config is stored globally at `~/.cache/apex-plugin/postgresql.json`.

## Full Schema

```json
{
  "connections": {
    "<connection-name>": {
      "host": "string (required) - PostgreSQL server hostname or IP",
      "port": "number (optional, default: 5432) - PostgreSQL server port",
      "user": "string (required) - Database username",
      "password": "string (required) - Database password",
      "database": "string (required) - Default database name",
      "ssl": "boolean|object (optional) - SSL/TLS configuration"
    }
  }
}
```

## Example: Multi-Environment Setup

```json
{
  "connections": {
    "local": {
      "host": "127.0.0.1",
      "port": 5432,
      "user": "postgres",
      "password": "",
      "database": "mydb"
    },
    "staging": {
      "host": "<staging-host>",
      "port": 5432,
      "user": "<username>",
      "password": "<password>",
      "database": "<database>"
    },
    "production": {
      "host": "<prod-host>",
      "port": 5432,
      "user": "<username>",
      "password": "<password>",
      "database": "<database>",
      "ssl": true
    }
  }
}
```

## SSL Configuration

SSL is **auto-detected**: if the host is not `localhost`, `127.0.0.1`, or `::1`, SSL is automatically enabled with `rejectUnauthorized: false`.

Override explicitly:

```json
{
  "ssl": false
}
```

Or with full options:

```json
{
  "ssl": {
    "rejectUnauthorized": false
  }
}
```

## Connection Naming Conventions

| Name | Use Case |
|------|----------|
| `local` | Local development database |
| `dev` | Shared development server |
| `staging` | Staging environment |
| `production` | Production (use read-only credentials) |

## Security Notes

- Config is stored globally at `~/.cache/apex-plugin/postgresql.json` — outside project directories
- Use read-only credentials for production connections when possible
- Consider using SSH tunnels for remote database access
- **Never read config directly** — use `--list` to view connections, `--test` to verify
