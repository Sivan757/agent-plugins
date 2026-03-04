---
paths:
  - "**/*.java"
---

# P3C: Constant Conventions

## Mandatory

- No magic values — all constants must be predefined before use
  - Negative: `String key = "Id#taobao_" + tradeId;`
- Use uppercase `L` for long literals: `2L` not `2l` (lowercase `l` looks like `1`)

## Recommended

- Group constants into separate classes by function (e.g., `CacheConsts`, `ConfigConsts`), not one giant constants class
- Use enums for values in a fixed range with extended attributes
- Constants have 5 reuse levels: cross-app shared, app-wide shared, sub-project shared, package shared, class-internal (`private static final`)
