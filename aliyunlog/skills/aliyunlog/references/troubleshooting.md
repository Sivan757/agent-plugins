# Troubleshooting

## Common Errors

- **`@alicloud/log not found`** - Run `npm install --prefix <plugin-dir>` or restart the session to trigger auto-install
- **`Invalid accessKeyId`** - Edit `~/.cache/apex-plugin/aliyunlog.json` with real credentials
- **`No config found`** - Run `--init` to create `~/.cache/apex-plugin/aliyunlog.json`
- **`Failed to parse config`** - Check for trailing commas, missing quotes, or other JSON syntax errors
- **`(no results)`** - Widen time range, simplify query, or try full-text search instead of field search (`ERROR` instead of `content:ERROR`). Field search requires the field to be indexed.
- **Chinese search returns 0** - Use exact phrase quotes, try shorter keywords, or search by structured field (order number, traceId) instead
- **Permission errors** - Verify SLS access key has read permission on target project

## npm Install Failures

- **Network issues** - Check proxy settings or try `npm install --prefix <plugin-dir> --registry https://registry.npmmirror.com`
- **Permission denied** - Ensure write access to the plugin directory's `node_modules`
- **Corrupted node_modules** - Delete `node_modules` and `package-lock.json`, then re-run `npm install --prefix <plugin-dir>`

## SDK Timeout / Rate Limiting

- **Request timeout** - SLS queries on large logstores may take time. Narrow the time range or simplify the query.
- **Rate limited (HTTP 403/429)** - Reduce query frequency. SLS has per-project rate limits. Wait a few seconds and retry.
- **Endpoint unreachable** - Verify the `endpoint` in `~/.cache/apex-plugin/aliyunlog.json` matches your SLS region (e.g., `cn-hangzhou.log.aliyuncs.com`)

## Time Format

Only ISO 8601 standard dates are accepted:
- `--from="2026-03-04T10:00:00+08:00"` (with timezone)
- `--from="2026-03-04 10:00:00"` (local time)

**Relative time expressions are NOT supported** (no `-30m`, `-2h`, `3 days ago`). Calculate exact timestamps before passing to the script.

Default time range is **15 minutes** from now. For investigating historical issues, always specify `--from`.

## Config Security

- Config is stored globally at `~/.cache/apex-plugin/aliyunlog.json` — outside project directories, no gitignore needed
- **Never read config directly** — use `--test` to verify connectivity, `--list-aliases` to check aliases
- **Legacy config**: If upgrading from v0.6.0 or earlier, migrate `.claude/.aliyun.json` to the global path
