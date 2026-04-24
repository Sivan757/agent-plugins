---
name: ticktick
description: >-
  This skill should be used when the user asks to "create a task", "add a
  todo", "list my tasks", "show today's tasks", "check my todos", "complete a
  task", "search tasks", "overdue tasks", "quick add", "batch create tasks",
  "create subtask", "checklist items", "manage projects", "manage tags",
  "kanban columns", "track habits", "check in habit", "focus heatmap",
  "productivity stats", "plan my day", "what did I complete", or mentions
  TickTick, Dida365, todo lists, task management, habit tracking, Pomodoro, or
  productivity tracking.
---

# TickTick Task Management

Full programmatic control of a TickTick (Dida365) account through the bundled CLI.

## CLI Usage

All commands follow the pattern:

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/ticktick.mjs <resource> <action> [args] [--options]
```

All output is JSON. Parse it to present results to the user.

**IMPORTANT**: In all examples below, `ticktick` is shorthand for `node ${CLAUDE_PLUGIN_ROOT}/dist/ticktick.mjs`. Always use the full path when executing commands.

## Tasks

### List tasks
```bash
# All active tasks
ticktick tasks list

# Today's tasks
ticktick tasks list --today

# Overdue tasks
ticktick tasks list --overdue

# Group by project
ticktick tasks list --today --group-by-project

# Filter by project, tag, or priority
ticktick tasks list --project <projectId>
ticktick tasks list --tag <tagName>
ticktick tasks list --priority high

# Completed tasks (last N days)
ticktick tasks list --completed --days 7 --limit 100
```

### Get a single task
```bash
ticktick tasks get <taskId> <projectId>
```

### Create a task
```bash
ticktick tasks create "Buy groceries" --project <projectId> --priority high --due 2025-03-15 --tags shopping,errands --content "Get milk and eggs" --all-day --parent <parentTaskId>
```
If `--project` is omitted, the task goes to the inbox. Use `--parent` to create as a subtask (auto-links via set-parent).

### Quick add (natural language)
```bash
ticktick tasks quick-add "Buy milk tomorrow at 3pm"
```

### Update a task
```bash
ticktick tasks update <taskId> <projectId> --title "New title" --priority medium --due 2025-04-01 --tags work,urgent --content "Updated notes" --column <columnId>
```

### Complete / Delete / Move
```bash
ticktick tasks complete <taskId> <projectId>
ticktick tasks delete <taskId> <projectId>
ticktick tasks move <taskId> <fromProjectId> <toProjectId>
```

### Search
```bash
ticktick tasks search "groceries"
```

### Batch create (JSON array via --json or stdin)
```bash
ticktick tasks batch-create --json '[{"title":"Task 1","priority":"high"},{"title":"Task 2","dueDate":"2025-04-01"}]'
```

### Batch complete
```bash
ticktick tasks batch-complete --json '[["taskId1","projectId1"],["taskId2","projectId2"]]'
```

### Batch delete
```bash
ticktick tasks batch-delete --json '[["taskId1","projectId1"],["taskId2","projectId2"]]'
```

### Subtasks

Subtasks are full task objects linked to a parent via `parentId`/`childIds`. Each subtask has its own priority, due date, tags.

```bash
# View subtasks of a parent
ticktick tasks subtasks <parentTaskId>

# Make existing task a subtask
ticktick tasks set-parent <taskId> <projectId> <parentId>

