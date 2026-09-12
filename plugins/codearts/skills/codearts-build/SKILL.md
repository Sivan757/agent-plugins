---
name: codearts-build
description: 通过 codearts CLI 操作华为云 CodeArts 编译构建：查看构建任务、按分支和参数触发构建、跟踪构建状态、查询构建记录与阶段、停止构建。当用户提到编译构建、build、触发构建、构建失败了、查看构建历史、构建产物等场景时使用。
---

# CodeArts 编译构建

命令前缀 `codearts build`。配置与鉴权见 [codearts-shared](../codearts-shared/SKILL.md)，
报错对照见 [troubleshooting](../codearts-shared/references/troubleshooting.md)。

> 任务列表接口是**用户级**的：不带 `--project` 时 `build list` 会列出你在所有项目里的任务；
> 带上 `--project` 后 `list` 与按名称解析都会限定在该项目内（找不到时会提示该任务实际属于哪个项目）。

## 常用命令

```bash
codearts build list [--search <关键字>] [--limit <n>]
codearts build show <任务名或ID>
codearts build run <任务名或ID> [--branch <分支>] [--param <名=值>]... [--watch]
codearts build status <任务名或ID>
codearts build records <任务名或ID> [--since -7d] [--limit <n>]
codearts build record <构建记录ID>
codearts build stop <任务名或ID>
```

## 典型工作流

### 触发一次构建并确认结果

```bash
codearts build list --search 订单服务
codearts build run 订单服务构建 --branch main --watch
```

`run` 会返回 `build_number` / `daily_build_number`；`--watch` 会轮询任务状态直到结束，
失败时退出码非 0。

### 查看最近构建记录与耗时

```bash
codearts build records 订单服务构建 --since -3d
codearts build record <构建记录ID>          # 含各阶段明细
```

### 带构建参数

```bash
codearts build run <任务> --param 'codeBranch=master'
```

注意`--param` 的键要写构建任务里定义的参数名（例如代码仓名称），
`--branch` 只是对 `scm.branch` 的便捷写法。

## 长尾接口

编译构建有 107 个接口（含已过时的旧接口，默认不列出）：

```bash
codearts api list build --search <关键字>
codearts api list build --include-legacy        # 需要旧接口时
codearts api show codeartsbuild.<接口名>
```

常用接口 ID：

| 接口 ID | 用途 |
|---------|------|
| `codeartsbuild.ListJob_1` | 查看用户全部构建任务列表 |
| `codeartsbuild.ListProjectJobs_1` | 查询项目任务列表 |
| `codeartsbuild.ShowJobInfo_1` | 查看构建任务信息 |
| `codeartsbuild.ExecuteJob_1` | 执行构建 |
| `codeartsbuild.ShowJobStepStatus_1` | 查询任务状态（步骤级） |
| `codeartsbuild.ShowRunningStatus_1` | 查看任务是否在构建 |
| `codeartsbuild.StopTheJob_1` | 停止构建任务 |
| `codeartsbuild.ListBuildInfoRecordByJobId_1` | 任务构建记录列表 |
| `codeartsbuild.ShowBuildRecord_1` | 查询指定构建记录详情 |
| `codeartsbuild.ShowBuildRecordFullStages_1` | 获取任务各阶段信息 |
| `codeartsbuild.ShowBuildRecordBuildScript_1` | 获取构建记录的构建脚本 |
| `codeartsbuild.ListRepoBranch_0` | 获取该任务所有分支信息 |
| `codeartsbuild.ShowReportSummary_1` | 获取覆盖率接口 |
| `codeartsbuild.ListJunitCoverageSummary_1` | 单元测试覆盖率报告列表 |
| `codeartsbuild.ShowJobBuildTime_1` | 洞察构建时长 |
| `codeartsbuild.ShowJobBuildSuccessRatio_1` | 查询构建成功率 |
| `codeartsbuild.CreateNewJob_1` | 创建构建任务 |
| `codeartsbuild.UpdateNewJob_1` | 更新构建任务 |
