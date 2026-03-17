---
name: find-skills
description: >-
  This skill should be used when the user asks to find, discover, search for,
  or install a Claude Code skill or plugin — e.g., "find a skill for React testing",
  "is there a skill that can review PRs", "search for deployment skills",
  "install a skill for changelog generation", "what skills are available",
  "extend Claude's capabilities with a plugin", "browse skills.sh",
  "skill for testing", "skill for deployment", "npx skills",
  "remove a skill", "list installed skills", "uninstall skill",
  "what skills do I have installed", "update skills".
  It should NOT be used when the user simply asks for help with a task —
  only when they explicitly want to discover, install, remove, or manage agent skills.
model: sonnet
allowed-tools: Bash(npx:*)
---

# Find Skills

Help users discover and install skills for **Claude Code** from the open agent skills ecosystem via the Skills CLI (`npx skills`).

**IMPORTANT**: This plugin targets Claude Code. Always use `-a claude-code` when installing or removing skills to scope them to the Claude Code agent.

## Skills CLI Reference

```bash
npx skills find [query]                          # Search for skills
npx skills add <source> -a claude-code -y        # Install a skill for Claude Code
npx skills add <source> -a claude-code -g -y     # Install globally for Claude Code
npx skills remove <skill> -a claude-code -y      # Remove a skill from Claude Code
npx skills remove <skill> -a claude-code -g -y   # Remove a global skill from Claude Code
npx skills list                                  # List installed skills
npx skills check                                 # Check for updates
npx skills update                                # Update all installed skills
npx skills init [name]                           # Scaffold a new skill
```

### Scope

- **Project scope** (default): skills installed in current directory, available only in this project
- **Global scope** (`-g`): skills installed at `~/`, available in all projects

### Key flags

- `-a claude-code` — **always include** — targets the Claude Code agent
- `-g` — global scope (`~/`) instead of project scope
- `-y` — skip confirmation prompts

Browse skills at: https://skills.sh/

## Workflow

### Step 1: Understand the Need

Identify from the user's request:
1. The domain (React, testing, design, deployment, etc.)
2. The specific task (writing tests, creating animations, reviewing PRs)
3. Whether a skill likely exists for this common task

If the user's intent is ambiguous (e.g., "testing" could mean unit, e2e, or load testing), use AskUserQuestion to clarify before searching.

### Step 2: Search via CLI

Run the find command with specific keywords:

```bash
npx skills find [query]
```

Examples:
- "find a skill for React performance" -> `npx skills find react performance`
- "is there a PR review skill?" -> `npx skills find pr review`
- "I want a changelog skill" -> `npx skills find changelog`

Search tips:
- Use specific keywords: "react testing" over just "testing"
- Try alternative terms: "deployment" or "ci-cd" if "deploy" fails
- Well-known sources include `vercel-labs/agent-skills` and `anthropics/skills` (verify current availability via search results)

### Step 3: Verify Quality

Do NOT recommend a skill based solely on search results. Always verify:

1. **Install count** — prefer 1K+ installs; be cautious under 100
2. **Source reputation** — official sources (`vercel-labs`, `anthropics`, `microsoft`) are more trustworthy
3. **GitHub stars** — repos with <100 stars warrant skepticism

### Step 4: Present Options

If multiple results are returned, present the top 3 sorted by install count. For each:
1. Name and what it does
2. Install count and source
3. Install command
4. Link to learn more at skills.sh

Example:

> I found a skill that might help! The "react-best-practices" skill provides
> React and Next.js performance optimization guidelines. (185K installs)
>
> To install: `npx skills add vercel-labs/agent-skills@react-best-practices -a claude-code -g -y`
>
> Browse: https://skills.sh/

If more than 3 results are relevant, summarize the rest briefly.

### Step 5: Install if Requested

If the user wants to proceed, ask about scope first:
- **Global** (recommended for general-purpose skills): `npx skills add <source> -a claude-code -g -y`
- **Project** (for project-specific skills): `npx skills add <source> -a claude-code -y`

Examples:
```bash
# Install a specific skill globally for Claude Code
npx skills add vercel-labs/agent-skills@react-best-practices -a claude-code -g -y

# Install an entire skill package for the current project
npx skills add anthropics/skills -a claude-code -y
```

### Managing Installed Skills

When the user wants to manage existing skills:

```bash
npx skills list                                         # Show what's installed
npx skills remove                                       # Interactive removal
npx skills remove my-skill -a claude-code -y            # Remove from Claude Code (project)
npx skills remove my-skill -a claude-code -g -y         # Remove from Claude Code (global)
npx skills remove --all                                 # Remove all skills from all agents
npx skills check                                        # Check for updates
npx skills update                                       # Update all skills
```

## Common Categories

| Category | Example Queries |
|---|---|
| Web Development | react, nextjs, typescript, css, tailwind |
| Testing | testing, jest, playwright, e2e |
| DevOps | deploy, docker, kubernetes, ci-cd |
| Documentation | docs, readme, changelog, api-docs |
| Code Quality | review, lint, refactor, best-practices |
| Design | ui, ux, design-system, accessibility |
| Productivity | workflow, automation, git |

## When No Skills Found

If no relevant skills exist:
1. Acknowledge that no skill was found
2. Offer to help with the task directly using general capabilities
3. Suggest the user can create their own skill with `npx skills init [name]`
