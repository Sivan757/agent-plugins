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

**NEVER read, open, cat, or view `~/.cache/apex-plugin/aliyunlog.json` directly.** Use `test` subcommand to verify connectivity. When config is missing or credentials are invalid, the CLI auto-opens a browser setup form.

## Command Reference

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/aliyunlog.mjs <subcommand> [options]
node ${CLAUDE_PLUGIN_ROOT}/dist/aliyunlog.mjs query [options]     # default subcommand
```

## Minimal Workflow (Recommended)

Use this 3-command flow by default:

```bash
# 1) First query (context auto-saved)
node ${CLAUDE_PLUGIN_ROOT}/dist/aliyunlog.mjs query \
  --service robot-order --project robot-k8s-dev \
  --query "<traceId|orderId|keyword>" --from -2h --limit 20

# 2) View full raw logs from same query context
node ${CLAUDE_PLUGIN_ROOT}/dist/aliyunlog.mjs query --full

# 3) Continue investigation with pagination or refinement
node ${CLAUDE_PLUGIN_ROOT}/dist/aliyunlog.mjs query --more
# or
node ${CLAUDE_PLUGIN_ROOT}/dist/aliyunlog.mjs query --refine "BusinessException"
```

For machine-readable output:
```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/aliyunlog.mjs query --full --format json
```

### Query Options (for `query` subcommand)

| Option | Description |
|--------|-------------|
| `--project <name>` | SLS project name |
| `--logstore <name>` | SLS logstore name |
| `--service <name>` | Auto-discover logstore by service name (cached) |
| `--query <sls_query>` | SLS query string (default: `*`) |
| `--template <name>` | Use query template: `error-by-service`, `npe`, `recent-errors`, `fatal`, `timeout`, `oom` |
| `--keyword <text>` | Additional keyword for templates |
| `--from <time>` | Start time (omit = last 15 min) |
| `--to <time>` | End time (omit = now) |
| `--limit <n>` | Max entries (default: **5**) |
| `--format <fmt>` | Output format: compact\|csv\|json (default: compact) |
| `--fields <f1,f2,...>` | Extract specific fields as CSV |
| `--count` | Shorthand for COUNT(*) query |
| `--oldest` | Show oldest first (default: newest) |

### Output Options (for `query` subcommand)

| Option | Description |
|--------|-------------|
| `--extract-errors` | Extract only exception types and stack traces |
| `--full` | Skip summarization and force raw inline output |
| `--summary` | Enable smart summary for large compact output (opt-in) |
| `--auto-broaden` | Auto-retry with relaxed filters if 0 results |

### Session Context Options

| Option / Subcommand | Description |
|--------|-------------|
| `--no-context` | Disable auto-saving query context (query option) |
| `--more` | Fetch next page using saved context (query option) |
| `--refine <filter>` | Add filter to previous query (query option) |
| `clear-context` | Clear saved context (standalone subcommand) |

### Discovery Subcommands

| Command | Description |
|---------|-------------|
| `find-service <name> [--project <p>]` | **Find which logstore contains a service** (auto-caches result) |
| `list-services <logstore> [--project <p>]` | List all services running in a logstore |
| `list-logstores <project>` | List all logstores in a project |
| `list-aliases` | Show configured aliases |

### Setup Subcommands

| Command | Description |
|---------|-------------|
| `init` | Create config template |
| `setup` | Interactive setup wizard |
| `test` | Test SDK connection |

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

## MANDATORY: Service Discovery Workflow

### When you don't know the logstore

**Use `find-service` subcommand to discover where a service lives:**
```bash
# Find which logstore contains robot-order
node ${CLAUDE_PLUGIN_ROOT}/dist/aliyunlog.mjs find-service robot-order --project robot-k8s-dev
# Output: qa1-saas (1234 logs in last 2h)
# Auto-caches the mapping for future queries

# List all services in a logstore
node ${CLAUDE_PLUGIN_ROOT}/dist/aliyunlog.mjs list-services qa1-saas --project robot-k8s-dev
```

### Normal query flow (after discovery)

`--service` auto-resolves from cache:
```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/aliyunlog.mjs query --service robot-order --project robot-k8s-dev --query "ERROR" --from -1h --limit 5
```

### NEVER guess project or logstore names
- There are only **2 SLS projects**: `robot-k8s-dev` (dev/qa/uat) and `robot-k8s-prod` (prod)
- **Do NOT invent** names like `robot-k8s-qa`, `robot-k8s-uat` — they don't exist
- If unsure, use `find-service` subcommand to discover automatically

## Query Templates

Use templates instead of writing raw SLS queries:

```bash
# Find errors for a service
node ${CLAUDE_PLUGIN_ROOT}/dist/aliyunlog.mjs query dev robot-order --template error-by-service --from -2h --limit 10

# Find NullPointerException with keyword
node ${CLAUDE_PLUGIN_ROOT}/dist/aliyunlog.mjs query dev robot-order --template npe --keyword qink --from -1h --limit 5

# Find timeout errors
node ${CLAUDE_PLUGIN_ROOT}/dist/aliyunlog.mjs query --service robot-order --project robot-k8s-dev --template timeout --from -4h --limit 10
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
node ${CLAUDE_PLUGIN_ROOT}/dist/aliyunlog.mjs query --service robot-order --project robot-k8s-dev \
  --template error-by-service --from -2h --limit 10 --extract-errors --auto-broaden

# 2. See full raw logs from same context
node ${CLAUDE_PLUGIN_ROOT}/dist/aliyunlog.mjs query --full

# 3. Narrow down to specific error
node ${CLAUDE_PLUGIN_ROOT}/dist/aliyunlog.mjs query --refine "BusinessException" --extract-errors

# 4. Clean up
node ${CLAUDE_PLUGIN_ROOT}/dist/aliyunlog.mjs clear-context
```

### Progressive search

When a specific query returns 0 results, use `--auto-broaden`:
- Level 1: Keep service filter + exception type, remove keywords
- Level 2: Keep service filter + broad error filter (ERROR/WARN/Exception)
- Level 3: Keep only service filter

### Token-efficient approach

1. **Preview first** — default limit is 5 entries; check the data before requesting more with `--limit=N`
2. **Start with `--count`** to verify data exists before fetching full logs
3. **Use `--extract-errors`** for clean error summaries instead of full logs
4. **Use `--fields`** to extract only needed fields as CSV (e.g., `--fields=_time_,content`)
5. **Aggregate first** — use SLS aggregation queries (`COUNT`, `GROUP BY`) over raw logs
6. **Use `--more`** to paginate instead of large `--limit` (context auto-saved)
7. **Default compact format** — most token-efficient; JSON is compact (no pretty-print)

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
