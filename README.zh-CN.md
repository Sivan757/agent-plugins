<div align="center">

  # Agent Plugins

  *面向真实 agent 工作流的实用插件*

  [English](README.md) · [简体中文](README.zh-CN.md)

  [![Validate Plugins](https://img.shields.io/github/actions/workflow/status/Sivan757/agent-plugins/validate-plugins.yml?style=flat-square&label=validate)](https://github.com/Sivan757/agent-plugins/actions/workflows/validate-plugins.yml)
  [![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22-3c873a?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
  [![Claude Code plugin](https://img.shields.io/badge/Claude%20Code-plugin-d97757?style=flat-square)](https://code.claude.com/docs/en/discover-plugins)

  [你可以做什么](#你可以做什么) · [典型用法](#典型用法) · [安装](#安装) · [插件清单](#插件清单) · [故障排查](#故障排查)

</div>

这套插件让 agent 真正够得着你的系统：拿到凭据与 API 知识、用命令行工具去操作它们，并按固定流程稳定地做对。

每个插件就是本仓库里的一个目录。你安装的就是你能直接读到的——中间没有构建步骤。

## 你可以做什么

- **排查线上问题** —— 按环境与服务在阿里云 SLS 日志里追一个错误
- **查询数据** —— 用保存好的连接跑 MySQL 与 PostgreSQL 语句，支持 schema 发现与参数化取值
- **处理媒体** —— 压缩、转换、缩放、放大图片、音频与视频，以及抠图
- **设计界面** —— 审查或重做一眼看上去就是机器生成的页面，也能从参考稿里提取设计 DNA
- **找提示词** —— 在本地提示词库里检索、评分与合成生图提示词
- **用框架做判断** —— 按问题所属领域选用权威模型，把模糊问题拆开
- **推进个人事务** —— TickTick 的任务与习惯，不用再开另一个网页
- **保持代码库健康** —— 评审标准、提交前检查、CI flake 诊断、文档与笔记治理、文案清理
- **处理凭据** —— 读取一律脱敏，修改走本地浏览器表单，不必把密钥粘进对话

## 典型用法

这类活是这套插件真正要解决的：

- 「看看线上日志里最近的支付失败」
- 「给我看 Postgres 里 orders 表的结构」
- 「把这段 4K 素材压到 1080p，并确认能正常播放」
- 「把这些商品图去背景」
- 「这个落地页看着很模板化——审一遍，把最严重的问题修掉」
- 「给今天的发布清单建一个 TickTick 任务」
- 「把这些重复的 shell 步骤沉淀成一个可复用技能」

## 环境要求

- **Claude Code**，按[官方文档](https://docs.anthropic.com/en/docs/claude-code/setup)安装
- **Node.js 22 或更新版本**，供带 CLI 的插件使用。它们以
  `node ${CLAUDE_PLUGIN_ROOT}/dist/<plugin>.mjs` 运行；`prompt-forge` 使用了内置的
  `node:sqlite`，版本下限由此而来

只带 skill 的插件，除 Claude Code 外没有额外要求。

## 快速开始

### 安装

1. 把本仓库加为 marketplace：

   ```text
   /plugin marketplace add Sivan757/agent-plugins
   ```

2. 安装你需要的插件：

   ```text
   /plugin install database@agent-plugins
   ```

3. 其余插件照此逐个安装，清单见[插件清单](#插件清单)。

> [!NOTE]
> 插件是逐个安装的。只装你要用的那些——每个插件都会把自己的描述加进每一个会话。

## 插件清单

### 观测系统

| 插件 | 作用 |
| --- | --- |
| [aliyunlog](plugins/aliyunlog) | 查询阿里云 SLS 日志，支持按环境与服务定位 |

### 查询数据

| 插件 | 作用 |
| --- | --- |
| [database](plugins/database) | 跨多个已保存连接执行 MySQL 与 PostgreSQL 语句——每个连接自带引擎类型——支持库/schema 发现、列清单、表画像，并拦截写语句 |

### 处理媒体

| 插件 | 作用 |
| --- | --- |
| [ffmpeg](plugins/ffmpeg) | 构建并校验视频、音频、图像的 FFmpeg 与 ffprobe 命令 |
| [magick](plugins/magick) | 构建 ImageMagick 工作流——转换、缩放、样图、合成，并把 Real-ESRGAN 放大与 withoutbg 抠图作为同一条流水线里可校验的步骤 |

### 设计界面

| 插件 | 作用 |
| --- | --- |
| [hallmark](plugins/hallmark) | 按一套反模板化设计规则审查、重做或新建页面，也能从参考稿里提取设计 DNA |

### 管理提示词

| 插件 | 作用 |
| --- | --- |
| [prompt-forge](plugins/prompt-forge) | 在本地 2.5 万+ 条提示词库中检索、归类、评分与合成生图提示词 |

### 获取建议

| 插件 | 作用 |
| --- | --- |
| [consulting-advisor](plugins/consulting-advisor) | 按问题所属领域选用权威框架，把模糊问题拆开 |

### 管理个人执行

| 插件 | 作用 |
| --- | --- |
| [ticktick](plugins/ticktick) | 管理 TickTick 的任务、项目、标签、习惯、看板列与专注记录 |

### 在 DeepSeek Harness 上工作

| 插件 | 作用 |
| --- | --- |
| [dsh-workflow](plugins/dsh-workflow) | 评审标准、提交前检查、CI flake 诊断、文档生命周期、Agent Notes 治理、文案与简化清理、堆叠 PR、浏览器 GIF 演示 |
| [dsh-evolve](plugins/dsh-evolve) | 用 hook 统计工具活动，识别重复调用与连续失败，并在重复工作出现时提示把它沉淀成可复用技能 |
| [dsh-plugin-creator](plugins/dsh-plugin-creator) | 在独立仓库里开发、打包、安装、调试 DeepSeek Harness 插件 |

### 管理凭据

| 插件 | 作用 |
| --- | --- |
| [config-center](plugins/config-center) | 查看与修改插件凭据；面向 agent 的读取一律脱敏，修改走浏览器表单 |

## 工作原理

一个插件由两类东西组成：**skill** 告诉 agent 这件事该怎么做；当这件事需要访问外部服务时，再加一个**内置 CLI** 去做它。CLI 由 esbuild 打包，所有依赖都被内联，因此安装后的插件不需要 `npm install`，也不带 `node_modules`。

凭据与环境状态放在本仓库之外，位于 `~/.cache/agent-plugins/<plugin>/config.json`。每个插件都会打开一个本地浏览器表单来编辑它们——由 agent 在后台执行，命令形状如下：

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/<plugin>.mjs" config --ui    # 插件自己的表单
node "${CLAUDE_PLUGIN_ROOT}/dist/config-center.mjs" edit database # 通用编辑器
```

> [!IMPORTANT]
> 读取已存的配置一律脱敏，也没有任何子命令会打印缓存路径或明文密钥。预期行为是 agent 替你打开表单，而不是让你直接输入凭据。

本 marketplace 也在本地插件之外收录了少量第三方插件，见[推荐外部插件](docs/recommended-plugins.md)。

## 故障排查

**插件说还没有任何配置。** 这时 agent 应该替你打开配置表单。如果它没有，就让 agent 打开该插件自己的表单（`config --ui`）。配置存放在 `~/.cache/agent-plugins/<plugin>/config.json`，绝不会落在你的项目里。

**内置 CLI 报模块错误。** `aliyunlog`、`config-center`、`database`、`prompt-forge`、`ticktick` 都是以 Node 程序运行的，需要 Node.js 22 或更新版本。只带 skill 的插件没有这个要求。

**会话里看不到某个插件。** 用 `/plugin` 查看已安装与已启用的插件；会话进行中才安装的插件需要重启。

**想在安装前知道某个插件会做什么。** 直接读——[`plugins/`](plugins/) 下每个目录都包含 agent 会收到的 `SKILL.md` 指令，以及描述元数据的 `plugin.config.ts`。

## 开发

[`plugins/`](plugins/) 下的每个目录就是插件本身，你编辑的源码就是要发布的产物。

```text
plugins/   插件本体——每个目录都可以直接安装
docs/      开发说明与决策记录
scripts/   元数据生成、打包、校验与开发辅助脚本
```

```bash
bash scripts/dev.sh --list        # 列出插件
bash scripts/dev.sh database      # 直接从当前工作区加载一个插件
npm run generate:plugins          # 改过 plugin.config.ts 之后
npm run build                     # 改过 CLI 源码之后
npm run validate:plugins          # 全部门禁
```

> [!TIP]
> `bash scripts/dev.sh <plugin>` 直接从工作区加载插件，所以改完 skill 或 command 只需 `/reload-plugins`，不必构建。

新增插件：[docs/plugin-development/authoring-a-plugin.md](docs/plugin-development/authoring-a-plugin.md) 是完整清单。

## 参考资源

- [新增插件](docs/plugin-development/authoring-a-plugin.md)
- [Claude Code 插件开发说明](docs/plugin-development/claude-code.md)
- [决策记录](docs/decisions/README.md)
- [推荐外部插件](docs/recommended-plugins.md)
- [仓库维护约定](AGENTS.md)
- [在 Claude Code 中发现插件](https://code.claude.com/docs/en/discover-plugins)
