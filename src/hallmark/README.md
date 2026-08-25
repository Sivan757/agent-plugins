# Hallmark

Anti-AI-slop design skill, ported from [nutlope/hallmark](https://github.com/nutlope/hallmark) (MIT) into an Agent Plugins skill-only plugin.

Hallmark picks a macrostructure for the brief, dresses it in one of twenty-one themes, runs fifty-seven slop-test gates plus a pre-emit self-critique, and refuses the on-distribution defaults every LLM was trained into. Two pages by Hallmark for two different briefs feel like different sites, not colour-swaps of the same template.

## Skill

### hallmark

Triggers on: building a new app or landing page, "redesign this page", invoking Hallmark by name, or `audit` / `redesign` / `study` verbs.

## Golden path

The default verb is the product: the user asks to build or design something new, and the skill completes the whole workflow — pick a macrostructure (`references/structure.md`), apply a theme (21-theme catalog, with a quiet custom-theme branch for creative-intent briefs), emit self-contained HTML/CSS, then run the 57-gate slop test (`references/slop-test.md`) before handing back.

## Verbs

| Verb | What it does |
| --- | --- |
| *(default)* | Build new UI. Picks a macrostructure, applies the rule-set, runs the slop test before handing back. |
| `hallmark audit <target>` | Score existing code against the anti-patterns. Punch list, no edits. |
| `hallmark redesign <target>` | Throw out the visual structure, keep copy + IA + brand, rebuild with a different fingerprint. |
| `hallmark study <screenshot \| URL>` | Extract the design DNA from a design you admire: macrostructure, type-pairing, colour anchor. Refuses pixel-clones and paid templates. |

## Structure

```
src/hallmark/
├── plugin.config.ts
├── package.json
└── skills/
    └── hallmark/
        ├── SKILL.md            # rule-set entry: verbs, design flow, safety rail
        └── references/         # structure, color, typography, motion, slop test,
            │                   # 21 genres/themes, component cookbook, study protocol…
            └── components/     # named nav/hero/footer/testimonial primitives
```

Upstream version at port time: 1.1.0. Licence: MIT.
