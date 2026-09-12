---
name: codearts-deploy
description: 通过 codearts CLI 操作华为云 CodeArts 部署：查看部署应用、环境、主机集群与主机、发起部署、查询部署历史。当用户提到部署、deploy、发布到环境、上线、部署失败了、查看部署记录、主机等场景时使用。
---

# CodeArts 部署

命令前缀 `codearts deploy`。配置与鉴权见 [codearts-shared](../codearts-shared/SKILL.md)，
报错对照见 [troubleshooting](../codearts-shared/references/troubleshooting.md)。

## 常用命令

```bash
codearts deploy apps
codearts deploy app <应用名或ID>
codearts deploy envs <应用名或ID>
codearts deploy run <应用名或ID> [--param <名=值>]...
codearts deploy history <应用名或ID> [--since -7d] [--limit <n>]
codearts deploy hosts [--cluster <主机集群ID>]
```

## 典型工作流

### 部署一个应用

```bash
codearts deploy apps                                   # 找到应用
codearts deploy envs 订单服务                           # 确认目标环境
codearts deploy run 订单服务 --param version=1.2.3
codearts deploy history 订单服务 --limit 5              # 确认这次是否成功
```

`run` 返回 `record_id`，用 `deploy history` 或 `--format json` 跟踪这次记录的状态。

### 排查部署失败

```bash
codearts deploy app 订单服务 --format json              # 应用配置与最近状态
codearts deploy history 订单服务 --since -1d --format json
codearts api call codeartsdeploy.ShowExecutionParams --param task_id=<应用ID>
```

### 主机侧信息

```bash
codearts deploy hosts                                   # 主机集群列表
codearts deploy hosts --cluster <集群ID>                 # 集群下的主机
```

## 状态取值

部署应用/记录状态常见取值：`success`、`failed`、`running`、`pending`、`canceled`、
`waiting`。`execution_state` 表示最近一次部署的结果。

## 长尾接口

部署有 51 个接口：

```bash
codearts api list deploy --search <关键字>
codearts api show codeartsdeploy.<接口名>
```

常用接口 ID：

| 接口 ID | 用途 |
|---------|------|
| `codeartsdeploy.ListAllApp` | 获取应用列表（推荐） |
| `codeartsdeploy.ShowAppDetailById` | 获取应用详情 |
| `codeartsdeploy.StartDeployTask` | 部署应用 |
| `codeartsdeploy.ListDeployTaskHistoryByDate` | 应用历史部署记录 |
| `codeartsdeploy.ShowExecutionParams` | 查询部署记录的执行参数 |
| `codeartsdeploy.ListTaskSuccessRate` | 应用部署成功率 |
| `codeartsdeploy.ShowProjectSuccessRate` | 项目部署成功率 |
| `codeartsdeploy.ListEnvironments` | 查询应用下环境列表 |
| `codeartsdeploy.CreateEnvironment` | 应用下创建环境 |
| `codeartsdeploy.UpdateEnvironment` | 应用下编辑环境 |
| `codeartsdeploy.ListEnvironmentHosts` | 查询环境内的主机列表 |
| `codeartsdeploy.ListHostClusters` | 查询主机集群列表 |
| `codeartsdeploy.ListNewHosts` | 查询主机列表 |
| `codeartsdeploy.CreateApp` | 新建应用 |
| `codeartsdeploy.UpdateAppInfo` | 更新应用 |
| `codeartsdeploy.UpdateAppDisableStatus` | 禁用/取消禁用应用 |
| `codeartsdeploy.CopyApplication` | 复制应用 |
