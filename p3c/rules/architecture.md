---
paths:
  - "**/*.java"
  - "**/pom.xml"
  - "**/build.gradle"
---

# P3C: Project Architecture Rules

## Application Layers

- Standard layer hierarchy (top depends on bottom):
  - Open API Layer → Web Layer → Service Layer → Manager Layer → DAO Layer
- Manager Layer handles: third-party integration wrapping, common Service capabilities, multi-DAO composition
- Domain model types:
  - `DO` (Data Object): maps to DB table, used by DAO
  - `DTO` (Data Transfer Object): Service/Manager output
  - `BO` (Business Object): Service-level business logic
  - `VO` (View Object): Web → template rendering
  - `Query`: query parameters (>2 params must be wrapped, never use Map)

## Exception Handling by Layer

- DAO: catch all as `DAOException`, don't log (logged upstream)
- Service: must log errors with parameters to disk
- Web: never throw upward; redirect to friendly error page
- Open API: convert exceptions to error codes + messages

## Dependencies — Mandatory

- GAV format: GroupId `com.{company}.{business}[.{sub-business}]` (max 4 levels); ArtifactId `product-module`
- Semver: `major.minor.patch`, starting at `1.0.0`
- No SNAPSHOT dependencies in production
- Verify dependency resolution unchanged after library upgrades (`dependency:resolve` diff)
- No enums in interface return types (serialization issues across versions)
- Use version variables for related dependency groups (`${spring.version}`)
- No conflicting versions of same GroupId:ArtifactId across sub-modules

## Server — Recommended

- Reduce TCP `time_wait` timeout for high-concurrency: `net.ipv4.tcp_fin_timeout = 30`
- Increase max file descriptors for high-connection servers
- Set JVM flags: `-XX:+HeapDumpOnOutOfMemoryError`, `-Xms` = `-Xmx` in production
