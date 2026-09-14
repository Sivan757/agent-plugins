# teams 插件重建任务书

> 面向对象：一个**没有任何历史上下文的 Agent**。读完这一份就能开工，不需要追问背景。
> 内容：原始需求、硬边界、4.1 版本踩过的坑、**参考源清单**、目标架构、能力盘点、行动方案、完成标准。
> 相关背景：`AGENTS.md`（仓库强制规则）、`docs/plugin-development/skill-authoring.md`（skill 写法）。
>
> **参考源全部集中在 §8**——动手检索之前先读 §8.3 的两张内容地图。

---

## 1. 一句话目标

在 `plugins/teams/` 下，为团队 8 个岗位建立一套**公共、中立、可按技术域检索**的 skill 集合。
这些 skill 的知识来源必须是**公开标准**（框架 / 语言 / 工具 / 方法论）的官方文档与官方代码，
并配一份**机器可读的来源目录**，使每一项都能被独立升级替换。

---

## 2. 原始需求（确认版）

按优先级，前三条是硬约束。

| # | 需求 | 来源 |
| --- | --- | --- |
| R1 | 合并 `engineering-team` + `vendor-frontend` + `vendor-java` + `vendor-governance` 为**一个**插件，名字 `teams` | 用户指定 |
| R2 | **外部优先**：先检索市面上已有的 skill，采纳它们；**只有确认外部不存在**时才允许自建 | 用户明确纠正 |
| R3 | 自建的前提是**基于官方文档和官方代码**，产出**标准 SOP 型** skill，不是"我们项目的做法" | 用户明确要求 |
| R4 | 覆盖 8 个部门岗位（见 §7.1） | 用户口述 |
| R5 | 技能**按技术域组织** | 用户口述 |
| R6 | 生成**来源目录**，便于后续升级替换 | 用户明确要求 |
| R7 | 目标技术栈：前端 Vue 3.5 + Vite 6；后端 Java 17 + Spring Boot 3.5.9 + 微服务全家桶 | 用户给定 |
| R8 | 替换掉 4.1 版本里"不知道是怎么生成的、也没验证过效果"的示例内容 | 用户明确要求 |

### R2 / R3 的操作含义

```
遇到一个能力点
  ├─ 外部有现成 skill，且质量可核验（star / 维护活跃 / 许可清晰）
  │     → 采纳。记录来源（repo + path + 固定 ref + license + star）
  ├─ 外部有，但只是"沾边"
  │     → 不采纳。当作检索线索，继续找；找不到才进自建分支
  └─ 外部确实没有
        ├─ 该知识是**公开标准**（框架/语言/工具/方法论）→ 可自建，逐条对官方文档核验
        └─ 该知识是"我们团队/项目这样做的" → **不写进插件**
```

> 已确认的检索事实：主流 skill 目录站（claudepluginhub / skills.sh，合计约 21.7 万条 URL）
> 对 `ruoyi` / `若依` / `satoken` / `dubbo` / `nacos` 的检索命中 **0**。
> 因此 RuoYi 系统与 Liquibase 是**已确认的合法自建候选**——但前提不变：依据上游官方仓库与官方文档，
> 且必须写明**分支**（RuoYi-Cloud-Plus `2.X` 与 `6.X` 是两套不同的技术栈，见 §6.3）。

---

## 3. 不可逾越的边界（红线）

违反任意一条，整个产物作废。

| # | 红线 | 用户原话要点 |
| --- | --- | --- |
| B1 | 插件是**公共抽象层**，服务于团队内的**很多项目**，不是某个工作区里某种项目的专属物 | "我需要这个 plugin 是一个公共的抽象层……保持插件的独立性" |
| B2 | 插件内**不得**做"占位符替换"这类操作 | "我不希望所谓的'占位符替换'等操作发生在当前的 Teams 插件里面" |
| B3 | 插件**不得**替项目规定构建门禁、链接检查、文档覆盖率、仓内迁移检查 | "Plugin 本身应该是保持中立、独立的" |
| B4 | **不做** `exports2`（文档覆盖率）、**不做** `linkcheck`（链接检查）——那是工程自己的活 | "甚至你都不用去建议" |
| B5 | **不得**设计"原型 ↔ 实现对照"这类通用检查方法 | "它甚至可能只是一张图片，或者给你一个 HTML 页面让你照着去复现" |
| B6 | **不得**写死实测输出形状（命令输出、报错文本、元素 ref、状态码） | 见 §4 坑 2 |
| B7 | **不得**引入未经核验的原创断言。无法核验 → 不写 | "无法判定的必须写出来，不许默认判真" |
| B8 | **不得**在 skill 正文里出现真实部署标识（域名、区域、项目 ID、租户名） | 仓库既有规则 |
| B9 | **不得**把上游错误文本原样打印（会把凭证回显进上下文） | 仓库既有规则 |

### 准入测试（最核心的一条规则）

> 一条断言要进通用层，必须同时满足：
> 1. 它的**前提**是公开标准（框架 / 语言 / 工具 / 方法论）；
> 2. 它的**每一条断言**都能对公开源或官方文档核验。
>
> 出现"我们这儿是这样"→ 属于**项目记忆**，永不进插件。

---

## 4. 踩过的坑（4.1 版本，全部有实测证据）

### 坑 1 ｜ 溯源张冠李戴（最严重，产生了错误断言）

框架类 skill 声称"已对照上游 `dromara/RuoYi-Cloud-Plus` 核验"，实际是拿**本地 fork** 核验的。
结果产出了既不是上游、也不是本地的不稳定混合体。
**错误断言实例**："API 模块不放业务枚举"——实际该模块有 42 个 `*Enum.java`，另有 `constant/`、`event/`、`domain/`、`model/`。

**纠正**：来源目录里必须区分四类，不能混成一个 `local-derived`：

