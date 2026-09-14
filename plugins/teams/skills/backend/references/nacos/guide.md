---
name: backend-nacos
description: "Nacos 作为注册中心与配置中心的使用约定：Spring Cloud Alibaba 版本对齐、namespace/group/dataId 三层模型、Spring Boot 3.x 下强制的 spring.config.import（以及 dataId 到底取哪一段字面量）、配置刷新语义、服务发现与健康/权重/保护阈值、鉴权开关的真实默认值、本地快照与故障转移。当在 Spring Boot 3.5 项目里接 Nacos、出现「配置没被读到」「服务注册不上或查不到」「改了配置不刷新」「启动即失败」这类问题时使用。"
---

# Nacos（注册中心 + 配置中心）

## 版本对齐：先选对 Spring Cloud Alibaba 版本

Nacos 的绝大多数"配了不生效"最终都追到版本错配上，所以先定这一条。

官方兼容矩阵里，**Spring Boot 3.5 对应 Spring Cloud Alibaba `2025.0.0.0`**（该行同时给出 Spring Cloud `2025.0.0` 与 Nacos 客户端 `3.0.3`）。

规律是 **SCA 的次版本号编码了 Spring Boot 的次版本**：`2023.x` → Boot 3.2，`2025.x` → Boot 3.5，`2025.1.x` → Boot 4.0。

**最容易踩的一条：`2025.1.0.0` 不是给 Boot 3.5 用的**，它面向 Boot 4.0。选它会以各种看不懂的方式失败。

只固定 **一个** SCA 版本，其余（`nacos-client`、Spring Cloud 线）交给它自己的 BOM 管理——不要手写 `nacos-client` 版本。

坐标（groupId `com.alibaba.cloud`，版本由 BOM 管）：
`spring-cloud-starter-alibaba-nacos-discovery`、`spring-cloud-starter-alibaba-nacos-config`，BOM 是 `spring-cloud-alibaba-dependencies`。

## 三层身份模型

- 配置：`namespaceId → groupName → dataId`
- 服务：`namespaceId → groupName → serviceName → clusterName → instance`

默认值：`namespaceId` = `public`，`groupName` = `DEFAULT_GROUP`，`clusterName` = `DEFAULT`。

**环境隔离用 namespace**：官方明确要求"用命名空间隔离环境、租户或业务域；生产环境避免把测试与生产资源放在同一命名空间"；逻辑隔离用 namespace，物理隔离才部署多套。
Group 是用来做**同一命名空间内的业务分组**的（按应用、业务线等）。旧文档里也出现过"按环境分组"的说法，3.x 的规范表述里也有"环境内分组"这一层含义，但**环境边界的标准机制是 namespace**——把 group 当环境边界属于团队选择，不要当框架推荐来推理。

### 最容易搞错的几点

1. **`namespace` 填的是 namespace 的 ID，不是控制台显示的名字。** 这是两个不同的字段：ID 不可修改，长度 ≤64，只允许字母/数字/下划线/连字符；名字（`namespaceShowName`）是可改的展示标签，长度 ≤256。填名字会静默落到别的（或默认）命名空间。
2. **3.x 把默认命名空间 ID 从空字符串改成了 `public`**（2.x 的默认是 `""`）。3.0 的客户端默认用 `public`，因此在默认命名空间下**与更早的服务端不兼容**。Nacos 3.0 还把配置中心的"空命名空间"与 `public` 做了统一，原先 `namespaceId=""` 下的配置迁移到了 `namespaceId="public"`，并提供一个默认开启的兼容模式做双向同步。
   → **永远不要写 `namespace: ""`**；用真正的 ID。
3. **由 1、2 派生出的硬约束**：SCA 2025.0.x 在使用 `public` 或空串 id 命名空间时要求 **Nacos Server 3.x**。升级/迁移时这一条会导致"明明配了却读不到"。
4. **命名空间是硬隔离边界**：一个客户端实例只能访问同一命名空间内的配置与服务，**跨命名空间运行期发现做不到**，跨命名空间操作属于管理面（Admin API / 控制台）能力。所以"服务在 A 命名空间能否发现 B 命名空间的服务"答案是**不能**。

