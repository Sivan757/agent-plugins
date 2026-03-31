---
name: jimmer
description: >-
  This skill should be used when the user asks to "define a Jimmer entity",
  "write a Jimmer query", "use object fetcher", "configure Jimmer with Spring Boot",
  "use save command", "create a DTO with Jimmer", "set up KSP for Jimmer",
  "use Jimmer repository", "define associations", "use Jimmer DSL",
  "configure Jimmer caching", "use Jimmer triggers", or works on any code
  involving Jimmer ORM, `@Entity` interfaces, `newFetcher`, `KRepository`,
  or Jimmer's type-safe SQL DSL.
version: 0.1.0
---

# Jimmer ORM

Jimmer is the most advanced ORM for JVM (Java & Kotlin). It treats data structures as graphs, enabling reading and writing of arbitrary shaped data as a whole. Always use Kotlin API — never Java API in Kotlin projects.

## Core Concepts

1. **Entities are interfaces** — not classes. Jimmer generates implementations at compile time via KSP
2. **Dynamic objects** — properties can be set or unset. Unset != null
3. **Object fetcher** — control exactly which properties and associations to load (like GraphQL)
4. **Save command** — save entire object graphs with automatic INSERT/UPDATE/DELETE
5. **Type-safe SQL DSL** — compile-time safety, dynamic predicates, automatic join optimization

## Entity Definition

Entities are Kotlin interfaces annotated with `@Entity`:

```kotlin
@Entity
interface Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @Key
    val name: String

    @Key
    val edition: Int

    val price: BigDecimal

    @ManyToOne
    val store: BookStore?

    @ManyToMany
    @JoinTable(
        name = "BOOK_AUTHOR_MAPPING",
        joinColumnName = "BOOK_ID",
        inverseJoinColumnName = "AUTHOR_ID"
    )
    val authors: List<Author>
}
```

Key rules:
- **Always interfaces**, never classes — Jimmer generates implementations via KSP
- `@Id` for primary key, `@GeneratedValue` for auto-increment
- `@Key` for natural/business keys — used by save command for UPSERT logic
- Nullable (`?`) for optional associations, non-null for required
- `val` only — entities are immutable by design

### Association Annotations

| Annotation | Use |
|---|---|
| `@ManyToOne` | Many-to-one reference (e.g., Book → BookStore) |
| `@OneToMany(mappedBy = "...")` | Inverse of @ManyToOne |
| `@ManyToMany` + `@JoinTable` | Many-to-many with join table |
| `@OneToOne` | One-to-one relationship |

### Self-Referencing (Tree Structures)

```kotlin
@Entity
interface TreeNode {
    @Id @Column(name = "NODE_ID")
    val id: Long
    val name: String
    @ManyToOne
    val parent: TreeNode?
    @OneToMany(mappedBy = "parent")
    val childNodes: List<TreeNode>
}
```

## Object Fetcher

Control exactly which properties to load — Jimmer's equivalent of GraphQL:

```kotlin
val SIMPLE_FETCHER = newFetcher(Book::class).by {
    allScalarFields()         // all non-association fields
    store { name() }          // load store with only name
}

val COMPLEX_FETCHER = newFetcher(Book::class).by {
    allScalarFields()
    store {
        allScalarFields()
        avgPrice()            // calculated field
    }
    authors {
        allScalarFields()
    }
}
```

Use fetchers in controllers via `@FetchBy`:

```kotlin
@GetMapping("/books/{id}")
fun findById(@PathVariable id: Long): @FetchBy("COMPLEX_FETCHER") Book? =
    bookRepository.findNullable(id, COMPLEX_FETCHER)
```

## Save Command

Save entire object graphs — Jimmer handles INSERT/UPDATE/DELETE automatically:

```kotlin
// Save simple entity
sqlClient.save(
    Book {
        name = "GraphQL in Action"
        edition = 4
        price = BigDecimal("59.9")
    }
)

// Save with associations (entire graph)
sqlClient.save(
    Book {
        name = "GraphQL in Action"
        edition = 4
        price = BigDecimal("59.9")
        store { name = "MANNING" }
        authors().addBy {
            firstName = "Bob"
            lastName = "Rockefeller"
            gender = Gender.MALE
        }
    }
)

// Update specific property — set id to trigger UPDATE instead of INSERT
val matched = sqlClient.save(
    Book { id = 100L; price = BigDecimal(60) }
).totalAffectedRowCount != 0
```

Key rules:
- `@Key` properties determine INSERT vs UPDATE (UPSERT behavior)
- Associations are saved recursively — the entire graph is persisted
- Missing associations in save = dissociation (child records removed)

## Spring Boot Repository

```kotlin
interface BookRepository : KRepository<Book, Long> {
    fun findByName(
        name: String? = null,
        pageable: Pageable,
        fetcher: Fetcher<Book>? = null
    ): Page<Book>
}
```

## Type-Safe Query DSL

```kotlin
val books = sqlClient.createQuery(Book::class) {
    name?.let { where(table.name ilike it) }       // dynamic predicate
    storeName?.let {
        where(table.store.name ilike it)            // auto-join
    }
    orderBy(table.name.asc(), table.edition.desc())
    select(table.fetch(SIMPLE_FETCHER))
}.execute()
```

Key rules:
- Dynamic predicates via `?.let { where(...) }` — unused predicates produce no SQL
- Table joins are automatic — unused joins are optimized away
- Conflicting joins merge automatically

## Spring Boot Configuration

```yaml
jimmer:
  language: kotlin              # Required for Kotlin projects
  dialect: org.babyfish.jimmer.sql.dialect.MySqlDialect
  show-sql: true
  pretty-sql: true
  database-validation-mode: ERROR
```

## Additional Resources

### Reference Files

For detailed patterns and advanced Jimmer features, consult:
- **`references/advanced.md`** — DTO language, caching, triggers, calculated properties, remote associations
- **`references/setup.md`** — Gradle KSP configuration, dependency setup, project bootstrapping