| provenance | 含义 |
| --- | --- |
| `upstream-port` | 直接采纳的第三方 skill，带 repo + ref |
| `framework-derived` | 自建，依据该框架的公开约定 / 官方文档 |
| `team-sop` | 团队**已经写成文**的标准（有出处可指） |
| `original` | 自建且无外部依据——**默认不允许**，需单独说明理由 |

并且：**核验对象必须是公开上游，不是本地 fork。**若只有本地 fork 可看，就写"未核验"，不许写成已核验。

### 坑 2 ｜ 把实测输出形状写死

一个校验代理发现 **30 处缺陷**，全部已修复（台账见当时的 `FIXES-APPLIED.md`，已随临时目录清理丢失）。
主流形态是同一类错误：

| 写死的错误内容 | 实际行为 |
| --- | --- |
| `click e15` | 真实 ref 形如 `f1e195` → 报 `Error: Ref e15 not found` |
| 小节标题"snapshot 输出形状"，正文实际是 `open` 的输出 | 张冠李戴 |
| "缺 `vitest/globals` 会导致运行时 `ReferenceError`" | 实际是类型层 `TS2593`，`vitest run` 退出码 0 |
| ESM `SyntaxError: does not provide an export named` 被判为非 RED | 归类错误 |

**其它实测打脸**：

- ops-docker：`java -Djarmode=tools -jar app.jar extract --layers` **漏了 `--launcher`** → `spring-boot-loader/` 为空 → `ClassNotFoundException: org.springframework.boot.loader.launch.JarLauncher`；"golden path" 声称"jar 就在旁边"（**假的**，jar 在 `<module>/target/`）。
- ops-kubernetes：`SKILL.md:102` 写"仓库现状 3Gi/4Gi"——实际主流是 `1Gi/2Gi/-Xmx1g`（30 份里 15 份）。这是**我自己的漏检**：扫描正则 `本仓库(目前|里|的|已)|本项目以` 没覆盖"仓库现状"这种表述。
- backend-liquibase：声称 `10-` 排在 `009-` 前面。实测顺序：`009-x → 010-x → 10-x → 100-x → 9-x`。
- backend-ruoyi-cloud-plus：只列了 3 个错误码区间（实际 **13** 个）；Mapper 泛型失败模式写反了；**"新增 Maven 模块"的路径整段缺失**。
- backend-junit5-testing：以 AssertJ 开头，而仓库实际是 JUnit 原生 315 次 vs `assertThat(` **0 次**。

**纠正**：给**形状 + 怎么读到真实值**，不给观测到的那一次的值。

### 坑 3 ｜ 自建 skill 长成了"项目知识"

从检索外部开始，中途滑向"自己写一套"。写出来的东西带着强烈的项目色彩。
**纠正**：自建必须有前置证据——先给出"外部确实没有"的检索记录，再动笔。

### 坑 4 ｜ 越界替项目做质量门禁

做了 `exports2`（文档覆盖率）和 `linkcheck`。用户判定：这是工程自己的事。
**纠正**：插件只提供知识与方法，不规定他人项目的门禁。连建议都不要给。

### 坑 5 ｜ skill 从未验证过"有用"，只验证过"没错"

所有校验都是**事实准确性**校验。从未跑过 with-skill / baseline 对照，也没有人审过输出。
**纠正**：每个自建 skill 至少要在真实任务上跑一次（见 §9 阶段 4）。

### 坑 6 ｜ 3 个自造角色定义从未验证

`product-owner`、`prototype-builder`、`test-author` 三个 agent 是我自己发明的，用户从未要求过。
**纠正**：岗位集合以 §7.1 的 8 个为准，不得增减、不得改名。

### 坑 7 ｜ 文件丢失

清理临时目录时，保留集只覆盖了 `*/report.md`、`*/trigger-prediction.md`、`review/*.md`、`review/*.json`，
把台账 `FIXES-APPLIED.md` 删掉了。
**纠正**：清理前先列全要保留的路径，宁可多留。

### 坑 8 ｜ 子代理越界写外部工作区

子代理顺着软链接把文件写进了 `zealwon` 的 `node_modules`。虽然被 gitignore、且已核对其余文件字节一致，但仍是越界。
**纠正**：派子代理时明确写只读边界；参考工作区一律只读。

---

## 5. 两个参考大仓的实证分析（本次新增）

用户指认这两个仓库"比较符合期望的大仓：有很多各种各样的技能，可以帮助各种各样的人去使用"。
以下为**实测**结构（GitHub tree API 全量拉取，`truncated: false`）。

### 5.1 `github/awesome-copilot`

规模：38,929★｜MIT｜4,376 文件｜`SKILL.md` **435** 个

| 顶层 | 文件数 | 作用 |
| --- | --- | --- |
| `skills/` | 1843 | **扁平技能池**，`skills/<name>/SKILL.md`，不按角色或域分目录 |
| `plugins/` | 309 | 100 个插件，**每个只有 `README.md` + `plugin.json`** |
| `agents/` | 222 | subagent 池 |
| `instructions/` | 193 | 指令文件池 |
| `hooks/` | 37 | |
| `extensions/` | 508 | |
| `eng/` | 42 | **治理流水线** |
| `workflows/` | 8 | 仓库自身的 agentic workflow |
| `.schemas/` | 3 | `collection` / `cookbook` / `tools` |

**这是最关键的一条**：`plugins/<name>/plugin.json` 是**纯组合清单**，不复制 skill。
例：`plugins/arch/plugin.json`

```json
{
  "name": "arch",
  "extensions": {
    "com.github.awesome-copilot": { "skills": ["./skills/doc-and-modernize/"] }
  }
}
```

即：**技能在扁平池里只存在一份，插件按需挑选子集**。这就是"一个池子服务很多种人"的实现方式。

