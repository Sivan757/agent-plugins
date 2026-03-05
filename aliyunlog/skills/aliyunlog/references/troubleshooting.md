# Troubleshooting

## Common Errors

- **`@alicloud/log not found`** - Run `npm install --prefix <plugin-dir>` or restart the session to trigger auto-install
- **`Invalid accessKeyId`** - Run `--setup` for interactive configuration, or edit `~/.cache/apex-plugin/.aliyun.json` with real credentials
- **`No config found`** - Run `--setup` (interactive) or `--init` (template) to create `~/.cache/apex-plugin/.aliyun.json`
- **`Failed to parse config`** - Check for trailing commas, missing quotes, or other JSON syntax errors
- **`logstore does not exist`** - Run `--list-logstores <project>` to see available logstores, or use `--service=<name>` for auto-discovery
- **`The Project does not exist`** - Check project name spelling. Run `--list-aliases` to see configured projects
- **`Service not found in any logstore`** - Service name doesn't match any `_container_name_` in the project. Check spelling or try `--list-logstores` to explore manually
- **`Service found in multiple logstores`** - Specify `--logstore` to disambiguate, or add an alias to config
- **`(no results)`** - Use `--auto-broaden` to automatically relax the query, or widen time range, simplify query, try full-text search instead of field search
- **Chinese search returns 0** - Use exact phrase quotes, try shorter keywords, or search by structured field (order number, traceId) instead
- **Permission errors** - Verify SLS access key has read permission on target project
- **`No previous context found`** - Run a query first (context is auto-saved by default), and don't use `--no-context` if you need `--more`/`--refine`/`--full`
- **`--full` shows usage instead of replaying context** - Your plugin version is old; rerun the original query with `--full`, or upgrade to latest plugin

## npm Install Failures

- **Network issues** - Check proxy settings or try `npm install --prefix <plugin-dir> --registry https://registry.npmmirror.com`
- **Permission denied** - Ensure write access to the plugin directory's `node_modules`
- **Corrupted node_modules** - Delete `node_modules` and `package-lock.json`, then re-run `npm install --prefix <plugin-dir>`

## SDK Timeout / Rate Limiting

- **Request timeout** - SLS queries on large logstores may take time. Narrow the time range or simplify the query.
- **Rate limited (HTTP 403/429)** - Reduce query frequency. SLS has per-project rate limits. Wait a few seconds and retry.
- **Endpoint unreachable** - Verify the `endpoint` in `~/.cache/apex-plugin/.aliyun.json` matches your SLS region (e.g., `cn-hangzhou.log.aliyuncs.com`)

## Time Format

Supports **relative time** and ISO 8601:
- `--from=-24h` (24 hours ago)
- `--from=-2d` (2 days ago)
- `--from=-30m` (30 minutes ago)
- `--from="2 hours ago"` (2 hours ago)
- `--to=now` (current time)
- `--from="2026-03-04T10:00:00+08:00"` (ISO 8601 with timezone)
- `--from="2026-03-04 10:00:00"` (ISO 8601 local time)

Default time range is **15 minutes** from now. For investigating historical issues, always specify `--from`.

## Config Security

- Config is stored globally at `~/.cache/apex-plugin/.aliyun.json` — outside project directories, no gitignore needed
- **Never read config directly** — use `--test` to verify connectivity, `--list-aliases` to check aliases
- **Legacy config**: If upgrading from v0.6.0 or earlier, migrate `.claude/.aliyun.json` to the global path
