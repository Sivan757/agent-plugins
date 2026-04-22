# API Reference

Complete method signatures for `TickTickClient`. All methods are async.

## Table of Contents

1. [Client Lifecycle](#client-lifecycle)
2. [Tasks — Individual](#tasks--individual)
3. [Tasks — Filtering](#tasks--filtering)
4. [Tasks — Batch](#tasks--batch)
5. [Projects](#projects)
6. [Folders](#folders)
7. [Kanban Columns](#kanban-columns)
8. [Tags](#tags)
9. [Habits](#habits)
10. [Habit Check-ins](#habit-check-ins)
11. [User & Statistics](#user--statistics)
12. [Focus / Pomodoro](#focus--pomodoro)
13. [Sync](#sync)

---

## Client Lifecycle

```python
# Constructor (rarely used directly)
TickTickClient(
    client_id: str,
    client_secret: str,
    redirect_uri: str = "http://127.0.0.1:8080/callback",
    v1_access_token: str | None = None,
    username: str | None = None,
    password: str | None = None,
    timeout: float = 30.0,
    device_id: str | None = None,
)

# Factory (preferred — loads from .env / environment)
TickTickClient.from_settings(settings=None) → TickTickClient

# Connection
await client.connect() → None
await client.disconnect() → None

# Properties
client.is_connected → bool
client.inbox_id → str  # Inbox project ID
```

---

## Tasks — Individual

```python
await client.create_task(
    title: str,
    project_id: str | None = None,  # None = inbox
    *,
    content: str | None = None,      # Markdown body
    description: str | None = None,  # Plain text description
    priority: str | int | None = None,  # "none"/"low"/"medium"/"high" or 0/1/3/5
    start_date: str | datetime | None = None,
    due_date: str | datetime | None = None,
    time_zone: str | None = None,
    all_day: bool | None = None,
    reminders: list[str] | None = None,  # ["HH:MM", ...]
    recurrence: str | None = None,       # RRULE string
    tags: list[str] | None = None,
    parent_id: str | None = None,        # Make it a subtask
) → Task

await client.quick_add(
    text: str,                    # Natural language input
    project_id: str | None = None,
) → Task

await client.get_task(
    task_id: str,
    project_id: str | None = None,
) → Task

await client.get_all_tasks() → list[Task]

await client.update_task(task: Task) → Task
# Fetch the task first, modify its fields, then pass it back

await client.complete_task(task_id: str, project_id: str) → None
await client.delete_task(task_id: str, project_id: str) → None

await client.move_task(
    task_id: str,
    from_project_id: str,
    to_project_id: str,
) → None

await client.make_subtask(
    task_id: str,
    parent_id: str,
    project_id: str,
) → None

await client.unparent_subtask(
    task_id: str,
    project_id: str,
) → None

await client.search_tasks(query: str) → list[Task]

await client.pin_task(task_id: str, project_id: str) → Task
await client.unpin_task(task_id: str, project_id: str) → Task
```

---

## Tasks — Filtering

```python
await client.get_today_tasks() → list[Task]
await client.get_overdue_tasks() → list[Task]

await client.get_completed_tasks(
    days: int = 7,
    limit: int = 100,
) → list[Task]

await client.get_abandoned_tasks(
    days: int = 7,
    limit: int = 100,
) → list[Task]

await client.get_deleted_tasks(
    limit: int = 100,
) → list[Task]

await client.get_tasks_by_tag(tag_name: str) → list[Task]

await client.get_tasks_by_priority(
    priority: str | int,  # "high" or 5, etc.
) → list[Task]
```

---

## Tasks — Batch

All batch methods accept 1–100 items per call.

```python
await client.create_tasks(
    tasks: list[dict],
    # Each dict: {"title": str, "project_id": str, ...same keys as create_task}
) → list[Task]

await client.update_tasks(
    updates: list[dict],
    # Each dict: {"id": str, "project_id": str, ...fields to update}
) → dict[str, Any]

await client.complete_tasks(
    task_ids: list[tuple[str, str]],
    # Each tuple: (task_id, project_id)
) → dict[str, Any]

await client.delete_tasks(
    task_ids: list[tuple[str, str]],
) → dict[str, Any]

await client.move_tasks(
    moves: list[dict],
    # Each dict: {"task_id": str, "from_project_id": str, "to_project_id": str}
) → Any

await client.set_task_parents(
    assignments: list[dict],
    # Each dict: {"task_id": str, "parent_id": str, "project_id": str}
) → list[dict[str, Any]]

await client.unparent_tasks(
    tasks: list[dict],
    # Each dict: {"task_id": str, "project_id": str}
) → list[dict[str, Any]]

await client.pin_tasks(
    pin_operations: list[dict],
    # Each dict: {"task_id": str, "project_id": str}
) → list[Task]
```

---

## Projects

```python
await client.get_all_projects() → list[Project]
await client.get_project(project_id: str) → Project

await client.get_project_tasks(project_id: str) → ProjectData
# Returns ProjectData with .project, .tasks, .columns

await client.create_project(
    name: str,
    *,
    color: str | None = None,       # Hex color "#FF6347"
    kind: str = "TASK",             # "TASK" or "NOTE"
    view_mode: str = "list",        # "list", "kanban", "timeline"
    folder_id: str | None = None,
) → Project

await client.update_project(
    project_id: str,
    *,
    name: str | None = None,
    color: str | None = None,
    folder_id: str | None = None,
) → Project

await client.delete_project(project_id: str) → None
```

---

## Folders

```python
await client.get_all_folders() → list[ProjectGroup]
await client.create_folder(name: str) → ProjectGroup
await client.rename_folder(folder_id: str, name: str) → ProjectGroup
await client.delete_folder(folder_id: str) → None
```

---

## Kanban Columns

```python
await client.get_columns(project_id: str) → list[Column]

await client.create_column(
    project_id: str,
    name: str,
    *,
    sort_order: int | None = None,
) → Column

await client.update_column(
    column_id: str,
    project_id: str,
    *,
    name: str | None = None,
    sort_order: int | None = None,
) → Column

await client.delete_column(column_id: str, project_id: str) → None
await client.move_task_to_column(task_id: str, project_id: str, column_id: str) → Task
```

---

## Tags

```python
await client.get_all_tags() → list[Tag]

await client.create_tag(
    name: str,
    *,
    color: str | None = None,
    parent: str | None = None,   # Parent tag name for hierarchy
) → Tag

await client.update_tag(
    name: str,
    *,
    color: str | None = None,
    parent: str | None = None,
) → Tag

await client.rename_tag(old_name: str, new_name: str) → None
await client.merge_tags(source: str, target: str) → None  # Moves tasks from source→target
await client.delete_tag(name: str) → None
```

---

## Habits

```python
await client.get_all_habits() → list[Habit]
await client.get_habit(habit_id: str) → Habit
await client.get_habit_sections() → list[HabitSection]
await client.get_habit_preferences() → HabitPreferences

await client.create_habit(
    name: str,
    *,
    habit_type: str = "Boolean",   # "Boolean" (yes/no) or "Real" (numeric)
    goal: float = 1.0,            # Target value (1.0 for boolean)
    step: float = 0.0,            # Increment per tap (for numeric)
    unit: str = "Count",          # Unit label (for numeric)
    icon: str = "habit_daily_check_in",
    color: str = "#97E38B",
    section_id: str | None = None,  # morning/afternoon/night
    repeat_rule: str | None = None, # RRULE string
    reminders: list[str] | None = None,  # ["HH:MM", ...]
    target_days: int = 0,
    encouragement: str = "",
) → Habit

await client.update_habit(
    habit_id: str,
    *,
    name: str | None = None,
    goal: float | None = None,
    step: float | None = None,
    unit: str | None = None,
    icon: str | None = None,
    color: str | None = None,
    section_id: str | None = None,
    repeat_rule: str | None = None,
    reminders: list[str] | None = None,
    target_days: int | None = None,
    encouragement: str | None = None,
) → Habit

await client.delete_habit(habit_id: str) → None
await client.archive_habit(habit_id: str) → Habit
await client.unarchive_habit(habit_id: str) → Habit
```

---

## Habit Check-ins

```python
await client.checkin_habit(
    habit_id: str,
    value: float = 1.0,
    checkin_date: str | None = None,  # "YYYYMMDD" format, None = today
) → Habit

await client.checkin_habits(
    checkins: list[dict],
    # Each dict: {"habit_id": str, "value": float, "checkin_date": str | None}
) → dict[str, Habit]

await client.get_habit_checkins(
    habit_ids: list[str],
    after_stamp: int = 0,  # YYYYMMDD as integer, 0 = all history
) → dict[str, list[HabitCheckin]]
```

---

## User & Statistics

```python
await client.get_profile() → User
await client.get_status() → UserStatus       # Subscription info, inbox_id
await client.get_statistics() → UserStatistics  # Scores, completion counts
await client.get_preferences() → dict[str, Any]
```

---

## Focus / Pomodoro

```python
await client.get_focus_heatmap(
    start_date: str | None = None,
    end_date: str | None = None,
    days: int = 30,
) → list[dict[str, Any]]

await client.get_focus_by_tag(
    start_date: str | None = None,
    end_date: str | None = None,
    days: int = 30,
) → dict[str, int]
```

---

## Sync

```python
await client.sync() → dict  # Full account state snapshot
```
