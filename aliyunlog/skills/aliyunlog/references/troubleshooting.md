# Troubleshooting

## Common Errors

- **`@alicloud/log not found`** - Run the SessionStart hook or `npm install --prefix <plugin-dir>`
- **`Invalid accessKeyId`** - Edit `.claude/.aliyun.json` with real credentials
- **`No config found`** - Run `--init` to create `.claude/.aliyun.json`
- **`(no results)`** - Widen time range, simplify query, or try full-text search instead of field search (`ERROR` instead of `content:ERROR`). Field search requires the field to be indexed.
- **Chinese search returns 0** - Use exact phrase quotes, try shorter keywords, or search by structured field (order number, traceId) instead
- **Permission errors** - Verify SLS access key has read permission on target project

## Time Range Tips

- Default time range is **15 minutes**. For investigating historical issues, always specify `--from`.
- Use wide range + `--count` first to verify data exists, then narrow down.
- Relative time: `--from=-2h`, `--from=-3d`, `--from="30 minutes ago"`
- Absolute time: `--from="2026-02-13 10:00:00+08:00"` (include timezone)
- Units: `s` (seconds), `m` (minutes), `h` (hours), `d` (days)
