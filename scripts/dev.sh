#!/bin/bash
#
# dev.sh - Launch Claude Code against the plugin directories in this repository.
#
# The directory under plugins/<name> IS the plugin, so loading it needs no build
# and no packing: edit a SKILL.md or a command and reload. Only the bundled CLI
# needs compiling, which is what --build does.
#
# Usage:
#   ./scripts/dev.sh                    # Launch with every plugin
#   ./scripts/dev.sh mysql ticktick     # Launch with specific plugins
#   ./scripts/dev.sh --build mysql      # Rebuild bundles first
#   ./scripts/dev.sh --list             # List available plugins
#
# Local marketplace file:
#   Claude Code: .claude-plugin/marketplace.json

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLUGINS_ROOT="$REPO_ROOT/plugins"
LIST_ONLY=false
BUILD=false
PLUGIN_NAMES=()

usage() {
  cat <<'EOF'
Usage:
  bash scripts/dev.sh [--list] [--build] [plugin...]

Examples:
  bash scripts/dev.sh
  bash scripts/dev.sh mysql ticktick
  bash scripts/dev.sh --build mysql
  bash scripts/dev.sh --list
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --list)
      LIST_ONLY=true
      shift
      ;;
    --build)
      BUILD=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      PLUGIN_NAMES+=("$1")
      shift
      ;;
  esac
done

if [ "$LIST_ONLY" = true ]; then
  echo "Available plugins:"
  for dir in "$PLUGINS_ROOT"/*/; do
    [ -f "$dir/plugin.config.ts" ] || continue
    echo "  $(basename "$dir")"
  done
  exit 0
fi

if [ "${#PLUGIN_NAMES[@]}" -gt 0 ]; then
  echo "Checking selected plugins..."
  for name in "${PLUGIN_NAMES[@]}"; do
    if [ ! -f "$PLUGINS_ROOT/$name/plugin.config.ts" ]; then
      echo "Error: plugin '$name' not found" >&2
      exit 1
    fi
  done
fi

if [ "$BUILD" = true ]; then
  echo "Building plugin bundles..."
  npm run build --workspaces --if-present
fi

plugin_flags=()

if [ "${#PLUGIN_NAMES[@]}" -gt 0 ]; then
  for name in "${PLUGIN_NAMES[@]}"; do
    plugin_flags+=(--plugin-dir "$PLUGINS_ROOT/$name")
  done
else
  for dir in "$PLUGINS_ROOT"/*/; do
    [ -f "$dir/.claude-plugin/plugin.json" ] || continue
    plugin_flags+=(--plugin-dir "$dir")
  done
fi

count=$(( ${#plugin_flags[@]} / 2 ))
echo ""
echo "Marketplace: $REPO_ROOT/.claude-plugin/marketplace.json"
echo "Launching Claude Code with $count plugin(s) from $REPO_ROOT"
echo "Tip: use /reload-plugins after edits"
echo ""
exec claude "${plugin_flags[@]}"
