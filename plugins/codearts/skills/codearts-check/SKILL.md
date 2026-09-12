---
name: codearts-check
description: 通过 codearts CLI 操作华为云 CodeArts 代码检查：查看检查任务、执行检查并跟踪进度、查询缺陷概要与缺陷明细、查看历史扫描结果、停止检查。当用户提到代码检查、codecheck、静态扫描、代码质量、缺陷、告警、门禁等场景时使用。
---

# CodeArts 代码检查

命令前缀 `codearts check`。配置与鉴权见 [codearts-shared](../codearts-shared/SKILL.md)，
报错对照见 [troubleshooting](../codearts-shared/references/troubleshooting.md)。

> 按名称解析任务时 CLI 只取前 100 个任务（服务端拒绝更大的 `limit`）。任务更多时先用
> `codearts check list` 查到 ID，再传 ID。

## 常用命令

```bash
codearts check list [--limit <n>]        # 上限 100，再大会被服务端拒绝
codearts check run <任务名或ID> [--ref merge_request] [--watch]
codearts check status <任务名或ID>
codearts check summary <任务名或ID>
codearts check defects <任务名或ID> [--severity <级别>] [--limit <n>]
codearts check history <任务名或ID> [--limit <n>]
codearts check stop <任务名或ID>
```

## 典型工作流

### 跑一次检查并看结论

```bash
codearts check list
codearts check run 订单服务检查 --watch
codearts check summary 订单服务检查
```

### 定位具体问题

```bash
# 只看致命和严重
codearts check defects 订单服务检查 --severity 0,1 --limit 100
```

缺陷字段：`level` 级别、`file` 文件、`line` 行号、`rule` 规则名、`description` 问题描述、
`defect_id` 问题 ID（可用于修改状态）。

### 修改缺陷状态

```bash
codearts api call codeartscheck.UpdateDefectStatus_0 \
  --param task_id=<任务ID> \
  --body '{"defect_id":"<问题ID>","defect_status":"1"}'
```

## 状态与级别对照

| 检查状态 | 含义 |
|----------|------|
| `checking` | 检查中 |
| `succeeded` | 检查成功 |
| `failed` | 检查失败 |
| `aborted` | 任务中止 |

| 缺陷级别 | 含义 |
|----------|------|
| `fatal` | 致命 |
| `severe` | 严重 |
| `general` | 一般 |
| `hint` | 提示 |

缺陷状态（写回时字段名是 `defect_status`）：`0` 待处理、`1` 已解决、`2` 已忽略、`3` 重新打开、`4` 待审核。

## 长尾接口

代码检查有 33 个接口：

```bash
codearts api list check --search <关键字>
codearts api show codeartscheck.<接口名>
```

常用接口 ID：

| 接口 ID | 用途 |
|---------|------|
| `codeartscheck.ShowTaskListByProjectIdV2_0` | 查询任务列表 |
| `codeartscheck.ShowTaskDetailV2_0` | 查询缺陷概要 |
| `codeartscheck.ShowTaskDefectsV2_0` | 查询缺陷详情 |
| `codeartscheck.ShowTaskDefectsStatisticV2_0` | 缺陷统计 |
| `codeartscheck.ShowProgressDetailV2_0` | 查询任务执行状态 |
| `codeartscheck.ShowTaskCmetrics_0` | 查询代码度量概要 |
| `codeartscheck.RunTaskV2_0` | 执行检查任务 |
| `codeartscheck.StopTaskByIdV2_0` | 终止检查任务 |
| `codeartscheck.CheckRecord_0` | 历史扫描结果查询 |
| `codeartscheck.ShowTasklog_0` | 查询任务检查失败日志 |
| `codeartscheck.CreateTaskV2_0` | 新建检查任务 |
| `codeartscheck.UpdateDefectStatus_0` | 修改缺陷状态 |
| `codeartscheck.ListRulesets_0` | 查询规则集列表 |
| `codeartscheck.ListRules_0` | 获取规则列表 |
