# Multi-Module Gradle Projects

## Project Structure

```
project-root/
├── build.gradle.kts              # Root build file
├── settings.gradle.kts           # Module declarations
├── gradle/
│   └── libs.versions.toml        # Version catalog
├── buildSrc/                     # Convention plugins
│   ├── build.gradle.kts
│   └── src/main/kotlin/
│       ├── kotlin-conventions.gradle.kts
│       └── spring-conventions.gradle.kts
├── core/                         # Domain module
│   ├── build.gradle.kts
│   └── src/
├── api/                          # REST API module
│   ├── build.gradle.kts
│   └── src/
├── infrastructure/               # Persistence, messaging
│   ├── build.gradle.kts
│   └── src/
└── app/                          # Application entry point
    ├── build.gradle.kts
    └── src/
```

## settings.gradle.kts

```kotlin
rootProject.name = "my-project"

include(
    "core",
    "api",
    "infrastructure",
    "app"
)

dependencyResolutionManagement {
    versionCatalogs {
        create("libs") {
            from(files("gradle/libs.versions.toml"))
        }
    }
}
```

## Convention Plugins (buildSrc)

### buildSrc/build.gradle.kts

```kotlin
plugins {
    `kotlin-dsl`
}

repositories {
    gradlePluginPortal()
}

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.25")
    implementation("org.springframework.boot:spring-boot-gradle-plugin:3.3.0")
}
```

### kotlin-conventions.gradle.kts

```kotlin
plugins {
    kotlin("jvm")
}

group = "com.example"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}

kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xjsr305=strict")  // strict null-safety for Java interop
    }
}
```

### spring-conventions.gradle.kts

```kotlin
plugins {
    id("kotlin-conventions")
    kotlin("plugin.spring")
    id("org.springframework.boot")
    id("io.spring.dependency-management")
}
```

## Module Build Files

### core/build.gradle.kts (domain — no Spring)

```kotlin
plugins {
    id("kotlin-conventions")
    id("com.google.devtools.ksp")
}

val jimmerVersion: String by rootProject.extra

dependencies {
    implementation("org.babyfish.jimmer:jimmer-core:$jimmerVersion")
    ksp("org.babyfish.jimmer:jimmer-ksp:$jimmerVersion")
}

kotlin {
    sourceSets.main {
        kotlin.srcDir("build/generated/ksp/main/kotlin")
    }
}
```

### api/build.gradle.kts (REST layer)

```kotlin
plugins {
    id("spring-conventions")
}

dependencies {
    implementation(project(":core"))
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-validation")
}
```

### infrastructure/build.gradle.kts (persistence)

```kotlin
plugins {
    id("spring-conventions")
    id("com.google.devtools.ksp")
}

val jimmerVersion: String by rootProject.extra

dependencies {
    implementation(project(":core"))
    implementation("org.babyfish.jimmer:jimmer-spring-boot-starter:$jimmerVersion")
    ksp("org.babyfish.jimmer:jimmer-ksp:$jimmerVersion")
    runtimeOnly("com.mysql:mysql-connector-j")
}
```

### app/build.gradle.kts (application entry)

```kotlin
plugins {
    id("spring-conventions")
}

dependencies {
    implementation(project(":core"))
    implementation(project(":api"))
    implementation(project(":infrastructure"))
}
```

## Module Dependency Rules

```
app → api, infrastructure, core
api → core
infrastructure → core
core → (no project dependencies)
```

- **core** contains entities, domain logic, ports — no Spring dependency
- **infrastructure** implements persistence (Jimmer repositories)
- **api** implements REST controllers
- **app** wires everything together, contains `@SpringBootApplication`

## Shared Test Configuration

```kotlin
// In kotlin-conventions.gradle.kts
dependencies {
    testImplementation("org.junit.jupiter:junit-jupiter")
    testImplementation("io.mockk:mockk:1.13.10")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test")
}
```

## Gradle Properties (gradle.properties)

```properties
# Performance
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.configuration-cache=true
kotlin.code.style=official

# Versions shared across modules
jimmerVersion=0.9.19
```
