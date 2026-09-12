# Configuration Reference

## Config File Location

The plugin stores config at `~/.cache/agent-plugins/aliyunlog.json` (global). This single file contains both SLS credentials and environment/logstore mappings.

Legacy config at `.claude/.aliyun.json` (project-local) is still supported as a fallback but deprecated.

## Schema

```json
{
  "credentials": {
    "accessKeyId": "<your-access-key-id>",
    "accessKeySecret": "<your-access-key-secret>",
    "endpoint": "cn-hangzhou.log.aliyuncs.com"
  },
  "default_project": "example-dev",
  "environments": {
    "<env>": {
      "project": "<sls_project_name>",
      "logstore_pattern": "<pattern_with_{service}_placeholder>"
    }
  },
  "aliases": {
    "<env>/<service>": {
      "project": "<optional_project_override>",
      "logstore": "<exact_logstore_name>"
    }
  }
}
```

## Fields

### `credentials`

SLS access credentials. **NEVER expose or read this file directly.**

| Field | Required | Description |
|-------|----------|-------------|
| `accessKeyId` | Yes | Alibaba Cloud access key ID |
| `accessKeySecret` | Yes | Alibaba Cloud access key secret |
| `endpoint` | Yes | SLS endpoint (e.g., `cn-hangzhou.log.aliyuncs.com`) |

### `default_project`

The SLS project used when no environment-specific project is configured.

### `environments`

Maps environment shortnames to SLS project and logstore naming patterns.

| Field | Required | Description |
|-------|----------|-------------|
| `project` | No | SLS project name (falls back to `default_project`) |
| `logstore_pattern` | Yes | Pattern with `{service}` placeholder for logstore name |

### `aliases`

Explicit `env/service` -> logstore overrides. Takes precedence over pattern-based resolution.

| Field | Required | Description |
|-------|----------|-------------|
| `project` | No | Override project (uses environment or default if omitted) |
| `logstore` | Yes | Exact logstore name |

## Resolution Order

1. Check `aliases` for exact `env/service` match
2. Check `environments` for env config, apply `logstore_pattern`
3. Fall back to `default_project` with `{env}-{service}` as logstore

## Example

Given config:
```json
{
  "credentials": {
    "accessKeyId": "LTAI...",
    "accessKeySecret": "...",
    "endpoint": "cn-hangzhou.log.aliyuncs.com"
  },
  "default_project": "example-dev",
  "environments": {
    "dev": { "project": "example-dev", "logstore_pattern": "dev1-{service}" },
    "prod": { "project": "example-prod", "logstore_pattern": "{service}" }
  },
  "aliases": {
    "prod/base": { "logstore": "platform-base" }
  }
}
```

Resolution results:
| Input | Project | Logstore |
|-------|---------|----------|
| `dev order-api` | example-dev | dev1-order-api |
| `dev user-api` | example-dev | dev1-user-api |
| `prod order-api` | example-prod | order-api |
| `prod base` | example-prod | platform-base (alias override) |
| `sit order-api` | example-dev | sit-order-api (fallback) |
