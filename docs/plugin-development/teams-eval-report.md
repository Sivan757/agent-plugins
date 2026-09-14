# teams 插件有用性评估

评估日期 2026-09-13。方法沿用 `skill-creator` 的对照循环：同一批真实任务，跑 **with-skills** 与 **baseline（不给技能库）** 两路，按预先写好的断言评分，再读实际产物做定性判断。

> 本文件测的是**技能内容**，且跑的是域化重构**之前**的扁平形态。域化之后的全链路实测（含路由是否有效、技能加载与否的代价差）见 `teams-chain-eval.md`。

## 结论摘要

**十对完整对照，机械断言完全相同：两侧都是 63/70。定性看，技能库的增益是不均匀的——有几对明显更好，也有几对 baseline 至少同样好。**

- 没有任何一对是"baseline 显著更差"。
- 技能库真正体现出价值的地方，**集中在"静默失败"和"只在新版本成立"的具体细节上**，而不是让模型学会做原本不会做的事。
- 那条准入门槛（"只告诉模型做它本来就会做的事的提交不予采纳"）在本项目上被反复触发：**强模型自己就会去读源码、跑验证**。

**所以正确的读法不是"插件没用"，而是"它的价值只存在于那些不查就会踩的坑里"。** 这对裁剪有直接指导意义：留讲具体坑的，裁讲通用方法的。

---

## 1. 任务设计

11 个任务，覆盖 10 个技术域，全部锚在同一个真实项目上（只读），且都要求先读真实代码再作答：

| 任务 | 域 | 检验的技能来源 |
| --- | --- | --- |
| 前端 MPA 新增订单列表页 | frontend | 采纳层 |
| 新增 Dubbo 服务 | backend | **自建 `backend-dubbo`** |
| 写 Liquibase changeset | data | **自建 `data-liquibase`** |
| 写 JUnit 5 单元测试 | test | 采纳层 |
| 多阶段 Dockerfile + K8s 清单 | ops | 采纳层 |
| 写 OpenAPI 3.1 描述 | api | 采纳层 |
| 写 PRD | product | 采纳层 |
| 指标口径与取数 SQL | analytics | 采纳层 |
| Nacos 运行时可调配置 | backend | **自建 `backend-nacos`** |
| 免登录回调接口被拦 | backend | **自建 `backend-sa-token`** |
| 新增一个可独立启动的服务模块 | backend | **自建 `backend-ruoyi-cloud-plus`** |

共 70 条断言，按"可机械判定"的标准写。with-skills 那一路被告知技能库路径，并被要求**列出它实际读了并采用的技能**——这是裁剪用的归因信号。

**五条自建技能全部被覆盖到了。**

---

## 2. 结果

### 2.1 完成情况

11 个任务里 **10 对完整跑完**（with 与 baseline 两侧都产出了说明文件）。唯一缺的是 `product-prd`，两侧都还空着。

### 2.2 断言得分

| 任务 | with-skills | baseline |
| --- | :-: | :-: |
| frontend-mpa-page | 7/7 | 7/7 |
| backend-dubbo-service | 6/6 | 6/6 |
| data-liquibase-changeset | 6/6 | 6/6 |
| test-junit-service | 5/5 | 5/5 |
| ops-docker-k8s | 7/7 | 7/7 |
| api-openapi | 5/6 | 5/6 |
| product-prd | —（未跑） | —（未跑） |
| analytics-metric-sql | 6/6 | 6/6 |
| nacos-config-refresh | 7/7 | 7/7 |
| sa-token-endpoint-release | 6/6 | 6/6 |
| ruoyi-new-module | 8/8 | 8/8 |
| **合计** | **63/70** | **63/70** |

**断言分完全相同**，包括唯一那条两侧都没过的（`api-openapi` 的"使用 components/schemas"——实测是断言的文本邻近度过窄，两侧的 YAML 都用了 `$ref`）。

### 2.3 定性：逐对看谁做得更多

断言测不出差别，所以下面全部来自读产物。

**技能库明显更深的（5 对）**

