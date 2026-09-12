# Apifox

Apifox CLI skills, ported from the official [apifox/apifox-cli-skills](https://github.com/apifox/apifox-cli-skills) into an Agent Plugins skill-only plugin. Upstream has no LICENSE file; these are official Apifox-authored skill documents (Chinese), carried over verbatim except for the in-plugin cross-references.

The skills teach the agent to drive the `apifox` CLI through a `--help / cli-schema validate / agentHints.nextSteps` loop: never build payloads from memory, always validate writes before executing them, and trust the current CLI output over any stale doc.

## Prerequisites

- `apifox` CLI installed and logged in (`npm i -g apifox-cli@latest`, then `apifox login --with-token <TOKEN>`).
- A project ID (from Apifox client: 项目设置 → 基本设置 → 项目 ID), optionally saved to `.apifox/settings.json`.

## Skills

| Skill | Purpose |
| --- | --- |
| `apifox-cli` | General entry point: project resource management, login/project setup, the mandatory write-validation flow, AI-branch and write-permission rules, and the must-ask-user list. |
| `apifox-cli-checkup` | CLI usage check and version confirmation: commands succeed but the page shows nothing, resources not found after create, missing reports, agentHints/help inconsistencies, or a stale local CLI. |
| `apifox-branch` | Branch collaboration: normal/iteration/AI branches, pick-to, merge, merge-request, protected branches, and AI write permissions. |
| `apifox-import-export` | Import/export with quality gates: OpenAPI/Postman/Swagger/Apifox-native formats, spec completeness metrics, tags grouping, module-import strategies, and post-import verification. |
| `apifox-test-case` | Interface test cases: test-case/test-data CRUD, categories, steps, assertions, extractors, processors, and direct run. |
| `apifox-test-scenario` | Test scenario modeling: importing endpoint/case/other-scenario steps, scenario references, conditions, loops, waits, scripts, database steps, and variable debugging. |
| `apifox-test-automation` | Automated test execution, suites and CI: test-suite, scheduled-task, runner, `apifox run`, execution parameters, and report upload. |
| `apifox-workflow-api-lifecycle` | End-to-end API lifecycle workflow: requirements → endpoint/schema design → environment → mock → test cases → doc export/publish → branch merge. |

## Golden path

The default verb is `apifox-cli` as the entry point, then loading the domain-specific skill for the business area (for example `apifox-test-scenario` for scenario modeling, `apifox-branch` for branch work). For any `create`/`update`, run the mandatory validate-then-write flow: `apifox cli-schema get <schemaKey>` → build the JSON payload file → `apifox cli-schema validate <schemaKey> --file <path>` → only then run the real command, and follow `agentHints.nextSteps` from the JSON output afterwards.

## Fallback primitives

The domain skills intentionally stay documentation-only (no scripts, no bundled CLIs). They are the agent-facing knowledge layer; the `apifox` CLI itself is the only executable surface and always wins over the skill text when the two disagree.

## Structure

```
plugins/apifox/
├── plugin.config.ts
└── skills/
    ├── apifox-cli/SKILL.md
    ├── apifox-cli-checkup/SKILL.md
    ├── apifox-branch/SKILL.md
    ├── apifox-import-export/SKILL.md
    ├── apifox-test-case/SKILL.md
    ├── apifox-test-scenario/SKILL.md
    ├── apifox-test-automation/SKILL.md
    └── apifox-workflow-api-lifecycle/SKILL.md
```

Upstream source at integration time: apifox/apifox-cli-skills `main` @ `8a98f5f` (2026-07-09). Licence: upstream carries no LICENSE file; see [upstream README](https://github.com/apifox/apifox-cli-skills).
