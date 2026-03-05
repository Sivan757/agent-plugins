---
name: aliyunlog
description: >-
  This skill should be used when the user asks to "query logs",
  "check logs", "search logs", "look up logs", "查日志", "查询日志",
  "query SLS", "search SLS", "log query", "view log",
  "error logs", "check service logs", "查看报错",
  "find errors in logs", "tail logs", "recent logs",
  "log analysis", "log statistics", "日志分析",
  "list logstores",
  "查看生产日志", "查看开发日志", or "排查问题".
  Provides the ability to query Alibaba Cloud SLS (Log Service) logs via @alicloud/log
  Node.js SDK with environment/service alias resolution and SLS query syntax support.
model: sonnet
allowed-tools: Bash(node:*), Read, AskUserQuestion
---

# SLS Log Query

Query Alibaba Cloud SLS logs via `@alicloud/log` Node.js SDK.

## CRITICAL: Credential Security

**NEVER read, open, cat, or view `~/.cache/apex-plugin/.aliyun.json` directly.** Use `--test` to verify connectivity.

## Command Reference

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs [options]
```

### Query Options

| Option | Description |
|--------|-------------|
| `--project=<name>` | SLS project name |
| `--logstore=<name>` | SLS logstore name |
| `--service=<name>` | Auto-discover logstore by service name (cached) |
| `--query=<sls_query>` | SLS query string (default: `*`) |
| `--template=<name>` | Use query template: `error-by-service`, `npe`, `recent-errors`, `fatal`, `timeout`, `oom` |
| `--keyword=<text>` | Additional keyword for templates |
| `--from=<time>` | Start time (omit = last 15 min) |
| `--to=<time>` | End time (omit = now) |
| `--limit=<n>` | Max entries (default: **1**) |
| `--format=compact\|csv\|json` | Output format (default: compact) |
| `--fields=<f1,f2,...>` | Extract specific fields as CSV |
| `--count` | Shorthand for COUNT(*) query |
| `--oldest` | Show oldest first (default: newest) |

### Output Options

| Option | Description |
|--------|-------------|
| `--extract-errors` | Extract only exception types and stack traces |
| `--full` | Skip smart summarization for large outputs |
| `--auto-broaden` | Auto-retry with relaxed filters if 0 results |

### Session Context Options

| Option | Description |
|--------|-------------|
| `--save-context` | Save query context for `--more`/`--refine` |
| `--more` | Fetch next page using saved context |
| `--refine=<filter>` | Add filter to previous query |
| `--clear-context` | Clear saved context |

### Subcommands

| Command | Description |
|---------|-------------|
| `--init` | Create config template |
| `--setup` | Interactive setup wizard |
| `--list-logstores <project>` | List logstores in a project |
| `--list-aliases` | Show configured aliases |
| `--test` | Test SDK connection |

## Time Format

Supports **relative time** and ISO 8601:

```bash
--from=-24h          # 24 hours ago
--from=-2d           # 2 days ago
--from=-30m          # 30 minutes ago
--from="2 hours ago" # 2 hours ago
--to=now             # current time
--from="2026-03-04T10:00:00+08:00"  # ISO 8601
```

If the user says "last 2 hours", use `--from=-2h`. If `--from`/`--to` are omitted, defaults to last 15 minutes.

## MANDATORY: Target Discovery Workflow

### Step 0: Discover target

**Preferred: Use `--service` for auto-discovery:**
```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --service=robot-order --project=robot-k8s-dev --query="ERROR" --from=-1h --limit=5
```
- Auto-discovers which logstore contains the service
- Caches mapping in `~/.cache/apex-plugin/aliyunlog-mappings.json` for instant reuse
- If found in multiple logstores, shows list and asks user to specify `--logstore`

**Fallback: Check aliases:**
```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --list-aliases
```

### Step 1: Confirm target with user

Use `AskUserQuestion` when:
- User didn't specify env/service
- Service found in multiple logstores
- No alias configured

### Step 2: Save mapping (optional)

After confirming a new mapping, ask: "Save this to CLAUDE.md?" and append under `## Aliyunlog Service Mappings`.

## Query Templates

Use templates instead of writing raw SLS queries:

```bash
# Find errors for a service
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs dev robot-order --template=error-by-service --from=-2h --limit=10

# Find NullPointerException with keyword
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs dev robot-order --template=npe --keyword=qink --from=-1h --limit=5

# Find timeout errors
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --service=robot-order --project=robot-k8s-dev --template=timeout --from=-4h --limit=10
```

Available templates:
- `error-by-service` — `_container_name_:<service> and (ERROR or Exception)`
- `npe` — NullPointerException (with optional `--keyword`)
- `recent-errors` — ERROR, WARN, Exception
- `fatal` — FATAL or Fatal error
- `timeout` — timeout, timed out, TimeoutException
- `oom` — OutOfMemoryError, out of memory

## Investigation Workflow

### Quick investigation (recommended)

```bash
# 1. Start with template + extract-errors + auto-broaden
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --service=robot-order --project=robot-k8s-dev \
  --template=error-by-service --from=-2h --limit=10 --extract-errors --auto-broaden --save-context

# 2. See more results
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --more --extract-errors

# 3. Narrow down to specific error
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --refine="BusinessException" --extract-errors

# 4. Clean up
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --clear-context
```

### Progressive search

When a specific query returns 0 results, use `--auto-broaden`:
- Level 1: Keep service filter + exception type, remove keywords
- Level 2: Keep service filter + broad error filter (ERROR/WARN/Exception)
- Level 3: Keep only service filter

### Token-efficient approach

1. **Start with `--count`** to verify data exists
2. **Use `--extract-errors`** for clean error summaries
3. **Smart summarization** — outputs >50 lines auto-summarize (use `--full` to skip)
4. **Use `--fields`** to extract only needed fields as CSV
5. **Use `--save-context` + `--more`** to paginate instead of large `--limit`

## IMPORTANT: Chinese Keyword Search

SLS tokenization causes **Chinese phrase search to often return 0 results**.

1. **Prefer structured fields** — order numbers, traceId, error codes over Chinese text
2. **Use exact phrase quotes** — `content: "绑定产品通知触发拉取订单"`
3. **Use single keywords** — `content: 异常` instead of `content: 异常信息处理`
4. **Fall back to wildcard** — `content: 绑定产品*`
5. **Remove field prefix** — try `"绑定产品"` instead of `content: "绑定产品"`

## Quick Syntax Reference

```
search_statement | analysis_statement
```

| Operator | Example |
|----------|---------|
| Field match | `status:200` |
| AND / OR / NOT | `content:ERROR and _container_name_:svc` |
| Exact phrase | `"Connection refused"` |
| Wildcard | `content:Null*Exception` |

Common fields: `content`, `_container_name_`, `_pod_name_`, `_time_`, `__source__`

## Reference Files

- [query-templates.md](references/query-templates.md) — Common query patterns: by order, traceId, errors, aggregation
- [query-syntax.md](references/query-syntax.md) — Full SLS query syntax reference
- [config-schema.md](references/config-schema.md) — Config file schema and alias resolution
- [troubleshooting.md](references/troubleshooting.md) — Error resolution and time range tips
