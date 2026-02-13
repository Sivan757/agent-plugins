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

Query Alibaba Cloud SLS logs using the `@alicloud/log` Node.js SDK. Supports quick lookup by environment and service name via configurable aliases.

## CRITICAL: Credential Security

**NEVER read, open, cat, or view `.claude/.aliyun.json` directly.** This file contains SLS access keys. Use `--test` to verify connectivity without exposing credentials.

## Prerequisites

- **Node.js** installed and available in PATH
- **`.claude/.aliyun.json`** in the project directory with credentials and environment/logstore mappings. Run `--init` to create a template. See `references/config-schema.md` for the full schema.

## Quick Start

### 1. Initialize Configuration

If no `.claude/.aliyun.json` exists:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js --init
```

Edit the generated file to add your SLS credentials and project/logstore mapping.

### 2. Query Logs

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js <env> <service> [options]
```

Options:
- `--query=<sls_query>` - SLS query string (default: `*`)
- `--from=<time>` - Start time (default: 15 min ago)
- `--to=<time>` - End time (default: now)
- `--limit=<n>` - Max entries (default: **1**)
- `--format=compact|csv|json` - Output format (default: compact)
- `--fields=<f1,f2,...>` - Extract specific fields as CSV
- `--count` - Shorthand for COUNT(*) query
- `--oldest` - Show oldest entries first (default: newest first)

## Core Operations

### Listing Resources

```bash
# List logstores in a project (by name or env shortname)
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js --list-logstores robot-k8s-dev
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js --list-logstores prod

# Show configured aliases
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js --list-aliases

# Test SDK connectivity
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js --test
```

### Basic Queries

```bash
# Recent logs from dev saas service (1 entry by default)
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js dev saas

# Search for errors in production
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js prod saas --query="content:ERROR" --limit=5

# Search for specific exception
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js dev saas --query="content:NullPointerException" --limit=3

# Query with time range
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js prod saas --query="content:ERROR" --from="2026-02-13 10:00:00+08:00" --to="2026-02-13 11:00:00+08:00" --limit=10
```

### Field Extraction

```bash
# Extract specific fields as CSV (token-efficient)
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js dev saas --query="content:ERROR" --fields="_time_,_container_name_,content" --limit=5

# Extract pod info
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js prod saas --fields="_pod_name_,_container_name_,_namespace_" --limit=10
```

### Count Queries

```bash
# Quick count of errors (single-line output)
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js prod saas --query="content:ERROR" --count

# Count with time range
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js prod saas --query="content:ERROR" --count --from="2026-02-13 00:00:00+08:00"
```

### Analysis Queries (SQL)

SLS supports SQL-like analysis after the pipe `|`:

```bash
# Count errors by container
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js prod saas --query="content:ERROR | SELECT _container_name_, COUNT(*) as cnt GROUP BY _container_name_ ORDER BY cnt DESC LIMIT 10"

# Error trend over time
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js prod saas --query="content:ERROR | SELECT time_series(__time__, '5m', '%H:%i', '0') as t, COUNT(*) as cnt GROUP BY t ORDER BY t"
```

### Direct Project/Logstore Access

Skip alias resolution when needed:

```bash
# Use explicit project and logstore
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js --project=robot-k8s-prod --logstore=nginx-ingress --query="status:500" --limit=5
```

## Output Formats

| Format | Flag | Token Cost | Best For |
|--------|------|-----------|----------|
| csv | `--format=csv` | Lowest | Structured data, field extraction |
| compact | `--format=compact` (default) | Low | Readable log view |
| json | `--format=json` | Highest | Programmatic processing |

## Token Optimization

**IMPORTANT: Follow this progressive query strategy to minimize token usage.**

### Step 1: Count First

Always start with `--count` to understand the data volume:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js dev saas --query="content:ERROR" --count
```

### Step 2: Targeted Fields

If you need details, extract only the fields you need:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js dev saas --query="content:ERROR" --fields="_time_,content" --limit=3
```

### Step 3: Full Content (only if necessary)

Only fetch full log entries when the above steps are insufficient:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js dev saas --query="content:ERROR" --limit=5
```

### Additional Rules

1. **Default limit is 1** — always specify `--limit=N` when you need more entries
2. **Auto temp file** — output > 2000 chars is written to `/tmp/claude-sls/sls-*.txt` with a summary. Use Read tool with offset/limit to inspect.
3. **Use `--count`** instead of fetching raw logs when counting
4. **Use `--fields`** to extract only needed fields as CSV
5. **Use analysis queries** (`| SELECT ...`) for aggregations instead of fetching raw data
6. **Filter server-side** with SLS query syntax, not by scanning returned results

## SLS Query Syntax Quick Reference

Search and analysis are separated by pipe `|`:

```
search_statement | analysis_statement
```

### Search Operators

| Operator | Example |
|----------|---------|
| Field match | `status:200` |
| AND | `content:ERROR and _container_name_:my-svc` |
| OR | `content:ERROR or content:WARN` |
| NOT | `not content:HealthCheck` |
| Exact phrase | `"Connection refused"` |
| Wildcard | `content:Null*Exception` |
| Numeric range | `response_time>3000` |
| Range query | `status in [400 499]` |

### Common K8s Log Fields

| Field | Description |
|-------|-------------|
| `content` | Log message body |
| `_container_name_` | Container/service name |
| `_namespace_` | K8s namespace |
| `_pod_name_` | Pod name |
| `_time_` | Log timestamp |
| `__source__` | Node IP |

For full syntax details, see `references/query-syntax.md`.

## Error Handling

- **`@alicloud/log not found`** - Run the SessionStart hook or `npm install --prefix <plugin-dir>`
- **`Invalid accessKeyId`** - Edit `.claude/.aliyun.json` with real credentials
- **`No config found`** - Run `--init` to create `.claude/.aliyun.json`
- **`(no results)`** - Widen time range, simplify query, or try full-text search instead of field search (`ERROR` instead of `content:ERROR`). Field search requires the field to be indexed with the correct analyzer.
- **Permission errors** - Verify SLS access key has read permission on target project

## Additional Resources

### Reference Files

- **`references/query-syntax.md`** - Full SLS query syntax with operators, functions, and examples
- **`references/config-schema.md`** - Configuration file schema and alias resolution rules
