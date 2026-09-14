---
name: data-liquibase
description: "Liquibase 在 Spring Boot 3.5 + MySQL 项目里的使用约定：Spring Boot 托管的版本与覆盖方式、spring.liquibase.* 键名（含 label-filter 这个易错点）、changelog 与 include/includeAll 结构、includeAll 的真实排序规则、changeset 身份与 checksum、formatted SQL 语法、precondition、rollback 顺序与缺省后果。当写 changeset、排查「校验失败 MD5Sum Check Failed」、发现执行顺序与预期不符、或要把 changelog 接进 Spring Boot 时使用。"
---

# Liquibase（Spring Boot 3.5 / MySQL）

## 版本：Spring Boot 已经替你管好了

Spring Boot 3.5 的 BOM **托管** `org.liquibase:liquibase-core`，声明依赖时**不要写版本号**——加了 `liquibase-core` 就会在启动时自动迁移。

要换版本就覆盖属性 `liquibase.version`，而不是在依赖里写死。

> 注意版本落差：Spring Boot 3.5 托管的是 **4.31.1**，而 Liquibase 社区版最新已是 5.x。**Spring Boot 3.5 与 Liquibase 5.x 的组合没有官方兼容声明**，想上 5.x 属于自行承担的组合，别当成默认安全路径。

配置前缀 `spring.liquibase`。关键键名：

| 键 | 说明 |
| --- | --- |
| `change-log` | changelog 路径，默认 `classpath:/db/changelog/db.changelog-master.yaml` |
| `enabled` | 默认 `true` |
| `contexts` | 运行期 context |
| **`label-filter`** | 运行期 label。**键名不是 `labels`**，写错会被静默忽略 |
| `default-schema` / `drop-first` / `rollback-file` / `parameters.*` | |
| `clear-checksums` | 见下文 checksum 一节 |

## changelog 结构与 include

支持 **SQL / XML / YAML / JSON**。格式由**扩展名与文件头**共同决定。

**只要用了 `include` 或 `includeAll`，root changelog 就必须是 XML / YAML / JSON**（不能是 SQL）；被包含的文件才可以是 SQL。

- `include` 按**书写顺序**执行。
- `includeAll` 指向**目录**并递归子目录。

### includeAll 的排序规则（最常见的误解）

官方文档的说法是"字母序"，但源码给的确切行为是：

> **按资源的完整路径做字符串字典序比较**，不是按文件名单独排序，也不是自然数序。

两个直接推论：

1. **必须零填充/等宽编号**。`10-x.sql` 会排在 `2-x.sql` **前面**——因为这是字符串比较，不是数值比较。
2. 比较对象是**整条路径**，所以目录名也参与排序；嵌套目录的顺序会被目录名影响。

要换排序规则只能用 `includeAll` 的 `resourceComparator` 属性。

> 广泛流传的"includeAll 按文件名的自然数字序排序"**与官方文档和源码都不符**。

## changeset：身份与 checksum

一个 changeset 的身份是 **`id` + `author` + 所在 changelog 文件路径**三者组合。DATABASECHANGELOG 表里的唯一键就是 `id + author + filename`。

因此：

- **同一个库里可以共存多个 changelog**，只要 id/author/文件路径的组合不撞。
- 移动或重命名 changelog 文件会**改变 changeset 身份**，需要用 `logicalFilePath` 保持稳定。

### checksum 是"内容"的摘要，不是文件校验和

推论：**只改格式（空白、排版）不会让 checksum 失效**；改了实际内容才会。

已部署的 changeset 被改动后会报校验失败，信息形态大致是：

```
Validation Failed:
 1 change sets check sum
 com/example/changelog.xml::1::example was: 8:63f82d... but is now: 8:b4fd16...
```

也可能只看到 `[MD5Sum Check Failed]`。

**三种补救办法**（官方按此顺序列出，但**没有给出唯一的推荐优先级**）：

1. 手工把 DATABASECHANGELOG 里对应行的 checksum 置 `NULL`——**必须在所有已部署环境都做**；下次 update 会写入新值。
2. 在该 changeset 上加 `<validCheckSum>`（可填旧值或新值）。**官方在 SQL changelog 文档里明确标注这是 `not a recommended procedure`**。
3. `clear-checksums`——**会清空整张表 MD5SUM 列**，下次 update 重算已部署的、并部署未部署的。5.x 的命令名是 `clear-checksums`（旧版本文档写作 `clearChecksums`），Spring Boot 属性是 `spring.liquibase.clear-checksums`。

