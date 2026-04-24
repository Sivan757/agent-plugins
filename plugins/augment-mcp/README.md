# Augment Context Engine MCP Plugin

Integrates [Augment Context Engine](https://www.augmentcode.com/) as an MCP server for Codex and Claude Code, providing semantic codebase search and retrieval via the `codebase-retrieval` tool.

## Prerequisites

- **Node.js** (>= 18) with `npx`
- An [Augment](https://www.augmentcode.com/) account

## Setup

### 1. Install Auggie CLI

```bash
npx @augmentcode/auggie@latest --version
```

### 2. Login

Run the login command and follow the browser-based OAuth flow:

```bash
npx @augmentcode/auggie login
```

This stores your session credentials locally in `~/.augment/`. No environment variables are needed for local use.

> **Non-interactive environments** (CI/CD, GitHub Actions): if you cannot run `auggie login` interactively, configure authentication via environment variables instead. See [Non-interactive auth](#non-interactive-auth) below.

### 3. Verify

Confirm authentication succeeded (the output is discarded — no credentials are printed):

```bash
npx @augmentcode/auggie token print > /dev/null && echo "OK"
```

## How It Works

This plugin registers an MCP server that runs the Auggie CLI in MCP mode:

```json
{
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@augmentcode/auggie@latest", "--mcp", "--mcp-auto-workspace"]
}
```

On session start, a hook (`hooks/setup.sh`) performs:

1. **Auth check** — verifies a valid token exists
2. **Workspace detection** — finds the git root via `git rev-parse`
3. **Background indexing** — sends a warm-up `codebase-retrieval` request so the index is ready when you start working

## Non-interactive Auth

For environments where browser-based login is not possible, export the token and tenant URL as environment variables.

First, on a machine where you are already logged in:

```bash
npx @augmentcode/auggie token print
```

Copy the `accessToken` and `tenantURL` values from the output, then configure the MCP server with them:

```json
{
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@augmentcode/auggie@latest", "--mcp", "--mcp-auto-workspace"],
  "env": {
    "AUGMENT_API_TOKEN": "<your-access-token>",
    "AUGMENT_API_URL": "<your-tenant-url>"
  }
}
```

If you are wiring Augment outside this repo-managed plugin, register the same JSON in your user-level MCP configuration.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `[augment] Error: npx not found` | Node.js not installed | `brew install node` or [nodejs.org](https://nodejs.org) |
| `[augment] Error: Not authenticated` | No login session | `npx @augmentcode/auggie login` |
| `[augment] Error: Authentication token expired` | Session expired | `npx @augmentcode/auggie login` |
| `[augment] Warning: Not inside a git repository` | Working directory is not a git repo | `cd` into a repo, or set a fixed workspace path in `.mcp.json` with `-w /path/to/repo` |
| `codebase-retrieval` returns empty results | Index not yet built | Wait a moment — the first query triggers indexing. Large repos need more time. |

## References

- [Augment MCP Quickstart](https://docs.augmentcode.com/context-services/mcp/quickstart-claude-code)
- [Auggie CLI Overview](https://docs.augmentcode.com/cli/overview)
- [Augment Context Engine Blog Post](https://www.augmentcode.com/blog/context-engine-mcp-now-live)
