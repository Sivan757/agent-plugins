#!/usr/bin/env bash
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-${PLUGIN_ROOT:-}}}"
if [ -z "$PLUGIN_ROOT" ]; then
  PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi

CLI="$PLUGIN_ROOT/dist/notebook.mjs"
if [ ! -f "$CLI" ]; then
  exit 0
fi

node "$CLI" context --bootstrap-only --format hook || true