## 配置中心：`spring.config.import` 是强制的

在 SCA 2025.x 上，**必须**用 `spring.config.import` 导入 Nacos 配置。这是破坏性变更，也是当前最高频的失败原因。

```yaml
spring:
  config:
    import:
      - optional:nacos:app.yml                          # 带 optional：拉不到也能启动
      - optional:nacos:app.yml?group=biz                 # 指定 group
      - optional:nacos:app.yml?refreshEnabled=false      # 单独关掉这条的自动刷新
      - nacos:required.yml                               # 不带 optional：拉不到直接启动失败
```

- **不带 `optional:` 是 fail-fast**：拉配置异常会让 Spring 容器起不来。生产环境通常要显式决定每条导入是 fail-fast 还是可降级。
- 如果 starter 在场但没有 `nacos:` 导入项，启动会以一条明确的信息失败，提示缺 `nacos:` 条目；官方提供了 `spring.cloud.nacos.config.import-check.enabled=false` 来关掉这个检查，并明确写着**不推荐**。

### dataId 到底取哪一段（这是陷阱）

在 SCA 2025.0.x 的实现里，**dataId 就是 `nacos:` 后面那段字面量**，不是按名字算出来的：

- `dataId` = `nacos:` 之后的单个路径段；含路径分隔符会直接抛 `illegal dataId`，为空抛 `dataId must be specified`。
- 扩展名取该 dataId 自带的扩展名；**dataId 没有点号时才回退**到 `spring.cloud.nacos.config.file-extension`（默认 `properties`）。扩展名决定内容怎么被解析。
- `group` 取导入项上的查询参数，否则回退到 `spring.cloud.nacos.config.group`。
- 刷新开关取 `refreshEnabled` 查询参数，否则回退到 `spring.cloud.nacos.config.refresh-enabled`。

而 Nacos 侧生态文档里仍然写着经典规则 `${prefix}-${spring.profiles.active}.${file-extension}`（`prefix` 默认取 `spring.application.name`，profile 为空时连字符一并去掉）。

**两套心智模型都在文档里，但只有前者在 SCA 2025.0.x 上生效。** 如果你按 `${应用名}-${profile}.yml` 去推 dataId，而实际导入项写的是别的字面量，结果就是"配置存在但读不到"，且不报错。

相关废弃项：`shared-configs`、`extension-configs` 以及"按应用名隐式加载"自 2023.0.1.3 起已废弃——看着对但在 2025.x 上不会被加载。`bootstrap.yml` / `bootstrap.properties` 从 2025.1.x 起不再支持。

### 连接配置键

`spring.cloud.nacos.config.server-addr`、`.namespace`、`.group`（默认 `DEFAULT_GROUP`）、`.prefix`、`.file-extension`（默认 `properties`）、`.refresh-enabled`（默认 `true`）、`.encode`、`.timeout`、`.cluster-name`、`.context-path`，凭据 `.username` / `.password`（另有全局回退 `spring.cloud.nacos.username/password`）。

属性绑定是 camelCase 字段，Spring Boot 的宽松绑定让 `server-addr` 与 `serverAddr` 都可用。

## 配置刷新

- 总开关 `spring.cloud.nacos.config.refresh-enabled`（默认 `true`），可按导入项用 `refreshEnabled` 覆盖。
- 机制是 `@RefreshScope`：官方示例就是 `@RefreshScope` 的 bean 配合 `@Value`，值变化无需重启。
- **推送不等于内容**：服务端只推"这条配置可能变了"的通知，客户端要**再查一次**内容。`md5` 才是内容版本。把通知当内容处理是错的。
- 官方明确警告回调要处理**失败、重复通知、解析错误**。
- ⚠ `@ConfigurationProperties` 的确切刷新语义（哪些 bean 会重绑定、哪些不会）**在官方文档里没有明确说明**。不要凭印象断言；需要结论时应回到 Spring Cloud Commons 的刷新契约去确认，而不是从 Nacos 文档推断。
- 健康指示器 `spring.cloud.nacos.config.health-indicator.enabled` 自 2025.0.x 起**默认 false**，官方强烈建议保持关闭：如果把它挂在 Kubernetes 的 liveness 探针上，一次网络抖动会报 DOWN 并**批量重启 Pod，可能引发级联故障**。

