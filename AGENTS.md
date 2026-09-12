# Agent Plugins

General repository guidelines for maintaining the shared plugin tree.

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
| Generated manifests and marketplace entries match the metadata sources | `npm run validate:plugin-metadata` |
| Claude manifest directories stay minimal and paths stay rooted in the plugin | `npm run validate:claude-layout` |
| Claude auto-discovery conventions for commands, agents, hooks, and MCP are respected | `npm run validate:claude-layout` |
| Agent-facing text only names `${CLAUDE_PLUGIN_ROOT}` paths the plugin actually ships | `npm run validate:claude-layout` |
| A plugin's config form only names components and field types the shared UI can draw, and ships the shared UI exactly when the plugin serves it | `npm run validate:config-ui` |
| A committed artifact under `plugins/*/dist` matches its source | CI job `validate-committed-bundles` (`npm run build` + `git diff`) |
| Marketplace entries exist and follow the local source/path policy | `npm run validate:marketplace` |
| Plugin versions stay consistent across metadata, `package.json`, generated manifests, marketplace entries, and the CLI's own `--version` | `npm run validate:versions` |
| Human-authored surfaces under `plugins/` and `docs/` carry no credential material | `npm run validate:no-secrets` |
| Skill, command, and agent frontmatter parses as YAML with the required fields | `npm run validate:frontmatter` |
| Shared metadata generation and validation behavior stays regression-tested | `bun test ./.github/scripts/tests` |

### Scriptable Next

| Design constraint | Suggested script gate |
| --- | --- |
| Each command-line plugin has at least one coarse-grained scenario command, not only primitive endpoint wrappers | Add a validator that checks `plugin.config.ts` capabilities/default prompts and command help for workflow verbs such as `stage`, `publish-draft`, `copy-connection`, `doctor`, `inspect`, or plugin-specific golden paths |
| Error feedback includes corrective context for likely Agent hallucinations | Require per-plugin tests for known failure modes; examples include unknown SQL column returning actual columns, missing project returning available projects, and missing account returning configured account names |
| Primitive commands are documented as fallback or diagnostic surfaces | Add a docs validator that scans each plugin README/SKILL for "Golden path" and "Fallback primitives" sections when a plugin exposes more than one command group |
| Tools fail fast instead of hiding broad self-healing behavior | Add a static heuristic that flags retry loops, rollback flows, and catch-all recovery blocks unless the command name or docs explicitly mark them as transport retry, dry-run, repair, or rollback |
| Diagnostics do not leak secrets | Add snapshot tests or a redaction validator for common secret keys in command output fixtures |
| Upstream error text is scrubbed of submitted credentials | Add a per-plugin test that feeds a configured secret back through a stubbed upstream error and asserts it does not appear in the printed message |
| Scenario commands avoid forcing users to handle vendor-internal IDs between adjacent steps | Add review checks for multi-step workflows where one command output is only useful as the next command's required input; prefer a composed command when that pattern appears |

## Source of Truth

- `plugins/<name>/` is the plugin: the directory itself is what Claude Code installs, and it is authored by hand
- `plugins/<name>/plugin.config.ts` is the source of truth for plugin metadata
- `plugins/<name>/.claude-plugin/plugin.json` and local marketplace entries are generated from that metadata; do not hand-edit them
- Shared runtime code lives inside the `config-center` plugin (`plugins/config-center/src`); CLI plugins depend on it as the workspace package `@agent-plugins/config-center`. Do not recreate a top-level `packages/` tree
- Do not keep a parallel local `plugin/` or `src/` tree; a native file has exactly one home
- Hooks, MCP configs, app configs, skills, commands, agents, and assets remain native runtime files; do not hide them behind generated cross-agent abstractions
- `CLAUDE.md` is a symlink to this file; keep broad repository guidance here

## Required Plugin Shape

Codex packaging, manifests, and marketplaces are no longer maintained, and there is no separate release tree: `plugins/<name>` is both the source and the installable artifact.

