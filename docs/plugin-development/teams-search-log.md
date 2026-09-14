# teams 插件 检索与采纳台账

> 这份文件记录的是**过程证据**，不是用户文档。它回答两个问题：
> 1. 这 359 条 skill 各自从哪来？（→ 机器可读版本在 `plugins/teams/provenance/sources.json`）
> 2. 上游一共有多少条、我们为什么不要另外 344 条？（→ 本文 §4）

抓取日期 2026-09-13。所有上游在抓取时都是其默认分支的 HEAD，`ref` 记的是当时解析出的 40 位 commit。

---

## 1. 方法与检索源

全量文件树用 GitHub tree API 拉取（`gh api repos/<r>/git/trees/<sha>?recursive=1`，逐仓确认 `truncated: false`），不靠逐页浏览，也不 `git clone`（awesome-copilot 有 112MB，clone 会超时）。
正文按文件逐个用 Contents API 抓取（`-H "Accept: application/vnd.github.raw"`），共 1394 个文件，失败 0。

| 来源仓库 | ★ | License | 抓取 commit | 树内文件 | 可达 skill 目录 |
| --- | --: | --- | --- | --: | --: |
| `obra/superpowers` | 285,700 | MIT | `b36e0829c6d0140e93cfef2ca599b1b07d4a7797` | 195 | 14 |
| `affaan-m/ECC` | 256,921 | MIT | `8321021c54d670126ce3b2969d5deb880b4b0c2a` | 3716 | 292 |
| `addyosmani/agent-skills` | 93,699 | MIT | `be4e44a9fbc5e8df0beaefadbb28bd22ee61cc39` | 197 | 25 |
| `wshobson/agents` | 39,588 | MIT | `a30778f8c4e6b0a87567941b7cca4f534bf642b6` | 1167 | 183 |
| `github/awesome-copilot` | 38,931 | MIT | `7568a482ce2df38f8965ab5336a3220db796a4ba` | 2837 | 418 |
| `phuryn/pm-skills` | 26,255 | MIT | `18468a95b427e70e258b51389796367c6f684e7d` | 147 | 68 |
| `microsoft/playwright-cli` | 13,260 | Apache-2.0 | `655530f6d0dc71a0d6bf46ae165877d3c7311099` | 31 | 1 |
| `antfu/skills` | 5,877 | MIT | `a74f281a27dadc02397bc1a174b0f2c97531b6ae` | 631 | 19 |
| `currents-dev/playwright-best-practices-skill` | 375 | MIT | `283d5cbc5d11aac1abda058b16ad22c317d54dc0` | 63 | 1 |
| `giuseppe-trisciuoglio/developer-kit` | 345 | MIT | `fe73fb33a09ee6562eeec7415a3f9a3bcf795177` | 949 | 99 |
| `sivaprasadreddy/sivalabs-agent-skills` | 181 | MIT | `031ea5ce90b5617ef8b3257c3d0739e6b613aaeb` | 39 | 7 |

合计可达 skill 目录 **1127** 条（一层深、`**/SKILL.md` 形态）。

> 上表有两个来源在早期任务书里被低估，实际盘点后修正了：`phuryn/pm-skills` 的技能不在仓库根的 `skills/`，而在 `<bundle>/skills/<skill>/`，共 9 个 bundle；`giuseppe-trisciuoglio/developer-kit` 的技能在 `plugins/<plugin>/skills/<skill>/`，其中只有 `developer-kit-java` 命中本团队技术栈。

## 2. 采纳结果

从 1127 条中采纳 **359** 条，排除 344 条，同名同域去重 2 条。

| 技术域前缀 | 条数 |
| --- | --: |
| `delivery-` | 91 |
| `product-` | 56 |
| `backend-` | 50 |
| `test-` | 47 |
| `ops-` | 34 |
| `design-` | 28 |
| `frontend-` | 22 |
| `data-` | 13 |
| `analytics-` | 9 |
| `api-` | 9 |

### 采纳规则

1. 命中的技能**逐字复制**（含 `references/`、`assets/`、`scripts/`），`description` 与正文一个字都不改。
2. 唯一改动是**目录名**：加技术域前缀，以便按 `skills/<domain>-<topic>/` 检索（写成嵌套目录 `skills/<domain>/<topic>/` 会被本仓库的 layout 校验**静默跳过**，见 `validate-claude-plugin-layout.ts` 的技能发现逻辑）。
3. frontmatter 的 `name` **不跟着目录名改**——实测 359 条之间没有任何重名，保持上游原值可以让将来与上游做 diff 时是干净的。
4. 排除依据是**技术栈与岗位域**，不是 star：star 只作为「这个领域的技能做得比较完善」的旁证。

## 3. 同名同域去重

| 被舍弃 | 保留 | 理由 |
| --- | --- | --- |
| `wshobson/agents` 的 `architecture-decision-records` | 同名同域的 star 更高者 | 与 affaan-m/ECC 的 delivery-architecture-decision-records 同名同域，保留 star 更高者（256921 vs 39588） |
| `addyosmani/agent-skills` 的 `test-driven-development` | 同名同域的 star 更高者 | 与 obra/superpowers 的 test-test-driven-development 同名同域，保留 star 更高者（285700 vs 93699） |

## 4. 排除清单（全量）

排除原因分布：

| 原因 | 条数 |
| --- | --: |
| 未映射到 8 岗位的 10 个域 | 283 |
| 人工判定：非本栈技术 / 非 8 岗位域 | 59 |
| 人工判定：developer-kit 非 Java 插件 | 2 |

逐条如下（`来源 | 上游目录 | 归因`）：

