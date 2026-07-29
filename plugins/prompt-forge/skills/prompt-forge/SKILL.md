---
name: prompt-forge
description: "Image generation prompt engineering system with a local SQLite library of 25k+ prompts across 12 sources. Use when the user needs to search, classify, template, evaluate, or manage image generation prompts. Triggers on: prompt library, prompt template, prompt search, prompt rating, image generation prompt, 提示词, 生图提示词, prompt management, prompt classification, prompt evaluation. Should be used proactively whenever the user asks about prompt quality, prompt patterns, or prompt workflows."
---

# Prompt Forge

25,000+ prompts across 12 sources, 7 categories. The database is managed by the plugin; run `pf init` to create and seed it.

## How to write a prompt: the RAG + Synthesize method

When the user asks "write me a prompt for X", do NOT just pick one template or return raw search results. Follow this process:

### Step 1: Retrieve top-K relevant prompts (K=5~10)

Query the database for prompts in the matching category:

```sql
SELECT title, prompt_text, rating FROM prompts
WHERE category = '<matched category>'
AND (title LIKE '%<kw1>%' OR prompt_text LIKE '%<kw1>%'
  OR title LIKE '%<kw2>%' OR prompt_text LIKE '%<kw2>%')
ORDER BY rating DESC, length(prompt_text) DESC
LIMIT 10;
```

### Step 2: Analyze common patterns

Read all K prompts. Extract what they share:

- **Structure**: How are the sentences ordered? Subject first -> composition -> style -> constraints?
- **Key phrases**: What words appear in 7+ out of 10? (e.g., "professional", "studio lighting", "no watermarks")
- **Constraints**: What do they all forbid? (e.g., "no logo", "no text")
- **Parameters**: What aspect ratios and resolutions dominate?

### Step 3: Synthesize, don't template

This is the critical step. Do NOT just pick one prompt as a template and fill blanks. Instead:

1. **Take the best structure** from the highest-rated prompt as your skeleton
2. **Weave in distinctive elements** from 2-3 other top prompts that fit the user's specific context
3. **Replace generic descriptions** with the user's actual product/color/material
4. **Preserve the constraint patterns** that appear across multiple prompts (these are battle-tested)
5. **Select parameters** based on the consensus of the retrieved set

### Step 4: Show your work

Always explain WHY you wrote it this way:

```
Based on 10 prompts in Product & E-commerce (avg rating 4.2):

- 8/10 use "professional studio lighting" -> included
- 7/10 forbid "no watermarks, no logos, no props" -> included
- 6/10 specify "overhead perspective" -> included
- The top-rated prompt provided the overall structure
- Prompt #3's surface description ("light wood grain visible beneath") adapted for {user's surface}
```

## Category matching

Map the user's language to DB categories:

| User says | Category |
|-----------|----------|
| flat lay, 平铺, product photo, 商品图, e-commerce | `Product & E-commerce` |
| portrait, fashion, 人像, model, 模特, cinematic | `Photography` |
| poster, logo, brand, 海报, UI, typography | `Poster & Graphic Design` |
| anime, 3D, watercolor, 插画, pixel, 动漫 | `Illustration & Art` |
| video, 视频, animation | `Video Generation` |
| character, 角色, fantasy, 奇幻 | `Character & Concept` |

## Quick queries

```sql
-- Search by keyword across all categories
SELECT title, substr(prompt_text,1,150) FROM prompts
WHERE (title LIKE '%<kw>%' OR prompt_text LIKE '%<kw>%')
ORDER BY rating DESC LIMIT 10;

-- By model
SELECT title, prompt_text FROM prompts
WHERE json_extract(parameters, '$.model') = 'midjourney'
ORDER BY rating DESC LIMIT 10;

-- Browse a category
SELECT title, rating, substr(prompt_text,1,100) FROM prompts
WHERE category = 'Product & E-commerce' AND rating >= 3
ORDER BY rating DESC LIMIT 20;
```

## CLI quick reference

```bash
pf init                                    # Create + seed the database
pf prompt list --category "Product & E-commerce"
pf prompt search "<query>"
pf prompt show <id>
pf prompt add --title T --category C --text "..."
pf image link <prompt_id> <image_path>
pf image rate <prompt_id> <score>
pf source import <file.jsonl>
pf source dedup
pf serve --port 8765                        # Minimal stats server
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
