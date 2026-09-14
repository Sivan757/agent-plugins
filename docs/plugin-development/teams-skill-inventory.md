# teams 技能清单（按域分组，三源证据 + 处置建议）

**结构**：9 个域技能（`skills/<domain>/SKILL.md`）+ 9 个域 agent（`agents/<domain>.md`），
下辖 **273** 篇主题文档（`skills/<domain>/references/<topic>/guide.md`）。

**三源证据**：`★`/`☆` = 10 对扁平评估（重构前跑，按主题名回溯）；`R1`/`R2` = 两轮六阶段全链路实测（严格读取口径，只算真读到的）。

| 命中证据源数 | 篇数 |
| :-: | --: |
| 3 | 4 |
| 2 | 19 |
| 1 | 59 |
| 0 | 191 |

| 域 | agent | 主题数 | 至少命中1次 | 命中密度 | 0 命中 | 路由字符 | 未命中行字符 |
| --- | --- | --: | --: | --: | --: | --: | --: |
| `analytics` | `agents/analytics.md` | 9 | 4 | 44% | 5 | 1236 | 648 |
| `api` | `agents/api.md` | 9 | 6 | 67% | 3 | 1199 | 434 |
| `backend` | `agents/backend.md` | 54 | 16 | 30% | 38 | 6544 | 4509 |
| `data` | `agents/data.md` | 14 | 8 | 57% | 6 | 1844 | 770 |
| `design` | `agents/design.md` | 28 | 5 | 18% | 23 | 3498 | 2874 |
| `frontend` | `agents/frontend.md` | 22 | 15 | 68% | 7 | 2467 | 823 |
| `ops` | `agents/ops.md` | 34 | 5 | 15% | 29 | 4376 | 3679 |
| `product` | `agents/product.md` | 56 | 5 | 9% | 51 | 7175 | 6514 |
| `test` | `agents/test.md` | 47 | 18 | 38% | 29 | 5797 | 3415 |
| **合计** | **9** | **273** | **82** | **30%** | **191** | **34136** | **23666** |

**处置**：`A` = 路由行留在 `SKILL.md`（有实测证据）；`B` = 路由行移入 `references/INDEX.md`（0 命中，文档本体保留）。规则见 `teams-optimization-plan.md`。

---

## `analytics`（9 篇，命中 4）— 入口 `skills/analytics/SKILL.md`，agent `agents/analytics.md`

- `A` `☆` `references/ab-test-analysis/guide.md`
- `A` `☆` `references/cohort-analysis/guide.md`
- `A` `★` `references/kpi-dashboard-design/guide.md`
- `A` `★` `references/metrics-dashboard/guide.md`
- `B` `—` `references/benchmark/guide.md`
- `B` `—` `references/benchmark-methodology/guide.md`
- `B` `—` `references/click-path-audit/guide.md`
- `B` `—` `references/dashboard-builder/guide.md`
- `B` `—` `references/data-storytelling/guide.md`

## `api`（9 篇，命中 6）— 入口 `skills/api/SKILL.md`，agent `agents/api.md`

- `A` `★ R1` `references/contract-first/guide.md`
- `A` `★ R1` `references/design/guide.md`
- `A` `★` `references/and-interface-design/guide.md`
- `A` `★` `references/openapi-spec-generation/guide.md`
- `A` `☆` `references/openapi-to-application-code/guide.md`
- `A` `★` `references/spring-boot-openapi-documentation/guide.md`
- `B` `—` `references/connector-builder/guide.md`
- `B` `—` `references/typespec-api-operations/guide.md`
- `B` `—` `references/typespec-create-api-plugin/guide.md`

## `backend`（54 篇，命中 16）— 入口 `skills/backend/SKILL.md`，agent `agents/backend.md`

