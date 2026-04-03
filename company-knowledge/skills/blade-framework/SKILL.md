---
name: blade-framework
description: >-
  This skill should be used when the user asks to "use Blade framework",
  "add a Blade starter", "use DataResponse", "configure auth annotations",
  "set up error reporting", "use CurrentUser", "configure user context",
  "add operation logging", "use OpLog", "configure serialization",
  "check Blade modules", "add Blade dependency", or works on any code
  involving the Aikero Blade framework, its starters, response protocol,
  authentication annotations, or user context management.
version: 0.2.0
---

# Blade Framework

Blade is Aikero's enterprise Spring Boot foundation framework (current version 3.2.0). Built on Kotlin 2.3.x + Spring Boot 3.5.x + Spring Cloud 2025.x. It provides unified dependency management, auto-configuration starters, and enterprise features including authentication, permissions, operation logging, error reporting, serialization, and more.

All Aikero backend services depend on Blade. When writing or modifying Aikero service code, follow the patterns documented here.

## DataResponse\<T\> -- Unified API Response

Every Aikero API endpoint MUST return `DataResponse<T>`. This is the standard response wrapper -- no exceptions.

```kotlin
data class DataResponse<T>(
    val successful: Boolean = false,
    val code: Int,
    val message: String = "",
    val data: T? = null
) : Serializable
```

### Extension functions (Kotlin-idiomatic, PREFERRED)

- `T?.toSuccess()` -- wrap any value as a success response (code=200, successful=true)
- `T?.toFailure(code, message)` -- wrap as failure response
- `T?.toSuccessIf(condition) { errorMessage }` -- conditional: success if condition is true, failure otherwise

### Top-level functions (Java-friendly)

- `success<T>()`, `success(data)` -- create success response
- `failure<T>()`, `failure(message)`, `failure(responseCode)` -- create failure response

### Response checking extensions

- `checkSuccess()` -- returns true if successful
- `checkFailure()` -- returns true if not successful
- `fetchData()` -- get data or throw exception if not successful
- `fetchDataOrNull()` -- get data or null if not successful
- `fetchDataOrHandle { failureResponse -> ... }` -- get data or handle failure
- `onSuccess { data -> ... }` -- execute block only on success
- `onFailure { response -> ... }` -- execute block only on failure

### NetworkCode enum

Standard response codes:

| Code | Name | Usage |
|------|------|-------|
| 200 | OK | Success |
| 400 | BAD_REQUEST | Invalid input |
| 401 | UNAUTHORIZED | Not authenticated |
| 403 | FORBIDDEN | No permission |
| 404 | NOT_FOUND | Resource missing |
| 409 | CONFLICT | Duplicate/conflict |
| 500 | SERVER_ERROR | Internal error |
| 600 | LOGIN_FAILED | Login credentials invalid |
| 601 | LOGIN_TIMEOUT | Session expired |

### Controller usage pattern

```kotlin
@RestController
@RequestMapping("/users")
class UserController {
    @PostMapping
    fun createUser(@RequestBody req: UserReq): DataResponse<UserReq> {
        if (exists(req.id)) return failure(NetworkCode.CONFLICT)
        save(req)
        return req.toSuccess()
    }

    @GetMapping
    fun getAllUsers(): DataResponse<List<UserReq>> =
        userRepository.getAll().toSuccess()

    @DeleteMapping("/{id}")
    fun deleteUser(@PathVariable id: Long): DataResponse<Unit> {
        if (!exists(id)) return failure(HttpStatus.NOT_FOUND.reasonPhrase)
        remove(id)
        return Unit.toSuccess()
    }
}
```

## Auth Annotations

Blade uses Sa-Token for authentication. Apply these annotations to controller methods and classes.

### @PreCheckPermission

Method-level permission check. The request is rejected with 403 if the user lacks the required permissions.

Parameters:
- `name` -- human-readable description of the permission check
- `value` -- array of permission codes, e.g. `["user.read", "user.write"]`
- `mode` -- `PreMode.AND` (all required, default) or `PreMode.OR` (any one sufficient)
- `orRole` -- array of roles that bypass the permission check

### @PreCheckRole

Role-based access check.

Parameters:
- `value` -- array of role codes
- `mode` -- `PreMode.AND` or `PreMode.OR`

### @PreCheckIgnore

Skip authentication entirely for a specific endpoint. Use for login endpoints, public APIs, and health checks.

### @PreAuth

Class-level annotation. The `replace` parameter defines a placeholder `{}` that child `@PreCheckPermission` annotations substitute into.

### Auth example

```kotlin
@RestController
@RequestMapping("/users")
class UserController(private val userRepository: UserRepository) {
    @GetMapping
    @PreCheckPermission("[examples.auth]权限示例", ["examples.auth.user.all"])
    fun getAllUsers(): DataResponse<List<UserReq>> =
        userRepository.getAllUsers().toSuccess()

    @PreCheckIgnore
    @DeleteMapping("/{id}")
    fun deleteUser(@PathVariable id: Long): DataResponse<Unit> {
        userRepository.deleteById(id)
        return Unit.toSuccess()
    }
}
```

## User Context

The `CurrentUser` data class represents the authenticated user for the current request.

```kotlin
data class CurrentUser(
    val id: Long,
    val name: String,
    val code: String,
    val tenantId: Long,
    val superAdmin: Boolean = false,
    val organizationId: Long? = null,
    var attributes: MutableMap<String, Any> = mutableMapOf()
)
```

