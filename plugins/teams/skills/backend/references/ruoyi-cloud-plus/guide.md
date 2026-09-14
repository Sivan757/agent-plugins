---
name: backend-ruoyi-cloud-plus
description: "RuoYi-Cloud-Plus 2.X 后端开发约定：顶层模块布局、新增 Maven 模块的完整注册步骤（含最容易漏掉的 BOM 登记）、包命名、MyBatis-Plus 的 BaseMapperPlus 分页模式、多租户 TenantHelper 的开关与忽略方式、异常与响应体、Nacos 配置与网关放行。当在 RuoYi-Cloud-Plus 2.X（Java 17 + Spring Boot 3.5）项目里新增模块、写 Service/Mapper、处理租户隔离、排查 mapper 扫描不到或启动报错时使用。注意：6.X 分支是另一套技术栈，本技能的每一条都只对 2.X 成立。"
---

# RuoYi-Cloud-Plus 2.X 开发约定

## 先确认分支，否则后面全错

RuoYi-Cloud-Plus 的默认分支是 **`6.X`**，不是 2.X。两个分支是两套技术栈：

| | 2.X | 6.X（仓库默认） |
| --- | --- | --- |
| 版本 | 2.6.x | 6.0.x |
| Java | 17 | 21 |
| Spring Boot | 3.5.x | 4.1.x |
| 多租户 | 有（`ruoyi-common-tenant`） | **已移除** |
| MVC 网关 | 有 `ruoyi-gateway-mvc` | 无 |
| 官方文档目录 | 站点 `5.X/` 下（页面自述 2.6.1 / Boot 3.5 / JDK 17） | 站点 `6.X/` |

用任何一条约定之前先确认它在哪个分支上成立。**把 6.X 的写法套到 2.X（或反过来）是这个框架上最容易犯、也最难排查的错误来源。**

文档站默认展示 6.X；2.X 的页面要显式走 `/5.X/` 路径。

> 本技能描述的是**上游 2.X 的约定**。如果你的项目是 fork 并改过根包名、表前缀或错误码，以项目自己的说明为准——fork 的局部约定不属于框架知识。

## 顶层模块布局（2.X）

根 `pom.xml` 的 `<modules>` 是固定的这 8 个：

```
ruoyi-auth          # 认证服务，独立一个服务模块（只有 CaptchaController / TokenController）
ruoyi-gateway       # Spring Cloud Gateway（WebFlux）
ruoyi-gateway-mvc   # MVC 版网关，与上面二选一
ruoyi-visual        # monitor / nacos / seata-server / snailjob-server
ruoyi-modules       # 业务服务：system / gen / job / resource / workflow
ruoyi-api           # RPC 契约：api-bom / api-system / api-resource / api-workflow
ruoyi-common        # 公共能力，34 个子模块
ruoyi-example       # 只有 ruoyi-demo
```

`ruoyi-auth` 是**顶层独立服务**，不是 `ruoyi-modules` 的子模块——找它的配置文件时别去 `ruoyi-modules` 下面翻。

`ruoyi-gateway` 与 `ruoyi-gateway-mvc` **同时存在于源码里**，配置各有一份，只能启用一个。

## 新增一个 Maven 模块：四处注册，只做前两处会启动失败

官方文档给的是"复制 `ruoyi-system` 改几处"的粗粒度说法。真正容易漏的是**第 2 步**：

1. **父聚合 pom 的 `<modules>` 加一行**。业务服务加到 `ruoyi-modules/pom.xml`；公共能力加到 `ruoyi-common/pom.xml`；RPC 契约加到 `ruoyi-api/pom.xml`。新模块自身 pom 的 `parent` 指向对应聚合模块，`artifactId` 就是模块名。
2. **登记进 BOM 的 `dependencyManagement`**。`ruoyi-common-bom` 管全部 common 模块，`ruoyi-api-bom` 管 api 模块，两者由根 pom 以 `<scope>import</scope>` 引入。**新增 common / api 模块必须同时改聚合 pom 和对应 BOM**，否则别的模块引用它时写不出（或被迫写死）版本。漏了这一步的典型症状是编译期"找不到版本"或依赖解析失败。
3. 只有**可执行服务**才加 `spring-boot-maven-plugin` 的 `repackage`。
4. 在 Nacos 加一份 `<服务名>.yml`，并让网关路由认识它。

`ruoyi-common/pom.xml` 的 modules 列表**不是字母序**，插入新行时别按习惯排序，跟着既有位置加即可。

### 新增服务还要对齐三处名字

`spring.application.name` 必须与 Nacos dataId、注册名、网关路由三者一致。配置通过 `spring.config.import` 从 Nacos 拉取（`optional:nacos:` 前缀），本地 `application.yml` 只保留服务名和导入声明。

## 包命名

- 根包 `org.dromara`（官方改包文档以它为基准做全局替换）。
- 业务模块：`org.dromara.<服务名>`，内部固定子包
  `controller/`、`service/`、`service/impl/`、`mapper/`、`domain/`、`domain/bo/`、`domain/vo/`、`domain/convert/`、`dubbo/`、`listener/`。
