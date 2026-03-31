# Jimmer Project Setup

> For general Gradle configuration, version catalogs, and multi-module patterns, see the **gradle-kotlin** skill. This file covers Jimmer-specific setup only.

## Gradle Configuration (Kotlin DSL)

### build.gradle.kts

```kotlin
plugins {
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.spring") version "1.9.25"
    id("org.springframework.boot") version "3.3.0"
    id("io.spring.dependency-management") version "1.1.5"
    id("com.google.devtools.ksp") version "1.9.25-1.0.20"
}

val jimmerVersion = "0.9.19"  // use latest version

dependencies {
    // Jimmer Spring Boot Starter
    implementation("org.babyfish.jimmer:jimmer-spring-boot-starter:$jimmerVersion")

    // Jimmer KSP code generator
    ksp("org.babyfish.jimmer:jimmer-ksp:$jimmerVersion")

    // Database driver
    runtimeOnly("com.mysql:mysql-connector-j")

    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

// Add KSP generated sources to IntelliJ
kotlin {
    sourceSets.main {
        kotlin.srcDir("build/generated/ksp/main/kotlin")
    }
}
```

### Key Points

- `jimmer-ksp` processes `@Entity` interfaces at compile time, generating:
  - Draft classes (for creating/modifying immutable objects)
  - Table classes (for type-safe SQL DSL)
  - Fetcher DSL classes
  - Props classes (for property references)
- KSP-generated code must be added to `kotlin.sourceSets` for IDE recognition
- Always use `jimmer-spring-boot-starter` — it auto-configures `JSqlClient` / `KSqlClient`

## application.yml

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/mydb?serverTimezone=UTC
    username: root
    password: ${DB_PASSWORD}

jimmer:
  language: kotlin
  dialect: org.babyfish.jimmer.sql.dialect.MySqlDialect
  show-sql: true
  pretty-sql: true
  database-validation-mode: ERROR
```

### Dialect Options

| Database | Dialect Class |
|---|---|
| MySQL | `org.babyfish.jimmer.sql.dialect.MySqlDialect` |
| PostgreSQL | `org.babyfish.jimmer.sql.dialect.PostgresDialect` |
| H2 | `org.babyfish.jimmer.sql.dialect.H2Dialect` |
| Oracle | `org.babyfish.jimmer.sql.dialect.OracleDialect` |

## Project Structure with Jimmer

```
src/main/kotlin/com/example/
├── App.kt                          # @SpringBootApplication
├── model/                          # Jimmer entity interfaces
│   ├── Book.kt
│   ├── BookStore.kt
│   ├── Author.kt
│   └── enums/
│       └── Gender.kt
├── repository/                     # KRepository interfaces
│   ├── BookRepository.kt
│   └── AuthorRepository.kt
├── service/
│   └── BookService.kt
├── controller/
│   └── BookController.kt
└── config/
    └── CacheConfig.kt             # Optional caching setup

src/main/dto/                       # Jimmer DTO files
├── Book.dto
└── Author.dto
```

## Common Gotchas

1. **Forgot `jimmer.language: kotlin`** — Jimmer defaults to Java mode; Kotlin DSL won't work
2. **Missing KSP plugin** — entities compile but no generated code (no Draft/Table classes)
3. **IntelliJ can't find generated classes** — add `kotlin.sourceSets` configuration
4. **Entity is a class, not interface** — Jimmer requires interfaces for entities
5. **Using `var` in entity** — entities are immutable, use `val` only
6. **`@Key` missing on natural key fields** — save command can't determine INSERT vs UPDATE
7. **Circular reference in fetcher** — use `recursive()` for tree structures, not nested fetchers
