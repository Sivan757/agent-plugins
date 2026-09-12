## What

<!-- Brief description of the change -->

## Plugin(s) affected

<!-- List plugin names, or "infrastructure" for repo-level changes -->

## Checklist

- [ ] Plugin metadata updated in `plugins/<name>/plugin.config.ts`
- [ ] `npm run generate:plugins` run after metadata changes
- [ ] Versions agree in `plugin.config.ts`, `package.json` and the CLI's `.version()`, if the plugin declares them
- [ ] SKILL.md frontmatter has required fields (`name` and `description`)
- [ ] README.md updated if behavior changed
- [ ] `npm run build` and `npm run validate:plugins` pass (or `bun test ./.github/scripts/tests` for validator changes)
- [ ] Tested with `bash scripts/dev.sh <plugin>` locally
