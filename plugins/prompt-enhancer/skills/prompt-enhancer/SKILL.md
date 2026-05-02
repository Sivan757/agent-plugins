---
name: prompt-enhancer
description: This skill should be used when the user asks to "improve my prompt", "enhance this prompt", "make this prompt clearer", "optimize this requirement", "turn this into a better coding prompt", "提示词优化", "增强提示词", "优化需求", or when a vague development request should be rewritten into a clearer prompt before execution.
---

# Prompt Enhancer

Transform vague or underspecified user prompts into clear, actionable prompts that preserve the user's intent and make the expected outcome explicit.

## Core Principle

Enhance clarity without inventing hidden requirements. Add structure, context, constraints, success criteria, and verification expectations. Keep inferred details visible as assumptions, and ask only when missing information changes the task materially or creates risk.

## When to Use

Use for requests that involve prompt improvement, requirement clarification, development-task framing, architecture planning, bug investigation prompts, code review prompts, test prompts, migration prompts, documentation prompts, or broad "make this clearer" wording.

Do not use when the user clearly wants the task executed immediately and the prompt is already actionable. In that case, proceed with the work and clarify only genuine blockers.

## Enhancement Pipeline

### 1. Assess the Input

Evaluate what the original prompt already states and what is missing.

| Dimension | Check for | If missing |
| --- | --- | --- |
| Objective | Desired outcome or decision | Restate the goal in concrete terms |
| Task type | Build, debug, review, refactor, explain, research | Infer from verbs and context |
| Scope | Files, modules, systems, environments | Add boundaries or mark as assumption |
| Context | Repository, stack, APIs, data, prior attempts | Ask if required; otherwise request inspection |
| Constraints | Performance, security, compatibility, style, deadlines | Add explicit placeholders only when relevant |
| Inputs | Error text, examples, logs, screenshots, schemas | Request artifacts when they determine the answer |
| Output | Format, length, language, deliverable | Specify a practical default |
| Verification | Tests, commands, evidence, acceptance criteria | Add measurable checks |
| Risk | Production impact, credentials, data loss, legal or financial stakes | Require confirmation before risky assumptions |

### 2. Decide Ask vs Infer

Infer details when the repo, files, or surrounding conversation can answer them cheaply. State assumptions in the enhanced prompt.

Ask a clarifying question before producing the final enhanced prompt when:
- Multiple plausible interpretations lead to different work.
- The task affects production, credentials, billing, data deletion, security, or irreversible operations.
- The user asks for a reusable prompt where the target audience or tool is unknown.
- Required artifacts are absent and cannot be discovered locally.

### 3. Apply Enhancements

Use these transformations:

- Replace vague verbs with observable outcomes. Convert "fix this" into "identify the root cause, implement the smallest safe fix, and verify with targeted tests."
- Add domain vocabulary. For coding work, name the likely surfaces: repository, module, API contract, test suite, build command, migration, rollout, logs, or acceptance criteria.
- Add boundaries. Say what to change, what to preserve, and what to ignore.
- Add evidence requirements. Require file references, command output, screenshots, logs, or source links where useful.
- Add collaboration mode. Separate "analyze only", "discuss first", "implement", "commit", or "do not edit files."
- Preserve the user's language and intent. Improve precision without changing priority, tone, or business goal.
- Avoid overfitting. Do not add specific technologies, filenames, colors, API names, or metrics unless they are present or discoverable.

### 4. Format the Output

Return the enhanced prompt by default. Use this structure unless the user requests another format:

```markdown
**Enhanced Prompt**
[One concise paragraph describing the task, target outcome, and context.]

**Context**
- [Known context from the original prompt]
- [Artifacts or repository areas to inspect]

**Requirements**
1. [Concrete requirement]
2. [Concrete requirement]
3. [Constraint or non-goal]

**Deliverable**
- [Expected response or file/code changes]
- [Preferred language, format, or level of detail]

**Verification**
- [Tests, commands, logs, screenshots, or acceptance checks]

**Assumptions**
- [Only assumptions that were inferred]

**Clarifying Questions**
- [Only questions that must be answered before execution]
```

Omit empty sections. If the user wants a concise prompt, collapse the structure into one polished paragraph plus a short checklist.

## Development Task Defaults

For implementation prompts, include:
- Inspect the existing codebase and follow local patterns.
- Keep changes scoped to the requested behavior.
- Preserve unrelated user changes.
- Add or update focused tests when behavior changes.
- Run relevant validation and report any command that could not be run.

For debugging prompts, include:
- Reproduce or inspect the failure first.
- Gather evidence before proposing a fix.
- Identify root cause, not only symptoms.
- Verify the fix with the narrowest reliable command.

For review prompts, include:
- Prioritize bugs, regressions, security issues, and missing tests.
- Provide file and line references.
- Keep summaries secondary to findings.

For architecture prompts, include:
- State constraints, trade-offs, failure modes, and operational risks.
- Separate decisions from open questions.
- Avoid implementation detail until the target architecture is clear.

Load `references/development-prompt-framework.md` when the user asks for examples, templates by task type, or a more comprehensive prompt enhancement.

## Quality Bar

Before returning, check that the enhanced prompt:
- States a single primary objective.
- Defines the expected deliverable.
- Names enough context to start work.
- Makes constraints and non-goals explicit.
- Contains measurable acceptance or verification criteria.
- Separates assumptions from confirmed facts.
- Avoids fabricating details not present in the user's request.
