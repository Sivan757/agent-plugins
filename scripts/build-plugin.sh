#!/bin/bash
# Bundle one plugin CLI into its own plugin directory, bundling ALL dependencies.
#
# The plugin directory is the installable artifact, so the bundle is written
# straight to plugins/<name>/dist/<name>.mjs and committed: consumers install
# this repository as a git marketplace and cannot build it themselves.
#
# `dist/` is the whole shipped runtime surface. Anything the bundle needs beyond
# its own code — the shared config UI, and hand-maintained assets such as
# aliyunlog's sls.proto — lives in `dist/` too, either committed there directly or
# staged here. There is no shadow copy elsewhere.
#
# Usage: bash scripts/build-plugin.sh <plugin-name> <entry>
set -euo pipefail

PLUGIN_NAME="$1"
ENTRY="$2"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLUGIN_ROOT="$REPO_ROOT/plugins/$PLUGIN_NAME"
OUTFILE="$PLUGIN_ROOT/dist/$PLUGIN_NAME.mjs"

BANNER="import{createRequire as _cr}from'module';import{fileURLToPath as _fu}from'url';import{dirname as _dn}from'path';const require=_cr(import.meta.url),__filename=_fu(import.meta.url),__dirname=_dn(_fu(import.meta.url));"

npx esbuild "$ENTRY" \
  --bundle \
  --platform=node \
  --format=esm \
  --outfile="$OUTFILE" \
  --banner:js="$BANNER"

# The shared config UI ships only with bundles that actually resolve it: the
# marker is the directory literal in `loadBundledHTML`'s candidate list, so its
# absence from the bundle means the ~340 KB file would never be read. Kept in sync
# with the same marker in .github/scripts/validate-config-ui-contract.ts.
if grep -q "config-ui" "$OUTFILE"; then
  CONFIG_UI_SRC="$REPO_ROOT/plugins/config-center/ui/dist/index.html"
  if [ ! -f "$CONFIG_UI_SRC" ]; then
    echo "Error: $PLUGIN_NAME serves the config form but $CONFIG_UI_SRC is missing." >&2
    echo "Run 'npm run build:ui' (or the root 'npm run build') first." >&2
    exit 1
  fi
  CONFIG_UI_DST="$PLUGIN_ROOT/dist/config-ui/dist"
  mkdir -p "$CONFIG_UI_DST"
  cp "$CONFIG_UI_SRC" "$CONFIG_UI_DST/index.html"
  perl -0pi -e 's/[ \t]+$//mg' "$CONFIG_UI_DST/index.html"
else
  # A plugin that stopped serving the form must not keep shipping the copy.
  rm -rf "$PLUGIN_ROOT/dist/config-ui"
fi
