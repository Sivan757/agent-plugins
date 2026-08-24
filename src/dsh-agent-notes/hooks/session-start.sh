#!/usr/bin/env bash
#
# SessionStart hook for the dsh-agent-notes plugin.
#
# Silent unless the current workspace carries an Agent Notes corpus
# (.agents/notes). When it does, prints a compact briefing so every session
# inherits the maintenance contract: finish initialization if the structure is
# incomplete, otherwise surface lifecycle counts and the standing duties.
#
# Output discipline: a few short lines at most; empty output keeps unrelated
# sessions clean.

set -euo pipefail

notes_root=""

if [ -d "$PWD/.agents/notes" ]; then
  notes_root="$PWD/.agents/notes"
else
  if command -v git >/dev/null 2>&1; then
    top="$(git rev-parse --show-toplevel 2>/dev/null || true)"
    if [ -n "$top" ] && [ -d "$top/.agents/notes" ]; then
      notes_root="$top/.agents/notes"
    fi
  fi
fi

[ -n "$notes_root" ] || exit 0

missing=""
[ -f "$notes_root/README.md" ] || missing="$missing .agents/notes/README.md"
[ -f "$notes_root/archived/AGENTS.md" ] || missing="$missing .agents/notes/archived/AGENTS.md"

if [ -n "$missing" ]; then
  echo "[agent-notes] INCOMPLETE notes structure at ${notes_root}: missing$missing"
  echo "[agent-notes] Load the dsh-archive-agent-notes skill and finish initialization before touching any note."
  exit 0
fi

count_base_notes() {
  # A triplet is foo.md + foo.zh.md + foo.i18n.yaml; count base names only.
  local dir="$1"
  [ -d "$dir" ] || { echo 0; return; }
  find "$dir" -type f -name '*.md' ! -name '*.zh.md' 2>/dev/null | wc -l | tr -d ' '
}

impl=$(count_base_notes "$notes_root/implemented")
prop=$(count_base_notes "$notes_root/proposed")
rej=$(count_base_notes "$notes_root/rejected")

echo "[agent-notes] corpus detected: implemented=$impl proposed=$prop rejected=$rej"
echo "[agent-notes] standing duty: run the supersession audit before writing any new note;"
echo "[agent-notes] archive implemented triplets whose rationale no longer guides future work"
echo "[agent-notes] (skill: dsh-archive-agent-notes)."
