#!/bin/bash

# Auto-install mysql2 dependency on first use.
# Runs as a SessionStart hook - exits 0 to never block the session.

# Suppress noise from user shell profiles (e.g., _load_nvm, conda, etc.)
unset -f _load_nvm 2>/dev/null

PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ ! -d "$PLUGIN_DIR/node_modules/mysql2" ]; then
  echo "[mysql] Installing mysql2 dependency (first-time setup)..."
  npm install --prefix "$PLUGIN_DIR" --silent 2>&1
  if [ $? -eq 0 ]; then
    echo "[mysql] mysql2 installed successfully."
  else
    echo "[mysql] Warning: Failed to install mysql2. Run manually:"
    echo "  npm install --prefix \"$PLUGIN_DIR\""
  fi
else
  echo "[mysql] Dependencies OK."
fi

exit 0
