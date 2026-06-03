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
   - When a user corrects a draft or preview issue, treat it as process evidence: update the relevant skill, project SOP, workflow, template, or checker instead of storing project-specific standards in global memory.

2. Draft with review stages.
   - Create or ask for a brief before long-form writing.
   - Produce `draft-v1.md`, then revise for structure, facts, platform fit, and human tone.
   - For ordinary-reader AI education, explain technical terms with plain language and life metaphors; avoid empty hype phrases.
   - Split the same theme into separate channel assets when needed: long-form article for durable explanation, image-text post for light reading and viewpoint delivery.
   - For WeChat image-text / Xiaolushu body copy, stay concise but not empty: include the core judgment, one short metaphor or reason, and one reader action. Do not use "主要观点看图" or similar as the whole body.
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
   - Article body content must not repeat the platform title as an in-body H1. If the Markdown starts with the title, remove or skip that first H1 before staging.
   - Before the first major section, add light structure when needed, such as a short subheading, note, or setup block; avoid an unstructured wall of opening paragraphs.
   - Blockquotes should render as readable notes with background or border treatment, not oversized centered headlines unless the user explicitly asks for that style.

5. Stage drafts only.
   - For WeChat article drafts, use `publish-draft` with `--dry-run` first, then API staging only when credentials and media IDs or local images are ready.
   - For WeChat image-text / Xiaolushu, enforce 1-9 images and map to `article_type: "newspic"`.
   - For Xiaohongshu, generate title, body, tags, and image-card assets; use available browser tools only to fill a draft, leaving final posting to the user.
   - After staging a WeChat draft, require preview validation before handoff for scheduled send or mass-send confirmation.
   - After staging a WeChat draft, read it back when possible with platform APIs or opencli and verify article type, title, image counts, body image URLs, and known style risk checks.
   - Record the latest package path, uploaded image URLs, media IDs, readback result, preview URL, preview status, reviewer, issue notes, and whether this draft supersedes an older media ID.

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
- The article body must not contain a repeated in-body title or `<h1>` after WeChat's platform title.
- Intro paragraphs should not be silently promoted to large or bold lead text unless deliberately designed and verified in preview.
- Blockquotes, lists, code blocks, section headings, and image captions need explicit inline styles.
- Preview must show styled section headings, readable lists/code blocks, visible images, and a clean mobile background before publish handoff.

Wechat image-text (`wechat-newspic`):

- Means 微信贴图 / 小绿书 / 图文消息, not sticker packs.
- Requires 1-9 portrait image files in the package assets, even when publish uses existing media IDs.
- Image cards must be generated from `imagegen`; SVG or code-rendered cards are not acceptable as default production assets.
- Local image files must be vertical: image height must be greater than image width.
- Keep body copy brief but meaningful; it should state the viewpoint, why it matters, and what the reader should do next.
- Reject text-heavy image-text bodies; the post should read mainly through the cards.
- Also reject empty or perfunctory bodies such as "主要观点看图" when they do not explain the viewpoint.
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
- WeChat article HTML has no repeated in-body title or `<h1>`, no accidental oversized lead paragraph, and no unstyled blockquote.
- WeChat image-text body is concise but has a real viewpoint, not a placeholder instruction to look at the images.
- Staged WeChat drafts were read back when possible, and the latest media ID is recorded as superseding any older draft.
- WeChat preview has been checked after staging; if automation is blocked, require a user screenshot or explicit manual confirmation.
- OpenCLI browser profile is selected before backend automation when multiple profiles are connected.
- Xiaohongshu title/body/tags fit the platform plan.

If the package fails the gate, revise or report the exact blockers instead of staging.
