# Development Prompt Framework

Use this reference for complex prompt enhancement or when the user asks for task-specific templates.

## Universal Prompt Skeleton

```markdown
Act as [role]. I need help with [objective] in [context].

Current situation:
- [Known facts]
- [Relevant files, systems, logs, or artifacts]
- [What has already been tried]

Task:
1. [Primary action]
2. [Secondary action]
3. [What to avoid changing]

Constraints:
- [Technical constraints]
- [Security, compatibility, performance, or operational constraints]
- [Preferred style or conventions]

Deliverable:
- [Exact output format]
- [Expected level of detail]

Verification:
- [Commands, tests, screenshots, logs, or acceptance criteria]

If information is missing, inspect what can be discovered locally, state assumptions, and ask only for blockers.
```

## Task-Specific Additions

### Feature Implementation

Add:
- User-facing behavior and acceptance criteria.
- Target module or workflow.
- Data model, API, UI, or integration boundaries.
- Test expectations.
- Migration or rollout constraints when applicable.

### Bug Fix

Add:
- Exact error, observed behavior, and expected behavior.
- Reproduction steps or evidence source.
- A requirement to identify root cause before editing.
- Regression test expectation.
- Verification command.

### Code Review

Add:
- Diff, branch, commit, or file scope.
- Review stance: bugs first, then security, regressions, tests, maintainability.
- Required output: findings with severity and file references.
- Explicitly avoid broad style commentary unless it hides a defect.

### Refactor

Add:
- Behavior that must remain unchanged.
- Motivation: readability, modularity, performance, testability, dependency direction.
- Boundaries: allowed files and forbidden rewrites.
- Equivalence checks and tests.

### Architecture or Design

Add:
- Business goal and non-functional requirements.
- Scale, availability, latency, security, data consistency, and operational constraints.
- Alternatives to compare.
- Decision criteria and risks.
- What should remain as open questions.

### Documentation

Add:
- Audience and assumed knowledge level.
- Source files or behavior to document.
- Format: README, runbook, API guide, architecture note, migration guide.
- Examples required or excluded.
- Accuracy check against current code or commands.

## Inference Rules

- Prefer concrete facts from repository files, logs, screenshots, or provided artifacts.
- Use assumptions for likely but unconfirmed details.
- Use questions for blockers, not for information that can be inspected.
- Avoid expanding scope from "make clearer" into "solve the whole problem" unless the user explicitly asks.
- Preserve user priority: speed, safety, depth, brevity, or discussion-first.
