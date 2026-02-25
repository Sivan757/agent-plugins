# Configuration Reference

## Config File Location

The plugin reads config from `.claude/.feishu.json`, searching in order:
1. Git repository root
2. Current working directory (when not in a git repo)
3. User home directory `~/`

## Schema

```json
{
  "app_id": "<your-feishu-app-id>",
  "app_secret": "<your-feishu-app-secret>",
  "auth_type": "user",
  "base_url": "https://open.feishu.cn/open-apis",
  "scope_validation": true,
  "log_level": "info",
  "cache_enabled": true,
  "cache_ttl": 300
}
```

Each field maps directly to a feishu-mcp environment variable and is passed through when spawning the MCP server.

## Fields

### `app_id` → `FEISHU_APP_ID`

| Type | Required | Description |
|------|----------|-------------|
| string | Yes | Feishu app ID from the Open Platform |

### `app_secret` → `FEISHU_APP_SECRET`

| Type | Required | Description |
|------|----------|-------------|
| string | Yes | Feishu app secret from the Open Platform |

### `auth_type` → `FEISHU_AUTH_TYPE`

| Type | Required | Default | Description |
|------|----------|---------|-------------|
| string | No | `tenant` | Authentication type |

Values:
- `tenant` — App-level token (default, limited functionality)
- `user` — User-level token (recommended, requires OAuth, full functionality)

> **Strongly recommend `user` mode.** Tenant mode cannot search Wiki documents, and document edit history won't show user identity.

### `base_url` → `FEISHU_BASE_URL`

| Type | Required | Default | Description |
|------|----------|---------|-------------|
| string | No | `https://open.feishu.cn/open-apis` | Feishu API base URL |

Values:
- `https://open.feishu.cn/open-apis` — Feishu (China)
- `https://open.larksuite.com/open-apis` — Lark (International)

### `scope_validation` → `FEISHU_SCOPE_VALIDATION`

| Type | Required | Default | Description |
|------|----------|---------|-------------|
| boolean | No | `true` | Enable permission scope validation on startup |

Set to `false` to skip permission checking (useful when only using a subset of features).

### `log_level` → `LOG_LEVEL`

| Type | Required | Default | Description |
|------|----------|---------|-------------|
| string | No | `info` | Log level |

Values: `debug`, `info`, `log`, `warn`, `error`, `none`

### `cache_enabled` → `CACHE_ENABLED`

| Type | Required | Default | Description |
|------|----------|---------|-------------|
| boolean | No | `true` | Enable response caching |

### `cache_ttl` → `CACHE_TTL`

| Type | Required | Default | Description |
|------|----------|---------|-------------|
| number | No | `300` | Cache TTL in seconds |

## How to Create a Feishu App

1. Log in to [Feishu Open Platform](https://open.feishu.cn/app)
2. Click "Create Custom App"
3. Fill in app name and description
4. Get **App ID** and **App Secret** from "Credentials & Basic Info"
5. For user mode: add redirect URL `http://localhost:3333/callback` in "Security Settings"
6. Configure required permissions (see below)
7. Detailed guide: [FEISHU_CONFIG.md](https://github.com/cso1z/Feishu-MCP/blob/main/FEISHU_CONFIG.md)

## Required Permissions

Enable these scopes in the Feishu Open Platform app settings:

| Permission | Description |
|------------|-------------|
| `docx:document` | Document read/write |
| `docs:doc` | Document basic operations |
| `drive:drive` | Cloud drive file operations |
| `wiki:wiki` | Wiki knowledge base operations |
| `search:docs` | Document search |
| `drive:permission` | Document permission management |

> User mode and tenant mode require different permission scopes. See the Feishu Open Platform for details.

After enabling permissions, publish an app version and have an admin approve it.
