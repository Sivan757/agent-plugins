# Configuration Reference

## Config File Location

The plugin looks for `.claude/.aliyun.json` in the current directory or any parent directory. This single file contains both SLS credentials and environment/logstore mappings.

## Schema

```json
{
  "credentials": {
    "accessKeyId": "<your-access-key-id>",
    "accessKeySecret": "<your-access-key-secret>",
    "endpoint": "cn-hangzhou.log.aliyuncs.com"
  },
  "default_project": "robot-k8s-dev",
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
  "default_project": "robot-k8s-dev",
  "environments": {
    "dev": { "project": "robot-k8s-dev", "logstore_pattern": "dev1-{service}" },
    "prod": { "project": "robot-k8s-prod", "logstore_pattern": "{service}" }
  },
  "aliases": {
    "prod/base": { "logstore": "robot-base" }
  }
}
```

Resolution results:
| Input | Project | Logstore |
|-------|---------|----------|
| `dev saas` | robot-k8s-dev | dev1-saas |
| `dev imes` | robot-k8s-dev | dev1-imes |
| `prod saas` | robot-k8s-prod | saas |
| `prod base` | robot-k8s-prod | robot-base (alias override) |
| `sit saas` | robot-k8s-dev | sit-saas (fallback) |