比"选哪种补救"更强的原则是：**不要去改已经部署过的 changeset**。需要变化时用 `runOnChange` 或新建一个 changeset。

> checksum 首位数会因算法升级而变化（例如 `8:…` → `9:…`），这种情况会**静默通过并更新**，不报错——看到首位数不同不必紧张。

### runOnChange 与 runAlways

| 属性 | 默认 | 行为 |
| --- | --- | --- |
| `runOnChange` | false | 首次检测到即运行，之后**每次内容被修改**再运行。判定方式是比较 changeset 的 MD5 与表里存的 checksum。典型用于视图、存储过程 |
| `runAlways` | false | **每次部署都执行**，并更新表里该行的执行时间、deployment id、MD5 |

`runAlways` 有个反直觉点：**修改一个已存在的 runAlways changeset 会抛 checksum 错**。要改就得移除 `runAlways` 后新建一个，或者叠加 `runOnChange`。

### context 与 labels 的一个关键细节

changeset 上可以挂 `context` / `labels`，运行期分别用 `--context-filter` / `--label-filter` 过滤，支持 `AND` `OR` `!` `()` 表达式。

**但如果不指定 context filter，changelog 里所有未部署的 changeset 都会执行——即使它们挂了 context。** 这意味着"我以为打了 context 就不会跑"是错的；必须在运行期给出 filter 才有过滤效果。

`dbms` 用来限定数据库，支持逗号分隔、`!` 取反、以及 `all` / `none`。

`failOnError` 默认 `true`；设为 `false` 会**吞掉该 changeset 的错误**，迁移照常继续——数据库可能与 changelog 的期望不一致。官方立场是优先用 precondition，其次 `dbms`，环境差异用 context/label，而不是靠 `failOnError=false`。

## Preconditions

可以放在 changelog 级或 changeset 级；**changeset 的 precondition 失败则该 changeset 不部署**。

`onFail` / `onError` 取值：

- `HALT`（默认）——中止整个 changelog；**可以放在 changeset 之外**
- `CONTINUE`——跳过该 changeset，下次 update 还会再试；**仅限 changeset 内**
- `MARK_RAN`——跳过但标记为已执行；**仅限 changeset 内**
- `WARN`——只告警并继续；**可以放在 changeset 之外**

失败/错误会导致非零退出码；`WARN` 退出码为 0。

常用类型：`tableExists`（`tableName` 必需）、`columnExists`（`columnName` + `tableName` 必需）、`indexExists`、`sqlCheck`（`expectedResult` 必需）、`dbms`、`runningAs`。另有 `primaryKeyExists`、`foreignKeyConstraintExists`、`uniqueConstraintExists`、`viewExists`、`sequenceExists`、`tableIsEmpty`、`rowCount`、`changeSetExecuted`、`changeLogPropertyDefined`、`customPrecondition` 等。

⚠ **性能**：`tableExists`、`columnExists`、`indexExists`、`primaryKeyExists` 这一类**总是创建数据库快照**，可能明显影响启动时间。

`onSqlOutput` 用于 XML/YAML/JSON、`onUpdateSql` 用于 formatted SQL，只影响 `update-sql`；取值 `FAIL` / `IGNORE` / `TEST`。

## Formatted SQL

首行必须精确（**前面不要有空格**）：

```sql
--liquibase formatted sql
```

官方明确说明：在前面加空格这类格式差异**可能直接导致解析报错**。

changeset 头：

```sql
--changeset author:id attribute1:value1 attribute2:value2
```

**属性值里含空格时必须加引号**，例如 `--changeset your.name:1 context:"a or b"`。

其他要点：

- 语句分隔符默认 `;`，可用 `endDelimiter` 改（可为空串）。
- 回滚：`--rollback <SQL>`；外部文件用 `--rollbackSqlFile path:... dbms:... encoding:... relativeToChangelogFile:true`。
- **precondition 在 SQL 里只支持 `sqlCheck` 一种**，写法是先 `--preconditions onFail:HALT onError:HALT`，再 `--precondition-sql-check expectedResult:0 SELECT ...`。`dbms` 与 `runningAs` 在 formatted SQL 中**不可用**。
- 只有 `--comment: ...` 会写进 DATABASECHANGELOG 的 COMMENTS 列；普通 SQL 注释只是文档。
- `--validCheckSum: ...` **必须与 changeset 声明写在不同行**。
- 其他可用属性：`runAlways`、`runOnChange`、`runInTransaction`、`ignore`、`logicalFilePath`、`runWith`、`splitStatements`、`stripComments`、`ignoreLines`。

