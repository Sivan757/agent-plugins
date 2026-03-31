#!/bin/bash
set -euo pipefail

# Auto-install pg dependency on first use.
# Runs as a SessionStart hook - exits 0 to never block the session.

# Suppress noise from user shell profiles
unset -f _load_nvm 2>/dev/null || true

PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ ! -d "$PLUGIN_DIR/node_modules/pg" ]; then
  echo "[postgresql] Installing pg dependency (first-time setup)..."
  if npm install --prefix "$PLUGIN_DIR" --silent 2>&1; then
    echo "[postgresql] pg installed successfully."
  else
    echo "[postgresql] Warning: Failed to install pg. Run manually:"
    echo "  npm install --prefix \"$PLUGIN_DIR\""
  fi
fi

exit 0
