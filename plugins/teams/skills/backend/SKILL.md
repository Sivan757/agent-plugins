---
name: backend
description: "后端工程域的技能入口。覆盖54个主题：api-design-principles、architecture-patterns、attack-tree-construction、auth-implementation-patterns、clean-architecture、codeql、content-hash-cache-pattern、cqrs-implementation、create-spring-boot-java-project、dubbo 等。当任务落在后端工程范围内时先读本文件，再按下方路由表只读需要的那一篇——不要一次读完整个 references。适用场景：在 Java/Spring 微服务栈上做符合框架约定、可上线的服务端实现。"
---

# 后端工程（`backend`）

**这个技能什么时候适用**：在 Java/Spring 微服务栈上做符合框架约定、可上线的服务端实现。任务不属于本域时，先看文末的「跨域去哪看」。

## 怎么用这个技能（重要）

这是一个**入口**，不是手册。`references/` 下有 54 篇主题文档，**不要整目录读**。正确做法：

1. 按下面路由表的「什么时候读」列，挑出与本任务真正相关的那 1–3 篇；
2. 用 `Read` 读 `${CLAUDE_PLUGIN_ROOT}/skills/backend/references/<主题>/guide.md`；
3. 那篇文档如果自带 `references/`、`assets/`、`scripts/`，按需再读；
4. 路由表没覆盖的问题，用 `Glob` 在 `references/` 里按关键词找。

## 路由表

