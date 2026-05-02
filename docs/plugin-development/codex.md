# Codex Plugin Development Notes

Repository-specific knowledge for building and maintaining Codex-compatible plugins in this repo.

## Official Baseline

Codex plugins are defined around a required `.codex-plugin/plugin.json` manifest. Optional plugin surfaces include:

- `skills/`
- `.mcp.json`
- `.app.json`
- `assets/`

Relevant upstream docs:

- [Build Codex plugins](https://developers.openai.com/codex/plugins/build)
- [Codex skills](https://developers.openai.com/codex/skills)

## What We Standardized In This Repo

- `src/` is the only local source tree for active plugins
- `plugins/` is the generated release tree referenced by local marketplace entries
- Every local plugin keeps `plugin.config.ts` as generated metadata source of truth
- Generated Codex and Claude manifests are emitted into the release tree
- Codex hooks live at plugin-root `hooks.json`
- Codex marketplace lives in `.agents/plugins/marketplace.json`
- Local Codex marketplace entries use `{ "source": "local", "path": "./plugins/<name>" }`
- Codex hook config must also be mirrored to `hooks/hooks.json` for Claude compatibility

## Manifest Conventions

- Keep `.codex-plugin/` minimal: only generated `plugin.json`
- Do not hand-edit `.codex-plugin/plugin.json`; edit `src/<name>/plugin.config.ts`, then regenerate and repack
- Use stable kebab-case plugin names
- Prefer explicit canonical root paths: `./skills/`, `./hooks.json`, `./.mcp.json`, `./.app.json`
- Keep Codex paths rooted in the plugin directory, never pointing outside the plugin root
- If `skills/` exists, declare `surfaces.skills` in `plugin.config.ts`
- If `hooks.json` exists, declare `surfaces.hooks: "native"` in `plugin.config.ts`
- If `.mcp.json` exists, declare `surfaces.mcp` in `plugin.config.ts`
- If `.app.json` exists, declare `surfaces.app` in `plugin.config.ts`

## Release Artifacts

- Development source stays under `src/<name>`
- Buildable plugins emit runtime bundles under `.build/plugin-dist/<name>/`
- Clean installable artifacts are generated and committed under `plugins/<name>`
- Source-tree plugins must not contain `.codex-plugin/` or `.claude-plugin/`
- Packed artifacts include generated manifests plus native runtime surfaces such as `skills/`, `hooks.json`, `hooks/`, `.mcp.json`, `.app.json`, `assets/`, and `dist/`
- Packed artifacts exclude source-only files such as `src/`, `package.json`, `package-lock.json`, `tsconfig.json`, `plugin.config.ts`, and `node_modules/`
- Plugin-specific runtime files that are not copied by default must be declared through `artifact.include` in `plugin.config.ts`

## Skill Conventions

- Every skill directory must contain `SKILL.md`
- Keep frontmatter minimal and portable: `name` + `description`
- Treat `SKILL.md` as agent-facing instruction text, not marketing copy
- Put optional Codex-specific skill metadata in `agents/openai.yaml`
- Keep reference material in `references/` when the skill is knowledge-heavy

## Marketplace Experience

- The repo now validates the Codex marketplace shape in CI and locally
- Local Codex marketplace entries are generated from `plugin.config.ts`
- This repo standardizes on the official local-source object form and does not use string sources for local Codex entries:

```json
{
  "name": "mysql",
  "source": {
    "source": "local",
    "path": "./plugins/mysql"
  }
}
```

## Practical Lessons

- Codex rules are strict enough that validation should run before review, not after
- Keeping `SKILL.md` frontmatter minimal avoids drift between Codex and Claude
- Path validation matters more than it first appears; broken `./` references are easy to introduce during migrations
- Hook drift is a real maintenance problem; root `hooks.json` and `hooks/hooks.json` should be treated as native files, copied and validated but not translated through a custom DSL
- Keeping Codex-specific metadata optional prevents overfitting plugins to one client
- `assets/` should be treated as the default home for visual interface files when a plugin adds branded UI metadata

## Local Workflow

```bash
bash scripts/dev.sh --target codex
npm run generate:plugins
npm run validate:plugin-metadata
npm run build
npm run pack:plugins
npm run validate:plugin-packs
npm run validate:plugins
```

For quick local launch without packing:

```bash
bash scripts/dev.sh --target codex
npm run validate:plugins
```

## Migration Notes

- The repo originally centered on Claude-style plugin layout
- We added Codex compatibility without creating a second local source tree
- The converter script can still help migrate Claude-oriented plugins into the shared layout:

```bash
npm run convert-to-codex -- --source /path/to/source-plugin --marketplace-root .
```

- The converter intentionally preserves some Claude-oriented runtime assumptions and emits warnings instead of guessing replacements
- `${CLAUDE_PLUGIN_ROOT}` may remain in migrated skills and should be reviewed manually before relying on path-sensitive behavior in Codex
