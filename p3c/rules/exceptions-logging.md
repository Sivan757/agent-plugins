---
paths:
  - "**/*.java"
---

# P3C: Exception Handling & Logging

## Exception Handling — Mandatory

- Use pre-checks for avoidable RuntimeExceptions: `if (obj != null)` not `try { obj.method() } catch (NPE)`
- Never use exceptions for flow control or conditional logic
- Catch specific exception types, not blanket `Exception` — distinguish stable code from unstable code
- Never swallow exceptions silently; handle meaningfully or rethrow to caller
- Rollback transactions in catch blocks when inside transactional code
- Close resources in `finally` blocks, or use try-with-resources (JDK7+)
- Never `return` inside a `finally` block (discards try-block exceptions and return values)
- Caught exception type must match or be a parent of the thrown exception type

## Exception Handling — Recommended

- Guard against NPE in these scenarios:
  - Unboxing null wrapper types (e.g., `public int f() { return nullInteger; }`)
  - Database query results may be null
  - Collection elements may be null even when `isNotEmpty()` is true
  - RPC return values — always null-check
  - Session data — always null-check
  - Chained calls `obj.getA().getB().getC()` — use Optional (JDK8+)
- Use business-specific exceptions (`DAOException`, `ServiceException`), not raw `RuntimeException`
- Follow DRY — extract common validation into shared methods

## Logging — Mandatory

- Use SLF4J facade API only; never use Log4j/Logback API directly
- Retain log files for at least 15 days
- Log file naming: `appName_logType_logName.log` (e.g., `mppserver_monitor_timeZoneConvert.log`)
- Use placeholders or conditional checks for trace/debug/info logging to avoid unnecessary string concatenation:
  - `logger.debug("Processing trade id: {} symbol: {}", id, symbol);`
  - Or: `if (logger.isDebugEnabled()) { logger.debug(...); }`
- Set `additivity=false` in log config to prevent duplicate log entries
- Exception logs must include both context info AND full stack trace: `logger.error(context + "_" + e.getMessage(), e);`

## Logging — Recommended

- No debug logs in production; be selective with info logs; clean up temporary warn logs
- Use `warn` (not `error`) for user input errors — reserve `error` for system logic failures