```
AO   skills/context-engineering                                 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/agentic-engineering                                 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/agentic-os                                          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/ai-first-engineering                                未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/automation-audit-ops                                未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/benchmark-optimization-loop                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/blueprint                                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/bun-runtime                                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/ck                                                  未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/code-tour                                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/codehealth-mcp                                      未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/compose-multiplatform-patterns                      人工判定：非本栈技术 / 非 8 岗位域
ECC  skills/configure-ecc                                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/connections-optimizer                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/cost-tracking                                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/counterparty-channel-discipline                     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/data-scraper-agent                                  未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/dev-team                                            未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/dynamic-workflow-mode                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/esign-field-placement                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/exa-search                                          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/fal-ai-media                                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/flox-environments                                   未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/foundation-models-on-device                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/frontend-slides                                     人工判定：非本栈技术 / 非 8 岗位域
ECC  skills/gateguard                                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/google-workspace-ops                                未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/intent-driven-development                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/iterative-retrieval                                 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/living-docs-governance                              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/master-agreement-generator                          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/messages-ops                                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/nodejs-keccak256                                    未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/nutrient-document-processing                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/nuxt4-patterns                                      未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/opensource-pipeline                                 人工判定：非本栈技术 / 非 8 岗位域
ECC  skills/operator-approval-loop                              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/parallel-execution-optimizer                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/prediction-market-oracle-research                   人工判定：非本栈技术 / 非 8 岗位域
ECC  skills/prediction-market-risk-review                       人工判定：非本栈技术 / 非 8 岗位域
ECC  skills/production-scheduling                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/ralphinho-rfc-pipeline                              人工判定：非本栈技术 / 非 8 岗位域
ECC  skills/recursive-decision-ledger                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/rules-distill                                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/safety-guard                                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/santa-method                                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/search-first                                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/tasteforge-video                                    未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/terminal-opener                                     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/terminal-ops                                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/tinystruct-patterns                                 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/ui-demo                                             未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/uncloud                                             未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/unified-memory                                      未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/unified-notifications-ops                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
ECC  skills/windows-desktop-e2e                                 人工判定：非本栈技术 / 非 8 岗位域
ECC  skills/x-api                                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AN   skills/antfu                                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AN   skills/nitro                                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AN   skills/slidev                                              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AN   skills/tsdown                                              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AN   skills/vitepress                                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/acquire-codebase-knowledge                          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/acreadiness-assess                                  未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/acreadiness-generate-instructions                   未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/acreadiness-policy                                  未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/add-educational-comments                            未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/adobe-illustrator-scripting                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/agentic-eval                                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/ai-ready                                            未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/ai-team-orchestration                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/apple-appstore-reviewer                             未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/arch-linux-triage                                   未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/arize-ai-provider-integration                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/arize-annotation                                    未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/arize-dataset                                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/arize-evaluator                                     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/arize-experiment                                    未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/arize-instrumentation                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/arize-link                                          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/arize-trace                                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/aspire                                              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/audit-integrity                                     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/automate-this                                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/autoresearch                                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/az-cost-optimize                                    未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/batch-files                                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/bench-read                                          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/boost-prompt                                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/brag-sheet                                          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/build-evidence-map                                  未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/centos-linux-triage                                 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/cli-mastery                                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/cloud-design-patterns                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/code-tour                                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/codebase-memory-mcp                                 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/comment-code-generate-a-tutorial                    未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/commit-message-storyteller                          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/competitor-ad-intelligence                          人工判定：非本栈技术 / 非 8 岗位域
AC   skills/containerize-aspnetcore                             未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/content-management-systems                          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/context-map                                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/convert-excel-to-md                                 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/convert-pdf-to-md                                   未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/convert-plaintext-to-md                             未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/convert-word-to-md                                  未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/copilot-cli-quickstart                              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/copilot-instructions-blueprint-generator            未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/copilot-pr-autopilot                                未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/copilot-sdk                                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/copilot-spaces                                      未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/copilot-usage-metrics                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/create-agentsmd                                     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/create-llms                                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/create-tldr-page                                    未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/creating-oracle-to-postgres-master-migration-plan   人工判定：非本栈技术 / 非 8 岗位域
AC   skills/creating-oracle-to-postgres-migration-bug-report    人工判定：非本栈技术 / 非 8 岗位域
AC   skills/creating-oracle-to-postgres-migration-integration-tests 人工判定：非本栈技术 / 非 8 岗位域
AC   skills/d365-solution-blueprint                             未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/daily-focus-board                                   未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/daily-prep                                          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/data-breach-blast-radius                            未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/datanalysis-credit-risk                             人工判定：非本栈技术 / 非 8 岗位域
AC   skills/debian-linux-triage                                 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/declarative-agents                                  未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/desk-journal                                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/desk-open                                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/diagnose                                            未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/doc-and-modernize                                   未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/docs-sync-audit                                     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/doublecheck                                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/editorconfig                                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/efcore-d2-db-diagram                                未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/em-dash                                             未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/email-drafter                                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/eval-driven-dev                                     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/exam-ready                                          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/eyeball                                             未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/fedora-linux-triage                                 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/finnish-humanizer                                   未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/first-ask                                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/flowstudio-power-automate-build                     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/flowstudio-power-automate-debug                     人工判定：非本栈技术 / 非 8 岗位域
AC   skills/flowstudio-power-automate-governance                未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/flowstudio-power-automate-mcp                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/flowstudio-power-automate-monitoring                人工判定：非本栈技术 / 非 8 岗位域
AC   skills/freecad-scripts                                     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/from-the-other-side-anitta                          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/from-the-other-side-quinn                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/from-the-other-side-vega                            未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/from-the-other-side-wiggins                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/gem-devops-guidelines                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/generate-custom-instructions-from-codebase          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/generate-image                                      未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/geofeed-tuner                                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/gh-attach                                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/github-codespaces-efficiency                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/github-copilot-starter                              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/image-manipulation-image-magick                     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/import-infrastructure-as-code                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/integrate-context-matic                             未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/issue-fields-migration                              人工判定：非本栈技术 / 非 8 岗位域
AC   skills/java-add-graalvm-native-image-support               人工判定：非本栈技术 / 非 8 岗位域
AC   skills/java-helidon                                        人工判定：非本栈技术 / 非 8 岗位域
AC   skills/javascript-typescript-jest                          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/javax-to-jakarta-migration                          人工判定：非本栈技术 / 非 8 岗位域
AC   skills/landing-page-conversion-audit                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/latchshot-page-capture                              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/legacy-circuit-mockups                              人工判定：非本栈技术 / 非 8 岗位域
AC   skills/linkedin-post-formatter                             未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/lsp-setup                                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/make-repo-contribution                              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/markdown-to-html                                    未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/markstream-install                                  未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/md-to-docx                                          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/memory-merger                                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/mentoring-juniors                                   未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/microsoft-code-reference                            未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/microsoft-docs                                      未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/migrating-oracle-to-postgres-data-access-code       人工判定：非本栈技术 / 非 8 岗位域
AC   skills/migrating-oracle-to-postgres-stored-procedures      人工判定：非本栈技术 / 非 8 岗位域
AC   skills/minecraft-plugin-development                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/mini-context-graph                                  未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/mkdocs-translations                                 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/msstore-cli                                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/mvvm-toolkit                                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/mvvm-toolkit-di                                     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/mvvm-toolkit-messenger                              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/namecheap                                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/nano-banana-pro-openrouter                          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/napkin                                              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/noob-mode                                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/nuget-manager                                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/onboard-context-matic                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/oo-component-documentation                          人工判定：非本栈技术 / 非 8 岗位域
AC   skills/optimize-simplicite-logs                            未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/pdftk-server                                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/performance-review-writer                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/phoenix-cli                                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/phoenix-evals                                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/phoenix-tracing                                     人工判定：非本栈技术 / 非 8 岗位域
AC   skills/planning-oracle-to-postgres-migration-integration-testing 人工判定：非本栈技术 / 非 8 岗位域
AC   skills/poka-yoke                                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/postgresql-code-review                              人工判定：非本栈技术 / 非 8 岗位域
AC   skills/power-apps-code-app-scaffold                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/power-platform-architect                            未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/pr-screenshots                                      未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/publish-to-pages                                    未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/pytest-coverage                                     人工判定：非本栈技术 / 非 8 岗位域
AC   skills/qdrant-clients-sdk                                  未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/qdrant-deployment-options                           人工判定：非本栈技术 / 非 8 岗位域
AC   skills/qdrant-model-migration                              人工判定：非本栈技术 / 非 8 岗位域
AC   skills/qdrant-monitoring                                   人工判定：非本栈技术 / 非 8 岗位域
AC   skills/qdrant-performance-optimization                     人工判定：非本栈技术 / 非 8 岗位域
AC   skills/qdrant-scaling                                      未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/qdrant-search-quality                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/qdrant-version-upgrade                              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/quasi-coder                                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/react18-batching-patterns                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/react18-dep-compatibility                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/react18-enzyme-to-rtl                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/react18-legacy-context                              人工判定：非本栈技术 / 非 8 岗位域
AC   skills/react18-lifecycle-patterns                          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/react18-string-refs                                 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/react19-concurrent-patterns                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/react19-source-patterns                             未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/react19-test-patterns                               人工判定：非本栈技术 / 非 8 岗位域
AC   skills/remember                                            未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/remember-interactive-programming                    未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/repo-standardizer                                   未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/repo-story-time                                     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/resemble-detect                                     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/resx-source-generator-migration                     人工判定：非本栈技术 / 非 8 岗位域
AC   skills/reviewing-oracle-to-postgres-migration              人工判定：非本栈技术 / 非 8 岗位域
AC   skills/rhino3d-scripts                                     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/roslyn-analyzers                                    未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/roundup                                             未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/roundup-setup                                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/salesforce-apex-quality                             未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/salesforce-component-standards                      人工判定：非本栈技术 / 非 8 岗位域
AC   skills/salesforce-flow-design                              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/sandbox-npm-install                                 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/scaffolding-oracle-to-postgres-migration-test-project 人工判定：非本栈技术 / 非 8 岗位域
AC   skills/screen-recording                                    未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/security-review                                     人工判定：非本栈技术 / 非 8 岗位域
AC   skills/semantic-kernel                                     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/server-side-conversion-tracking                     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/setup-my-iq                                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/shopify-review-triage                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/shuffle-json-data                                   未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/signal-write                                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/slang-shader-engineer                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/speak-summary                                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/sponsor-finder                                      未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/sql-server-table-reconciliation                     人工判定：非本栈技术 / 非 8 岗位域
AC   skills/ssma-console                                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/steno-mode                                          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/structured-autonomy-generate                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/structured-autonomy-implement                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/structured-autonomy-plan                            未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/suggest-awesome-github-copilot-agents               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/suggest-awesome-github-copilot-instructions         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/suggest-awesome-github-copilot-skills               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/system-commandline-cli                              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/technical-job-search                                未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/threat-model-analyst                                人工判定：非本栈技术 / 非 8 岗位域
AC   skills/tiny-stepping                                       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/tldr-prompt                                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/tm7-threat-model                                    人工判定：非本栈技术 / 非 8 岗位域
AC   skills/transloadit-media-processing                        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/tugboat                                             未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/typespec-create-agent                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/ui-screenshots                                      未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/update-llms                                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/update-markdown-file-index                          人工判定：非本栈技术 / 非 8 岗位域
AC   skills/upstash-redis                                       人工判定：非本栈技术 / 非 8 岗位域
AC   skills/vardoger-analyze                                    未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/vcpkg                                               未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/vscode-ext-commands                                 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/vscode-ext-localization                             未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/webmcpify                                           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/what-context-needed                                 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/winmd-api-search                                    未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/winui3-migration-guide                              人工判定：非本栈技术 / 非 8 岗位域
AC   skills/workiq-copilot                                      未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/workshop-create                                     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
AC   skills/x-twitter-scraper                                   未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
DK   plugins/developer-kit-typescript/skills/better-auth        人工判定：非本栈技术 / 非 8 岗位域
DK   plugins/developer-kit-ai/skills/chunking-strategy          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
DK   plugins/developer-kit-typescript/skills/clean-architecture 人工判定：developer-kit 非 Java 插件
DK   plugins/developer-kit-tools/skills/codex                   未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
DK   plugins/developer-kit-tools/skills/copilot-cli             未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
DK   plugins/developer-kit-tools/skills/gemini                  未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
DK   plugins/developer-kit-java/skills/graalvm-native-image     人工判定：非本栈技术 / 非 8 岗位域
DK   plugins/developer-kit-java/skills/langchain4j-ai-services-patterns 人工判定：非本栈技术 / 非 8 岗位域
DK   plugins/developer-kit-java/skills/langchain4j-spring-boot-integration 人工判定：非本栈技术 / 非 8 岗位域
DK   plugins/developer-kit-java/skills/langchain4j-testing-strategies 人工判定：非本栈技术 / 非 8 岗位域
DK   plugins/developer-kit-java/skills/langchain4j-tool-function-calling-patterns 人工判定：非本栈技术 / 非 8 岗位域
DK   plugins/developer-kit-core/skills/learn                    未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
DK   plugins/developer-kit-tools/skills/notebooklm              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
DK   plugins/developer-kit-java/skills/qdrant                   人工判定：非本栈技术 / 非 8 岗位域
DK   plugins/developer-kit-tools/skills/qwen-coder              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
DK   plugins/developer-kit-tools/skills/sonarqube-mcp           未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
DK   plugins/developer-kit-java/skills/spring-data-neo4j        人工判定：非本栈技术 / 非 8 岗位域
DK   plugins/developer-kit-typescript/skills/typescript-security-review 人工判定：developer-kit 非 Java 插件
SP   skills/dispatching-parallel-agents                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
SP   skills/subagent-driven-development                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
SP   skills/using-superpowers                                   未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
SP   skills/writing-skills                                      未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
PM   pm-toolkit/skills/grammar-check                            未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
PM   pm-market-research/skills/sentiment-analysis               人工判定：非本栈技术 / 非 8 岗位域
SV   skills/progen                                              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/shell-scripting/skills/bats-testing-patterns       人工判定：非本栈技术 / 非 8 岗位域
WS   plugins/developer-essentials/skills/bazel-build-optimization 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/block-no-verify/skills/block-no-verify-hook        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/conductor/skills/context-driven-development        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/cloud-infrastructure/skills/cost-optimization      未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/plugin-eval/skills/evaluation-methodology          未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/file-conversion/skills/file-conversion             未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/documentation-standards/skills/grounded-vault      人工判定：非本栈技术 / 非 8 岗位域
WS   plugins/documentation-standards/skills/hads                人工判定：非本栈技术 / 非 8 岗位域
WS   plugins/cloud-infrastructure/skills/hybrid-cloud-networking 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/cloud-infrastructure/skills/istio-traffic-management 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/cloud-infrastructure/skills/linkerd-patterns       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/cloud-infrastructure/skills/mtls-configuration     未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/cloud-infrastructure/skills/multi-cloud-architecture 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/javascript-typescript/skills/nodejs-backend-patterns 人工判定：非本栈技术 / 非 8 岗位域
WS   plugins/developer-essentials/skills/nx-workspace-patterns  未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/pptx-deck-creation/skills/pptx-deck-context        未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/pptx-deck-creation/skills/pptx-quality-gates       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/pptx-deck-creation/skills/pptx-reference-deck-analysis 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/pptx-deck-creation/skills/pptx-slide-specification 人工判定：非本栈技术 / 非 8 岗位域
WS   plugins/pptx-deck-creation/skills/pptx-visual-assets       未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/ship-mate/skills/scan                              未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/cloud-infrastructure/skills/service-mesh-observability 人工判定：非本栈技术 / 非 8 岗位域
WS   plugins/signed-audit-trails/skills/signed-audit-trails-recipe 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/startup-business-analyst/skills/startup-financial-modeling 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/startup-business-analyst/skills/startup-metrics-framework 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/superself/skills/superself                         未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/startup-business-analyst/skills/team-composition-analysis 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/cloud-infrastructure/skills/terraform-module-library 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/conductor/skills/track-management                  未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
WS   plugins/ui-design/skills/web-component-design              人工判定：非本栈技术 / 非 8 岗位域
WS   plugins/conductor/skills/workflow-patterns                 未映射到 8 岗位的 10 个域（仓库/工具元技能、非本栈技术或非本团队业务）
```

