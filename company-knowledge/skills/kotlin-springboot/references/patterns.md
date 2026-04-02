# Advanced Architectural Patterns

## Hexagonal Architecture (Ports & Adapters)

Organize Spring Boot applications with clear boundaries between domain logic and infrastructure:

```
feature/
├── domain/
│   ├── Order.kt              # Domain entity
│   ├── OrderStatus.kt        # Sealed class for states
│   └── OrderPort.kt          # Port interface (use case boundary)
├── application/
│   └── OrderService.kt       # Use case implementation
└── adapter/
    ├── inbound/
    │   └── OrderController.kt  # REST adapter
    └── outbound/
        └── OrderJimmerAdapter.kt  # Persistence adapter
```

### Port Definition

```kotlin
interface OrderPort {
    suspend fun findById(id: Long): Order?
    suspend fun save(order: Order): Order
    suspend fun findByStatus(status: OrderStatus): List<Order>
}
```

### Sealed Class for Domain States

```kotlin
sealed class OrderStatus {
    data object Pending : OrderStatus()
    data object Confirmed : OrderStatus()
    data class Shipped(val trackingNumber: String) : OrderStatus()
    data class Delivered(val deliveredAt: Instant) : OrderStatus()
    data class Cancelled(val reason: String) : OrderStatus()

    fun canTransitionTo(next: OrderStatus): Boolean = when (this) {
        is Pending -> next is Confirmed || next is Cancelled
        is Confirmed -> next is Shipped || next is Cancelled
        is Shipped -> next is Delivered
        is Delivered, is Cancelled -> false
    }
}
```

## CQRS Pattern

Separate read and write models for complex domains:

```kotlin
// Command side
@Service
class OrderCommandService(
    private val repository: OrderRepository,
    private val eventPublisher: ApplicationEventPublisher
) {
    @Transactional
    suspend fun placeOrder(command: PlaceOrderCommand): Long {
        val order = command.toDomain()
        val saved = repository.save(order)
        eventPublisher.publishEvent(OrderPlacedEvent(saved.id))
        return saved.id
    }
}

// Query side
@Service
class OrderQueryService(
    private val repository: OrderRepository
) {
    @Transactional(readOnly = true)
    suspend fun getOrderView(id: Long): OrderView? =
        repository.findById(id, ORDER_VIEW_FETCHER)?.toView()
}
```

## Event-Driven Communication

```kotlin
// Domain event
data class OrderPlacedEvent(val orderId: Long, val timestamp: Instant = Instant.now())

// Event listener
@Component
class OrderEventListener(
    private val notificationService: NotificationService
) {
    @Async
    @EventListener
    suspend fun onOrderPlaced(event: OrderPlacedEvent) {
        notificationService.sendOrderConfirmation(event.orderId)
    }
}
```

## Result Pattern for Error Handling

```kotlin
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Failure(val error: DomainError) : Result<Nothing>()

    fun <R> map(transform: (T) -> R): Result<R> = when (this) {
        is Success -> Success(transform(data))
        is Failure -> this
    }

    fun <R> flatMap(transform: (T) -> Result<R>): Result<R> = when (this) {
        is Success -> transform(data)
        is Failure -> this
    }
}

sealed class DomainError(val message: String) {
    class NotFound(entity: String, id: Any) : DomainError("$entity not found: $id")
    class ValidationFailed(message: String) : DomainError(message)
    class Conflict(message: String) : DomainError(message)
}
```

## Extension Functions for Domain Logic

```kotlin
// Keep domain logic close to the data
fun Order.totalWithTax(taxRate: BigDecimal): BigDecimal =
    amount * (BigDecimal.ONE + taxRate)

fun List<Order>.totalRevenue(): BigDecimal =
    sumOf { it.amount }

fun Order.isOverdue(): Boolean =
    status is OrderStatus.Pending && createdAt.isBefore(Instant.now().minus(Duration.ofDays(7)))
```

## Pagination Pattern

```kotlin
data class PageRequest(
    val page: Int = 0,
    val size: Int = 20,
    val sort: String = "createdAt,desc"
)

data class PageResponse<T>(
    val content: List<T>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int
)
```
