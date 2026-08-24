# Agent Plugins

General repository guidelines for maintaining the shared plugin source and release trees.

## Product Design Principles

Agent Plugins follows a "smart Agent, simple tool" architecture. Plugins are execution bodies and sensors; the Agent is the reasoning layer. A plugin should do the action, observe the environment, and return enough context for the Agent to decide the next step. Do not turn plugins into hidden agents with complex self-healing state machines, broad retry loops, or local transaction managers.

### Interface Shape

- Prefer coarse-grained scenario commands as the golden path. A useful command should complete a real workflow end to end, such as "package and stage a WeChat draft" rather than exposing only "upload image" and "create article" as unrelated commands.
- Keep fine-grained primitive commands only as fallback surfaces for inspection, manual compensation, or unusual edge cases. Primitive commands are not the product API by themselves.
- Do not map third-party APIs one-to-one unless the plugin is explicitly a low-level diagnostic adapter. Raw endpoint wrappers increase planning entropy and usually make the Agent do avoidable orchestration.
- Use names that describe user intent and workflow outcomes, not vendor endpoint names. Expose vendor IDs only when the user or a later command truly needs them.

### Error Feedback

- Fail fast when an operation cannot continue. Do not silently mask failures with hidden retries, local rollbacks, or alternate flows unless the command explicitly documents that behavior.
- Error output must include actionable context. When an Agent likely hallucinated an argument, return nearby ground truth with the error. Examples: existing database columns for an unknown column, available projects/columns for an unknown TickTick target, valid account names for a missing account, or matching candidates for a not-found ID.
- Prefer returning the next viable command or corrective input shape over generic failure text. The goal is not for the tool to decide; the goal is to give the Agent a precise path for reflection and recovery.
- Keep sensitive values out of diagnostics. Redact tokens, passwords, cookies, and full secret-bearing URLs.

### Evolution And Idempotency

- Apply YAGNI. Do not build local distributed transactions, broad idempotency stores, or cleanup schedulers before real failures justify them.
- Delegate idempotency, deduplication, and conflict handling to the upstream service when the service already provides it.
- Add fine-grained rollback or repair commands only after real dirty data appears and blocks useful work. Document the dirty-state symptom that justified the addition.

## Script-Backed Quality Gates

Some repository constraints are already enforced by scripts. Others are design-quality constraints that should be added to validators when they become stable enough to enforce.

### Already Enforced

| Constraint | Script gate |
| --- | --- |
| `plugin.config.ts` is the metadata source of truth | `npm run generate:plugins`, `npm run validate:plugin-metadata` |
| Generated installable artifacts under `plugins/` match source metadata and release shape | `npm run pack:plugins`, `npm run validate:plugin-packs` |
| Claude manifest directories stay minimal and paths stay rooted in the plugin | `npm run validate:claude-layout` |
| Claude auto-discovery conventions for commands, agents, hooks, and MCP are respected | `npm run validate:claude-layout` |
| Codex manifest paths use supported root-standard locations and point at real files | `npm run validate:codex-layout` |
| Marketplace entries exist and follow the local source/path policy | `npm run validate:marketplace` |
| Plugin versions stay consistent across source metadata and generated manifests | `npm run validate:versions` |
| Human-authored surfaces under `src/`, `plugins/`, and `docs/` carry no credential material | `npm run validate:no-secrets` |
| Shared metadata generation and packing behavior stays regression-tested | `bun test ./.github/scripts/tests` |

### Scriptable Next

| Design constraint | Suggested script gate |
| --- | --- |
| Each command-line plugin has at least one coarse-grained scenario command, not only primitive endpoint wrappers | Add a validator that checks `plugin.config.ts` capabilities/default prompts and command help for workflow verbs such as `stage`, `publish-draft`, `copy-connection`, `doctor`, `inspect`, or plugin-specific golden paths |
| Error feedback includes corrective context for likely Agent hallucinations | Require per-plugin tests for known failure modes; examples include unknown SQL column returning actual columns, missing project returning available projects, and missing account returning configured account names |
| Primitive commands are documented as fallback or diagnostic surfaces | Add a docs validator that scans each plugin README/SKILL for "Golden path" and "Fallback primitives" sections when a plugin exposes more than one command group |
| Tools fail fast instead of hiding broad self-healing behavior | Add a static heuristic that flags retry loops, rollback flows, and catch-all recovery blocks unless the command name or docs explicitly mark them as transport retry, dry-run, repair, or rollback |
| Diagnostics do not leak secrets | Add snapshot tests or a redaction validator for common secret keys in command output fixtures |
| Scenario commands avoid forcing users to handle vendor-internal IDs between adjacent steps | Add review checks for multi-step workflows where one command output is only useful as the next command's required input; prefer a composed command when that pattern appears |

