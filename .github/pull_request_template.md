## What

<!-- Brief description of the change -->

## Plugin(s) affected

<!-- List plugin names, or "infrastructure" for repo-level changes -->

## Checklist

- [ ] Plugin metadata updated in `plugins/<name>/plugin.config.ts`
- [ ] `npm run generate:plugins` run after metadata changes
- [ ] `npm run validate:plugin-metadata` passes
- [ ] SKILL.md frontmatter has required fields (`description` or `when_to_use`)
- [ ] Generated manifests and marketplace entries are up to date (`npm run generate:plugins`)
- [ ] README.md updated if behavior changed
- [ ] `npm run build` and `npm run validate:plugins` pass (or `bun test` for validator changes)
- [ ] Tested with `bash scripts/dev.sh <plugin>` locally
