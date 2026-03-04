---
paths:
  - "**/*.java"
  - "**/src/test/**"
---

# P3C: Unit Testing Rules

## Mandatory

- Follow AIR principle: Automatic, Independent, Repeatable
- Tests must be fully automated and non-interactive; use `assert` methods, never `System.out` for verification
- Tests must be independent — no inter-test dependencies or execution order requirements
- Tests must be repeatable without external dependencies (network, services, middleware); use mocks/DI for isolation
- Test granularity: method level (not class or system level)
- Core business/modules must have passing unit tests for all new/changed code
- Test code goes in `src/test/java` only, never in business code directories

## Recommended

- Target 70% statement coverage overall; 100% statement and branch coverage for core modules
- Follow BCDE principle:
  - **B**order: boundary values, loop edges, special times, data order
  - **C**orrect: valid input producing expected output
  - **D**esign: test cases derived from design documents
  - **E**rror: invalid data, exception flows, unauthorized input
- Prepare test data programmatically (insert/import), not by manually editing the database
- Use auto-rollback or clear prefixed test data (`XXX_UNIT_TEST_`) to avoid dirty data
- Write tests before release, not after; update tests when changing tested code
