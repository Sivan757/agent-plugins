---
name: feishu
description: >-
  This skill should be used when the user asks to "read feishu doc",
  "search feishu", "feishu document", "查飞书文档", "搜索飞书",
  "读取飞书文档", "飞书知识库", "查看飞书文档", "搜索知识库",
  "wiki search", "import document", "lark document", "read lark doc",
  "飞书wiki", "导入文档", "文档搜索", "查看wiki", "飞书协作",
  "get feishu doc", "feishu wiki", "查看知识库", "飞书文档内容",
  "搜索飞书文档", "lark wiki", "read document", "查文档",
  "飞书搜索", "知识库搜索", "文档权限", "编辑飞书文档",
  "更新文档", "文档评论", "update feishu doc", or "doc comments".
  Provides Feishu/Lark document operations via the official MCP server,
  including document reading, searching, editing, commenting, Wiki browsing,
  and user lookup.
model: sonnet
---

# Feishu Document Operations (飞书文档操作)

通过飞书官方 MCP 服务器（@larksuiteoapi/lark-mcp），提供飞书/Lark 文档操作能力。

## CRITICAL: Credential Security

**NEVER read, open, cat, or view `.claude/.feishu.json` directly.** 该文件包含 app_id 和 app_secret 等敏感凭据。

## Setup (初始化配置)

If the MCP server is not connected, guide the user:

1. Create `.claude/.feishu.json` in project root:
```json
{
  "app_id": "cli_xxxxxxxxxxxx",
  "app_secret": "xxxxxxxxxxxxxxxxxxxxxxxx",
  "oauth": true,
  "token_mode": "user_access_token"
}
```

2. For OAuth login, run in terminal:
```bash
npx -y @larksuiteoapi/lark-mcp login -a <app_id> -s <app_secret>
```

3. Restart the Claude session.

