---
paths:
  - "**/*.java"
---

# P3C: Security Rules

## Mandatory

- Enforce authorization checks on all user-specific pages and functions — prevent horizontal privilege escalation (accessing/modifying other users' data)
- Mask sensitive data in display: e.g., phone `158****9119`, hiding middle digits
- Use parameterized queries (prepared statements) for all SQL — never concatenate user input into SQL strings
- Validate all user request parameters; unvalidated input can cause:
  - Memory overflow (oversized page size)
  - Slow queries (malicious ORDER BY)
  - Arbitrary redirects
  - SQL injection
  - Deserialization attacks
  - ReDoS (regex denial of service)
- Sanitize and escape all user data before HTML output (prevent XSS)
- Implement CSRF protection on all forms and AJAX submissions
- Rate-limit platform resources (SMS, email, phone, orders, payments) with quantity limits, frequency controls, and CAPTCHA to prevent abuse

## Recommended

- Implement anti-spam, content filtering, and risk control for all user-generated content (posts, comments, messages)