## Rollback

- **顺序**：单个 changeset 内**自上而下**按书写顺序执行；跨 changeset 是**自下而上**（部署 1、2、3 → 回滚 3、2、1）。多语句时必须按执行顺序书写（例如先 drop 外键再 drop 表）。
- 命令：`liquibase rollback --tag=<tag>`，**`--tag` 是必需的**。位置参数写法 `<command> <tag>` 自 4.4+ **已废弃**。`rollback-count`、`rollback-to-date`、`rollback-sql`、`update-testing-rollback`、`future-rollback-sql` 可用；`rollback-one-changeset` / `rollback-one-update` 属于商业版（Secure）。
- **没写 rollback 会怎样**：能自动推导反操作的 change type（`createTable`、`addColumn`、`renameColumn` 等）无需手写；不能推导的（`dropTable`、`insert` 等）以及**所有 formatted SQL changeset** 都必须手写。真缺反操作时执行回滚会直接报 `Unexpected error running Liquibase: No inverse to liquibase.change.core.…`。

## 顺序控制与最佳实践

- 默认按 changelog 里的书写顺序执行（文件顶部的先跑）。
- `runOrder: first|last` 可把某个 changeset 提到所有其它 changeset 之前或之后；**formatted SQL 不支持 `runOrder`**。
- root changelog 的 include 顺序与位置是主要的排序杠杆。
- `runInTransaction` 默认 `true`；设为 `false` 时，**如果该 changeset 含多条语句且中途出错，DATABASECHANGELOG 表会被留在无效状态**。
- **一个 changeset 只做一个变更**是官方明确的最佳实践——原文理由是"避免失败的自动提交语句把数据库留在意外状态"。

## 关于 MySQL 的 DDL 事务：一条要辟的谣

常见说法是"Liquibase 把 MySQL 的 DDL 标记为非事务"。**这个说法在 Liquibase 的官方文档与源码里都得不到支持**：

- 接口有 `supportsDDLInTransaction()`，`AbstractJdbcDatabase` 的默认实现返回 **`true`**；
- 在 4.31.1 与 5.0.4 两个版本的 `MySQLDatabase` / `MariaDBDatabase` 里**都没有重写**这个方法。

MySQL 侧"DDL 会隐式提交"是 **MySQL 服务器自身**的行为，属于 MySQL 官方文档的范畴——那一条不在这份技能的依据范围内，所以这里只说明「Liquibase 侧没有做这个标记」，不断言 MySQL 的行为细节。需要在 MySQL 上确认事务语义时，去查 MySQL 自己的手册。

## 多模块项目

Liquibase **没有**规定多模块 Maven 的 changelog 目录布局——这是团队约定，不是框架约定。

机制上支持多 changelog 打同一个库：因为跟踪表是同一张，行唯一键是 `id + author + filename`，多个 changelog 可以共存而不冲突。

但 **Spring Boot 的自动配置默认只创建一个 `SpringLiquibase` bean**（它带 `@ConditionalOnMissingBean`）。想在一个应用上下文里跑多个 changelog，要么自定义 `SpringLiquibase` bean，要么用 root changelog + `include` 把它们串起来——后者是官方推荐的结构。

## 症状 → 先查什么

| 症状 | 先查 |
| --- | --- |
| `MD5Sum Check Failed` | 是否有已部署的 changeset 被改过；再决定用置 NULL / `validCheckSum` / `clear-checksums` |
| 执行顺序与预期不符 | 是不是 `includeAll` 里用了非等宽编号（字符串序，`10-` 会跑到 `2-` 前面） |
| 加了 `labels` 却不生效 | 键名写成了 `labels`，正确是 `label-filter` |
| 打了 `context` 却仍然执行 | 运行期没给 context filter——不给就全部执行 |
| 用了 `include` 但启动报错 | root changelog 是 SQL 文件（必须是 XML/YAML/JSON） |
| 回滚报 `No inverse to …` | 该 change type 或 formatted SQL 需要手写 `--rollback` |
| 迁移把库改成一半 | 用了 `failOnError=false` 吞错，或 `runInTransaction=false` 且中途失败 |
| 启动变慢 | precondition 里大量使用 `tableExists` / `columnExists` 这类会建快照的检查 |
