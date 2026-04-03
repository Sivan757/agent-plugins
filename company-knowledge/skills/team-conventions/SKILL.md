---
name: team-conventions
description: >-
  This skill should be used when the user asks about "API design rules",
  "database conventions", "naming conventions", "table design", "Git workflow",
  "branch strategy", "project setup", "local dev environment",
  "commit message format", "code standards", "MySQL conventions",
  "RabbitMQ naming", "deployment process", "Spring Boot 3 upgrade",
  or works on any code that should follow Aikero team development standards.
version: 0.2.0
---

# Aikero Team Conventions

Authoritative team-wide development standards for Aikero projects. When writing or reviewing code, apply these conventions automatically. For full documentation, see the [Aikero Docs Site](https://aikero-docs.robotees.tech).

## API Standards

### URL Structure

Pattern: `/service-route/client-version/module/action`

| Segment | Rule | Example |
|---------|------|---------|
| service-route | Service name, hyphen-separated | `yunbanfang-demand` |
| client-version | Client type + API version | `web/v1`, `app/v2` |
| module | Business module | `demand`, `order` |
| action | Operation verb | `create`, `page`, `detail` |

Full example: `/yunbanfang-demand/web/v1/demand/create`

Rules:
- All lowercase, hyphen-separated multi-word segments
- No plurals (use `/order`, not `/orders`)
- No trailing slashes

### Controller Method Naming

| Method name | Meaning | Return type |
|-------------|---------|-------------|
| `page` | Paginated list | `DataResponse<IPage<T>>` |
| `list` | Simple non-paginated list | `DataResponse<List<T>>` |
| `detail` | Single entity detail | `DataResponse<T>` |
| `create` | Create new entity | `DataResponse<Long>` or `DataResponse<T>` |
| `update` | Update existing entity | `DataResponse<Boolean>` |
| `delete` | Delete entity | `DataResponse<Boolean>` |

Prefer shared endpoints with strategy pattern to handle client-specific differences rather than duplicating endpoints per client.

### Request/Response Entity Naming

Class-level suffixes:
- `Req` suffix for request entities: `OrderInfoReq`, `DemandCreateReq`
- `Vo` suffix for response entities: `OrderDetailVo`, `DemandPageVo`

Field-level rule -- NEVER use suffixes in field names:
```java
// WRONG - suffix in field name
private OrderDetailVo orderDetailVo;

// RIGHT - no suffix in field name
private OrderDetailVo orderDetail;
```

### Service Layer Rules

1. **Service handles data processing and returns data objects** -- never HTTP-specific wrappers
2. **NEVER return `DataResponse` from service layer** -- that is the controller's responsibility
3. **Throw custom exceptions for validation errors** -- service layer throws, controller/global handler catches
4. **Controller wraps results** in `DataResponse<T>` (see blade-framework skill for details)

```java
// Service -- returns data, throws on error
public OrderDetailVo getOrderDetail(Long orderId) {
    Order order = orderRepository.findById(orderId)
        .orElseThrow(() -> new BusinessException("Order not found"));
    return OrderDetailVo.from(order);
}

// Controller -- wraps in DataResponse
@GetMapping("/detail")
public DataResponse<OrderDetailVo> detail(@RequestParam Long orderId) {
    return DataResponse.success(orderService.getOrderDetail(orderId));
}
```

## Database Conventions (MySQL 8.0.28)

### Character Set

All databases and tables: `utf8mb4` character set, `utf8mb4_general_ci` collation.

### Table Naming

- Lowercase + underscores, no plurals (`order_item`, not `OrderItems`)
- Partitioned/sharded tables: append number suffix (`order_item_01`, `order_item_02`)
- Every table MUST have a comment describing its purpose
- Engine: InnoDB (always)

### Mandatory Fields

Every table MUST include these fields (except pure join/mapping tables):

| Field | Type | Constraint | Note |
|-------|------|------------|------|
| `id` | `bigint unsigned` | PRIMARY KEY, NOT NULL | First field in every table |
| `creator_id` | `bigint unsigned` | NOT NULL | Who created the record |
| `created_time` | `datetime` | NOT NULL | When the record was created |
| `reviser_id` | `bigint unsigned` | nullable | Who last modified |
| `revised_time` | `datetime` | nullable | When last modified |
| `deleted` | `tinyint unsigned` | NOT NULL, DEFAULT 0 | Logical delete: 1=deleted, 0=active |

### Optional Standard Fields

| Field | Type | Note |
|-------|------|------|
| `creator_name` | `varchar(20)` | Human-readable creator name |
| `reviser_name` | `varchar(20)` | Human-readable reviser name |
| `enabled` | `tinyint unsigned` | Enable/disable: 1=enabled, 0=disabled |

### Field Rules

- **No `is_` prefix** for boolean fields: use `deleted`, not `is_deleted`; use `enabled`, not `is_enabled`
- **Use `decimal`** for money and precision values (never `float` or `double`)
- **`varchar` max length: 5000** -- for longer text, use BLOB/TEXT in a separate extension table
- **Every field MUST have a comment** via `COMMENT` clause
- **Max field name length: 32 characters**
- **Field type must match across tables** when representing the same data (e.g., `user_id` is always `bigint unsigned`)

### Index Rules

Naming convention:
| Prefix | Index type |
|--------|-----------|
| `pk_xxx` | Primary key |
| `uk_xxx` | Unique index |
| `fk_xxx` | Foreign key reference (index only, no constraint) |
| `idx_xxx` | Regular index |

Rules:
- Index type: BTREE
- Max 5 indexes per table
- Create unique index for business-unique fields
- **No foreign key constraints** -- use regular indexes on FK columns (e.g., `idx_order_id` on `order_id`)
- VARCHAR indexes must specify length
- Use `count(*)` not `count(field_name)` in SQL queries

See `references/database.md` for complete SQL examples and ALTER TABLE statements.

## Git Workflow

### Branch Types

| Branch | Purpose | Created from | Merges to |
|--------|---------|-------------|-----------|
| `main` | Stable trunk | -- | Receives MR from `release` only |
| `release` | CI auto-creates after main merge | `main` | `main` |
| `feature/xxx` | New features | `main` | `qa`, `uat`, then `release` |
| `hotfix/xxx` | Urgent production fixes | `main` | `qa`, `uat`, then `release` |
| `qa` | Test environment | -- | Merge-only, no direct push |
| `uat` | Demo/UAT environment | -- | Merge-only, no direct push |

### Flow

```
feature/xxx ──┬──> qa (testing)
              ├──> uat (demo)
              └──> release ──> main
```

No direct push to `main`, `qa`, or `uat`. CI auto-generates changelog, tags, and releases after merge to `main`.

### Commit Message Format (Conventional Commits)

| Prefix | Use for |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `doc:` | Documentation |
| `perf:` | Performance improvement |
| `refactor:` | Code restructuring (no behavior change) |
| `style:` | Formatting, whitespace (no logic change) |
| `test:` | Adding or updating tests |
| `chore:` | Build, deps, tooling |
| `ci:` | CI/CD changes |

### CI/CD Configuration

All projects use shared GitLab CI templates:

```yaml
include:
  - project: 'aikero/devops/ci-templates'
    ref: main
    file: 'pipeline.yml'
```

See [GitLab CI/CD Setup](https://aikero-docs.robotees.tech/conventions/other/add_git_ci.html) for integration steps.

## RabbitMQ Naming

All lowercase. Underscore (`_`) for multi-word within a segment, dot (`.`) as segment separator.

| Component | Pattern | Example |
|-----------|---------|---------|
| Exchange | `<business>.<system>.<module_function>` | `yunbanfang.cutting.notification` |
| Queue | `q.<business>.<system>.<module_function>` | `q.yunbanfang.finance.create_order_event` |
| Routing key | `r.<business>.<system>.<module_function>` | `r.yunbanfang.finance.pay_success` |

Use `Jackson2JsonMessageConverter` for JSON message serialization.

See [RabbitMQ Conventions](https://aikero-docs.robotees.tech/conventions/mq/RabbitMQ.html) for full details.

## Project Structure (Gradle)

```
project/
├── project-common/       # Shared code, reusable across modules
├── project-sdk/          # Pure Feign interfaces for inter-service calls
├── project-service/      # Controllers, services, repositories, config
├── build.gradle.kts
├── settings.gradle.kts
├── gradle.properties     # group, version, frameworkVersion
└── gradle/wrapper/
```

### SDK Module Rules

- Minimal dependencies -- only Feign interfaces and DTOs
- `compileOnly` for Feign annotations (consumers provide their own Feign runtime)
- No business logic, no Spring beans, no configuration

See [Project Structure](https://aikero-docs.robotees.tech/conventions/other/project.html) for full details.

## Local Development

### Docker Compose Middleware

Local development uses Docker Compose for: Redis, RabbitMQ, Nacos, MinIO.

Environment variable prefix: `LOCAL_DOCKER_*` -- avoids Spring Cloud auto-detection conflicts with service discovery.

### Configuration Loading

Use `JDK_JAVA_OPTIONS` or `spring.config.import` for layered config:

```yaml
spring:
  config:
    import:
      - optional:file:./bootstrap.yml
      - optional:nacos:common-configuration.yml
      - optional:nacos:${spring.application.name}.yml
```

See [Local Startup Guide](https://aikero-docs.robotees.tech/conventions/other/projectLocalStart.html) for Docker Compose files and full setup.

## Reference Docs

Full documentation at the Aikero docs site:

- [API Standards](https://aikero-docs.robotees.tech/conventions/other/api.html)
- [MySQL Conventions](https://aikero-docs.robotees.tech/conventions/db/Mysql.html)
- [PostgreSQL](https://aikero-docs.robotees.tech/conventions/db/postgresql.html)
- [MongoDB](https://aikero-docs.robotees.tech/conventions/db/MongoDB.html)
- [ElasticSearch](https://aikero-docs.robotees.tech/conventions/db/ElasticSearch.html)
- [RabbitMQ](https://aikero-docs.robotees.tech/conventions/mq/RabbitMQ.html)
- [Git Branch Management](https://aikero-docs.robotees.tech/conventions/other/git.html)
- [Branch Merge Guide](https://aikero-docs.robotees.tech/conventions/other/git_branch_use.html)
- [GitLab CI/CD Setup](https://aikero-docs.robotees.tech/conventions/other/add_git_ci.html)
- [Project Structure](https://aikero-docs.robotees.tech/conventions/other/project.html)
- [Local Startup](https://aikero-docs.robotees.tech/conventions/other/projectLocalStart.html)
- [Dev Process](https://aikero-docs.robotees.tech/conventions/other/process.html)
- [Spring Boot 3 Upgrade](https://aikero-docs.robotees.tech/conventions/other/upgrade-sb3.html)
- [YApi Integration](https://aikero-docs.robotees.tech/conventions/other/yapi.html)

## Reference Files

For detailed conventions with SQL examples and code patterns, consult:
- **`references/database.md`** -- Detailed MySQL table design standards with SQL examples, plus notes on PostgreSQL, MongoDB, and ElasticSearch
- **`references/api-design.md`** -- API patterns, controller/service conventions, FeignClient, DAO layer, YApi integration
