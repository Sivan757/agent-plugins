---
description: Initialize dsh-workflow skill routing in this project's AGENTS.md
argument-hint: [target-file] [--dry-run]
allowed-tools: Bash(node:*), Read, Bash(test:*), Bash(git:*)
---

Initialize the dsh-workflow routing mechanism for the current project.

## Procedure

1. Resolve the project root: the Git worktree root (`git rev-parse --show-toplevel`), or the working directory when it is not a Git repository.
2. Resolve the target file:
   - `$1` when the user passed a path;
   - otherwise `AGENTS.md` in the project root;
   - when `AGENTS.md` does not exist but `CLAUDE.md` does, use `CLAUDE.md` and say so in your report.
3. Run the initializer:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/init-routing.mjs" --root <project-root> [--file <target>] [--dry-run]
```

4. Report, in at most three lines: the file written, whether the routing block was created, appended, or updated, and that re-running updates only the managed block.
5. If the user passed `--dry-run`, do not write; report what would change.
6. Stop and show the script's error when it reports a failure, such as a file carrying only one of the managed markers.

## Constraints

- Change nothing outside the `<!-- dsh-workflow:begin -->` … `<!-- dsh-workflow:end -->` block.
- Do not reformat, reorder, or rewrite existing project instructions.
- Do not create the file when the user passed `--dry-run`.
- When the routing table references skills that are not in the available skill catalog, say which plugin install is missing instead of restating the table.