三级组织：`skills/`（全量池）→ `plugins/`（按场景组合）→ `Collection`（跨类型捆绑，schema 允许引用
`skills/*/SKILL.md` 与 `prompts|instructions|agents/*.md`，单集合 1–50 项，带 tags）。

**溯源机制（直接对应需求 R6）**：`plugins/external.json`，实测 **54 条**，每条形如

```json
{
  "name": "anarlog",
  "version": "1.0.0",
  "repository": "https://github.com/fastrepl/anarlog",
  "license": "MIT",
  "source": { "source": "github", "repo": "fastrepl/anarlog",
              "path": "agent-plugins/anarlog",
              "sha": "cf25cb679a7ef8e6cec18e7c6c0d8a3a17e245c3" }
}
```

`eng/lib/external-plugin-source-ref-sha.mjs` 提供 `evaluateRefShaConsistency()`，
把 `ref` 解析出的 commit 与声明的 `sha` 比对——**这就是"便于升级替换"的落地形态**。
另有 `external-plugin-intake.mjs` / `external-plugin-validation.mjs` / `external-plugin-quality-gates.mjs`
组成的准入-复核流水线。

**准入门槛里有一条可直接借用**：

> 拒收 "Duplicate Existing Model Strengths Without Meaningful Uplift"——
> 只告诉模型做它本来就会做的事（如通用 TypeScript、HTML）的提交，不予采纳。

**它的短板**：Vue 覆盖几乎为零（435 个 skill 里只有 `unit-test-vue-pinia` 沾 Vue），
整体偏 Microsoft / Azure / .NET / React，深度绑定 Copilot 生态。
对我们的前端骨架（Vue 3.5 + Vite 6 + Vant 4）**不能作为主要来源**，但它的**架构与治理**是最好范本。

### 5.2 `affaan-m/ECC`

规模：256,902★｜MIT｜5,011 文件｜`SKILL.md` **903** 个

| 顶层 | 文件数 | 作用 |
| --- | --- | --- |
| `docs/` | 2139 | 其中 `ja-JP` 228 / `zh-CN` 183 / `tr` 38 / `es` 38 / `zh-TW` 16 / `ko-KR` 15 个 SKILL.md 翻译 |
| `skills/` | 934 | 扁平池，292 个一级 skill 目录 |
| `tests/` `scripts/` `schemas/` | 335 / 310 / 13 | |
| `.kiro/` `.agents/` `.cursor/` `.opencode/` | 203 / 171 / 83 / 88 | **多 harness 镜像** |
| `.claude/` `.codex/` `.codebuddy/` `.trae/` `.pi/` `.zed/` `.qwen/` `.kimi/` `.hermes/` `.gemini/` `.adal/` `.openclaw/` | 各 1–22 | 每个 harness 一份配置 |
| `rules/` `commands/` `agents/` `hooks/` | 144 / 94 / 68 / 7 | |

**特点**：同一个技能池向 ~20 个 harness 分发，`docs/` 做多语言。
知识域集中在 **agent 工程本身**（`agent-architecture-audit`、`agent-eval`、`agent-harness-construction`、
`agent-introspection-debugging`、`continuous-learning-v2` …），
再混入大量私人化的业务域（`carrier-relationship-management`、`master-agreement-generator`、
`visa-doc-translate`、`ito-baskets`）。

**它的短板**：无分域、无来源目录、无准入治理；**私货比例高**；组织方式不可复制。

**但它在内容上命中我们的栈**——`vue-patterns`、`vite-patterns`、`ui-to-vue`、
`springboot-patterns`、`springboot-security`、`springboot-tdd`、`springboot-verification`
是除 `antfu/skills` 之外**唯一直接覆盖 Vue / Vite / Spring Boot** 的来源。
结论：**架构上不可学，内容上必须逐条读**（清单见 §8.3.2）。

### 5.3 对 `teams` 的结论

| 结论 | 依据 |
| --- | --- |
| 采用 **扁平技能池 + 域前缀命名**，不用嵌套目录 | 见 §6.2 的仓库强制约束 |
| 采用 **来源目录 JSON**（repo + path + 固定 ref/sha + license + star + provenance 类型） | awesome-copilot `plugins/external.json` 已验证可行 |
| 加一条**"模型已经会的不要写"**的准入门槛 | awesome-copilot CONTRIBUTING 明文拒收 |
| **不**引入多 harness 镜像 | 本仓库只发 Claude Code（`AGENTS.md` 已定），ECC 那套是历史包袱 |
| **不**引入 Collection 抽象 | 本仓库的 `plugin.config.ts` 已是元数据源，再加一层归属不清 |
| skill 总量控制在**几十条**量级，不追求 400+ | 我们的域是 2 套具体技术栈，不是"全世界"；广度靠来源目录收录，不靠自造 |
| **两者都进来源目录**，但用途不同 | awesome-copilot = 架构与治理范本；ECC = 内容候选（§8.3） |

---

## 6. 目标架构

### 6.1 目录形状

```
plugins/teams/
├── plugin.config.ts            # 唯一元数据源（name/version/description/keywords）
├── .claude-plugin/plugin.json  # 生成，勿手改
├── skills/
│   ├── <domain>-<topic>/SKILL.md
│   └── ...
└── provenance/
    └── sources.json            # 来源目录（见 §6.4）
```

**只有 `plugin.config.ts` 与 `skills/` 是手写的。** 不需要 `package.json`（本插件不构建、不跑测试）。

### 6.2 本仓库已强制的约束（必须先读，否则白干）

来源：`.github/scripts/validate-claude-plugin-layout.ts:430-437`

```ts
const skillsDir = join(pluginRoot, "skills");
for (const skill of readdirSync(skillsDir, { withFileTypes: true })) {
  if (!skill.isDirectory()) continue;
  const skillFile = join(skillsDir, skill.name, "SKILL.md");
  if (existsSync(skillFile)) files.push(skillFile);   // 没有 SKILL.md 就静默跳过
}
```

