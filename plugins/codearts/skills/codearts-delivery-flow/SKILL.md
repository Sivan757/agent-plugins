---
name: codearts-delivery-flow
description: 把 CodeArts 的各服务组合成交付流程：前后端分别做代码检查门禁、编译构建、镜像产出与部署，并在需要时串成一条链。当用户提到「给前后端配自动化构建」「加自动化检查」「构建后自动部署」「发版流程」「CI/CD 组合」「流水线怎么串」等需要跨服务编排的场景时使用；只操作单个服务时用对应服务技能（如 codearts-check、codearts-build）。
---

# 用 CodeArts 组合交付流程

本技能讲**怎么把单个命令拼成流程**。单个服务怎么做，看对应服务技能；
配置、鉴权与项目选择见 [codearts-shared](../codearts-shared/SKILL.md)；
出错了查 [codearts-shared/references/troubleshooting.md](../codearts-shared/references/troubleshooting.md)。

## 一、能力清单

| 服务 | 能做什么 | 关键命令 | 边界 |
|------|----------|----------|------|
| 流水线 pipeline | 触发已有流水线、跟踪阶段与状态、看步骤日志、停止/重试 | `pipeline run/status/runs/logs/stop` | 只跑**已存在**的流水线，不替你在 CodeArts 里设计编排 |
| 编译构建 build | 触发构建任务（可带分支与参数）、跟踪状态、查构建记录与阶段、停止 | `build list/run/status/records/record/stop` | 镜像的 `docker build/push` 步骤在构建任务内部完成，CLI 负责触发与验收 |
| 代码检查 check | 执行检查、跟踪进度、读缺陷概要与明细（级别/文件/行号/规则）、查历史 | `check list/run/status/summary/defects/history/stop` | 只读与执行；规则集配置改动走 `api call` |
| 代码托管 repo | 查仓库与分支、合并请求的查/建/合入、评审意见 | `repo list/branches/mr list|show|create|merge|comments|comment` | — |
| 部署 deploy | 查应用与环境、发起部署、查部署历史、主机集群 | `deploy apps/envs/run/history/hosts` | 发起后要用 `history` 确认结果 |
| 制品仓库 artifact | 发布库版本与文件查询、私有库搜索/上传/下载 | `artifact versions/release-files/search/repos` | 有的部署只开放发布库 |
| 知识库 wiki | 文档树、按名找文档、读文档、文件库上传下载 | `wiki tree/find/doc/files/download/upload` | — |
| 效能洞察 board | 调自助取数数据集 | `board query` | 数据集需先在 Board 控制台定义 |
| 总览 flow | 一屏汇总流水线/构建/检查/部署最新状态 | `flow [--area]` | 只读汇总 |
| 长尾 | 文档里 782 个接口任选 | `api list/show/call` | 参数错误会列出合法参数 |

## 二、组合的三条规则

1. **先探明真值，再编排**。任务名、应用名、流水线名都先用对应的 `list` 探一遍，拿到 CLI 能解析的名字；
   不要凭记忆拼 ID。
2. **把退出码当闸门**。带 `--watch` 的场景命令在终态失败时退出码非 0，可以直接 `&&` 串联：

   | 命令 | 退出码 0 | 退出码 1 |
   |------|----------|----------|
   | `pipeline run --watch` | 终态 `COMPLETED` | 失败/取消/中止，或等待超时 |
   | `build run --watch` | 构建成功 | 构建失败/中止，或等待超时 |
   | `check run --watch` | 检查成功 | 检查失败/中止，或等待超时 |
   | `deploy run` | 已受理（还要用 `history` 确认结果） | 请求失败 |

3. **缺什么就用 `api call` 补**。上面没有的能力（改规则集、改流水线定义、读构建产物清单等）都能从
   `codearts api list <服务> --search <关键字>` 找到，再用 `api call` 调；先 `--dry-run` 核对请求。

## 三、参考组合：前后端的检查 + 构建 + 镜像 + 部署

同一套流程对 `front` 和 `back` 各跑一遍，靠 `--project <项目名>` 区分（本技能不预设默认项目）。

### 方案 A：流水线已经串好了（最省事）

CodeArts 里把「代码检查 → 构建（含镜像推送）→ 部署」做成一条流水线时，CLI 只负责触发与验收：

