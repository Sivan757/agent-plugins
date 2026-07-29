---
name: prompt-forge
description: "Image generation prompt engineering system with a local SQLite library of 7,000+ prompts across 5 sources. Use when the user needs to search, classify, template, evaluate, or manage image generation prompts. Triggers on: prompt library, prompt template, prompt search, prompt rating, image generation prompt, 提示词, 生图提示词, prompt management, prompt classification, prompt evaluation. Should be used proactively whenever the user asks about prompt quality, prompt patterns, or prompt workflows."
---

# Prompt Forge

7,000+ image-generation prompts across 5 sources. The database is managed by the plugin; run `pf init` to create and seed it.

## Command path setup

`pf` is not on PATH. Resolve the bundled CLI via the plugin root and invoke with `node`:

```bash
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-${PLUGIN_ROOT:-}}}"
test -n "$PLUGIN_ROOT"
PF_BIN="$PLUGIN_ROOT/dist/prompt-forge.mjs"
node "$PF_BIN" init
```

If no root variable is set, locate the installed plugin cache or repo-local `plugins/prompt-forge/` before running.

## How to write a prompt: the RAG + Synthesize method

When the user asks "write me a prompt for X", do NOT just pick one template or return raw search results. Follow this process:

### Step 1: Retrieve top-K relevant prompts (K=5~10)

Search the database by keyword. The search uses FTS5 with a LIKE fallback (so Chinese and English both work):

```bash
node "$PF_BIN" prompt search "<keyword>"
```

Optionally narrow by an actual DB category (see the table below):

```bash
node "$PF_BIN" prompt list --category "<category>" --limit 10
```

Note: prompts are seeded without ratings (all 0.0), so do NOT order by rating. `search` orders by FTS relevance; `list` returns in insertion order. Rate prompts with `pf image rate` to build a quality signal over time.

### Step 2: Analyze common patterns

Read the full text of each retrieved prompt with `--full` (the default `show` truncates long fields):

```bash
node "$PF_BIN" prompt show <id> --full
```

Extract what they share:

- **Structure**: How are the sentences ordered? Subject first -> composition -> style -> constraints?
- **Key phrases**: What words appear in 7+ out of 10? (e.g., "professional", "studio lighting", "no watermarks")
- **Constraints**: What do they all forbid? (e.g., "no logo", "no text")
- **Parameters**: What aspect ratios and resolutions dominate?

### Step 3: Synthesize, don't template

This is the critical step. Do NOT just pick one prompt as a template and fill blanks. Instead:

1. **Take the best structure** from the most relevant prompt as your skeleton
2. **Weave in distinctive elements** from 2-3 other top prompts that fit the user's specific context
3. **Replace generic descriptions** with the user's actual product/color/material
4. **Preserve the constraint patterns** that appear across multiple prompts (these are battle-tested)
5. **Select parameters** based on the consensus of the retrieved set

### Step 4: Show your work

Always explain WHY you wrote it this way:

```
Based on 8 prompts matching "portrait studio" (retrieved via FTS search):

- 7/8 use "professional studio lighting" -> included
- 6/8 forbid "no watermarks, no logos, no props" -> included
- 5/8 specify "overhead perspective" -> included
- The top-ranked result provided the overall structure
- Prompt #3's surface description ("light wood grain visible beneath") adapted for {user's surface}
```

## Category matching

The database uses lowercase category slugs (not display names). ~87% of prompts are `unclassified`, so **prefer `pf prompt search` over category filtering** for most queries. When filtering by category, use these actual slugs:

| User says | DB category slug |
|-----------|------------------|
| flat lay, 平铺, product photo, 商品图, e-commerce, ad | `ecommerce`, `ad-creative` |
| portrait, fashion, 人像, model, 模特, cinematic | `portrait`, `Fashion Editorial`, `Cinematic Film References` |
| poster, logo, brand, 海报, typography | `poster`, `Typography & Posters`, `Brand Systems & Identity` |
| UI, 界面, mockup | `ui`, `UI/UX Mockups` |
| anime, 3D, watercolor, 插画, pixel, 动漫 | `Anime & Manga`, `Watercolor`, `Pixel Art`, `More Illustration Styles` |
| character, 角色, fantasy, 奇幻 | `character`, `Character Design` |

To see all categories with counts: `node "$PF_BIN" prompt list --limit 0` (or query the DB directly with `sqlite3` if installed).

## CLI quick reference

```bash
node "$PF_BIN" init                          # Create + seed the database
node "$PF_BIN" prompt search "<query>"       # FTS5 search (CJK + English)
node "$PF_BIN" prompt list --category "<slug>" --limit 10
node "$PF_BIN" prompt show <id> --full       # Full text (no truncation)
node "$PF_BIN" prompt add --title T --category C --text "..."
node "$PF_BIN" image link <prompt_id> <image_path>
node "$PF_BIN" image rate <prompt_id> <score>   # 1-5; builds rating signal
node "$PF_BIN" source import <file.jsonl>
node "$PF_BIN" source dedup
node "$PF_BIN" serve --port 8765             # Minimal stats server (127.0.0.1)
```

The database location is resolved by the plugin at runtime; run `pf init` to create and seed it.

## When to read reference files

| File | When |
|------|------|
| `references/templates.md` | User wants a pre-built template with variable slots |
| `references/patterns.md` | User asks "what makes a good prompt" - shows extracted common structures |
| `references/categories.md` | User wants to understand the full taxonomy |
| `references/workflows.md` | User needs the end-to-end process (ingest->generate->rate) |
| `references/personas/curator.md` | Curator agent persona (scrape + classify + dedup) |
| `references/personas/evaluator.md` | Evaluator agent persona (rate + link images) |
| `references/personas/synthesizer.md` | Synthesizer agent persona (extract patterns + templates) |
