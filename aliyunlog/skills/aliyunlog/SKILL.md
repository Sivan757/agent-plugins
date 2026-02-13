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
allowed-tools: Bash(node:*), Read
---

# SLS Log Query

Query Alibaba Cloud SLS logs via `@alicloud/log` Node.js SDK with environment/service alias resolution.

## CRITICAL: Credential Security

**NEVER read, open, cat, or view `.claude/.aliyun.json` directly.** Use `--test` to verify connectivity.

## Command Reference

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js <env> <service> [options]
```

| Option | Description |
|--------|-------------|
| `--query=<sls_query>` | SLS query string (default: `*`) |
| `--from=<time>` | Start time (default: 15 min ago) |
| `--to=<time>` | End time (default: now) |
| `--limit=<n>` | Max entries (default: **1**) |
| `--format=compact\|csv\|json` | Output format (default: compact) |
| `--fields=<f1,f2,...>` | Extract specific fields as CSV |
| `--count` | Shorthand for COUNT(*) query |
| `--oldest` | Show oldest first (default: newest) |

Subcommands: `--init`, `--list-logstores <project|env>`, `--list-aliases`, `--test`, `--help`

## MANDATORY: Query Strategy

### Step 1: COUNT first — verify data exists

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js <env> <service> --query="<keyword>" --count
```

If count is 0, **widen the time range** or **simplify the query** before proceeding.

### Step 2: Sample with targeted fields

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js <env> <service> --query="<keyword>" --fields="_time_,_container_name_,content" --limit=3
```

### Step 3: Full content only if necessary

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js <env> <service> --query="<keyword>" --limit=5
```

## IMPORTANT: Chinese Keyword Search

SLS tokenization (分词) causes **Chinese phrase search to often return 0 results**.

1. **Prefer structured fields** — order numbers, traceId, error codes over Chinese text
2. **Use exact phrase quotes** — `content: "绑定产品通知触发拉取订单"`
3. **Use single keywords** — `content: 异常` instead of `content: 异常信息处理`
4. **Fall back to wildcard** — `content: 绑定产品*`
5. **Remove field prefix** — try `"绑定产品"` instead of `content: "绑定产品"`

## Token Optimization Rules

1. **Default limit is 1** — specify `--limit=N` when you need more
2. **Auto temp file** — output > 2000 chars → `/tmp/claude-sls/sls-*.txt`
3. **Use `--count`** instead of fetching raw logs
4. **Use `--fields`** to extract only needed fields as CSV
5. **Use analysis queries** (`| SELECT ...`) for aggregations
6. **Filter server-side** with SLS query syntax

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
