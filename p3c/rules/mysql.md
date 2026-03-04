---
paths:
  - "**/*.java"
  - "**/*.xml"
  - "**/*.sql"
---

# P3C: MySQL Database Rules

## Table Design — Mandatory

- Boolean fields: name `is_xxx`, type `unsigned tinyint` (1=yes, 0=no)
- Table and field names: lowercase letters and digits only; no uppercase; no digit-only segments between underscores
- Table names: singular nouns (not plural)
- No MySQL reserved words (`desc`, `range`, `match`, `delayed`, etc.) as names
- Index naming: `pk_` (primary key), `uk_` (unique), `idx_` (normal index) + field name
- Use `decimal` for precise numbers; never `float` or `double` (precision loss)
- Use `char` for fixed-length strings; `varchar` for variable (max 5000); use `text` in separate table for longer
- Every table must have: `id` (unsigned bigint, auto-increment PK), `gmt_create` (datetime), `gmt_modified` (datetime)

## Indexes — Mandatory

- Create unique indexes for business-unique fields, even multi-column combinations
- Max 3 tables in a JOIN; joined fields must be same data type and indexed
- Specify index length for varchar columns (typically 20 chars gives 90%+ selectivity)
- No left-wildcard (`%xxx`) or full-wildcard (`%xxx%`) LIKE queries — use search engine instead

## SQL — Mandatory

- Use `count(*)` for row counts; `count(col)` skips NULLs
- Handle `sum()` null: `SELECT IFNULL(SUM(g), 0) FROM table`
- Use `ISNULL()` to check NULL; `NULL = NULL` returns NULL, not true
- Skip pagination query when `count = 0`
- No foreign keys or cascades — handle referential integrity in application layer
- No stored procedures
- Always SELECT before DELETE/UPDATE for data correction operations

## ORM — Mandatory

- No `SELECT *` — explicitly list required columns
- POJO boolean fields: no `is` prefix; DB fields: `is_` prefix; map explicitly in resultMap
- Always define `<resultMap>`; don't rely on `resultClass` auto-mapping
- Use `#{}` (parameterized) in MyBatis XML, never `${}` (string interpolation = SQL injection)
- Don't use HashMap/Hashtable as query result containers
- Always update `gmt_modified` when modifying records

## Recommended

- Table name format: `business_purpose` (e.g., `trade_config`, `alipay_task`)
- Update only changed fields, not all columns
- Use covering indexes to avoid table lookups
- Optimize deep pagination: `SELECT a.* FROM t a, (SELECT id FROM t WHERE ... LIMIT 100000,20) b WHERE a.id=b.id`
- Put highest-selectivity columns leftmost in composite indexes
- Keep `IN` clause under 1000 elements
- Don't overuse `@Transactional`; consider rollback strategies for cache, search, and messaging
