---
name: aikero-gradle
description: >-
  This skill should be used when the user asks to "set up Gradle for Aikero project",
  "configure version catalog", "use Aikero Gradle plugin", "publish artifact",
  "configure common-conf", "set up publish-conf", "configure multi-module build",
  "add Blade dependency", "set up Nexus repository", "configure init.gradle.kts",
  "use gradle.properties", "configure Gradle wrapper", "set up CI build",
  or works on any Gradle build configuration for Aikero/Blade framework projects.
version: 0.2.0
model: sonnet
---

# Aikero Gradle Build System

## Overview

Aikero uses a custom Gradle plugin ecosystem for standardized build configuration across all projects. The plugin provides version catalog management, repository configuration, publishing, and code quality enforcement.

## Global Gradle Configuration

`~/.gradle/gradle.properties` -- required for all developers:

```properties
companyNexusSnapshotsRepoUrl=https://nexus.tiangong.site/repository/aikero-snapshots
companyNexusReleasesRepoUrl=https://nexus.tiangong.site/repository/aikero-releases
companyNexusRepositoryUrl=https://nexus.tiangong.site/repository/aikero-public
companyNexusUsername=<your-nexus-username>
companyNexusPassword=<your-nexus-password>
catalogPluginVersion=<version>
```

`~/.gradle/init.gradle.kts` -- plugin management and repository setup:

```kotlin
beforeSettings {
    val catalogPluginVersion: String by settings
    pluginManagement {
        repositories {
            maven("https://nexus.tiangong.site/repository/aikero-public")
            gradlePluginPortal()
            mavenCentral()
        }
        plugins {
            id("team.aikero.gradle.plugin.version-catalog") version catalogPluginVersion
            id("team.aikero.gradle.plugin.common-conf") version catalogPluginVersion
            id("team.aikero.gradle.plugin.publish-conf") version catalogPluginVersion
        }
    }
}
```

## Project settings.gradle.kts

```kotlin
import team.aikero.gradle.plugin.version.catalog.versionCatalogConf

plugins {
    id("team.aikero.gradle.plugin.version-catalog")
    id("org.gradle.toolchains.foojay-resolver-convention")
}

rootProject.name = "my-service"
val frameworkVersion: String by settings

include("my-service-common", "my-service-sdk", "my-service-service")

versionCatalogConf {
    artifactVersion = frameworkVersion
}
```

This imports the Blade version catalog (`team.aikero.blade:blade-catalog:<version>`) which provides:

- `commonLibs` -- Blade framework and third-party libraries
- `springBootLibs` -- Spring Boot dependencies
- `springCloudLibs` -- Spring Cloud dependencies
- `springCloudAlibabaLibs` -- Spring Cloud Alibaba dependencies

## Project gradle.properties

Required keys:

```properties
group=team.aikero.<department>.<project>
version=1.0.0-SNAPSHOT
frameworkVersion=3.2.0
```

## build.gradle.kts Patterns

Root build file:

```kotlin
plugins {
    alias(commonLibs.plugins.kotlin.jvm) apply false
    alias(commonLibs.plugins.kapt) apply false
}

subprojects {
    tasks.withType<Test> {
        useJUnitPlatform()
        jvmArgs("-XX:+EnableDynamicAgentLoading")
    }
}
```

Service module:

```kotlin
plugins {
    alias(commonLibs.plugins.kotlin.jvm)
    alias(commonLibs.plugins.kotlin.spring)
    alias(commonLibs.plugins.springboot)
}
dependencies {
    implementation(commonLibs.blade.web.spring.boot.starter)
    implementation(commonLibs.blade.auth.spring.boot.starter)
    implementation(commonLibs.blade.data.mybatis.plus.spring.boot.starter)
    implementation(springBootLibs.spring.springBootStarterWeb)
    testImplementation(springBootLibs.spring.springBootStarterTest)
    testImplementation(springBootLibs.junit.junitJupiterApi)
    testRuntimeOnly(springBootLibs.junit.junitJupiterEngine)
}
```

SDK module (keep minimal):

```kotlin
plugins {
    alias(commonLibs.plugins.kotlin.jvm)
    alias(commonLibs.plugins.kotlin.spring)
}
dependencies {
    compileOnly(commonLibs.blade.core.protocol)
    compileOnly(commonLibs.blade.feign)
    compileOnly(springCloudLibs.spring.cloud.openfeign)
}
```

For Jimmer ORM add:

```kotlin
plugins {
    alias(commonLibs.plugins.google.ksp)
}
dependencies {
    implementation(commonLibs.blade.jimmer.spring.boot.starter)
    ksp(commonLibs.jimmer.ksp)
}
```

## Publishing

- Snapshot: `https://nexus.tiangong.site/repository/aikero-snapshots`
- Release: `https://nexus.tiangong.site/repository/aikero-releases`
- Public (read): `https://nexus.tiangong.site/repository/aikero-public`

Apply publish-conf plugin in SDK modules for publishing.

## Blade Framework Versioning

The Blade framework uses Gradle tasks for version management:

```bash
./gradlew releaseVersion       # SNAPSHOT -> release
./gradlew bumpPatchVersion     # 3.2.0 -> 3.2.1-SNAPSHOT
./gradlew bumpMinorVersion     # 3.2.0 -> 3.3.0-SNAPSHOT
./gradlew bumpMajorVersion     # 3.2.0 -> 4.0.0-SNAPSHOT
```

## Gradle Cache

- Configuration cache enabled by default in newer Gradle versions
- Use `--configuration-cache` flag for builds
- JVM args: `-Xmx4g -XX:MaxMetaspaceSize=1g` recommended for large projects

## Reference Docs

- [Gradle Overview](https://aikero-docs.robotees.tech/gradle/)
- [Project Structure](https://aikero-docs.robotees.tech/gradle/gradleproject.html)
- [Gradle Cache](https://aikero-docs.robotees.tech/gradle/gradle_cache.html)
- [Plugin Overview](https://aikero-docs.robotees.tech/gradle/plugin.html)
- [Plugin Index](https://aikero-docs.robotees.tech/gradle/plugins/)
- [FAQ](https://aikero-docs.robotees.tech/gradle/qa.html)

## Reference Files

- `references/plugins.md` -- Detailed Aikero Gradle plugin documentation