- `A` `★ R1 R2` `references/spring-boot-rest-api-standards/guide.md`
- `A` `☆ R2` `references/api-design-principles/guide.md`
- `A` `☆ R1` `references/error-handling/guide.md`
- `A` `☆ R2` `references/java-coding-standards/guide.md`
- `A` `☆ R1` `references/spring-boot/guide.md`
- `A` `R1 R2` `references/spring-boot-crud-patterns/guide.md`
- `A` `☆` `references/architecture-patterns/guide.md`
- `A` `☆` `references/create-spring-boot-java-project/guide.md`
- `A` `★` `references/dubbo/guide.md`
- `A` `☆` `references/error-handling-patterns/guide.md`
- `A` `☆` `references/microservices-patterns/guide.md`
- `A` `★` `references/nacos/guide.md`
- `A` `★` `references/ruoyi-cloud-plus/guide.md`
- `A` `★` `references/sa-token/guide.md`
- `A` `★` `references/spring-boot-actuator/guide.md`
- `A` `☆` `references/spring-boot-project-creator/guide.md`
- `B` `—` `references/attack-tree-construction/guide.md`
- `B` `—` `references/auth-implementation-patterns/guide.md`
- `B` `—` `references/clean-architecture/guide.md`
- `B` `—` `references/codeql/guide.md`
- `B` `—` `references/content-hash-cache-pattern/guide.md`
- `B` `—` `references/cqrs-implementation/guide.md`
- `B` `—` `references/event-store-design/guide.md`
- `B` `—` `references/hexagonal-architecture/guide.md`
- `B` `—` `references/java-code-review/guide.md`
- `B` `—` `references/java-docs/guide.md`
- `B` `—` `references/java-refactoring-extract-method/guide.md`
- `B` `—` `references/java-refactoring-remove-parameter/guide.md`
- `B` `—` `references/java-springboot/guide.md`
- `B` `—` `references/jpa-patterns/guide.md`
- `B` `—` `references/jspecify/guide.md`
- `B` `—` `references/latency-critical-systems/guide.md`
- `B` `—` `references/patterns/guide.md`
- `B` `—` `references/projection-patterns/guide.md`
- `B` `—` `references/redis-patterns/guide.md`
- `B` `—` `references/saga-orchestration/guide.md`
- `B` `—` `references/sast-configuration/guide.md`
- `B` `—` `references/secret-scanning/guide.md`
- `B` `—` `references/security-and-hardening/guide.md`
- `B` `—` `references/security-requirement-extraction/guide.md`
- `B` `—` `references/security-review/guide.md`
- `B` `—` `references/security-scan/guide.md`
- `B` `—` `references/spring-boot-cache/guide.md`
- `B` `—` `references/spring-boot-dependency-injection/guide.md`
- `B` `—` `references/spring-boot-event-driven-patterns/guide.md`
- `B` `—` `references/spring-boot-resilience4j/guide.md`
- `B` `—` `references/spring-boot-saga-pattern/guide.md`
- `B` `—` `references/spring-boot-security-jwt/guide.md`
- `B` `—` `references/spring-modulith-verifier/guide.md`
- `B` `—` `references/springboot-patterns/guide.md`
- `B` `—` `references/springboot-security/guide.md`
- `B` `—` `references/stride-analysis-patterns/guide.md`
- `B` `—` `references/threat-mitigation-mapping/guide.md`
- `B` `—` `references/workflow-orchestration-patterns/guide.md`

## `data`（14 篇，命中 8）— 入口 `skills/data/SKILL.md`，agent `agents/data.md`

- `A` `★` `references/database-migration/guide.md`
- `A` `★` `references/database-migrations/guide.md`
- `A` `★` `references/liquibase/guide.md`
- `A` `★` `references/mysql-patterns/guide.md`
- `A` `☆` `references/quality-frameworks/guide.md`
- `A` `☆` `references/sql-code-review/guide.md`
- `A` `☆` `references/sql-optimization-patterns/guide.md`
- `A` `★` `references/sql-queries/guide.md`
- `B` `—` `references/postgres-patterns/guide.md`
- `B` `—` `references/postgresql-optimization/guide.md`
- `B` `—` `references/postgresql-table-design/guide.md`
- `B` `—` `references/spring-data-jpa/guide.md`
- `B` `—` `references/sql-optimization/guide.md`
- `B` `—` `references/throughput-accelerator/guide.md`

## `design`（28 篇，命中 5）— 入口 `skills/design/SKILL.md`，agent `agents/design.md`

