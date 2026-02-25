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
  "更新文档", "update feishu doc", "创建文档", "create doc",
  "write feishu doc", "写飞书文档", "修改飞书文档".
  Provides Feishu/Lark document operations via feishu-mcp server,
  including document search, reading, creation, block-level editing,
  folder management, and Wiki browsing.
model: sonnet
---

# Feishu Document Operations

Document operations powered by [feishu-mcp](https://github.com/cso1z/Feishu-MCP) — search, read, create, edit, and manage Feishu/Lark documents.

## CRITICAL: Credential Security

**NEVER read, open, cat, or view `.claude/.feishu.json` directly.** This file contains sensitive app_id and app_secret credentials.

## Setup

If the MCP server is not connected, guide the user:

1. Create `.claude/.feishu.json` in project root:
```json
{
  "app_id": "cli_xxxxxxxxxxxx",
  "app_secret": "xxxxxxxxxxxxxxxxxxxxxxxx",
  "auth_type": "user"
}
```

2. Restart the Claude session.

> **Strongly recommend `"auth_type": "user"`** — tenant mode cannot search Wiki documents, and document edit history won't show user identity.
> User mode triggers OAuth authorization automatically on first use.

Get credentials from [Feishu Open Platform](https://open.feishu.cn/app).

## Available MCP Tools

### Document Tools

| Tool | Description |
|------|-------------|
| `search_feishu_documents` | Search documents by keyword (covers both cloud docs and Wiki) |
| `get_feishu_document_info` | Get document metadata, verify access, resolve Wiki token to document ID |
| `get_feishu_document_blocks` | Get document block structure (hierarchical content) |
| `create_feishu_document` | Create a new document |

### Content Editing Tools

| Tool | Description |
|------|-------------|
| `batch_create_feishu_blocks` | Create multiple blocks in batch (headings, text, code, lists, etc.) |
| `update_feishu_block_text` | Update text content of an existing block |
| `delete_feishu_document_blocks` | Delete document blocks |

### Folder Tools

| Tool | Description |
|------|-------------|
| `get_feishu_folder_files` | List files in a folder |
| `create_feishu_folder` | Create a new folder |

### Advanced Tools

| Tool | Description |
|------|-------------|
| `create_feishu_table` | Create and edit tables |
| `upload_and_bind_image_to_block` | Upload and insert image (local path or URL) |
| `get_feishu_image_resource` | Get image resource from document |
| `get_feishu_whiteboard_content` | Get whiteboard content (flowcharts, mind maps, etc.) |

## CRITICAL: URL Detection

**If the user message contains a Feishu/Lark URL, skip search and extract the token directly:**

- Wiki URL: `https://xxx.feishu.cn/wiki/<token>` → `get_feishu_document_info` to resolve document ID → `get_feishu_document_blocks`
- Docx URL: `https://xxx.feishu.cn/docx/<document_id>` → `get_feishu_document_blocks` directly

## CRITICAL: Search Strategy

feishu-mcp provides a unified `search_feishu_documents` tool — no need to call multiple search endpoints.

### Step 1: Preprocess keywords

Before searching, extract effective keywords from the user query:
- **Remove dates** — "2026-02-25 data dictionary" → "data dictionary"
- **Remove punctuation and noise words**
- **Keep core terms (2-6 Chinese chars)** — Feishu search works better with short terms
- **Split long titles** — "unified cross-domain data dictionary design doc" → "cross-domain data dictionary"

### Step 2: Search

```
User: "search feishu doc: 2026-02-25 unified cross-domain data dictionary"

→ Preprocess: extract "cross-domain data dictionary" as primary keyword
→ search_feishu_documents(query="cross-domain data dictionary")
→ Present results to user
```

### Step 3: Progressive retry on empty results

If Step 2 returns 0 results, **progressively shorten keywords** and retry:

```
Round 1: "unified cross-domain data dictionary" → 0 results
Round 2: "cross-domain data dictionary"         → 0 results
Round 3: "data dictionary"                      → found!
```

**Rules:**
- Maximum 2 retries (3 rounds total)
- Each round, remove the least distinctive leading term
- If all rounds fail, inform the user and suggest providing the document URL directly

## CRITICAL: Large Document Handling

**Feishu documents can be very large (tens of thousands of characters). Fetching full content wastes tokens.**

### Strategy: Ask before fetching

After search returns results, present document metadata (title, URL) to the user and **ask what they need** before fetching full content:

1. **User just wants to confirm the document exists** → Show search results only (title, URL), do not fetch content
2. **User needs specific content** → Fetch block structure, extract relevant sections only
3. **User explicitly requests full content** → Fetch and display everything

### Strategy: Summarize by default

When fetching with `get_feishu_document_blocks`:
- If content exceeds ~3000 characters, **present a structured summary** (headings, key points, table counts) rather than dumping full text
- Tell the user the full content has been fetched and offer to show specific sections on demand
- Example response: "The document has X sections, ~Y characters. Main content: [summary]. Which section do you want to see in detail?"

## Usage Patterns

### 1. Search Documents

```
search_feishu_documents: query="keyword"
```

### 2. Read Document Content

```
# Get document info (verify access, resolve wiki token)
get_feishu_document_info: document_id="<id>"

# Get block structure
get_feishu_document_blocks: document_id="<id>"
```

### 3. Edit Document Content

```
# Get current blocks first
get_feishu_document_blocks: document_id="<id>"

# Update text in a specific block
update_feishu_block_text: document_id="<id>", block_id="<block_id>", text="new content"

# Add new blocks
batch_create_feishu_blocks: document_id="<id>", blocks=[...]

# Delete blocks
delete_feishu_document_blocks: document_id="<id>", block_ids=[...]
```

### 4. Create Documents

```
# Create a new document
create_feishu_document: title="Document Name"

# Then add content blocks
batch_create_feishu_blocks: document_id="<new_id>", blocks=[...]
```

### 5. Folder Operations

```
# List files in a folder
get_feishu_folder_files: folder_token="<token>"

# Create a new folder
create_feishu_folder: name="Folder Name", folder_token="<parent_token>"
```

## Token Optimization Tips

1. **URL direct access** — When the user message contains a Feishu URL, extract the token and skip search
2. **Keyword preprocessing** — Remove dates, punctuation; extract core short terms (2-6 chars) before searching
3. **Progressive retry** — Shorten keywords on empty results, max 2 retries
4. **Search before read** — Confirm the document exists before fetching content
5. **Summarize large docs** — For content >3000 chars, present a structured summary by default
6. **Block-level editing** — Get block structure first, locate the target block_id, then modify — avoid full-document rewrites

## CRITICAL: Error Message Rewriting

feishu-mcp error messages may reference environment variables (e.g. `FEISHU_SCOPE_VALIDATION=false`) or CLI args (e.g. `--feishu-scope-validation=false`). **This plugin uses `.claude/.feishu.json` for all configuration — do NOT pass raw env var / CLI instructions to the user.**

When an error message mentions environment variables or CLI args, **rewrite the guidance** using the JSON config equivalent:

| feishu-mcp says | Tell the user |
|-----------------|---------------|
| `FEISHU_SCOPE_VALIDATION=false` or `--feishu-scope-validation=false` | Set `"scope_validation": false` in `.claude/.feishu.json` |
| `FEISHU_AUTH_TYPE=user` or `--feishu-auth-type=user` | Set `"auth_type": "user"` in `.claude/.feishu.json` |
| Any other `FEISHU_*` / `--feishu-*` | Map to the corresponding JSON field (see config-schema.md) |

Always keep the **actionable parts** of the error (permission list, import JSON, setup steps) and only replace the config method references.

## Reference Files

- [config-schema.md](references/config-schema.md) — Config file format and field reference
- [troubleshooting.md](references/troubleshooting.md) — Common issues and solutions
