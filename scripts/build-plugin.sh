#!/bin/bash
# Build a plugin with esbuild, bundling ALL dependencies.
# Usage: bash scripts/build-plugin.sh <entry> <outfile>
set -euo pipefail

ENTRY="$1"
OUTFILE="$2"

BANNER="import{createRequire as _cr}from'module';import{fileURLToPath as _fu}from'url';import{dirname as _dn}from'path';const require=_cr(import.meta.url),__filename=_fu(import.meta.url),__dirname=_dn(_fu(import.meta.url));"

npx esbuild "$ENTRY" \
  --bundle \
  --platform=node \
  --format=esm \
  --outfile="$OUTFILE" \
  --banner:js="$BANNER"
