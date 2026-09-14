---
name: backend-sa-token
description: "Sa-Token 认证授权的使用与排障约定：Spring Boot 3.x 该引哪个 starter、注解鉴权为什么默认不生效、SaInterceptor/SaServletFilter 的正确注册方式、sa-token.* 配置键与默认值、token 风格、权限数据源 StpInterface 的执行时机、微服务里网关与子服务的依赖拆分与 Same-Token。当项目里出现「注解鉴权没生效」「拦截器排除了却仍被拦」「Token 无效/未读取」「登录后被顶下线」「网关鉴权与子服务鉴权冲突」这类问题时使用。"
---

# Sa-Token 认证授权

## 版本与依赖：只引一个 starter

当前稳定版 **1.46.0**，**只有 1.x，没有 2.x**——所以不存在"升级大版本"这件事；真正会咬人的是 1.x 内部几次不向下兼容的改动（见文末）。

按运行模型选 starter（groupId `cn.dev33`）：

| 项目形态 | artifactId |
| --- | --- |
| Spring Boot 3.x + SpringMVC（Servlet） | `sa-token-spring-boot3-starter` |
| Spring Boot 3.x + WebFlux / Spring Cloud Gateway | `sa-token-reactor-spring-boot3-starter` |
| Spring Boot 2.x | `sa-token-spring-boot-starter`（与 3.x 的 starter 不可混用） |

**Servlet 与 Reactor 两个 starter 绝不能同时引入**——官方明确说这样会导致项目无法启动。

微服务里还有一条官方重点强调的规则：**网关与内部服务要分开引入依赖，不要把这些依赖放到顶级父 pom**。原因是两者运行模型不同（网关是 Reactor、子服务是 Servlet），放到父 pom 会让两边都拿到不该有的 starter。各服务另需引入同一个 Redis 集成（官方推荐 `sa-token-redis-template`），因为服务间要靠 Redis 共享会话数据。

> Redis 集成自 1.46.0 起使用 `SET KEEPTTL`，因此**要求 Redis 6.0 及以上**，低于此版本会直接报语法错误。

## 注解鉴权默认是关闭的

这是最高频的"配了没反应"：

> Sa-Token 用全局拦截器（或 AOP）完成注解鉴权，**拦截器默认处于关闭状态**，必须手动注册。

Spring MVC 的推荐注册方式：

```java
@Configuration
public class SaTokenConfigure implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor()).addPathPatterns("/**");
    }
}
```

`SaInterceptor.isAnnotation` 默认为 `true`，所以上面这一行就同时启用了注解鉴权。

路由式鉴权把校验逻辑作为构造参数传入：

```java
registry.addInterceptor(new SaInterceptor(handle -> StpUtil.checkLogin()))
        .addPathPatterns("/**")
        .excludePathPatterns("/user/doLogin");
```

也可以用过滤器 `SaServletFilter`（链式 `addInclude` / `addExclude` / `setAuth` / `setError`），默认优先级 `-100`，可用 `@Order` 覆盖。

**过滤器与拦截器的取舍**：过滤器更底层、能拦到静态资源，但拿不到 `HandlerMethod`，且它抛出的异常**不会**进入全局 `@ExceptionHandler`。需要统一异常处理时用拦截器。

### AOP 与拦截器互斥

引入 `sa-token-spring-aop` 后可以在任意层级写注解，但官方明确警告：**拦截器模式与 AOP 模式不可同时集成**，否则 Controller 层同一个注解会被校验两次。拦截器模式只能在 Controller 层写注解。

## 配置

前缀 `sa-token`（Spring Boot 原生绑定，kebab-case 有效）。主要键与默认值：

| 键 | 默认 | 说明 |
| --- | --- | --- |
| `sa-token.token-name` | `satoken` | Token 名，**同时也是 Cookie 名与数据持久化的 key 前缀** |
| `sa-token.timeout` | `2592000`（30 天） | 有效期；`-1` 永不过期 |
| `sa-token.active-timeout` | `-1` | 最低活跃频率，超时未访问即冻结 |
| `sa-token.is-concurrent` | `true` | 是否允许同账号多地同时登录；`false` 时新登录挤掉旧登录 |
| `sa-token.is-share` | `false`（1.42.0 起） | 同账号多人是否共用一个 token |
| `sa-token.max-login-count` | `12` | 同账号最大登录数，超出按 FIFO 注销最早会话 |
| `sa-token.token-style` | `uuid` | 见下 |
| `sa-token.is-read-body/header/cookie` | 均 `true` | 从哪几处读 Token |
| `sa-token.token-prefix` | 空 | 如 `Bearer`；**前缀与值之间必须有空格** |
| `sa-token.same-token-timeout` | `86400` | Same-Token 有效期（秒） |
| `sa-token.check-same-token` | `false` | 是否校验 Same-Token |
| `sa-token.cookie.sameSite` | `Lax` | 可选 `Strict` / `Lax` / `None` |