## 5. 尚未做的事（必须说清楚）

- **359 条采纳技能的正文尚未逐条通读。** 采纳决策是依据上游的完整文件树 + 技能名 + 所属 bundle/plugin + 技术栈归属做出的。这与任务书 §9 阶段 3 的「逐条断言核验」是两件事——后者属于评估阶段，见 §7。
- 因此本文**不能**被读作「这 359 条都已核验属实」。它记录的是**来源与取舍**，不是内容正确性。
- 上游的 `scripts/`（85 个 `.py`、7 个 `.sh`、4 个 `.mjs`）是随技能一起复制进来的可执行代码，尚未逐一审阅。

## 6. 实测到的两个成本数字

- **元数据常驻成本**：359 条 skill 的 `description` 合计 94,447 字符（≈ 23,600 tokens），这部分在每次加载本插件的会话里都会进入上下文。
- **单条最大正文**：`test-quality-playbook/SKILL.md` 294,426 字节 / 2,738 行（上游 `quality-playbook` v1.5.6），远超「SKILL.md 控制在 500 行内」的通行做法；它一旦被触发会占掉大量上下文。

## 7. 自建候选的检索证据

见下节（由独立检索补入）。


---

## 8. 采纳完整性审计

外采的 359 条是**逐字**复制进来的，唯一改动是目录名加域前缀。这一节记录这次改名带来的影响，以及红线自查结果。

