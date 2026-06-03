---
name: new-media-ops
description: This skill should be used when the user asks to analyze, plan, write, rewrite, format, package, or stage Chinese new-media content for WeChat Official Account, WeChat image-text posts / Xiaolushu / 微信贴图, Xiaohongshu / 小红书, or draft-first social publishing workflows.
---

# 新媒体运营

Use this skill for article analysis, topic planning, article writing, format adjustment, visual packaging, preview validation, and draft-only staging for WeChat Official Account, WeChat image-text posts, and Xiaohongshu.

## Safety Boundary

This MVP is draft-first:

- Do create local content packages, WeChat drafts, and Xiaohongshu-ready draft assets.
- Do not click final publish, mass-send, or publicly post content.
- Do not bypass platform review, login protections, IP allowlists, or account confirmation.
- Do not print app secrets, cookies, browser state, or platform credentials.
- Do not treat a staged draft as ready to publish until a platform preview has been checked.

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
   - For planned original content, create a topic card first: reader scenario, core problem, one-sentence reader gain, concept, plain-language metaphor, visual idea, fact risks, and target channels.
   - Prefer topics that score well for ordinary-reader relevance, metaphor strength, visual explainability, reuse potential, and risk control.
   - Do not draft immediately when the user only asked for analysis.

2. Draft with review stages.
   - Create or ask for a brief before long-form writing.
   - Produce `draft-v1.md`, then revise for structure, facts, platform fit, and human tone.
   - For ordinary-reader AI education, explain technical terms with plain language and life metaphors; avoid empty hype phrases.
   - Split the same theme into separate channel assets when needed: long-form article for durable explanation, image-text post for light reading and viewpoint delivery.
   - Keep user-provided style samples local; do not fetch private materials automatically.

3. Prepare visuals and assets.
   - For WeChat image-text / Xiaolushu, the image cards carry the main content and viewpoint; body copy stays short.
   - When creating platform-bound teaching illustrations, WeChat article images, or image-text cards, use the `imagegen` skill and built-in `image_gen` tool as the image source.
   - Do not substitute SVG, HTML, canvas, Mermaid, or other code-native/vector drawing workflows for platform-bound images unless the user explicitly asks for that exception.
   - Enforce portrait assets before packaging: height must be greater than width, ideally 9:16.
   - Do not use local image paths in platform content.
   - When the user requires PicGo, upload platform images through the local PicGo endpoint such as `http://127.0.0.1:36677/upload` and record the returned remote URLs.
   - For WeChat article inline images, prefer WeChat `media/uploadimg` URLs after upload; raw OSS links may disappear in preview.

4. Package content.
   - Use `draft-package` to create a stable package with `content-package.json`.
   - Use `format` for WeChat-compatible HTML.
   - Keep platform-specific copy in separate files so users can edit before staging.
   - For WeChat Official Account articles, do not rely on local Markdown preview alone; WeChat may strip or alter styles.
   - Avoid full-page tinted backgrounds unless the WeChat preview has confirmed they render cleanly.
   - Render section headings, images, lists, and code blocks with inline WeChat-compatible styles.

5. Stage drafts only.
   - For WeChat article drafts, use `publish-draft` with `--dry-run` first, then API staging only when credentials and media IDs or local images are ready.
   - For WeChat image-text / Xiaolushu, enforce 1-9 images and map to `article_type: "newspic"`.
   - For Xiaohongshu, generate title, body, tags, and image-card assets; use available browser tools only to fill a draft, leaving final posting to the user.
   - After staging a WeChat draft, require preview validation before handoff for scheduled send or mass-send confirmation.
   - Record package path, uploaded image URLs, media IDs, preview URL, preview status, reviewer, and issue notes.

6. Use OpenCLI only as a backend assistant.
   - Run `opencli doctor` before browser-dependent WeChat backend operations.
   - If multiple Chrome Bridge profiles are connected, select one with `opencli profile use <name>` or pass an explicit profile before using WeChat commands.
   - Useful commands include `opencli weixin drafts`, `opencli weixin create-draft`, and `opencli weixin download`.
   - Stop and ask for manual help when login, QR code, captcha, security confirmation, or final publish confirmation appears.

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
- Article body images must not be local paths; use remote image URLs, and prefer WeChat `media/uploadimg` URLs for inline body images.
- Preview must show styled section headings, readable lists/code blocks, visible images, and a clean mobile background before publish handoff.

Wechat image-text (`wechat-newspic`):

- Means 微信贴图 / 小绿书 / 图文消息, not sticker packs.
- Requires 1-9 portrait image files in the package assets, even when publish uses existing media IDs.
- Image cards must be generated from `imagegen`; SVG or code-rendered cards are not acceptable as default production assets.
- Local image files must be vertical: image height must be greater than image width.
- Keep body copy brief; the image cards should carry the main content, structure, and viewpoint.
- Reject text-heavy image-text bodies; the post should read mainly through the cards.
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
- Platform-bound visuals were produced from `imagegen`, with no SVG/code-rendered substitute unless explicitly requested.
- No platform content references local image paths.
- WeChat article inline images use stable remote URLs, preferably WeChat-uploaded image URLs.
- WeChat preview has been checked after staging; if automation is blocked, require a user screenshot or explicit manual confirmation.
- OpenCLI browser profile is selected before backend automation when multiple profiles are connected.
- Xiaohongshu title/body/tags fit the platform plan.

If the package fails the gate, revise or report the exact blockers instead of staging.
