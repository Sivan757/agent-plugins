#!/usr/bin/env bash
#
# check-plugin-versions.sh - Verify plugin versions are in sync
#
# Checks:
#   1. plugin.json version matches package.json version (if exists)
#   2. plugin.json version matches marketplace.json version
#
# Exit codes:
#   0 - All versions in sync (or no changes detected)
#   2 - Version mismatch found (blocks Stop hook)
#

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MARKETPLACE="$REPO_ROOT/.claude-plugin/marketplace.json"

if [ ! -f "$MARKETPLACE" ]; then
  exit 0
fi

# Detect modified plugins via git diff (staged + unstaged + untracked)
MODIFIED=$(
  git -C "$REPO_ROOT" diff --name-only 2>/dev/null
  git -C "$REPO_ROOT" diff --name-only --cached 2>/dev/null
  git -C "$REPO_ROOT" ls-files --others --exclude-standard 2>/dev/null
)

if [ -z "$MODIFIED" ]; then
  exit 0
fi

WARNINGS=""

for plugin_dir in "$REPO_ROOT"/*/; do
  [ -d "$plugin_dir" ] || continue
  plugin_json="$plugin_dir.claude-plugin/plugin.json"
  [ -f "$plugin_json" ] || continue

  plugin_name=$(basename "$plugin_dir")

  # Check if any file in this plugin was modified
  if ! echo "$MODIFIED" | grep -q "^${plugin_name}/"; then
    continue
  fi

  # Extract plugin.json version
  plugin_ver=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$plugin_json','utf8')).version)" 2>/dev/null || echo "?")

  # Extract package.json version (if exists)
  pkg_json="$plugin_dir/package.json"
  if [ -f "$pkg_json" ]; then
    pkg_ver=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$pkg_json','utf8')).version)" 2>/dev/null || echo "?")
    if [ "$pkg_ver" != "$plugin_ver" ]; then
      WARNINGS="${WARNINGS}\n  ${plugin_name}: plugin.json=${plugin_ver} != package.json=${pkg_ver}"
    fi
  fi

  # Extract marketplace.json version
  market_ver=$(node -e "
    const m=JSON.parse(require('fs').readFileSync('$MARKETPLACE','utf8'));
    const p=(m.plugins||[]).find(x=>x.source==='./${plugin_name}');
    console.log(p?p.version:'NOT_REGISTERED');
  " 2>/dev/null || echo "?")

  if [ "$market_ver" = "NOT_REGISTERED" ]; then
    WARNINGS="${WARNINGS}\n  ${plugin_name}: not registered in marketplace.json"
  elif [ "$market_ver" != "$plugin_ver" ]; then
    WARNINGS="${WARNINGS}\n  ${plugin_name}: plugin.json=${plugin_ver} != marketplace.json=${market_ver}"
  fi
done

if [ -n "$WARNINGS" ]; then
  echo -e "[version-check] Version mismatches in modified plugins:${WARNINGS}"
  echo ""
  echo "Fix: update marketplace.json and/or package.json to match plugin.json versions."
  exit 2
fi

exit 0
