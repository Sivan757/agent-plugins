---
paths:
  - "**/*.java"
---

# P3C: Naming Conventions

## Mandatory

- No identifiers starting or ending with `_` or `$`
- No Pinyin, Chinese, or Pinyin-English mixed naming; use proper English (exception: internationally known names like alibaba, taobao)
- Class names in `UpperCamelCase` (exception: DO/BO/DTO/VO/AO/PO suffixes stay uppercase)
  - Positive: `MarcoPolo`, `UserDO`, `XmlService`, `TcpUdpDeal`
  - Negative: `macroPolo`, `UserDo`, `XMLService`, `TCPUDPDeal`
- Method names, parameter names, member variables, and local variables in `lowerCamelCase`
- Constants in `UPPER_SNAKE_CASE` with full semantic meaning (e.g., `MAX_STOCK_COUNT` not `MAX_COUNT`)
- Abstract class names start with `Abstract` or `Base`; exception classes end with `Exception`; test classes end with `Test`
- Array brackets attach to type: `String[] args` not `String args[]`
- Boolean POJO fields must NOT use `is` prefix — causes serialization errors in RPC frameworks
  - Negative: `boolean isDeleted` generates `isDeleted()` method, framework infers field name as `deleted`
- Package names: all lowercase, one English word per dot segment, singular form
- No random abbreviations (e.g., `AbsClass` for `AbstractClass` is forbidden)
- Service and DAO implementations must end with `Impl` (e.g., `CacheServiceImpl` implements `CacheService`)

## Recommended

- Use complete words for self-documenting names (e.g., `PullCodeFromRemoteRepository`)
- Reflect design patterns in names: `OrderFactory`, `LoginProxy`, `ResourceObserver`
- No modifiers on interface method signatures (no `public abstract`); keep interfaces clean
- If interface describes ability, use adjective name (e.g., `Translatable`)
- Enum class names end with `Enum`; members in `UPPER_SNAKE_CASE`
- Service/DAO method prefixes: `get` (single), `list` (multiple), `count` (statistics), `save`/`insert`, `remove`/`delete`, `update`
- Domain models: `xxxDO` (data), `xxxDTO` (transfer), `xxxVO` (view); never name `xxxPOJO`
