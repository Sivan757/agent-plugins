---
name: api
description: "API 契约域的技能入口。覆盖9个主题：and-interface-design、connector-builder、contract-first、design、openapi-spec-generation、openapi-to-application-code、spring-boot-openapi-documentation、typespec-api-operations、typespec-create-api-plugin。当任务落在API 契约范围内时先读本文件，再按下方路由表只读需要的那一篇——不要一次读完整个 references。适用场景：让接口契约与实际运行行为一致，能被消费方直接采用。"
---

# API 契约（`api`）

**这个技能什么时候适用**：让接口契约与实际运行行为一致，能被消费方直接采用。任务不属于本域时，先看文末的「跨域去哪看」。

## 怎么用这个技能（重要）

这是一个**入口**，不是手册。`references/` 下有 9 篇主题文档，**不要整目录读**。正确做法：

1. 按下面路由表的「什么时候读」列，挑出与本任务真正相关的那 1–3 篇；
2. 用 `Read` 读 `${CLAUDE_PLUGIN_ROOT}/skills/api/references/<主题>/guide.md`；
3. 那篇文档如果自带 `references/`、`assets/`、`scripts/`，按需再读；
4. 路由表没覆盖的问题，用 `Glob` 在 `references/` 里按关键词找。

## 路由表

| 主题 | 什么时候读它 |
| --- | --- |
| `and-interface-design` | Guides stable API and interface design. |
| `connector-builder` | Build a new API connector or provider by matching the target repo's existing integration pattern exactly. |
| `contract-first` | Use when multiple consumers and providers must evolve an API or event schema without field drift, integration surprises… |
| `design` | REST API design patterns including resource naming, status codes, pagination, filtering, error responses, versioning, a… |
| `openapi-spec-generation` | Generate and maintain OpenAPI 3.1 specifications from code, design-first specs, and validation patterns. |
| `openapi-to-application-code` | Generate a complete, production-ready application from an OpenAPI specification |
| `spring-boot-openapi-documentation` | Provides patterns to generate comprehensive REST API documentation using SpringDoc OpenAPI 3.0 and Swagger UI in Spring… |
| `typespec-api-operations` | Add GET, POST, PATCH, and DELETE operations to a TypeSpec API plugin with proper routing, parameters, and adaptive cards |
| `typespec-create-api-plugin` | Generate a TypeSpec API plugin with REST operations, authentication, and Adaptive Cards for Microsoft 365 Copilot |

## 本域的硬要求

- 契约必须从真实代码/路由追溯而来，不能按控制器签名推测
- 序列化行为要按实际配置建模（大整数、金额、枚举、日期的真实输出形态）
- 先确认项目是 HTTP 状态码风格还是「200 + 业务码」风格，再决定错误怎么建模

## 交付物形态

- OpenAPI 描述
- 接口设计说明
- 错误码与响应约定
