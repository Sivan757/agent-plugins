---
name: product
description: "产品与需求域的技能入口。覆盖56个主题：analyze-feature-requests、ansoff-matrix、beachhead-segment、brainstorm-experiments-existing、brainstorm-experiments-new、brainstorm-ideas-existing、brainstorm-ideas-new、brainstorm-okrs、brainstorming、breakdown-epic-pm 等。当任务落在产品与需求范围内时先读本文件，再按下方路由表只读需要的那一篇——不要一次读完整个 references。适用场景：把模糊的业务诉求变成可验证的需求与验收标准。"
---

# 产品与需求（`product`）

**这个技能什么时候适用**：把模糊的业务诉求变成可验证的需求与验收标准。任务不属于本域时，先看文末的「跨域去哪看」。

## 怎么用这个技能（重要）

这是一个**入口**，不是手册。`references/` 下有 56 篇主题文档，**不要整目录读**。正确做法：

1. 按下面路由表的「什么时候读」列，挑出与本任务真正相关的那 1–3 篇；
2. 用 `Read` 读 `${CLAUDE_PLUGIN_ROOT}/skills/product/references/<主题>/guide.md`；
3. 那篇文档如果自带 `references/`、`assets/`、`scripts/`，按需再读；
4. 路由表没覆盖的问题，用 `Glob` 在 `references/` 里按关键词找。

## 路由表

