---
name: temu-dev
description: "Use when Codex needs to inspect or operationalize Temu Partner developer documentation: navigating logged-in Temu docs, capturing docs with OpenCLI/Chrome, understanding self-developed app setup, auth, region partitioning, signing rules, API lists, goods publishing flow, data dictionaries, or turning Temu docs into implementation plans/skills."
---

# Temu Dev

## Use This Workflow

Use this skill to read Temu's developer docs and turn them into safe implementation guidance.

1. If the task needs current docs, use the already logged-in Chrome tab when available. Prefer OpenCLI browser extraction over scraping public HTML because Temu docs are SPA pages and some content is login-gated.
2. Read `references/opencli-doc-capture.md` before driving Chrome or capturing documentation.
3. Read `references/developer-workflow.md` before planning implementation, especially for self-developed apps, regions, auth, signing, and goods publishing.
4. Use the offline developer-doc mirror under `references/temu-openapi/` before opening the browser. Start with `references/temu-openapi/index.md`, then read only the specific Markdown file needed.
5. For API implementation details, switch to `$temu-api` and read its API map and offline API mirror.
6. Do not expose credentials or tokens. Do not execute live publish/update/price/inventory actions unless the user explicitly confirms the action, region, and shop.

## Offline Developer Docs

The local developer documentation mirror lives at `references/temu-openapi/` and contains 23 captured developer documents plus locally packaged screenshots.

Use it with targeted search:

```bash
rg -n "签名规则|鉴权信息|货品发布流程|自研应用|数据字典" references/temu-openapi/index.md references/temu-openapi/developer
```

Read the exact matched file instead of loading the whole mirror. The mirror was captured from logged-in Temu Partner docs and has redacted `app_key`, `access_token`, `app_secret`, `sign`, and temporary signed query strings. Use Chrome/OpenCLI only when the local mirror is missing the needed page or the user explicitly asks for the latest docs.

## Documentation Handling

When capturing Temu docs:

- Record source URL, doc id, capture date, and update time shown in the doc.
- Prefer updating the offline mirror under `references/temu-openapi/` instead of repeatedly browsing the same docs.
- Keep API method names and document links so another agent can reopen exact schemas.
- Treat region/gateway guidance as operationally important and re-check before production calls.
- Prefer small, focused reference files over one large dump.