```bash
# 1. 找到流水线
codearts pipeline list --project <项目名>

# 2. 指定分支触发并跟到终态（失败退出非 0）
codearts pipeline run <流水线名> --project <项目名> --branch main \
  --var ENV=staging --watch

# 3. 需要定位失败阶段时
codearts pipeline status <流水线名> <运行ID> --project <项目名> --format json
```

### 方案 B：只有零散的任务（用 CLI 串）

每个项目单独串一条链，任何一环失败就停：

```bash
PROJ=<项目名>
BRANCH=release/1.2

# 1. 检查门禁
codearts check run  <检查任务> --project $PROJ --watch
codearts check defects <检查任务> --project $PROJ --severity 0,1

# 2. 构建 + 镜像（镜像推送在构建任务内部，这里触发并验收）
codearts build run <构建任务> --project $PROJ --branch $BRANCH --watch

# 3. 部署
codearts deploy apps --project $PROJ                       # 先确认目标应用与最近一次状态
codearts deploy run <应用名> --param version=1.2.3 --project $PROJ
codearts deploy history <应用名> --project $PROJ --limit 3  # 确认这次是否成功
```

### 镜像产出怎么确认

CLI 不替你造镜像；镜像是构建任务（或流水线里的构建阶段）内部的一步。先看这个任务到底有没有这一步：

```bash
codearts api call codeartsbuild.ShowJobConfig_1 --param job_id=<构建任务ID> --format json
```

读 `result.steps[]`：`properties.image` 是这一步用的执行机镜像（如 `maven3.5.3-jdk8-open`），
`module_id` 是步骤类型。只有出现 docker 构建/推送类步骤，这个任务才会产出镜像；
如果只有「Maven构建」和「上传软件包到软件发布库」这类步骤，就没有镜像，需要先在控制台给任务加上
docker 步骤（或改用带镜像阶段的流水线）。判断清楚再承诺"自动化镜像"，不要把编译通过说成镜像产出。

### 一份更完整的「发版」脚本骨架

```bash
set -euo pipefail
PROJ=$1; BRANCH=$2; VERSION=$3

codearts check run  "$(codearts check list --project $PROJ --format json | jq -r '.[0].task_id')" \
  --project $PROJ --watch

codearts build run  "$(codearts build list --project $PROJ --format json | jq -r '.[0].job_id')" \
  --project $PROJ --branch "$BRANCH" --watch

codearts deploy run "<应用名>" --project $PROJ --param "version=$VERSION"
codearts deploy history "<应用名>" --project $PROJ --limit 1 --format json
```

`set -e` 让检查或构建失败时立即停下，不会带着坏产物继续部署。

## 四、前后端一起做时

- **先分别探明**：`check list` / `build list` / `deploy apps` 各自带 `--project` 跑一遍，
  把两边的任务名与差异记下来（前端的检查任务和后端往往不是同一个，分支策略也可能不同）。
- **再决定粒度**：两边流程完全一致时，用同一个脚本传项目名；差异较大时，各写一条链。
- **最后统一看板**：`codearts flow` 不带 `--project` 时会自动遍历所有可见项目，一屏给出跨项目总览
  （表格里带 `project` 列）；只看某一个项目时再加 `--project <项目>`。

## 五、做不到的事，以及替代做法

| 想做 | CLI 是否支持 | 替代做法 |
|------|--------------|----------|
| 设计/修改流水线编排 | 不支持（`api call` 里的 `CreatePipelineNew` 需要完整 manifest，手写易错） | 在 CodeArts 控制台或用代码化流水线维护；CLI 负责触发与验收 |
| 打开/关闭检查规则、改规则集 | 不是场景命令 | `codearts api call codeartscheck.UpdateTaskRuleset_0 ...` 等 |
| 直接构建并推送镜像 | 不直接做 | 镜像步骤放在构建任务/流水线内，`build run --watch` 触发并验收 |
| 改 IAM 权限 | 不支持 | 找管理员；权限不足时错误信息会带服务侧错误码 |

## 六、给 Agent 的提示

- 用户说「给前后端加自动化检查/构建/镜像/部署」时，**先去两个项目里 `list` 出现状**，
  再给出「A 还是 B 方案、每个项目跑什么、失败怎么停」的具体组合，不要直接假设任务名。
- 组合方案落到脚本时，用 `set -e` 或 `&&` 利用退出码，不要用 `;`。
- 需要结构化结果时统一加 `--format json`。
- 组合中任何一步报错，先按 troubleshooting 清单定位，再继续往下走；不要跳过失败的闸门。