## 服务发现

主要键与默认值：`spring.cloud.nacos.discovery.server-addr`（无默认）、`.service`（默认 `${spring.application.name}`）、`.namespace`、`.group`（`DEFAULT_GROUP`）、`.weight`（`1`，取值 1–100）、`.metadata`、`.cluster-name`（`DEFAULT`）、`.register-enabled`（`true`）、`.fail-fast`（`true`）、`.watch.enabled`（`false`）、`.health-indicator.enabled`（`false`）。
客户端负载均衡集成开关 `spring.cloud.loadbalancer.nacos.enabled` 默认 `false`，官方示例显式打开。

几条会误导排查的语义：

- **不要把环境、版本、地域等信息写进服务名**——官方明确建议这类信息放命名空间、group、cluster 或 metadata。另外服务名在 Nacos API 层是**必填且无默认值**的；"默认取 `spring.application.name`"是 Spring Cloud Alibaba **starter** 的行为，不是 Nacos 本身的默认，两者不要混为一谈。
- **`healthy` 与 `enabled` 是两回事**：`healthy` 是 Nacos 的健康判定；`enabled` 是"是否允许接收发现流量"。实例存在但查不到时，先看 `enabled`、健康、集群过滤与保护阈值，而不是只看服务端列表。
- **权重不保证生效**：Nacos 会存储并返回权重，但"不保证每个消费者都按权重负载均衡"，最终行为取决于客户端或上层框架；运行期选择通常忽略 `weight <= 0`。
- **保护阈值会把不健康实例当健康返回**：这是可用性保护机制，`healthy` 在这种视图下不代表真的健康。查不到健康实例要先问"为什么健康实例掉了"。
- **元数据分两层且优先级不同**：运行期元数据（注册/续约时提交）较低，运维元数据（控制台 / Admin API）较高，键冲突时发现视图返回后者。
- 发现结果是过滤后的"发现视图"，与管控页面显示的全量列表**可能不同**。
- 临时实例与持久化实例是 **Service 级**语义，不能在同一 Service 身份下混用。
- 集群模式下**机器时钟要一致**，否则数据同步异常。

## 鉴权：默认值容易被讲反

Nacos 3.x 的默认状态是**分裂**的，这点经常被说错：

| 项 | 默认 |
| --- | --- |
| `nacos.core.auth.enabled`（SDK / OpenAPI / gRPC） | **`false`** |
| `nacos.core.auth.admin.enabled` | `true` |
| `nacos.core.auth.console.enabled` | `true` |

即 **控制台与 Admin API 默认要登录，而 SDK/开放接口默认不校验**。

> ⚠ **官方鉴权文档自己的表格把 `nacos.core.auth.enabled` 写成了 `true`，与它自己发布的配置文件和服务端代码都不一致。** 这一条以**发布的 `application.properties` 与源码**为准，不要以那张表为准。

其他要点：

