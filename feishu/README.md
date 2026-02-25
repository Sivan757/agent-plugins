# Feishu Plugin (飞书文档插件)

通过 [feishu-mcp](https://github.com/cso1z/Feishu-MCP) 为 Claude 提供飞书/Lark 文档搜索、读取、创建、编辑、文件夹管理和 Wiki 浏览能力。

## Prerequisites (前置要求)

- Node.js >= 20
- 飞书开放平台企业自建应用（需要 App ID 和 App Secret）

## Quick Setup (快速配置)

### Step 1: Create a Feishu App (创建飞书应用)

1. 登录 [飞书开放平台](https://open.feishu.cn/app)
2. 点击「创建企业自建应用」
3. 填写应用名称和描述
4. 在「凭证与基础信息」页面获取 **App ID** 和 **App Secret**
5. 配置应用权限（参考 [feishu-mcp 配置教程](https://github.com/cso1z/Feishu-MCP/blob/main/FEISHU_CONFIG.md)）

### Step 2: Configure Credentials (配置凭据)

在项目根目录创建 `.claude/.feishu.json`：

```json
{
  "app_id": "cli_xxxxxxxxxxxx",
  "app_secret": "xxxxxxxxxxxxxxxxxxxxxxxx",
  "auth_type": "user"
}
```

> **强烈建议使用 `"auth_type": "user"`**，tenant 模式不支持搜索 Wiki、文档编辑记录等功能。
> 如果使用 Lark 国际版，需额外配置 `"base_url": "https://open.larksuite.com"`

### Step 3: Start Claude Session

启动 Claude 会话。如配置了 `"auth_type": "user"`，feishu-mcp 会自动引导 OAuth 授权。

## Features (功能)

- **文档搜索** -- 关键词搜索飞书文档和 Wiki
- **文档读取** -- 获取文档结构化块内容
- **文档创建** -- 创建新的飞书文档
- **文档编辑** -- 块级增/改/删（文本、标题、代码块、表格等）
- **文件夹管理** -- 浏览和创建文件夹
- **表格/图片/公式** -- 创建表格、插入图片、数学公式
- **Mermaid 图表** -- 流程图、时序图、思维导图

## Architecture (架构)

```
Claude Code <--stdio--> feishu-mcp-start.js <--spawn--> feishu-mcp (npx)
```

- `feishu-mcp-start.js` — 薄封装，读取配置并启动 feishu-mcp 服务器
- `feishu-setup.js` — SessionStart 钩子，验证配置文件
- feishu-mcp 处理所有 MCP 协议、认证、文档操作

## Configuration (配置)

```json
{
  "app_id": "cli_xxx",
  "app_secret": "xxx",
  "auth_type": "user",
  "base_url": "https://open.feishu.cn",
  "scope_validation": true,
  "log_level": "info"
}
```

详细配置参考：[config-schema.md](skills/feishu/references/config-schema.md)

## Official Documentation (官方文档)

- [feishu-mcp GitHub](https://github.com/cso1z/Feishu-MCP)
- [飞书开放平台](https://open.feishu.cn/document)
- [自建应用开发流程](https://open.feishu.cn/document/home/introduction-to-custom-app-development/self-built-application-development-process)