| 主题 | 什么时候读它 |
| --- | --- |
| `api-design-principles` | Master REST and GraphQL API design principles to build intuitive, scalable, and maintainable APIs that delight develope… |
| `architecture-patterns` | Implement proven backend architecture patterns including Clean Architecture, Hexagonal Architecture, and Domain-Driven … |
| `attack-tree-construction` | Build comprehensive attack trees to visualize threat paths. |
| `auth-implementation-patterns` | Master authentication and authorization patterns including JWT, OAuth2, session management, and RBAC to build secure, s… |
| `clean-architecture` | Provides implementation patterns for Clean Architecture, Hexagonal Architecture (Ports & Adapters), and Domain-Driven D… |
| `codeql` | Comprehensive guide for setting up and configuring CodeQL code scanning via GitHub Actions workflows and the CodeQL CLI. |
| `content-hash-cache-pattern` | Cache expensive file processing results using SHA-256 content hashes — path-independent, auto-invalidating, with servic… |
| `cqrs-implementation` | Implement Command Query Responsibility Segregation for scalable architectures. |
| `create-spring-boot-java-project` | Create Spring Boot Java Project Skeleton |
| `dubbo` | Apache Dubbo 3 在 Spring Boot 3.5 微服务里的使用约定：该引哪个 BOM 与 starter、dubbo.* 配置键与 Nacos 注册中心地址的写法、@DubboService/@DubboReferenc… |
| `error-handling` | Patterns for robust error handling across TypeScript, Python, and Go. |
| `error-handling-patterns` | Master error handling patterns across languages including exceptions, Result types, error propagation, and graceful deg… |
| `event-store-design` | Design and implement event stores for event-sourced systems. |
| `hexagonal-architecture` | Design, implement, and refactor Ports & Adapters systems with clear domain boundaries, dependency inversion, and testab… |
| `java-code-review` | > |
| `java-coding-standards` | Java coding standards for Spring Boot and Quarkus services: naming, immutability, Optional usage, streams, exceptions, … |
| `java-docs` | Ensure that Java types are documented with Javadoc comments and follow best practices for documentation. |
| `java-refactoring-extract-method` | Refactoring using Extract Methods in Java Language |
| `java-refactoring-remove-parameter` | Refactoring using Remove Parameter in Java Language |
| `java-springboot` | Get best practices for developing applications with Spring Boot. |
| `jpa-patterns` | JPA/Hibernate patterns for entity design, relationships, query optimization, transactions, auditing, indexing, paginati… |
| `jspecify` | > |
| `latency-critical-systems` | Use for latency-sensitive systems such as realtime dashboards, market data, streaming agents, execution gateways, queue… |
| `microservices-patterns` | Design microservices architectures with service boundaries, event-driven communication, and resilience patterns. |
| `nacos` | Nacos 作为注册中心与配置中心的使用约定：Spring Cloud Alibaba 版本对齐、namespace/group/dataId 三层模型、Spring Boot 3.x 下强制的 spring.config.import（… |
| `patterns` | Backend architecture patterns, API design, database optimization, and server-side best practices for Node.js, Express, … |
| `projection-patterns` | Build read models and projections from event streams. |
| `redis-patterns` | Redis data structure patterns, caching strategies, distributed locks, rate limiting, pub/sub, and connection management… |
| `ruoyi-cloud-plus` | RuoYi-Cloud-Plus 2.X 后端开发约定：顶层模块布局、新增 Maven 模块的完整注册步骤（含最容易漏掉的 BOM 登记）、包命名、MyBatis-Plus 的 BaseMapperPlus 分页模式、多租户 Tenant… |
| `sa-token` | Sa-Token 认证授权的使用与排障约定：Spring Boot 3.x 该引哪个 starter、注解鉴权为什么默认不生效、SaInterceptor/SaServletFilter 的正确注册方式、sa-token.* 配置键与默认… |
| `saga-orchestration` | Implement saga patterns for distributed transactions and cross-aggregate workflows. |
| `sast-configuration` | Configure Static Application Security Testing (SAST) tools for automated vulnerability detection in application code. |
| `secret-scanning` | Guide for configuring and managing GitHub secret scanning, push protection, custom patterns, and secret alert remediati… |
| `security-and-hardening` | Hardens code against vulnerabilities. |
| `security-requirement-extraction` | Derive security requirements from threat models and business context. |
| `security-review` | Use this skill when adding authentication, handling user input, working with secrets, creating API endpoints, or implem… |
| `security-scan` | Scan your Claude Code configuration (.claude/ directory) for security vulnerabilities, misconfigurations, and injection… |
| `spring-boot` | > |
| `spring-boot-actuator` | Provides patterns to configure Spring Boot Actuator for production-grade monitoring, health probes, secured management … |
| `spring-boot-cache` | Provides patterns for implementing Spring Boot caching: configures Redis/Caffeine/EhCache providers with TTL and evicti… |
| `spring-boot-crud-patterns` | Provides and generates complete CRUD workflows for Spring Boot 3 services. |
| `spring-boot-dependency-injection` | Provides dependency injection patterns for Spring Boot projects, including constructor-first design, optional collabora… |
| `spring-boot-event-driven-patterns` | Provides Event-Driven Architecture (EDA) patterns for Spring Boot — creates domain events, configures ApplicationEvent … |
| `spring-boot-project-creator` | Creates and scaffolds a new Spring Boot project (3.x or 4.x) by downloading from Spring Initializr, generating package … |
| `spring-boot-resilience4j` | Provides fault tolerance patterns for Spring Boot 3.x using Resilience4j. |
| `spring-boot-rest-api-standards` | Provides REST API design standards and best practices for Spring Boot projects. |
| `spring-boot-saga-pattern` | Provides distributed transaction patterns using the Saga Pattern for Spring Boot microservices. |
| `spring-boot-security-jwt` | Provides JWT authentication and authorization patterns for Spring Boot 3.5.x covering token generation with JJWT, Beare… |
| `spring-modulith-verifier` | > |
| `springboot-patterns` | Spring Boot architecture patterns, REST API design, layered services, data access, caching, async processing, and loggi… |
| `springboot-security` | Spring Security best practices for authn/authz, validation, CSRF, secrets, headers, rate limiting, and dependency secur… |
| `stride-analysis-patterns` | Apply STRIDE methodology to systematically identify threats. |
| `threat-mitigation-mapping` | Map identified threats to appropriate security controls and mitigations. |
| `workflow-orchestration-patterns` | Design durable workflows with Temporal for distributed systems. |

## 本域的硬要求

- 先确认框架版本/分支，再引用任何约定——跨版本混用是这类项目最常见的错源
- 默认值要逐个核对：超时、重试、集群容错类的默认值往往对写操作不安全
- 涉及鉴权时，放行通常需要多层同时改，只改一处必不生效

## 交付物形态

- 接口与实现代码
- 配置改动
- 契约模块（api）
- 错误码与异常处理
