# Agent Plugins

[English](README.md) | [简体中文](README.zh-CN.md)

一个面向真实 Agent 工作流的实用插件集合。

## 你可以用它做什么

- 从阿里云日志中排查线上问题
- 在 Agent 工作流里直接查询 MySQL 和 PostgreSQL
- 通过 MCP 对陌生代码库做语义搜索
- 管理 TickTick 任务、习惯和专注流程
- 获取 SHEIN 和 Temu 平台 API 的结构化使用指引
- 通过 Apifox CLI 管理 API 项目、运行自动化测试、处理分支协作
- 规划、排版、打包并安全暂存微信公众号和小红书内容草稿

## 示例工作流

这个仓库更适合下面这类任务：

- “帮我检查生产环境最近的支付失败日志”
- “把 Postgres 里 orders 表的 schema 给我看一下”
- “在 reporting 数据库上执行这条 MySQL 查询”
- “找一下这个服务是在哪里拼 auth header 的”
- “给今天的发布清单创建一个 TickTick 任务”
- “解释一下 Temu 订单接口和 webhook 流程”
- “用 Apifox 跑一下 checkout API 的测试套件并上传报告”
- “把这篇文章整理成微信公众号草稿包”

## 插件分类

### 系统观测

| 插件 | 作用 |
| --- | --- |
| [aliyunlog](plugins/aliyunlog) | 查询阿里云 SLS 日志，支持环境和服务维度快速定位 |

### 数据查询

| 插件 | 作用 |
| --- | --- |
| [mysql](plugins/mysql) | 支持多连接配置的 MySQL 查询，内置写语句确认保护 |
| [postgresql](plugins/postgresql) | 支持 schema 发现和参数化查询的 PostgreSQL 查询 |

### 媒体处理

| 插件 | 作用 |
| --- | --- |
| [ffmpeg](plugins/ffmpeg) | 构建并校验 FFmpeg/ffprobe 视频、音频、图像处理命令 |
| [magick](plugins/magick) | 构建 ImageMagick 转换、缩放、样图与合成工作流 |
| [real-esrgan](plugins/real-esrgan) | 用 Real-ESRGAN 放大增强位图，ImageMagick 校验 |
| [withoutbg](plugins/withoutbg) | 用 withoutbg CLI 去除图片背景 |

### 提示词管理

| 插件 | 作用 |
| --- | --- |
| [prompt-forge](plugins/prompt-forge) | 生图提示词库，基于本地 SQLite 的 RAG 检索、合成与评分 |

### 咨询建议

| 插件 | 作用 |
| --- | --- |
| [consulting-advisor](plugins/consulting-advisor) | 用权威框架进行结构化跨领域咨询 |

### 个人执行管理

| 插件 | 作用 |
| --- | --- |
| [ticktick](plugins/ticktick) | 管理 TickTick 任务、项目、习惯和效率流程 |

### 项目交付管理

| 插件 | 作用 |
| --- | --- |
| [zentao](plugins/zentao) | 通过 `zentao` CLI 查询和操作禅道项目管理数据——需求、Bug、任务、执行、测试单等（移植自 easysoft/zentao-skills） |

### 凭证管理

| 插件 | 作用 |
| --- | --- |
| [config-center](plugins/config-center) | 管理插件账密与环境配置；读取脱敏，修改经浏览器 UI |

### 电商平台 API 能力

| 插件 | 作用 |
| --- | --- |
| [ecommerce-expert](plugins/ecommerce-expert) | 提供 SHEIN 与 Temu 集成 API 的结构化参考资料，内置 Temu OpenAPI 离线镜像（209 篇接口文档、23 篇开发者指南） |

### 管理 API 项目

| 插件 | 作用 |
| --- | --- |
| [apifox](plugins/apifox) | 通过 `apifox` CLI 管理 Apifox 项目资源、运行接口自动化测试、导入导出 API 文档、处理分支协作（官方 Apifox CLI Skills） |

### 研发到运维全链路

| 插件 | 作用 |
| --- | --- |
| [codearts](plugins/codearts) | 打通华为云 CodeArts 研发到运维全链路 —— 跑流水线与编译构建、执行代码检查、管理合并请求、部署应用、搬运制品、读取知识库文档，由一个内置的 `codearts` CLI 承载，背后是 782 个接口 |

## 快速开始

优先使用官方客户端安装与插件管理方式，再从这个仓库安装你需要的插件。

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

每个插件目录都是手写的，并且就是 Claude Code 安装的东西。它不需要编译、拷贝或重新打包才能产出，所以你在 [`plugins/`](plugins/) 里读到的就是实际运行的。

## 仓库结构

```text
plugins/   插件本体——每个目录都可以直接安装
docs/      开发说明与参考资料
scripts/   元数据生成、打包、校验与开发辅助脚本
```

一个插件目录里放着自己的原生文件（`skills/`、`commands/`、`agents/`、`hooks/`、`.mcp.json`、`assets/`）、元数据源 `plugin.config.ts`；如果带 CLI，还有 `src/` 下的 TypeScript 源码和已提交的 `dist/` 产物。

共享运行时代码位于 `config-center` 插件内部（`plugins/config-center/src`），各 CLI 插件以 workspace 包 `@agent-plugins/config-center` 的形式依赖它。

## 给插件作者

如果你想贡献插件或改进共享工具：

- 直接在 [`plugins/<name>/`](plugins/) 中新增或修改插件
- 在 `plugins/<name>/plugin.config.ts` 中维护它的元数据
- 元数据变化后运行 `npm run generate:plugins`，它会刷新 `.claude-plugin/plugin.json` 与 marketplace 条目
- 只有改动 CLI 源码时才需要 `npm run build`；产物落在该插件自己的 `dist/`
- 提交前先运行校验；完整清单见 [docs/plugin-development/authoring-a-plugin.md](docs/plugin-development/authoring-a-plugin.md)

常用命令：

```bash
npm run generate:plugins
npm run build
npm run validate:plugins
bun test ./.github/scripts/tests
bash scripts/dev.sh --list
```

## 延伸阅读

- [Claude Code 插件开发说明](docs/plugin-development/claude-code.md)
- [推荐外部插件](docs/recommended-plugins.md)
- [AGENTS.md](AGENTS.md)

## 贡献

如果你的改动能提升插件集合或共享工具，欢迎贡献。
