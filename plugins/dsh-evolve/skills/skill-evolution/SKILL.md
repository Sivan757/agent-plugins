---
name: skill-evolution
description: Turn work that will happen again into a reusable asset, and keep the accumulated library honest. Use when a task repeats something already done, when a dsh-evolve hook reports a repeated call, a failure streak, or a long session, when deciding whether a lesson belongs in memory, a draft, or a skill, and when an accumulated skill turns out stale, wrong, or redundant with another.
---

# Skill evolution

Turn work that will happen again into something a later session can retrieve instead of re-derive. The unit is not "a script": it is a trigger, an asset, and a way to tell whether the asset still works.

Redoing work is not the only cost. Re-deriving it is also how two sessions reach two different answers to the same question.

## Pick the layer before writing anything

Three destinations. Putting a thing in the wrong one is what makes a library unusable.

| What you have | Where it goes | What verifies it |
|---|---|---|
| A one-off fact, an environment detail, project-specific operations knowledge | Memory: workspace for this project, global for something that holds anywhere | Nothing. It is a claim. |
| A diagnosed problem that has not recurred | A draft note, next to the work | Nothing yet. |
| A procedure you have already run and can check by running something | A **skill** | The script. |

Twice justifies a draft. It does not justify a skill. A skill is justified when it carries something executable and that something passes.

The most common failure is not having too few skills. It is promoting a note to a skill because the note was long.

## Prefer extending over adding

A skill directory is an index every session pays for whether it uses it or not, so the count is the cost that matters.

- Patch an existing skill before writing a new one.
- Two skills that look different can still be one skill. "Each has a distinct trigger" is not a reason to keep both.
- When one skill is narrower and a broader one can absorb it, the broader one wins and the narrower one is retired.
- A skill with no script and no procedure is a memory, not a skill. Move it.

## Make the asset checkable before you trust it

A skill whose only claim is prose can be wrong for a year without anyone noticing. Attach something that fails when the skill goes stale:

- A `scripts/` entry that reproduces the result, not one that merely describes it.
- A `references/` note recording how the skill was verified and when.
- An explicit precondition section, so a later reader can tell the environment moved.

Write the verification down in the skill body. The next session cannot re-run a check it cannot find.

## Keep the failure triage honest

When something goes wrong, the fix follows from what actually failed:

| What failed | What to do |
|---|---|
| An external tool or service | Route around it for this task. Record it only if it recurs. |
| Arguments or a schema | Patch the skill that produced the wrong call. |
| A repeated or redundant step | Patch the skill to cache, batch, or skip it. |
| The skill's content is stale or wrong | Patch it now. A skill nobody maintains becomes a liability. |
| The capability does not exist yet | Record the note and tell the user. Do not invent a workaround and call it solved. |
| A one-off | Nothing. |

Do not patch a skill without evidence for the change. "This might be clearer" is not evidence.

## Where an accumulated skill lives

Write accumulated skills under the user-level root `~/.agents/skills/<name>/`, which both Claude Code and DeepSeek Harness scan, and prefix the directory with `auto-` so the ones the agent wrote are distinguishable at a glance from the ones a person wrote.

Keep the trigger in the `description`. That field is the only part the model sees before loading the skill, so a `description` that does not name the situation is a skill that will not be found.

Keep an accumulated library small. Fold, retire, and archive rather than accreting: the value of the index is inversely proportional to its size.

## Report what you cannot fix

Some findings are not yours to resolve: a harness defect, a missing capability, a broken upstream service. Record them where the user will see them — a workspace memory entry for a project fact, or an explicit report in your reply for anything that needs a decision. Do not silently work around a blocker and present the result as correct.
