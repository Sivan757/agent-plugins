# Advanced Jimmer Features

## DTO Language

Jimmer has a dedicated DTO language (`.dto` files) for generating input/output DTOs from entities. Place `.dto` files alongside entity source files.

```
// Book.dto
export com.example.model.dto

// Output DTO — for API responses
BookView {
    #allScalars          // all scalar properties
    store {              // association shape
        name
    }
    authors {
        firstName
        lastName
    }
}

// Input DTO — for save commands
input BookInput {
    #allScalars
    id?                  // optional for create, required for update
    store {
        name
    }
}

// Specification DTO — for dynamic queries
specification BookSpecification {
    like/i(name)         // case-insensitive LIKE
    ge(price)            // greater than or equal
    le(price)            // less than or equal
    like/i(store.name) as storeName   // association filtering
}
```

Generated DTOs are type-safe and automatically handle entity ↔ DTO conversion.

## Calculated Properties

### Formula (SQL-based)

```kotlin
@Entity
interface BookStore {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long
    val name: String

    @Formula(dependencies = ["books"])
    val avgPrice: BigDecimal  // implemented via SQL subquery
}

// Register calculation logic
@Component
class BookStoreAvgPriceResolver : KTransientResolver<Long, BigDecimal> {
    override fun resolve(ids: Collection<Long>): Map<Long, BigDecimal> {
        // SQL to calculate average book price per store
    }
}
```

### @IdView and @ManyToManyView

```kotlin
@Entity
interface Book {
    @ManyToOne
    val store: BookStore?

    @IdView("store")
    val storeId: Long?     // exposes FK as a simple property

    @ManyToMany
    val authors: List<Author>

    @IdView("authors")
    val authorIds: List<Long>  // exposes many-to-many as ID list
}
```

## Caching

Jimmer supports multi-level caching with automatic cache invalidation:

```kotlin
@Bean
fun cacheFactory(): KCacheFactory =
    KCacheFactory { prop ->
        when {
            // Object cache — by entity ID
            !prop.isAssociationProp ->
                ChainCacheBuilder<Any, Any>()
                    .add(CaffeineBinder(512, Duration.ofSeconds(60)))
                    .add(RedisBinder(redisTemplate, Duration.ofMinutes(10)))
                    .build()
            // Association cache — by association
            else ->
                ChainCacheBuilder<Any, List<*>>()
                    .add(CaffeineBinder(128, Duration.ofSeconds(30)))
                    .add(RedisBinder(redisTemplate, Duration.ofMinutes(5)))
                    .build()
        }
    }
```

Cache invalidation is automatic — when entities are saved, affected caches are invalidated across all nodes.

## Triggers

Listen to data changes for side effects:

```kotlin
@Component
class BookTrigger(sqlClient: KSqlClient) {
    init {
        sqlClient.addEntityListener(Book::class) { event ->
            when {
                event.isNew -> println("Book created: ${event.newEntity.name}")
                event.isModified -> println("Book updated: ${event.newEntity.name}")
                event.isDeleted -> println("Book deleted: ${event.oldEntity.name}")
            }
        }
    }
}
```

Configure trigger type in `application.yml`:

```yaml
jimmer:
  trigger-type: TRANSACTION_ONLY   # BINLOG_ONLY | TRANSACTION_ONLY | BOTH
```

## Database Validation

Jimmer can validate entity definitions against the actual database schema at startup:

```yaml
jimmer:
  database-validation-mode: ERROR  # NONE | WARNING | ERROR
```

## Dynamic Table Joins

Jimmer automatically optimizes joins:

```kotlin
val books = sqlClient.createQuery(Book::class) {
    // If storeName is null, no JOIN is generated
    storeName?.let {
        where(table.store.name ilike it)
    }
    // If authorName is null, no JOIN is generated
    authorName?.let {
        where(
            table.asTableEx().authors { firstName ilike it }
        )
    }
    select(table)
}.execute()
```

Rules:
- **Unused joins are removed** — no wasted SQL
- **Conflicting joins merge** — multiple conditions on same association produce single JOIN
- **Implicit subqueries** — collection associations (`@OneToMany`, `@ManyToMany`) generate EXISTS subqueries

## Recursive Queries

For tree-structured entities:

```kotlin
val tree = sqlClient.findById(
    newFetcher(TreeNode::class).by {
        allScalarFields()
        childNodes({
            recursive()  // load entire tree recursively
        }) {
            allScalarFields()
        }
    },
    rootId
)
```

## Pagination

```kotlin
val page = sqlClient.createQuery(Book::class) {
    orderBy(table.name.asc())
    select(table.fetch(SIMPLE_FETCHER))
}.fetchPage(pageIndex = 0, pageSize = 10)
```

Jimmer generates optimized COUNT query automatically.