### 8.1 相对链接完整性

对 `skills/` 下全部 `.md`/`.txt` 的 1053 条相对链接逐条解析（相对**链接所在文件**的目录解析，不是相对技能根目录）：

| 分类 | 条数 | 处理 |
| --- | --: | --- |
| 可解析 | 1009 | 无需处理 |
| **改名导致失效**（上游存在，改前缀后指不到） | 4 | **已修**：把 `../<旧叶名>/…` 重写为 `../<新前缀名>/…` |
| 改前缀后仍失效（上游本来就没有该目标） | 36 | **不改**，仅记录 |
| 目标文件未随本插件采纳（子集采纳的必然结果） | 4 | **不改**，仅记录 |

这里划了一条线，值得说明白：

- **修的是「我改坏的」**：`backend-spring-boot-cache` → `../spring-boot-rest-api-standards/SKILL.md` 等 4 处，上游本来指得到（`developer-kit-java/skills/<同名>/`），是我加前缀后指不到了。修复只是把改动的影响恢复成等价状态，语义没变。
- **不修「上游本来就坏的」**：例如 `frontend-modern-javascript-patterns/references/details.md` 里写 `[references/advanced-patterns.md](references/advanced-patterns.md)`——它从 `references/` 目录出发去指 `references/…`，解析成 `references/references/…`，**上游自己就是断的**（已在 tree 里核实目标从未存在）。改它属于改写采纳内容，超出「逐字采纳」的边界，因此只记录。