# Detach subtask
ticktick tasks unset-parent <taskId> <projectId> <oldParentId>
```

To create a subtask in one step, use `--parent` on create.

### Checklists

Checklist items are lightweight inline entries in a task's `items` array. A task with checklist items has `kind: "CHECKLIST"`.

```bash
ticktick tasks checklist <taskId>
ticktick tasks checklist-add <taskId> <title>
ticktick tasks checklist-check <taskId> <itemId>
ticktick tasks checklist-uncheck <taskId> <itemId>
ticktick tasks checklist-remove <taskId> <itemId>
ticktick tasks checklist-rename <taskId> <itemId> <newTitle>
```

## Projects

```bash
ticktick projects list
ticktick projects get <projectId>
ticktick projects create "Work" --color "#FF6347" --view kanban --kind TASK --folder <folderId>
ticktick projects update <projectId> --name "Renamed" --color "#00FF00"
ticktick projects delete <projectId>
```

## Folders

```bash
ticktick folders list
ticktick folders create "Personal"
ticktick folders rename <folderId> "New Name"
ticktick folders delete <folderId>
```

## Tags

```bash
ticktick tags list
ticktick tags create "work" --color "#FF0000" --parent <parentName>
ticktick tags update "work" --color "#00FF00"
ticktick tags rename "old-name" "new-name"
ticktick tags merge "source-tag" "target-tag"
ticktick tags delete "work"
```

## Kanban Columns

```bash
ticktick columns list <projectId>
ticktick columns create <projectId> "In Progress" --order 100
ticktick columns update <columnId> <projectId> --name "Done" --order 200
ticktick columns delete <columnId> <projectId>
```

## Habits

```bash
ticktick habits list
ticktick habits list --active
ticktick habits list --archived
ticktick habits get <habitId>
ticktick habits create "Morning Run" --type boolean --color "#97E38B"
ticktick habits create "Water Intake" --type real --goal 8 --step 1 --unit glasses
ticktick habits checkin <habitId> --value 1.0 --date 20250315
ticktick habits checkin-all
ticktick habits history <habitId1> <habitId2> --after 20250301
ticktick habits archive <habitId>
ticktick habits delete <habitId>
```

## User & Statistics

```bash
ticktick user profile
ticktick user status
ticktick user stats
```

## Focus / Pomodoro

```bash
ticktick focus heatmap --days 30
ticktick focus by-tag --days 30
```

## Sync (Full Account State)

```bash
ticktick sync
```

Returns all tasks, projects, tags, columns, etc. in a single call.

## Setup Device Info

When V2 auth fails with `username_password_not_match`, the user needs to provide their browser's X-Device header. Guide them:

1. Open the TickTick/Dida365 web version in browser
2. Open DevTools → Network tab
3. Find any request to `api.ticktick.com` or `api.dida365.com`
4. Copy the full `X-Device` request header value (a JSON string)
5. Paste it to you — you will parse and save it automatically

```bash
# Parse X-Device JSON and save device_id + full header to config
node ${CLAUDE_PLUGIN_ROOT}/dist/ticktick.mjs setup x-device '{"platform":"web","os":"...","device":"...","version":8023,"id":"...","channel":"website"}'
```

The command extracts the `id` field as `TICKTICK_DEVICE_ID` and stores the full JSON as `TICKTICK_X_DEVICE` in the config file.

## Auth (OAuth2 Token)

```bash
ticktick auth
```

Opens the browser for OAuth2 authorization. Required when `TICKTICK_ACCESS_TOKEN` is missing or expired.

## Important Details

### Priority Values
| Label  | Value | CLI flag          |
|--------|-------|-------------------|
| none   | 0     | `--priority none`   |
| low    | 1     | `--priority low`    |
| medium | 3     | `--priority medium` |
| high   | 5     | `--priority high`   |

### Task Status
| Status    | Meaning   |
|-----------|-----------|
| active    | In progress |
| completed | Done        |
| abandoned | Abandoned   |

### Host Configuration
The CLI reads credentials from `~/.cache/agent-plugins/ticktick.json` (global). When config is missing, a browser setup form opens automatically.

### API Architecture
- **V1 (OAuth2)**: projects, task get/create/complete/delete — uses Bearer token
- **V2 (Session)**: sync, task list/update/batch, habits, folders, tags, columns, user, focus — uses username/password auth

### Tips
- All output is JSON — parse it for presenting results
- For batch operations, use batch commands instead of looping
- When listing tasks, output includes: id, projectId, title, priority, status, dueDate, tags, parentId
- Use `sync` for comprehensive overviews — returns everything in one call
- Group by project (`--group-by-project`) for organized task views

## Reference Files

For detailed data model field definitions, see: `references/models.md`

For complete troubleshooting guide, see: `references/troubleshooting.md`

For understanding the underlying API capabilities (the CLI wraps these methods), see: `references/api-reference.md`
