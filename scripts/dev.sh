#!/bin/bash
#
# dev.sh - Launch Claude Code with all local plugins loaded for development
#
# Usage:
#   ./scripts/dev.sh                  # Load all plugins
#   ./scripts/dev.sh mysql feishu     # Load specific plugins only
#   ./scripts/dev.sh --list           # List available plugins
#
# Changes are picked up with /reload-plugins inside the session (no restart needed).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ "${1:-}" = "--list" ]; then
  echo "Available plugins:"
  for dir in "$REPO_ROOT"/*/; do
    [ -f "$dir/.claude-plugin/plugin.json" ] || continue
    name=$(basename "$dir")
    version=$(python3 -c "import json; print(json.load(open('$dir/.claude-plugin/plugin.json'))['version'])")
    echo "  $name  v$version"
  done
  exit 0
fi

# Build --plugin-dir flags
plugin_flags=()

if [ $# -gt 0 ]; then
  # Load only specified plugins
  for name in "$@"; do
    dir="$REPO_ROOT/$name"
    if [ ! -f "$dir/.claude-plugin/plugin.json" ]; then
      echo "Error: plugin '$name' not found" >&2
      exit 1
    fi
    plugin_flags+=(--plugin-dir "$dir")
  done
else
  # Load all plugins
  for dir in "$REPO_ROOT"/*/; do
    [ -f "$dir/.claude-plugin/plugin.json" ] || continue
    plugin_flags+=(--plugin-dir "$dir")
  done
fi

count=$(( ${#plugin_flags[@]} / 2 ))
echo "Loading $count plugins from $REPO_ROOT"

# Build all plugins before launching
echo "Building plugins..."
npm run build --workspaces --if-present 2>/dev/null || echo "Warning: some builds failed"

echo "Tip: use /reload-plugins after edits"
echo ""

exec claude "${plugin_flags[@]}"
