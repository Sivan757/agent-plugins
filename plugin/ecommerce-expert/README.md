# E-commerce Platform Expert

E-commerce platform API knowledge base plugin for Claude Code — two independent skills, one plugin.

## Skills

### shein-api-expert

SHEIN Open Platform API — **173 endpoints** across **16 domains** with HMAC-SHA256 signing.

Triggers on: SHEIN API, SHEIN seller integration, `/open-api/*` paths, `open.sheincorp.com`

### temu-api-expert

Temu Partner Open API — **124 endpoints** across **11 domains** with request signing.

Triggers on: Temu API, Temu seller integration, `bg.order.*` / `bg.local.goods.*` API types

## Structure

Each skill has its own SKILL.md and references — they trigger independently with no cross-contamination.

```
plugin/ecommerce-expert/
├── skills/
│   ├── shein-api-expert/     # 173 endpoints, 16 reference files
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── evals/
│   └── temu-api-expert/      # 124 endpoints, 12 reference files
│       ├── SKILL.md
│       ├── references/
│       └── evals/
```

## Data sources

- SHEIN: [open.sheincorp.com](https://open.sheincorp.com) — scraped 2026-04-13
- Temu: [partner-us.temu.com](https://partner-us.temu.com) — scraped 2026-04-13
