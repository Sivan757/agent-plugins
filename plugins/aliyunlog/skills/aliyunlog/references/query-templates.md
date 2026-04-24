# Common Query Templates

## By order number (most reliable)

```bash
# Search by order number — works across all log types
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --project=<project> --logstore=<logstore> --query="<order-number>" --count
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --project=<project> --logstore=<logstore> --query="<order-number>" --limit=5
```

## By traceId

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --project=<project> --logstore=<logstore> --query="traceId:<trace-id>" --limit=10
```

## Error logs

```bash
# Count errors in the last hour (compute ISO timestamp for --from)
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --project=<project> --logstore=<logstore> --query="content:ERROR" --count --from="2026-03-04T12:00:00+08:00"

# View error details
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --project=<project> --logstore=<logstore> --query="content:ERROR or content:Exception" --fields="_time_,_container_name_,content" --limit=5

# Errors by container (aggregation)
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --project=<project> --logstore=<logstore> --query="content:ERROR | SELECT _container_name_, COUNT(*) as cnt GROUP BY _container_name_ ORDER BY cnt DESC LIMIT 10"
```

## Time-range aggregation

```bash
# Error trend over time (5-minute intervals)
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --project=<project> --logstore=<logstore> --query="content:ERROR | SELECT time_series(__time__, '5m', '%H:%i', '0') as t, COUNT(*) as cnt GROUP BY t ORDER BY t"
```

## Exclude noise (health checks, metrics)

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --project=<project> --logstore=<logstore> --query="content:ERROR not content:HealthCheck not content:actuator" --limit=5
```

## Analysis Queries (SQL)

SLS supports SQL-like analysis after the pipe `|`:

```bash
# Count errors by container
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --project=<project> --logstore=<logstore> --query="content:ERROR | SELECT _container_name_, COUNT(*) as cnt GROUP BY _container_name_ ORDER BY cnt DESC LIMIT 10"

# Error trend over time
node ${CLAUDE_PLUGIN_ROOT}/scripts/aliyunlog.mjs --project=<project> --logstore=<logstore> --query="content:ERROR | SELECT time_series(__time__, '5m', '%H:%i', '0') as t, COUNT(*) as cnt GROUP BY t ORDER BY t"
```

## Output Formats

| Format | Flag | Token Cost | Best For |
|--------|------|-----------|----------|
| csv | `--format=csv` | Lowest | Structured data, field extraction |
| compact | `--format=compact` (default) | Low | Readable log view |
| json | `--format=json` | Highest | Programmatic processing |
