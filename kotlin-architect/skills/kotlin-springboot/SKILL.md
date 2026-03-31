---
name: kotlin-springboot
description: >-
  This skill should be used when the user asks to "create a Spring Boot project
  in Kotlin", "design a REST API", "set up dependency injection", "write a
  service layer", "configure Spring Security", "write controller tests",
  "add validation", "implement exception handling", "use coroutines with Spring",
  "design domain models", "structure a Kotlin Spring Boot project", or works on
  any Kotlin + Spring Boot backend code. Provides opinionated, architect-level
  guidance for idiomatic Kotlin Spring Boot applications.
version: 0.1.0
---

# Kotlin Spring Boot Architecture

Opinionated architectural guidance for building production-grade Spring Boot applications in idiomatic Kotlin. Kotlin-first: always prefer Kotlin idioms over Java patterns.

## Core Principles

1. **Immutability by default** — `val` everywhere, `var` only when Spring requires mutability
2. **Constructor injection only** — never field injection, never setter injection
3. **Data classes for DTOs** — automatic `equals()`, `hashCode()`, `toString()`, `copy()`
4. **Sealed classes for domain states** — exhaustive `when` matching, compiler-enforced safety
5. **Coroutines for async** — `suspend` functions, structured concurrency, no `CompletableFuture`
6. **Package by feature** — `com.example.app.order`, not `com.example.app.controller`

## Project Structure

```
src/main/kotlin/com/example/app/
├── config/                    # Spring configuration classes
├── common/                    # Shared utilities, extensions, base classes
│   ├── exception/             # Custom exceptions + global handler
│   └── extension/             # Extension functions
├── order/                     # Feature package
│   ├── OrderController.kt
│   ├── OrderService.kt
│   ├── OrderRepository.kt
│   ├── Order.kt               # Entity (Jimmer interface or JPA class)
│   ├── OrderDto.kt            # Request/response DTOs
│   └── OrderMapper.kt         # Entity ↔ DTO mapping
└── user/                      # Another feature package
```

## Layer Patterns

### Controllers

```kotlin
@RestController
@RequestMapping("/api/v1/orders")
class OrderController(
    private val orderService: OrderService  // constructor injection
) {
    @GetMapping("/{id}")
    suspend fun getOrder(@PathVariable id: Long): ResponseEntity<OrderResponse> =
        orderService.findById(id)
            ?.let { ResponseEntity.ok(it.toResponse()) }
            ?: throw ResourceNotFoundException("Order", id)

    @PostMapping
    suspend fun createOrder(
        @Valid @RequestBody request: CreateOrderRequest
    ): ResponseEntity<OrderResponse> =
        orderService.create(request)
            .toResponse()
            .let { ResponseEntity.status(HttpStatus.CREATED).body(it) }
}
```

Key rules:
- One controller per aggregate root
- Use `suspend` for all endpoint functions
- Validate with `@Valid` on request body
- Return `ResponseEntity` for explicit HTTP semantics
- Map entities to DTOs at the controller boundary

### Services

```kotlin
@Service
class OrderService(
    private val orderRepository: OrderRepository,
    private val eventPublisher: ApplicationEventPublisher
) {
    @Transactional
    suspend fun create(request: CreateOrderRequest): Order {
        val order = request.toEntity()
        return orderRepository.save(order).also {
            eventPublisher.publishEvent(OrderCreatedEvent(it))
        }
    }

    @Transactional(readOnly = true)
    suspend fun findById(id: Long): Order? =
        orderRepository.findByIdOrNull(id)
}
```

Key rules:
- Stateless services, no mutable state
- `@Transactional` at method level, `readOnly = true` for queries
- Return nullable types (`Order?`) instead of throwing for missing entities
- Use `also`, `let`, `run` for side effects and transformations

### DTOs

```kotlin
data class CreateOrderRequest(
    @field:NotBlank val customerName: String,
    @field:Positive val amount: BigDecimal,
    @field:Size(min = 1) val items: List<OrderItemRequest>
)

data class OrderResponse(
    val id: Long,
    val customerName: String,
    val amount: BigDecimal,
    val status: OrderStatus,
    val createdAt: Instant
)
```

Key rules:
- `data class` for all DTOs
- `@field:` prefix for validation annotations (Kotlin requirement)
- Separate request and response DTOs
- No entity exposure in API responses

### Exception Handling

```kotlin
@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleNotFound(ex: ResourceNotFoundException): ResponseEntity<ErrorResponse> =
        ErrorResponse(status = 404, message = ex.message ?: "Not found")
            .let { ResponseEntity.status(HttpStatus.NOT_FOUND).body(it) }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val errors = ex.bindingResult.fieldErrors.associate { it.field to (it.defaultMessage ?: "") }
        return ErrorResponse(status = 400, message = "Validation failed", errors = errors)
            .let { ResponseEntity.badRequest().body(it) }
    }
}

data class ErrorResponse(
    val status: Int,
    val message: String,
    val errors: Map<String, String> = emptyMap(),
    val timestamp: Instant = Instant.now()
)
```

### Testing

```kotlin
@WebMvcTest(OrderController::class)
class OrderControllerTest {
    @Autowired private lateinit var mockMvc: MockMvc
    @MockkBean private lateinit var orderService: OrderService

    @Test
    fun `should return order by id`() {
        val order = buildOrder(id = 1L)
        coEvery { orderService.findById(1L) } returns order

        mockMvc.get("/api/v1/orders/1")
            .andExpect { status { isOk() } }
            .andExpect { jsonPath("$.id") { value(1) } }
    }
}
```

Key rules:
- MockK over Mockito — Kotlin-native mocking
- Backtick test names for readability
- `@WebMvcTest` for controller slice tests
- Testcontainers for integration tests with real databases
- `coEvery`/`coVerify` for coroutine mocking

### Logging

```kotlin
class OrderService(...) {
    companion object {
        private val log = LoggerFactory.getLogger(OrderService::class.java)
    }

    fun process(orderId: Long) {
        log.info("Processing order {}", orderId)  // parameterized, not string interpolation
    }
}
```

## Coroutines Integration

- Use `suspend` functions in controllers and services
- `suspend` + `@Transactional` requires Spring WebFlux with coroutine support — not available in standard Spring MVC
- Use `coroutineScope` or `supervisorScope` for parallel operations
- Never use `GlobalScope` or `runBlocking` in production code
- Use `Flow` for reactive streams
- Use `withContext(Dispatchers.IO)` for blocking I/O operations

## Configuration

```kotlin
@ConfigurationProperties(prefix = "app.order")
data class OrderProperties(
    val maxItems: Int = 100,
    val defaultCurrency: String = "USD",
    val retryAttempts: Int = 3
)
```

- `@ConfigurationProperties` with `data class` for type-safe config
- `application.yml` over `.properties` for readability
- Spring profiles for environment-specific config

## Additional Resources

### Reference Files

For detailed patterns and advanced techniques, consult:
- **`references/patterns.md`** — Advanced architectural patterns (CQRS, event sourcing, hexagonal architecture)
- **`references/security.md`** — Spring Security with Kotlin (JWT, OAuth2, method security)
- **`references/testing.md`** — Comprehensive testing strategies (MockK, Testcontainers, Kotest)
