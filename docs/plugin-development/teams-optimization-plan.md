# teams 插件优化方案：裁路由，不裁文档

2026-09-14。依据是三份独立证据：10 对扁平形态对照（`teams-eval-report.md`）+ 两轮六阶段全链路实测（`teams-chain-eval.md`），合计 12 次任务、273 篇主题文档。

---

## 0. 一句话方案

**成本不在文档本体，在路由表。**273 篇 `guide.md` 是按需读的，不读不花钱；每域触发时**必付**的是 9 个 `SKILL.md` 里那 273 行路由表 —— 而其中 **191 行（23,666 字符）描述的是 12 次证据跑里从没被碰过的东西**。

所以优化不是删文档，是**把路由表拆成"主表 + 索引"两层**：命中过的留在 `SKILL.md`，没命中过的移进同目录的 `references/INDEX.md`，`SKILL.md` 里只留一行指路。文档一篇不删，知识一条不丢，只是从"每域触发必付"变成"需要时才多读一次"。

---

## 1. 现状成本结构

| 层 | 何时付 | 字符 | ≈tokens |
| --- | --- | ---: | ---: |
| 9 个技能 description + 9 个 agent description | **每会话必付** | 11,915 | 2,979 |
| —— 其中技能 description | | 2,929 | 732 |
| —— 其中 agent description | | 8,986 | 2,247 |
| 9 个 `SKILL.md` 正文 | 域技能触发时 | 39,389 | 9,847 |
| —— **其中路由表（273 行）** | | **34,136** | **8,534** |
| 9 个 agent 正文 | agent 被调用时 | 24,961 | 6,240 |
| 273 篇 `guide.md` | **只读到的付** | — | — |

对比扁平形态：273 条 description 合计 70,279 字符 ≈ 17,570 tokens 每会话必付。域化后 2,979 —— **每会话省 83%**。这一层已经做完，没有优化空间。

---

## 2. 证据矩阵：273 篇里有多少被碰到

三个独立证据源：**扁平评估**（10 对，重构前）、**链路 run1**、**链路 run2**。

| 命中证据源数 | 篇数 | 篇目 |
| :-: | --: | --- |
| 3 | 4 | `backend/spring-boot-rest-api-standards`、`frontend/pinia`、`frontend/vue`、`test/spring-boot-test-patterns` |
| 2 | 19 | `api/contract-first`、`api/design`、`backend/api-design-principles`、`backend/error-handling`、`backend/java-coding-standards`、`backend/spring-boot`、`backend/spring-boot-crud-patterns`、`design/accessibility`、`design/system-patterns`、`frontend/ui-engineering`、`frontend/vite-patterns`、`frontend/vue-router-best-practices`、`product/create-specification`、`test/browser-qa`、`test/gap-audit`、`test/unit-test-controller-layer`、`test/unit-test-vue-pinia`、`test/verification-before-completion`、`test/webapp-testing` |
| 1 | 59 | 见 §3 各域清单 |
| **0** | **191** | **70% 从未被任何证据源碰到** |

### 按域

| 域 | 篇数 | 至少命中 1 次 | 命中密度 | 0 命中 | 路由字符 | 命中行字符 | **未命中行字符** |
| --- | --: | --: | --: | --: | --: | --: | --: |
| `frontend` | 22 | 15 | **68%** | 7 | 2,467 | 1,644 | 823 |
| `api` | 9 | 6 | 67% | 3 | 1,199 | 765 | 434 |
| `data` | 14 | 8 | 57% | 6 | 1,844 | 1,074 | 770 |
| `analytics` | 9 | 4 | 44% | 5 | 1,236 | 588 | 648 |
| `test` | 47 | 18 | 38% | 29 | 5,797 | 2,382 | 3,415 |
| `backend` | 54 | 16 | 30% | 38 | 6,544 | 2,035 | 4,509 |
| `design` | 28 | 5 | 18% | 23 | 3,498 | 624 | 2,874 |
| `ops` | 34 | 5 | 15% | 29 | 4,376 | 697 | 3,679 |
| `product` | 56 | 5 | **9%** | 51 | **7,175** | 661 | **6,514** |
| **合计** | **273** | **82** | **30%** | **191** | **34,136** | **10,470** | **23,666** |

