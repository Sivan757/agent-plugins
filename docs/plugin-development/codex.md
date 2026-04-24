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

- `plugins/` is the only local source tree for active plugins
- Every local plugin keeps a Codex manifest and a Claude manifest side by side
- Codex hooks live at plugin-root `hooks.json`
- Codex marketplace lives in `.agents/plugins/marketplace.json`
- Local Codex marketplace entries use `{ "source": "local", "path": "./plugins/<name>" }`
- Codex hook config must also be mirrored to `hooks/hooks.json` for Claude compatibility

## Manifest Conventions

- Keep `.codex-plugin/` minimal: only `plugin.json`
- Use stable kebab-case plugin names
- Prefer explicit canonical root paths: `./skills/`, `./hooks.json`, `./.mcp.json`, `./.app.json`
- Keep Codex paths rooted in the plugin directory, never pointing outside the plugin root
- If `skills/` exists, declare it in the manifest
- If `hooks.json` exists, declare it via `hooks`
- If `.mcp.json` exists, declare it via `mcpServers`
- If `.app.json` exists, declare it via `apps`

## Skill Conventions

- Every skill directory must contain `SKILL.md`
- Keep frontmatter minimal and portable: `name` + `description`
- Treat `SKILL.md` as agent-facing instruction text, not marketing copy
- Put optional Codex-specific skill metadata in `agents/openai.yaml`
- Keep reference material in `references/` when the skill is knowledge-heavy

## Marketplace Experience

- The repo now validates the Codex marketplace shape in CI and locally
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
- Hook drift is a real maintenance problem; root `hooks.json` and `hooks/hooks.json` should be treated as a mirrored pair
- Keeping Codex-specific metadata optional prevents overfitting plugins to one client
- `assets/` should be treated as the default home for visual interface files when a plugin adds branded UI metadata

## Local Workflow

```bash
bash scripts/dev.sh --target codex
npm run validate:plugins
bash scripts/check-plugin-versions.sh
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