- **RPC 契约包与业务包不同名**：契约在 `org.dromara.<服务名>.api`，子包是 `.api.domain` / `.api.model`。
- 启动类 `RuoYi<Svc>Application`，注解 `@EnableDubbo` + `@SpringBootApplication`。

### mapper 与实体是"命名约定即扫描规则"

```yaml
mybatis-plus:
  mapperPackage: org.dromara.**.mapper
  mapperLocations: classpath*:mapper/**/*Mapper.xml
  typeAliasesPackage: org.dromara.**.domain
```

这三项是通配的：**新模块只要遵守 `org.dromara.<x>.mapper` 与 `org.dromara.<x>.domain` 命名就自动被扫到，不需要改 Java 代码**。反过来，如果你的模块换了包名，必须同步改这三项，否则症状是"启动不报错，但 Mapper 找不到"。

XML 放在 `src/main/resources/mapper/<子目录>/`。资源的目录用 `/` 分隔、Java 包用 `.` 分隔，两者不要混写。

## MyBatis-Plus：用 BaseMapperPlus，不要用 IService

- 实体基类 `BaseEntity`：`createDept` / `createBy` / `createTime`（INSERT 填充）、`updateBy` / `updateTime`（INSERT_UPDATE 填充），另有 `searchValue` 与 `params` 两个 `@TableField(exist=false)` 的辅助字段。
- Mapper 基类 `BaseMapperPlus<T, V>`：`T` 是实体、`V` 是 VO，除 MP 自带方法外提供 `selectVoById` / `selectVoByIds` / `selectVoOne` / `selectVoList` / `selectVoPage` 以及 `insertBatch` / `updateBatchById`。**返回值直接是 VO，不需要在 Service 里手写转换。**
- **2.X 不使用 MP 的 `IService` / `ServiceImpl`**。业务 Service 是 `implements IXxxService`，接口也不 `extends IService`，靠 `@RequiredArgsConstructor` + `private final XxxMapper baseMapper` 注入。"必须继承 ServiceImpl"的教程对这个版本是错的。
- 分页：`PageQuery.build()` 得到 `Page<T>`，返回 `TableDataInfo.build(page)`。`PageQuery` 的默认 `pageSize` 是 `Integer.MAX_VALUE`——**列表接口必须显式限制上限**，否则一次全表。
- 拦截器顺序（框架已定）：**租户 → 数据权限 → 分页 → 乐观锁**，租户必须第一。租户拦截器用 `SpringUtils.getBean(...)` 加 `catch (BeansException)` 软装配，所以租户能力缺失时应用仍能启动——排查租户问题时不要以"能启动"作为租户生效的证据。
- 逻辑删除由 `mybatis-plus.enableLogicDelete` 统一控制，不是逐实体 `@TableLogic`。
- 内置默认值文件（`common-mybatis.yml` 等）文件头写明"内置配置不允许修改，如需覆盖请在 Nacos 写同名配置"。要改配置改 Nacos。

## 错误码与异常：这里没有"业务错误码区间"

这一点经常被讲错，务必以源码为准：

- 持有状态码的类型只有 `org.dromara.common.core.constant.HttpStatus`，是一个 **interface**，里面是 **17 个扁平常量**（`SUCCESS=200`、`UNAUTHORIZED=401`、`ERROR=500`、`WARN=601` 等）。
- **没有 `ErrorCode` / `ResultCode` / `IResultCode` 这类类型，也没有按模块划分的错误码号段。** 按 HTTP 语义只分成 2xx/3xx/4xx/5xx/6xx 五段。
- 框架里存在**两个同名 `HttpStatus`**：框架自己的（`R.java` 用它）和 `cn.hutool.http.HttpStatus`（`TableDataInfo` 与审计字段处理器导入的是它）。写新代码时极易 import 错，看到行为不一致先检查 import。
- `R<T>` 自带 `R.SUCCESS=200` / `R.FAIL=500`，与 `HttpStatus` 是两套重复常量，别假定它们恒等。
- 业务异常 `ServiceException` 是 **`final`**，不可继承，支持 `{}` 占位符。需要 i18n 时用 `BaseException`（通过 `MessageUtils` 按 code 解析）。
- 统一兜底在 `GlobalExceptionHandler`：`ServiceException` 走 `code != null ? R.fail(code, msg) : R.fail(msg)`。

> 如果你的项目里有一套自己的错误码区间规范，那是**项目自己的约定**，不是这个框架提供的。不要把它当成框架行为来推理，也不要在新模块里默认它存在。

## 多租户

- 实现模块 `ruoyi-common-tenant`，上下文助手是 `TenantHelper`（全静态方法）。
- 总开关 `tenant.enable`（框架默认 `true`），经 `@ConditionalOnProperty` 决定整个自动配置是否生效。
- **表级模型是"默认全表纳入，靠排除名单退出"**，不是按表开启。`PlusTenantLineHandler.ignoreTable()` 对名单外的一切表追加租户条件。名单 = 硬编码的非业务表 `gen_table` / `gen_table_column` + 配置项 `tenant.excludes`。
  → **新业务表要么带 `tenant_id` 列，要么必须加进 `tenant.excludes`**，否则 SQL 会被拼出 `tenant_id = ?` 而报错。这是新增表时最常见的租户故障。
