---
paths:
  - "**/*.java"
---

# P3C: Code Formatting

## Mandatory

- K&R brace style: opening brace on same line (no newline before `{`), newline after; closing brace on its own line; no newline before `else`/`catch`/`finally`
- No space between parentheses and their content: `if (a == b)` not `if ( a == b )`
- Space between keywords (`if`/`for`/`while`/`switch`/`do`) and opening parenthesis
- Space around all binary and ternary operators (`=`, `&&`, `+`, `-`, `*`, etc.)
- 4-space indentation; no tab characters
- One space between `//` and comment text
- Max 120 characters per line; when wrapping:
  - Second line indented 4 spaces from first; no further indent for subsequent lines
  - Operators wrap with the next line
  - Dot (`.`) in method chains wraps with the next line
  - Wrap after commas in parameter lists
  - Never wrap before an opening parenthesis
- Space after commas in method parameters: `method("a", "b", "c")`
- UTF-8 file encoding; Unix line endings (LF, not CRLF)

## Recommended

- Don't add extra spaces for vertical alignment of similar declarations
- Separate different logical/semantic blocks with exactly one blank line (never multiple)
