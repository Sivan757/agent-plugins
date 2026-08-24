#!/bin/bash
#
# dev.sh - Build source plugins, refresh release artifacts, then launch Claude Code
#
# Usage:
#   ./scripts/dev.sh                    # Build all plugins, then launch Claude Code
#   ./scripts/dev.sh mysql ticktick     # Build specific plugins, then launch Claude Code
#   ./scripts/dev.sh --list             # List available plugins
#
# Local marketplace file:
#   Claude Code: .claude-plugin/marketplace.json

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE_ROOT="$REPO_ROOT/src"
RELEASE_ROOT="$REPO_ROOT/plugins"
LIST_ONLY=false
PLUGIN_NAMES=()

usage() {
  cat <<'EOF'
Usage:
  bash scripts/dev.sh [--list] [plugin...]

Examples:
  bash scripts/dev.sh
  bash scripts/dev.sh mysql ticktick
  bash scripts/dev.sh --list
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --list)
      LIST_ONLY=true
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
  for dir in "$SOURCE_ROOT"/*/; do
    manifest="$dir/plugin.config.ts"
    [ -f "$manifest" ] || manifest="$dir/plugin.config.json"
    [ -f "$manifest" ] || continue
    name=$(basename "$dir")
    echo "  $name"
  done
  exit 0
fi

if [ "${#PLUGIN_NAMES[@]}" -gt 0 ]; then
  echo "Checking selected plugins..."
  for name in "${PLUGIN_NAMES[@]}"; do
    dir="$SOURCE_ROOT/$name"
    if [ ! -f "$dir/plugin.config.ts" ] && [ ! -f "$dir/plugin.config.json" ]; then
      echo "Error: plugin '$name' not found" >&2
      exit 1
    fi
  done
fi

echo "Building plugin workspaces..."
npm run build --workspaces --if-present

echo "Refreshing plugin release artifacts..."
npm run generate:plugins
npm run pack:plugins

MARKETPLACE="$REPO_ROOT/.claude-plugin/marketplace.json"
plugin_flags=()

if [ "${#PLUGIN_NAMES[@]}" -gt 0 ]; then
  for name in "${PLUGIN_NAMES[@]}"; do
    dir="$RELEASE_ROOT/$name"
    [ -f "$dir/.claude-plugin/plugin.json" ] || {
      echo "Error: Claude manifest missing for '$name'" >&2
      exit 1
    }
    plugin_flags+=(--plugin-dir "$dir")
  done
else
  for dir in "$RELEASE_ROOT"/*/; do
    [ -f "$dir/.claude-plugin/plugin.json" ] || continue
    plugin_flags+=(--plugin-dir "$dir")
  done
fi

count=$(( ${#plugin_flags[@]} / 2 ))
echo ""
echo "Marketplace: $MARKETPLACE"
echo "Launching Claude Code with $count plugin(s) from $REPO_ROOT"
echo "Tip: use /reload-plugins after edits"
echo ""
exec claude "${plugin_flags[@]}"
