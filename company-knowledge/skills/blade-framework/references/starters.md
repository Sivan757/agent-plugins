# Blade Spring Boot Starters

Starters are auto-configuration modules that bundle base modules with Spring Boot auto-configuration. Import via Gradle version catalog:

```kotlin
implementation(commonLibs.blade.xxx.spring.boot.starter)
```

## Starter Inventory

| Category | Starter | Key Features | Doc Link |
|----------|---------|-------------|----------|
| **Web** | blade-web-spring-boot-starter | MVC config, date formatters, API logging filter | [Web API](https://aikero-docs.robotees.tech/blade/connect/web_api.html) |
| **Web** | blade-web-boot-spring-boot-starter | Composite: web + logging + sequence + xss + oss-path | - |
| **Web** | blade-web-cloud-spring-boot-starter | Cloud variant with Feign + Nacos integration | - |
| **Web** | blade-response-wrapper-spring-boot-starter | Auto-wrap responses in DataResponse | - |
| **Auth** | blade-auth-spring-boot-starter | Sa-Token integration, permission interceptors | [Auth](https://aikero-docs.robotees.tech/blade/modules/user_auth.html) |
| **Data** | blade-data-mybatis-plus-spring-boot-starter | MyBatis Plus with audit fields, data permission | [MyBatis Plus](https://aikero-docs.robotees.tech/blade/modules/mybatisplus.html) |
| **Data** | blade-data-redis-spring-boot-starter | Redis with CacheCommands, Spring Cache | [Cache](https://aikero-docs.robotees.tech/blade/modules/cache.html) |
| **Data** | blade-jimmer-spring-boot-starter | Jimmer ORM with CosId, org/creator filters | - |
| **Security** | blade-xss-spring-boot-starter | XSS protection filter | [XSS](https://aikero-docs.robotees.tech/blade/modules/xss_protect.html) |
| **Security** | blade-sensitive-spring-boot-starter | Field masking in serialization | [Sensitive](https://aikero-docs.robotees.tech/blade/modules/sensitive.html) |
| **Infra** | blade-feign-spring-boot-starter | Feign with token relay, mock user | [Feign](https://aikero-docs.robotees.tech/blade/modules/feign.html) |
| **Infra** | blade-lock-spring-boot-starter | Distributed lock, no-repeat-submit | [Lock](https://aikero-docs.robotees.tech/blade/modules/lock.html) |
| **Infra** | blade-tenant-spring-boot-starter | Multi-tenancy support | - |
| **Infra** | blade-gateway-spring-boot-starter | Gateway security, auth, traffic control | [Gateway](https://aikero-docs.robotees.tech/blade/modules/gateway.html) |
| **Monitor** | blade-oplog-spring-boot-starter | Operation logging with RabbitMQ | [OpLog](https://aikero-docs.robotees.tech/blade/modules/oplog.html) |
| **Monitor** | blade-mq-spring-boot-starter | RabbitMQ message bus | [MQ](https://aikero-docs.robotees.tech/blade/modules/mq_starter.html) |
| **Monitor** | blade-error-report-spring-boot-starter | Exception reporting to DingTalk/Feishu | [Error Report](https://aikero-docs.robotees.tech/blade/modules/error_report.html) |
| **Monitor** | blade-diagnostics-spring-boot-starter | System diagnostics | - |
| **Monitor** | blade-versions-report-spring-boot-starter | Dependency version reporting | [Dep Mgmt](https://aikero-docs.robotees.tech/blade/modules/dependence_manage.html) |
| **Monitor** | blade-logging-spring-boot-starter | Logging configuration | [Logging](https://aikero-docs.robotees.tech/blade/modules/logging.html) |
| **Util** | blade-file-spring-boot-starter | File handling with OSS | [File](https://aikero-docs.robotees.tech/blade/modules/file_support.html) |
| **Util** | blade-sequence-spring-boot-starter | CosId distributed ID generation | [ID Gen](https://aikero-docs.robotees.tech/blade/modules/id_gen.html) |
| **Util** | blade-test-spring-boot-starter | Test utilities | - |
| **Util** | blade-oss-path-convert-spring-boot-starter | OSS path domain conversion | [OSS Path](https://aikero-docs.robotees.tech/blade/modules/OssPath.html) |
| **Util** | blade-nacos-share-spring-boot-starter | Cross-namespace Nacos config | [Nacos Share](https://aikero-docs.robotees.tech/blade/modules/nacos-share-config.html) |

Total: 26 starters across 6 categories.

---

## Composite Starter: blade-web-boot

The `blade-web-boot-spring-boot-starter` is the recommended base dependency for most Aikero services. It bundles:

- **blade-web-spring-boot-starter** -- MVC configuration, date formatters, API request/response logging
- **blade-logging-spring-boot-starter** -- Structured logging configuration
- **blade-sequence-spring-boot-starter** -- CosId distributed ID generation
- **blade-xss-spring-boot-starter** -- XSS protection filter
- **blade-oss-path-convert-spring-boot-starter** -- OSS path domain conversion

Most projects should start with this composite starter and add individual starters for additional features (auth, data, monitoring, etc.).

---

## build.gradle.kts Dependency Patterns

### Typical service project

```kotlin
plugins {
    alias(commonLibs.plugins.kotlin.jvm)
    alias(commonLibs.plugins.kotlin.spring)
    alias(commonLibs.plugins.springboot)
}

dependencies {
    // Base: use the composite starter for most projects
    implementation(commonLibs.blade.web.boot.spring.boot.starter)

    // Auth
    implementation(commonLibs.blade.auth.spring.boot.starter)

    // Data -- choose one ORM
    implementation(commonLibs.blade.data.mybatis.plus.spring.boot.starter)
    // OR for Jimmer:
    // implementation(commonLibs.blade.jimmer.spring.boot.starter)
    // ksp(commonLibs.jimmer.ksp)

    // Redis cache
    implementation(commonLibs.blade.data.redis.spring.boot.starter)

    // Operation logging
    implementation(commonLibs.blade.oplog.spring.boot.starter)

    // Error reporting (DingTalk/Feishu alerts)
    implementation(commonLibs.blade.error.report.spring.boot.starter)
}
```

### Minimal web service (no composite)

```kotlin
dependencies {
    implementation(commonLibs.blade.web.spring.boot.starter)
    implementation(commonLibs.blade.auth.spring.boot.starter)
}
```

### Cloud service with Feign

```kotlin
dependencies {
    implementation(commonLibs.blade.web.cloud.spring.boot.starter)
    implementation(commonLibs.blade.auth.spring.boot.starter)
    implementation(commonLibs.blade.feign.spring.boot.starter)
}
```

### Gateway project

```kotlin
dependencies {
    implementation(commonLibs.blade.gateway.spring.boot.starter)
}
```

### Version catalog references

Dependencies are managed through Gradle version catalogs. The catalog alias pattern is:

```
commonLibs.blade.<module-name>.spring.boot.starter
```

Where `<module-name>` uses dots as separators matching the artifact name segments. Examples:
- `blade-web-spring-boot-starter` -> `commonLibs.blade.web.spring.boot.starter`
- `blade-data-mybatis-plus-spring-boot-starter` -> `commonLibs.blade.data.mybatis.plus.spring.boot.starter`
- `blade-web-boot-spring-boot-starter` -> `commonLibs.blade.web.boot.spring.boot.starter`

---

## Auto-Configuration Registration

Each starter registers its auto-configuration classes in:

```
src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

This file lists one auto-configuration class per line. Spring Boot discovers and applies them automatically when the starter is on the classpath.

Example content:

```
team.aikero.blade.auth.autoconfigure.BladeAuthAutoConfiguration
team.aikero.blade.auth.autoconfigure.BladePermissionAutoConfiguration
```

You should not need to modify these files unless creating a new starter.

---

## Troubleshooting

For diagnosing issues in Blade-based services, see:

- [Actuator Usage](https://aikero-docs.robotees.tech/blade/problem/actuator.html) -- Spring Boot Actuator endpoints for health checks, metrics, and environment inspection
- [Arthas Diagnostics](https://aikero-docs.robotees.tech/blade/problem/arthas.html) -- Alibaba Arthas for live JVM diagnostics, method tracing, and performance profiling
