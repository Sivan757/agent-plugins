---
paths:
  - "**/*.java"
---

# P3C: Miscellaneous Rules

## Mandatory

- Precompile regex patterns as class-level constants; never define `Pattern.compile()` inside method bodies
- Use `$!{var}` (with `!`) in Velocity templates to safely handle null values
- Use `Random.nextInt()`/`nextLong()` for random integers; never `(int)(Math.random() * N)`
- Use `System.currentTimeMillis()` for current time; not `new Date().getTime()`; use `System.nanoTime()` for precision; use `Instant` (JDK8+) for time statistics
- Date formatting: use lowercase `yyyy` for year (not `YYYY` which means week-year); `MM` for month, `mm` for minute, `HH` for 24-hour, `hh` for 12-hour
  - Correct: `new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")`
  - Bug: `YYYY/MM/dd` — 2017/12/31 becomes 2018/12/31
- Never use Apache BeanUtils for property copying (performance issues)

## Recommended

- Method body should not exceed 80 lines (including signatures, comments, blank lines)
- Specify initial size for all data structures to prevent unbounded growth
- Promptly remove unused code and obsolete configuration
- No complex logic in view templates — views are for display only (MVC principle)