**未随采纳的目标（4 条）**，是"只同步用得到的"这条规则的直接后果，需要在使用时知道：

| 技能 | 指向的目标 | 情况 |
| --- | --- | --- |
| `backend-sast-configuration` | `../owasp-top10-checklist/`、`../container-security/`、`../dependency-scanning/` | 三个兄弟技能未采纳 |
| `ops-on-call-handoff-patterns` | `../../skills/incident-classification/`、`postmortem-facilitation` | 未采纳 |
| `frontend-vueuse-functions` | `../useMediaQuery/`、`../useBreakpoints/`、`../useSSRWidth/` | 上游仓库内也无此目标 |
| `delivery-plan-canvas` | `../../docs/design/plan-canvas.md` | ECC 仓的 `docs/` 未随技能复制 |
| `frontend-typescript-docs` | `../guides/user-management.md` | developer-kit 仓的 `guides/` 未复制 |

### 8.2 红线自查（B2–B9）

| 红线 | 结果 | 证据 |
| --- | --- | --- |
| B4 不做文档覆盖率 / 链接检查 | **通过** | 全域检索 `exports2` / `linkcheck` / `doc coverage` / `文档覆盖率`：0 命中 |
| B5 不做原型↔实现对照 | **通过** | `原型对照` 检索 0 命中 |
| B8 无真实部署标识 | **通过（有噪音）** | 出现的 UUID 是 RFC 示例值 `550e8400-e29b-…`；区域是 `us-east-1` 这类通用示例；域名除官方文档站外均为 `yourdomain.com` / `my-api.com` / `example.org` 形态的占位符。**唯一噪音**：`https://www.productcompass.pm` 出现 126 次（pm-skills 作者的商业站链接），属于署名噪音而非部署标识 |
| B6 不写死实测输出 | **通过（已核验，非默认判真）** | 全库有 35 处 `click eN` 形态，全部集中在官方 `playwright-cli` 技能内。**逐条核验后判定不是坑 2 那类缺陷**：该技能 `SKILL.md:16` 与 `:307` 明确写「use refs **from the snapshot**」，即 ref 是快照产生的临时句柄，示例里的 `e1`/`e2`/`e3` 只是示意值，与「把观测到的那一次的值写死」性质不同 |

### 8.3 一处必要的行内标记

`backend-spring-boot-security-jwt` 的 7 个 references 文件中有 13 行长占位密钥（`your-256-bit-secret-key-here-at-least-32-characters`、`test-secret-key-for-unit-testing-only-256-bits` 一类），触发本仓库 `validate:no-secrets` 的熵值规则。逐条确认为**明文占位符、非凭证**后，按扫描器自身推荐的方式加 `secret-scan: allow` 行内标记，**值本身一个字未改**。该例外记在 `provenance/sources.json` 对应条目的 `local_changes`。

### 8.4 已知未处理项

- `test-quality-playbook/SKILL.md` 294,426 字节 / 2,738 行（上游 `quality-playbook` v1.5.6）。远超「SKILL.md 控制在 500 行内」的通行做法，但拆分属于改写，未做。
- 359 条的**正文尚未逐条通读**。上面的红线自查是机械扫描 + 抽样核验，不等于逐条断言核验；后者属于评估阶段。

---

## 9. 自建技能（`provenance: framework-derived`）