## Source of Truth

- Local plugin implementations live under `src/`
- Generated, installable plugin artifacts live under `plugins/`
- Shared runtime code lives inside the `config-center` plugin (`src/config-center`); CLI plugins depend on it as the workspace package `@agent-plugins/config-center`. Do not recreate a top-level `packages/` tree
- Do not keep a parallel local `plugin/` tree
- `src/<name>/plugin.config.ts` is the source of truth for plugin metadata
- `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json`, and local marketplace entries are generated metadata; do not hand-edit them
- Hooks, MCP configs, app configs, skills, commands, agents, and assets remain native runtime files; do not hide them behind generated cross-agent abstractions
- `CLAUDE.md` is a symlink to this file; keep broad repository guidance here

## Required Plugin Shape

- Every local plugin must carry `plugin.config.ts`
- Source-tree plugins must not carry generated `.codex-plugin/` or `.claude-plugin/` manifests
- Release-tree manifest directories are generated and must stay minimal: `.codex-plugin/` and `.claude-plugin/` should contain only `plugin.json`
- Codex bundle content belongs at plugin root: `skills/`, `hooks.json`, `.mcp.json`, `.app.json`, and `assets/` when present
- Codex manifest paths must use the root-standard locations: `./skills/`, `./hooks.json`, `./.mcp.json`, `./.app.json`, and `./assets/...`
- Claude auto-discovery content belongs at plugin root, not under `.claude-plugin/`: `commands/`, `agents/`, `skills/`, `hooks/`, and `.mcp.json`
- Prefer Claude default discovery paths over manifest overrides; do not declare the standard `./hooks/hooks.json` in `.claude-plugin/plugin.json` because Claude auto-loads it
- Claude-compatible hook config lives at `hooks/hooks.json`
- Claude hook config must use the plugin wrapper format with a top-level `hooks` object
- If hook config exists, keep `hooks.json` and `hooks/hooks.json` together and JSON-identical
- Codex manifest paths must stay `./`-relative to the plugin root and point at real files or directories
- Each skill directory must contain `SKILL.md` with minimal compatible frontmatter: `name` + `description`
- Optional per-skill Codex metadata may live in `agents/openai.yaml`
- Use `${CLAUDE_PLUGIN_ROOT}` for Claude-side path-sensitive references in hooks, MCP configs, commands, agents, and skills

## Marketplace Rules

- Codex registry: `.agents/plugins/marketplace.json`
- Claude Code registry: `.claude-plugin/marketplace.json`
- Local plugins must be registered in both marketplace files at `./plugins/<name>`
- Codex marketplace local entries must use `{ "source": "local", "path": "./plugins/<name>" }`
- Codex marketplace entries must always include `policy.installation`, `policy.authentication`, and `category`
- Local marketplace entries are generated from `plugin.config.ts`

## Repository Rules

- Store credentials in `~/.cache/agent-plugins/<plugin>.json`, never in project-local files
- Version bumps must update `src/<name>/plugin.config.ts` and `src/<name>/package.json` when the plugin has a buildable workspace, then regenerate metadata and release artifacts
- Run `npm run generate:plugins` after plugin metadata changes
- Run `npm run build` before refreshing release artifacts for buildable plugins; runtime bundles are staged under `.build/plugin-dist/`
- Run `npm run validate:plugins` before submitting changes that affect manifests, marketplaces, or skill metadata
- Run `npm run pack:plugins` and `npm run validate:plugin-packs` before publishing or testing clean installable artifacts under `plugins/`
- When changing validator scripts, run `bun test ./.github/scripts/tests`
- Stage plugin changes explicitly by path; do not use `git add -A` in this repo

## Development Commands

- `bash scripts/dev.sh --target codex`
- `bash scripts/dev.sh --target claude`
- `bash scripts/dev.sh --list`
- `npm run generate:plugins`
- `npm run pack:plugins`
- `npm run validate:plugin-metadata`
- `npm run validate:plugin-packs`
- `npm run validate:plugins`

## Platform References

Platform-specific knowledge, migration notes, and practical experience live in reference docs instead of this file:

- Codex plugin development: [docs/plugin-development/codex.md](docs/plugin-development/codex.md)
- Claude Code plugin development: [docs/plugin-development/claude-code.md](docs/plugin-development/claude-code.md)

Official upstream references:

- Codex build docs: [developers.openai.com/codex/plugins/build](https://developers.openai.com/codex/plugins/build)
- Codex skills docs: [developers.openai.com/codex/skills](https://developers.openai.com/codex/skills)
