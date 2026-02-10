#!/bin/bash

# Verify JetBrains MCP server is reachable on session start.
# Exits 0 to never block the session.

MCP_HOST="localhost"
MCP_PORT="64343"

# Check if the port is open (works on macOS and Linux)
if command -v nc &>/dev/null; then
  if nc -z -w 2 "$MCP_HOST" "$MCP_PORT" 2>/dev/null; then
    echo "[jetbrains] JetBrains MCP server OK ($MCP_HOST:$MCP_PORT)."
  else
    echo "[jetbrains] Warning: JetBrains MCP server not reachable at $MCP_HOST:$MCP_PORT."
    echo "  Ensure a JetBrains IDE is running with the MCP server plugin enabled."
    echo "  Plugin: https://plugins.jetbrains.com/plugin/26071-mcp-server"
  fi
elif command -v curl &>/dev/null; then
  # Fallback: try curl with strict max-time to avoid SSE hang
  if curl -s --connect-timeout 2 --max-time 2 -o /dev/null "http://$MCP_HOST:$MCP_PORT/sse" 2>/dev/null; then
    echo "[jetbrains] JetBrains MCP server OK ($MCP_HOST:$MCP_PORT)."
  else
    # curl exit code 28 = timeout (connection succeeded but SSE kept streaming)
    if [ $? -eq 28 ]; then
      echo "[jetbrains] JetBrains MCP server OK ($MCP_HOST:$MCP_PORT)."
    else
      echo "[jetbrains] Warning: JetBrains MCP server not reachable at $MCP_HOST:$MCP_PORT."
      echo "  Ensure a JetBrains IDE is running with the MCP server plugin enabled."
      echo "  Plugin: https://plugins.jetbrains.com/plugin/26071-mcp-server"
    fi
  fi
else
  echo "[jetbrains] Warning: nc/curl not found. Cannot verify MCP server."
fi

exit 0
