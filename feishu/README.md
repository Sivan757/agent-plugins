# Feishu Plugin (飞书文档插件)

通过飞书官方 MCP 服务器（[@larksuiteoapi/lark-mcp](https://github.com/larksuite/lark-openapi-mcp)），为 Claude 提供飞书/Lark 文档读取、搜索、编辑、评论、Wiki 浏览和用户查询能力。

## Prerequisites (前置要求)

- Node.js >= 18
- 飞书开放平台企业自建应用（需要 App ID 和 App Secret）

## Quick Setup (快速配置)

### Step 1: Create a Feishu App (创建飞书应用)

1. 登录 [飞书开放平台](https://open.feishu.cn/app)
2. 点击「创建企业自建应用」
3. 填写应用名称和描述
4. 在「凭证与基础信息」页面获取 **App ID** 和 **App Secret**
5. 在「安全设置」中添加重定向 URL：`http://localhost:3000/callback`

### Step 2: Configure Credentials (配置凭据)

在项目根目录创建 `.claude/.feishu.json`：

```json
{
  "app_id": "cli_xxxxxxxxxxxx",
  "app_secret": "xxxxxxxxxxxxxxxxxxxxxxxx",
  "oauth": true,
  "token_mode": "user_access_token"
}
```

> 如果使用 Lark 国际版，需额外配置 `"domain": "https://open.larksuite.com"`

### Step 3: Add Document Permissions (添加文档权限)

在飞书开放平台应用设置中，开通以下权限：

- `docx:document:readonly` -- 读取文档
- `wiki:wiki:readonly` -- 读取 Wiki 知识库
- `search:docs` -- 搜索文档
- `drive:drive` -- 云空间操作
- `drive:permission` -- 权限管理

开通后需要 **发布应用版本** 并由 **企业管理员审批**。

### Step 4: Start Claude Session

启动 Claude 会话。如配置了 `"oauth": true`，首次启动会自动打开浏览器进行 OAuth 授权。完成授权后重启会话即可正常使用。

## Architecture (架构)

```
Claude Code <--stdio--> feishu-mcp-start.js <--spawn--> @larksuiteoapi/lark-mcp
```

- `feishu-mcp-start.js` — 薄封装，读取配置并启动官方 MCP 服务器
- `feishu-setup.js` — SessionStart 钩子，验证配置，首次使用时自动执行 OAuth 登录
- 官方包处理所有 MCP 协议、认证、token 刷新

## Configuration (配置)

```json
{
  "app_id": "cli_xxx",
  "app_secret": "xxx",
  "oauth": true,
  "token_mode": "user_access_token",
  "tools": "preset.doc.default",
  "language": "zh",
  "domain": "https://open.feishu.cn"
}
```

详细配置参考：[config-schema.md](skills/feishu/references/config-schema.md)

## Official Documentation (官方文档)

- [飞书开放平台](https://open.feishu.cn/document)
- [lark-openapi-mcp](https://github.com/larksuite/lark-openapi-mcp)
- [自建应用开发流程](https://open.feishu.cn/document/home/introduction-to-custom-app-development/self-built-application-development-process)