- `A` `R1 R2` `references/accessibility/guide.md`
- `A` `R1 R2` `references/system-patterns/guide.md`
- `A` `R2` `references/interaction-design/guide.md`
- `A` `R1` `references/system/guide.md`
- `A` `★` `references/taste/guide.md`
- `B` `—` `references/accessibility-compliance/guide.md`
- `B` `—` `references/antfu-design/guide.md`
- `B` `—` `references/anti-ui-slop/guide.md`
- `B` `—` `references/draw-io-diagram-generator/guide.md`
- `B` `—` `references/drawio/guide.md`
- `B` `—` `references/drawio-logical-diagrams/guide.md`
- `B` `—` `references/excalidraw-diagram-generator/guide.md`
- `B` `—` `references/image-annotations/guide.md`
- `B` `—` `references/liquid-glass-design/guide.md`
- `B` `—` `references/make-interfaces-feel-better/guide.md`
- `B` `—` `references/motion-advanced/guide.md`
- `B` `—` `references/motion-foundations/guide.md`
- `B` `—` `references/motion-patterns/guide.md`
- `B` `—` `references/penpot-uiux-design/guide.md`
- `B` `—` `references/plantuml-ascii/guide.md`
- `B` `—` `references/responsive-design/guide.md`
- `B` `—` `references/screen-reader-testing/guide.md`
- `B` `—` `references/taste-application/guide.md`
- `B` `—` `references/taste-distillation/guide.md`
- `B` `—` `references/visual-design-foundations/guide.md`
- `B` `—` `references/wcag-audit-patterns/guide.md`
- `B` `—` `references/web-design-guidelines/guide.md`
- `B` `—` `references/web-design-reviewer/guide.md`

## `frontend`（22 篇，命中 15）— 入口 `skills/frontend/SKILL.md`，agent `agents/frontend.md`

- `A` `★ R1 R2` `references/pinia/guide.md`
- `A` `★ R1 R2` `references/vue/guide.md`
- `A` `★ R1` `references/ui-engineering/guide.md`
- `A` `R1 R2` `references/vite-patterns/guide.md`
- `A` `★ R1` `references/vue-router-best-practices/guide.md`
- `A` `R2` `references/a11y/guide.md`
- `A` `★` `references/monorepo-management/guide.md`
- `A` `★` `references/patterns/guide.md`
- `A` `★` `references/premium-frontend-ui/guide.md`
- `A` `★` `references/typescript-advanced-types/guide.md`
- `A` `★` `references/unocss/guide.md`
- `A` `★` `references/vite/guide.md`
- `A` `★` `references/vue-best-practices/guide.md`
- `A` `★` `references/vue-patterns/guide.md`
- `A` `★` `references/vueuse-functions/guide.md`
- `B` `—` `references/design-direction/guide.md`
- `B` `—` `references/javascript-testing-patterns/guide.md`
- `B` `—` `references/modern-javascript-patterns/guide.md`
- `B` `—` `references/pnpm/guide.md`
- `B` `—` `references/typescript-docs/guide.md`
- `B` `—` `references/ui-to-vue/guide.md`
- `B` `—` `references/vue-testing-best-practices/guide.md`

## `ops`（34 篇，命中 5）— 入口 `skills/ops/SKILL.md`，agent `agents/ops.md`