---

## 3. 82 篇命中清单（按域，标注证据）

`★` 扁平评估采用 ｜ `☆` 扁平评估读过但否决 ｜ `R1`/`R2` 被对应链路跑读到

**`frontend`（15）** — `pinia`(★R1R2)、`vue`(★R1R2)、`ui-engineering`(★R1)、`vite-patterns`(R1R2)、`vue-router-best-practices`(★R1)、`a11y`(R2)、`monorepo-management`(★)、`patterns`(★)、`premium-frontend-ui`(★)、`typescript-advanced-types`(★)、`unocss`(★)、`vite`(★)、`vue-best-practices`(★)、`vue-patterns`(★)、`vueuse-functions`(★)

**`test`（18）** — `spring-boot-test-patterns`(★R1R2)、`browser-qa`(R1R2)、`gap-audit`(☆R1)、`unit-test-controller-layer`(☆R2)、`unit-test-vue-pinia`(★R2)、`verification-before-completion`(★R2)、`webapp-testing`(R1R2)、`e2e-testing`(R1)、`java-junit`(★)、`playwright-best-practices`(R2)、`scenarios`(☆)、`spring-boot-testing`(☆)、`springboot-verification`(★)、`unit-test-boundary-conditions`(★)、`unit-test-config-properties`(★)、`unit-test-parameterized`(★)、`unit-test-security-authorization`(☆)、`unit-test-service-layer`(★)

**`backend`（16）** — `spring-boot-rest-api-standards`(★R1R2)、`api-design-principles`(☆R2)、`error-handling`(☆R1)、`java-coding-standards`(☆R2)、`spring-boot`(☆R1)、`spring-boot-crud-patterns`(R1R2)、`architecture-patterns`(☆)、`create-spring-boot-java-project`(☆)、`dubbo`(★)、`error-handling-patterns`(☆)、`microservices-patterns`(☆)、`nacos`(★)、`ruoyi-cloud-plus`(★)、`sa-token`(★)、`spring-boot-actuator`(★)、`spring-boot-project-creator`(☆)

**`data`（8）** — `database-migration`(★)、`database-migrations`(★)、`liquibase`(★)、`mysql-patterns`(★)、`quality-frameworks`(☆)、`sql-code-review`(☆)、`sql-optimization-patterns`(☆)、`sql-queries`(★)

**`api`（6）** — `contract-first`(★R1)、`design`(★R1)、`and-interface-design`(★)、`openapi-spec-generation`(★)、`openapi-to-application-code`(☆)、`spring-boot-openapi-documentation`(★)

**`design`（5）** — `accessibility`(R1R2)、`system-patterns`(R1R2)、`interaction-design`(R2)、`system`(R1)、`taste`(★)

**`ops`（5）** — `deployment-patterns`(★)、`docker-patterns`(★)、`k8s-manifest-generator`(★)、`kubernetes-patterns`(★)、`multi-stage-dockerfile`(★)

**`product`（5）** — `create-specification`(R1R2)、`create-prd`(R2)、`job-stories`(R2)、`prd`(R1)、`user-stories`(R1)

**`analytics`（4）** — `ab-test-analysis`(☆)、`cohort-analysis`(☆)、`kpi-dashboard-design`(★)、`metrics-dashboard`(★)

---

## 4. 方案：四档处置

| 档 | 对象 | 处置 | 理由 |
| --- | --- | --- | --- |
| **A** | 82 篇命中过的 | 路由行**留在** `SKILL.md` 主表 | 有实测证据 |
| **B** | 191 篇 0 命中的 | 路由行移入 `skills/<域>/references/INDEX.md`；`SKILL.md` 留一行「其余 N 个主题见 `references/INDEX.md`」 | 文档不删，只把"必付"变"按需" |
| **C** | `design` / `ops` / `product` 三域 | **先补证据再动手**（见 §6） | 命中密度 9–18%，且 `product` 的扁平评估那对从没跑过 |
| **D** | 9 个 description、9 个 agent 正文、273 篇文档本体 | **不动** | 已是最优；文档本体不读不花钱 |

