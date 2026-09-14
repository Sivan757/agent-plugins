---
name: backend-dubbo
description: "Apache Dubbo 3 在 Spring Boot 3.5 微服务里的使用约定：该引哪个 BOM 与 starter、dubbo.* 配置键与 Nacos 注册中心地址的写法、@DubboService/@DubboReference 与旧注解的关系、api 契约模块该放什么、泛化调用、group/version 三元组身份、以及 timeout/retries/cluster 这三个默认值对写操作的危险性。当新增 Dubbo 服务、消费方报 ClassNotFoundException、启动报 Duplicate Configs、超时重试放大、或要在 Dubbo 与 Triple 协议之间选择时使用。"
---

# Apache Dubbo 3（Spring Boot 3.5 + Nacos）

## 版本与坐标

**给 Spring Boot 3.5 用 Dubbo 3.3.6**：官方在 `dubbo-3.3.6` 的构建基线就是 Spring Boot `3.5.0`。3.2.20 同样被标为生产可用，但它的 JDK 声明只到 8/17。

三个 artifact，用 BOM 统一管版本（groupId `org.apache.dubbo`）：`dubbo-bom`（`import` 进 `dependencyManagement`）、`dubbo-spring-boot-starter`、`dubbo-nacos-spring-boot-starter`。

三个容易踩的坑：

1. **不要写 `dubbo-spring-boot-starter3`。** 官方 starter 列表（中英两版）都列了这个 artifact，但它在 Maven Central 查不到、在 `dubbo-3.3.6` 的仓库树里也不存在——照文档写会直接解析失败。Spring Boot 3 与 Boot 2 **用的是同一个 `dubbo-spring-boot-starter`**，没有 classifier 区分。
2. **`apache/dubbo-spring-boot-project` 仓库对 Dubbo 3 已经过期**（最后版本停在 2.7.9）。Dubbo 3 的 Spring Boot 模块现在在 `apache/dubbo` 仓库里的 `dubbo-spring-boot-project/` 目录下。
3. `dubbo-spring-boot-3-autoconfigure` 的名字比它实际做的事大：它**只负责 Triple-on-Servlet** 的装配，不接管核心自动配置。默认 Netty 模式的 Triple **不需要**它。

## 配置

绑定前缀是 `dubbo`。

```yaml
dubbo:
  application:
    name: <应用名>            # 可省略，默认取 ${spring.application.name}
  protocol:
    name: tri                 # 配置值是 tri，不是 triple
    port: 50051
  registry:
    address: nacos://<host>:8848?namespace=<命名空间ID>
    register-mode: instance   # interface | instance | all
  config-center:
    address: nacos://<host>:8848
```

Nacos 注册中心地址的几种等价写法：`nacos://host:8848`、带查询参数 `?username=…&password=…`、或用户信息内联 `nacos://user:pass@host:8848`，命名空间用 `?namespace=<id>`。Nacos 专属参数既可以写进地址的 query，也可以放进 `dubbo.registry.parameters.<key>`。

**注册模式**：3.x 默认是"双注册"（应用级 + 接口级），所以在 Nacos 控制台会同时看到应用名和接口名。官方给新用户的建议是显式用 `register-mode: instance`（只要应用级）。

**`dubbo.config-center.check` 默认是 `true`**——配置中心连不上会中断启动。注册中心同理必须先于应用起来。

## 注解：推荐与废弃

全部在 `org.apache.dubbo.config.annotation` 包：

| 注解 | 状态 |
| --- | --- |
| `@DubboService` | **推荐**，用它暴露服务 |
| `@DubboReference` | **推荐**，用它引用服务 |
| `@Service` | `@Deprecated`，替代者是 `@DubboService`（3.0 起就废弃了） |
| `@Reference` | `@Deprecated`，替代者是 `@DubboReference` |

旧注解仍然能用（只是标记废弃），但**必须来自 Dubbo 包**。用 `org.springframework.stereotype.Service` 暴露服务是无效的——它只会被当成普通的 Spring bean，不会注册成 Dubbo 服务。

`@EnableDubbo` **必配**，否则注解方式的服务不会被加载。注意它**不在**上面那个包里，而在 `org.apache.dubbo.config.spring.context.annotation`。服务不在启动类同包或子包下时，要用 `@EnableDubbo(scanBasePackages = …)`，等价配置键是 `dubbo.scan.base-packages`。

