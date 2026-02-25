# Troubleshooting (常见问题排查)

## Common Errors

### Config file not found (配置文件未找到)

```
[feishu] Config file not found.
```

**解决方法**：在项目根目录或用户主目录创建 `.claude/.feishu.json`，填入 app_id 和 app_secret：

```json
{
  "app_id": "cli_xxx",
  "app_secret": "xxx"
}
```

获取凭据：https://open.feishu.cn/app

### OAuth login required (需要 OAuth 登录)

```
[feishu] OAuth token not found. Launching login (opening browser)...
```

**说明**：配置了 `"oauth": true` 但尚未完成用户授权。浏览器应自动打开，完成授权后重启 Claude 会话。

如浏览器未自动打开，手动执行：

```bash
npx -y @larksuiteoapi/lark-mcp login -a <app_id> -s <app_secret>
```

### User access token is not configured (UAT 未配置)

```
{"msg":"User access token is not configured"}
```

**说明**：`docx_builtin_search` 等工具仅支持用户级别访问（UAT），不支持应用级别（TAT）。

**解决方法**：
1. 在 `.claude/.feishu.json` 中添加 `"oauth": true` 和 `"token_mode": "user_access_token"`
2. 执行 OAuth 登录：`npx -y @larksuiteoapi/lark-mcp login -a <app_id> -s <app_secret>`
3. 重启 Claude 会话

### Search returns empty but document exists (搜索无结果但文档存在)

**原因**：飞书文档分布在不同空间，单一搜索接口无法覆盖全部：
- `docx_builtin_search` 只搜索 **云空间文档**（个人文档、共享文档），**不包含 Wiki**
- `wiki_v1_node_search` 只搜索 **Wiki 知识库**，**不包含云空间文档**

**解决方法**：**必须同时调用两个搜索接口**，合并结果。参见 SKILL.md 中的搜索策略。

### Wiki document ID mismatch (Wiki 文档 ID 不匹配)

**原因**：Wiki URL 中的 token 是 **节点 ID**（node_token），不是文档 ID（document_id）。直接用节点 ID 调用 `docx_v1_document_rawContent` 会报错。

**解决方法**：
1. 先用 `wiki_v2_space_getNode` 获取节点信息，得到 `obj_token`
2. 用 `obj_token`（实际的 document_id）调用 `docx_v1_document_rawContent`

```
URL: https://xxx.feishu.cn/wiki/P0dHwrTdtiJ6O7kUEoecQ2wgnhX
                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                    这是 node_token，不是 document_id

→ wiki_v2_space_getNode(token: "P0dHwrTdtiJ6O7kUEoecQ2wgnhX")
→ 返回 obj_token: "BafcdTAzYoQqouxlCnecpoignGe"  ← 这才是 document_id
→ docx_v1_document_rawContent(document_id: "BafcdTAzYoQqouxlCnecpoignGe")
```

### Permission denied (权限不足)

```
Error: permission denied / No permission to access this resource
```

**解决方法**：
1. 确认应用已开通所需权限（docx:document:readonly, wiki:wiki:readonly 等）
2. 确认应用版本已发布并通过管理员审批
3. 确认文档已授权给应用（应用需要被添加为文档协作者，或文档设置了「任何人可阅读」）
4. 如使用 `user_access_token` 模式，确认已完成 OAuth 登录

### Document not found / not accessible (文档不存在或无法访问)

```
Error: document not found
```

**解决方法**：
1. 确认 document_id 正确 -- 从 URL 中提取：`https://xxx.feishu.cn/docx/{document_id}`
2. 对于 Wiki URL，需要先通过 `wiki_v2_space_getNode` 获取真实的 `obj_token`
3. 确认文档未被删除
4. 确认应用/用户有权访问该文档

### MCP server failed to start (MCP 服务器启动失败)

```
[feishu] Failed to start MCP server: ...
```

**解决方法**：
1. 确认已安装 Node.js >= 18：运行 `node -v` 验证
2. 确认 npx 可用：运行 `npx --version` 验证
3. 确认网络可以访问 npm registry（首次运行需要下载 @larksuiteoapi/lark-mcp）
4. 如在公司内网，检查是否需要配置 npm 代理

### Invalid credentials (凭据无效)

```
Error: app_id or app_secret is invalid
```

**解决方法**：
1. 确认 `.claude/.feishu.json` 中的 `app_id` 和 `app_secret` 正确
2. 登录 [飞书开放平台](https://open.feishu.cn/app) 核对凭据
3. 确认应用未被禁用

### Node.js not found (Node.js 未安装)

**解决方法**：
1. 确认已安装 Node.js >= 18
2. 确认 node 在 PATH 中：运行 `which node` 验证
3. 如使用 nvm，确认已激活正确的 Node.js 版本
