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

**NEVER read, open, cat, or view `~/.cache/apex-plugin/aliyunlog.json` directly.** Use `--test` to verify connectivity.

## Command Reference

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --project=<project> --logstore=<logstore> [options]
```

| Option | Description |
|--------|-------------|
| `--project=<name>` | SLS project name (**required**) |
| `--logstore=<name>` | SLS logstore name (**required**) |
| `--query=<sls_query>` | SLS query string (default: `*`) |
| `--from=<time>` | Start time: ISO 8601 (default: 15 min ago) |
| `--to=<time>` | End time: ISO 8601 (default: now) |
| `--limit=<n>` | Max entries (default: **1**) |
| `--format=compact\|csv\|json` | Output format (default: compact) |
| `--fields=<f1,f2,...>` | Extract specific fields as CSV |
| `--count` | Shorthand for COUNT(*) query |
| `--oldest` | Show oldest first (default: newest) |

Subcommands: `--init`, `--list-logstores <project>`, `--list-aliases`, `--test`, `--help`

## MANDATORY: Project/Logstore Confirmation

**You MUST confirm project and logstore with the user before every query.**

### Step 0: Confirm target

Use `AskUserQuestion` to confirm the project and logstore:

- If the user specifies project/logstore explicitly → use them directly
- If the user gives env/service names (e.g., "prod saas") → use `AskUserQuestion` to present the resolved mapping for confirmation
- If unknown → use `AskUserQuestion` to ask the user for project and logstore

After the user confirms a new mapping, ask: "Save this mapping to project CLAUDE.md for future use?"
If yes, append the mapping to the project's CLAUDE.md under an `## SLS Mappings` section, like:
```
## SLS Mappings
- prod/saas → project=robot-k8s-prod, logstore=saas
```

### Step 1: COUNT first — verify data exists

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --project=<project> --logstore=<logstore> --query="<keyword>" --count
```

If count is 0, **widen the time range** or **simplify the query** before proceeding.

### Step 2: Sample with targeted fields

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --project=<project> --logstore=<logstore> --query="<keyword>" --fields="_time_,_container_name_,content" --limit=3
```

### Step 3: Full content only if necessary

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --project=<project> --logstore=<logstore> --query="<keyword>" --limit=5
```

## MANDATORY: Time Format

**Only standard ISO 8601 date formats are supported.** You MUST compute exact timestamps.

When the user says relative times (e.g., "last 2 hours", "yesterday"), calculate the ISO 8601 timestamp yourself:
- `--from="2026-03-04T09:00:00+08:00"` (not `--from=-2h`)
- `--from="2026-03-03T00:00:00+08:00"` (not `--from="1 day ago"`)

If the user doesn't specify a time range, omit `--from`/`--to` (defaults to last 15 minutes).

## IMPORTANT: Chinese Keyword Search

SLS tokenization (分词) causes **Chinese phrase search to often return 0 results**.

1. **Prefer structured fields** — order numbers, traceId, error codes over Chinese text
2. **Use exact phrase quotes** — `content: "绑定产品通知触发拉取订单"`
3. **Use single keywords** — `content: 异常` instead of `content: 异常信息处理`
4. **Fall back to wildcard** — `content: 绑定产品*`
5. **Remove field prefix** — try `"绑定产品"` instead of `content: "绑定产品"`

## Token Optimization Rules

1. **Default limit is 1** — specify `--limit=N` when you need more
2. **Auto temp file** — output > 2000 chars → temp dir `sls-*.txt`
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
