---
name: codearts-board
description: 通过 codearts CLI 调用华为云 CodeArts 效能洞察的自助取数接口：按名称调用在 Board 中定义的数据集 API，传入过滤条件并读取返回的指标数据。当用户提到效能洞察、CodeArts Board、研发效能、度量指标、自助取数、数据看板等场景时使用。
---

# CodeArts 效能洞察

命令前缀 `codearts board`。配置与鉴权见 [codearts-shared](../codearts-shared/SKILL.md)，
报错对照见 [troubleshooting](../codearts-shared/references/troubleshooting.md)。

> 有的部署没有开放效能洞察接口，此时 `codearts board` 会报 `No CodeArts endpoint configured`；
> 先确认端点：`codearts endpoint list`，需要时用 `codearts endpoint set board <url>` 指定。

## 常用命令

```bash
codearts board query <自助取数API名称> [--param <名=值>]... [--limit <n>] [--offset <n>]
codearts board show <自助取数API名称>                 # 先看返回结构
```

## 使用前提

效能洞察对外只开放一个集成点：**自助取数 API**。它需要在 Board 控制台里先定义好，
发布后得到一个名称，CLI 用这个名称调用：

```
POST /v1/{project_id}/access-data-api/{api_name}?limit=&offset=
```

返回的就是该数据集定义好的字段。`--param` 会原样放进请求体，作为数据集过滤条件。

## 典型工作流

```bash
# 1. 先确认数据集名与返回结构（取 1 条）
codearts board show 需求交付周期

# 2. 按条件取数
codearts board query 需求交付周期 --param team=订单 --limit 200

# 3. 程序化处理
codearts board query 需求交付周期 --limit 500 --format json
```

数据集名称未知时，请让用户在 CodeArts Board 控制台的「自助取数」页面确认，
或在控制台里新建并发布一个取数 API 后再调用。

## 长尾接口

效能洞察仅收录 1 个公开接口：

| 接口 ID | 用途 |
|---------|------|
| `codeartsboard.invokeMetricApi` | 指标 API 调用（自助取数） |

```bash
codearts api show codeartsboard.invokeMetricApi
```