- `A` `★` `references/deployment-patterns/guide.md`
- `A` `★` `references/docker-patterns/guide.md`
- `A` `★` `references/k8s-manifest-generator/guide.md`
- `A` `★` `references/kubernetes-patterns/guide.md`
- `A` `★` `references/multi-stage-dockerfile/guide.md`
- `B` `—` `references/bash-defensive-patterns/guide.md`
- `B` `—` `references/canary-watch/guide.md`
- `B` `—` `references/ci-cd-and-automation/guide.md`
- `B` `—` `references/create-github-action-workflow-specification/guide.md`
- `B` `—` `references/dependabot/guide.md`
- `B` `—` `references/deployment-pipeline-design/guide.md`
- `B` `—` `references/devops-rollout-plan/guide.md`
- `B` `—` `references/distributed-tracing/guide.md`
- `B` `—` `references/github-actions-efficiency/guide.md`
- `B` `—` `references/github-actions-hardening/guide.md`
- `B` `—` `references/github-actions-runtime-upgrade-conventions/guide.md`
- `B` `—` `references/github-actions-templates/guide.md`
- `B` `—` `references/github-release/guide.md`
- `B` `—` `references/gitlab-ci-patterns/guide.md`
- `B` `—` `references/gitops-workflow/guide.md`
- `B` `—` `references/grafana-dashboards/guide.md`
- `B` `—` `references/helm-chart-scaffolding/guide.md`
- `B` `—` `references/incident-postmortem/guide.md`
- `B` `—` `references/incident-runbook-templates/guide.md`
- `B` `—` `references/k8s-security-policies/guide.md`
- `B` `—` `references/observability-and-instrumentation/guide.md`
- `B` `—` `references/on-call-handoff-patterns/guide.md`
- `B` `—` `references/postmortem-writing/guide.md`
- `B` `—` `references/production-audit/guide.md`
- `B` `—` `references/prometheus-configuration/guide.md`
- `B` `—` `references/secrets-management/guide.md`
- `B` `—` `references/shellcheck-configuration/guide.md`
- `B` `—` `references/shipping-and-launch/guide.md`
- `B` `—` `references/slo-implementation/guide.md`

## `product`（56 篇，命中 5）— 入口 `skills/product/SKILL.md`，agent `agents/product.md`

- `A` `R1 R2` `references/create-specification/guide.md`
- `A` `R2` `references/create-prd/guide.md`
- `A` `R2` `references/job-stories/guide.md`
- `A` `R1` `references/prd/guide.md`
- `A` `R1` `references/user-stories/guide.md`
- `B` `—` `references/analyze-feature-requests/guide.md`
- `B` `—` `references/ansoff-matrix/guide.md`
- `B` `—` `references/beachhead-segment/guide.md`
- `B` `—` `references/brainstorm-experiments-existing/guide.md`
- `B` `—` `references/brainstorm-experiments-new/guide.md`
- `B` `—` `references/brainstorm-ideas-existing/guide.md`
- `B` `—` `references/brainstorm-ideas-new/guide.md`
- `B` `—` `references/brainstorm-okrs/guide.md`
- `B` `—` `references/brainstorming/guide.md`
- `B` `—` `references/breakdown-epic-pm/guide.md`
- `B` `—` `references/breakdown-feature-prd/guide.md`
- `B` `—` `references/business-model/guide.md`
- `B` `—` `references/capability/guide.md`
- `B` `—` `references/competitive-battlecard/guide.md`
- `B` `—` `references/competitive-landscape/guide.md`
- `B` `—` `references/competitive-platform-analysis/guide.md`
- `B` `—` `references/competitive-report-structure/guide.md`
- `B` `—` `references/competitor-analysis/guide.md`
- `B` `—` `references/create-github-issue-feature-from-specification/guide.md`
- `B` `—` `references/create-github-issues-for-unmet-specification-requirements/guide.md`
- `B` `—` `references/create-technical-spike/guide.md`
- `B` `—` `references/customer-journey-map/guide.md`
- `B` `—` `references/deep-research/guide.md`
- `B` `—` `references/idea-refine/guide.md`
- `B` `—` `references/ideal-customer-profile/guide.md`
- `B` `—` `references/identify-assumptions-existing/guide.md`
- `B` `—` `references/identify-assumptions-new/guide.md`
- `B` `—` `references/interview-me/guide.md`
- `B` `—` `references/lean-canvas/guide.md`
- `B` `—` `references/lens/guide.md`
- `B` `—` `references/market-research/guide.md`
- `B` `—` `references/market-segments/guide.md`
- `B` `—` `references/market-sizing/guide.md`
- `B` `—` `references/market-sizing-analysis/guide.md`
- `B` `—` `references/opportunity-solution-tree/guide.md`
- `B` `—` `references/pestle-analysis/guide.md`
- `B` `—` `references/porters-five-forces/guide.md`
- `B` `—` `references/prioritize-assumptions/guide.md`
- `B` `—` `references/prioritize-features/guide.md`
- `B` `—` `references/research-ops/guide.md`
- `B` `—` `references/spec-driven-development/guide.md`
- `B` `—` `references/startup-canvas/guide.md`
- `B` `—` `references/strategy/guide.md`
- `B` `—` `references/strategy-red-team/guide.md`
- `B` `—` `references/summarize-interview/guide.md`
- `B` `—` `references/swot-analysis/guide.md`
- `B` `—` `references/update-specification/guide.md`
- `B` `—` `references/user-personas/guide.md`
- `B` `—` `references/user-segmentation/guide.md`
- `B` `—` `references/value-proposition/guide.md`
- `B` `—` `references/vision/guide.md`

