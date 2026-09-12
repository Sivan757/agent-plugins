---
name: codearts-pipeline
description: 通过 codearts CLI 操作华为云 CodeArts 流水线：查看流水线列表与最近运行、按分支和变量启动流水线、跟踪运行状态与阶段、查看执行日志、停止或重试运行。当用户提到流水线、pipeline、触发构建发布、查看流水线跑得怎么样、重新跑一次、停掉流水线等场景时使用。
---

# CodeArts 流水线

命令前缀 `codearts pipeline`。配置与鉴权见 [codearts-shared](../codearts-shared/SKILL.md)，
报错对照见 [troubleshooting](../codearts-shared/references/troubleshooting.md)。

## 常用命令

```bash
codearts pipeline list [--search <关键字>] [--limit <n>]
codearts pipeline run <流水线名或ID> [--branch <分支>] [--var <名=值>]... [--watch]
codearts pipeline status <流水线名或ID> [运行ID]
codearts pipeline runs <流水线名或ID> [--limit <n>]
codearts pipeline logs <流水线名或ID> <运行ID> --job-run-id <id> --step-run-id <id>
codearts pipeline stop <流水线名或ID> <运行ID>
```

流水线参数支持名称或 ID 两种写法；名称重复时会报错并列出候选 ID。

## 典型工作流

### 发布一个分支

```bash
# 1. 确认目标流水线
codearts pipeline list --search 发布

# 2. 指定分支与变量启动，并跟踪到结束
codearts pipeline run 发布流水线 --branch release/1.2 --var ENV=staging --watch

# 3. 需要更细的阶段结果
codearts pipeline status 发布流水线 <运行ID> --format json
```

`--watch` 会在状态进入终态后返回；失败时退出码非 0，并打印各阶段状态。
等待超时默认 1800 秒，可用 `--watch-timeout <秒>` 调整。

### 排查一次失败

```bash
codearts pipeline status <流水线> <运行ID> --format json     # 找到失败的 job_run_id / step_run_id
codearts pipeline logs <流水线> <运行ID> \
  --job-run-id <job_run_id> --step-run-id <step_run_id>
```

### 复杂源配置

`--var` 只覆盖变量；源分支以外的源配置（多代码源、标签触发等）用 `--sources` 传完整 JSON：

```bash
codearts pipeline run <流水线> --sources '[{"type":"code","params":{"build_params":{"build_type":"branch","target_branch":"main"}}}]'
```

## 状态取值

流水线运行状态常见取值：`RUNNING`、`COMPLETED`、`FAILED`、`CANCELED`、`PAUSED`。
阶段状态除上述外还有 `INIT`、`IGNORED`、`SKIPPED`。

## 长尾接口

流水线有 166 个接口，除了上面的场景命令，其余按需直接调用：

```bash
codearts api list pipeline --search <关键字>
codearts api show codeartspipeline.<接口名>
```

常用接口 ID：

| 接口 ID | 用途 |
|---------|------|
| `codeartspipeline.ListPipelines` | 获取流水线列表 / 项目下执行状况 |
| `codeartspipeline.ShowPipelineRunDetail` | 获取流水线状态 / 执行详情 |
| `codeartspipeline.ListPipelineRuns` | 获取流水线执行记录 |
| `codeartspipeline.ShowPipelineLog` | 查询流水线日志 |
| `codeartspipeline.ShowPipelineArtifacts` | 查询流水线上的构建产物 |
| `codeartspipeline.ListRuntimeVars` | 获取流水线运行需要的自定义参数 |
| `codeartspipeline.RetryPipelineRun` | 重试运行流水线 |
| `codeartspipeline.AcceptManualReview` | 通过人工审核 |
| `codeartspipeline.RejectManualReview` | 驳回人工审核 |
| `codeartspipeline.AcceptCheckpoint` | 手动卡点通过 |
| `codeartspipeline.ListPipelineQueue` | 查询排队中的记录 |
| `codeartspipeline.UpdatePipelineInfo` | 修改流水线信息 |