推论（**硬约束**）：

1. skill 必须是 **`skills/<name>/SKILL.md` 一层**。写成 `skills/vue/<topic>/SKILL.md` 会被**静默漏掉**，不报错。
2. 所以"按技术域组织"只能靠 **目录名前缀**。仓库已有先例：`plugins/dsh-workflow/skills/dsh-*`（12 个中 11 个带前缀）。
3. `.claude-plugin/` 只放生成的 `plugin.json`。
4. 不要声明 `./hooks/hooks.json`；本插件不需要 hooks。
5. 不需要 MCP、command、agent（8 岗位是**受众划分**，不是 subagent 定义——见坑 6）。
6. **插件根目录可以放额外目录**，没有白名单限制。已核验：`plugins/dsh-workflow` 根下有 `scripts/` 与 `hooks/`。
   所以 §6.1 的 `provenance/` 合法。
7. `${CLAUDE_PLUGIN_ROOT}` 引用检查只遍历 `agents/` `commands/` `hooks/` `skills/` 与根 `README.md` `.mcp.json`
   （`validate-claude-plugin-layout.ts:378-386`）。因此：
   - `provenance/` 不参与该检查，里面的文件不需要 frontmatter；
   - 但**在 `SKILL.md` 里写 `${CLAUDE_PLUGIN_ROOT}/provenance/sources.json` 会被检查**，该文件必须真的存在。
8. `README.md` 可选（17 个插件里 7 个有）。建议**不加**——它的内容容易变成第二份会漂移的元数据。

推荐前缀（与 §7.2 的域一一对应）：

| 域 | 前缀 | 例 |
| --- | --- | --- |
| 产品与需求 | `product-` | `product-prd` |
| 设计 | `design-` | `design-design-system` |
| 前端 | `frontend-` | `frontend-vue-reactivity` |
| 后端 | `backend-` | `backend-spring-boot-app` |
| 数据 | `data-` | `data-liquibase-changeset` |
| API 契约 | `api-` | `api-openapi-contract` |
| 测试 | `test-` | `test-playwright-cli` |
| 部署运维 | `ops-` | `ops-docker-image` |
| 交付协作 | `delivery-` | `delivery-release-checklist` |
| 数据分析 | `analytics-` | `analytics-metric-definition` |

### 6.3 目标技术栈（8 岗位需要覆盖的域）

来源：用户给定 + 已核验的仓库构成。

**前端**：Vue 3.5 / Vite 6 / Vant 4 / Pinia 3 / vue-router 4 / TypeScript 5.6
形态：多页应用（`index.html` → `/`，`saas/index.html` → `/saas/`）

**后端**：Java 17 / Spring Boot 3.5.9 / Spring Cloud 2025 / Dubbo 3 / Nacos /
Sa-Token / MyBatis-Plus / Liquibase｜约 80 个 Maven 模块
基线：RuoYi-Cloud-Plus fork（包前缀 `org.*`、表前缀、13 个 `ServiceErrorCode` 区间）

> ⚠ **RuoYi 必须写明分支**。上游 `6.X`（默认分支）= Java 21 + Spring Boot 4.1 且**已移除多租户**；
> `2.X` = Java 17 + Spring Boot 3.5 且含 `ruoyi-common-tenant`。
> 两份参考不能混用——这正是坑 1 的成因。

### 6.4 来源目录格式（需求 R6）

`plugins/teams/provenance/sources.json`，每条：

```json
{
  "skill": "frontend-vue-reactivity",
  "provenance": "upstream-port",
  "source": {
    "repo": "antfu/skills",
    "path": "skills/vue/SKILL.md",
    "ref": "<40 位 commit sha>",
    "ref_kind": "commit",
    "license": "MIT",
    "stars": 5900,
    "checked_at": "<YYYY-MM-DD>"
  },
  "local_changes": "none | <一句话说明改了什么>"
}
```

`provenance` 取值见 §4 坑 1 的四分类。

**自建条目**（`framework-derived` / `team-sop`）必须带上核验依据：

```json
{
  "skill": "backend-liquibase-changeset",
  "provenance": "framework-derived",
  "verified_against": [
    { "kind": "official-docs", "url": "https://docs.liquibase.com/...", "checked_at": "..." },
    { "kind": "official-source", "repo": "liquibase/liquibase", "ref": "<sha>" }
  ]
}
```

这样升级时能回答两个问题：**上游变了没有？**（比对 ref）**我改了什么？**（`local_changes`）。

---

## 7. 能力清单与岗位

### 7.1 八个部门岗位（固定，不得增减）

| # | 岗位 | 前缀 |
| --- | --- | --- |
| 1 | 产品经理 | `product-` |
| 2 | UI/UX 设计 | `design-` |
| 3 | 前端开发 | `frontend-` |
| 4 | 后端开发 | `backend-` |
| 5 | 测试 | `test-` |
| 6 | 部署运维 | `ops-` |
| 7 | 项目经理 / 交付 | `delivery-` |
| 8 | 数据分析 | `analytics-` |

> 8 岗位是**受众划分**，用来判断"这条 skill 该不该存在"，不是 subagent、不写进 `agents/`。

### 7.2 能力盘点（检索用的目标清单）

按技术域列出需要覆盖的能力点。**这是检索输入，不是交付清单**——
每一条都要先走 §2 的检索分支：外部有就采纳，没有才自建。

**D1 产品与需求**（`product-`）
需求分析与用户调研｜PRD 撰写｜用户故事与验收标准｜需求拆解（Epic→Feature→Task）｜竞品分析｜原型绘制（低保真 / 高保真）