## `test`（47 篇，命中 18）— 入口 `skills/test/SKILL.md`，agent `agents/test.md`

- `A` `★ R1 R2` `references/spring-boot-test-patterns/guide.md`
- `A` `R1 R2` `references/browser-qa/guide.md`
- `A` `☆ R1` `references/gap-audit/guide.md`
- `A` `☆ R2` `references/unit-test-controller-layer/guide.md`
- `A` `★ R2` `references/unit-test-vue-pinia/guide.md`
- `A` `★ R2` `references/verification-before-completion/guide.md`
- `A` `R1 R2` `references/webapp-testing/guide.md`
- `A` `R1` `references/e2e-testing/guide.md`
- `A` `★` `references/java-junit/guide.md`
- `A` `R2` `references/playwright-best-practices/guide.md`
- `A` `☆` `references/scenarios/guide.md`
- `A` `☆` `references/spring-boot-testing/guide.md`
- `A` `★` `references/springboot-verification/guide.md`
- `A` `★` `references/unit-test-boundary-conditions/guide.md`
- `A` `★` `references/unit-test-config-properties/guide.md`
- `A` `★` `references/unit-test-parameterized/guide.md`
- `A` `☆` `references/unit-test-security-authorization/guide.md`
- `A` `★` `references/unit-test-service-layer/guide.md`
- `B` `—` `references/ai-regression-testing/guide.md`
- `B` `—` `references/breakdown-test/guide.md`
- `B` `—` `references/browser-testing-with-devtools/guide.md`
- `B` `—` `references/bug-receipt/guide.md`
- `B` `—` `references/bug-reproduction-brief/guide.md`
- `B` `—` `references/chrome-devtools/guide.md`
- `B` `—` `references/driven-development/guide.md`
- `B` `—` `references/dummy-dataset/guide.md`
- `B` `—` `references/e2e-testing-patterns/guide.md`
- `B` `—` `references/playwright-automation-fill-in-form/guide.md`
- `B` `—` `references/playwright-cli/guide.md`
- `B` `—` `references/playwright-explore-website/guide.md`
- `B` `—` `references/playwright-generate-test/guide.md`
- `B` `—` `references/quality-playbook/guide.md`
- `B` `—` `references/scoutqa-test/guide.md`
- `B` `—` `references/springboot-tdd/guide.md`
- `B` `—` `references/tdd-workflow/guide.md`
- `B` `—` `references/unit-test-application-events/guide.md`
- `B` `—` `references/unit-test-bean-validation/guide.md`
- `B` `—` `references/unit-test-caching/guide.md`
- `B` `—` `references/unit-test-exception-handler/guide.md`
- `B` `—` `references/unit-test-json-serialization/guide.md`
- `B` `—` `references/unit-test-mapper-converter/guide.md`
- `B` `—` `references/unit-test-scheduled-async/guide.md`
- `B` `—` `references/unit-test-utility-methods/guide.md`
- `B` `—` `references/unit-test-wiremock-rest-api/guide.md`
- `B` `—` `references/verification-loop/guide.md`
- `B` `—` `references/vitest/guide.md`
- `B` `—` `references/wiremock-standalone-docker/guide.md`

## 图例

- `★` 扁平评估中真正读入并采用 ｜ `☆` 读过但明确否决
- `R1` / `R2` 被对应那轮六阶段链路严格读到
- `A` 保留在主路由表 ｜ `B` 降级到 `references/INDEX.md`（文档不删）
