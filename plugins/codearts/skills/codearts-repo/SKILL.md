---
name: codearts-repo
description: 通过 codearts CLI 操作华为云 CodeArts 代码托管：查看仓库与分支、查询和创建合并请求、合入合并请求、查看评审意见、添加评论。当用户提到代码托管、代码仓库、CodeArts Repo、合并请求、MR、PR、评审意见、分支等场景时使用。
---

# CodeArts 代码托管

命令前缀 `codearts repo`。配置与鉴权见 [codearts-shared](../codearts-shared/SKILL.md)，
报错对照见 [troubleshooting](../codearts-shared/references/troubleshooting.md)。

## 仓库身份：两种 ID，两代接口

CodeArts 仓库有两套标识：

- **数字 ID**（`repoId`）：`/v4/repositories/...` 与 `/v2/repositories/...` 系列使用
- **UUID**：`/v1/projects/{project_uuid}/...` 系列使用

`codearts repo list` 由 v1 接口提供，表格里是数字 `repository_id`，UUID 在 `--format json` 里。
后续命令只写仓库名即可，CLI 会自动选对 ID 形式。

**同一个接口常常有 v4 / v2 / v1 三代文档**，而私有云只发布它自己在用的那一代 ——
实测有部署整组 `/v4/repositories/*` 未发布，`show` 只有 `/v1`、`branches` 与合并请求走 `/v2`。
CLI 为每条命令维护了候选列表并按顺序回退（`repo show/branches/mr list/mr show/mr create/mr merge/mr comments/mr comment` 都已接入），
所以正常使用不需要关心这件事；只有当候选全部未发布时才会报
`This deployment publishes none of the documented variants`，此时用
`codearts api list repo --search <关键字>` 找该部署实际提供的接口。

## 常用命令

```bash
codearts repo list
codearts repo show <仓库>
codearts repo branches <仓库>

codearts repo mr list <仓库> [--state opened] [--limit <n>]
codearts repo mr show <仓库> <iid>
codearts repo mr create <仓库> --source <源分支> --target <目标分支> --title <标题> \
  [--description <描述>] [--reviewer-ids <id,id>] [--assignee-ids <id,id>] [--squash]
codearts repo mr merge <仓库> <iid> [--message <提交信息>] [--squash]
codearts repo mr comments <仓库> <iid>
codearts repo mr comment <仓库> <iid> --body <评论文本>
```

## 典型工作流

### 发起并合入一个合并请求

```bash
codearts repo list --format json                       # 找到仓库
codearts repo mr create 订单服务 \
  --source feature/order-timeout --target main \
  --title "修复订单超时" --description "见关联议题" --reviewer-ids <用户ID>

codearts repo mr list 订单服务 --state opened
codearts repo mr show 订单服务 <iid> --format json      # 查看可合入状态
codearts repo mr merge 订单服务 <iid>
```

### 跟进评审意见

```bash
codearts repo mr comments 订单服务 <iid> --format json
codearts repo mr comment 订单服务 <iid> --body "已按意见修改"
```

## 长尾接口

代码托管有 334 个接口，是 8 个服务里最多的一块，按需检索调用：

```bash
codearts api list repo --search 合并请求
codearts api show codeartsrepo.<接口名>
```

常用接口 ID：

| 接口 ID | 用途 |
|---------|------|
| `codeartsrepo.GetAllRepositoryByProjectId` | 获取项目下所有仓库信息 |
| `codeartsrepo.ShowRepository` | 获取仓库详情 |
| `codeartsrepo.ListBranches` | 获取分支列表 |
| `codeartsrepo.ListTags` | 获取标签列表 |
| `codeartsrepo.ShowFileContent` | 获取文件内容 |
| `codeartsrepo.ListFiles` | 获取分支目录下的文件 |
| `codeartsrepo.ListRepositoryMergeRequests` | 获取仓库合并请求列表 |
| `codeartsrepo.ShowMergeRequestDetail` | 获取合并请求详情 |
| `codeartsrepo.CreateMergeRequest` | 创建合并请求 |
| `codeartsrepo.MergeMergeRequest` | 合入合并请求 |
| `codeartsrepo.ApprovalMergeRequest` | 审核合并请求 |
| `codeartsrepo.ListMergeRequestChanges` | 获取合并请求文件变更列表 |
| `codeartsrepo.ListMergeRequestDiscussions` | 获取合并请求检视意见列表 |
| `codeartsrepo.CreateMergeRequestDiscussion_0` | 创建合并请求检视意见 |
| `codeartsrepo.ListMembers` | 获取仓库成员列表 |
| `codeartsrepo.ListProtectedBranches` | 获取仓库保护分支列表 |
| `codeartsrepo.ShowCommit` | 获取特定提交信息 |
| `codeartsrepo.ShowDiffCommit_0` | 获取提交差异 |
| `codeartsrepo.ListRepositoryWebhooks` | 获取仓库下 Webhook 列表 |