自建只允许发生在"外部确实没有"且"知识本身是公开标准"的交叉点上。每条都记 `verified_against`，指向官方仓库的固定 commit 或官方文档页面。

### 9.1 RuoYi-Cloud-Plus 2.X

上游：`dromara/RuoYi-Cloud-Plus`，**2.X 分支 HEAD `911f9dea9d5999921d83cec05b9e1f0e42c324ae`**（2026-09-07，`update springboot 3.5.16`）。
文档：`https://plus-doc.dromara.org`，**2.X 的页面挂在文档站的 `5.X/` 目录下**（站点默认展示的是 6.X）。文档源码仓 `dromara/plus-doc` @ `ac71fb859bb9d9124bde4f25a26e926ec3482f20`。

核验过程中推翻了任务书里的一条事实，这条比自建本身更重要：

> 任务书 §6.3 写 2.X 基线"13 个 `ServiceErrorCode` 区间"。
> **上游 2.X 没有任何错误码区间体系。** 持有状态码的类型只有一个 interface `org.dromara.common.core.constant.HttpStatus`，里面是 **17 个扁平常量**（`SUCCESS=200` … `WARN=601`）；全树检索 `ErrorCode` / `ResultCode` / `IResultCode` **零命中**。按 HTTP 语义只分 2xx/3xx/4xx/5xx/6xx 五段。
> 也就是说，"13 个区间"是**本地 fork 的产物**，不是框架约定。这正是 4.1 版本坑 1（溯源张冠李戴）的同一形态：把项目自己的东西写成框架行为。**因此它不进入技能；技能里反而明确写了"这里没有业务错误码区间"。**

同一个分支还有一条否定事实值得记下来：**2.X 不用 Liquibase**。全树检索 `liquibase` / `changelog` / `resources/db` 为空，迁移靠 `script/sql/` 下的手工 SQL 脚本（增量脚本还要 MySQL/Oracle/PostgreSQL 各写一份，命名并不自洽，没有版本表保证幂等）。所以团队的 Liquibase 用法是**在框架之外自己加的一层**，其技能必须依据 Liquibase 官方文档，而不能从 RuoYi 文档推导。

其它已核验并写入技能的要点：新增模块除了聚合 pom 的 `<modules>` 还必须登记进 **BOM 的 `dependencyManagement`**（最常漏的一步）；2.X **不使用 MP 的 `IService`/`ServiceImpl`**；`BaseMapperPlus<T,V>` 直接返回 VO；多租户是"默认全表纳入、靠 `tenant.excludes` 退出"；`@InterceptorIgnore` 必须显式写 `dataPermission = "false"`，否则数据权限静默失效；放行要服务内 `@SaIgnore` 与网关白名单**两层同时满足**。

文档本身已核实**有漂移**（项目结构页自述版本落后、列了源码中不存在的模块、配置目录名写错），技能里因此写明"结构以源码为准，文档只用来理解意图"。

### 9.2 自建前提的一处自我更正（重要）

本文件此前把"两个 skill 目录站约 21.7 万 URL 命中 0"当作自建的许可证。**这个结论不成立**——因为当时只搜了两个目录站，没有搜 GitHub 本身。

补跑 GitHub 全站代码检索后（`gh search code "<词>" --filename SKILL.md`）：

| 关键词 | GitHub 代码检索命中数 | 结论 |
| --- | --: | --- |
| ruoyi | 238 | 有可用外部技能 |
| sa-token / satoken | 171 / 68 | 有，且有一份明确对齐 Sa-Token v1.45.0 |
| dubbo | 142 | 有（Java 版命中较浅） |
| nacos | 534 | 有，但多为旁支（官方那几份是"用 Nacos 存 skill"，不是"怎么用 Nacos"） |
| liquibase | 3624 | 有且丰富（含 JetBrains 第一方与 Artemis 的高质量件） |

**所以"外部没有"这句话对 sa-token / dubbo / liquibase 是错的。** 对 ruoyi 也不完全对：上游官方仓库里确实有第一方技能 `.codex/skills/ruoyi-plus-ai-coding/`（约 10.9 KB），但**它只存在于 `6.X` 分支（Java 21 + Spring Boot 4）**，`2.X` 分支下 `.codex`/`.claude`/`.agents` 目录一个都没有。**面向 Java 17 + Spring Boot 3.5 那一代，官方没有第一方技能。**

这与 R2（外部优先）的关系要说清楚：

- **站得住的部分**：`2.X` 世代没有第一方技能，`ruoyi-common-tenant` 等 2.X 特有约定确实无人覆盖，nacos 的通用件确实稀少——这几个点的自建仍有依据。
- **站不住的部分**：sa-token、liquibase、dubbo 在 GitHub 上是**有外部技能的**，按 R2 应当先评估采纳。已定位到的最相关候选：`full-stack-skills/java-skills` 的 sa-token 八件套、`ls1intum/Artemis` 的 `skills/liquibase-migration`、`JetBrains/skills` 的 `schema-migration-planner`、`dkbnull/hello-skill` 的 dubbo 技能。

**流程上的教训**：我把"验证外部是否存在"与"动手自建"并行了，于是自建先落地、证据后到。正确顺序是先拿到检索结论再决定要不要动笔——这正是任务书 §9 阶段 1 排在阶段 2 之前的原因，也是坑 3 的形态。

**后续动作（未做，留待评估阶段决定）**：把上述候选拉下来与已自建的五条做对照评估——若外部件质量更好，替换；若自建件更贴合 2.X 且经官方文档逐条核验过，则保留并把外部件作为补充来源进 `sources.json`。**本轮不做替换**，以免在评估之前连续改动内容层。

