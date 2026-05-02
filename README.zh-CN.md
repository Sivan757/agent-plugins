# Agent Plugins

[English](README.md) | [简体中文](README.zh-CN.md)

一个面向真实 Agent 工作流的实用插件集合。

同时支持 Codex 和 Claude Code。

## 你可以用它做什么

- 从阿里云日志中排查线上问题
- 在 Agent 工作流里直接查询 MySQL 和 PostgreSQL
- 通过 MCP 对陌生代码库做语义搜索
- 管理 TickTick 任务、习惯和专注流程
- 在 Codex 和 Claude Code 之间维护轻量级本地笔记本记忆
- 获取 SHEIN 和 Temu 平台 API 的结构化使用指引
- 把模糊提示词改写成清晰、可执行的开发请求

## 示例工作流

这个仓库更适合下面这类任务：

- “帮我检查生产环境最近的支付失败日志”
- “把 Postgres 里 orders 表的 schema 给我看一下”
- “在 reporting 数据库上执行这条 MySQL 查询”
- “找一下这个服务是在哪里拼 auth header 的”
- “给今天的发布清单创建一个 TickTick 任务”
- “把这个项目坑点记到本地 notebook 里”
- “解释一下 Temu 订单接口和 webhook 流程”
- “把这个粗略功能需求改写成精确的编码提示词”

## 插件分类

### 系统观测

| 插件 | 作用 |
| --- | --- |
| [aliyunlog](plugins/aliyunlog) | 查询阿里云 SLS 日志，支持环境和服务维度快速定位 |

### 数据查询

| 插件 | 作用 |
| --- | --- |
| [mysql](plugins/mysql) | 支持多连接配置的 MySQL 查询 |
| [postgresql](plugins/postgresql) | 支持 schema 发现和参数化查询的 PostgreSQL 查询 |

### 代码与上下文搜索

| 插件 | 作用 |
| --- | --- |
| [augment-mcp](plugins/augment-mcp) | 通过 MCP 接入 Augment Context Engine，实现语义级代码搜索 |

### 请求整理

| 插件 | 作用 |
| --- | --- |
| [prompt-enhancer](plugins/prompt-enhancer) | 将模糊提示词改写成清晰、可执行的开发请求 |

### 个人执行管理

| 插件 | 作用 |
| --- | --- |
| [notebook](plugins/notebook) | 使用本地 Markdown 笔记本保存启动上下文、审计结果和基于会话来源的洞察 |
| [ticktick](plugins/ticktick) | 管理 TickTick 任务、项目、习惯和效率流程 |

### 电商平台 API 能力

| 插件 | 作用 |
| --- | --- |
| [ecommerce-expert](plugins/ecommerce-expert) | 提供 SHEIN 与 Temu 集成 API 的结构化参考资料 |

## 快速开始

优先使用官方客户端安装与插件管理方式，再从这个仓库安装你需要的插件。

### 在 Codex 中使用

1. 按照官方文档安装 Codex。
2. 打开插件目录：
   App：`Plugins`
   CLI：`/plugins`
3. 使用官方插件管理流程把这个仓库加入为插件来源。
4. 从这个集合里安装你需要的插件。

参考：
- [Codex plugins overview](https://developers.openai.com/codex/plugins)
- [Build Codex plugins](https://developers.openai.com/codex/plugins/build)

### 在 Claude Code 中使用

1. 按照官方文档安装 Claude Code。
2. 把这个仓库加入 marketplace：

```text
/plugin marketplace add Sivan757/agent-plugins
```

3. 安装你需要的插件：

```text
/plugin install mysql@agent-plugins
```

4. 对其他插件重复同样的流程即可。

参考：
- [Claude Code setup](https://docs.anthropic.com/en/docs/claude-code/setup)
- [Discover plugins in Claude Code](https://code.claude.com/docs/en/discover-plugins)

## 为什么有这个仓库

很多插件仓库只服务单一客户端，或者把插件本身藏在一层内部脚本之后。这个仓库的思路相反：插件集合本身就是产品。

共享源码树确实有助于维护，但那不是这个仓库最重要的卖点。真正的重点是：这里集中整理了一批对日志排查、数据库查询、任务管理、代码搜索和 API 集成有实际帮助的插件。

## 仓库结构

```text
plugins/   本地插件实现
packages/  共享运行时代码和辅助模块
docs/      开发说明与参考资料
scripts/   元数据生成、打包、校验与迁移脚本
```

## 给插件作者

如果你想贡献插件或改进共享工具：

- 在 [`plugins/`](plugins/) 中新增或修改插件
- 在 `plugins/<name>/plugin.config.ts` 中维护共享元数据
- 元数据变化后运行 `npm run generate:plugins`
- 使用 `npm run pack:plugins` 在 `.build/plugins/` 下生成干净的可安装产物
- 提交前先运行校验

常用命令：

```bash
npm run generate:plugins
npm run pack:plugins
npm run validate:plugin-metadata
npm run validate:plugin-packs
npm run validate:plugins
bun test ./.github/scripts/tests
```

## 延伸阅读

- [Codex 插件开发说明](docs/plugin-development/codex.md)
- [Claude Code 插件开发说明](docs/plugin-development/claude-code.md)
- [推荐外部插件](docs/recommended-plugins.md)
- [AGENTS.md](AGENTS.md)

## 贡献

如果你的改动能提升插件集合、共享工具，或者改善仓库的跨客户端兼容性，欢迎贡献。