### Access patterns

- `CurrentUserHolder.get()` -- get the current user (throws if not set)
- `CurrentUserHolder.getCurrentUserId()` -- convenience shortcut for the user ID
- `withUser(user) { ... }` -- execute a block in a specific user's context
- `withSystemUser { ... }` -- execute a block as the system user (for background jobs, migrations)

Uses `TransmittableThreadLocal` for async context propagation -- the user context is automatically available in child threads and coroutines.

## Operation Logging (@OpLog)

Declarative operation logging using SpEL expressions for dynamic log content.

```kotlin
@OpLog(
    success = "'下单成功订单号:' + #_return.data.orderNo + ' 订单ID(' + #_return.data.id + ')'",
    type = OpType.CREATE,
    bizId = "#_return.data.id",
    bizNo = "#_return.data.orderNo"
)
@PostMapping("/add")
fun add(@RequestBody req: OrderInfoAddReq): DataResponse<OrderInfo> =
    orderService.save(req.toEntity()).toSuccess()
```

### @OpLog parameters

- `success` -- SpEL expression for the success log message
- `fail` -- SpEL expression for the failure log message
- `type` -- OpType enum: CREATE, UPDATE, DELETE, QUERY, IMPORT, EXPORT, etc.
- `bizId` -- SpEL expression for business entity ID
- `bizNo` -- SpEL expression for business entity number

### SpEL variables available

- `#_return` -- the method return value
- `#req`, `#param0`, etc. -- method parameters by name or index
- `#_errorMsg` -- exception message (in fail expressions)

### @OpLogTag

Apply to the controller class for categorization:

```kotlin
@OpLogTag(category = "订单管理", subcategory = "订单操作")
@RestController
@RequestMapping("/orders")
class OrderController { ... }
```

Supports custom operators via SpEL or `OpLogContext.put()`. Operation logs are persisted via RabbitMQ (configurable).

## Serialization Conventions

Blade auto-configures Jackson with these rules:

- `Long` serialized as `String` in JSON output (prevents JavaScript precision loss for IDs > 2^53)
- `LocalDateTime` and `LocalDate` serialized as timestamps
- Null fields are included in output with default empty values (not omitted)
- Use `@field:` prefix for Bean Validation annotations in Kotlin data classes:

```kotlin
data class UserReq(
    @field:NotBlank(message = "Name is required")
    val name: String,
    @field:Email(message = "Invalid email")
    val email: String
)
```

## Logging

```kotlin
import team.aikero.blade.logging.core.log

// Lambda-based logging (PREFERRED -- avoids string concatenation when level is disabled)
log.info { "Get all users: ${users.toJson()}" }
log.debug { "Processing order: $orderId" }
log.error(exception) { "Failed to process order: $orderId" }

// JSON serialization helper
import team.aikero.blade.util.json.toJson
```

Always use lambda-based logging. Never use `log.info("message: $variable")` -- the string is always evaluated even when the log level is disabled.

## Sensitive Data Masking

Apply `@Sensitive` to data class fields for automatic masking during serialization:

```kotlin
data class UserInfo(
    val name: String,
    @Sensitive(type = SensitiveType.MOBILE_PHONE)
    val phone: String,
    @Sensitive(type = SensitiveType.EMAIL)
    val email: String
)
```

Available `SensitiveType` values: MOBILE_PHONE, ID_CARD, EMAIL, BANK_CARD, ADDRESS, CHINESE_NAME, PASSWORD, etc.

## Reference Docs

For detailed documentation, consult the Aikero docs site:

- [Blade Framework Overview](https://aikero-docs.robotees.tech/blade/)
- [Module Index](https://aikero-docs.robotees.tech/blade/modules/)
- [Authentication](https://aikero-docs.robotees.tech/blade/modules/user_auth.html)
- [API Response Structure](https://aikero-docs.robotees.tech/blade/modules/api_struct.html)
- [Serialization](https://aikero-docs.robotees.tech/blade/modules/serialization.html)
- [Error Reporting](https://aikero-docs.robotees.tech/blade/modules/error_report.html)
- [Logging](https://aikero-docs.robotees.tech/blade/modules/logging.html)
- [Operation Logs](https://aikero-docs.robotees.tech/blade/modules/oplog.html)
- [Sensitive Data](https://aikero-docs.robotees.tech/blade/modules/sensitive.html)
- [XSS Protection](https://aikero-docs.robotees.tech/blade/modules/xss_protect.html)
- [Data Permission](https://aikero-docs.robotees.tech/blade/modules/data-permission.html)
- [Distributed Lock](https://aikero-docs.robotees.tech/blade/modules/lock.html)
- [File Support](https://aikero-docs.robotees.tech/blade/modules/file_support.html)
- [Cache (Redis)](https://aikero-docs.robotees.tech/blade/modules/cache.html)
- [Feign Integration](https://aikero-docs.robotees.tech/blade/modules/feign.html)
- [Gateway](https://aikero-docs.robotees.tech/blade/modules/gateway.html)
- [MQ Starter](https://aikero-docs.robotees.tech/blade/modules/mq_starter.html)
- [ID Generation](https://aikero-docs.robotees.tech/blade/modules/id_gen.html)

## Reference Files

For module inventory and starter details, see:

- `references/modules.md` -- Complete base module inventory with packages and purposes
- `references/starters.md` -- All 26 starters with configuration examples and dependency patterns
