---
name: data
description: "数据访问与迁移域的技能入口。覆盖14个主题：database-migration、database-migrations、liquibase、mysql-patterns、postgres-patterns、postgresql-optimization、postgresql-table-design、quality-frameworks、spring-data-jpa、sql-code-review 等。当任务落在数据访问与迁移范围内时先读本文件，再按下方路由表只读需要的那一篇——不要一次读完整个 references。适用场景：让 schema 变更安全、可回滚、可复现，并让取数口径可辩论。"
---

# 数据访问与迁移（`data`）

**这个技能什么时候适用**：让 schema 变更安全、可回滚、可复现，并让取数口径可辩论。任务不属于本域时，先看文末的「跨域去哪看」。

## 怎么用这个技能（重要）

这是一个**入口**，不是手册。`references/` 下有 14 篇主题文档，**不要整目录读**。正确做法：

1. 按下面路由表的「什么时候读」列，挑出与本任务真正相关的那 1–3 篇；
2. 用 `Read` 读 `${CLAUDE_PLUGIN_ROOT}/skills/data/references/<主题>/guide.md`；
3. 那篇文档如果自带 `references/`、`assets/`、`scripts/`，按需再读；
4. 路由表没覆盖的问题，用 `Glob` 在 `references/` 里按关键词找。

## 路由表

| 主题 | 什么时候读它 |
| --- | --- |
| `database-migration` | Execute database migrations across ORMs and platforms with zero-downtime strategies, data transformation, and rollback … |
| `database-migrations` | Database migration best practices for schema changes, data migrations, rollbacks, and zero-downtime deployments across … |
| `liquibase` | Liquibase 在 Spring Boot 3.5 + MySQL 项目里的使用约定：Spring Boot 托管的版本与覆盖方式、spring.liquibase.* 键名（含 label-filter 这个易错点）、changel… |
| `mysql-patterns` | MySQL and MariaDB schema, query, indexing, transaction, replication, and connection-pool patterns for production backen… |
| `postgres-patterns` | PostgreSQL database patterns for query optimization, schema design, indexing, and security. |
| `postgresql-optimization` | PostgreSQL-specific development assistant focusing on unique PostgreSQL features, advanced data types, and PostgreSQL-e… |
| `postgresql-table-design` | Use this skill when designing or reviewing a PostgreSQL-specific schema. |
| `quality-frameworks` | Implement data quality validation with Great Expectations, dbt tests, and data contracts. |
| `spring-data-jpa` | Provides patterns to implement persistence layers with Spring Data JPA. |
| `sql-code-review` | Universal SQL code review assistant that performs comprehensive security, maintainability, and code quality analysis ac… |
| `sql-optimization` | Universal SQL performance optimization assistant for comprehensive query tuning, indexing strategies, and database perf… |
| `sql-optimization-patterns` | Master SQL query optimization, indexing strategies, and EXPLAIN analysis to dramatically improve database performance a… |
| `sql-queries` | Generate SQL queries from natural language descriptions. |
| `throughput-accelerator` | Use when large data ingestion, backfill, export, ETL, warehouse loading, manifest catch-up, or table synchronization ne… |

## 本域的硬要求

- 先确认项目的迁移工具与目录约定，再动手写
- 已执行的变更不可回改；需要变化就新建一条
- 任何会被静默跳过的机制（加载顺序、开关位置）都要显式验证，不能假定生效

## 交付物形态

- changeset / 迁移脚本
- 表结构与索引设计
- SQL 与校验脚本
