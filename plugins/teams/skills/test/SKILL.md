---
name: test
description: "测试域的技能入口。覆盖47个主题：ai-regression-testing、breakdown-test、browser-qa、browser-testing-with-devtools、bug-receipt、bug-reproduction-brief、chrome-devtools、driven-development、dummy-dataset、e2e-testing 等。当任务落在测试范围内时先读本文件，再按下方路由表只读需要的那一篇——不要一次读完整个 references。适用场景：用成本最低的测试锁住真实风险，而不是堆覆盖率。"
---

# 测试（`test`）

**这个技能什么时候适用**：用成本最低的测试锁住真实风险，而不是堆覆盖率。任务不属于本域时，先看文末的「跨域去哪看」。

## 怎么用这个技能（重要）

这是一个**入口**，不是手册。`references/` 下有 47 篇主题文档，**不要整目录读**。正确做法：

1. 按下面路由表的「什么时候读」列，挑出与本任务真正相关的那 1–3 篇；
2. 用 `Read` 读 `${CLAUDE_PLUGIN_ROOT}/skills/test/references/<主题>/guide.md`；
3. 那篇文档如果自带 `references/`、`assets/`、`scripts/`，按需再读；
4. 路由表没覆盖的问题，用 `Glob` 在 `references/` 里按关键词找。

## 路由表

| 主题 | 什么时候读它 |
| --- | --- |
| `ai-regression-testing` | Regression testing strategies for AI-assisted development. |
| `breakdown-test` | Test Planning and Quality Assurance prompt that generates comprehensive test strategies, task breakdowns, and quality v… |
| `browser-qa` | Use this skill to automate visual testing and UI interaction verification using browser automation after deploying feat… |
| `browser-testing-with-devtools` | Tests in real browsers via Chrome DevTools MCP. |
| `bug-receipt` | Close defects and incidents with a BUG RECEIPT and VERIFIED, PARTIAL, or BLOCKED status after diagnosis, repair, or rec… |
| `bug-reproduction-brief` | Turn a vague, intermittent, or environment-specific bug report into a minimal evidence-backed reproduction before propo… |
| `chrome-devtools` | Expert-level browser automation, debugging, and performance analysis using Chrome DevTools MCP. |
| `driven-development` | Use when implementing any feature or bugfix, before writing implementation code |
| `dummy-dataset` | Generate realistic dummy datasets for testing with customizable columns, constraints, and output formats (CSV, JSON, SQ… |
| `e2e-testing` | Playwright E2E testing patterns, Page Object Model, configuration, CI/CD integration, artifact management, and flaky te… |
| `e2e-testing-patterns` | Master end-to-end testing with Playwright and Cypress to build reliable test suites that catch bugs, improve confidence… |
| `gap-audit` | Run a read-only audit for missing, weak, stale, or mis-scoped test coverage. |
| `java-junit` | Get best practices for JUnit 5 unit testing, including data-driven tests |
| `playwright-automation-fill-in-form` | Automate filling in a form using Playwright MCP |
| `playwright-best-practices` | Use when writing Playwright tests, fixing flaky tests, debugging failures, implementing Page Object Model, configuring … |
| `playwright-cli` | Automate browser interactions, test web pages and work with Playwright tests. |
| `playwright-explore-website` | Website exploration for testing using Playwright MCP |
| `playwright-generate-test` | Generate a Playwright test based on a scenario using Playwright MCP |
| `quality-playbook` | Run a complete quality engineering audit on any codebase. |
| `scenarios` | Create comprehensive test scenarios from user stories with test objectives, starting conditions, user roles, step-by-st… |
| `scoutqa-test` | This skill should be used when the user asks to "test this website", "run exploratory testing", "check for accessibilit… |
| `spring-boot-test-patterns` | Provides comprehensive testing patterns for Spring Boot applications covering unit, integration, slice, and container-b… |
| `spring-boot-testing` | Expert Spring Boot 4 testing specialist that selects the best Spring Boot testing techniques for your situation with Ju… |
| `springboot-tdd` | Test-driven development for Spring Boot using JUnit 5, Mockito, MockMvc, Testcontainers, and JaCoCo. |
| `springboot-verification` | Verification loop for Spring Boot projects: build, static analysis, tests with coverage, security scans, and diff revie… |
| `tdd-workflow` | Use this skill when writing new features, fixing bugs, or refactoring code. |
| `unit-test-application-events` | Provides patterns for unit testing Spring application events. |
| `unit-test-bean-validation` | Provides patterns for unit testing Jakarta Bean Validation (JSR-380), including @Valid, @NotNull, @Min, @Max, @Email co… |
| `unit-test-boundary-conditions` | Provides edge case, corner case, boundary condition, and limit testing patterns for Java unit tests. |
| `unit-test-caching` | Provides patterns for unit testing Spring Cache annotations (@Cacheable, @CachePut, @CacheEvict). |
| `unit-test-config-properties` | Provides patterns for unit testing `@ConfigurationProperties` classes with `@ConfigurationPropertiesTest`. |
| `unit-test-controller-layer` | Provides patterns for unit testing REST controllers using MockMvc and @WebMvcTest. |
| `unit-test-exception-handler` | Provides patterns for unit testing `@ExceptionHandler` and `@ControllerAdvice` in Spring Boot applications. |
| `unit-test-json-serialization` | Provides patterns for unit testing JSON serialization/deserialization with Jackson and `@JsonTest`. |
| `unit-test-mapper-converter` | Provides patterns for unit testing mappers, converters, and bean mappings. |
| `unit-test-parameterized` | Provides parameterized testing patterns with JUnit 5, generates data-driven unit tests using @ParameterizedTest, @Value… |
| `unit-test-scheduled-async` | Provides patterns for unit testing Spring `@Scheduled` and `@Async` methods using JUnit 5, CompletableFuture, Awaitilit… |
| `unit-test-security-authorization` | Provides patterns for unit testing Spring Security with `@PreAuthorize`, `@Secured`, `@RolesAllowed`. |
| `unit-test-service-layer` | Provides patterns for unit testing service layer with Mockito. |
| `unit-test-utility-methods` | Provides patterns for testing utility classes, static methods, and helper functions. |
| `unit-test-vue-pinia` | Write and review unit tests for Vue 3 + TypeScript + Vitest + Pinia codebases. |
| `unit-test-wiremock-rest-api` | Provides patterns for unit testing external REST APIs using WireMock. |
| `verification-before-completion` | Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verif… |
| `verification-loop` | A comprehensive verification system for Claude Code sessions. |
| `vitest` | Vitest fast unit testing framework powered by Vite with Jest-compatible API. |
| `webapp-testing` | Toolkit for interacting with and testing local web applications using Playwright. |
| `wiremock-standalone-docker` | Provides patterns and configurations for running WireMock as a standalone Docker container. |

## 本域的硬要求

- 测试必须真的跑过并把执行结果报出来，「应该能过」不算
- mock 边界只划在服务无法拥有的依赖上，值对象与查询构造用真实对象
- 警惕假绿：ORM 列名映射、惰性填充、构建 profile 之类的开关不对，测试会全绿但什么都没测到

## 交付物形态

- 测试代码
- 覆盖矩阵
- 可执行验证记录