- Every local plugin directory must carry `plugin.config.ts`
- `.claude-plugin/` must stay minimal: it contains only the generated `plugin.json`
- Claude auto-discovery content belongs at plugin root, not under `.claude-plugin/`: `commands/`, `agents/`, `skills/`, `hooks/`, and `.mcp.json`
- Prefer Claude default discovery paths over manifest overrides; do not declare the standard `./hooks/hooks.json` in `.claude-plugin/plugin.json` because Claude auto-loads it
- Hook config is **optional**: add `hooks/hooks.json` (Claude wrapper format with a top-level `hooks` object) only when the plugin actually defines hooks. Do not ship empty `{"hooks": {}}` placeholders, and do not create a root-level `hooks.json`
- Each skill directory must contain `SKILL.md` with minimal compatible frontmatter: `name` + `description`
- Use `${CLAUDE_PLUGIN_ROOT}` for path-sensitive references in hooks, MCP configs, commands, agents, and skills, and only name paths the plugin actually ships
- A plugin that serves the browser config form declares it as plain data in `src/config-ui.ts` exporting `CONFIG_UI`; the shared vocabulary lives in `plugins/config-center/ui/src/shared/catalog-contract.ts`
- `dist/` is the whole shipped runtime surface: anything the bundle reads at runtime lives beside it, and no `runtime/` shadow copy exists
- Add `package.json` only when the plugin builds a bundle or runs tests; otherwise `plugin.config.ts` is the only metadata file
- Committed bundles under `plugins/<name>/dist/` are the shipped CLI. They are committed on purpose: this repository is installed as a git marketplace, and consumers cannot run a build
- Development-only material (scratch scripts, credential `.env` files, caches) does not belong in the plugin directory

## Marketplace Rules

- Claude Code registry: `.claude-plugin/marketplace.json` — the only marketplace file
- Local plugins must be registered in the Claude marketplace at `./plugins/<name>`
- Local marketplace entries are generated from `plugin.config.ts`; do not hand-edit them

## Repository Rules

- Store credentials in `~/.cache/agent-plugins/<plugin>.json`, never in project-local files
- Version bumps must update `plugins/<name>/plugin.config.ts`, `plugins/<name>/package.json` when the plugin has one, and the CLI's own `.version('…')` string when it declares one; then run `npm run generate:plugins`
- Run `npm run build` for the plugin whose CLI source changed; the bundle lands in that plugin's own `dist/` and is committed. `npm run build` reuses the shared config UI, whose own build runs first
- Run `npm run validate:plugins` before submitting changes that affect manifests, marketplaces, bundles, or skill metadata
- `npm run typecheck` covers each plugin's CLI and the shared config UI; the UI catalog is pinned to `catalog-contract.ts` by `satisfies`, so the contract cannot drift from the renderer
- When changing validator scripts, run `bun test ./.github/scripts/tests`
- Stage plugin changes explicitly by path; do not use `git add -A` in this repo

## Development Commands

- `bash scripts/dev.sh` (launch Claude Code against every plugin directory)
- `bash scripts/dev.sh --list`
- `bash scripts/dev.sh --build mysql` (rebuild bundles, then launch)
- `npm run generate:plugins`
- `npm run build`
- `npm run validate:plugins`

## Platform References

Platform-specific knowledge, migration notes, and practical experience live in reference docs instead of this file:

- Adding a plugin: [docs/plugin-development/authoring-a-plugin.md](docs/plugin-development/authoring-a-plugin.md)
- Claude Code plugin development: [docs/plugin-development/claude-code.md](docs/plugin-development/claude-code.md)
- Authoring and reviewing plugin skills: [docs/plugin-development/skill-authoring.md](docs/plugin-development/skill-authoring.md)
- Why the plugin tree and the credential form have their current shape: [docs/decisions/](docs/decisions/README.md)

Three rules from that guide are worth stating here:

- Anything that reads stored plugin configuration (previews, tests, screenshots) must redirect the cache with `AGENT_PLUGINS_CACHE_DIR`; setting `HOME` inside a script does not isolate it, and an unisolated config form renders real credentials into tool output. `AGENT_PLUGINS_CACHE_DIR` is enforced by a test.
- Shipped skill text, READMEs and CLI help must not carry deployment-specific identifiers (regions, domains, project UUIDs, tenant names); use placeholders and keep the shape of real output.
- Upstream error text is untrusted input. Never print a response body, error message or exception through verbatim: vendors echo submitted credentials back (a gateway answers an unknown key with `ak <AK> not exist`), which puts a live secret into terminal output, logs and an agent's context. Scrub any configured secret from that text first.

