---
name: java-to-kotlin
description: >-
  This skill should be used when the user asks to "migrate Java to Kotlin",
  "convert Java code to Kotlin", "rewrite in Kotlin", "kotlinize this code",
  "migrate Spring Boot from Java to Kotlin", "convert JPA entity to Jimmer",
  "replace Java patterns with Kotlin idioms", "adopt coroutines",
  "convert callbacks to suspend functions", "modernize Java code",
  or works on migrating any Java codebase to Kotlin.
version: 0.2.0
model: sonnet
---

# Java to Kotlin Migration

Comprehensive, opinionated guide for migrating Java Spring Boot applications to idiomatic Kotlin. The goal is not just syntax conversion — it is architectural modernization.

## Migration Strategy

### Phased Approach

1. **Build system first** — Convert `build.gradle` to Kotlin DSL, add Kotlin plugins
2. **Shared code** — Add `kotlin("jvm")` plugin, Kotlin and Java coexist in same project
3. **Models & DTOs** — Convert POJOs to `data class` (lowest risk, highest impact)
4. **Services** — Convert business logic, adopt null safety and extension functions
5. **Controllers** — Convert REST endpoints, adopt coroutines
6. **Repositories** — Migrate from JPA classes to Jimmer interfaces (if applicable)
7. **Tests** — Convert to JUnit 5 + MockK + Kotest
8. **Remove Java** — Delete Java sources once all code is converted

### Aikero Blade Framework Migration

When migrating within the Blade framework, also adopt:
- **Blade starters** — replace manual Spring Boot dependencies with `blade-web-boot-spring-boot-starter`, `blade-auth-spring-boot-starter`, etc.
- **DataResponse<T>** — replace `ResponseEntity` with `toSuccess()` / `failure()` pattern
- **Auth annotations** — replace Spring Security with `@PreCheckPermission`, `@PreCheckRole`, `@PreCheckIgnore`
- **Jimmer ORM** — consider migrating from JPA to Jimmer interfaces (see jpa-to-jimmer reference)
- **Jakarta EE** — `javax.*` → `jakarta.*` (mandatory for Spring Boot 3.x)
- **Sa-Token** — use `sa-token-spring-boot3-starter` (not the boot2 version)

See the **blade-framework** skill for details. Upgrade guide: [Spring Boot 3 Upgrade](https://aikero-docs.robotees.tech/conventions/other/upgrade-sb3.html)

### Coexistence Rules

- Kotlin and Java files can coexist in the same project
- Kotlin can call Java and vice versa
- Place Kotlin in `src/main/kotlin`, Java stays in `src/main/java`
- Gradle compiles both — no special configuration needed

## Quick Conversion Reference

### Data Classes (POJOs → data class)

```java
// Java
public class OrderDto {
    private Long id;
    private String name;
    private BigDecimal amount;
    // + constructor, getters, setters, equals, hashCode, toString
}
```

```kotlin
// Kotlin — one line replaces ~50 lines of Java
data class OrderDto(
    val id: Long,
    val name: String,
    val amount: BigDecimal
)
```

### Null Safety (Optional → nullable types)

```java
// Java
Optional<Order> findById(Long id);
order.map(Order::getName).orElse("Unknown");
```

```kotlin
// Kotlin — native null safety, no Optional
fun findById(id: Long): Order?
order?.name ?: "Unknown"
```

Rules:
- Replace all `Optional<T>` with `T?`
- Replace `Optional.map()` with safe call `?.`
- Replace `Optional.orElse()` with elvis `?:`
- Never use `!!` unless the null case is truly impossible

### Sealed Classes (enum + visitor → sealed class)

```java
// Java — enum with behavior requires visitor pattern
public enum OrderStatus {
    PENDING, CONFIRMED, SHIPPED, CANCELLED;
}
// + separate switch/visitor for state-dependent logic
```

```kotlin
// Kotlin — sealed class with exhaustive when
sealed class OrderStatus {
    data object Pending : OrderStatus()
    data object Confirmed : OrderStatus()
    data class Shipped(val trackingNumber: String) : OrderStatus()
    data class Cancelled(val reason: String) : OrderStatus()
}

// Compiler enforces all cases handled
fun describe(status: OrderStatus): String = when (status) {
    is OrderStatus.Pending -> "Awaiting confirmation"
    is OrderStatus.Confirmed -> "Order confirmed"
    is OrderStatus.Shipped -> "Shipped: ${status.trackingNumber}"
    is OrderStatus.Cancelled -> "Cancelled: ${status.reason}"
}
```

### Extension Functions (static utility classes → extensions)

```java
// Java
public class StringUtils {
    public static String truncate(String s, int maxLen) {
        return s.length() <= maxLen ? s : s.substring(0, maxLen) + "...";
    }
}
StringUtils.truncate(name, 50);
```

```kotlin
// Kotlin
fun String.truncate(maxLen: Int): String =
    if (length <= maxLen) this else take(maxLen) + "..."

name.truncate(50)  // reads naturally
```

### Spring Dependency Injection

```java
// Java — field injection (anti-pattern even in Java)
@Service
public class OrderService {
    @Autowired private OrderRepository repository;
}
```

```kotlin
// Kotlin — constructor injection (idiomatic)
@Service
class OrderService(
    private val repository: OrderRepository  // val = immutable
)
```

### Callbacks → Coroutines

```java
// Java — callback hell
service.findOrder(id, order -> {
    service.findCustomer(order.getCustomerId(), customer -> {
        service.sendEmail(customer.getEmail(), result -> {
            // finally done
        });
    });
});
```

```kotlin
// Kotlin — sequential coroutine code
suspend fun processOrder(id: Long) {
    val order = service.findOrder(id)
    val customer = service.findCustomer(order.customerId)
    service.sendEmail(customer.email)
}
```

### CompletableFuture → Coroutines

```java
// Java
CompletableFuture<Order> findOrderAsync(Long id);
future.thenApply(order -> order.getName())
      .thenAccept(name -> log.info("Found: {}", name));
```

```kotlin
// Kotlin — suspend functions
suspend fun findOrder(id: Long): Order
val order = findOrder(id)
log.info("Found: {}", order.name)
```

### Streams → Collection Functions

```java
// Java
orders.stream()
    .filter(o -> o.getStatus() == Status.ACTIVE)
    .map(Order::getName)
    .collect(Collectors.toList());
```

```kotlin
// Kotlin — no stream() or collect() needed
orders.filter { it.status == Status.ACTIVE }.map { it.name }
```

Use `asSequence()` for large collections (lazy evaluation):
```kotlin
orders.asSequence().filter { it.status == Status.ACTIVE }.map { it.name }.toList()
```

## Spring-Specific Migration

### @ConfigurationProperties

```java
// Java
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private String name;
    private int maxRetries;
    // getters + setters
}
```

```kotlin
// Kotlin
@ConfigurationProperties(prefix = "app")
data class AppProperties(
    val name: String,
    val maxRetries: Int = 3
)
```

### Validation Annotations

```java
// Java
public class CreateOrderRequest {
    @NotBlank private String name;
}
```

```kotlin
// Kotlin — must use @field: prefix
data class CreateOrderRequest(
    @field:NotBlank val name: String
)
```

The `@field:` prefix is critical — without it, the annotation targets the constructor parameter, not the backing field, and validation won't work.

## Additional Resources

### Reference Files

For detailed migration patterns, consult:
- **`references/jpa-to-jimmer.md`** — Step-by-step guide for converting JPA entities and repositories to Jimmer interfaces
- **`references/advanced-patterns.md`** — Scope functions, delegation, inline classes, reified generics, DSL builders