## api 契约模块该放什么

官方脚手架（`dubbo-samples/11-quickstart`）的形态是：父 pom 聚合 `…-api` 与 `…-service` 两个模块，`api` 模块里**只有服务接口**（以及消费端必须能加载的共享 DTO）。

- **该放**：服务接口 + 共享 DTO。api 模块要 `deploy` 到制品库，消费方才能依赖。
- **不该放**：实现类（实现放在业务模块里，`@DubboService` 打在实现上）、启动类。

这条不是风格偏好，有明确的因果链：**消费端启动时会加载接口类**，api 制品缺失的报错形状是 `IllegalStateException` 且 `Caused by: java.lang.ClassNotFoundException`，栈顶在 `ReferenceConfig.checkAndUpdateSubConfigs`。看到这个栈就该往"打包/依赖缺失"方向查，而不是怀疑注册中心。

（备注：官方样本只演示了"api 只放接口"，**没有**写成"api 不得依赖 Spring、不得放业务代码"这样的成文禁令。不要把它当官方规范引用。）

## 泛化调用

调用方没有服务方 API 时，只要全限定类名 + 方法名即可：把引用的 `generic` 置为真，接口用 `org.apache.dubbo.rpc.service.GenericService`，通过 `$invoke(方法名, 参数类型数组, 参数值数组)` 调用。

`generic` 的合法取值有多个（`true`、`nativejava`、`gson`、`bean`、`raw.return`、`protobuf-json`），不是简单的布尔。

三条要记住的约束：

1. **3.3 起官方改口**：泛化调用适合较老版本的 Dubbo 通信协议；**用 3.3 及以后的 Triple 协议，官方建议改用 HTTP + `application/json` 的能力**，而不是泛化。
2. 泛化调用同样受序列化安全检查管辖。
3. 泛化会**跳过类与方法校验**——所以"方法配置写错却没人报错"在泛化模式下是预期行为，不要据此判定配置正确。

另有一个易混淆的对称概念：消费端泛化调用（`GenericService`）与**服务端泛化实现**是两回事。

## 三个危险的默认值（对写操作尤其要紧）

| 项 | 键 | 默认 | 危险在哪 |
| --- | --- | --- | --- |
| 超时 | `dubbo.provider/consumer.timeout`、`@DubboReference(timeout=…)` | **1000 ms** | 正常业务只要超过 1 秒就会超时，并被重试放大 |
| 重试 | `…retries` | **2**（不含首次，即最多调用 3 次） | 与 failover 叠加后，失败的调用会换服务器再打 |
| 集群容错 | `dubbo.provider/consumer.cluster` | **failover** | 官方对 failover 的定性是"通常用于**读**操作" |

**三者叠加的后果**：非幂等的写操作（下单、扣款、发消息）在超时后被重试最多 3 次，可能**重复执行**。官方对非幂等写的推荐是 `failfast`。

超时优先级：`method > service > global > default`。

另有一条默认关闭、但长链路必须评估的机制：**deadline 级联取消默认是关的**。不开的话，即使调用方 A 已经超时，A→B→C→D 整条链仍会完整跑完。开启键是 `parameters.enable-timeout-countdown: true`。

**消费端 `check` 默认会做存在性校验**，提供者没就绪时消费端**启动即失败**（快速失败，不是等到调用时才报）。

负载均衡可选值：`random`（默认，加权随机）、`roundrobin`、`leastactive`、`consistenthash`、`shortestresponse`、`adaptive`。
⚠ 文档把 `p2c` 列成一个可配置值，但 3.3.6 与 3.2.20 的源码与 SPI 里**都没有这个实现**（只有 `adaptive`，文档描述它基于 P2C 算法）。**配 `p2c` 在当前版本不生效。**

## 服务身份：interface + group + version

一个接口**不足以**唯一标识一个服务——身份是 `接口 + group + version` 三元组。

注解侧是 `@DubboService(group = …, version = …)` / `@DubboReference(group = …, version = …)`，配置键是 `dubbo.provider.group` / `.version`。

两者都支持通配 `*`；聚合多组结果用 `merger = true` 配合 `group = "*"` 或列多组，并且支持方法级覆盖。