> `token-name` 兼作 **Cookie 名和数据持久化前缀**。改成 `Authorization` 这类名字会同时改变持久化 key 的命名空间——这不是官方推荐做法，官方 Bearer 示例用的是 `satoken: Bearer xxx` 这种结构。改这个键之前先想清楚它对存储的影响。

配置生效优先级：代码里 `@Bean @Primary SaTokenConfig` **覆盖** yml；`@Autowired` 注入后改字段则与 yml **合并、代码优先**。

配置不生效时的官方排查法：启动时打印 `SaManager.getConfig()` 对比实际值。常见原因是前缀写错或缩进不对。

## Token 风格

`sa-token.token-style` 取值：`uuid`（默认）、`simple-uuid`、`random-32`、`random-64`、`random-128`、`tik`。

自定义策略是重写 `SaStrategy.instance.createToken`。

**换风格后如果没生效，先清 Redis 里的旧数据再试**（官方提示）。另外历史上 1.32.0 存在过 token 重复问题，影响面包含 `tik` 与 `random-32/64/128`，默认的 `uuid`/`simple-uuid` 不受影响。

1.46.0 起随机串改用密码学安全的随机源。

## 核心 API 与注解

入口 `cn.dev33.satoken.stp.StpUtil`（全静态）：

- 登录/注销：`login(id)` 及若干重载、`logout()`、`logoutByTokenValue(v)`、`logout(loginId)`
- 踢人/顶人：`kickout(loginId)`、`replaced(loginId)`
- 状态：`isLogin()`、`checkLogin()`（未登录抛 `NotLoginException`）、`getLoginId()` 及 `AsString/AsInt/AsLong`
- 权限：`getPermissionList()`、`hasPermission(x)`、`checkPermission(x)`（失败抛 `NotPermissionException`），以及 `And`/`Or` 变体
- 角色：`getRoleList()`、`hasRole(x)`、`checkRole(x)`（失败抛 `NotRoleException`）
- 会话：`getSession()`、`getTokenSession()`、`getAnonTokenSession()`

注解：`@SaCheckLogin`、`@SaCheckRole`、`@SaCheckPermission`（含 `orRole`）、`@SaCheckSafe`、`@SaCheckDisable`、`@SaCheckOr`、`@SaIgnore`，另有插件侧的 `@SaCheckSign`、`@SaCheckApiKey`。`@SaIgnore` 无属性、优先级最高，可同时忽略注解鉴权与路由拦截鉴权。组合模式由 `SaMode` 控制，只有 `AND` 与 `OR`。注解可标在方法或类上（类级对该类所有方法生效）。

**权限的真正来源是 `StpInterface`**（以 `@Component` 注册，实现 `getPermissionList` / `getRoleList`）。两个关键性质：

- 它在**启动时不执行，每次鉴权时才执行**。所以"实现了但看不到日志"是正常的。
- 推论：**每次权限校验都可能触发一次 DB 或缓存查询**。在 `getPermissionList` 里直接读库，等于每次鉴权查一次库；官方建议加缓存。

## 排障：症状 → 原因

**注解鉴权不生效**
1. 没注册拦截器（默认关闭）；
2. 同时配置了 `WebMvcConfigurer` 和 `WebMvcConfigurationSupport`——后者会让拦截器失效，典型场景是在 `WebMvcConfigurationSupport` 里配静态资源映射。**两者只选一个，建议统一用 `WebMvcConfigurer`**；
3. 以上都不是时逐项复现。

**排除了某路径却仍被拦**（官方列了多种可能）：跨域；访问不存在的路由被转发到 `/error` 后**二次**进入拦截器；其实是别的拦截器在拦；网关转发后后端看到的 path 与前端不同；配了 `server.servlet.context-path` 时 `excludePathPatterns` 里**不应**再写这个前缀；多条 `SaRouter.match` 规则中请求越过了前面那条却被后面那条拦下。

**报"上下文尚未初始化"**：在异步/响应式上下文里调同步 API；或 404 → 转发 `/error` 时上下文已被清除——加 `excludePathPatterns("/error")` 即可。

**"未能读取到有效 Token"**：前端没提交；**参数名不对**（默认 `satoken`）；配了 `is-read-header=false` 却从 header 提交；Token 前缀不对；前后端分离下浏览器不会自动带 Cookie；**Nginx 默认会吞掉带下划线的自定义 header**（如 `shop_token`）。

