# 排查清单

本文的每一条都是真机联调时实际撞到的，按「现象 → 原因 → 处理」排列。
遇到报错先按下面第一节的顺序定位，再对照具体症状。

## 定位顺序

```bash
codearts config                      # 1. 端点/项目是否齐全；密钥只显示掩码+长度+形状判定
codearts doctor                      # 2. 配置 + 接口目录 + 连通性 + 可见项目
codearts probe <域名>                 # 3. 单个地址能不能用、是哪一类服务
codearts endpoint discover --region <r> --domain <d>   # 4. 逐服务定位端点
codearts api show <接口>              # 5. 接口的方法、路径与参数真值
codearts api call <接口> --dry-run    # 6. 先看将要发出的请求，再真调
```

报错里带 `request: GET https://...` 时，先核对那行 URL 的**域名**和**路径参数**，绝大多数问题就在这两处。

## 网关侧错误码

| 现象 | 原因 | 处理 |
|------|------|------|
| `APIGW.0101 The API does not exist or has not been published in the environment` | 该请求路径下没有发布接口。注意这是**路径级**结论：同一域名下别的路径可能正常，`codearts probe` 每个服务只探一条路径，所以它报 0101 不代表域名错。私有云每个服务一个域名且命名不统一（实测同一部署里 `cloudpipeline-ext.<region>.<domain>` 与 `cloudbuild.<region>.<domain>` 并存） | 端点决策用 `codearts endpoint discover --region <region> --domain <domain> --write`；确认某条具体路径时用 `codearts api show <接口>` |
| `APIGW.0301 ... x-auth-token not found` | 完全没带凭证 | 检查 `codearts config` 的 `authType` 与 AK/SK 是否已填 |
| `APIGW.0301 ... ak <redacted> not exist` | 签名发过去了，但这个 AK 在该部署的 IAM 里不存在（网关会回显 AK，CLI 已替换为 `<redacted>`） | 先 `codearts config` 看 AK 的**长度**是否等于 20：不等就是粘贴被截断；等于 20 再核对是否属于当前部署（不同部署的 AK 不通） |
| `APIGW.0301 ... get token error,status:400` | 网关用来换令牌的**网关鉴权项目 ID** 不对 | 在配置里填「网关鉴权项目 ID」（控制台 我的凭证 → 项目ID）。它与 CodeArts 项目 ID 常常不是同一个值 |
| `APIGW.0106 Invalid header parameter: Content-Type, enum value required` | 请求头 `Content-Type` 带了后缀（如 `;charset=utf8`），网关按枚举校验 | CLI 已固定发 `application/json`；自写脚本时照做 |
| 返回 CloudWAF 的 404 页「未找到」 | Host 不属于这个部署（典型：照抄公网文档的 `*.myhuaweicloud.com`） | 换成探测到的真实服务域名 |
| 返回跳转 SSO 的 `<script>window.location...</script>` 页 | 打到了控制台/单页应用，而不是 REST 接口 | 换 API 域名（控制台域名与 API 域名不同） |

## 判断「密钥到底对不对」（不读出密钥）

CLI 从不打印密钥明文，但会打印关于它的事实，足以把「密钥错」和「密钥对但没权限」分开：

- `codearts config` 每个密钥只显示掩码、长度和形状判定，例如
  `accessKeySecret=sk•••ted  len=18  shape=UNEXPECTED (expected 40 letters and digits; got base64-ish, 18 chars)`。
  长度或形状不对就是粘贴问题，不必再试探。
- **401/403 的报错里已经带了同样的判断**，不要再为此单独发一次请求；`codearts doctor` 给的是同一份结论。
- 判断依据是**上一次成功鉴权**——CLI 在本次运行的第一次成功请求后记下时间、端点和密钥的单向摘要。
  所以报错会直接给结论：
  - `These same credentials worked 3 minutes ago … so the key itself is unlikely to be the problem`
    → 密钥没变过，去查权限或项目作用域；
  - `These credentials have changed since they last worked …` → 先怀疑密钥本身（换过、被重置或粘贴有误）；
  - `… have not been used successfully yet` → 还没有成功基线，先跑一次只读命令（如 `codearts project list`）建立它。

记录文件是 `~/.cache/agent-plugins/codearts/verification.json`，其中**只有时间戳和一个不可逆摘要，没有任何密钥内容**；
删掉它只会丢掉这条判断依据，不影响配置。