| 主题 | 什么时候读它 |
| --- | --- |
| `analyze-feature-requests` | Analyze and prioritize a list of feature requests by theme, strategic alignment, impact, effort, and risk. |
| `ansoff-matrix` | Generate an Ansoff Matrix analysis mapping growth strategies across market penetration, market development, product dev… |
| `beachhead-segment` | Identify the first beachhead market segment for a product launch. |
| `brainstorm-experiments-existing` | Design experiments to test assumptions for an existing product — prototypes, A/B tests, spikes, and other low-effort va… |
| `brainstorm-experiments-new` | Design lean startup experiments (pretotypes) for a new product. |
| `brainstorm-ideas-existing` | Brainstorm product ideas for an existing product using multi-perspective ideation from PM, Designer, and Engineer viewp… |
| `brainstorm-ideas-new` | Brainstorm feature ideas for a new product in initial discovery from PM, Designer, and Engineer perspectives. |
| `brainstorm-okrs` | Brainstorm team-level OKRs aligned with company objectives — qualitative objectives with measurable key results. |
| `brainstorming` | You MUST use this before any creative work - creating features, building components, adding functionality, or modifying… |
| `breakdown-epic-pm` | Prompt for creating an Epic Product Requirements Document (PRD) for a new epic. |
| `breakdown-feature-prd` | Prompt for creating Product Requirements Documents (PRDs) for new features, based on an Epic. |
| `business-model` | Generate a Business Model Canvas with all 9 building blocks. |
| `capability` | Translate PRD intent, roadmap asks, or product discussions into an implementation-ready capability plan that exposes co… |
| `competitive-battlecard` | Create sales-ready competitive battlecards comparing your product against a specific competitor — positioning, feature … |
| `competitive-landscape` | Analyze competition, identify differentiation opportunities, and develop winning market positioning strategies using Po… |
| `competitive-platform-analysis` | >- |
| `competitive-report-structure` | >- |
| `competitor-analysis` | Analyze competitors with strengths, weaknesses, and differentiation opportunities. |
| `create-github-issue-feature-from-specification` | Create GitHub Issue for feature request from specification file using feature_request.yml template. |
| `create-github-issues-for-unmet-specification-requirements` | Create GitHub Issues for unimplemented requirements from specification files using feature_request.yml template. |
| `create-prd` | Create a Product Requirements Document using a comprehensive 8-section template covering problem, objectives, segments,… |
| `create-specification` | Create a new specification file for the solution, optimized for Generative AI consumption. |
| `create-technical-spike` | Create time-boxed technical spike documents for researching and resolving critical development decisions before impleme… |
| `customer-journey-map` | Create an end-to-end customer journey map with stages, touchpoints, emotions, pain points, and opportunities. |
| `deep-research` | Multi-source deep research using firecrawl and exa MCPs. |
| `idea-refine` | Refines raw ideas into sharp, actionable concepts through structured divergent and convergent thinking. |
| `ideal-customer-profile` | Identify the Ideal Customer Profile (ICP) from research data with demographics, behaviors, JTBD, and needs. |
| `identify-assumptions-existing` | Identify risky assumptions for a feature idea in an existing product across Value, Usability, Viability, and Feasibilit… |
| `identify-assumptions-new` | Identify risky assumptions for a new product idea across 8 risk categories including Go-to-Market, Strategy, and Team. |
| `interview-me` | Extracts what the user actually wants instead of what they think they should want. |
| `job-stories` | Create job stories using the 'When [situation], I want to [motivation], so I can [outcome]' format with detailed accept… |
| `lean-canvas` | Generate a Lean Canvas with problem, solution, metrics, cost structure, UVP, unfair advantage, channels, segments, and … |
| `lens` | Use this skill to validate the "why" before building, run product diagnostics, and pressure-test product direction befo… |
| `market-research` | Conduct market research, competitive analysis, investor due diligence, and industry intelligence with source attributio… |
| `market-segments` | Identify 3-5 potential customer segments with demographics, JTBD, and product fit analysis. |
| `market-sizing` | Estimate market size using TAM, SAM, and SOM with top-down and bottom-up approaches. |
| `market-sizing-analysis` | Calculate TAM/SAM/SOM for market opportunities using top-down, bottom-up, and value theory methodologies. |
| `opportunity-solution-tree` | Build an Opportunity Solution Tree (OST) to structure product discovery — map a desired outcome to opportunities, solut… |
| `pestle-analysis` | Perform a PESTLE analysis covering Political, Economic, Social, Technological, Legal, and Environmental factors. |
| `porters-five-forces` | Perform Porter's Five Forces analysis — competitive rivalry, supplier power, buyer power, threat of substitutes, and th… |
| `prd` | Generate high-quality Product Requirements Documents (PRDs) for software systems and AI-powered features. |
| `prioritize-assumptions` | Prioritize assumptions using an Impact × Risk matrix and suggest experiments for each. |
| `prioritize-features` | Prioritize a backlog of feature ideas based on impact, effort, risk, and strategic alignment with top 5 recommendations. |
| `research-ops` | Evidence-first current-state research workflow for ECC. |
| `spec-driven-development` | Creates specs before coding. |
| `startup-canvas` | Generate a Startup Canvas combining Product Strategy (9 sections) and Business Model (costs + revenue) for a new produc… |
| `strategy` | Create a comprehensive product strategy using the 9-section Product Strategy Canvas — vision, segments, costs, value pr… |
| `strategy-red-team` | Red-team a PRD, roadmap, or strategy by attacking its load-bearing assumptions before reality does. |
| `summarize-interview` | Summarize a customer interview transcript into a structured template with JTBD, satisfaction signals, and action items. |
| `swot-analysis` | Perform a detailed SWOT analysis — strengths, weaknesses, opportunities, and threats with actionable recommendations. |
| `update-specification` | Update an existing specification file for the solution, optimized for Generative AI consumption based on new requiremen… |
| `user-personas` | Create refined user personas from research data — 3 personas with JTBD, pains, gains, and unexpected insights. |
| `user-segmentation` | Segment users from feedback data based on behavior, JTBD, and needs. |
| `user-stories` | Create user stories following the 3 C's (Card, Conversation, Confirmation) and INVEST criteria with descriptions, desig… |
| `value-proposition` | Design a detailed value proposition using a 6-part JTBD template — Who, Why, What before, How, What after, Alternatives. |
| `vision` | Brainstorm an inspiring, achievable, and emotional product vision that motivates teams and aligns stakeholders. |

## 本域的硬要求

- 每条验收标准都能被第三方独立验证；出现「体验良好」「响应快」这类词就是没写完
- 显式写出非目标（out of scope）与已知取舍
- 成功指标必须可量化，并说明怎么取数

## 交付物形态

- PRD
- 用户故事 + 验收标准
- 需求拆解清单
- 竞品/市场分析
- 路线图与优先级排序