**"Token 无效"**：乱填或串了项目；过期；未集成 Redis 时项目重启；集成 Redis 时 Redis 重启；**提交的 token 与框架读到的不是同一个**——框架读取顺序是 **body → header → cookie**，若 `is-read-header=false` 而 cookie 里有另一个 token，就会读到另一个；超过 `max-login-count`（默认 12）导致最早的会话被强制注销；多账号模式下用 `StpUserUtil` 颁发的 token 拿去 `StpUtil` 校验永远无效（账号体系 loginType 没对上）。

**集成 Redis 后"Redis 里有值却提示无效"**：官方称九成是"代码连的 Redis 和管理工具看的不是同一个"。

**Spring Boot 3 下路径规则报 `No more pattern data allowed after {*...} or ** pattern element`**：SB3 换了路径匹配实现，不允许 `**` 之后还有内容（如 `/admin/**/info`）。改规则，或把匹配策略切回 `ant_path_matcher`（后者需要重写 `SaStrategy.instance.routeMatcher`）。

**注解鉴权与路由拦截鉴权的顺序**：注解鉴权**总是先执行**，框架没有提供调序 API。变通做法是注册两次 `SaInterceptor`，第一个 `.isAnnotation(false)` 专做路由鉴权。

**Swagger 被拦死**：把 `/swagger-resources/**`、`/webjars/**`、`/v2/**`、`/swagger-ui.html/**`、`/doc.html/**`、`/error`、`/favicon.ico` 排除掉。

## 微服务：网关与子服务

官方推荐形态是**网关统一鉴权 + 各服务共享 Redis 复用同一会话**（不是"网关注入身份 header、下游直接信任"——官方没有这种模式）。

1. **依赖拆开引入**（见开头），网关用 reactor starter，子服务用 servlet starter，各自都接同一个 Redis。
2. **网关也要实现 `StpInterface`**，因为它要能算出权限集合。取数三选一：网关直查库 / 先查 Redis 未命中再查库 / 先查 Redis 未命中走 RPC 调权限服务。
3. **网关注册 `SaReactorFilter`**，形态是 `addInclude` / `addExclude` / `setAuth` / `setError`，鉴权逻辑用 `SaRouter.match(..., r -> StpUtil.checkLogin())` 表达。

### 内网隔离用 Same-Token

防止绕过网关直连子服务：

- 网关加一个 `GlobalFilter`，给请求头追加 `SaSameUtil.SAME_TOKEN`（值取 `SaSameUtil.getToken()`），该头会转发到子服务。
- 子服务注册 `SaServletFilter`，在 `setAuth` 里校验 `SaSameUtil.checkCurrentRequestToken()`。

效果是：经网关转发可正常访问，直连子服务提示 `无效Same-Token：xxx`。服务间内部调用同理，调用方加 Feign `RequestInterceptor` 注入 Same-Token。

## 1.x 内部的不向下兼容改动

不存在 1.x → 2.x 迁移。会咬人的是这几处：

| 版本 | 变更 |
| --- | --- |
| 1.31.0 / 1.34.0 | 新增 `SaInterceptor`；旧类 `SaAnnotationInterceptor`、`SaRouteInterceptor` 在 1.34.0 被删除。老教程里的注册写法已失效 |
| 1.42.0 | `SaLoginModel` → `SaLoginParameter`；`TokenSign` → `SaTerminalInfo`；`is-share` 默认值由 `true` 改为 `false`；登录默认设备类型改为 `DEF` |
| 1.45.0 | 新增 Spring Boot 4 的 starter |
| 1.46.0 | `StpInterface.isDisabled` 增加 `loginType` 参数；新增 `allowLoginIdColon`（默认禁止 loginId 含冒号，因为持久化 key 用冒号分段）；JWT 的 `extraData` 禁止含保留字段 |

**JWT 模式的两个隐藏约束**：`jwt-simple` 模式下 `is-share` 恒等于 `false`；`jwt-mixin` 模式下 `is-concurrent` 必须为 `true`。

**一个容易误判的现象**：token 过期时 `NotLoginException` 的场景值是 -2 而不是 -3。原因是 token 过期后从 Redis 消失，框架无法区分"曾经有过然后过期"与"从未存在"；集成 `sa-token-jwt` 后才能分辨并抛 -3。排查时不要据此断定"这个 token 从未签发过"。

**`timeout` 与 `active-timeout` 的区别**：后者是"多久没访问就冻结"，配好后长时间不活跃的用户会先被冻结，而不是等到 `timeout` 才过期。