**D2 设计**（`design-`）
设计系统与 Design Token｜组件库设计规范｜页面视觉方向｜响应式与移动端适配｜可访问性 a11y｜交互与动效

**D3 前端工程**（`frontend-`）
Vue 3 组合式 API 与响应式｜组件通信与复用｜Vite 构建与多页配置｜Pinia 状态管理｜vue-router 路由与权限｜TypeScript 类型设计｜Vant 4 使用与二次封装｜样式方案｜前端性能｜错误处理与埋点

**D4 后端工程**（`backend-`）
Spring Boot 应用结构与配置｜Maven 多模块工程｜Spring Cloud 微服务｜Dubbo RPC 接口与泛化｜Nacos 配置与注册｜鉴权与授权｜事务与并发｜异常与错误码体系｜缓存｜消息队列

**D5 数据访问**（`data-`）
MyBatis-Plus 使用与分页｜数据库设计与命名规范｜SQL 编写与优化｜Liquibase changeset 管理｜数据迁移｜多租户｜Redis 使用

**D6 API 契约**（`api-`）
OpenAPI 规范撰写｜接口设计规范｜契约优先开发｜接口文档与 Mock｜接口版本与兼容

**D7 测试**（`test-`）
测试用例设计方法｜单元测试（JUnit 5 / Vitest）｜集成测试｜Testcontainers｜浏览器测试（Playwright CLI）｜契约测试｜测试数据管理｜覆盖率与质量门禁

**D8 部署运维**（`ops-`）
多阶段 Docker 镜像｜Compose 编排｜Kubernetes 清单｜Helm Chart｜CI/CD 流水线｜环境与配置管理｜发布策略与回滚｜可观测性（日志 / 指标 / 链路）｜故障排查｜容器安全加固

**D9 交付协作**（`delivery-`）
项目计划与里程碑｜排期与估点｜会议纪要与行动项｜风险与阻塞管理｜验收与交付清单｜变更管理

**D10 数据分析**（`analytics-`）
指标定义与埋点设计｜SQL 取数｜数据模型设计｜数据质量校验｜报表与看板｜A/B 实验分析

### 7.3 岗位 × 技术域 矩阵

`●` 主责　`○` 参与　`—` 不涉及

| 域 \ 岗位 | 产品 | 设计 | 前端 | 后端 | 测试 | 运维 | 交付 | 数据 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| D1 产品与需求 | ● | ○ | ○ | ○ | ○ | — | ○ | ○ |
| D2 设计 | ○ | ● | ● | — | ○ | — | — | — |
| D3 前端工程 | — | ○ | ● | ○ | ○ | ○ | — | — |
| D4 后端工程 | — | — | ○ | ● | ○ | ○ | — | — |
| D5 数据访问 | — | — | ○ | ● | ○ | ○ | — | ○ |
| D6 API 契约 | ○ | — | ● | ● | ● | — | — | ○ |
| D7 测试 | ○ | — | ● | ● | ● | ○ | — | — |
| D8 部署运维 | — | — | ○ | ○ | ○ | ● | ○ | — |
| D9 交付协作 | ● | ○ | ○ | ○ | ○ | ○ | ● | — |
| D10 数据分析 | ○ | — | ○ | ○ | ○ | — | ○ | ● |

（矩阵用于判断**重复与覆盖**：一行是"域"，一列是"岗位"。若某个域只被一个岗位标 `●`，
说明它可以写得更通用；若某行的 skill 描述里出现了岗位专属术语，说明它写窄了。）

---

## 8. 来源与检索方法

### 8.1 检索源

| 源 | 用法 |
| --- | --- |
| `https://www.claudepluginhub.com/plugins` | 站点地图 `/sitemap/0..4.xml` ≈ 196,961 URL。有 `/technologies/<slug>`（vue、vite、vitest、java、spring-boot、docker、kubernetes、helm、playwright、figma）与 `/skills` `/agents` `/commands` 及分类页 |
| `https://www.skills.sh/` | `/trending`、`/hot`、`/topic/*`、`/official`（87 owner / 342 skill）、`/audits`；站点地图 `/sitemap-skills-{1,2}.xml` 各 10k |
| `anthropics/claude-plugins-official` | 官方插件仓 |
| GitHub `gh search repos` / `gh search code` / GraphQL | 排序取 `stargazerCount`，过滤 `pushedAt` / `license` / `isArchived` |
| 框架官方文档与官方仓库 | **自建分支的唯一依据** |

### 8.2 已验证有效的检索方法

1. **拉全量站点地图再本地 grep**，不要逐页搜。
2. **GitHub GraphQL 批量查**，一次 50 个仓库拿 `stargazerCount` / `pushedAt` / `license` / `isArchived`。
3. **必须读完整 `SKILL.md`**。站点描述与正文经常不一致（这就是坑 2 的来源之一）。
4. **用框架内部符号检索，不要用框架名**。`snailjob`、`TenantHelper` 这类内部符号的命中质量远高于"ruoyi"。
5. 采纳门槛：**使用人数多、下载量多、GitHub star 多**（用户给定的可信度标准）。

### 8.3 两个大仓的内容地图（按我们的域）

> 架构结论见 §5。这里是**内容**层面的候选清单——新 Agent 按域直接去读，不用重新发现一遍。
>
> ⚠ **以下条目只按名称命中，正文一个字都没读。** 采纳前必须逐条读完整 `SKILL.md`（§8.2 第 3 条）。
> 名称命中的东西很多最后会落空，这是正常的；失败记录照样写进 `search-log.md`。
>
> 两张表里的**每个名字都在实际文件树里核对过存在**（74 + 76 条，缺失 0），`*` 通配的计数也是实测值。
> 但"名字存在"不等于"内容合格"——这仍然只是检索起点，不是采纳结论。

#### 8.3.1 `github/awesome-copilot`

