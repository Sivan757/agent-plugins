#!/bin/bash
#
# dev.sh - Build local plugins, then launch Codex or Claude Code
#
# Usage:
#   ./scripts/dev.sh --target codex                  # Build all plugins, then launch Codex
#   ./scripts/dev.sh --target claude mysql ticktick  # Build specific plugins, then launch Claude Code
#   ./scripts/dev.sh --list           # List available plugins
#
# Local marketplace files:
#   Codex: .agents/plugins/marketplace.json
#   Claude Code: .claude-plugin/marketplace.json

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="codex"
LIST_ONLY=false
PLUGIN_NAMES=()

usage() {
  cat <<'EOF'
Usage:
  bash scripts/dev.sh [--target codex|claude] [--list] [plugin...]

Examples:
  bash scripts/dev.sh --target codex
  bash scripts/dev.sh --target claude mysql ticktick
  bash scripts/dev.sh --list
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --target)
      TARGET="${2:-}"
      if [ -z "$TARGET" ]; then
        echo "Error: --target requires codex or claude" >&2
        exit 1
      fi
      shift 2
      ;;
    --codex)
      TARGET="codex"
      shift
      ;;
    --claude)
      TARGET="claude"
      shift
      ;;
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

if [ "$TARGET" != "codex" ] && [ "$TARGET" != "claude" ]; then
  echo "Error: unsupported target '$TARGET' (expected codex or claude)" >&2
  exit 1
fi

if [ "$LIST_ONLY" = true ]; then
  echo "Available plugins:"
  for dir in "$REPO_ROOT"/plugins/*/; do
    manifest="$dir/.codex-plugin/plugin.json"
    [ -f "$manifest" ] || manifest="$dir/.claude-plugin/plugin.json"
    [ -f "$manifest" ] || continue
    name=$(basename "$dir")
    version=$(python3 -c "import json; print(json.load(open('$manifest'))['version'])")
    echo "  $name  v$version"
  done
  exit 0
fi

if [ "${#PLUGIN_NAMES[@]}" -gt 0 ]; then
  echo "Building selected plugins..."
  for name in "${PLUGIN_NAMES[@]}"; do
    dir="$REPO_ROOT/plugins/$name"
    if [ ! -f "$dir/.codex-plugin/plugin.json" ] && [ ! -f "$dir/.claude-plugin/plugin.json" ]; then
      echo "Error: plugin '$name' not found" >&2
      exit 1
    fi
    if [ -f "$dir/package.json" ]; then
      npm run build --workspace="plugins/$name" --if-present
    fi
  done
else
  echo "Building all plugin workspaces..."
  npm run build --workspaces --if-present 2>/dev/null || echo "Warning: some builds failed"
fi

if [ "$TARGET" = "claude" ]; then
  MARKETPLACE="$REPO_ROOT/.claude-plugin/marketplace.json"
  plugin_flags=()

  if [ "${#PLUGIN_NAMES[@]}" -gt 0 ]; then
    for name in "${PLUGIN_NAMES[@]}"; do
      dir="$REPO_ROOT/plugins/$name"
      [ -f "$dir/.claude-plugin/plugin.json" ] || {
        echo "Error: Claude manifest missing for '$name'" >&2
        exit 1
      }
      plugin_flags+=(--plugin-dir "$dir")
    done
  else
    for dir in "$REPO_ROOT"/plugins/*/; do
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
fi

MARKETPLACE="$REPO_ROOT/.agents/plugins/marketplace.json"
echo ""
echo "Marketplace: $MARKETPLACE"
echo "Launching Codex from $REPO_ROOT"
echo ""

(cd "$REPO_ROOT" && exec codex)