| 任务 | 技能库带来的具体差别 |
| --- | --- |
| `ops-docker-k8s` | **规避了 `--launcher` 陷阱**——上一版（4.1）正是死在这里；另发现"同一镜像被 tag 进生产、dev profile 把 dev Nacos 地址过滤进了 `application.yml`"。并用项目真实 jar 跑通 `jarmode=tools extract --layers` 并实际启动，`ClassNotFoundException`/`NoDefFoundError` 计数为 0 |
| `test-junit-service` | 52 个用例（baseline 34），多发现两处**安全相关**问题：`PageQuery.build()` 对 `pageSize` 无下限保护（`pageSize=-1` 绕过 MyBatis-Plus 分页，等于不限行数）；Dubbo provider 路径缺租户谓词、可能跨租户读订单 |
| `data-liquibase-changeset` | 在 H2（MySQL 模式）**真跑通 update → rollback-count 2 → 重放**，并复现 checksum 校验失败、实测 `<validCheckSum>` 与 `MD5SUM=NULL` 两种补救；指出 includeAll 是字符串字典序、必须等宽编号 |
| `nacos-config-refresh` | 把两个**静默陷阱写成规则**：`namespace` 填的是 ID 不是显示名；dataId 取 `nacos:` 后那段字面量。还用 `javap` 反编译确认刷新链路，并指出成功刷新**不产生任何 INFO 日志**（不能拿日志当证据） |
| `frontend-mpa-page` | 真实 `vite build`（exit 0）+ 29 项 store 行为自检；并**主动否决**了 `frontend-vueuse-functions` 的建议（其主张的 `useInfiniteScroll` 与项目 Vant 加载态互斥） |

**baseline 至少同样好的（3 对）——这部分必须说清楚，否则就是自欺**

| 任务 | 情况 |
| --- | --- |
| `sa-token-endpoint-release` | baseline 20.4 KB / 3 文件（含可直接跑的 6 向 curl 探测脚本、可粘贴的 Nacos 片段），with-skills 11.1 KB / 2 文件。baseline 还多找到一个陷阱：仓库里的 `script/config/nacos/gw.yml` 是历史副本、路由里没有 `/order/**`，改它完全无效 |
| `ruoyi-new-module` | baseline 509 行 + 11 个文件，with-skills 384 行 + 1 个文件。baseline 多找到：Maven 资源过滤只覆盖 `application*`/`bootstrap*`/`logback*`（所以模块不进聚合 pom 就跳过过滤，`@nacos.server@` 会字面量进运行时——正是"本地能起、网关找不到"的根因）、端口实测冲突表、网关 discovery locator 的行为特征、菜单 SQL 放 `zealwon-system` 的三个先例 |
| `api-openapi` | 两侧断言同级、产物规模相近；两侧都用 `@redocly/cli lint` 校验通过 |

**基本打平的（2 对）**：`analytics-metric-sql`（两侧都自己发现题面字段名是错的，都做了实测）、`backend-dubbo-service`。

### 2.4 一个反向发现：自建技能被用来自查，并纠正了我

`backend-dubbo-service` 与 `ruoyi-new-module` 两对里，with-skills 都**主动指出了我自建技能与实际不符的地方**：

1. **`backend-ruoyi-cloud-plus` 说"2.X 不使用 `IService`/`ServiceImpl`"——而本 fork 在用。** 这句话对**上游 2.X 是对的**（核验时逐一读过上游源码），错的是被套用到 fork 上。技能已写明"本技能描述上游约定，fork 改过就以项目自己的说明为准"，所以是**警告生效了**。但代价真实：对这支团队来说，这条最显眼的建议恰好是反的。这是 B1（插件是公共抽象层、不针对具体项目）的必然代价。
2. **`data-liquibase` 之外的推断偏差**：fork 自加了 Liquibase（上游 2.X 用手工 SQL），且 `liquibase.enabled=true` 只配在 Nacos、不在仓库任何 yml 里——漏了表不建且**零报错**。
3. 项目 `AGENTS.md` 写"Dubbo Triple 协议"，实际配置是 `dubbo.protocol.name: dubbo`（Hessian）。

**这三条都被写进了对应任务的产物里**，说明技能不只是被照抄，而是被当成了可以质疑的参照。

### 2.5 归因：技能库里有多少被真正用到

把十次 with-skills 运行自报的"实际采用的技能"汇总去重，**约 45 条**（另有若干是项目自身模块名，已剔除）。可读出的现象：

- 各域用的都是本域那几族（前端 `frontend-vue*`/`frontend-pinia`/`frontend-vite`；后端 `backend-dubbo`/`backend-nacos`/`backend-ruoyi-cloud-plus`/`backend-sa-token`；测试 `test-java-junit`/`test-unit-test-*`；运维 `ops-multi-stage-dockerfile`/`ops-k8s-manifest-generator`/`ops-kubernetes-patterns`；数据 `data-liquibase`；API `api-openapi-spec-generation`/`api-design`）。
- **五条自建技能全部被读到并采用。**
- 运行会**主动否决**不合适的技能，而不是照搬（前端否决了 `frontend-vueuse-functions`，Liquibase 一路否决了两条 ORM 场景的 `data-database-migration*`）。**这种"读了但不采"的记录本身就是选材质量的信号。**
- 364 条里被碰过的约 45 条，**约 12%**。