它自己已经做过一轮域分组，这 100 个插件名可以直接当**参考分组**用：
`java-development`、`frontend-web-dev`、`software-engineering-team`、`devops-oncall`、`testing-automation`、
`database-data-management`、`project-planning`、`power-bi-development`、`security-best-practices`、
`accessibility-kanban`、`openapi-to-application-java-spring-boot`、`typescript-mcp-development`。

| 域 | 候选（`skills/<name>`） | 备注 |
| --- | --- | --- |
| D1 产品与需求 | `prd`、`breakdown-epic-pm`、`breakdown-feature-prd`、`create-specification`、`gen-specs-as-issues`、`create-technical-spike`、`impediment-prioritization`、`brag-sheet` | `gtm-*`（11 条）是增长/上市，**不属产品岗**，别顺手收 |
| D2 设计 | `penpot-uiux-design`、`premium-frontend-ui`、`anti-ui-slop`、`web-design-reviewer`、`landing-page-conversion-audit`、`image-annotations`、`excalidraw-diagram-generator`、`draw-io-diagram-generator`、`plantuml-ascii` | 后三条是画图，归设计或交付都行 |
| D3 前端 | `unit-test-vue-pinia`、`javascript-typescript-jest`、`gsap-framer-scroll-animation`、`next-intl-add-language`、`react*`（11 条） | **Vue/Vite 几乎空白**，主力来源只能是 `antfu/skills` |
| D4 后端 | `java-springboot`、`create-spring-boot-java-project`、`spring-boot-testing`、`java-junit`、`java-docs`、`java-refactoring-extract-method`、`java-refactoring-remove-parameter`、`java-add-graalvm-native-image-support`、`kotlin-springboot`、`dotnet-*`（5 条） | Java 侧是它相对最强的部分 |
| D5 数据 | `sql-code-review`、`sql-optimization`、`postgresql-code-review`、`postgresql-optimization`、`sql-server-table-reconciliation`、`cosmosdb-datamodeling`、`ef-core`、`snowflake-semanticview` | 无 Liquibase |
| D6 API 契约 | `openapi-to-application-code`、`aspnet-minimal-api-openapi`、`typespec-api-operations`、`typespec-create-api-plugin` | 无 Sa-Token |
| D7 测试 | `playwright-explore-website`、`playwright-generate-test`、`playwright-automation-fill-in-form`、`webapp-testing`、`scoutqa-test`、`test-gap-audit`、`eval-driven-dev`、`csharp-mstest`、`csharp-nunit`、`csharp-tunit`、`csharp-xunit`、`pester-*` | Playwright 三条优先 |
| D8 运维 | `multi-stage-dockerfile`、`containerize-aspnetcore`、`containerize-aspnet-framework`、`terraform-azurerm-set-diff-analyzer`、`import-infrastructure-as-code`、`github-actions-efficiency`、`github-actions-hardening`、`github-actions-runtime-upgrade-conventions`、`azure-*`（12 条）、`aws-*`（6 条）、`centos/debian/fedora/apple-linux-triage`、`incident-postmortem`、`devops-rollout-plan` | 强项，但云厂商绑定重，**只用通用的那几条** |
| D9 交付 | `create-implementation-plan`、`update-implementation-plan`、`create-architectural-decision-record`、`meeting-minutes`、`pr-dashboard`、`project-workflow-analysis-blueprint-generator`、`create-github-issues-feature-from-implementation-plan` | |
| D10 数据分析 | `power-bi-dax-optimization`、`power-bi-model-design-review`、`power-bi-performance-troubleshooting`、`power-bi-report-design-consultation`、`powerbi-modeling`、`fabric-lakehouse`、`bigquery-pipeline-audit`、`datanalysis-credit-risk` | Power BI 独占，我们有别的 BI 就落空 |

#### 8.3.2 `affaan-m/ECC`

> **修正 §5.2 的印象**：ECC 作为架构范本不合格，但**内容上命中了我们的栈**，
> 是除 `antfu/skills` 之外唯一直接覆盖 Vue/Vite/Spring Boot 的来源。值得逐条读。

| 域 | 候选（`skills/<name>`） | 备注 |
| --- | --- | --- |
| D1 产品与需求 | `product-capability`、`product-lens`、`market-research`、`competitive-platform-analysis`、`competitive-report-structure`、`brand-discovery`、`brand-voice` | |
| D2 设计 | `design-system`、`frontend-design-direction`、`liquid-glass-design`、`make-interfaces-feel-better`、`taste`、`taste-application`、`accessibility`、`frontend-a11y` | `taste*` 体积大（`taste-application` 有 90 个文件），谨慎 |
| D3 前端 | **`vue-patterns`、`vite-patterns`、`ui-to-vue`**、`frontend-patterns`、`react-patterns`、`nextjs-turbopack`、`nuxt4-patterns`、`angular-developer` | **前三条直接命中，最该先读** |
| D4 后端 | **`springboot-patterns`、`springboot-security`、`springboot-tdd`、`springboot-verification`**、`java-coding-standards`、`jpa-patterns`、`api-design`、`backend-patterns`、`quarkus-*`（4 条）、`kotlin-*`（5 条）、`golang-patterns` | **前四条直接命中**；`quarkus-*` 可作对照看它怎么组织"框架 + security + tdd + verification"四件套 |
| D5 数据 | `database-migrations`、`mysql-patterns`、`postgres-patterns`、`redis-patterns`、`prisma-patterns`、`clickhouse-io`、`jpa-patterns` | 无 Liquibase，但 `database-migrations` 可作方法参照 |
| D6 API 契约 | `api-design`、`contract-first`、`api-connector-builder` | |
| D7 测试 | `e2e-testing`、`browser-qa`、`tdd-workflow`、`verification-loop`、`ai-regression-testing`、`eval-harness`、`benchmark`、`benchmark-methodology` | 测试方法论比 awesome-copilot 清楚 |
| D8 运维 | `docker-patterns`、`kubernetes-patterns`、`deployment-patterns`、`production-audit`、`canary-watch`、`safety-guard`、`gateguard`、`github-ops`、`git-workflow`、`error-handling` | 无 Helm，Helm 走 `wshobson/agents` |
| D9 交付 | `architecture-decision-records`、`delivery-gate`、`plan-orchestrate`、`plan-canvas`、`team-builder`、`team-agent-orchestration`、`jira-integration`、`project-flow-ops`、`quality-nonconformance`、`documentation-lookup` | |
| D10 数据分析 | `dashboard-builder`、`data-scraper-agent`、`data-throughput-accelerator`、`click-path-audit`、`benchmark-methodology`、`cost-tracking`、`ml-adoption-playbook`、`mle-workflow`、`recsys-pipeline-architect` | 偏 ML 工程，BI 报表弱 |

