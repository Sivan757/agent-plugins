# Troubleshooting

## Common Errors

### Config file not found

```
[feishu] Config file not found.
```

**Solution**: Create `~/.cache/apex-plugin/feishu.json`:

```json
{
  "app_id": "cli_xxx",
  "app_secret": "xxx",
  "auth_type": "user"
}
```

Get credentials from https://open.feishu.cn/app

### Permission denied

```
Error: permission denied / No permission to access this resource
```

**Solution**:
1. Confirm the app has the required permission scopes (docx:document, wiki:wiki, etc.)
2. Confirm the app version has been published and approved by an admin
3. Confirm the document is shared with the app (app must be a collaborator, or document must be set to "anyone can read")
4. If using `user` mode, confirm OAuth authorization is complete

### Search returns empty but document exists

**Possible causes**:
- Keywords too long or contain date/noise words → Shorten keywords and retry
- Tenant mode cannot search Wiki documents → Switch to user mode
- Document permissions not granted to the app → Check document sharing settings

**Solution**: See SKILL.md search strategy (keyword preprocessing + progressive retry).

### Wiki document ID mismatch

**Cause**: Wiki URLs contain a node token, not a document ID. Using the node token directly with document tools will fail.

**Solution**: Use `get_feishu_document_info` with the wiki token to resolve the actual document ID.

```
URL: https://xxx.feishu.cn/wiki/P0dHwrTdtiJ6O7kUEoecQ2wgnhX
                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                    This is a node_token, not a document_id

→ get_feishu_document_info(token) → returns document_id
→ get_feishu_document_blocks(document_id)
```

### Document not found

```
Error: document not found
```

**Solution**:
1. Confirm the document_id is correct — extract from URL: `https://xxx.feishu.cn/docx/{document_id}`
2. For Wiki URLs, resolve the token via `get_feishu_document_info` first
3. Confirm the document has not been deleted
4. Confirm the app/user has access to the document

### MCP server failed to start

```
[feishu] Failed to start MCP server: ...
```

**Solution**:
1. Confirm Node.js >= 20 is installed: run `node -v` (feishu-mcp requires ^20.17.0)
2. Confirm npx is available: run `npx --version`
3. Confirm network access to npm registry (first run downloads feishu-mcp)
4. If behind a corporate proxy, configure npm proxy settings

### Invalid credentials

```
Error: app_id or app_secret is invalid
```

**Solution**:
1. Verify `app_id` and `app_secret` in `~/.cache/apex-plugin/feishu.json`
2. Check credentials at [Feishu Open Platform](https://open.feishu.cn/app)
3. Confirm the app is not disabled

### Tenant mode limitations

Tenant (app-level) mode has significant limitations:
- Cannot search Wiki documents
- Document edit history won't show user identity
- Some APIs do not support tenant_access_token

**Solution**: Switch to user mode by setting `"auth_type": "user"` in `~/.cache/apex-plugin/feishu.json`. Restart the session and complete OAuth authorization when prompted.

### Legacy config migration

If you previously used `.claude/.feishu.json`, move it to the global path:

```bash
mkdir -p ~/.cache/apex-plugin
cp .claude/.feishu.json ~/.cache/apex-plugin/feishu.json
```

The legacy path still works as a fallback but is deprecated.