- 开启鉴权要同时设 system.type、enabled、admin.enabled、console.enabled、`server.identity.key/value`、`plugin.nacos.token.secret.key`；**集群内每个节点必须用同一套 identity 与 secret**。
- **token secret 必须是 Base64，且解码后 ≥ 32 字节**，否则 JWT 报错。自 2.2.0.1 起社区版**不再内置默认 secret**，必须自己提供。
- 键名 `default.token.secret.key` → `plugin.nacos.token.secret.key` 是 **2.1.0** 的改名，不是 3.x 的变化。
- 3.2.4 起 `server.identity.key/value` 即使 `enabled=false` **也是必需的**（节点间 gRPC 鉴权用）。
- 自 2.4.0 起**不再有默认的 `nacos`/`nacos` 口令**，首次启用后要初始化管理员密码（旧口令只适用于 ≤2.3.x）。
- 客户端凭据：`spring.cloud.nacos.username/password` 为全局，`.config.` / `.discovery.` 下为分模块。
- 官方对风险的定调：Nacos 是内部组件，**必须跑在可信内网，不要暴露到公网**；官方自称其鉴权是"弱鉴权系统，用来防误用，不是用来抵抗恶意攻击的"；控制台鉴权在生产**不要关**。
  （注：官方**没有**一句话直接说 `nacos.core.auth.enabled=false` 本身有多大风险——这条不要替它下结论。）

## 本地快照与故障转移（"服务端明明是新的"）

客户端会回落本地磁盘：

- 配置快照：`${JM.SNAPSHOT.PATH:-${user.home}}/nacos/config`，快照开关默认开；失败转移数据在 `data/config-data` 下。
- 服务发现失败转移：`{user.home}/nacos/naming/{namespace}/failover`，靠一个特定命名的开关文件启用。
- 快照是**兜底，不是权威**。排查"本地与服务端内容不一致"时必须**同时看服务端配置、客户端快照、本地 failover 文件**。
- 服务端的本地 dump 同样只是缓存：**数据库/内嵌存储才是权威**。
- 多节点还有一个"写一个节点，其他节点要等本地 dump 完成才更新运行期视图"的滞后——症状是**只有部分节点返回旧内容**。
- 故障转移是应急手段：官方口径是升级/接口异常时让客户端只用本地数据，**恢复并校验后要关掉**。

## 运营：回滚是"再发布一次历史版本"

- 配置的发布、删除、灰度发布、灰度删除都进历史。
- **回滚做法：先看历史内容，然后把它作为正式配置再发布一次。不要把本地 dump 当回滚来源。**
- 历史保留天数 `nacos.config.retention.days` 默认 30；单条配置内容默认上限 100 KiB，超了发布会失败。
- **灰度发布是官方给出的降低生产风险的主要手段**：身份延伸到 `… → grayName`，内置 Beta（按 ClientIp）与 Tag（`tag_{tag}`）两种规则，默认最多 10 个灰度版本。运行期查询**先算灰度规则再回退正式配置**。
- 灰度有个坑：请求显式指定了 tag 但没有匹配的灰度版本时，会返回**该 tag 专属的 not-found**，而不是回退。
- 官方给的生产建议：高风险变更先灰度；重要配置留变更说明与审批记录；**业务应用通常不应负责发布配置**（减少误发、权限滥用与批量误操作）。

## 症状 → 先查什么

| 症状 | 先查 |
| --- | --- |
| 启动即失败，提示缺 `nacos:` 条目 | 有没有写 `spring.config.import` |
| 配置存在但读不到 | dataId 是不是取错了字面量；group 有没有漂移；namespace 填的是 ID 还是名字；是不是还在用 `shared-configs`/`extension-configs` |
| 配置内容解析异常 | dataId 的扩展名与实际内容格式是否一致 |
| 改了配置不刷新 | `refresh-enabled` / `refreshEnabled`；bean 是否 `@RefreshScope`；收到通知后是否**重新查询**了内容 |
| 本地与服务端内容不一致 | 客户端快照、本地 failover 文件、服务端多节点 dump 滞后 |
| 实例存在但消费者查不到 | `enabled`、健康状态、集群过滤、保护阈值 |
| 权重配了不生效 | 官方本就不保证客户端按权重负载均衡 |
| 只有部分节点返回旧配置 | 多节点 dump 滞后，不是配置没发布 |
| 鉴权相关 403 | 集群内 identity / token secret 是否一致；secret 解码后是否 ≥32 字节 |
| 健康检查导致 Pod 批量重启 | 是不是把 Nacos 健康指示器接到了 liveness 探针上 |