### 8.4 已确认可采纳的上游（种子条目）

以下已核验（repo / 固定 commit / license / star）。直接进 `provenance/sources.json`。

| 来源仓库 | 固定 commit | License | ★ | 采纳的 skill |
| --- | --- | --- | --- | --- |
| `phuryn/pm-skills` | `18468a95b427` | MIT | 26.2k | `pm-execution/skills/create-prd` |
| `antfu/skills` | `a74f281a27da` | MIT | 5.9k | `vue`, `vite`, `vitest`, `pinia`, `vue-router-best-practices`, `vue-testing-best-practices` |
| `wshobson/agents` | `a30778f8c4e6` | MIT | 39.6k | `plugins/kubernetes-operations/skills/{k8s-manifest-generator,helm-chart-scaffolding,k8s-security-policies,gitops-workflow}` |
| `microsoft/playwright-cli` | `655530f6d0dc` | **Apache-2.0** | 13.2k | 浏览器测试 |
| `obra/superpowers` | `b36e0829c6d0` | MIT | 285k | `skills/test-driven-development` |
| `github/awesome-copilot` | `7568a482ce2d` | MIT | 38.9k | `security-review`, `sql-code-review`, `sql-optimization`, `unit-test-vue-pinia` |

### 8.5 待核验候选（按域）

以下是**结构上可能命中**、但还没读正文、或 star/许可还需要二次确认的来源。
每条都要走一遍 §2 的检索分支，读完整正文再决定。

| 域 | 候选来源 | 状态 |
| --- | --- | --- |
| D1 产品与需求 | `phuryn/pm-skills`（26.2k★ MIT）除 `pm-execution/skills/create-prd` 外还有整个 PM skill 集合，**未逐个读过** | 待核验 |
| D1 / D9 | `anthropics/claude-plugins-official` | 待核验（官方仓） |
| D3 前端 | `antfu/skills`（5.9k★ MIT）除 vue/vite/vitest/pinia/vue-router/vue-testing 六条外还有其它 skill | 待核验 |
| D3 / D7 | `giuseppe-trisciuoglio/developer-kit`（345★ MIT） | 待核验（star 偏低） |
| D4 后端 | `sivaprasadreddy/sivalabs-agent-skills`（181★ MIT） | 待核验（star 偏低） |
| D4 / D7 / D9 | `addyosmani/agent-skills`（93.6k★ MIT） | 待核验 |
| D7 测试 | `currents-dev/playwright-best-practices-skill`（375★ MIT） | 待核验（star 偏低） |
| D8 运维 | `wshobson/agents`（39.6k★ MIT）除 kubernetes-operations 四个 skill 外还有其它 plugins | 待核验 |
| D7 / D9 | `obra/superpowers`（285k★ MIT）除 `test-driven-development` 外还有其它 skill | 待核验 |
| 全域 | `github/awesome-copilot`（38.9k★ MIT）见 §8.3.1 | 名称命中，正文未读 |
| 全域 | `affaan-m/ECC`（256.9k★ MIT）见 §8.3.2 | 名称命中，正文未读 |

### 8.6 已确认"外部没有"→ 自建候选

检索过 §8.1 的站点（合计约 21.7 万条 URL），以下关键词**命中 0**：

| 关键词 | 结论 |
| --- | --- |
| `ruoyi` / `若依` | 无外部 skill。**自建**，依据上游 `dromara/RuoYi-Cloud-Plus`，**必须写明分支** |
| `satoken` / `Sa-Token` | 无外部 skill。**自建**，依据官方文档 |
| `dubbo` | 无外部 skill。**自建**，依据官方文档 |
| `nacos` | 无外部 skill。**自建**，依据官方文档 |
| Liquibase | 无外部 skill。**自建**，依据 `liquibase/liquibase` 与官方文档 |

> 自建不等于自由发挥：仍须满足 §3 的准入测试，并在 `sources.json` 里用
> `provenance: "framework-derived"` + `verified_against` 记下依据的 URL 或 commit。
>
> 因此**阶段 1 的检索记录是自建的许可证**。没有 `search-log.md` 就没有自建资格（坑 3）。

### 8.7 重新生成上面两张内容地图

不要手抄。全量 tree 用 GitHub API 拉，秒级返回，且 `truncated: false` 可信：

```bash
# 拿全量文件树（不要 git clone，awesome-copilot 有 112MB，clone 会超时）
gh api repos/github/awesome-copilot/git/trees/HEAD?recursive=1 --jq '.tree[].path' > ac.tree
gh api repos/affaan-m/ECC/git/trees/HEAD?recursive=1 --jq '.tree[].path' > ecc.tree

# 技能名（一层深）
grep -E '^skills/[^/]+/SKILL\.md$' ac.tree  | sed 's|^skills/||; s|/SKILL.md||' | sort
grep -E '^skills/[^/]+/SKILL\.md$' ecc.tree | sed 's|^skills/||; s|/SKILL.md||' | sort

# 顶层目录规模
awk -F/ 'NF>=2{print $1}' ecc.tree | sort | uniq -c | sort -rn
```

