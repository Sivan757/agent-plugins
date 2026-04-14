# Recommended External Plugins

Curated plugins from [claude-plugins-official](https://github.com/anthropics/claude-plugins-official) and other sources that complement our internal tools.

To add any of these to our marketplace (so colleagues install via `@apex-plugins`), add a URL source entry to `.claude-plugin/marketplace.json`. See the README for the source format.

To install directly from their origin:

```
/plugin install <plugin-name>@claude-plugins-official
```

---

## Essential

| Plugin | Description | Install |
|--------|-------------|---------|
| superpowers | Brainstorming, TDD, systematic debugging, and development workflow skills | `/plugin install superpowers@claude-plugins-official` |
| context7 | Version-specific documentation lookup via Upstash — always get current docs | `/plugin install context7@claude-plugins-official` |
| plugin-dev | Comprehensive toolkit for creating and maintaining Claude Code plugins | `/plugin install plugin-dev@claude-plugins-official` |
| feature-dev | Architecture design agents and confidence-based code review | `/plugin install feature-dev@claude-plugins-official` |
| code-review | Automated PR review with confidence-based filtering | `/plugin install code-review@claude-plugins-official` |
| skill-creator | Create, improve, and benchmark skills with performance evals | `/plugin install skill-creator@claude-plugins-official` |

## Development Tools

| Plugin | Description | Install |
|--------|-------------|---------|
| playwright | Browser automation and end-to-end testing | `/plugin install playwright@claude-plugins-official` |
| frontend-design | Production-grade UI creation avoiding generic AI aesthetics | `/plugin install frontend-design@claude-plugins-official` |
| playground | Interactive HTML playgrounds with visual controls | `/plugin install playground@claude-plugins-official` |
| code-simplifier | Refines code for clarity while preserving functionality | `/plugin install code-simplifier@claude-plugins-official` |
| claude-code-setup | Analyze codebases and recommend tailored CLAUDE.md automations | `/plugin install claude-code-setup@claude-plugins-official` |
| claude-md-management | Maintain and improve CLAUDE.md project memory files | `/plugin install claude-md-management@claude-plugins-official` |

## Monitoring & Quality

| Plugin | Description | Install |
|--------|-------------|---------|
| sentry | Error monitoring with stack traces and production debugging | `/plugin install sentry@claude-plugins-official` |
| semgrep | Real-time vulnerability detection guiding secure coding | `/plugin install semgrep@claude-plugins-official` |
| session-report | HTML reports of token usage, cache efficiency, and costs | `/plugin install session-report@claude-plugins-official` |

## Collaboration & Productivity

| Plugin | Description | Install |
|--------|-------------|---------|
| slack | Message search and channel access for team communication | `/plugin install slack@claude-plugins-official` |
| linear | Issue tracking with project management and workspace search | `/plugin install linear@claude-plugins-official` |
| atlassian | Jira and Confluence issue management and documentation | `/plugin install atlassian@claude-plugins-official` |
| telegram | Messaging bridge with access control | `/plugin install telegram@claude-plugins-official` |

## E-commerce & Payments

| Plugin | Description | Install |
|--------|-------------|---------|
| stripe | Stripe payment development integration | `/plugin install stripe@claude-plugins-official` |

## Infrastructure & Deployment

| Plugin | Description | Install |
|--------|-------------|---------|
| deploy-on-aws | AWS architecture recommendations with IaC deployment | `/plugin install deploy-on-aws@claude-plugins-official` |
| terraform | Infrastructure as Code automation | `/plugin install terraform@claude-plugins-official` |
| cloudflare | Workers, Durable Objects, and web platform development | `/plugin install cloudflare@claude-plugins-official` |

## Language Servers

| Plugin | Description | Install |
|--------|-------------|---------|
| kotlin-lsp | Kotlin code intelligence — ideal for Spring Boot projects | `/plugin install kotlin-lsp@claude-plugins-official` |
| jdtls-lsp | Java language server for legacy codebases | `/plugin install jdtls-lsp@claude-plugins-official` |
| typescript-lsp | TypeScript/JavaScript enhanced intelligence | `/plugin install typescript-lsp@claude-plugins-official` |
| pyright-lsp | Python type checking and intelligence | `/plugin install pyright-lsp@claude-plugins-official` |

## Database

| Plugin | Description | Install |
|--------|-------------|---------|
| prisma | Postgres management with schema migrations | `/plugin install prisma@claude-plugins-official` |
| mongodb | MongoDB operations with query optimization | `/plugin install mongodb@claude-plugins-official` |

## Third-Party Plugins (in marketplace)

Plugins from independent repositories, referenced in our marketplace via URL source. Install the same way:

```
/plugin install <plugin-name>@apex-plugins
```

| Plugin | Origin | Description |
|--------|--------|-------------|
| understand-anything | [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) | Transform codebases into interactive knowledge graphs with multi-agent analysis and visualization |
| shopify-ai-toolkit | [Shopify/Shopify-AI-Toolkit](https://github.com/Shopify/Shopify-AI-Toolkit) | Shopify development toolkit — themes, apps, Storefront API, Hydrogen, checkout extensions |

---

## Not Recommended

Plugins we evaluated but don't recommend for our workflow:

| Plugin | Reason |
|--------|--------|
| hookify | We manage hooks directly in our plugins — avoids conflicts |
| commit-commands | We use our own git workflow conventions via company-knowledge |

---

> **Last updated:** 2026-04-14
> **Source:** [claude-plugins-official](https://github.com/anthropics/claude-plugins-official) (129 plugins as of this date)
