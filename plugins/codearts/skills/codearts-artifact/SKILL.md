---
name: codearts-artifact
description: 通过 codearts CLI 操作华为云 CodeArts 制品仓库：查看仓库列表、搜索制品、上传与下载文件、查询包版本。当用户提到制品仓库、artifact、包管理、上传制品、下载制品、maven/npm/docker 私服、发布库等场景时使用。
---

# CodeArts 制品仓库

命令前缀 `codearts artifact`。配置与鉴权见 [codearts-shared](../codearts-shared/SKILL.md)，
报错对照见 [troubleshooting](../codearts-shared/references/troubleshooting.md)。

## 常用命令

```bash
codearts artifact repos [--search <关键字>] [--format-filter <格式>]
codearts artifact search <制品名> [--type <类型>] [--limit <n>]
codearts artifact upload <仓库> <本地文件> --path <仓库内路径>
codearts artifact download <仓库> <仓库内路径> --out <本地文件>
```

## 关于账号（租户）ID

部分制品仓库接口的路径需要 `{tenant_id}`（控制台「我的凭证 → 账号ID」）。
CLI 按以下顺序取值：配置里的账号 ID → 用 IAM 终端节点自动查询 → 报错提示。
临时指定用 `--tenant <id>`。

## 典型工作流

### 找仓库并看内容

```bash
codearts artifact repos --search 订单
codearts artifact search order-service --limit 20
codearts api call codeartsartifact.ListPackages --param repo_id=<仓库ID> --query page_size=20
```

### 上传 / 下载制品文件

```bash
codearts artifact upload <仓库名> ./dist/app-1.2.3.jar --path releases/1.2.3/app-1.2.3.jar
codearts artifact download <仓库名> releases/1.2.3/app-1.2.3.jar --out ./app-1.2.3.jar
```

上传和下载走二进制流；路径参数里的 `/` 需要原样保留（不要用 `--param` 传文件路径，
直接作为位置参数即可）。

## 长尾接口

制品仓库有 83 个接口，分发布库/私有库两组：

```bash
codearts api list artifact --search 版本
codearts api show codeartsartifact.<接口名>
```

常用接口 ID：

| 接口 ID | 用途 |
|---------|------|
| `codeartsartifact.ListAllRepositories` | 查询仓库列表 |
| `codeartsartifact.SearchArtifacts` | 统筹搜索制品 |
| `codeartsartifact.SearchByChecksum` | 通过 Checksum 搜索文件 |
| `codeartsartifact.ListPackages` | 查询版本视图 |
| `codeartsartifact.ListPackageVersions` | 查看包版本 |
| `codeartsartifact.ShowPackageLatestVersionInfo` | 查询包最新版本概览 |
| `codeartsartifact.ShowVersionList` | 查询发布库版本列表 |
| `codeartsartifact.ListVersionFiles` | 查询一个版本的所有文件 |
| `codeartsartifact.ListLatestVersionFiles` | 项目下所有文件的最新版本 |
| `codeartsartifact.UploadFile` | 文件上传 |
| `codeartsartifact.DownloadFile` | 文件下载 |
| `codeartsartifact.ShowStorage` | 查询仓库用量 |
| `codeartsartifact.ShowMavenInfo` | 查询租户 Maven 仓库列表和账号密码 |
| `codeartsartifact.DeletePackageVersion` | 删除版本 |
| `codeartsartifact.UpdatePackageVersionStatus` | 禁用或解除禁用版本 |