- 租户实体继承 `TenantEntity`（`extends BaseEntity` 只多一个 `tenantId` 字段）。注意**审计填充器不填 `tenantId`**，插入时的租户值由拦截器拼进 INSERT。
- 忽略租户两种方式：业务层 `TenantHelper.ignore(Runnable|Supplier)`（带重入计数），或 Mapper 方法上加 `@InterceptorIgnore(tenantLine = "true", dataPermission = "false")`。
  **必须显式写 `dataPermission = "false"`**：该注解默认忽略数据权限，不写会让数据权限静默失效——这是文档点名的坑。
- 动态切租户 `TenantHelper.setDynamic/clearDynamic/dynamic`：未登录时只在本线程（ThreadLocal）生效，已登录且 global 时写 Redis。文档明确"禁止乱用"。
- 租户同时作用于 **Redis key 前缀、Spring Cache、Sa-Token 存储**，所以数据隔离问题不一定出在 SQL 层。
- **数据权限与多租户是两套机制**，不要用一个去解决另一个。数据权限走 `@DataPermission` + `@DataColumn` + `DataScopeType`（6 档）。

## 认证与放行

- 认证库 **Sa-Token**。JWT 模式 `StpLogicJwtForSimple`。
- 内置配置里 `is-read-cookie: false`（注释说明是从根源上杜绝 CSRF 风险）、`token-prefix: Bearer`；Nacos 侧 `token-name: Authorization`、`check-same-token: true`（不允许绕过网关直接访问内网服务）、`is-share: false`。
- 服务内拦截：`SecurityConfiguration` 把 `SaInterceptor` 注册到 `/**`，并用 `SaServletFilter` 做内网鉴权。
- 网关拦截：`AuthFilter` 注册 `SaReactorFilter`，除白名单外一律 `checkLogin`，并校验请求头/参数里的 clientid 与 token 内一致，不一致抛 `NotLoginException(-100)`。
- 白名单属性 `security.ignore.whites`，实际值在 **Nacos 的网关配置**里，不在代码里。
- **放行要两层同时满足**：服务内 `@SaIgnore` **且** 网关白名单。只加一个仍然会被拦——排查"接口 401"时两层都要看。
- 改或新增 common 模块的自动配置时，必须同步改该模块的
  `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`。

## 数据库迁移：2.X 不用 Liquibase

2.X 里**没有 Liquibase、没有 changelog、没有 master include 机制**——全树检索 `liquibase` / `changelog` / `resources/db` 均为空。

它用的是**手工 SQL 脚本**：全量初始化在 `script/sql/ry-*.sql`，增量升级在 `script/sql/update/`，按 `<旧版本>-<新版本>` 命名，且 MySQL / Oracle / PostgreSQL 各要一份（`update/` 根、`update/oracle/`、`update/postgres/`）。命名并不自洽（早期用连字符、最新一个用下划线，中间还有跳过版本），执行靠人工，**没有版本表或校验位保证幂等**。

所以：**如果你的项目用 Liquibase，那是团队在框架之外自己加的一层**，其行为由 Liquibase 自身的官方文档决定，不要从 RuoYi 的文档里推导。

一服务一库：`system`/`gen` 共库，`job`、`workflow` 各自独立库。动态数据源为 `dynamic-datasource`，`strict: true`。

表设计必备字段：`create_dept`、`create_by`、`create_time`、`update_by`、`update_time`；可选 `tenant_id`、`del_flag`（默认 0）、`version`（乐观锁）。

## 已知的文档漂移

官方文档不是可靠的一手来源，两处已核实：

- 文档的项目结构页自述版本落后于源码，并且**列出了源码中并不存在的模块**，配置目录名也写错（文档写 `config/nacos`、`sql`，源码实为 `script/config/nacos`、`script/sql`）。
- 讲 RuoYi 错误码区间的第三方文章不适用于 2.X（见上文）。

**结论：结构、模块清单、配置键一律以源码为准，文档只用来理解意图。** 引用前先用仓库的实际文件验证一遍。

## 常见失败模式速查

| 症状 | 优先检查 |
| --- | --- |
| 编译期报依赖没有版本 | 新模块是否登记进了 BOM 的 `dependencyManagement` |
| 启动成功但 Mapper 注入失败 | 包名是否偏离 `org.dromara.**.mapper`；三项通配配置是否同步 |
| SQL 报 `tenant_id` 相关错误 | 新表有没有 `tenant_id` 列，或有没有加进 `tenant.excludes` |
| 接口 401 但服务内已放行 | 网关 `security.ignore.whites` 是否也加了 |
| 数据权限静默失效 | `@InterceptorIgnore` 是否漏写 `dataPermission = "false"` |
| 状态码行为不一致 | 是不是 import 了 `cn.hutool.http.HttpStatus` |
| 列表接口一次查全表 | `PageQuery` 默认 `pageSize` 是 `Integer.MAX_VALUE` |
| 按文档改配置没生效 | 文档漂移，或改的是 `common-*.yml` 内置配置（应改 Nacos） |
