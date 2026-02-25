# Common Query Templates

## By order number (most reliable)

```bash
# Search by order number — works across all log types
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js prod saas --query="PO-211-03580092775030709" --count
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js prod saas --query="PO-211-03580092775030709" --limit=5
```

## By traceId

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js prod saas --query="traceId:abc123def456" --limit=10
```

## Error logs

```bash
# Count errors in the last hour
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js prod saas --query="content:ERROR" --count --from=-1h

# View error details
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js prod saas --query="content:ERROR or content:Exception" --fields="_time_,_container_name_,content" --limit=5

# Errors by container (aggregation)
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js prod saas --query="content:ERROR | SELECT _container_name_, COUNT(*) as cnt GROUP BY _container_name_ ORDER BY cnt DESC LIMIT 10"
```

## Time-range aggregation

```bash
# Error trend over time (5-minute intervals)
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js prod saas --query="content:ERROR | SELECT time_series(__time__, '5m', '%H:%i', '0') as t, COUNT(*) as cnt GROUP BY t ORDER BY t"
```

## Exclude noise (health checks, metrics)

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js prod saas --query="content:ERROR not content:HealthCheck not content:actuator" --limit=5
```

## Direct Project/Logstore Access

Skip alias resolution when needed:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js --project=robot-k8s-prod --logstore=nginx-ingress --query="status:500" --limit=5
```

## Analysis Queries (SQL)

SLS supports SQL-like analysis after the pipe `|`:

```bash
# Count errors by container
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js prod saas --query="content:ERROR | SELECT _container_name_, COUNT(*) as cnt GROUP BY _container_name_ ORDER BY cnt DESC LIMIT 10"

# Error trend over time
node ${CLAUDE_PLUGIN_ROOT}/scripts/query.js prod saas --query="content:ERROR | SELECT time_series(__time__, '5m', '%H:%i', '0') as t, COUNT(*) as cnt GROUP BY t ORDER BY t"
```

## Output Formats

| Format | Flag | Token Cost | Best For |
|--------|------|-----------|----------|
| csv | `--format=csv` | Lowest | Structured data, field extraction |
| compact | `--format=compact` (default) | Low | Readable log view |
| json | `--format=json` | Highest | Programmatic processing |
