# Fresh-Eyes Plugin Evaluation Report

Date: 2026-07-28
Method: 13 independent agents, each given ONLY a plugin path + a task + "report friction". No shared context, no knowledge of known bugs or architecture. Each acted as a fresh Claude reading the SKILL.md cold.

## Summary table

| Plugin | Task done | Friction | Key finding |
|---|---|---|---|
| mysql | ✅ | none | clean |
| aliyunlog | ✅ | none | clean |
| ticktick | ✅ | none | clean (real API: tasks list worked) |
| magick | ✅ | minor | no "solid-color canvas" example in references |
| ffmpeg | ✅ | minor | no synthetic-test-video recipe; cover recipe should add `-update 1` |
| consulting-advisor | ✅ | minor | model-index lists 4 decision models but no discriminator for picking one |
| postgresql | ✅ | minor | SKILL mandates "confirm connection before query" which conflicts with direct-query tasks; `linkle-prod` name is misleading (it's 127.0.0.1) |
| config-center | ⚠️ partial | **important** | dist shebang still `#!/usr/bin/env tsx` (missed in prior fix); `${CLAUDE_PLUGIN_ROOT}` path-resolution friction for a naive agent |
| prompt-forge | ✅ | **important** | category mapping wrong (SKILL says `Photography`, DB has `portrait`); `prompt_text` truncated with no `--full`; all ratings 0.0 (no differentiation) |
| temu-api | ✅ | **important** | SKILL path refs wrong root (`references/x.md` vs `skills/temu-api/references/x.md`); no worked signing example; optional-field signing ambiguity |
| temu-dev | ✅ | **critical (security)** | signing doc mirror line 49 has UNREDACTED real `app_secret`/`access_token`/`app_key` in a worked example |
| real-esrgan | ❌ partial | **important** | binary not installed + SKILL has ZERO install guidance (no Prerequisites section); naive user stuck at `command not found` |
| withoutbg | ❌ no | **important** | first run silently hangs ~15min on 450MB model download; SKILL doesn't disclose size/time or give manual-download URLs |

## Critical findings

### 1. temu-dev: real credentials leaked in offline doc mirror (SECURITY)
`plugins/temu-dev/skills/temu-dev/references/temu-openapi/developer/01-开发指南/01-896167235113-签名规则.md` line 49 contains a complete worked signing example with what appear to be REAL, unredacted credentials:
- `app_secret` = `<REDACTED_APP_SECRET>` (appears as prefix+suffix)
- `access_token` = `<REDACTED_ACCESS_TOKEN>`
- `app_key` = `<REDACTED_APP_KEY>`

The file has 5 `REDACTED` markers elsewhere, but this worked example was missed. The `access_token` is shop-scoped and (for self-developed apps) valid 365 days. This is committed in the repo. **Action: redact these three values** (replace with `<REDACTED_APP_SECRET>` etc.), same as the other markers. Also audit temu-api's mirror for the same doc.

## Important findings

### 2. config-center: dist shebang still `tsx` (inconsistent with prompt-forge)
- `plugins/config-center/dist/config-center.mjs` line 1 = `#!/usr/bin/env tsx`
- `src/config-center/src/config-center.ts` line 1 = `#!/usr/bin/env tsx`
- prompt-forge was already fixed to `#!/usr/bin/env node` in the prior trivial-fix bundle, but config-center was missed.
- Note: `node dist/config-center.mjs ...` still works (node ignores the shebang), so this is not a hard break - but direct execution (`./config-center.mjs`) fails, and it's inconsistent. The fresh agent misdiagnosed a path-resolution issue as a shebang issue, but the shebang inconsistency is real.
- **Action**: change `src/config-center/src/config-center.ts` shebang to `node`, rebuild dist.

### 3. prompt-forge: category mapping wrong + truncation + zero ratings
- **Category mismatch**: SKILL.md category-matching table maps "portrait, fashion, cinematic" -> `Photography`, but the DB category is `portrait` (lowercase). `pf prompt list --category "Photography"` returns 4/7018. `--category "portrait"` returns many. The SKILL misleads users.
- **Truncation**: `pf prompt search` shows 150 chars of `prompt_text`, `pf prompt show` truncates with `...`, no `--full`/`--no-truncate` flag. The RAG+Synthesize workflow the SKILL prescribes depends on reading FULL prompts.
- **All ratings 0.0**: every seeded prompt has rating 0.0. The SKILL's `ORDER BY rating DESC` and "avg rating" reporting yield no differentiation.
- **Action**: fix the category table (use actual DB categories); add `--full` flag to `show`; either pre-rate a subset or change the SKILL to not rely on rating for ordering.

### 4. temu-api: path references resolve to wrong root + no worked signing example
- SKILL.md says "Read `references/gateway-and-signing.md`" but from the plugin root the actual path is `skills/temu-api/references/gateway-and-signing.md`. A naive `Read` of the literal path fails. (This affects temu-dev too.)
- Signing algorithm described in prose only - no concrete canonical-string example, no expected MD5. The bare `keyvalue` concatenation (no `=`/`&` separator) is unusual and easy to get wrong.
- Optional fields (`data_type`, `version`) - unclear whether included in the signing string.
- **Action**: fix SKILL path refs to be plugin-root-relative or use `${SKILL_ROOT}`; add a worked signing example with a sample canonical string + expected MD5; state whether optional fields are signed.

### 5. real-esrgan: no binary-install guidance
- Binary `realesrgan-ncnn-vulkan` not installed; SKILL covers *using* it but not *obtaining* it. No Prerequisites/Installation section, no `brew`/release-URL, no `models/` placement guidance. A naive user hitting `command not found` is stuck.
- No bundled test image.
- **Action**: add a Prerequisites section with install steps (GitHub releases URL, models dir); add a `doctor`/`check` command; bundle or generate a test image.

### 6. withoutbg: silent hang on first-run model download
- First run downloads ~450MB ONNX model from Hugging Face. The CLI printed "Models loaded successfully" then **hung silently ~15min** (HF dropping the connection, retrying endlessly). `--verbose` didn't reveal the download failure until `HF_HUB_DISABLE_XET=1` was set.
- SKILL has a download-reliability section but doesn't disclose the ~450MB size, expected time, or give manual `wget`/`curl` fallback URLs.
- **Action**: disclose model size + first-run download in SKILL; make `--verbose` surface download errors; add manual-download commands with direct URLs; add a connection timeout/fail-fast.

## Minor findings

- **magick**: `references/common-commands.md` lacks a "create solid-color canvas" one-liner (e.g. `magick -size 200x200 xc:red`).
- **ffmpeg**: no recipe for generating synthetic test video (`testsrc`/`smptebars`); cover-generation recipe should include `-update 1` to suppress the image2 muxer warning.
- **consulting-advisor**: `references/model-index.md` "Make a decision" lists Decision Matrix / Expected Value / Reversibility / OODA with no discriminator for when to pick each. Add a one-line "use when..." per model.
- **postgresql**: SKILL mandates "confirm connection with user before querying" - conflicts with tasks that say "just run a read-only query". Consider a read-only exception. `linkle-prod` name is misleading (connects to 127.0.0.1).
- **temu-dev**: Chinese mirror docs lack English bridge summaries in `index.md`; cross-plugin dependency on `$temu-api` (can't verify alignment from within temu-dev).

## What worked well (no friction)
- **mysql**: `list` instant, clear, SKILL's connection-confirmation flow explicit.
- **aliyunlog**: `list-aliases` clear, self-explanatory, instant.
- **ticktick**: `tasks list` worked first try, auth transparent.
- **magick/ffmpeg**: core workflows clear; only missing niche recipes.
- **consulting-advisor**: consultation loop executed precisely per SKILL.

## Recommendations (prioritized)
1. **Redact the leaked Temu credentials** in the temu-dev signing doc (and audit temu-api mirror). Security.
2. **Fix config-center shebang** `tsx`->`node`, rebuild.
3. **Fix prompt-forge category mapping** (SKILL vs DB mismatch) - highest-impact usability bug for that plugin.
4. **Add prompt-forge `--full` flag** + address zero-ratings.
5. **Fix temu-api/temu-dev SKILL path references** (wrong root) + add a worked signing example.
6. **Add install guidance** to real-esrgan (and a `doctor` command); disclose model-download size + manual URLs in withoutbg.
7. Minor doc additions: magick canvas recipe, ffmpeg synthetic-test recipe + `-update 1`, consulting-advisor model discriminators, postgresql read-only exception.

## Note on the method
The fresh-eyes agents surfaced issues my own evaluation missed: the temu-dev credential leak, the prompt-forge category mismatch, the prompt_text truncation, the temu-api path-root error, and the missing install guidance for real-esrgan/withoutbg. This validates that independent agents reading SKILLs cold catch usability/security problems that a context-loaded reviewer rationalizes away.
