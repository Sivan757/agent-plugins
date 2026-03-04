---
paths:
  - "**/*.java"
---

# P3C: Flow Control Statements

## Mandatory

- Every `case` in a `switch` block must end with `break`/`return` or a comment explaining fall-through; always include a `default` case (even if empty)
- Always use braces `{}` with `if`/`else`/`for`/`while`/`do`, even for single-line bodies
  - Negative: `if (condition) statements;`
- In high-concurrency code, use range checks (`>`, `<`) not equality (`==`) for exit/interrupt conditions (equality can be "skipped over" by concurrent modifications)

## Recommended

- Prefer early return (guard clauses) over deeply nested `if-else`; max 3 levels of `if-else` nesting — use guard clauses, strategy pattern, or state pattern beyond that
- Extract complex boolean expressions into named boolean variables for readability
- Move constant operations (object creation, DB connections, unnecessary try-catch) out of loop bodies
- Avoid negation operator `!` — write positive logic instead: `if (x < 628)` not `if (!(x >= 628))`
- Validate parameters for: low-frequency methods, expensive methods, high-stability methods, external APIs, sensitive entry points
