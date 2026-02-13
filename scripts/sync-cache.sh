#!/bin/bash
#
# sync-cache.sh - Sync plugin development files to Claude Code local cache
#
# Usage:
#   ./scripts/sync-cache.sh            # Sync all plugins
#   ./scripts/sync-cache.sh mysql      # Sync a specific plugin
#   ./scripts/sync-cache.sh --dry-run  # Show what would be synced

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MARKETPLACE_NAME="apex-plugins"
CACHE_BASE="$HOME/.claude/plugins/cache/$MARKETPLACE_NAME"
MARKETPLACE_REPO="$HOME/.claude/plugins/marketplaces/$MARKETPLACE_NAME"
INSTALLED_JSON="$HOME/.claude/plugins/installed_plugins.json"

DRY_RUN=false
TARGET=""

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    *) TARGET="$arg" ;;
  esac
done

sync_plugin() {
  local plugin_dir="$1"
  local plugin_name
  local plugin_version
  local cache_key

  # Read name and version from plugin.json
  local manifest="$plugin_dir/.claude-plugin/plugin.json"
  if [ ! -f "$manifest" ]; then
    echo "  SKIP $(basename "$plugin_dir") (no .claude-plugin/plugin.json)"
    return
  fi

  plugin_name=$(python3 -c "import json; print(json.load(open('$manifest'))['name'])")
  plugin_version=$(python3 -c "import json; print(json.load(open('$manifest'))['version'])")
  cache_key="${plugin_name}@${MARKETPLACE_NAME}"

  echo "  $plugin_name v$plugin_version"

  # Determine current cached version
  local current_version
  current_version=$(python3 -c "
import json, sys
data = json.load(open('$INSTALLED_JSON'))
entries = data.get('plugins', {}).get('$cache_key', [])
for e in entries:
  if e.get('scope') == 'user':
    print(e.get('version', ''))
    sys.exit(0)
print('')
" 2>/dev/null || echo "")

  local cache_dir="$CACHE_BASE/$plugin_name/$plugin_version"

  if $DRY_RUN; then
    echo "    cache: $cache_dir"
    echo "    registered: ${current_version:-none} -> $plugin_version"
    return
  fi

  # Sync files to cache (delete stale files, preserve node_modules)
  mkdir -p "$cache_dir"
  rsync -a --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    "$plugin_dir/" "$cache_dir/"

  # Restore node_modules from old cache if version changed and new cache is missing it
  if [ -n "$current_version" ] && [ "$current_version" != "$plugin_version" ]; then
    local old_cache="$CACHE_BASE/$plugin_name/$current_version"
    if [ -d "$old_cache/node_modules" ] && [ ! -d "$cache_dir/node_modules" ]; then
      cp -R "$old_cache/node_modules" "$cache_dir/node_modules"
      echo "    node_modules migrated from $current_version"
    fi
    # Mark old cache as orphaned
    date +%s000 > "$old_cache/.orphaned_at" 2>/dev/null || true
    echo "    old cache $current_version marked orphaned"
  fi

  # Update installed_plugins.json
  python3 -c "
import json, datetime

path = '$INSTALLED_JSON'
data = json.load(open(path))
key = '$cache_key'
now = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')

entry = {
  'scope': 'user',
  'installPath': '$cache_dir',
  'version': '$plugin_version',
  'installedAt': now,
  'lastUpdated': now,
}

# Preserve original installedAt if exists
for e in data.get('plugins', {}).get(key, []):
  if e.get('scope') == 'user':
    entry['installedAt'] = e.get('installedAt', now)
    break

data.setdefault('plugins', {})[key] = [entry]
json.dump(data, open(path, 'w'), indent=2, ensure_ascii=False)
print('    registry updated')
"

  echo "    -> $cache_dir"
}

sync_marketplace_repo() {
  if [ ! -d "$MARKETPLACE_REPO/.git" ]; then
    echo "[warn] Marketplace repo not found at $MARKETPLACE_REPO, skipping repo sync"
    return
  fi
  if $DRY_RUN; then
    echo "[marketplace] Would sync to $MARKETPLACE_REPO"
    return
  fi
  git -C "$MARKETPLACE_REPO" fetch "$REPO_ROOT" main 2>/dev/null
  git -C "$MARKETPLACE_REPO" merge FETCH_HEAD --ff-only 2>/dev/null && \
    echo "[marketplace] Synced" || \
    echo "[marketplace] Already up to date"
}

echo "=== apex-plugin cache sync ==="
echo ""

# Sync marketplace git repo first (only works if changes are committed)
sync_marketplace_repo
echo ""

# Find and sync plugins
echo "[plugins]"
if [ -n "$TARGET" ]; then
  plugin_dir="$REPO_ROOT/$TARGET"
  if [ ! -d "$plugin_dir" ]; then
    echo "Error: plugin '$TARGET' not found at $plugin_dir"
    exit 1
  fi
  sync_plugin "$plugin_dir"
else
  for plugin_dir in "$REPO_ROOT"/*/; do
    [ -f "$plugin_dir/.claude-plugin/plugin.json" ] || continue
    sync_plugin "$plugin_dir"
  done
fi

echo ""
echo "Done. Restart Claude Code session to load changes."
