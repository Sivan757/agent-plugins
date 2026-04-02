# Blade Base Modules

Blade's base modules provide the core building blocks that starters assemble into auto-configured features. Import these directly only when you need fine-grained control; in most cases, use the corresponding starter instead.

| Module | Package | Purpose | Doc Link |
|--------|---------|---------|----------|
| blade-core | team.aikero.blade.core | Core utilities, exception handling, constants | - |
| blade-core-protocol | team.aikero.blade.core.protocol | DataResponse\<T\>, ResponseCode, NetworkCode | [API Structure](https://aikero-docs.robotees.tech/blade/modules/api_struct.html) |
| blade-auth | team.aikero.blade.auth | Auth annotations (@PreCheckPermission, @PreCheckRole, @PreCheckIgnore), UserContexts | [Authentication](https://aikero-docs.robotees.tech/blade/modules/user_auth.html) |
| blade-user | team.aikero.blade.user | CurrentUser, CurrentUserHolder, TokenContent, Role, Permission | [Authentication](https://aikero-docs.robotees.tech/blade/modules/user_auth.html) |
| blade-util | team.aikero.blade.util | Common utilities (JSON, IO, etc.) | - |
| blade-jackson | team.aikero.blade.jackson | Jackson serialization config (Long to String, DateTime to timestamp) | [Serialization](https://aikero-docs.robotees.tech/blade/modules/serialization.html) |
| blade-logging-core | team.aikero.blade.logging.core | Logging infrastructure, `log` extension | [Logging](https://aikero-docs.robotees.tech/blade/modules/logging.html) |
| blade-data-permission | team.aikero.blade.data.permission | Row-level data permission control | [Data Permission](https://aikero-docs.robotees.tech/blade/modules/data-permission.html) |
| blade-oplog | team.aikero.blade.oplog | @OpLog annotation, SpEL-based operation logging | [OpLog](https://aikero-docs.robotees.tech/blade/modules/oplog.html) |
| blade-file | team.aikero.blade.file | File handling, validation, archive parsing, OSS operations | [File Support](https://aikero-docs.robotees.tech/blade/modules/file_support.html) |
| blade-excel | team.aikero.blade.excel | Excel document operations (EasyExcel) | - |
| blade-feign | team.aikero.blade.feign | Enhanced Feign client with token relay, @InnerFeign | [Feign](https://aikero-docs.robotees.tech/blade/modules/feign.html) |
| blade-ksp | team.aikero.blade.ksp | KSP processor for version class generation | - |
| blade-versions | team.aikero.blade.versions | Version info generation and metadata | [Dependency Mgmt](https://aikero-docs.robotees.tech/blade/modules/dependence_manage.html) |

---

## DataResponse Protocol

Package: `team.aikero.blade.core.protocol`

All API endpoints return `DataResponse<T>`. Use the Kotlin extension functions for idiomatic code:

```kotlin
// Wrapping results
val response = user.toSuccess()                          // DataResponse(successful=true, code=200, data=user)
val error = user.toFailure(400, "Invalid input")         // DataResponse(successful=false, code=400, message="Invalid input")
val conditional = user.toSuccessIf(user.isActive) {      // success if active, failure otherwise
    "User is inactive"
}

// Top-level constructors (Java-friendly)
success(user)                                             // same as user.toSuccess()
failure<User>()                                           // empty failure
failure("Not found")                                      // failure with message
failure(NetworkCode.NOT_FOUND)                            // failure from NetworkCode enum

// Consuming responses
response.checkSuccess()                                   // Boolean
response.fetchData()                                      // T or throws
response.fetchDataOrNull()                                // T?
response.fetchDataOrHandle { resp ->                      // T or handle failure
    log.warn { "Failed: ${resp.message}" }
    defaultValue
}
response.onSuccess { data -> process(data) }              // execute on success
response.onFailure { resp -> alert(resp.message) }        // execute on failure
```

## Auth System

Package: `team.aikero.blade.auth`

### Annotations

**@PreCheckPermission(name, value, mode, orRole)**
- `name: String` -- human-readable description
- `value: Array<String>` -- permission codes (e.g. `["order.create", "order.write"]`)
- `mode: PreMode` -- AND (all required) or OR (any sufficient). Default: AND
- `orRole: Array<String>` -- roles that bypass the permission check entirely

**@PreCheckRole(value, mode)**
- `value: Array<String>` -- role codes
- `mode: PreMode` -- AND or OR

**@PreCheckIgnore**
No parameters. Exempts the annotated method from all auth checks.

**@PreAuth(replace)**
Class-level annotation. Defines a permission prefix with `{}` placeholder:
```kotlin
@PreAuth(replace = "order")
@RestController
@RequestMapping("/orders")
class OrderController {
    @PreCheckPermission("查看订单", ["{}.read"])    // resolves to "order.read"
    @GetMapping
    fun list(): DataResponse<List<Order>> = ...
}
```

## User Context

Package: `team.aikero.blade.user`

### CurrentUser fields

| Field | Type | Description |
|-------|------|-------------|
| id | Long | User ID |
| name | String | Display name |
| code | String | User code / login name |
| tenantId | Long | Tenant ID for multi-tenancy |
| superAdmin | Boolean | Whether user is super admin (default: false) |
| organizationId | Long? | Organization ID (nullable) |
| attributes | MutableMap\<String, Any\> | Extensible attributes map |

### Holder and DSL functions

```kotlin
// Read current user
val user = CurrentUserHolder.get()             // throws if not set
val userId = CurrentUserHolder.getCurrentUserId()

// Execute in a specific user context
withUser(someUser) {
    // CurrentUserHolder.get() returns someUser inside this block
    orderService.createOrder(req)
}

// Execute as system user (background jobs, migrations, scheduled tasks)
withSystemUser {
    migrationService.runMigration()
}
```

Context propagation: uses `TransmittableThreadLocal`, so the user context is automatically available in child threads, thread pools, and coroutine dispatchers.

## Operation Logging

Package: `team.aikero.blade.oplog`

### @OpLog annotation fields

| Field | Type | Description |
|-------|------|-------------|
| success | String | SpEL expression for success log message |
| fail | String | SpEL expression for failure log message |
| type | OpType | Operation type: CREATE, UPDATE, DELETE, QUERY, IMPORT, EXPORT, LOGIN, LOGOUT |
| bizId | String | SpEL expression for business entity ID |
| bizNo | String | SpEL expression for business entity number |
| condition | String | SpEL condition -- log only when true |

### SpEL variables

| Variable | Description |
|----------|-------------|
| `#_return` | Method return value |
| `#_errorMsg` | Exception message (in fail expressions) |
| `#paramName` | Method parameter by name |
| `#param0`, `#param1` | Method parameters by index |
| `#root` | Root evaluation context |

### @OpLogTag

Class-level categorization for operation logs:

```kotlin
@OpLogTag(category = "订单管理", subcategory = "订单操作")
@RestController
class OrderController { ... }
```

### Custom operator

```kotlin
// Set operator explicitly (overrides CurrentUser)
OpLogContext.put("operator", "System Scheduler")
```

Persistence: operation logs are published to RabbitMQ by default. The consumer and storage backend are configurable.

## Sensitive Data

Package: `team.aikero.blade.jackson` (via blade-sensitive-spring-boot-starter)

### @Sensitive annotation

Apply to data class fields. The value is automatically masked during JSON serialization.

```kotlin
data class CustomerInfo(
    val name: String,
    @Sensitive(type = SensitiveType.MOBILE_PHONE)
    val phone: String,          // "138****1234"
    @Sensitive(type = SensitiveType.ID_CARD)
    val idCard: String,         // "110***********1234"
    @Sensitive(type = SensitiveType.EMAIL)
    val email: String,          // "u***@example.com"
    @Sensitive(type = SensitiveType.BANK_CARD)
    val bankCard: String        // "6222 **** **** 1234"
)
```

### SensitiveType values

MOBILE_PHONE, ID_CARD, EMAIL, BANK_CARD, ADDRESS, CHINESE_NAME, PASSWORD, FIXED_PHONE, CAR_LICENSE, CUSTOM

## Distributed Lock

Package: `team.aikero.blade.lock` (via blade-lock-spring-boot-starter)

### @DistributedLock

Method-level distributed lock using Redis:

```kotlin
@DistributedLock(key = "'order:' + #orderId", waitTime = 5, leaseTime = 30)
fun processOrder(orderId: Long) { ... }
```

Parameters:
- `key` -- SpEL expression for the lock key
- `waitTime` -- seconds to wait for lock acquisition (default: 0, fail immediately)
- `leaseTime` -- seconds to hold the lock (default: 30)

### @NoRepeatSubmit

Prevents duplicate form submissions:

```kotlin
@NoRepeatSubmit(interval = 3000)  // 3-second interval
@PostMapping("/submit")
fun submitOrder(@RequestBody req: OrderReq): DataResponse<Order> = ...
```

Parameters:
- `interval` -- milliseconds between allowed submissions (default: 5000)

## ID Generation

Package: `team.aikero.blade.sequence` (via blade-sequence-spring-boot-starter)

Integrates CosId for distributed ID generation.

### MyBatis Plus auto-fill

```kotlin
@TableName("t_order")
data class Order(
    @TableId(type = IdType.ASSIGN_ID)  // CosId generates the ID
    val id: Long? = null,
    val orderNo: String,
    // ...
)
```

### Jimmer entity annotation

```kotlin
@Entity
interface Order {
    @Id
    @GeneratedValue(generatorType = CosIdGenerator::class)
    val id: Long
    // ...
}
```

### Programmatic ID generation

```kotlin
@Autowired
lateinit var idGenerator: IdGenerator

val newId = idGenerator.generate()
```
