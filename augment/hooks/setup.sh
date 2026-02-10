#!/bin/bash

# Verify Augment Context Engine MCP readiness and trigger workspace indexing.
# Runs as a SessionStart hook — exits 0 to never block the session.

AUGGIE="npx -y @augmentcode/auggie@latest"

# ── 1. Check npx ──────────────────────────────────────────────────────────────
if ! command -v npx &>/dev/null; then
  echo "[augment] Error: npx not found. Install Node.js to use Augment MCP."
  echo "  brew install node  # or visit https://nodejs.org"
  exit 0
fi

# ── 2. Check authentication (exit-code only, never capture the token) ─────────
AUTH_ERR=$($AUGGIE token print 2>&1 >/dev/null)
AUTH_EXIT=$?

if [ $AUTH_EXIT -ne 0 ]; then
  # Only the stderr is captured — never the token itself
  if echo "$AUTH_ERR" | grep -qi "not authenticated\|not logged in\|no.*session\|no.*token"; then
    echo "[augment] Error: Not authenticated with Augment."
    echo "  Run:  npx @augmentcode/auggie login"
    echo "  This will open a browser for OAuth sign-in."
  elif echo "$AUTH_ERR" | grep -qi "expired\|invalid.*token\|unauthorized\|401"; then
    echo "[augment] Error: Authentication token expired or invalid."
    echo "  Run:  npx @augmentcode/auggie login"
  else
    echo "[augment] Error: Authentication check failed."
    echo "  Try:  npx @augmentcode/auggie login"
  fi
  exit 0
fi

echo "[augment] Auth OK."

# ── 3. Detect workspace root ──────────────────────────────────────────────────
WORKSPACE_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)

if [ -z "$WORKSPACE_ROOT" ]; then
  echo "[augment] Warning: Not inside a git repository."
  echo "  Augment --mcp-auto-workspace requires a git repo to detect the workspace."
  echo "  Either run from a git repo, or configure a fixed workspace root in .mcp.json:"
  echo '    "args": ["-y", "@augmentcode/auggie@latest", "--mcp", "-w", "/path/to/repo"]'
  exit 0
fi

# ── 4. Trigger workspace indexing & verify connectivity (background) ──────────
# Start the MCP server, send initialize + codebase-retrieval to warm the index.
# The initialize handshake also verifies API connectivity end-to-end.
# Runs in background so the session is not blocked.
INDEX_LOG="/tmp/augment-index-$$.log"

(
  {
    echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"index-warmup","version":"0.1"}}}'
    echo '{"jsonrpc":"2.0","method":"notifications/initialized"}'
    printf '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"codebase-retrieval","arguments":{"information_request":"list top-level directories","directory_path":"%s"}}}\n' "$WORKSPACE_ROOT"
    sleep 30
  } | $AUGGIE --mcp --mcp-auto-workspace >"$INDEX_LOG" 2>&1
) &

echo "[augment] Indexing workspace in background: $WORKSPACE_ROOT"

exit 0
