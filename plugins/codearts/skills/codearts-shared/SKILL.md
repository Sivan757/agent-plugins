---
name: codearts-shared
description: 华为云 CodeArts CLI 的公共约定：网关与凭证配置、AK/SK 与 Token 两种鉴权、输出格式、项目自动解析、通用 API 调用（codearts api list/show/call）、项目按命令选择与错误自纠。当用户第一次使用 codearts、报错缺少配置/凭证、需要调用未封装接口、或需要跨服务排查时使用本技能。
---

# CodeArts CLI 公共约定

`codearts` 是华为云 CodeArts 的本地命令行工具，覆盖开发到运维全链路：
流水线（pipeline）、编译构建（build）、代码检查（check）、代码托管（repo）、
部署（deploy）、制品仓库（artifact）、知识库（wiki）、效能洞察（board）。

CLI 已打进插件，直接用 Node 运行：

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/codearts.mjs" <命令>
```

后续示例省略该前缀，写成 `codearts <命令>`。

## 铁律：凭证安全

- **不要**读取、cat、或打开 `~/.cache/agent-plugins/codearts/config.json`。
- **不要**在对话里收集 AK/SK、密码或令牌。这些值只由用户在浏览器表单里输入，不经过你。
- **需要配置时由你自己动手**：把 `codearts config --ui` 作为后台任务运行（不要只把命令丢给用户去执行），
  它会在用户机器上打开浏览器表单；用户填写并保存后命令自行退出。若浏览器没有自动打开，
  把命令输出里的 `Open the config UI at: http://localhost:<端口>` 转告用户即可。
- 需要确认配置是否存在，用 `codearts config`：密钥只输出掩码、长度和形状判定（例如 `len=18 shape=UNEXPECTED`），足以判断「是否粘全、是否同一把」而读不到密钥本身。

## 首次配置

```bash
codearts config --ui # 打开配置页，预填当前配置（后台任务运行，用户在浏览器里改）
codearts config      # 只打印当前配置（密钥脱敏）
codearts config     # 查看已配置内容（密钥只显示掩码+长度+形状判定）
codearts doctor     # 自检：配置、接口目录、连通性、可见项目
```

表单分三组，且**只显示当前鉴权方式需要的字段**：

| 分组 | 内容 |
|------|------|
| 连接 | 区域（必填）、部署域名、网关地址（可选） |
| 凭证 | 鉴权方式（必填），随后只显示 aksk 或 token 对应的字段 |
| 默认值 | 网关鉴权项目 ID、账号（租户）ID |

配置里唯一的「项目 ID」是**网关鉴权项目 ID**：它作为 `X-Project-Id` 发给网关，供其换取 IAM 令牌，
取自控制台「我的凭证 → 项目ID」。它与接口路径里的 CodeArts 项目**不是同一个值**——后者不设默认，
每条命令用 `--project <名称|ID>` 指定。填错网关鉴权项目会得到 `APIGW.0301 ... get token error,status:400`。

配置项：

| 字段 | 说明 |
|------|------|
| 网关地址 | 8 个服务共用的基地址，需带协议与端口，例如 `http://10.0.0.1:8099` |
| 鉴权方式 | `aksk`（推荐，逐请求签名）或 `token`（用 IAM 账号换 project 级令牌） |
| Access Key ID / Secret Access Key | 鉴权方式为 `aksk` 时使用 |
| IAM 终端节点 / 账号名 / IAM 用户名 / IAM 密码 | 鉴权方式为 `token` 时使用 |
| Region | 区域标识，例如 `cn-north-4`；私有云填 region0_id |
| 部署域名 | 可选；`codearts endpoint discover` 用它拼候选域名 |
| 网关鉴权项目 ID | 可选；仅当网关鉴权用的项目与请求路径里的项目不同时才需要 |
| 账号（租户）ID | 可选；少数制品仓库接口需要，未填时从 IAM 读取 |

`codearts doctor` 的项目发现失败，通常意味着网关地址写错、网络不通、证书不被信任，
或者凭证无效；错误信息会直接说明是哪一类。

若部署把某个服务放在独立域名上（私有云常见），用命令写端点，不要手工编辑配置文件：

```bash
codearts endpoint discover --region <region> --domain <domain> --write   # 自动探测并写入
codearts endpoint set <服务> <url>                                        # 手工指定单个服务
codearts endpoint list                                                    # 查看每个服务实际用哪个地址
```

## 端点与鉴权（按需查阅）

- **服务端点**：公网云由 region 派生、私有云每服务一个域名且命名不统一，用
  `codearts endpoint discover --region <region> --domain <domain> --write` 探测并写入；
  `probe` 只探一条路径，它的 `APIGW.0101` 不能判定域名错误。
  判读表与端点管理命令见 [references/endpoint-discovery.md](references/endpoint-discovery.md)。
- **鉴权**：AK/SK 与 IAM 令牌两种都支持，网关错误码的判读（哪种报错说明凭证方式不对）
  见 [references/authentication.md](references/authentication.md)。

## 项目选择

多数接口的路径里带 `{project_id}`。**CLI 不存默认项目，也不猜项目**：同一个部署下前端、后端是两个
CodeArts 项目，今天构建前端、明天构建后端，钉死一个默认值只会让另一边出错。判定顺序只有两条：

1. `--project <名称|ID>`（本次调用）—— 名称支持唯一前缀匹配，如 `--project front`
2. 可见项目只有一个时，直接用它（唯一，无歧义）