## 数据与权限

| 现象 | 原因 | 处理 |
|------|------|------|
| 列表为空，但同一响应里 `total` 不为 0 | 该接口的分页参数语义特殊（例如构建任务列表带 `page_index=1` 会返回空） | 不带分页参数，或按该接口实际语义传；CLI 已改为本地分页 |
| `项目不存在或项目已被删除` / `当前用户没有该项目权限` | 路径里的 CodeArts 项目 ID 不对，或账号不在该项目里 | `codearts project list` 看真实项目，用 `--project <名称>` |
| 同一个错误在换项目后从「空结果」变成 `get token error,status:400` | 把 **CodeArts 项目**和**网关鉴权项目**当成了同一个 ID | 分别填写两个配置项，见 codearts-shared 的配置说明 |
| 时间显示成 `1970-01-01` | 服务用 `0` 表示「从未发生」 | CLI 已渲染为空字符串 |
| `artifact repos` 报「需要账号（租户）ID」 | 私有库列表接口要求 `tenant_id`，配置里没有、IAM 也取不到 | 用 `codearts config --ui` 打开配置页填「账号（租户）ID」（控制台 我的凭证 → 账号ID），或临时 `--tenant <id>` |
| 填了租户 ID 后 `artifact repos` 返回 `APIGW.0101` | 该部署没有发布私有库接口（`/cloudartifact/...` 整组缺失） | 改用发布库：`codearts artifact versions` / `release-files`；命令自身也会给出这个提示 |

## 项目与作用域

| 现象 | 原因 | 处理 |
|------|------|------|
| 同一个构建任务在前端、后端两个项目下都出现 | `build list` 走的是 `/v1/job/list`，它是**用户级**接口，返回你在所有项目里的任务 | 看单个项目要带 `--project <名称>`；CLI 已按 `project_id` 过滤，`flow` 也已按项目归位 |
| `api call` 报 `Missing path parameter ... project_id` | 该接口路径含 `{project_id}`，而你没有给项目 | 用 `--project <名称|ID>`（CLI 会解析成 ID 填进路径），不必手写 `--param project_id=` |
| 自己传了 `--param project_id=<ID>`，命令却仍要求选项目 | 调用方已给的值会直接使用，不再解析项目 | 若仍被要求选择，说明该接口路径里还有别的 `{...}` 占位符没填，按报错补齐 |

## CLI 与配置

| 现象 | 原因 | 处理 |
|------|------|------|
| `codearts config --ui` 长时间没有输出、看起来卡住 | 表单由该进程提供服务，在用户保存或会话超时前不会退出 | 以后台任务运行它（`AGENT_PLUGINS_UI_TIMEOUT_MS` 可缩短会话）；先 `codearts config` 确认缺哪一项 |
| 表单里某些字段不显示 | 表单元素的 `children` 引用了不存在的元素 key 时字段会静默消失 | `src/config.test.ts` 已有可达性检查，改动表单后跑 `npm test` |
| 配置里填了网关但仍连不上 | 私有云常常没有统一网关，而是每服务一个域名 | 网关留空，改用 `endpoints` 覆盖（`endpoint discover --write` 会写入） |
| TLS 证书不受信任 | 私有云使用自签/内部 CA | 配置 `insecure: true`，或让管理员换成受信证书 |
| 命令报「配置不完整」但字段都填了 | 配置里既没有网关也没有任何服务端点 | 至少要有其一：`codearts endpoint discover --write` 或填网关 |
| `--dry-run` 打出来的不是最终请求 | 场景命令通常先用一次列表调用把名称解析成 ID | 属预期；想看最终请求就先 `--format json` 拿到 ID，再用 `api call` 复现 |

## 自研与参考实现的坑

照抄公网文档或第三方 CLI 的域名与短名最容易踩：

- 公网华为云的 CodeArts 主机名由 region 派生：`<服务>-ext.<region>.myhuaweicloud.com`；
  私有云换成部署域名后，**短名也未必一致**，必须以探测结果为准。
- 有的实现把主机名硬编码进签名，再用一层网关转发（保留签名 Host）；这种方案只在网关按该 Host 路由时成立，
  换一个部署就可能整体失效。判断方法：把那个 Host 直接打到目标网关，看返回的是接口响应还是 WAF 的 404 页。
