# Comprehensive Testing with Kotlin

## Testing Stack

- **JUnit 5** — test framework
- **MockK** — Kotlin-native mocking (not Mockito)
- **Kotest** — property-based testing and matchers (optional)
- **Testcontainers** — real databases in tests
- **Spring Test** — slice tests and integration tests

## Unit Tests with MockK

```kotlin
class OrderServiceTest {
    private val orderRepository = mockk<OrderRepository>()
    private val eventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)
    private val service = OrderService(orderRepository, eventPublisher)

    @Test
    fun `should create order and publish event`() = runTest {
        val request = CreateOrderRequest(customerName = "Alice", amount = BigDecimal("99.99"))
        val savedOrder = buildOrder(id = 1L, customerName = "Alice")

        coEvery { orderRepository.save(any()) } returns savedOrder

        val result = service.create(request)

        result.id shouldBe 1L
        coVerify { eventPublisher.publishEvent(match<OrderCreatedEvent> { it.orderId == 1L }) }
    }

    @Test
    fun `should return null when order not found`() = runTest {
        coEvery { orderRepository.findByIdOrNull(999L) } returns null

        val result = service.findById(999L)

        result.shouldBeNull()
    }
}
```

## Controller Slice Tests

```kotlin
@WebMvcTest(OrderController::class)
class OrderControllerTest {
    @Autowired private lateinit var mockMvc: MockMvc
    @MockkBean private lateinit var orderService: OrderService

    @Test
    fun `POST should return 201 with created order`() {
        val request = """{"customerName":"Alice","amount":99.99,"items":[{"sku":"A1","qty":1}]}"""
        val order = buildOrder(id = 1L)

        coEvery { orderService.create(any()) } returns order

        mockMvc.post("/api/v1/orders") {
            contentType = MediaType.APPLICATION_JSON
            content = request
        }.andExpect {
            status { isCreated() }
            jsonPath("$.id") { value(1) }
            jsonPath("$.customerName") { value("Alice") }
        }
    }

    @Test
    fun `POST should return 400 for invalid request`() {
        val request = """{"customerName":"","amount":-1}"""

        mockMvc.post("/api/v1/orders") {
            contentType = MediaType.APPLICATION_JSON
            content = request
        }.andExpect {
            status { isBadRequest() }
            jsonPath("$.errors.customerName") { exists() }
        }
    }
}
```

## Integration Tests with Testcontainers

```kotlin
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class OrderIntegrationTest {

    companion object {
        @Container
        val mysql = MySQLContainer("mysql:8.0").apply {
            withDatabaseName("testdb")
        }

        @JvmStatic
        @DynamicPropertySource
        fun properties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url") { mysql.jdbcUrl }
            registry.add("spring.datasource.username") { mysql.username }
            registry.add("spring.datasource.password") { mysql.password }
        }
    }

    @Autowired private lateinit var restTemplate: TestRestTemplate

    @Test
    fun `should create and retrieve order end-to-end`() {
        val createRequest = CreateOrderRequest(
            customerName = "Alice",
            amount = BigDecimal("99.99"),
            items = listOf(OrderItemRequest(sku = "A1", qty = 1))
        )

        val createResponse = restTemplate.postForEntity<OrderResponse>(
            "/api/v1/orders", createRequest
        )
        createResponse.statusCode shouldBe HttpStatus.CREATED

        val orderId = createResponse.body!!.id
        val getResponse = restTemplate.getForEntity<OrderResponse>("/api/v1/orders/$orderId")
        getResponse.statusCode shouldBe HttpStatus.OK
        getResponse.body!!.customerName shouldBe "Alice"
    }
}
```

## Test Data Builders

```kotlin
fun buildOrder(
    id: Long = 0L,
    customerName: String = "Test Customer",
    amount: BigDecimal = BigDecimal("100.00"),
    status: OrderStatus = OrderStatus.Pending
): Order = Order(
    id = id,
    customerName = customerName,
    amount = amount,
    status = status,
    createdAt = Instant.now()
)
```

## Repository Tests

For JPA projects, use `@DataJpaTest`. For Jimmer projects, use `@SpringBootTest` with Testcontainers instead — Jimmer repositories require the full `KSqlClient` context.

```kotlin
// JPA projects only — for Jimmer, use @SpringBootTest + Testcontainers
@DataJpaTest
class OrderRepositoryTest {
    @Autowired private lateinit var repository: OrderRepository
    @Autowired private lateinit var entityManager: TestEntityManager

    @Test
    fun `should find orders by status`() {
        entityManager.persist(buildOrder(status = OrderStatus.Pending))
        entityManager.persist(buildOrder(status = OrderStatus.Confirmed))
        entityManager.flush()

        val pending = repository.findByStatus(OrderStatus.Pending)
        pending shouldHaveSize 1
    }
}
```