**有多个可见项目又没给 `--project` 时，命令停下并列出候选与可直接复制的写法**，不要替用户挑一个：

```
This deployment has several CodeArts projects, so one must be chosen per command:
  --project <项目名 A>   (32位十六进制项目ID)
  --project <项目名 B>   (32位十六进制项目ID)
```

```bash
codearts project list                       # 列出可见项目
codearts repo list --project <项目名>        # 按名称选（推荐写法）
codearts pipeline list --project front      # 前缀能唯一匹配时也可以
codearts project current                    # 不选项目时，这里会说明会停在哪里
```

**组合流程里每个项目都要显式带 `--project`**，同一套命令跑两遍即可（见 codearts-delivery-flow 技能）。
`flow` 是例外：不带 `--project` 时它会遍历所有可见项目，一屏给出跨项目总览。

配置里还有一个 `网关鉴权项目 ID`，那是**给网关换令牌用的**，与这里的 CodeArts 项目不是一回事，
不要互相替代 —— 弄混会得到 `get token error,status:400`。

## 输出格式

所有命令都支持：

| 选项 | 作用 |
|------|------|
| （默认） | Markdown 表格，适合人看和 Agent 阅读 |
| `--format json` | 结构化输出，需要程序化处理时使用 |
| `--format text` | 原样文本 |
| `--fields <path>` | 只保留指定路径的字段；可重复，也可逗号分隔：`--fields result.job_name --fields result.arch` 或 `--fields result.job_name,result.arch` |
| `--verbose` | 在 stderr 打印实际请求（凭证已脱敏） |
| `--dry-run` | 只打印将要发送的请求，不真正调用 |
| `--project <id>` | 覆盖本次调用的项目 |
| `--endpoint <url>` | 临时覆盖网关，用于对比环境 |

## 通用 API 调用（长尾接口）

CLI 内置了从官方文档抽取的 **782 个接口**目录，任何未封装成场景命令的接口都能直接调用。

```bash
codearts services                                  # 列出 8 个服务与接口数
codearts api list pipeline                         # 列出某服务的接口
codearts api list --search 缺陷 --method GET       # 按关键字/方法检索
codearts api list pipeline --all                    # 默认只列前 60 条，--all 取消截断
codearts api show codeartspipeline.RunPipeline     # 查看方法的路径与参数定义
codearts api show 启动流水线                        # 也支持中文名
```

调用时用 `--param` 传参，CLI 会按接口目录自动把参数放到路径、查询串或请求体：

```bash
codearts api call codeartspipeline.RunPipeline \
  --param project_id=<项目ID> \
  --param pipeline_id=<流水线ID> \
  --param 'variables=[{"name":"ENV","value":"staging"}]'
```

- 参数名写错时，报错会列出该接口合法的 path / query / body 参数，并给出近似建议。
- 嵌套字段用点号或下标：`--param sources.params.build_params.target_branch=main`。
- `--query`、`--body`、`--header` 是显式逃生口，用于文档未收录的字段：

```bash
codearts api call <接口> --query undocumented=1
codearts api call <接口> --body '{"any":"json"}'
codearts api call <接口> --body @payload.json
```

先 `--dry-run` 再真调，可以确认路径、查询串和请求体是否符合预期。

`--dry-run` 会打印将要发送的第一个请求就结束：场景命令通常先用一次列表调用把名称解析成 ID，
所以 dry-run 看到的多半是那次解析请求，而不是最终的目标请求。

## 排查清单

踩过的坑、报错码与定位顺序都整理在 [references/troubleshooting.md](references/troubleshooting.md)，
遇到任何报错先查那里，再按第一节的顺序定位。

## 错误自纠

| 现象 | 处理 |
|------|------|
| `No config found` / `configuration is incomplete` | 以后台任务运行 `codearts config --ui`，浏览器由用户填写（见上文铁律）。CLI 在配置缺失/不完整时也会自己打开表单 |
| HTTP 401 / 403 | 凭证问题。**报错里已写明**密钥的长度/形状是否符合预期、以及这组密钥上次成功是什么时候——先据此判断是密钥错还是权限不足，再决定要不要动配置；仍不确定用 `codearts doctor` |
| HTTP 404 | 路径参数（项目、流水线、仓库等 ID）不存在：先用对应的 list 命令确认真实 ID |
| `Unknown parameter "x"` | 按报错列出的合法参数重试，或 `codearts api show <接口>` |
| `Missing path parameter` | 按提示补 `--param <名字>=<值>` |
| 多个同名对象 | 用报错列出的精确 ID 重试，而不是名称 |
| 其它报错 | 查 [references/troubleshooting.md](references/troubleshooting.md)，含网关错误码逐条对照 |

## 服务地图

| 服务 | 命令前缀 | 技能 |
|------|----------|------|
| 流水线 | `codearts pipeline` | codearts-pipeline |
| 编译构建 | `codearts build` | codearts-build |
| 代码检查 | `codearts check` | codearts-check |
| 代码托管 | `codearts repo` | codearts-repo |
| 部署 | `codearts deploy` | codearts-deploy |
| 制品仓库 | `codearts artifact` | codearts-artifact |
| 知识库 | `codearts wiki` | codearts-wiki |
| 效能洞察 | `codearts board` | codearts-board |
| 全链路总览 | `codearts flow` | 本技能 |

## 全链路总览

```bash
codearts flow                       # 遍历所有可见项目，跨项目总览（带 project 列）
codearts flow --project front       # 只看某个项目
codearts flow --area pipeline       # 只看某一域
```