多版本灰度的官方顺序是：低峰期先升级**一半**提供者 → 全量消费者 → 剩余一半提供者。

## 失败模式与日志签名

| 日志/异常 | 原因与处置 |
| --- | --- |
| `There's no ApplicationConfig specified.` | 没配应用名，设 `dubbo.application.name` |
| `Duplicate Configs found for ApplicationConfig … According to config mode [STRICT]` | 同一配置来源重复定义；官方明说这是 **3.x 新增的检查行为**，默认 `strict`，可用 `dubbo.config.mode=OVERRIDE\|IGNORE` 调整 |
| `IllegalStateException` + `Caused by: ClassNotFoundException`，栈顶 `ReferenceConfig.checkAndUpdateSubConfigs` | 接口类不在消费端，查 api 制品是否发布/被依赖 |
| `Found invalid method config, the interface … not found method "x"` | 方法配置指向了不存在的方法；泛化模式下**不会**报这个错 |
| `Fail to start server(url: dubbo://…:20880/…)` + `BindException: Address already in use` | 端口冲突；`dubbo.protocol.port=-1` 可从默认端口递增找可用端口 |
| `[Serialization Security] Serialized class … has not implement Serializable interface. Current mode is strict check` | 序列化安全检查，3.1 默认 WARN、**3.2 起默认 STRICT**；键 `dubbo.application.serialize-check-status`。序列化协议由**提供端**注册配置决定，两端版本不一致会导致客户端序列化失败；3.2.0 起才有 `prefer-serialization` 协商，且要求两端都 ≥3.2.x |
| 消费端启动失败（`check`） | 提供者未就绪；这是默认的快速失败行为 |
| 服务发现了但调不通 | 3.x 默认双注册，注意订阅迁移态 `AF/FA/FI` 与 `APPLICATION_FIRST` 的差异 |

**在线诊断**：QoS 默认开启，端口 **22222**。可用 `getConfig`、`ls`、`getAddress <svc>`，以及路由快照 `enableRouterSnapshot` / `getRecentRouterSnapshot`——官方警告路由快照会**降低性能**，用完要 `disableRouterSnapshot`。
端口速查：dubbo **20880** / triple **50051** / QoS **22222**。

## 协议：Triple 是官方推荐

官方对 Triple 的定位是"最均衡的实现、官方推荐"，并明确建议**新用户从一开始就显式配置使用 Triple**。3.3 起 Triple 还具备了 REST 发布能力。

```yaml
dubbo:
  protocol:
    name: tri        # 注意配置值是 tri
    port: 50051
```

用 Triple 会改变前面这些结论：

- 默认端口从 20880 变成 **50051**，协议名是 `tri`。
- 传输层是 HTTP/1、HTTP/2，**100% 兼容 gRPC**，多语言与网关支持明显更好。
- **默认序列化不同**：dubbo 协议有默认序列化（Hessian），Triple 用 Protobuf Binary / Protobuf JSON 且**没有默认**。
- 服务定义可以是 Java 接口，也可以是 **Protobuf IDL**。
- 泛化调用在这条路上不再是推荐做法（见上文，改用 HTTP + JSON）。
- 序列化安全性上 Protobuf 最好。

在 Spring Boot 3 的 **Servlet 容器**里跑 Triple 需要额外引入 `dubbo-spring-boot-3-autoconfigure`，并设置 `dubbo.protocol.triple.servlet.enabled=true`（另有 `filter-url-patterns`、`filter-order`、`max-concurrent-streams`）。默认 Netty 模式不需要它。

快速自测：直接对 Triple 端口发一个 JSON POST，例如
`curl -H "Content-Type: application/json" --data '["Dubbo"]' http://<host>:50051/<接口全名>/sayHello/`

## 默认值速查

| 键 | 默认 |
| --- | --- |
| `dubbo.protocol.name` | `dubbo`（dubbo 协议端口 20880） |
| `dubbo.provider/consumer.timeout` | `1000`（毫秒） |
| `…retries` | `2` |
| `…cluster` | `failover` |
| `…loadbalance` | `random` |
| `dubbo.config-center.check` | `true` |
| `dubbo.registry.namingLoadCacheAtStart` | `true`（消费端有本地缓存兜底） |
| `dubbo.registry.register-consumer-url` | `false` |
