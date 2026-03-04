#!/usr/bin/env bash
# P3C Rules Plugin — SessionStart hook
# Symlinks bundled P3C rule files into the project's .claude/rules/p3c/ directory.
# Idempotent: safe to run multiple times.

set -euo pipefail

PLUGIN_RULES="${CLAUDE_PLUGIN_ROOT}/rules"
TARGET_DIR=".claude/rules/p3c"

# Ensure .claude/rules/ exists
mkdir -p ".claude/rules"

# Check current state of target
if [ -L "${TARGET_DIR}" ]; then
  # Symlink exists — verify it points to our plugin
  CURRENT_TARGET="$(readlink "${TARGET_DIR}")"
  if [ "${CURRENT_TARGET}" = "${PLUGIN_RULES}" ]; then
    exit 0
  else
    # Symlink points elsewhere — remove and re-link
    rm "${TARGET_DIR}"
  fi
elif [ -d "${TARGET_DIR}" ]; then
  # Regular directory exists — don't overwrite user's files
  echo "[p3c] WARNING: ${TARGET_DIR} is a regular directory (not managed by plugin). Skipping."
  exit 0
elif [ -e "${TARGET_DIR}" ]; then
  # Some other file type — don't touch it
  echo "[p3c] WARNING: ${TARGET_DIR} exists but is not a directory or symlink. Skipping."
  exit 0
fi

# Create symlink
ln -s "${PLUGIN_RULES}" "${TARGET_DIR}"
echo "[p3c] Rules installed: ${TARGET_DIR} -> ${PLUGIN_RULES}"
exit 0
