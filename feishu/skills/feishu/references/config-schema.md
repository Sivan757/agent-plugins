# Configuration Reference (配置参考)

## Config File Location (配置文件位置)

插件从 `.claude/.feishu.json` 读取配置，优先查找项目根目录（git repo root），其次查找 `~/.claude/.feishu.json`。

## Schema

```json
{
  "app_id": "<your-feishu-app-id>",
  "app_secret": "<your-feishu-app-secret>",
  "oauth": true,
  "token_mode": "user_access_token",
  "tools": "preset.doc.default",
  "language": "zh",
  "domain": "https://open.feishu.cn"
}
```

## Fields

### `app_id`

| Type | Required | Description |
|------|----------|-------------|
| string | Yes | 飞书开放平台应用的 App ID |

### `app_secret`

| Type | Required | Description |
|------|----------|-------------|
| string | Yes | 飞书开放平台应用的 App Secret |

### `oauth`

| Type | Required | Default | Description |
|------|----------|---------|-------------|
| boolean | No | `false` | 启用 OAuth 用户级授权（访问个人文档需要） |

启用后，插件会在首次启动时自动打开浏览器引导用户授权。

### `token_mode`

| Type | Required | Default | Description |
|------|----------|---------|-------------|
| string | No | `auto` | API 调用身份 |

可选值：
- `auto` -- 自动选择
- `tenant_access_token` -- 应用级别（访问应用可见的文档）
- `user_access_token` -- 用户级别（访问个人文档，需配合 `oauth: true`）

### `tools`

| Type | Required | Default | Description |
|------|----------|---------|-------------|
| string | No | `preset.doc.default` | 启用的工具预设，多个用逗号分隔 |

常用预设：

| Preset | Description |
|--------|-------------|
| `preset.doc.default` | 文档操作（读取、搜索、导入、权限、Wiki） |
| `preset.default` | 完整功能（IM + 多维表格 + 文档） |
| `preset.light` | 最小功能集 |
| `preset.im.default` | 即时通讯相关 |
| `preset.base.default` | 多维表格相关 |

也可以指定具体工具名称，逗号分隔。

### `language`

| Type | Required | Default | Description |
|------|----------|---------|-------------|
| string | No | `zh` | 工具描述语言（`zh` 或 `en`） |

### `domain`

| Type | Required | Default | Description |
|------|----------|---------|-------------|
| string | No | `https://open.feishu.cn` | API 域名 |

可选值：
- `https://open.feishu.cn` -- 飞书（中国区）
- `https://open.larksuite.com` -- Lark（国际版）

## How to Create a Feishu App (创建飞书应用)

1. 登录 [飞书开放平台](https://open.feishu.cn/app)
2. 点击「创建企业自建应用」
3. 填写应用名称和描述，创建应用
4. 在「凭证与基础信息」页面获取 App ID 和 App Secret
5. 在「安全设置」中添加重定向 URL：`http://localhost:3000/callback`（OAuth 登录需要）
6. 详细文档参考：https://open.feishu.cn/document/home/introduction-to-custom-app-development/self-built-application-development-process

## Required Permissions (所需权限)

文档操作需要在飞书开放平台为应用开通以下权限：

| Permission | Scope | Description |
|------------|-------|-------------|
| `docx:document:readonly` | 应用 | 读取文档内容 |
| `docs:doc` | 应用 | 文档基础操作 |
| `drive:drive` | 应用 | 云空间文件操作 |
| `wiki:wiki:readonly` | 应用 | 读取 Wiki 知识库 |
| `search:docs` | 应用 | 搜索文档 |
| `drive:permission` | 应用 | 管理文档权限 |

开通权限后需要发布应用版本，并由企业管理员审批。

## OAuth Login (OAuth 登录)

启用 OAuth 后，首次启动会自动打开浏览器进行授权。也可手动执行：

```bash
npx -y @larksuiteoapi/lark-mcp login -a <app_id> -s <app_secret>
```

授权完成后重启 Claude 会话即可。