> ⚠ 采纳前**逐条重读上游正文**。不要沿用 4.1 版本里被改写过的正文——
> 那些改动没有留下 diff，无法保证与上游一致。重新拉一次原文再决定怎么改。

---

## 9. 行动方案

五个阶段，每阶段有可验收产出。**不要跳阶段。**

### 阶段 0 ｜ 准备（不写任何 skill）

- [ ] 读 `AGENTS.md`、`docs/plugin-development/skill-authoring.md`、`.github/scripts/validate-claude-plugin-layout.ts`
- [ ] 用 `skill-creator` 走一遍它的方法论（用户明确要求先读）
- [ ] 确认 §6.2 的 5 条硬约束理解了
- 产出：无（纯读）

### 阶段 1 ｜ 检索（需求 R2）

**起点不是空白**：§8.3 已经给出两个大仓按域的内容地图。不要重新发现一遍。

- [ ] 先读 §8.3.2 的 ECC 候选（`vue-patterns`、`vite-patterns`、`ui-to-vue`、`springboot-*`），**逐条读完整正文**
- [ ] 再按 §8.3.1 的 awesome-copilot 地图逐域筛
- [ ] §8.5 的待核验候选逐条落实（命中 / 不达标 / 落空）
- [ ] §8.6 的五个自建候选，确认检索仍为 0 命中
- [ ] 剩下仍未被覆盖的域，用 §8.1 的源 + §8.2 的方法做新检索
- [ ] 每条记录：命中 / 未命中 / 命中但不达标（附 repo + star + 原因）
- 产出：`provenance/search-log.md`——**未命中的记录同样重要**，它是自建分支的前置证据（坑 3）

### 阶段 2 ｜ 采纳与自建

- [ ] 命中的：**重读上游原文** → 逐条核验 → 落入 `skills/<prefix>-<topic>/`
- [ ] 未命中的：走自建，逐条对官方文档核验，标注依据 URL
- [ ] 每落一条，同时写 `provenance/sources.json` 对应条目
- 产出：`skills/` + `provenance/sources.json`

### 阶段 3 ｜ 三层验证（每一条 skill 都要过）

| 层 | 做法 | 判据 |
| --- | --- | --- |
| 1 触发预测 | **先冻结**预测的触发/不触发 prompt，再读正文 | 预测与 `description` 一致 |
| 2 任务穿透 | 拿真实任务跑一遍 | 能走到结论 |
| 3 断言核验 | 逐条断言对公开源核验 | 判定 `真实 / 错误 / 无法判定`——**"无法判定"必须写出来** |

补充（补坑 2）：**任何"输出形状"小节，必须实际跑一次再写**。

### 阶段 4 ｜ 有用性验证（补坑 5）

- [ ] 挑 5–8 条自建 skill，各跑一次 with-skill / baseline 对照
- [ ] 记录：有 skill 与没 skill 的差异；若无差异 → 该 skill 应删或重写
- 产出：验证记录

> 这是 4.1 版本完全没做的一步。宁可少交几条，也不要交一堆"没错但没用"的 skill。

### 阶段 5 ｜ 收口

- [ ] `npm run validate:plugins`
- [ ] `npm run generate:plugins`，确认生成物无手改痕迹
- [ ] 按路径显式 `git add`（**不要 `git add -A`**）
- [ ] **不 commit、不 push**，等用户批准

---

## 10. 完成标准

全部满足才算做完。

**结构**

- [ ] `plugins/teams/plugin.config.ts` 存在且是唯一手写元数据
- [ ] 每个 skill 是 `skills/<name>/SKILL.md`，**一层**，frontmatter 只有 `name` + `description`
- [ ] 目录名带 §6.2 的域前缀
- [ ] 无 `hooks.json`、无空占位、无 `agents/`、无 `commands/`、无 `.mcp.json`
- [ ] `npm run validate:plugins` 全绿

**内容**

- [ ] 每条 skill 都能回答："它的依据是哪个公开标准？"答不出 → 删
- [ ] 正文里没有真实域名 / 区域 / 项目 ID / 租户名
- [ ] 正文里没有"我们项目是这样"的表述
- [ ] 没有写死的命令输出、报错文本、元素 ref、状态码
- [ ] 没有 `exports2` / `linkcheck` / 原型对照 / 占位符替换（红线 B2、B4、B5）
- [ ] 没有替项目规定构建门禁或文档覆盖率（红线 B3）

**来源目录**

- [ ] `provenance/sources.json` 覆盖每一条 skill
- [ ] `provenance` 类型正确（`upstream-port` / `framework-derived` / `team-sop` / `original`）
- [ ] `upstream-port` 条目都有 repo + path + 40 位 commit + license + star + 核验日期
- [ ] `framework-derived` 条目都有官方文档 URL 或官方仓库 ref
- [ ] `provenance/search-log.md` 存在，未命中记录齐全
- [ ] `search-log.md` 覆盖 §8.3 的两个大仓地图、§8.5 的待核验候选、§8.6 的自建候选
- [ ] 采纳的每个 `upstream-port` 都能在 `search-log.md` 里找到对应的检索记录

**验证**

- [ ] 每条 skill 过完 §9 阶段 3 的三层验证
- [ ] §9 阶段 4 的对照验证有记录
- [ ] 所有"无法判定"的断言被显式列出，而不是默认判真

**红线**

- [ ] B1–B9 逐条自查通过

---

## 11. 一句话提醒

这个插件的价值在于**外面已经验证过的东西**，以及**它敢说自己没验证什么**。
凡是需要靠"我们这儿是这样"才能成立的句子，都不属于这里。