---

## 3. 这轮评估没能回答的问题

- `product-prd` 一对两侧都没跑完；`product-` 域因此完全没有证据。
- 断言是机械的，**它证明不了产物更好**——十对断言分完全相同，差别全靠人读产物判断；样本量小，且**没有做盲评**（`skill-creator` 的比较器代理未启用）。
- 所有测试都在 `/tmp` 里跑，**没有对任何真实环境做过验证**：`docker build`、`kubectl apply`、真实 MySQL/Nacos 上的迁移与刷新、真机浏览器交互，全部未执行。
- 没有测"长期影响"：技能库是否会改变模型处理**同一类问题**的默认做法，本轮的单次任务看不出。

---

## 4. 限制与失败原因（如实记录）

- **并发过载导致大批失败。** 本轮一度同时启动 22 个子代理（5 个官方文档事实核验 + 1 个检索 + 16 次评估运行），其中 16 个被中断。降到每批 2–4 个之后稳定。
- 三条事实核验（RuoYi / Sa-Token / Dubbo）是靠 `send_message` 恢复后补完的；**没有任何一条以"编造结论"收场**——恢复后所有报告都带证据并显式列出"无法判定"项。
- **评分脚本产生过一次假失败。** 我在某一对还没写出说明文件时跑了一次评分，之后没及时重跑，留下陈旧的 `grading.json`，一度显示成"Liquibase 那对 with-skills 3/6、baseline 6/6"。核对发现答案完整且正确，是评分结果过期。**教训：定量结果必须在产物定稿后重算，否则会把"没跑完"误读成"做得差"。**
- **断言本身有假失败。** 至少两条写得过窄：要求 `includeAll` 与"字典序/排序"在 500 字内共现（答案用的是"按字符串比大小"）；要求 `components:` 与 `schemas:` 在 200 字内共现。这类断言会**系统性惩罚"正确但措辞与我预期不同"的产物**。已修第一条。
- 参考工作区全程只读，且**已验证**：评估前后对 `zealwon` 的 git status 快照逐字节相同（49 行），`projects/yunlian` 下最近 6 小时内被修改的文件数为 0。
- 两次子代理报告披露创建了工作区之外的临时文件（`/tmp/x1`、`/tmp/x`），均在 `/tmp` 下，未触碰任何仓库或工作区。

---

## 5. 结论与建议

1. **技能库的价值是真实的，但窄。** 十对断言打平；差异集中在"不查就会踩的静默坑"。典型的五个：`--launcher`（镜像里没有 `JarLauncher`）、`pageSize=-1` 绕过分页、`namespace` 填 ID 而非显示名、includeAll 字符串序、`check-same-token` 让网关白名单管不到服务侧。
2. **裁剪方向应当是"留坑、裁方法"。** 讲通用工程方法的（大量 `delivery-*`、`product-*`、`design-*`、部分 `*-patterns`）在本轮没有显示出与 baseline 的差别；讲某个具体版本下会静默失败的知识的，显示出差别。
3. **补最后一对 `product-prd`**，让十个域都有证据。每批不超过 2–3 个并发。
4. **换判据再测一轮。** 断言分已经证明是无效指标。可判别的判据应当是：是否发现了 baseline 没发现的问题、产物是否能直接用、是否复现了失败并验证了修复。
5. **元数据成本是裁剪时的量化约束**：364 条 `description` 合计约 9.6 万字符（≈ 2.4 万 tokens），每次加载本插件的会话都要付；而十次任务合计只碰到约 45 条（约 12%）。
6. **超大正文应当拆分**：`test-quality-playbook/SKILL.md`（294 KB / 2738 行）与另外几十条 20 KB 以上的技能，触发时会显著挤占上下文。拆成 `SKILL.md` + `references/` 属于改写采纳内容，超出"逐字采纳"的边界，本轮没做，**需要明确授权**。
7. **一条待决定的替换**：见 `teams-search-log.md` §9.2——sa-token / dubbo / liquibase 在 GitHub 上其实有外部技能，按 R2 应当与已自建的五条做对照，决定替换还是并存。本轮只记录了候选，没有替换。
8. **一处实测代价**：`backend-ruoyi-cloud-plus` 里"2.X 不用 `ServiceImpl`"对上游成立、对本 fork 反了。**公共抽象层与"团队当下一用就对"之间存在真实张力**——若你更看重后者，就需要允许插件承载少量团队约定（那会触及 B1）。
