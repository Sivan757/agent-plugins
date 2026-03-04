---
paths:
  - "**/*.java"
---

# P3C: Comment Conventions

## Mandatory

- Use Javadoc (`/** */`) for classes, class fields, and methods — not `//`
- All abstract methods and interface methods must have Javadoc with: purpose, `@param`, `@return`, `@throws`
- Every class must have `@author` and creation date
- Single-line comments (`//`) go on a separate line above the code; multi-line comments use `/* */`, aligned with code
- All enum fields must have Javadoc explaining their purpose

## Recommended

- Update comments whenever code changes — stale comments are worse than no comments
- Delete commented-out code rather than leaving it (version control preserves history); if temporarily kept, mark with `///` and explain the reason
- Use `TODO` with author, date, and expected resolution time for pending work
- Use `FIXME` with author, date for known bugs requiring urgent fix
