# E-commerce Platform Expert

E-commerce platform API knowledge base — three independent skills, one plugin.

## Skills

### shein-api-expert

SHEIN Open Platform API — **173 endpoints** across **16 domains** with HMAC-SHA256 signing.

Triggers on: SHEIN API, SHEIN seller integration, `/open-api/*` paths, `open.sheincorp.com`

### temu-api-expert

Temu Partner Open API handbook — the **124 endpoints** most integrations call, with full
request/response parameter tables across 11 domain files, plus signing, auth flows, error codes
and rate limits.

Triggers on: Temu API, Temu seller integration, `bg.order.*` / `bg.local.goods.*` / `bg.logistics.*` API types

### temu-openapi

Temu Partner Platform offline mirror — **232 captured documents** (209 API + 23 developer guides)
with screenshots, plus gateway/signing rules, the POD listing API map, and the OpenCLI/Chrome
capture workflow for refreshing the mirror.

Triggers on: Temu 开放平台, Temu 接口联调, Temu field/dictionary lookups, or any Temu endpoint the handbook does not cover

## Boundary Between The Two Temu Skills

`temu-api-expert` is the compiled handbook — read it first, it answers most integration questions
without a search. `temu-openapi` is the raw capture — use it for an endpoint outside the handbook,
for authoritative field wording, or when the mirror needs refreshing. Both are installed together.

## Structure

Each skill has its own SKILL.md and references — they trigger independently with no cross-contamination.

```
plugins/ecommerce-expert/
├── skills/
│   ├── shein-api-expert/     # 173 endpoints, 16 reference files
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── evals/
│   ├── temu-api-expert/      # 124 endpoints, 12 reference files
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── evals/
│   └── temu-openapi/         # 232 captured docs, 30 screenshots
│       ├── SKILL.md
│       └── references/
│           ├── gateway-and-signing.md
│           ├── pod-listing-api-map.md
│           ├── developer-workflow.md
│           ├── opencli-doc-capture.md
│           └── temu-openapi/
│               ├── index.md
│               ├── manifest.json
│               ├── api/          # 209 docs
│               ├── developer/    # 23 docs
│               └── assets/
```

## Data sources

- SHEIN: [open.sheincorp.com](https://open.sheincorp.com) — scraped 2026-04-13
- Temu: [partner-us.temu.com](https://partner-us.temu.com) — scraped 2026-04-13
- Temu mirror: [agentpartner.temu.com](https://agentpartner.temu.com) — captured 2026-06-17
