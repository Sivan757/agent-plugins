#!/bin/bash
# Build a plugin with esbuild, bundling ALL dependencies.
# Usage: bash scripts/build-plugin.sh <entry> <outfile>
set -euo pipefail

ENTRY="$1"
OUTFILE="$2"
ENTRY_DIR="$(cd "$(dirname "$ENTRY")" && pwd)"
PLUGIN_ROOT="$(cd "$ENTRY_DIR/.." && pwd)"

BANNER="import{createRequire as _cr}from'module';import{fileURLToPath as _fu}from'url';import{dirname as _dn}from'path';const require=_cr(import.meta.url),__filename=_fu(import.meta.url),__dirname=_dn(_fu(import.meta.url));"

npx esbuild "$ENTRY" \
  --bundle \
  --platform=node \
  --format=esm \
  --outfile="$OUTFILE" \
  --banner:js="$BANNER"

# Ship config-ui HTML bundle alongside the plugin so it works from cache
CONFIG_UI_SRC="$(cd "$(dirname "$0")/.." && pwd)/packages/config-ui/dist/index.html"
CONFIG_UI_DST="$(dirname "$OUTFILE")/config-ui/dist"
if [ -f "$CONFIG_UI_SRC" ]; then
  mkdir -p "$CONFIG_UI_DST"
  cp "$CONFIG_UI_SRC" "$CONFIG_UI_DST/index.html"
  perl -0pi -e 's/[ \t]+$//mg' "$CONFIG_UI_DST/index.html"
fi

# Copy plugin-local runtime assets beside the bundled entrypoint. This keeps
# generated dist/ out of git while preserving files required by bundled deps.
RUNTIME_SRC="$PLUGIN_ROOT/runtime"
RUNTIME_DST="$(dirname "$OUTFILE")"
if [ -d "$RUNTIME_SRC" ]; then
  mkdir -p "$RUNTIME_DST"
  cp -R "$RUNTIME_SRC"/. "$RUNTIME_DST"/
fi