Get credentials from [Feishu Open Platform](https://open.feishu.cn/app).

## Available MCP Tools

The official `@larksuiteoapi/lark-mcp` package provides tools using API path naming:

### Document Tools (文档工具)

| Tool | Description | Auth |
|------|-------------|------|
| `docx_builtin_search` | 搜索云空间文档（个人文档、共享文档） | UAT only |
| `docx_v1_document_rawContent` | 获取文档纯文本内容 | UAT/TAT |
| `docx_builtin_import` | 从 Markdown 创建文档 | UAT |
| `drive_v1_permissionMember_create` | 添加文档权限 | UAT/TAT |

### Wiki Tools (知识库工具)

| Tool | Description | Auth |
|------|-------------|------|
| `wiki_v1_node_search` | 搜索 Wiki 知识库节点 | UAT/TAT |
| `wiki_v2_space_getNode` | 获取 Wiki 节点信息 | UAT/TAT |

### IM Tools (消息工具)

| Tool | Description | Auth |
|------|-------------|------|
| `im_v1_message_create` | 发送消息 | UAT/TAT |
| `im_v1_message_list` | 获取聊天历史 | UAT/TAT |
| `im_v1_chat_create` | 创建群聊 | UAT/TAT |
| `im_v1_chat_list` | 获取群聊列表 | UAT/TAT |
| `im_v1_chatMembers_get` | 获取群成员 | UAT/TAT |

### Bitable Tools (多维表格工具)

| Tool | Description | Auth |
|------|-------------|------|
| `bitable_v1_app_create` | 创建多维表格 | UAT/TAT |
| `bitable_v1_appTable_create` | 创建数据表 | UAT/TAT |
| `bitable_v1_appTable_list` | 列出数据表 | UAT/TAT |
| `bitable_v1_appTableField_list` | 列出字段 | UAT/TAT |
| `bitable_v1_appTableRecord_search` | 搜索记录 | UAT/TAT |
| `bitable_v1_appTableRecord_create` | 创建记录 | UAT/TAT |
| `bitable_v1_appTableRecord_update` | 更新记录 | UAT/TAT |

### Contact Tools (通讯录工具)

| Tool | Description | Auth |
|------|-------------|------|
| `contact_v3_user_batchGetId` | 通过邮箱/手机号获取用户ID | TAT |

> **UAT** = User Access Token (需要 OAuth 登录), **TAT** = Tenant Access Token (应用级别)

## CRITICAL: Search Strategy (搜索策略)

**Always use multi-strategy parallel search.** 飞书文档存在于不同空间，单一搜索接口无法覆盖全部：

- `docx_builtin_search` -- 搜索云空间文档（个人文档、共享给应用的文档），**不包含 Wiki**
- `wiki_v1_node_search` -- 搜索 Wiki 知识库，**不包含云空间文档**

**MUST: Call both tools in parallel**, then merge results. Example:

```
User: "搜索飞书文档 数据字典"

→ Parallel call:
  1. docx_builtin_search(search_key="数据字典", useUAT=true)
  2. wiki_v1_node_search(query="数据字典", useUAT=true)

→ Merge and present combined results to user
```

If `docx_builtin_search` returns error `"User access token is not configured"`, fall back to `wiki_v1_node_search` only.

## CRITICAL: Large Document Handling (大文档处理)

**飞书文档可能非常大（数万字）。直接获取全文会消耗大量 token。**

### Strategy: Ask before fetching (先确认再读取)

After search returns results, present document metadata (title, URL) to the user, and **ask what they need** before fetching full content:

1. **用户只想确认文档是否存在** → 仅展示搜索结果（标题、URL），不读取内容
2. **用户需要文档中的特定内容** → 先获取全文，但在回复中只摘要/提取相关部分
3. **用户明确要求全文** → 获取并展示全部内容

### Strategy: Summarize by default (默认摘要)

When fetching with `docx_v1_document_rawContent`:
- If content exceeds ~3000 characters, **present a structured summary** (headings, key points, table counts) rather than dumping full text
- Tell the user the full content has been fetched and offer to show specific sections on demand
- Example response: "文档共 X 章节，约 Y 字。主要内容：[摘要]。需要查看哪个章节的详细内容？"

## Usage Patterns (使用模式)

### 1. Search Documents (搜索文档)

**Always search in parallel** across both doc spaces and wiki spaces:

```
docx_builtin_search: { data: { search_key: "关键词" }, useUAT: true }
wiki_v1_node_search: { data: { query: "关键词" }, useUAT: true }
```

### 2. Read Document Content (读取文档内容)

Get Wiki node info first (for wiki URLs), then fetch content:

```
# For wiki URL: https://xxx.feishu.cn/wiki/P0dHwrTdtiJ6O7kUEoecQ2wgnhX
wiki_v2_space_getNode: { params: { token: "P0dHwrTdtiJ6O7kUEoecQ2wgnhX" } }
# → Returns obj_token (the actual document_id)

# Then fetch content using obj_token:
docx_v1_document_rawContent: { path: { document_id: "<obj_token>" }, useUAT: true }
```

For docx URLs (`https://xxx.feishu.cn/docx/AbCdEfGhIjKlMnOpQr`), use the token directly:
```
docx_v1_document_rawContent: { path: { document_id: "AbCdEfGhIjKlMnOpQr" }, useUAT: true }
```

### 3. Create Documents (创建文档)

Import from Markdown content:
```
docx_builtin_import: { data: { markdown: "# Title\nContent...", file_name: "文档名" }, useUAT: true }
```

### 4. User Lookup (用户查询)

通过邮箱或手机号查询用户 ID：
```
contact_v3_user_batchGetId: { data: { emails: ["user@example.com"] } }
```

### 5. Send Messages (发送消息)

```
im_v1_message_create: {
  params: { receive_id_type: "chat_id" },
  data: { receive_id: "<chat_id>", msg_type: "text", content: "{\"text\":\"消息内容\"}" }
}
```

## Token Optimization Tips (Token 优化)

1. **并行搜索** -- 同时调用 `docx_builtin_search` 和 `wiki_v1_node_search`，覆盖全部文档空间
2. **先搜后读** -- 搜索确认文档存在后再获取内容，避免浪费
3. **大文档摘要** -- 内容超过 3000 字时，默认给出结构化摘要而非全文
4. **精确关键词** -- 使用精确关键词减少无关结果
5. **useUAT 优先** -- 大多数文档操作需要 `useUAT: true`（用户级别权限更广）

## Reference Files

- [config-schema.md](references/config-schema.md) -- 配置文件格式和字段说明
- [troubleshooting.md](references/troubleshooting.md) -- 常见问题排查
