---
name: new-media-ops
description: This skill should be used when the user asks to analyze, plan, write, rewrite, format, package, or stage Chinese new-media content for WeChat Official Account, WeChat image-text posts / Xiaolushu / 微信贴图, Xiaohongshu / 小红书, or draft-first social publishing workflows.
---

# 新媒体运营

Use this skill for article analysis, article writing, format adjustment, and draft-only staging for WeChat Official Account, WeChat image-text posts, and Xiaohongshu.

## Safety Boundary

This MVP is draft-first:

- Do create local content packages, WeChat drafts, and Xiaohongshu-ready draft assets.
- Do not click final publish, mass-send, or publicly post content.
- Do not bypass platform review, login protections, IP allowlists, or account confirmation.
- Do not print app secrets, cookies, browser state, or platform credentials.

If the user asks for final publishing, explain that this plugin only stages drafts and the user must confirm inside the platform.

## CLI Resolution

Resolve the installed plugin root before running commands:

```bash
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-${PLUGIN_ROOT:-}}}"
test -n "$PLUGIN_ROOT"
NMO_BIN="$PLUGIN_ROOT/dist/new-media-ops.mjs"
node "$NMO_BIN" --help
```

When working inside this repository before packaging, use:

```bash
npm run dev --workspace new-media-ops -- --help
```

## Workflow

1. Analyze first.
   - Read the source article, URL notes, Markdown, or pasted text.
   - Identify topic angle, audience, structure, hook, evidence gaps, risk points, and platform fit.
   - Do not draft immediately when the user only asked for analysis.

2. Draft with review stages.
   - Create or ask for a brief before long-form writing.
   - Produce `draft-v1.md`, then revise for structure, facts, platform fit, and human tone.
   - Keep user-provided style samples local; do not fetch private materials automatically.

3. Package content.
   - Use `draft-package` to create a stable package with `content-package.json`.
   - Use `format` for WeChat-compatible HTML.
   - Keep platform-specific copy in separate files so users can edit before staging.

4. Stage drafts only.
   - For WeChat article drafts, use `publish-draft` with `--dry-run` first, then API staging only when credentials and media IDs or local images are ready.
   - For WeChat image-text / Xiaolushu, enforce 1-9 images and map to `article_type: "newspic"`.
   - For Xiaohongshu, generate title, body, tags, and image-card assets; use available browser tools only to fill a draft, leaving final posting to the user.

## Common Commands

```bash
node "$NMO_BIN" setup
node "$NMO_BIN" preflight --format json
node "$NMO_BIN" analyze article.md --format markdown
node "$NMO_BIN" draft-package article.md --target wechat-article --out-dir ./new-media-ops
node "$NMO_BIN" format ./new-media-ops/article-slug --theme default --cite --format json
node "$NMO_BIN" publish-draft ./new-media-ops/article-slug --account default --cover-media-id <media_id> --dry-run --format json
```

## Platform Rules

Wechat article (`wechat-article`):

- Requires title, content HTML, and a cover `thumb_media_id`.
- Uses `article_type: "news"`.
- Markdown links should usually become bottom citations for WeChat-friendly output.

Wechat image-text (`wechat-newspic`):

- Means 微信贴图 / 小绿书 / 图文消息, not sticker packs.
- Requires 1-9 portrait image files in the package assets, even when publish uses existing media IDs.
- Local image files must be vertical: image height must be greater than image width.
- Keep body copy brief; the image cards should carry the main content, structure, and viewpoint.
- Uses `article_type: "newspic"`.

Xiaohongshu (`xiaohongshu`):

- Generate compact title,正文, hashtags, cover/card prompts or image paths.
- The CLI produces draft packages; browser-assisted filling is handled by the agent runtime when available.

## Quality Gate

Before staging, check:

- Source and target are explicit.
- Quality score is at least 70.
- Claims and current facts have source notes or a verification TODO.
- WeChat cover and image constraints are satisfied.
- Xiaohongshu title/body/tags fit the platform plan.

If the package fails the gate, revise or report the exact blockers instead of staging.
