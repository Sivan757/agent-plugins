# SLS Query Syntax Reference

## Query Structure

```
search_statement | analysis_statement
```

- **Search statement**: Filters logs by keywords, field values, ranges
- **Analysis statement**: SQL-like aggregation on filtered results (no FROM/WHERE needed)
- The pipe `|` separates search from analysis

## Search Statement

### Full-Text Search

```
keyword
keyword1 and keyword2
keyword1 or keyword2
not keyword
"exact phrase"
```

### Field Search

```
field:value
field:"exact value"
field:value1 or field:value2
request_method:GET and status:200
```

### Operators

| Operator | Usage | Example |
|----------|-------|---------|
| `:` | Field match | `status:200` |
| `and` | Logical AND | `GET and 200` |
| `or` | Logical OR | `GET or POST` |
| `not` | Logical NOT | `not status:404` |
| `""` | Exact match / escape | `"error message"` |
| `*` | Wildcard (multi-char) | `host:*.example.com` |
| `?` | Wildcard (single-char) | `status:20?` |
| `>` `>=` `<` `<=` | Numeric comparison | `response_time>5000` |
| `=` | Equality | `status=200` |
| `in` | Range (lowercase only) | `status in [200 299]` |
| `()` | Grouping | `(GET or POST) and status:200` |

### Precedence (high to low)

1. `:` (colon)
2. `""` (quotes)
3. `()` (parentheses)
4. `and`, `not`
5. `or`

### Special Fields

| Field | Description |
|-------|-------------|
| `__source__` | Log source IP/host |
| `__topic__` | Log topic |
| `__tag__:key` | Metadata tag value |
| `content` | Log content (K8s) |
| `_container_name_` | Container name |
| `_namespace_` | K8s namespace |
| `_pod_name_` | Pod name |

### Wildcards

- `*` matches zero or more characters: `err*` matches `error`, `errno`
- `?` matches exactly one character: `status:20?` matches `200`, `201`
- Wildcards cannot start a term (no `*error`)
- Wildcard queries sample up to 100 matching terms

## Analysis Statement

Analysis uses SQL syntax after the pipe `|`:

```
* | SELECT field, COUNT(*) as cnt GROUP BY field ORDER BY cnt DESC LIMIT 10
```

### Common Functions

| Function | Example |
|----------|---------|
| `COUNT(*)` | `* \| SELECT COUNT(*) as total` |
| `COUNT(DISTINCT f)` | `* \| SELECT COUNT(DISTINCT _pod_name_) as pods` |
| `SUM(field)` | `* \| SELECT SUM(response_time)` |
| `AVG(field)` | `* \| SELECT AVG(response_time)` |
| `MAX/MIN` | `* \| SELECT MAX(response_time)` |
| `GROUP BY` | `* \| SELECT status, COUNT(*) GROUP BY status` |
| `ORDER BY` | `... ORDER BY cnt DESC` |
| `LIMIT` | `... LIMIT 20` |
| `WHERE` | `* \| SELECT * WHERE status > 400` |
| `HAVING` | `... GROUP BY host HAVING cnt > 100` |

### Time Functions

| Function | Description |
|----------|-------------|
| `date_format(__time__, '%H:%i')` | Format timestamp |
| `from_unixtime(__time__)` | Unix to datetime |
| `time_series(__time__, '1m', '%H:%i', '0')` | Time bucket |
| `now()` | Current time |

### String Functions

| Function | Description |
|----------|-------------|
| `regexp_like(field, 'pattern')` | Regex match |
| `regexp_extract(field, 'pattern', n)` | Regex extract |
| `split_part(field, sep, n)` | Split and get part |
| `substr(field, start, len)` | Substring |
| `concat(a, b)` | Concatenate |
| `lower(field)` / `upper(field)` | Case conversion |

### IP Functions

| Function | Description |
|----------|-------------|
| `ip_to_country(ip)` | IP to country |
| `ip_to_province(ip)` | IP to province |
| `ip_to_city(ip)` | IP to city |

## Common Query Patterns

### Error Log Search
```
content:ERROR and _container_name_:my-service
```

### Exception Stack Trace
```
content:Exception and content:stacktrace
```

### Status Code Distribution
```
* | SELECT status, COUNT(*) as cnt GROUP BY status ORDER BY cnt DESC
```

### Error Rate Over Time
```
content:ERROR | SELECT time_series(__time__, '5m', '%H:%i', '0') as t, COUNT(*) as cnt GROUP BY t ORDER BY t
```

### Top Error Pods
```
content:ERROR | SELECT _pod_name_, COUNT(*) as cnt GROUP BY _pod_name_ ORDER BY cnt DESC LIMIT 10
```

### Slow Requests (if response_time indexed)
```
response_time > 3000 | SELECT request_uri, AVG(response_time) as avg_rt GROUP BY request_uri ORDER BY avg_rt DESC LIMIT 10
```
