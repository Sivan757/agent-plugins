#!/bin/bash

# Auto-install @alicloud/log dependency on first use.
# Runs as a SessionStart hook - exits 0 to never block the session.

# Suppress noise from user shell profiles (e.g., _load_nvm, conda, etc.)
unset -f _load_nvm 2>/dev/null

PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ ! -d "$PLUGIN_DIR/node_modules/@alicloud/log" ]; then
  echo "[aliyunlog] Installing @alicloud/log dependency (first-time setup)..."
  if npm install --prefix "$PLUGIN_DIR" --silent 2>&1; then
    echo "[aliyunlog] @alicloud/log installed successfully."
  else
    echo "[aliyunlog] Warning: Failed to install @alicloud/log. Run manually:"
    echo "  npm install --prefix \"$PLUGIN_DIR\""
  fi
else
  echo "[aliyunlog] Dependencies OK."
fi

exit 0
