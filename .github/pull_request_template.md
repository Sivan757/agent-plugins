## What

<!-- Brief description of the change -->

## Plugin(s) affected

<!-- List plugin names, or "infrastructure" for repo-level changes -->

## Checklist

- [ ] Plugin metadata updated in `plugins/<name>/plugin.config.ts`
- [ ] `npm run generate:plugins` run after metadata changes
- [ ] `npm run validate:plugin-metadata` passes
- [ ] SKILL.md frontmatter has required fields (`description` or `when_to_use`)
- [ ] Generated marketplace entries are present in `.agents/plugins/marketplace.json` and `.claude-plugin/marketplace.json`
- [ ] README.md updated if behavior changed
- [ ] `npm run pack:plugins` and `npm run validate:plugin-packs` pass if installable artifacts changed
- [ ] Tested with `bash scripts/dev.sh --target codex <plugin>` or `bash scripts/dev.sh --target claude <plugin>` locally
