#!/bin/bash

# PreToolUse hook: block direct reads of hidden files, dotfiles, and env vars.
# Outputs JSON with permissionDecision=ask to force user approval.
# Exits 0 with no output to allow the operation.

set -euo pipefail

input=$(cat)

tool_name=$(echo "$input" | jq -r '.tool_name // empty')
tool_input=$(echo "$input" | jq -r '.tool_input // empty')

# ── Helper: check if a path targets a hidden/sensitive file ───────────────────
is_sensitive_path() {
  local p="$1"

  # Hidden files/dirs: any path component starting with .
  # Allow: .claude-plugin, .mcp.json (plugin manifests)
  if echo "$p" | grep -qE '(^|/)\.[^/]' && \
     ! echo "$p" | grep -qE '(\.claude-plugin|\.mcp\.json|\.gitignore)'; then
    return 0
  fi

  # Credential file patterns
  if echo "$p" | grep -qiE '(credential|secret|\.pem|\.key|id_rsa|id_ed25519)'; then
    return 0
  fi

  # Connection config with passwords
  if echo "$p" | grep -qiE '(-connections\.json)$'; then
    return 0
  fi

  return 1
}

# ── Helper: check if a bash command reads env vars or sensitive files ─────────
is_sensitive_command() {
  local cmd="$1"

  # Direct env dump commands
  if echo "$cmd" | grep -qE '(^|\s|;|&&|\|)(printenv|env|export)(\s|$|;)'; then
    return 0
  fi

  # Echo/printf of sensitive env vars
  if echo "$cmd" | grep -qiE '\$\{?(AWS_|GITHUB_TOKEN|AUGMENT_|_TOKEN|_SECRET|_PASSWORD|_KEY|_CREDENTIAL)'; then
    return 0
  fi

  # Cat/read of hidden files
  if echo "$cmd" | grep -qE '(cat|head|tail|less|more|bat)\s+.*(/\.[^/]|~/\.)'; then
    return 0
  fi

  return 1
}

deny() {
  local msg="$1"
  printf '{"hookSpecificOutput":{"permissionDecision":"ask"},"systemMessage":"%s"}\n' "$msg"
  exit 0
}

# ── Evaluate by tool type ─────────────────────────────────────────────────────
case "$tool_name" in
  Read)
    file_path=$(echo "$tool_input" | jq -r '.file_path // empty')
    if [ -n "$file_path" ] && is_sensitive_path "$file_path"; then
      deny "BLOCKED: This file is hidden or may contain credentials. Ask the user for explicit permission before reading it."
    fi
    ;;

  Bash)
    command_str=$(echo "$tool_input" | jq -r '.command // empty')
    if [ -n "$command_str" ] && is_sensitive_command "$command_str"; then
      deny "BLOCKED: This command may expose environment variables or read sensitive files. Ask the user for explicit permission first."
    fi
    ;;

  Glob)
    pattern=$(echo "$tool_input" | jq -r '.pattern // empty')
    search_path=$(echo "$tool_input" | jq -r '.path // empty')
    combined="$pattern $search_path"
    if echo "$combined" | grep -qE '(^|/)\.[^/]' && \
       ! echo "$combined" | grep -qE '(\.claude-plugin|\.mcp\.json|\.gitignore)'; then
      deny "BLOCKED: This glob targets hidden files or directories. Ask the user for explicit permission before searching."
    fi
    ;;

  Grep)
    grep_path=$(echo "$tool_input" | jq -r '.path // empty')
    if [ -n "$grep_path" ] && is_sensitive_path "$grep_path"; then
      deny "BLOCKED: This search targets hidden or sensitive files. Ask the user for explicit permission first."
    fi
    ;;
esac

exit 0
