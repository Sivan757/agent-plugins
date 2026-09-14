---
name: evolve
description: Review what this session repeated or failed at, and decide what to fold into a reusable skill
---

Turn what happened in this session into something a later session can reuse, or establish that nothing here is worth keeping.

## Read the trace

```sh
node ${CLAUDE_PLUGIN_ROOT}/dist/dsh-evolve.mjs status
```

It prints the thresholds in force, the installed library with each skill's usage rate, any staged drafts, and this session's call count and recent calls. Two entries with the same tool and the same argument digest were the same call with the same arguments.

## Decide, then do the smallest thing that is honest

Load the `skill-evolution` skill and apply its layer table. The question is not "was this hard" but "will this recur, and can I tell whether the result is still right".

- Nothing repeated and nothing checkable → say so and stop. A quiet session is a valid answer.
- A procedure that ran, with a result you can reproduce → hand it to the `reflector` agent, which stages a draft and proves it runs.
- A fact or an environment detail → memory, not a skill.
- Several accumulated skills that overlap, or a library that has gone stale → hand it to the `curator` agent.
- Something you could not resolve → report it rather than recording a workaround as a fix.

## Promote only on evidence

```sh
node ${CLAUDE_PLUGIN_ROOT}/dist/dsh-evolve.mjs draft check <name>
node ${CLAUDE_PLUGIN_ROOT}/dist/dsh-evolve.mjs draft promote <name>
```

`promote` re-runs the check and refuses on `FAIL`, so there is no path to installing a skill whose proof does not pass. If the check cannot be made to pass, drop the draft rather than loosening it.

## Report

State what you found and what you did in one short list. Name any skill you installed or retired, and the check that justified it.
