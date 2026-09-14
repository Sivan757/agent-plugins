# 官方文档取用地图

## 取原始 Markdown

官方文档站为 agent 暴露了原始 Markdown，不需要浏览器渲染：

- **索引**：`https://deepseek-harness.github.io/deepseek-harness/llms.txt`
  中英双语、按主题分组的全部页面清单，每行给出该页 `.md` 地址。
- **单页规则**：页面 URL 去掉末尾斜杠，加 `.md`。
  - 中文（根路径）：`https://deepseek-harness.github.io/deepseek-harness/develop/basic/index.md`
  - 英文：`https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/publish.md`

没有 `llms-full.txt`（404），只有索引 + 逐页原始文件。

保持联网即可让指引永远跟随官方最新版；API 处于 developer preview，这一点比离线副本更重要。

## 页面地图

写插件时按需读，不要一次全拉。

### 独立仓库开发插件（主线必读）

| 页面（`.md` 路径） | 何时读 |
|---|---|
| `develop/basic/index.md` | 第一次写插件：模块形态、`apply`、`ctx.effect`、`inject` |
| `develop/basic/tool.md` | 注册模型可调用工具、`defineTool` 基本用法 |
| `develop/basic/config.md` | 加 `Config` schema、默认值、加载期校验 |
| `develop/basic/publish.md` | **打包成 bundle 与安装的唯一权威页**：两份 manifest、`dsh plugin add`、四层层序、git 安装 `prepare` 陷阱 |
| `develop/framework/index.md` | Fiber 状态机、依赖驱动的加载/卸载 |
| `develop/framework/service.md` | 对外提供服务、`Service` 基类、可选依赖 `ctx.get`、`isolate` 分组 |
| `develop/framework/events.md` | 事件四种模式、`waterfall` 的 `next()` 契约、session 事件与 Cordis 事件的区别 |

### 深入时再读

| 页面 | 用途 |
|---|---|
| `develop/practice/index.md` | 能力 seam：Service Definition / Provider / Consumer 三层拆分时机 |
| `develop/practice/llm-adapter.md` | 实现完整 LLM 后端 |
| `develop/practice/dynamic-cordis.md` | 运行时动态插件（与内置 skill `cordis-plugin-development` 同域） |
| `develop/cordis-tutorial/index.md` 及 01–07 | 从零理解 Cordis，可无 API key 跑通 |
| `reference/cordis-primer.md` | 概念速查，替代教程 |
| `reference/cordis-api/*.md` | `context` / `fiber` / `service` / `registry` / `events` 精确签名 |
| `reference/cookbook/adding-a-tool.md` | 嵌套 schema、规范值、后台任务、策略钩子、PTC、UI 卡片 |
| `reference/cookbook/extension-cookbook.md` | tool / hook / UI 三类扩展的可复制模式 |
| `reference/cookbook/adding-a-settings-card.md` | 往 Web 设置页加卡片 |
| `reference/cookbook/adding-a-package.md` | 逐文件 checklist；**注意其对象是往 harness 仓库加包**，独立仓库只借其结构 |
| `reference/subsystems/*.md` | 各子系统类型契约与生成的 Cordis surface |
| `reference/config-catalog.md` / `tool-catalog.md` | 生成的配置与工具 schema 目录 |

CLI 与 profile 的精确行为在 harness 仓库的 `apps/cli/reference/README.md`（不在文档站投影里）。

## 第二权威源：已安装包的类型

官方页面不会穷举每个方法。装了包之后，`.d.ts` 给出精确的参数与返回：

```sh
node_modules/@deepseek-ai/dsh-tools/lib/types/index.d.ts
node_modules/@deepseek-ai/dsh-llm/lib/types/index.d.ts
```

根包 `@deepseek-ai/dsh-*` 的 `exports` 也暴露 `./src/*`，需要读实现时可直接看源码。

## 不要做的事

- **不要凭记忆写 `ctx.*` API。** 这些是 pre-stable 的，字段名会变。
- **不要用第三方"插件模板"仓库当 API 依据。** 社区存在若干脚手架（`create-dsh-plugin`、`dsh-plugin-template` 等），均为个人维护、与官方无关联；它们可以作为目录结构的启发，但 `dsh`/`cordis` 的 API 与 manifest 契约一律以官方原始文档和已安装包的 `.d.ts` 为准。
- **官方没有模板仓库，也没有脚手架命令。** `deepseek-ai` 组织下只有 `deepseek-harness` 一个相关仓库；`deepseek-harness` 组织当前无公开仓库。官方 `publish.md` 曾引用的示例仓库 `deepseek-harness/turtle-ui` 已无法公开访问。参考实现看 harness 仓库内的 `packages/bundle/sdk-minimal`（最小可安装 bundle：`package.json` + `cordis.patch.yml` + `src/`）。