### 在 D 档里唯一要加的东西

把 `teams-chain-eval.md` 验证过的**携带式委派纪律**固化进 9 个 `agents/<域>.md` 正文：

1. 委派时必须把「先读 `agents/<域>.md` + `skills/<域>/SKILL.md` + 按路由表读 1–3 篇 guide」原样带给下游；
2. **每一层必须逐字回报每个下游代理实际读过的文件清单**（run2 的教训：只写区块能保证"读"发生，不能让编排层知道"读了什么"）。

代价约 9 × 300 = 2,700 字符，只在 agent 被调用时付。

---

## 5. 优化前后对比

### 路由表（每域触发时的必付项）

| 域 | 现状 | 优化后(A+索引行) | 省 |
| --- | --: | --: | --: |
| `product` | 7,175 | ~716 | **−6,459** |
| `backend` | 6,544 | ~2,090 | −4,454 |
| `ops` | 4,376 | ~752 | −3,624 |
| `test` | 5,797 | ~2,437 | −3,360 |
| `design` | 3,498 | ~679 | −2,819 |
| `frontend` | 2,467 | ~1,699 | −768 |
| `data` | 1,844 | ~1,129 | −715 |
| `analytics` | 1,236 | ~643 | −593 |
| `api` | 1,199 | ~820 | −379 |
| **合计** | **34,136** | **~10,965** | **−23,171（−68%）** |

### 各层汇总

| 层 | 现状 | 优化后 | 变化 |
| --- | --: | --: | --: |
| 每会话必付（描述） | 2,979 tok | 2,979 tok | 不变 |
| 域触发付（`SKILL.md` 正文） | 9,847 tok | **~4,055 tok** | **−59%** |
| agent 调用付（正文） | 6,240 tok | ~6,915 tok | +675（委派纪律） |
| 文档本体 | 按需 | 按需 | 不变（**一篇不删**） |

一次六阶段全链路里，9 个域技能大致都会触发 → 这一轮就省约 **5,800 tokens 的必付上下文**，折合到 `teams-chain-eval.md` 实测的单步量级，是每次触发链路的净收益。

---

## 6. 必须说清的三件事

1. **0 命中 ≠ 没用。** 12 次任务对 273 篇，样本本来只覆盖得到 30%。所以处置是**降级为按需发现**（可逆、零信息损失），不是删除。真要判定某篇"死掉"，得先有能碰到它的任务。
2. **`product` 域的证据最弱。** 它的 5 篇命中全部来自两轮链路，**扁平评估里那一对（`product-prd`）从没跑过**。它偏偏是路由表最大的域（7,175 字符 / 56 篇）。**在补跑那一对之前，不建议对它做任何裁剪**，§5 表里它的数字只是"如果按同规则处理"的推算。
3. **`design` 是"通用方法类"最集中的域**（28 篇只命中 5）。这和 `teams-eval-report.md` 的主结论一致——讲通用工程方法的技能测不出与 baseline 的差别，讲具体版本坑的才有。它是最该优先人工复审内容的域，但复审的是**内容质量**，不是路由。

---

## 7. 执行顺序

1. 补跑 `product-prd` 一对，补齐 `product` 域证据；
2. 生成 `references/INDEX.md`（9 个），把 191 条 0 命中路由行搬过去，`SKILL.md` 换成一行指路；
3. 把携带式委派纪律写进 9 个 `agents/<域>.md`；
4. 重跑一轮六阶段实测，确认：命中数不掉、盲跑仍为 0、域触发上下文下降；
5. 校验器全绿后再说提交（改动会影响 `plugin.config.ts` 版本号）。

---

## 附：数据来源

| 文件 | 内容 |
| --- | --- |
| `/tmp/evidence-matrix.mjs` / `evidence-matrix.json` | 三源证据矩阵 + 路由表成本核算 |
| `/tmp/teams-eval/hits3.mjs` | 由 10 对扁平评估的 `ANSWER.md` 重建 ★/☆ 归属 |
| `teams-skill-inventory.md` | 273 篇逐篇的 ★/☆ 标注 |
| `teams-chain-eval.md` | 两轮链路的命中与成本实测 |
