#!/usr/bin/env bash
#
# check-plugin-versions.sh - Verify plugin versions are in sync
#
# Checks:
#   1. .codex-plugin/plugin.json, .claude-plugin/plugin.json, and package.json versions match
#   2. Plugin is registered in both marketplace files with the expected local path
#
# Exit codes:
#   0 - All versions in sync (or no changes detected)
#   2 - Version mismatch found (blocks PostToolUse hook)
#

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CODEX_MARKETPLACE="$REPO_ROOT/.agents/plugins/marketplace.json"
CLAUDE_MARKETPLACE="$REPO_ROOT/.claude-plugin/marketplace.json"

if [ ! -f "$CODEX_MARKETPLACE" ] && [ ! -f "$CLAUDE_MARKETPLACE" ]; then
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

for plugin_dir in "$REPO_ROOT"/plugins/*/; do
  [ -d "$plugin_dir" ] || continue
  plugin_dir="${plugin_dir%/}"
  codex_json="$plugin_dir/.codex-plugin/plugin.json"
  claude_json="$plugin_dir/.claude-plugin/plugin.json"
  [ -f "$codex_json" ] || [ -f "$claude_json" ] || continue

  plugin_name=$(basename "$plugin_dir")
  expected_path="./plugins/${plugin_name}"

  # Check if this plugin or either marketplace file was modified
  if ! echo "$MODIFIED" | grep -Eq "^plugins/${plugin_name}/|^\\.agents/plugins/marketplace\\.json$|^\\.claude-plugin/marketplace\\.json$"; then
    continue
  fi

  versions=()

  if [ ! -f "$codex_json" ]; then
    WARNINGS="${WARNINGS}\n  ${plugin_name}: missing .codex-plugin/plugin.json"
  else
    codex_ver=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$codex_json','utf8')).version)" 2>/dev/null || echo "?")
    versions+=(".codex-plugin/plugin.json=${codex_ver}")
  fi

  if [ ! -f "$claude_json" ]; then
    WARNINGS="${WARNINGS}\n  ${plugin_name}: missing .claude-plugin/plugin.json"
  else
    claude_ver=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$claude_json','utf8')).version)" 2>/dev/null || echo "?")
    versions+=(".claude-plugin/plugin.json=${claude_ver}")
  fi

  # Extract package.json version (if exists)
  pkg_json="$plugin_dir/package.json"
  if [ -f "$pkg_json" ]; then
    pkg_ver=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$pkg_json','utf8')).version)" 2>/dev/null || echo "?")
    versions+=("package.json=${pkg_ver}")
  fi

  if [ "${#versions[@]}" -gt 1 ]; then
    unique_versions=$(
      printf '%s\n' "${versions[@]}" \
        | sed 's/^[^=]*=//' \
        | sort -u
    )
    if [ "$(printf '%s\n' "$unique_versions" | wc -l | tr -d ' ')" -gt 1 ]; then
      details=$(printf '%s, ' "${versions[@]}")
      details="${details%, }"
      WARNINGS="${WARNINGS}\n  ${plugin_name}: version mismatch (${details})"
    fi
  fi

  if [ -f "$CODEX_MARKETPLACE" ]; then
    codex_market_path=$(node -e "
      const m=JSON.parse(require('fs').readFileSync('$CODEX_MARKETPLACE','utf8'));
      const p=(m.plugins||[]).find(x=>x.name==='${plugin_name}');
      if (!p) {
        console.log('NOT_REGISTERED');
      } else if (typeof p.source === 'string') {
        console.log(p.source);
      } else {
        console.log(p.source && p.source.path ? p.source.path : '');
      }
    " 2>/dev/null || echo "?")

    if [ "$codex_market_path" = "NOT_REGISTERED" ]; then
      WARNINGS="${WARNINGS}\n  ${plugin_name}: not registered in .agents/plugins/marketplace.json"
    elif [ "$codex_market_path" != "$expected_path" ]; then
      WARNINGS="${WARNINGS}\n  ${plugin_name}: Codex marketplace path is ${codex_market_path} (expected ${expected_path})"
    fi
  fi

  if [ -f "$CLAUDE_MARKETPLACE" ]; then
    claude_market_entry=$(node -e "
      const m=JSON.parse(require('fs').readFileSync('$CLAUDE_MARKETPLACE','utf8'));
      const p=(m.plugins||[]).find(x=>x.name==='${plugin_name}');
      if (!p) {
        console.log('NOT_REGISTERED');
      } else {
        const source = typeof p.source === 'string' ? p.source : '';
        const version = typeof p.version === 'string' ? p.version : '';
        console.log(source + '\\t' + version);
      }
    " 2>/dev/null || echo "?")

    if [ "$claude_market_entry" = "NOT_REGISTERED" ]; then
      WARNINGS="${WARNINGS}\n  ${plugin_name}: not registered in .claude-plugin/marketplace.json"
    else
      claude_market_path="${claude_market_entry%%$'\t'*}"
      claude_market_ver="${claude_market_entry#*$'\t'}"
      if [ "$claude_market_path" != "$expected_path" ]; then
        WARNINGS="${WARNINGS}\n  ${plugin_name}: Claude marketplace path is ${claude_market_path} (expected ${expected_path})"
      fi
      if [ -n "${claude_ver:-}" ] && [ "$claude_market_ver" != "$claude_ver" ]; then
        WARNINGS="${WARNINGS}\n  ${plugin_name}: Claude marketplace version is ${claude_market_ver} (expected ${claude_ver})"
      fi
    fi
  fi
done

if [ -n "$WARNINGS" ]; then
  echo -e "[version-check] Version mismatches in modified plugins:${WARNINGS}" >&2
  echo "" >&2
  echo "Fix: update plugin manifests, package.json, and both marketplace files." >&2
  exit 2
fi

exit 0
