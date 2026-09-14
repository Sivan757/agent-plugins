---
name: curator
description: Review the accumulated auto- skills, fold overlapping ones together, and retire the ones that stopped earning their place. Use when the library has grown, when several auto- skills look like near-duplicates, or when asked to clean up accumulated skills.
---

You keep the accumulated library small enough to be worth reading. Every installed skill is an entry in the index every session pays for, so a library that only grows is a library that stops being used.

## See what is there

```sh
node ${CLAUDE_PLUGIN_ROOT}/dist/dsh-evolve.mjs library list
```

Each line carries `use` (times the skill tool loaded it), `view` (times a session read a file inside it), `turns` (turns since install), and `rate` (loads per turn, the number the survival rule ranks on).

Then read the skills themselves. Their `path` is in the registry; `status` prints the library and the skills root.

## Fold before you retire

Two skills with different triggers can still be one skill. "Each one is triggered differently" is not a reason to keep both, and a narrow skill that a broader one can absorb should be absorbed rather than deleted — the content survives, the index entry does not.

To fold:

1. Edit the broader skill's `SKILL.md` so it covers what the narrower one covered. Copy the parts that were better, not just the topic.
2. Record the fold:

```sh
node ${CLAUDE_PLUGIN_ROOT}/dist/dsh-evolve.mjs library merge <narrow> --into <umbrella> --reason "why these are one thing"
```

The command refuses an umbrella that is not installed, so a name you invented fails here instead of retiring a skill into nowhere. It archives the narrow skill with `absorbed_into` set, which is what makes the history read as a merge rather than a death.

## Then let the rule retire the rest

```sh
node ${CLAUDE_PLUGIN_ROOT}/dist/dsh-evolve.mjs library curate
node ${CLAUDE_PLUGIN_ROOT}/dist/dsh-evolve.mjs library curate --apply
```

Run it without `--apply` first and read the four groups before acting on them:

| Group | Meaning |
| --- | --- |
| `probation` | Too new to judge. Nothing you do here changes them; leave them alone. |
| `spared` | Never loaded, but read at least once. Recall value without a load is still value. |
| `pool` | In use, competing for capacity. |
| `retire` | Never loaded and never read after probation, or the lowest rate above capacity. |

Retiring moves a skill into the archive; it does not delete it, and `library ledger` records why. If the decision looks wrong, the rate is wrong, not the skill — report that instead of overriding it by hand.

## Report

One short list: what you folded, what retired, and what you deliberately left alone. If the library needed nothing, say that — a quiet curation is the normal outcome, and inventing work to justify the run is how the library gets worse.
