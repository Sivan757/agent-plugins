# Advanced Kotlin Patterns for Migration

## Scope Functions

Replace verbose Java patterns with concise scope functions:

| Function | Context object | Return value | Use case |
|---|---|---|---|
| `let` | `it` | Lambda result | Null-safe transformation |
| `run` | `this` | Lambda result | Object configuration + compute |
| `apply` | `this` | Context object | Object initialization |
| `also` | `it` | Context object | Side effects (logging, validation) |
| `with` | `this` | Lambda result | Grouping calls on an object |

### Practical Examples

```kotlin
// let — null-safe chain
val displayName = user?.let { "${it.firstName} ${it.lastName}" } ?: "Anonymous"

// apply — object initialization (replaces builder pattern)
val config = HttpClientConfig().apply {
    connectTimeout = Duration.ofSeconds(5)
    readTimeout = Duration.ofSeconds(30)
    retryCount = 3
}

// also — side effects without changing the object
fun createOrder(request: CreateOrderRequest): Order =
    orderRepository.save(request.toEntity())
        .also { log.info("Created order: {}", it.id) }
        .also { eventPublisher.publishEvent(OrderCreatedEvent(it.id)) }

// run — execute block and return result
val connection = dataSource.run {
    connection.apply {
        autoCommit = false
        transactionIsolation = Connection.TRANSACTION_READ_COMMITTED
    }
}
```

## Delegation

Replace Java inheritance and decorator patterns:

```kotlin
// Property delegation — lazy initialization
class ExpensiveService {
    val heavyResource: Resource by lazy {
        Resource.load()  // computed only on first access
    }
}

// Interface delegation — replaces decorator pattern
class LoggingRepository(
    private val delegate: BookRepository
) : BookRepository by delegate {
    // Only override methods that need logging
    override suspend fun save(book: Book): Book {
        log.info("Saving book: {}", book.name)
        return delegate.save(book)
    }
}

// Map delegation — dynamic properties
class Config(private val map: Map<String, Any>) {
    val host: String by map
    val port: Int by map
    val timeout: Long by map
}
```

## Inline Classes (Value Classes)

Replace primitive obsession without runtime overhead:

```kotlin
// Java — raw Long everywhere, easy to mix up parameters
// processOrder(Long orderId, Long customerId, Long productId)

// Kotlin — type-safe wrappers with zero runtime cost
@JvmInline
value class OrderId(val value: Long)

@JvmInline
value class CustomerId(val value: Long)

@JvmInline
value class ProductId(val value: Long)

// Now impossible to pass wrong ID type
fun processOrder(orderId: OrderId, customerId: CustomerId, productId: ProductId)
```

## Reified Generics

Replace Java's type erasure workarounds:

```kotlin
// Java — requires Class<T> parameter
public <T> T parseJson(String json, Class<T> type) {
    return objectMapper.readValue(json, type);
}
parseJson(json, Order.class);

// Kotlin — reified type parameter, no Class<T> needed
inline fun <reified T> parseJson(json: String): T =
    objectMapper.readValue(json, T::class.java)

parseJson<Order>(json)  // cleaner call site
```

## DSL Builders

Replace Java builder pattern with Kotlin DSL:

```kotlin
// Type-safe builder DSL
class QueryBuilder {
    private val conditions = mutableListOf<String>()
    private var limit: Int? = null

    fun where(condition: String) { conditions += condition }
    fun limit(n: Int) { limit = n }
    fun build(): String = buildString {
        append("SELECT * FROM orders")
        if (conditions.isNotEmpty()) {
            append(" WHERE ")
            append(conditions.joinToString(" AND "))
        }
        limit?.let { append(" LIMIT $it") }
    }
}

fun query(block: QueryBuilder.() -> Unit): String =
    QueryBuilder().apply(block).build()

// Usage
val sql = query {
    where("status = 'ACTIVE'")
    where("amount > 100")
    limit(10)
}
```

## Coroutine Patterns for Migration

### Thread Pool → Coroutine Dispatcher

```java
// Java
ExecutorService executor = Executors.newFixedThreadPool(10);
Future<Result> future = executor.submit(() -> heavyComputation());
```

```kotlin
// Kotlin
val result = withContext(Dispatchers.Default) {
    heavyComputation()
}
```

### Parallel Execution

```java
// Java
CompletableFuture<User> userFuture = userService.findAsync(userId);
CompletableFuture<List<Order>> ordersFuture = orderService.findByUserAsync(userId);
CompletableFuture.allOf(userFuture, ordersFuture).join();
```

```kotlin
// Kotlin
coroutineScope {
    val user = async { userService.findById(userId) }
    val orders = async { orderService.findByUser(userId) }
    UserWithOrders(user.await(), orders.await())
}
```

### Error Handling

```java
// Java
try {
    return CompletableFuture.completedFuture(process(input));
} catch (Exception e) {
    return CompletableFuture.failedFuture(e);
}
```

```kotlin
// Kotlin
suspend fun process(input: Input): Result =
    runCatching { doProcess(input) }
        .onFailure { log.error("Processing failed", it) }
        .getOrThrow()
```

## Collection Conversion Patterns

| Java | Kotlin |
|---|---|
| `Collections.unmodifiableList(list)` | `list.toList()` or just `listOf(...)` |
| `Collections.singletonList(item)` | `listOf(item)` |
| `Collections.emptyList()` | `emptyList()` |
| `list.stream().collect(Collectors.toMap(...))` | `list.associate { it.key to it.value }` |
| `list.stream().collect(Collectors.groupingBy(...))` | `list.groupBy { it.category }` |
| `list.stream().flatMap(...)` | `list.flatMap { it.items }` |
| `list.stream().anyMatch(...)` | `list.any { it.isActive }` |
| `list.stream().allMatch(...)` | `list.all { it.isValid }` |
| `list.stream().noneMatch(...)` | `list.none { it.isDeleted }` |
| `list.stream().findFirst().orElse(null)` | `list.firstOrNull()` |
