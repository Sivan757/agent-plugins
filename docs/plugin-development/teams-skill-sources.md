# teams 技能：来源与信用记录

生成于 2026-09-13（重构后）。**结构**：9 个域技能（`skills/<domain>/SKILL.md`，路由型）
+ 9 个域 agent（`agents/<domain>.md`）；下方 273 条主题文档位于 `skills/<domain>/references/<topic>/guide.md`，
仅在域技能触发后按需读取。机器可读版在 `plugins/teams/provenance/sources.json`。

## 关于「信用分」能提供什么、不能提供什么

- **能提供**：每条主题文档所属仓库的 **GitHub star 数**（抓取当时实测）、**fork 数**（仅自建条目补测）、**许可证**、以及它被固定在**哪个 40 位 commit** 上。
- **不能提供**：**下载量**。这些来源是 GitHub 仓库而不是分发包，不存在 npm/PyPI 那样的下载计数；本轮也没有采集 issue/PR 活跃度或贡献者数。**所有「使用人数多、下载量多」的判断，在本轮实际都只由 star 数支撑。**
- star 是**取证当时的快照**，会随时间变化；`sources.json` 里每条都记了 `checked_at`。

## 采纳来源总览（11 个仓库，按 star 降序）

| 来源仓库 | ★ | License | 版权人 | 固定 commit | 采纳条数 |
| --- | --: | --- | --- | --- | --: |
| `obra/superpowers` | 285,700 | MIT | Jesse Vincent | `b36e0829c6d0140e93cfef2ca599b1b07d4a7797` | 3 |
| `affaan-m/ECC` | 256,921 | MIT | Affaan Mustafa | `8321021c54d670126ce3b2969d5deb880b4b0c2a` | 58 |
| `addyosmani/agent-skills` | 93,699 | MIT | Addy Osmani | `be4e44a9fbc5e8df0beaefadbb28bd22ee61cc39` | 10 |
| `wshobson/agents` | 39,588 | MIT | Seth Hobson | `a30778f8c4e6b0a87567941b7cca4f534bf642b6` | 53 |
| `github/awesome-copilot` | 38,931 | MIT | GitHub, Inc. | `7568a482ce2df38f8965ab5336a3220db796a4ba` | 53 |
| `phuryn/pm-skills` | 26,255 | MIT | Pawel Huryn | `18468a95b427e70e258b51389796367c6f684e7d` | 41 |
| `microsoft/playwright-cli` | 13,260 | Apache-2.0 | Microsoft Corporation | `655530f6d0dc71a0d6bf46ae165877d3c7311099` | 1 |
| `antfu/skills` | 5,877 | MIT | Anthony Fu | `a74f281a27dadc02397bc1a174b0f2c97531b6ae` | 12 |
| `currents-dev/playwright-best-practices-skill` | 375 | MIT | Currents Software Inc. | `283d5cbc5d11aac1abda058b16ad22c317d54dc0` | 1 |
| `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | Giuseppe Trisciuoglio | `fe73fb33a09ee6562eeec7415a3f9a3bcf795177` | 32 |
| `sivaprasadreddy/sivalabs-agent-skills` | 181 | MIT | K Siva Prasad Reddy | `031ea5ce90b5617ef8b3257c3d0739e6b613aaeb` | 4 |

### star 分布

- **10万+**：61 条
- **3万–10万**：116 条
- **1万–3万**：42 条
- **1千–1万**：12 条
- **1千以下**：42 条

> 注意：有相当一块采纳内容来自 **1 千 star 以下**的仓库（`developer-kit` 345★、`sivalabs` 181★、`currents-dev` 375★）。这是「star 不是硬门槛」这个决定的直接结果。

---

## 一、自建文档（5 条，`provenance: framework-derived`）

这五条**没有上游技能来源**——是从官方文档与官方源码写出来的标准 SOP。「来源」填的是**被描述的框架本体**，「信用分」是**该框架官方仓库的 star**，不是某个技能的流行度。

| 文档（现位置） | 描述的 | 官方仓库 | ★ | Fork | License） |
| --- | --- | --- | --: | --: | --- |
| `skills/backend/references/dubbo/guide.md` | 框架本体 | `apache/dubbo` | 41,565 | 26,371 | Apache-2.0 |
| `skills/backend/references/nacos/guide.md` | 框架本体 | `alibaba/nacos` | 33,364 | 13,291 | Apache-2.0 |
| `skills/backend/references/ruoyi-cloud-plus/guide.md` | 框架本体 | `dromara/RuoYi-Cloud-Plus` | 1,300 | 402 | MIT |
| `skills/backend/references/sa-token/guide.md` | 框架本体 | `dromara/Sa-Token` | 19,040 | 2,910 | Apache-2.0 |
| `skills/data/references/liquibase/guide.md` | 工具本体 | `liquibase/liquibase` | 5,610 | 1,969 | NOASSERTION (FSL-1.1-ALv2) |

每条 `verified_against` 的完整证据（官方文档 URL + 官方仓库 commit）见 `sources.json`。

---

## 二、采纳文档（268 条，`provenance: upstream-port`）

### `product`（56 条｜来源 ★ 中位 26,255｜最高 285,700｜最低 26,255）

| 主题（现位置） | 来源仓库 | ★ | License | 上游路径 |
| --- | --- | --: | --- | --- |
| `skills/product/references/brainstorming/guide.md` | `obra/superpowers` | 285,700 | MIT | `skills/brainstorming` |
| `skills/product/references/capability/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/product-capability` |
| `skills/product/references/competitive-platform-analysis/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/competitive-platform-analysis` |
| `skills/product/references/competitive-report-structure/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/competitive-report-structure` |
| `skills/product/references/deep-research/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/deep-research` |
| `skills/product/references/lens/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/product-lens` |
| `skills/product/references/market-research/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/market-research` |
| `skills/product/references/research-ops/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/research-ops` |
| `skills/product/references/idea-refine/guide.md` | `addyosmani/agent-skills` | 93,699 | MIT | `skills/idea-refine` |
| `skills/product/references/interview-me/guide.md` | `addyosmani/agent-skills` | 93,699 | MIT | `skills/interview-me` |
| `skills/product/references/spec-driven-development/guide.md` | `addyosmani/agent-skills` | 93,699 | MIT | `skills/spec-driven-development` |
| `skills/product/references/competitive-landscape/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/startup-business-analyst/skills/competitive-landscape` |
| `skills/product/references/market-sizing-analysis/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/startup-business-analyst/skills/market-sizing-analysis` |
| `skills/product/references/breakdown-epic-pm/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/breakdown-epic-pm` |
| `skills/product/references/breakdown-feature-prd/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/breakdown-feature-prd` |
| `skills/product/references/create-github-issue-feature-from-specification/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/create-github-issue-feature-from-specification` |
| `skills/product/references/create-github-issues-for-unmet-specification-requirements/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/create-github-issues-for-unmet-specification-requirements` |
| `skills/product/references/create-specification/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/create-specification` |
| `skills/product/references/create-technical-spike/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/create-technical-spike` |
| `skills/product/references/prd/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/prd` |
| `skills/product/references/update-specification/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/update-specification` |
| `skills/product/references/analyze-feature-requests/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-discovery/skills/analyze-feature-requests` |
| `skills/product/references/ansoff-matrix/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-strategy/skills/ansoff-matrix` |
| `skills/product/references/beachhead-segment/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-go-to-market/skills/beachhead-segment` |
| `skills/product/references/brainstorm-experiments-existing/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-discovery/skills/brainstorm-experiments-existing` |
| `skills/product/references/brainstorm-experiments-new/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-discovery/skills/brainstorm-experiments-new` |
| `skills/product/references/brainstorm-ideas-existing/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-discovery/skills/brainstorm-ideas-existing` |
| `skills/product/references/brainstorm-ideas-new/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-discovery/skills/brainstorm-ideas-new` |
| `skills/product/references/brainstorm-okrs/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-execution/skills/brainstorm-okrs` |
| `skills/product/references/business-model/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-strategy/skills/business-model` |
| `skills/product/references/competitive-battlecard/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-go-to-market/skills/competitive-battlecard` |
| `skills/product/references/competitor-analysis/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-market-research/skills/competitor-analysis` |
| `skills/product/references/create-prd/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-execution/skills/create-prd` |
| `skills/product/references/customer-journey-map/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-market-research/skills/customer-journey-map` |
| `skills/product/references/ideal-customer-profile/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-go-to-market/skills/ideal-customer-profile` |
| `skills/product/references/identify-assumptions-existing/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-discovery/skills/identify-assumptions-existing` |
| `skills/product/references/identify-assumptions-new/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-discovery/skills/identify-assumptions-new` |
| `skills/product/references/job-stories/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-execution/skills/job-stories` |
| `skills/product/references/lean-canvas/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-strategy/skills/lean-canvas` |
| `skills/product/references/market-segments/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-market-research/skills/market-segments` |
| `skills/product/references/market-sizing/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-market-research/skills/market-sizing` |
| `skills/product/references/opportunity-solution-tree/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-discovery/skills/opportunity-solution-tree` |
| `skills/product/references/pestle-analysis/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-strategy/skills/pestle-analysis` |
| `skills/product/references/porters-five-forces/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-strategy/skills/porters-five-forces` |
| `skills/product/references/prioritize-assumptions/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-discovery/skills/prioritize-assumptions` |
| `skills/product/references/prioritize-features/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-discovery/skills/prioritize-features` |
| `skills/product/references/startup-canvas/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-strategy/skills/startup-canvas` |
| `skills/product/references/strategy/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-strategy/skills/product-strategy` |
| `skills/product/references/strategy-red-team/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-execution/skills/strategy-red-team` |
| `skills/product/references/summarize-interview/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-discovery/skills/summarize-interview` |
| `skills/product/references/swot-analysis/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-strategy/skills/swot-analysis` |
| `skills/product/references/user-personas/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-market-research/skills/user-personas` |
| `skills/product/references/user-segmentation/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-market-research/skills/user-segmentation` |
| `skills/product/references/user-stories/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-execution/skills/user-stories` |
| `skills/product/references/value-proposition/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-strategy/skills/value-proposition` |
| `skills/product/references/vision/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-strategy/skills/product-vision` |

### `backend`（50 条｜来源 ★ 中位 39,588｜最高 256,921｜最低 181）

| 主题（现位置） | 来源仓库 | ★ | License | 上游路径 |
| --- | --- | --: | --- | --- |
| `skills/backend/references/content-hash-cache-pattern/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/content-hash-cache-pattern` |
| `skills/backend/references/error-handling/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/error-handling` |
| `skills/backend/references/hexagonal-architecture/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/hexagonal-architecture` |
| `skills/backend/references/java-coding-standards/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/java-coding-standards` |
| `skills/backend/references/jpa-patterns/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/jpa-patterns` |
| `skills/backend/references/latency-critical-systems/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/latency-critical-systems` |
| `skills/backend/references/patterns/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/backend-patterns` |
| `skills/backend/references/redis-patterns/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/redis-patterns` |
| `skills/backend/references/security-review/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/security-review` |
| `skills/backend/references/security-scan/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/security-scan` |
| `skills/backend/references/springboot-patterns/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/springboot-patterns` |
| `skills/backend/references/springboot-security/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/springboot-security` |
| `skills/backend/references/security-and-hardening/guide.md` | `addyosmani/agent-skills` | 93,699 | MIT | `skills/security-and-hardening` |
| `skills/backend/references/api-design-principles/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/backend-development/skills/api-design-principles` |
| `skills/backend/references/architecture-patterns/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/backend-development/skills/architecture-patterns` |
| `skills/backend/references/attack-tree-construction/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/security-scanning/skills/attack-tree-construction` |
| `skills/backend/references/auth-implementation-patterns/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/developer-essentials/skills/auth-implementation-patterns` |
| `skills/backend/references/cqrs-implementation/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/backend-development/skills/cqrs-implementation` |
| `skills/backend/references/error-handling-patterns/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/developer-essentials/skills/error-handling-patterns` |
| `skills/backend/references/event-store-design/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/backend-development/skills/event-store-design` |
| `skills/backend/references/microservices-patterns/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/backend-development/skills/microservices-patterns` |
| `skills/backend/references/projection-patterns/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/backend-development/skills/projection-patterns` |
| `skills/backend/references/saga-orchestration/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/backend-development/skills/saga-orchestration` |
| `skills/backend/references/sast-configuration/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/security-scanning/skills/sast-configuration` |
| `skills/backend/references/security-requirement-extraction/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/security-scanning/skills/security-requirement-extraction` |
| `skills/backend/references/stride-analysis-patterns/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/security-scanning/skills/stride-analysis-patterns` |
| `skills/backend/references/threat-mitigation-mapping/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/security-scanning/skills/threat-mitigation-mapping` |
| `skills/backend/references/workflow-orchestration-patterns/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/backend-development/skills/workflow-orchestration-patterns` |
| `skills/backend/references/codeql/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/codeql` |
| `skills/backend/references/create-spring-boot-java-project/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/create-spring-boot-java-project` |
| `skills/backend/references/java-docs/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/java-docs` |
| `skills/backend/references/java-refactoring-extract-method/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/java-refactoring-extract-method` |
| `skills/backend/references/java-refactoring-remove-parameter/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/java-refactoring-remove-parameter` |
| `skills/backend/references/java-springboot/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/java-springboot` |
| `skills/backend/references/secret-scanning/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/secret-scanning` |
| `skills/backend/references/clean-architecture/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/clean-architecture` |
| `skills/backend/references/spring-boot-actuator/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/spring-boot-actuator` |
| `skills/backend/references/spring-boot-cache/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/spring-boot-cache` |
| `skills/backend/references/spring-boot-crud-patterns/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/spring-boot-crud-patterns` |
| `skills/backend/references/spring-boot-dependency-injection/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/spring-boot-dependency-injection` |
| `skills/backend/references/spring-boot-event-driven-patterns/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/spring-boot-event-driven-patterns` |
| `skills/backend/references/spring-boot-project-creator/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/spring-boot-project-creator` |
| `skills/backend/references/spring-boot-resilience4j/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/spring-boot-resilience4j` |
| `skills/backend/references/spring-boot-rest-api-standards/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/spring-boot-rest-api-standards` |
| `skills/backend/references/spring-boot-saga-pattern/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/spring-boot-saga-pattern` |
| `skills/backend/references/spring-boot-security-jwt/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/spring-boot-security-jwt` |
| `skills/backend/references/java-code-review/guide.md` | `sivaprasadreddy/sivalabs-agent-skills` | 181 | MIT | `skills/java-code-review` |
| `skills/backend/references/jspecify/guide.md` | `sivaprasadreddy/sivalabs-agent-skills` | 181 | MIT | `skills/jspecify` |
| `skills/backend/references/spring-boot/guide.md` | `sivaprasadreddy/sivalabs-agent-skills` | 181 | MIT | `skills/spring-boot` |
| `skills/backend/references/spring-modulith-verifier/guide.md` | `sivaprasadreddy/sivalabs-agent-skills` | 181 | MIT | `skills/spring-modulith-verifier` |

### `test`（47 条｜来源 ★ 中位 38,931｜最高 285,700｜最低 345）

| 主题（现位置） | 来源仓库 | ★ | License | 上游路径 |
| --- | --- | --: | --- | --- |
| `skills/test/references/driven-development/guide.md` | `obra/superpowers` | 285,700 | MIT | `skills/test-driven-development` |
| `skills/test/references/verification-before-completion/guide.md` | `obra/superpowers` | 285,700 | MIT | `skills/verification-before-completion` |
| `skills/test/references/ai-regression-testing/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/ai-regression-testing` |
| `skills/test/references/browser-qa/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/browser-qa` |
| `skills/test/references/e2e-testing/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/e2e-testing` |
| `skills/test/references/springboot-tdd/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/springboot-tdd` |
| `skills/test/references/springboot-verification/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/springboot-verification` |
| `skills/test/references/tdd-workflow/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/tdd-workflow` |
| `skills/test/references/verification-loop/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/verification-loop` |
| `skills/test/references/browser-testing-with-devtools/guide.md` | `addyosmani/agent-skills` | 93,699 | MIT | `skills/browser-testing-with-devtools` |
| `skills/test/references/e2e-testing-patterns/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/developer-essentials/skills/e2e-testing-patterns` |
| `skills/test/references/breakdown-test/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/breakdown-test` |
| `skills/test/references/bug-receipt/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/bug-receipt` |
| `skills/test/references/bug-reproduction-brief/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/bug-reproduction-brief` |
| `skills/test/references/chrome-devtools/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/chrome-devtools` |
| `skills/test/references/gap-audit/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/test-gap-audit` |
| `skills/test/references/java-junit/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/java-junit` |
| `skills/test/references/playwright-automation-fill-in-form/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/playwright-automation-fill-in-form` |
| `skills/test/references/playwright-explore-website/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/playwright-explore-website` |
| `skills/test/references/playwright-generate-test/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/playwright-generate-test` |
| `skills/test/references/quality-playbook/guide.md` | `github/awesome-copilot` | 38,931 | Apache-2.0 | `skills/quality-playbook` |
| `skills/test/references/scoutqa-test/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/scoutqa-test` |
| `skills/test/references/spring-boot-testing/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/spring-boot-testing` |
| `skills/test/references/unit-test-vue-pinia/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/unit-test-vue-pinia` |
| `skills/test/references/webapp-testing/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/webapp-testing` |
| `skills/test/references/dummy-dataset/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-execution/skills/dummy-dataset` |
| `skills/test/references/scenarios/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-execution/skills/test-scenarios` |
| `skills/test/references/playwright-cli/guide.md` | `microsoft/playwright-cli` | 13,260 | Apache-2.0 | `skills/playwright-cli` |
| `skills/test/references/vitest/guide.md` | `antfu/skills` | 5,877 | MIT | `skills/vitest` |
| `skills/test/references/playwright-best-practices/guide.md` | `currents-dev/playwright-best-practices-skill` | 375 | MIT | `playwright-best-practices` |
| `skills/test/references/spring-boot-test-patterns/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/spring-boot-test-patterns` |
| `skills/test/references/unit-test-application-events/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/unit-test-application-events` |
| `skills/test/references/unit-test-bean-validation/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/unit-test-bean-validation` |
| `skills/test/references/unit-test-boundary-conditions/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/unit-test-boundary-conditions` |
| `skills/test/references/unit-test-caching/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/unit-test-caching` |
| `skills/test/references/unit-test-config-properties/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/unit-test-config-properties` |
| `skills/test/references/unit-test-controller-layer/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/unit-test-controller-layer` |
| `skills/test/references/unit-test-exception-handler/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/unit-test-exception-handler` |
| `skills/test/references/unit-test-json-serialization/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/unit-test-json-serialization` |
| `skills/test/references/unit-test-mapper-converter/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/unit-test-mapper-converter` |
| `skills/test/references/unit-test-parameterized/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/unit-test-parameterized` |
| `skills/test/references/unit-test-scheduled-async/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/unit-test-scheduled-async` |
| `skills/test/references/unit-test-security-authorization/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/unit-test-security-authorization` |
| `skills/test/references/unit-test-service-layer/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/unit-test-service-layer` |
| `skills/test/references/unit-test-utility-methods/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/unit-test-utility-methods` |
| `skills/test/references/unit-test-wiremock-rest-api/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/unit-test-wiremock-rest-api` |
| `skills/test/references/wiremock-standalone-docker/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/wiremock-standalone-docker` |

### `ops`（34 条｜来源 ★ 中位 39,588｜最高 256,921｜最低 38,931）

| 主题（现位置） | 来源仓库 | ★ | License | 上游路径 |
| --- | --- | --: | --- | --- |
| `skills/ops/references/canary-watch/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/canary-watch` |
| `skills/ops/references/deployment-patterns/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/deployment-patterns` |
| `skills/ops/references/docker-patterns/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/docker-patterns` |
| `skills/ops/references/kubernetes-patterns/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/kubernetes-patterns` |
| `skills/ops/references/production-audit/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/production-audit` |
| `skills/ops/references/ci-cd-and-automation/guide.md` | `addyosmani/agent-skills` | 93,699 | MIT | `skills/ci-cd-and-automation` |
| `skills/ops/references/observability-and-instrumentation/guide.md` | `addyosmani/agent-skills` | 93,699 | MIT | `skills/observability-and-instrumentation` |
| `skills/ops/references/shipping-and-launch/guide.md` | `addyosmani/agent-skills` | 93,699 | MIT | `skills/shipping-and-launch` |
| `skills/ops/references/bash-defensive-patterns/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/shell-scripting/skills/bash-defensive-patterns` |
| `skills/ops/references/deployment-pipeline-design/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/cicd-automation/skills/deployment-pipeline-design` |
| `skills/ops/references/distributed-tracing/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/observability-monitoring/skills/distributed-tracing` |
| `skills/ops/references/github-actions-templates/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/cicd-automation/skills/github-actions-templates` |
| `skills/ops/references/gitlab-ci-patterns/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/cicd-automation/skills/gitlab-ci-patterns` |
| `skills/ops/references/gitops-workflow/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/kubernetes-operations/skills/gitops-workflow` |
| `skills/ops/references/grafana-dashboards/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/observability-monitoring/skills/grafana-dashboards` |
| `skills/ops/references/helm-chart-scaffolding/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/kubernetes-operations/skills/helm-chart-scaffolding` |
| `skills/ops/references/incident-runbook-templates/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/incident-response/skills/incident-runbook-templates` |
| `skills/ops/references/k8s-manifest-generator/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/kubernetes-operations/skills/k8s-manifest-generator` |
| `skills/ops/references/k8s-security-policies/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/kubernetes-operations/skills/k8s-security-policies` |
| `skills/ops/references/on-call-handoff-patterns/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/incident-response/skills/on-call-handoff-patterns` |
| `skills/ops/references/postmortem-writing/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/incident-response/skills/postmortem-writing` |
| `skills/ops/references/prometheus-configuration/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/observability-monitoring/skills/prometheus-configuration` |
| `skills/ops/references/secrets-management/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/cicd-automation/skills/secrets-management` |
| `skills/ops/references/shellcheck-configuration/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/shell-scripting/skills/shellcheck-configuration` |
| `skills/ops/references/slo-implementation/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/observability-monitoring/skills/slo-implementation` |
| `skills/ops/references/create-github-action-workflow-specification/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/create-github-action-workflow-specification` |
| `skills/ops/references/dependabot/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/dependabot` |
| `skills/ops/references/devops-rollout-plan/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/devops-rollout-plan` |
| `skills/ops/references/github-actions-efficiency/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/github-actions-efficiency` |
| `skills/ops/references/github-actions-hardening/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/github-actions-hardening` |
| `skills/ops/references/github-actions-runtime-upgrade-conventions/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/github-actions-runtime-upgrade-conventions` |
| `skills/ops/references/github-release/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/github-release` |
| `skills/ops/references/incident-postmortem/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/incident-postmortem` |
| `skills/ops/references/multi-stage-dockerfile/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/multi-stage-dockerfile` |

### `design`（28 条｜来源 ★ 中位 39,588｜最高 256,921｜最低 345）

| 主题（现位置） | 来源仓库 | ★ | License | 上游路径 |
| --- | --- | --: | --- | --- |
| `skills/design/references/accessibility/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/accessibility` |
| `skills/design/references/liquid-glass-design/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/liquid-glass-design` |
| `skills/design/references/make-interfaces-feel-better/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/make-interfaces-feel-better` |
| `skills/design/references/motion-advanced/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/motion-advanced` |
| `skills/design/references/motion-foundations/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/motion-foundations` |
| `skills/design/references/motion-patterns/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/motion-patterns` |
| `skills/design/references/system/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/design-system` |
| `skills/design/references/taste/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/taste` |
| `skills/design/references/taste-application/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/taste-application` |
| `skills/design/references/taste-distillation/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/taste-distillation` |
| `skills/design/references/accessibility-compliance/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/ui-design/skills/accessibility-compliance` |
| `skills/design/references/interaction-design/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/ui-design/skills/interaction-design` |
| `skills/design/references/responsive-design/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/ui-design/skills/responsive-design` |
| `skills/design/references/screen-reader-testing/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/accessibility-compliance/skills/screen-reader-testing` |
| `skills/design/references/system-patterns/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/ui-design/skills/design-system-patterns` |
| `skills/design/references/visual-design-foundations/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/ui-design/skills/visual-design-foundations` |
| `skills/design/references/wcag-audit-patterns/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/accessibility-compliance/skills/wcag-audit-patterns` |
| `skills/design/references/anti-ui-slop/guide.md` | `github/awesome-copilot` | 38,931 | Apache-2.0 | `skills/anti-ui-slop` |
| `skills/design/references/draw-io-diagram-generator/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/draw-io-diagram-generator` |
| `skills/design/references/drawio/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/drawio` |
| `skills/design/references/excalidraw-diagram-generator/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/excalidraw-diagram-generator` |
| `skills/design/references/image-annotations/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/image-annotations` |
| `skills/design/references/penpot-uiux-design/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/penpot-uiux-design` |
| `skills/design/references/plantuml-ascii/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/plantuml-ascii` |
| `skills/design/references/web-design-reviewer/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/web-design-reviewer` |
| `skills/design/references/antfu-design/guide.md` | `antfu/skills` | 5,877 | MIT | `skills/antfu-design` |
| `skills/design/references/web-design-guidelines/guide.md` | `antfu/skills` | 5,877 | MIT | `skills/web-design-guidelines` |
| `skills/design/references/drawio-logical-diagrams/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-core/skills/drawio-logical-diagrams` |

### `frontend`（22 条｜来源 ★ 中位 38,931｜最高 256,921｜最低 345）

| 主题（现位置） | 来源仓库 | ★ | License | 上游路径 |
| --- | --- | --: | --- | --- |
| `skills/frontend/references/a11y/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/frontend-a11y` |
| `skills/frontend/references/design-direction/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/frontend-design-direction` |
| `skills/frontend/references/patterns/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/frontend-patterns` |
| `skills/frontend/references/ui-to-vue/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/ui-to-vue` |
| `skills/frontend/references/vite-patterns/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/vite-patterns` |
| `skills/frontend/references/vue-patterns/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/vue-patterns` |
| `skills/frontend/references/ui-engineering/guide.md` | `addyosmani/agent-skills` | 93,699 | MIT | `skills/frontend-ui-engineering` |
| `skills/frontend/references/javascript-testing-patterns/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/javascript-typescript/skills/javascript-testing-patterns` |
| `skills/frontend/references/modern-javascript-patterns/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/javascript-typescript/skills/modern-javascript-patterns` |
| `skills/frontend/references/monorepo-management/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/developer-essentials/skills/monorepo-management` |
| `skills/frontend/references/typescript-advanced-types/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/javascript-typescript/skills/typescript-advanced-types` |
| `skills/frontend/references/premium-frontend-ui/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/premium-frontend-ui` |
| `skills/frontend/references/pinia/guide.md` | `antfu/skills` | 5,877 | MIT | `skills/pinia` |
| `skills/frontend/references/pnpm/guide.md` | `antfu/skills` | 5,877 | MIT | `skills/pnpm` |
| `skills/frontend/references/unocss/guide.md` | `antfu/skills` | 5,877 | MIT | `skills/unocss` |
| `skills/frontend/references/vite/guide.md` | `antfu/skills` | 5,877 | MIT | `skills/vite` |
| `skills/frontend/references/vue/guide.md` | `antfu/skills` | 5,877 | MIT | `skills/vue` |
| `skills/frontend/references/vue-best-practices/guide.md` | `antfu/skills` | 5,877 | MIT | `skills/vue-best-practices` |
| `skills/frontend/references/vue-router-best-practices/guide.md` | `antfu/skills` | 5,877 | MIT | `skills/vue-router-best-practices` |
| `skills/frontend/references/vue-testing-best-practices/guide.md` | `antfu/skills` | 5,877 | MIT | `skills/vue-testing-best-practices` |
| `skills/frontend/references/vueuse-functions/guide.md` | `antfu/skills` | 5,877 | MIT | `skills/vueuse-functions` |
| `skills/frontend/references/typescript-docs/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-typescript/skills/typescript-docs` |

### `data`（13 条｜来源 ★ 中位 39,588｜最高 256,921｜最低 345）

| 主题（现位置） | 来源仓库 | ★ | License | 上游路径 |
| --- | --- | --: | --- | --- |
| `skills/data/references/database-migrations/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/database-migrations` |
| `skills/data/references/mysql-patterns/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/mysql-patterns` |
| `skills/data/references/postgres-patterns/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/postgres-patterns` |
| `skills/data/references/throughput-accelerator/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/data-throughput-accelerator` |
| `skills/data/references/database-migration/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/framework-migration/skills/database-migration` |
| `skills/data/references/postgresql-table-design/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/database-design/skills/postgresql-table-design` |
| `skills/data/references/quality-frameworks/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/data-engineering/skills/data-quality-frameworks` |
| `skills/data/references/sql-optimization-patterns/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/developer-essentials/skills/sql-optimization-patterns` |
| `skills/data/references/postgresql-optimization/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/postgresql-optimization` |
| `skills/data/references/sql-code-review/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/sql-code-review` |
| `skills/data/references/sql-optimization/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/sql-optimization` |
| `skills/data/references/sql-queries/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-data-analytics/skills/sql-queries` |
| `skills/data/references/spring-data-jpa/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/spring-data-jpa` |

### `analytics`（9 条｜来源 ★ 中位 39,588｜最高 256,921｜最低 26,255）

| 主题（现位置） | 来源仓库 | ★ | License | 上游路径 |
| --- | --- | --: | --- | --- |
| `skills/analytics/references/benchmark/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/benchmark` |
| `skills/analytics/references/benchmark-methodology/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/benchmark-methodology` |
| `skills/analytics/references/click-path-audit/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/click-path-audit` |
| `skills/analytics/references/dashboard-builder/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/dashboard-builder` |
| `skills/analytics/references/data-storytelling/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/business-analytics/skills/data-storytelling` |
| `skills/analytics/references/kpi-dashboard-design/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/business-analytics/skills/kpi-dashboard-design` |
| `skills/analytics/references/ab-test-analysis/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-data-analytics/skills/ab-test-analysis` |
| `skills/analytics/references/cohort-analysis/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-data-analytics/skills/cohort-analysis` |
| `skills/analytics/references/metrics-dashboard/guide.md` | `phuryn/pm-skills` | 26,255 | MIT | `pm-product-discovery/skills/metrics-dashboard` |

### `api`（9 条｜来源 ★ 中位 39,588｜最高 256,921｜最低 345）

| 主题（现位置） | 来源仓库 | ★ | License | 上游路径 |
| --- | --- | --: | --- | --- |
| `skills/api/references/connector-builder/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/api-connector-builder` |
| `skills/api/references/contract-first/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/contract-first` |
| `skills/api/references/design/guide.md` | `affaan-m/ECC` | 256,921 | MIT | `skills/api-design` |
| `skills/api/references/and-interface-design/guide.md` | `addyosmani/agent-skills` | 93,699 | MIT | `skills/api-and-interface-design` |
| `skills/api/references/openapi-spec-generation/guide.md` | `wshobson/agents` | 39,588 | MIT | `plugins/documentation-generation/skills/openapi-spec-generation` |
| `skills/api/references/openapi-to-application-code/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/openapi-to-application-code` |
| `skills/api/references/typespec-api-operations/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/typespec-api-operations` |
| `skills/api/references/typespec-create-api-plugin/guide.md` | `github/awesome-copilot` | 38,931 | MIT | `skills/typespec-create-api-plugin` |
| `skills/api/references/spring-boot-openapi-documentation/guide.md` | `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `plugins/developer-kit-java/skills/spring-boot-openapi-documentation` |

---
## 三、裁剪记录

- **2026-09-13**：移除 `skills/delivery-*` 共 91 条。原因：有用性评估显示 delivery- 域十次任务里 0 条被真正采用，且产出与 baseline 无差别；用户确认裁剪。product- 保留。

