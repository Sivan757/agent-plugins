---
name: codearts-wiki
description: 通过 codearts CLI 读取华为云 CodeArts 知识库：查看文档树、按名称查找文档、读取文档内容、查看与下载项目文件库文件、上传文件。当用户提到知识库、wiki、CodeArts Wiki、项目文档、需求文档、文件库等场景时使用。
---

# CodeArts 知识库

命令前缀 `codearts wiki`。配置与鉴权见 [codearts-shared](../codearts-shared/SKILL.md)，
报错对照见 [troubleshooting](../codearts-shared/references/troubleshooting.md)。

> 有的部署没有开放知识库接口，此时 `codearts wiki` 会报 `No CodeArts endpoint configured`；
> 先确认端点：`codearts endpoint list`，需要时用 `codearts endpoint set wiki <url>` 指定。

## 常用命令

```bash
codearts wiki tree                       # 项目知识库的文档树
codearts wiki find <文档名>               # 按名称找文档 ID
codearts wiki doc <文档ID>                # 打印文档内容
codearts wiki files                      # 项目文件库的文件树
codearts wiki download --id <文件ID> --out <本地路径>
codearts wiki upload <本地文件> --parent-id <目录ID>
```

## 典型工作流

### 读一份项目文档

```bash
codearts wiki tree
codearts wiki find 接口设计说明
codearts wiki doc <文档ID>
```

`wiki doc` 在响应里能找到正文时直接打印正文，否则回退成 JSON。

### 取文件库里的附件

```bash
codearts wiki files
codearts wiki download --id <文件ID> --out ./附件.pdf
```

### 上传文件到文件库

```bash
codearts wiki upload ./设计说明.docx --parent-id <目录ID>
```

`--parent-id` 取自 `codearts wiki files` 输出里目标目录的 `id`。

## 结构关系

一个项目对应一个知识库（wiki）和一个文件库（clouddrive），各自有一棵树：

- 文档树：`GET /v1/openapi/doc/{zhishiku_id}/tree`，节点 `type` 区分文档/目录
- 文件树：`GET /v1/openapi/clouddrive/{zhishiku_id}/tree`，节点即文件/目录

CLI 会自动从项目解析出这两个库的 ID，命令里不需要手填。

## 长尾接口

知识库对外只有 7 个接口：

| 接口 ID | 用途 |
|---------|------|
| `codeartswiki.ShowWikiInfo` | 根据项目 ID 获取知识库信息 |
| `codeartswiki.ShowDocTree` | 查询 Wiki 全部文档树结构 |
| `codeartswiki.ShowDocDetail` | 查询文档详情 |
| `codeartswiki.ShowCloudDriveInfo` | 根据项目 ID 获取文件库信息 |
| `codeartswiki.ShowFiletree` | 获取文件库下的文件树 |
| `codeartswiki.UploadPrjFile` | 项目上传文件 |
| `codeartswiki.DownloadFile` | 下载文件 |

```bash
codearts api show codeartswiki.ShowDocDetail
```
