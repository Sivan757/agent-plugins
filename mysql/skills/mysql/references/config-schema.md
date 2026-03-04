# mysql.json Configuration Schema

## Config Location

Config is stored globally at `~/.cache/apex-plugin/mysql.json`.
Legacy config at `.claude/.mysql-connections.json` (project-local) is still supported as a fallback but deprecated.

## Full Schema

```json
{
  "connections": {
    "<connection-name>": {
      "host": "string (required) - MySQL server hostname or IP",
      "port": "number (optional, default: 3306) - MySQL server port",
      "user": "string (required) - Database username",
      "password": "string (required) - Database password",
      "database": "string (required) - Default database name",
      "ssl": "object (optional) - SSL/TLS configuration"
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
      "port": 3306,
      "user": "<username>",
      "password": "<password>",
      "database": "<database>"
    },
    "staging": {
      "host": "<staging-host>",
      "port": 3306,
      "user": "<username>",
      "password": "<password>",
      "database": "<database>"
    },
    "production": {
      "host": "<prod-host>",
      "port": 3306,
      "user": "<username>",
      "password": "<password>",
      "database": "<database>",
      "ssl": {
        "rejectUnauthorized": true
      }
    }
  }
}
```

## SSL Configuration Options

For SSL/TLS connections, the `ssl` object supports:

```json
{
  "ssl": {
    "rejectUnauthorized": true,
    "ca": "/path/to/ca-cert.pem",
    "cert": "/path/to/client-cert.pem",
    "key": "/path/to/client-key.pem"
  }
}
```

- **rejectUnauthorized**: Set `true` for production (validates server certificate)
- **ca**: Path to CA certificate file
- **cert**: Path to client certificate (for mutual TLS)
- **key**: Path to client key (for mutual TLS)

## Connection Naming Conventions

Use descriptive names that indicate environment and purpose:

| Name | Use Case |
|------|----------|
| `local` | Local development database |
| `dev` | Shared development server |
| `staging` | Staging environment |
| `production` | Production (use read-only credentials) |
| `analytics` | Analytics/reporting database |

## Security Notes

- Config is stored globally at `~/.cache/apex-plugin/mysql.json` — outside project directories
- Use read-only credentials for production connections when possible
- Consider using SSH tunnels for remote database access
- **Never read config directly** — use `--list` to view connections, `--test` to verify
