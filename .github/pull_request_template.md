## What

<!-- Brief description of the change -->

## Plugin(s) affected

<!-- List plugin names, or "infrastructure" for repo-level changes -->

## Checklist

- [ ] Version bumped via `bash scripts/bump-plugin-version.sh <plugin> <version>`
- [ ] `bash scripts/check-plugin-versions.sh` passes
- [ ] SKILL.md frontmatter has required fields (`description` or `when_to_use`)
- [ ] Plugin listed in both `.agents/plugins/marketplace.json` and `.claude-plugin/marketplace.json` (alphabetical order)
- [ ] README.md updated if behavior changed
- [ ] Tested with `bash scripts/dev.sh --target codex <plugin>` or `bash scripts/dev.sh --target claude <plugin>` locally
