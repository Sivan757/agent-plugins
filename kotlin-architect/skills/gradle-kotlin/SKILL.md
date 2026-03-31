---
name: gradle-kotlin
description: >-
  This skill should be used when the user asks to "configure Gradle",
  "set up build.gradle.kts", "add dependencies", "configure KSP",
  "set up Kotlin plugins", "configure multi-module project",
  "write custom Gradle task", "configure Spring Boot with Gradle",
  "set up test configuration", "manage dependency versions",
  "create version catalog", "convert build.gradle to Kotlin DSL",
  or works on any Gradle build configuration for Kotlin Spring Boot projects.
version: 0.1.0
---

# Gradle Kotlin DSL

Opinionated Gradle configuration for Kotlin + Spring Boot + Jimmer projects. Always use Kotlin DSL (`build.gradle.kts`), never Groovy.

> **Note:** Version numbers below are examples. Always verify latest versions at the official sites before use. KSP version must match the Kotlin compiler version.

## Standard build.gradle.kts

```kotlin
plugins {
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.spring") version "1.9.25"
    id("org.springframework.boot") version "3.3.0"
    id("io.spring.dependency-management") version "1.1.5"
    id("com.google.devtools.ksp") version "1.9.25-1.0.20"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

val jimmerVersion = "0.9.19"

dependencies {
    // Spring Boot
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-validation")

    // Jimmer
    implementation("org.babyfish.jimmer:jimmer-spring-boot-starter:$jimmerVersion")
    ksp("org.babyfish.jimmer:jimmer-ksp:$jimmerVersion")

    // Database
    runtimeOnly("com.mysql:mysql-connector-j")

    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("io.mockk:mockk:1.13.10")
    testImplementation("org.testcontainers:mysql:1.19.7")
    testImplementation("org.testcontainers:junit-jupiter:1.19.7")
}

// KSP generated sources for IntelliJ
kotlin {
    sourceSets.main {
        kotlin.srcDir("build/generated/ksp/main/kotlin")
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```

## Essential Plugins

| Plugin | Purpose |
|---|---|
| `kotlin("jvm")` | Kotlin compiler |
| `kotlin("plugin.spring")` | Makes Spring classes `open` (required for AOP/proxy) |
| `id("org.springframework.boot")` | Spring Boot packaging and run |
| `id("io.spring.dependency-management")` | BOM-based version management |
| `id("com.google.devtools.ksp")` | Kotlin Symbol Processing (for Jimmer code generation) |

### Plugin Version Alignment

- KSP version **must match** Kotlin version: `kotlin 1.9.25` → `ksp 1.9.25-1.0.20`
- Spring Boot and dependency-management versions should be compatible
- Check https://kotlinlang.org/docs/ksp-overview.html for KSP-Kotlin version matrix

## Dependency Organization

### By Layer

```kotlin
dependencies {
    // --- Core ---
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-validation")

    // --- ORM ---
    implementation("org.babyfish.jimmer:jimmer-spring-boot-starter:$jimmerVersion")
    ksp("org.babyfish.jimmer:jimmer-ksp:$jimmerVersion")

    // --- Security ---
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("io.jsonwebtoken:jjwt-api:0.12.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.5")

    // --- Database ---
    runtimeOnly("com.mysql:mysql-connector-j")

    // --- Observability ---
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    // --- Testing ---
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("io.mockk:mockk:1.13.10")
    testImplementation("org.testcontainers:mysql:1.19.7")
    testImplementation("org.testcontainers:junit-jupiter:1.19.7")
}
```

### Dependency Configurations

| Configuration | Use |
|---|---|
| `implementation` | Compile + runtime, not exposed to consumers |
| `api` | Compile + runtime, exposed to consumers (use sparingly) |
| `runtimeOnly` | Runtime only (JDBC drivers, JWT impl) |
| `compileOnly` | Compile only (annotations processed at build time) |
| `ksp` | Kotlin Symbol Processing (code generation) |
| `testImplementation` | Test compile + runtime |
| `annotationProcessor` | Java annotation processing (avoid — use KSP for Kotlin) |

## Version Catalog (libs.versions.toml)

For multi-module projects, centralize versions in `gradle/libs.versions.toml`:

```toml
[versions]
kotlin = "1.9.25"
spring-boot = "3.3.0"
jimmer = "0.9.19"
ksp = "1.9.25-1.0.20"
mockk = "1.13.10"
testcontainers = "1.19.7"

[libraries]
spring-boot-web = { module = "org.springframework.boot:spring-boot-starter-web" }
spring-boot-validation = { module = "org.springframework.boot:spring-boot-starter-validation" }
spring-boot-test = { module = "org.springframework.boot:spring-boot-starter-test" }
jimmer-starter = { module = "org.babyfish.jimmer:jimmer-spring-boot-starter", version.ref = "jimmer" }
jimmer-ksp = { module = "org.babyfish.jimmer:jimmer-ksp", version.ref = "jimmer" }
mockk = { module = "io.mockk:mockk", version.ref = "mockk" }
testcontainers-mysql = { module = "org.testcontainers:mysql", version.ref = "testcontainers" }

[plugins]
kotlin-jvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
kotlin-spring = { id = "org.jetbrains.kotlin.plugin.spring", version.ref = "kotlin" }
spring-boot = { id = "org.springframework.boot", version.ref = "spring-boot" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
```

Then in `build.gradle.kts`:

```kotlin
plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.ksp)
}

dependencies {
    implementation(libs.spring.boot.web)
    implementation(libs.jimmer.starter)
    ksp(libs.jimmer.ksp)
    testImplementation(libs.mockk)
}
```

## Custom Tasks

```kotlin
// Run database migrations
tasks.register<Exec>("dbMigrate") {
    group = "database"
    description = "Run database migrations"
    commandLine("./gradlew", "flywayMigrate")
}

// Generate API docs
tasks.register("generateApiDocs") {
    group = "documentation"
    dependsOn("kspKotlin")  // ensure entities are generated first
    doLast {
        // doc generation logic
    }
}
```

## Common Gotchas

1. **KSP version mismatch** — KSP plugin version must align with Kotlin version
2. **Missing `kotlin.sourceSets`** — IntelliJ won't see KSP-generated code
3. **Missing `plugin.spring`** — Spring beans won't be proxied (AOP, `@Transactional` fail)
4. **Using `annotationProcessor` for Kotlin** — use `ksp` instead
5. **Groovy syntax in `.kts`** — no single quotes, use `=` not `:` for properties

## Additional Resources

### Reference Files

For multi-module and advanced patterns, consult:
- **`references/multi-module.md`** — Multi-module project structure, convention plugins, shared configurations