### 9.3 本轮实际交出的五条自建技能

| 技能 | 核验依据（固定到具体版本） |
| --- | --- |
| `backend-ruoyi-cloud-plus` | `dromara/RuoYi-Cloud-Plus` **2.X @ `911f9dea9d5999921d83cec05b9e1f0e42c324ae`** + 官方文档站 `5.X/` 目录（2.X 的文档挂在 5.X 下） |
| `backend-sa-token` | `dromara/Sa-Token` **v1.46.0** + 官方文档站 |
| `backend-dubbo` | `apache/dubbo` **dubbo-3.3.6** + `apache/dubbo-samples` |
| `backend-nacos` | `alibaba/nacos` **3.2.4** + `alibaba/spring-cloud-alibaba` **2025.0.0.0** + 官方文档站 |
| `data-liquibase` | `liquibase/liquibase` **v5.0.4** + `spring-projects/spring-boot` **v3.5.16** + 官方文档站 |

五条都写了 `verified_against`，且都刻意辟掉了核验中发现的错误说法，例如：上游 2.X 没有"业务错误码区间"（那是 fork 的产物）、Liquibase 并没有把 MySQL 的 DDL 标记为非事务。另有三处是官方文档自身与源码不一致（Nacos 鉴权表、Dubbo 的 `dubbo-spring-boot-starter3` 与 `p2c`），技能里都以源码为准并写明了。

---

## 10. 裁剪记录（2026-09-13）

有用性评估跑完后做了一次裁剪，记录在此以保留审计链。**§1–§9 描述的仍是抓取当时的采纳状态（364 条），没有回改**——那份记录是历史事实，裁剪是它之后发生的事。

| 项 | 内容 |
| --- | --- |
| 移除范围 | `skills/delivery-*`，共 **91 条** |
| 移除后 | 364 → **273 条**（采纳 268 + 自建 5） |
| 依据 | 十次真实任务对照里 `delivery-` 域**0 条被真正采用**；产出与 baseline 无差别。该域四条曾被提及的（`delivery-create-implementation-plan`、`delivery-writing-plans`、`delivery-planning-and-task-breakdown`、`delivery-folder-structure-blueprint-generator`）经核对全部是**「只读 description 后判定不相关、未读全文」**，删除不影响任何已证实的用途 |
| 保留 | `product-`（56 条）按用户要求保留，尽管它同样 0 命中 |
| 同步改动 | `provenance/sources.json` 移除对应条目并写入 `pruning[]`；`npm run validate:plugins` 六道门复跑全绿 |

裁剪后各域状态（★ 采用 / ☆ 仅评估 / 未触碰）：

| 域 | 条数 | ★ | ☆ | 未触碰 |
| --- | --: | --: | --: | --: |
| `product-` | 56 | 0 | 0 | 56 |
| `backend-` | 54 | 6 | 9 | 39 |
| `test-` | 47 | 9 | 5 | 33 |
| `ops-` | 34 | 5 | 0 | 29 |
| `design-` | 28 | 1 | 0 | 27 |
| `frontend-` | 22 | 13 | 0 | 9 |
| `data-` | 14 | 5 | 3 | 6 |
| `analytics-` | 9 | 2 | 2 | 5 |
| `api-` | 9 | 5 | 1 | 3 |
| **合计** | **273** | **46** | **20** | **207** |

五条自建技能**全部被采用**。完整清单见 `teams-skill-inventory.md`，来源与信用记录见 `teams-skill-sources.md`。

---

## 11. 结构重构（2026-09-13，同日第二次）

§1–§10 描述的仍是**扁平形态**（273 条各自是一个 `skills/<name>/SKILL.md`）。本次把结构改成"域入口 + 按需参考"，**内容一字未改**。

| | 重构前 | 重构后 |
| --- | --- | --- |
| 常驻上下文的 description | 273 条，70,279 字符 ≈ 17,570 tokens | 9 个域 skill（2,680 字符）+ 9 个域 agent（5,693 字符）= **8,373 字符 ≈ 2,093 tokens** |
| 降幅 | — | **−88.1%** |
| 技能发现数 | 273 | **9**（校验器实测 `321 → 66` frontmatter 文件，确认深层文档不再被当成技能） |
| 触发方式 | 主题级（`backend-dubbo` 听到 "dubbo" 就命中） | 域级（`backend` 命中后由它的路由表指向 `references/dubbo/`） |

### 做了什么

1. `skills/<domain>-<topic>/` → `skills/<domain>/references/<topic>/`，**273 个目录全部归位**；同一域内去掉前缀后**零重名**。
2. 每篇的入口文件 `SKILL.md` → **`guide.md`**。这是**刻意的**：`skills/` 下三层的 `SKILL.md` 有被当成独立技能发现的风险，而这个风险无法在本地验证；改名后风险归零，代价是每篇多一条 `local_changes` 记录。改名后校验器报告的 frontmatter 文件数从 321 掉到 66，实测确认深层文档不再进入技能发现。
3. 跨文档相对链接重写。两条同域、两条跨域，外加一条指向自身入口的 `../SKILL.md`。
4. 新增 9 个域入口 `skills/<domain>/SKILL.md`（路由型：什么时候适用 + 逐主题的"什么时候读它"表 + 本域硬要求 + 交付物形态）与 9 个域 agent `agents/<domain>.md`（按 `agent-creator` 的形态：触发示例、tools 最小集、正文里直接点名它该读的域技能与参考目录）。
5. `sources.json` 增加 `container` 与 `local_path` 两个字段并写入 `structure` 说明；`plugin.config.ts` 升到 0.2.0 并重写 description / keywords。

### 链接完整性

