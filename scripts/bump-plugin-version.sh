#!/usr/bin/env bash
#
# bump-plugin-version.sh - Bump plugin version across all config files
#
# Usage:
#   bash scripts/bump-plugin-version.sh <plugin-name> <new-version>
#
# Updates version in:
#   - plugin/<plugin>/.claude-plugin/plugin.json
#   - plugin/<plugin>/package.json (if exists)
#   - .claude-plugin/marketplace.json
#   - plugin/<plugin>/package-lock.json (via npm install, if package.json exists)
#
# Then runs check-plugin-versions.sh to verify consistency.
#

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

usage() {
  echo "Usage: bash scripts/bump-plugin-version.sh <plugin-name> <new-version>"
  echo ""
  echo "Examples:"
  echo "  bash scripts/bump-plugin-version.sh aliyunlog 0.8.0"
  echo "  bash scripts/bump-plugin-version.sh mysql 0.5.0"
  echo ""
  echo "Available plugins:"
  for d in "$REPO_ROOT"/plugin/*/; do
    [ -f "$d.claude-plugin/plugin.json" ] || continue
    name=$(basename "$d")
    ver=$(node -e "console.log(JSON.parse(require('fs').readFileSync('${d}.claude-plugin/plugin.json','utf8')).version)" 2>/dev/null || echo "?")
    echo "  $name (current: $ver)"
  done
  exit 1
}

if [ $# -ne 2 ]; then
  usage
fi

PLUGIN="$1"
NEW_VER="$2"
PLUGIN_DIR="$REPO_ROOT/plugin/$PLUGIN"
PLUGIN_JSON="$PLUGIN_DIR/.claude-plugin/plugin.json"
PACKAGE_JSON="$PLUGIN_DIR/package.json"
MARKETPLACE="$REPO_ROOT/.claude-plugin/marketplace.json"

# Validate plugin exists
if [ ! -f "$PLUGIN_JSON" ]; then
  echo "Error: Plugin '$PLUGIN' not found (no $PLUGIN_JSON)" >&2
  exit 1
fi

# Validate version format (semver-like)
if ! echo "$NEW_VER" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$'; then
  echo "Error: Invalid version format '$NEW_VER'. Expected semver (e.g., 1.2.3)" >&2
  exit 1
fi

OLD_VER=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$PLUGIN_JSON','utf8')).version)" 2>/dev/null)
echo "Bumping $PLUGIN: $OLD_VER → $NEW_VER"

# 1. Update plugin.json
node -e "
  const fs = require('fs');
  const p = '$PLUGIN_JSON';
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  d.version = '$NEW_VER';
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
"
echo "  ✓ plugin.json"

# 2. Update package.json (if exists)
if [ -f "$PACKAGE_JSON" ]; then
  node -e "
    const fs = require('fs');
    const p = '$PACKAGE_JSON';
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    d.version = '$NEW_VER';
    fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
  "
  echo "  ✓ package.json"
fi

# 3. Update marketplace.json
node -e "
  const fs = require('fs');
  const p = '$MARKETPLACE';
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  const plugin = (d.plugins || []).find(x => x.source === './plugin/$PLUGIN');
  if (plugin) {
    plugin.version = '$NEW_VER';
    fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
    console.log('  ✓ marketplace.json');
  } else {
    console.error('  ✗ Plugin not found in marketplace.json');
    process.exit(1);
  }
"

# 4. Regenerate package-lock.json (if package.json exists)
if [ -f "$PACKAGE_JSON" ]; then
  (cd "$PLUGIN_DIR" && npm install --silent 2>&1) || true
  echo "  ✓ package-lock.json"
fi

# 5. Verify
echo ""
bash "$REPO_ROOT/scripts/check-plugin-versions.sh" 2>&1 && echo "Version check passed." || echo "Warning: Version check reported issues."
