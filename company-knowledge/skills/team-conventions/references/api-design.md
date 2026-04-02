# API Design Conventions

## URL Naming Rules

Pattern: `/service-route/client-version/module/action`

### Rules

1. All lowercase
2. Hyphen-separated for multi-word segments (`order-item`, not `orderItem`)
3. No plurals (`/order`, not `/orders`)
4. No trailing slashes
5. Version in URL path (`/web/v1/`, `/app/v2/`)

### Examples

```
POST   /yunbanfang-demand/web/v1/demand/create
GET    /yunbanfang-demand/web/v1/demand/detail?id=123
POST   /yunbanfang-demand/web/v1/demand/page
POST   /yunbanfang-demand/web/v1/demand/update
POST   /yunbanfang-demand/web/v1/demand/delete
GET    /yunbanfang-demand/web/v1/demand/list
```

## Controller Conventions

### Method Naming

| Method | Purpose | HTTP Method | Return |
|--------|---------|-------------|--------|
| `page` | Paginated list | POST | `DataResponse<IPage<Vo>>` |
| `list` | Simple list (no pagination) | GET or POST | `DataResponse<List<Vo>>` |
| `detail` | Single entity | GET | `DataResponse<Vo>` |
| `create` | Create entity | POST | `DataResponse<Long>` |
| `update` | Update entity | POST | `DataResponse<Boolean>` |
| `delete` | Delete entity (logical) | POST | `DataResponse<Boolean>` |

### Controller Code Patterns

```java
@RestController
@RequestMapping("/yunbanfang-order/web/v1/order")
@AllArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/create")
    @ApiOperation("Create order")
    public DataResponse<Long> create(@Valid @RequestBody OrderCreateReq req) {
        return DataResponse.success(orderService.createOrder(req));
    }

    @GetMapping("/detail")
    @ApiOperation("Order detail")
    public DataResponse<OrderDetailVo> detail(@RequestParam Long id) {
        return DataResponse.success(orderService.getOrderDetail(id));
    }

    @PostMapping("/page")
    @ApiOperation("Order paginated list")
    public DataResponse<IPage<OrderPageVo>> page(@RequestBody OrderPageReq req) {
        return DataResponse.success(orderService.pageOrders(req));
    }

    @PostMapping("/update")
    @ApiOperation("Update order")
    public DataResponse<Boolean> update(@Valid @RequestBody OrderUpdateReq req) {
        orderService.updateOrder(req);
        return DataResponse.success(true);
    }

    @PostMapping("/delete")
    @ApiOperation("Delete order")
    public DataResponse<Boolean> delete(@RequestParam Long id) {
        orderService.deleteOrder(id);
        return DataResponse.success(true);
    }
}
```

Key rules:
- Use `@AllArgsConstructor` (Lombok) for constructor injection
- Wrap all responses in `DataResponse<T>` (from blade-framework)
- Use `@Valid` on request bodies for validation
- Use `@ApiOperation` for Swagger/YApi documentation

### Validation

```java
@Data
public class OrderCreateReq {
    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    private BigDecimal amount;

    @NotEmpty(message = "At least one item required")
    @Size(max = 100, message = "Max 100 items per order")
    private List<OrderItemReq> items;
}
```

## Request/Response Entity Naming

### Class Naming

- Request entities: `Req` suffix -- `OrderCreateReq`, `DemandPageReq`
- Response entities: `Vo` suffix -- `OrderDetailVo`, `DemandPageVo`

### Field Naming -- CRITICAL

**NEVER use Req/Vo suffixes in field names.** The suffix belongs on the class, not the field:

```java
// WRONG -- suffix in field name
private OrderDetailVo orderDetailVo;
private List<OrderItemVo> orderItemVoList;

// RIGHT -- clean field names
private OrderDetailVo orderDetail;
private List<OrderItemVo> orderItems;
```

## Service Layer

### Responsibilities

1. Business logic and data processing
2. Transaction management (`@Transactional`)
3. Validation beyond simple field checks
4. Coordination between repositories and external services
5. Returns data objects -- NEVER `DataResponse`

### Rules

- **NEVER return `DataResponse` from service layer** -- that is the controller's job
- **Throw custom exceptions** for business rule violations
- Service layer throws, global exception handler catches and converts to `DataResponse`

```java
@Service
@AllArgsConstructor
public class OrderService {

    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;

    // Returns data -- NOT DataResponse
    public OrderDetailVo getOrderDetail(Long orderId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("Order not found");
        }
        OrderDetailVo vo = new OrderDetailVo();
        BeanUtils.copyProperties(order, vo);
        vo.setItems(orderItemMapper.selectByOrderId(orderId));
        return vo;
    }

    @Transactional(rollbackFor = Exception.class)
    public Long createOrder(OrderCreateReq req) {
        // Validation
        if (req.getItems().isEmpty()) {
            throw new BusinessException("Order must have at least one item");
        }
        // Create order
        Order order = new Order();
        BeanUtils.copyProperties(req, order);
        orderMapper.insert(order);
        // Create items
        for (OrderItemReq itemReq : req.getItems()) {
            OrderItem item = new OrderItem();
            BeanUtils.copyProperties(itemReq, item);
            item.setOrderId(order.getId());
            orderItemMapper.insert(item);
        }
        return order.getId();
    }
}
```

## FeignClient Patterns (SDK Module)

### SDK Module Structure

The SDK module contains only Feign interfaces and DTOs -- no business logic:

```
project-sdk/
├── src/main/java/com/aikero/project/sdk/
│   ├── feign/
│   │   └── OrderFeignClient.java
│   └── dto/
│       ├── OrderCreateReq.java
│       └── OrderDetailVo.java
└── build.gradle.kts
```

### FeignClient Interface

```java
@FeignClient(
    name = "order-service",
    contextId = "orderFeignClient",
    path = "/yunbanfang-order"
)
public interface OrderFeignClient {

    @PostMapping("/inner/v1/order/create")
    DataResponse<Long> createOrder(@RequestBody OrderCreateReq req);

    @GetMapping("/inner/v1/order/detail")
    DataResponse<OrderDetailVo> getOrderDetail(@RequestParam("id") Long id);
}
```

Key rules:
- `contextId` is required when multiple FeignClients point to the same service name
- Use `/inner/` path prefix for internal (service-to-service) endpoints
- `@InnerFeign` annotation (blade-framework) skips auth for internal calls

### @InnerFeign for Internal Endpoints

```java
@InnerFeign
@RestController
@RequestMapping("/yunbanfang-order/inner/v1/order")
@AllArgsConstructor
public class OrderInnerController {

    private final OrderService orderService;

    @PostMapping("/create")
    public DataResponse<Long> createOrder(@RequestBody OrderCreateReq req) {
        return DataResponse.success(orderService.createOrder(req));
    }
}
```

`@InnerFeign` disables authentication interceptors for the annotated controller -- only accessible from other services within the cluster.

### SDK build.gradle.kts

```kotlin
dependencies {
    compileOnly("org.springframework.cloud:spring-cloud-openfeign-core")
    compileOnly("org.springframework:spring-web")
    // Only DTOs and Feign interfaces -- minimal deps
}
```

## URL Whitelist Configuration

To expose endpoints without authentication (public APIs, health checks):

```java
@Configuration
public class WhitelistConfig {
    @Bean
    public AuthWhitelistProperties authWhitelistProperties() {
        AuthWhitelistProperties props = new AuthWhitelistProperties();
        props.getUrls().add("/yunbanfang-order/public/v1/**");
        props.getUrls().add("/actuator/health");
        return props;
    }
}
```

## Disabling Auth Interceptor

For internal or public endpoints that should skip the auth interceptor:

```java
@InnerFeign  // Blade annotation -- disables auth for this controller
@RestController
@RequestMapping("/yunbanfang-order/inner/v1/order")
public class OrderInnerController {
    // ...
}
```

Alternatively, configure URL patterns in the whitelist (see above).

## DAO Layer Patterns

### BaseEntity Inheritance

All entities extend `BaseEntity` which provides the mandatory audit fields:

```java
@Data
public class BaseEntity {
    private Long id;
    private Long creatorId;
    private LocalDateTime createdTime;
    private Long reviserId;
    private LocalDateTime revisedTime;
    private Integer deleted;
}

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_info")
public class Order extends BaseEntity {
    private String orderNo;
    private Long customerId;
    private BigDecimal totalAmount;
    private Integer status;
}
```

### ID Generation

- Use `bigint unsigned` auto-increment by default
- For distributed systems, use snowflake ID generator (configured in blade-framework)
- ID is always the first field in the table

### Pagination

Use MyBatis-Plus `IPage` for paginated queries:

```java
public IPage<OrderPageVo> pageOrders(OrderPageReq req) {
    Page<Order> page = new Page<>(req.getCurrent(), req.getSize());
    IPage<Order> result = orderMapper.selectPage(page,
        Wrappers.<Order>lambdaQuery()
            .eq(req.getStatus() != null, Order::getStatus, req.getStatus())
            .orderByDesc(Order::getCreatedTime)
    );
    return result.convert(order -> {
        OrderPageVo vo = new OrderPageVo();
        BeanUtils.copyProperties(order, vo);
        return vo;
    });
}
```

### Logical Delete

All deletes are logical (soft delete). The `deleted` field controls visibility:

```java
// MyBatis-Plus handles this automatically when configured:
// mybatis-plus.global-config.db-config.logic-delete-field=deleted
// mybatis-plus.global-config.db-config.logic-delete-value=1
// mybatis-plus.global-config.db-config.logic-not-delete-value=0

// Manual logical delete when needed:
orderMapper.update(null,
    Wrappers.<Order>lambdaUpdate()
        .set(Order::getDeleted, 1)
        .eq(Order::getId, orderId)
);
```

## YApi Integration

YApi is used for API documentation and testing. Integration via the EasyYapi IntelliJ plugin.

### Setup Steps

1. Install the **EasyYapi** plugin in IntelliJ IDEA
2. Get a YApi project token from your project settings page
3. Configure the token in IntelliJ: `Settings > Other Settings > EasyYapi > Tokens`
4. Create `.easy.api.config` in the project root:

```properties
# YApi server
server=https://yapi.aikero.com
# Module-to-token mapping
token=your_project_token
# Export options
method.doc.param=true
method.doc.return=true
```

### Exporting APIs

1. Open a controller file in IntelliJ
2. Right-click > `EasyApi > Export Api` (or use the keyboard shortcut)
3. Select YApi as the target
4. APIs are pushed to YApi with full documentation from annotations

### Tips

- Use `@ApiOperation` on controller methods for descriptions
- Use `@ApiModelProperty` on DTO fields for field documentation
- Validation annotations (`@NotBlank`, `@Size`) are automatically included in docs
- Run export after any API change to keep YApi in sync

See full details: [YApi Integration](https://aikero-docs.robotees.tech/conventions/other/yapi.html)