重构后共 1,018 条相对链接、36 条断链。**与重构前逐条做集合差：新增断链 0 条**，另有 8 个此前断掉的目标在重写中反而修好了。余下 36 条是上游文档自身的缺陷（§8.1 已记录其性质），未代上游修改。

### 尚未验证

- ~~**域路由是否真的能把对的那篇推出来**~~ —— **2026-09-14 已补测。** 在一条六阶段的真实交付链路上跑了两轮不同派法：两轮合计 43 篇次命中（去重 32 篇）全部回查到正确的域，**0 篇误路由**；`data`/`ops`/`analytics` 三个域 0 命中（该任务里确实没有对应工作，属正确行为）。详见 `teams-chain-eval.md`。
- Claude Code 运行期对 `agents/<domain>.md` 的发现与派发未实测（本地只验证了本仓库校验器）。

---

## 12. git 工作流补充（2026-09-14）

按"找比较多人用的 git / gitflow 相关 skills（提交、submodule、worktree）"的检索结果，**只采纳 3 篇**，全部入 `ops` 域。273 → 276 篇。

### 采纳了什么

| 篇目 | 来源 | star | 体积 | 处置 |
| --- | --- | --: | --: | --- |
| `using-git-worktrees` | `obra/superpowers` @ `b36e082` | 286,381 | 6.8 KB | 采纳，清理 1 处自指 |
| `finishing-a-development-branch` | `obra/superpowers` @ `b36e082` | 286,381 | 7.7 KB | 采纳，清理 2 处自指 |
| `git-workflow` | `affaan-m/ECC` @ `8321021` | 257,966 | 15.1 KB | 采纳，逐字未改 |

三者均 MIT（Jesse Vincent / Affaan Mustafa）。

**清掉的自指**（逐条记入 `provenance/sources.json` 的 `local_changes`）：

1. `using-git-worktrees` 开场宣告：`I'm using the using-git-worktrees skill to set up an isolated workspace.` → `Setting up an isolated workspace with git worktrees.`（该名字在本插件内已不是技能名，保留会误导）
2. `finishing-a-development-branch` 开场宣告：`I'm using the finishing-a-development-branch skill to complete this work.` → `Wrapping up this development branch.`
3. `finishing-a-development-branch` Step 6：`Superpowers created this worktree — we own cleanup` → `This worktree is project-local — we own cleanup`（原句把清理归属绑在上游产品名上，与本地判据无关）

### 评估后**没有**采纳的

- **纯提交规范/命名规范类 6 篇**（`github/awesome-copilot` 的 `git-commit`、`conventional-commit`、`conventional-branch`、`git-flow-branch-creator`、`gitmoji`、`commit-message-storyteller`）：Conventional Commits / gitmoji / Conventional Branch 都是公开标准，属 `teams-eval-report.md` 结论里"讲通用方法、测不出与 baseline 差别"的那一类。**建议先跑一对对照再决定。**
- **`wshobson/agents` 的 `git-advanced-workflows`**：命令速查（rebase / cherry-pick / bisect / worktree / reflog）+ 安全实践，可选。未采纳的理由是它的 worktree 部分被 `using-git-worktrees` 在决策层面覆盖；bisect/reflog 属恢复场景，优先级低。
- **`jeremylongshore/claude-code-plugins-plus-skills` 的 git 系列**：约 2.2 KB 的模板填充文本（"Manage commit message formatter operations. Auto-activating skill for DevOps"），无实质内容。
- **`awesome-copilot` 的 `git-worktree-explorer`**：是带图形界面的 JS 扩展，不是知识型 skill。

### submodule：确认是空白

- 本地 19 个源仓库全部 `SKILL.md` 过一遍，**没有任何一篇的 submodule 提及数 ≥5**；`gh search repos` / `gh search code` 无结果。
- 网上搜到的两个"git submodules skill"（hyperpromptai、skillmd.ai）抓原文确认是聚合站 SEO 页，无可核验上游；`agentskills.so` 指向的 `supercent-io/skills-template` 仓库 404。
- 唯一有实质内容的相邻材料是已知坑：`anthropics/claude-code` #83411（桌面端 session worktree 不初始化 submodule，`CLAUDE.md` import 与 project hook 静默失效，CLI `--worktree` 正常）。
- **结论：submodule 该自建，不该外采。**

### 本次发现但**未处理**的既有耦合（需决策）

清理新采纳的两篇时，发现**此前采纳的 3 个主题**同样带着上游产品名，性质相同、部分更严重：

| 位置 | 性质 | 影响 |
| --- | --- | --- |
| `analytics/references/click-path-audit/guide.md:205-207` | 引用 `/superpowers:systematic-debugging`、`/superpowers:verification-before-completion`、`/superpowers:test-driven-development` | 这 3 个命令**在本插件内不存在**，照做会调不存在的命令 |
| `product/references/brainstorming/guide.md:100,206`、`spec-document-reviewer-prompt.md:7` | 要求把设计文档写到 `docs/superpowers/specs/` | 会在**用户仓库里**建出 `docs/superpowers/` 目录 |
| `product/references/brainstorming/scripts/*`（`server.cjs`、`start-server.sh`、`stop-server.sh`、`frame-template.html`、`visual-companion.md`） | 整套可视化协作服务器是上游品牌的：硬编码品牌 logo URL、`SUPERPOWERS_*` 遥测环境变量、版本读取、状态目录 `.superpowers/brainstorm/` | 品牌与遥测行为随插件一起分发；改 env 变量名/目录会影响脚本功能，需改码并验证 |

未处理的原因：这是**既有采纳内容**，且 `brainstorming/scripts/` 属功能性代码（不是纯文本），改动需要单独验证；是否破例偏离"逐字采纳"应由使用者决定。
