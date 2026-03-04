#!/bin/bash
# ticktick-setup.sh — Validate TickTick CLI dependencies at session start
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
CLI="$PLUGIN_ROOT/scripts/ticktick.mjs"
CONFIG_PATH="$HOME/.cache/apex-plugin/ticktick.env"
LEGACY_ENV="$PLUGIN_ROOT/scripts/.env"

errors=()

# Check Node.js
if ! command -v node &>/dev/null; then
  errors+=("Node.js not found. Install Node.js 18+ to use the TickTick plugin.")
fi

# Check CLI exists
if [ ! -f "$CLI" ]; then
  errors+=("CLI not found at $CLI")
fi

# Determine config location: global first, then legacy
ENV_FILE=""
if [ -f "$CONFIG_PATH" ]; then
  ENV_FILE="$CONFIG_PATH"
elif [ -f "$LEGACY_ENV" ]; then
  ENV_FILE="$LEGACY_ENV"
  echo "[ticktick] Using legacy config: $LEGACY_ENV"
  echo "  Migrate to $CONFIG_PATH for global access."
fi

if [ -z "$ENV_FILE" ]; then
  # Create template at global path
  mkdir -p "$(dirname "$CONFIG_PATH")"
  cat > "$CONFIG_PATH" << 'TEMPLATE'
TICKTICK_HOST=
TICKTICK_USERNAME=
TICKTICK_PASSWORD=
TICKTICK_DEVICE_ID=
TICKTICK_ACCESS_TOKEN=
TICKTICK_CLIENT_ID=
TICKTICK_CLIENT_SECRET=
TEMPLATE
  echo "[ticktick] Config created: $CONFIG_PATH"
  echo "  Fill in credentials, then restart the session."
  exit 0
else
  # Check required fields
  for field in TICKTICK_HOST TICKTICK_USERNAME TICKTICK_PASSWORD TICKTICK_DEVICE_ID; do
    if ! grep -q "^${field}=.\+" "$ENV_FILE" 2>/dev/null; then
      errors+=("Missing or empty $field in $ENV_FILE")
    fi
  done
fi

if [ ${#errors[@]} -gt 0 ]; then
  echo "[ticktick] Setup issues:" >&2
  for err in "${errors[@]}"; do
    echo "  - $err" >&2
  done
fi

# Silent when everything is OK
exit 0
