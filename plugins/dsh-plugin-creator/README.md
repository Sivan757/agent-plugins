# DSH Plugin Creator

DeepSeek Harness (dsh) plugin authoring skill. Covers developing, packaging, installing, and debugging a dsh plugin **in a repository of its own** — the case the harness's own documentation does not own.

## Skill

### dsh-plugin-creator

Triggers on: a dsh plugin, DeepSeek Harness plugin, `@deepseek-ai/dsh-*`, `cordis.yml`, `cordis.patch.yml`, `defineTool`, `dsh plugin add`, or writing a dsh extension in the user's own repository.

## Golden path

The plugin contract first — module shape (`apply` / `inject` / `Config`), registrations as effects, `ctx.get` for optional services — then a runnable local layer through a `--patch` overlay, then a bundle (`package.json` `dsh.bundle` + `cordis.patch.yml`), then install and verify with `dsh plugin --profile <name> --dump-config`.

Two rules carry most of the value: the standing constraints apply from this skill rather than a duplicated per-repository `AGENTS.md`, and every deployment-varying value must be a `Config` field.

## References

| File | Read it for |
| --- | --- |
| `references/official-docs.md` | Which official page answers which question, and how to fetch its raw Markdown — the docs site serves `<page-url>.md`, so nothing needs rendering |
| `references/bundle-and-profile.md` | Bundle and profile manifests, the four-layer composition order, the `allowBuilds` key shape, and the two failures that only surface at boot |

The skill body carries the workflow; the references carry lookup detail. Both stay current by pointing at the official raw Markdown rather than copying it.

## Verification

The skill ships no code. Its content was validated by running three authoring tasks (installable tool package, event-gate plugin, git-install distribution) with and without the skill, and 20 trigger queries against the description.
