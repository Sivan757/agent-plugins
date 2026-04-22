# Data Models Reference

All models use Pydantic v2 and inherit from `TickTickModel`. Import from `ticktick_sdk.models`.

## Table of Contents

1. [Task](#task)
2. [ChecklistItem](#checklistitem)
3. [TaskReminder](#taskreminder)
4. [Project](#project)
5. [ProjectData](#projectdata)
6. [ProjectGroup (Folder)](#projectgroup)
7. [Column](#column)
8. [Tag](#tag)
9. [Habit](#habit)
10. [HabitCheckin](#habitcheckin)
11. [HabitSection](#habitsection)
12. [User](#user)
13. [UserStatus](#userstatus)
14. [UserStatistics](#userstatistics)
15. [Constants & Enums](#constants--enums)

---

## Task

```
id: str                          # Unique task ID
project_id: str                  # Parent project/list ID
etag: str | None                 # Version tag for conflict detection
title: str | None                # Task title
content: str | None              # Rich text body (Markdown)
desc: str | None                 # Plain text description
kind: str                        # "TEXT", "NOTE", or "CHECKLIST"
status: int                      # -1=abandoned, 0=active, 2=completed
priority: int                    # 0=none, 1=low, 3=medium, 5=high
progress: int | None             # 0-100 for checklist completion
deleted: int                     # 0=not deleted
start_date: datetime | None
due_date: datetime | None
created_time: datetime | None
modified_time: datetime | None
completed_time: datetime | None
pinned_time: datetime | None
time_zone: str | None
is_all_day: bool | None
is_floating: bool                # No fixed timezone
repeat_flag: str | None          # RRULE recurrence string
repeat_from: int | None          # 0=due date, 1=completed date
repeat_first_date: datetime | None
repeat_task_id: str | None       # ID of original recurring task
ex_date: list[str] | None       # Excluded recurrence dates
reminder: str | None
reminders: list[TaskReminder]
remind_time: datetime | None
parent_id: str | None            # Parent task ID (for subtasks)
child_ids: list[str] | None
items: list[ChecklistItem]       # Checklist sub-items
tags: list[str]
column_id: str | None            # Kanban column
sort_order: int | None
assignee: Any | None
creator: int | None
completed_user_id: int | None
comment_count: int | None
attachments: list[Any]
focus_summaries: list[Any]
pomodoro_summaries: list[Any]
```

**Properties:**
- `task.is_completed → bool` (status == 2)
- `task.is_closed → bool` (completed or abandoned)
- `task.is_abandoned → bool` (status == -1)

---

## ChecklistItem

Sub-items within a checklist-type task.

```
id: str
title: str | None
status: int                 # 0=normal, 1=completed
completed_time: datetime | None
start_date: datetime | None
time_zone: str | None
is_all_day: bool | None
sort_order: int | None
```

---

## TaskReminder

```
id: str | None
trigger: str           # ICalendar trigger, e.g. "TRIGGER:-PT30M" (30 min before)
```

---

## Project

```
id: str
etag: str | None
name: str
color: str | None            # Hex color
kind: str                    # "TASK" or "NOTE"
group_id: str | None         # Folder ID
in_all: bool | None
view_mode: str               # "LIST", "KANBAN", "TIMELINE"
sort_option: SortOption | None
sort_order: int | None
sort_type: str | None
modified_time: datetime | None
is_owner: bool | None
user_count: int | None
muted: bool
transferred: bool
deleted: int
```

---

## ProjectData

Returned by `get_project_tasks()`.

```
project: Project
tasks: list[Task]
columns: list[Column]
```

---

## ProjectGroup

Folders that group projects together.

```
id: str
name: str
view_mode: str | None
sort_option: SortOption | None
sort_order: int | None
sort_type: str | None
deleted: int
show_all: bool
team_id: Any | None
user_id: int | None
```

---

## Column

Kanban board columns within a project.

```
id: str
project_id: str
name: str
sort_order: int | None
created_time: datetime | None
modified_time: datetime | None
etag: str | None
```

---

## Tag

```
name: str              # Lowercase identifier
label: str             # Display name (original case)
raw_name: str | None
etag: str | None
color: str | None      # Hex color
parent: str | None     # Parent tag name (for hierarchy)
sort_option: SortOption | None
sort_type: str | None
sort_order: int | None
type: int | None
```

**Properties:**
- `tag.is_nested → bool` (has parent)

---

## Habit

```
id: str
name: str
icon: str                    # Icon identifier
color: str                   # Hex color
sort_order: int
status: int                  # 0=active, 2=archived
encouragement: str
total_checkins: int
created_time: datetime | None
modified_time: datetime | None
archived_time: datetime | None
habit_type: str              # "Boolean" or "Real"
goal: float                  # Target value (1.0 for boolean)
step: float                  # Increment per tap (numeric only)
unit: str                    # Unit label (numeric only)
etag: str | None
repeat_rule: str | None      # RRULE string
reminders: list[str]         # ["HH:MM", ...]
record_enable: bool
section_id: str | None       # Time-of-day section
target_days: int
target_start_date: int | None  # YYYYMMDD
completed_cycles: int
ex_dates: list[str]
current_streak: int
style: int
```

**Properties:**
- `habit.is_boolean → bool`
- `habit.is_numeric → bool`
- `habit.is_active → bool`
- `habit.is_archived → bool`

---

## HabitCheckin

```
checkin_stamp: int          # YYYYMMDD as integer
status: int                 # 0=unchecked, 1=checked, 2=completed
value: float | None
record_value: float | None
date: str | None
```

---

## HabitSection

Time-of-day groupings for habits.

```
id: str
name: str                   # "_morning", "_afternoon", "_night"
sort_order: int
created_time: datetime | None
modified_time: datetime | None
etag: str | None
```

---

## User

```
username: str
display_name: str | None
name: str | None
picture: str | None
locale: str | None
site_domain: str | None
user_code: str | None
verified_email: bool
filled_password: bool
email: str | None
```

---

## UserStatus

```
user_id: str
user_code: str | None
username: str
inbox_id: str
is_pro: bool
pro_start_date: str | None
pro_end_date: str | None
subscribe_type: str | None
subscribe_freq: str | None
need_subscribe: bool
free_trial: bool
grace_period: bool
team_user: bool
team_pro: bool
active_team_user: bool
```

---

## UserStatistics

```
score: int
level: int
yesterday_completed: int
today_completed: int
total_completed: int
score_by_day: dict[str, int]
task_by_day: dict[str, TaskCount]
task_by_week: dict[str, TaskCount]
task_by_month: dict[str, TaskCount]
today_pomo_count: int
yesterday_pomo_count: int
total_pomo_count: int
today_pomo_duration: int          # seconds
yesterday_pomo_duration: int
total_pomo_duration: int
pomo_goal: int
pomo_duration_goal: int
pomo_by_day: dict[str, Any]
pomo_by_week: dict[str, Any]
pomo_by_month: dict[str, Any]
```

**TaskCount:**
```
complete_count: int
not_complete_count: int
total → int  # Property (complete + not_complete)
```

---

## Constants & Enums

Import from `ticktick_sdk.constants`:

```python
class TaskStatus(IntEnum):
    ABANDONED = -1
    ACTIVE = 0
    COMPLETED_ALT = 1
    COMPLETED = 2

class TaskPriority(IntEnum):
    NONE = 0
    LOW = 1
    MEDIUM = 3
    HIGH = 5

class TaskKind(StrEnum):
    TEXT = "TEXT"
    NOTE = "NOTE"
    CHECKLIST = "CHECKLIST"

class ProjectKind(StrEnum):
    TASK = "TASK"
    NOTE = "NOTE"

class ViewMode(StrEnum):
    LIST = "LIST"
    KANBAN = "KANBAN"
    TIMELINE = "TIMELINE"

class RepeatFrom(IntEnum):
    DUE_DATE = 0
    COMPLETED_DATE = 1

class SubtaskStatus(IntEnum):
    NORMAL = 0
    COMPLETED = 1

DEFAULT_TIMEOUT = 30.0
DEFAULT_HOST = "ticktick.com"  # or "dida365.com"
```
