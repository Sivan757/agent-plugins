# .mysql-connections.json Configuration Schema

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
      "user": "root",
      "password": "<your-password>",
      "database": "myapp_dev"
    },
    "staging": {
      "host": "staging-db.example.com",
      "port": 3306,
      "user": "readonly",
      "password": "<your-password>",
      "database": "myapp_staging"
    },
    "production": {
      "host": "prod-db.example.com",
      "port": 3306,
      "user": "analyst",
      "password": "<your-password>",
      "database": "myapp_prod",
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
| `legacy` | Legacy system database |

## Security Notes

- Add `.claude/.mysql-connections.json` to `.gitignore` to avoid committing credentials
- Use read-only credentials for production connections when possible
- Consider using SSH tunnels for remote database access
- The config file is located at `.claude/.mysql-connections.json` relative to the project root
