---
name: dsh-plugin-creator
description: 在独立仓库中开发、打包、安装、调试 DeepSeek Harness (dsh) 插件时使用。覆盖插件模块形态（apply / inject / Config）、cordis.yml 组合与 patch 覆盖、bundle 打包（package.json 的 dsh.bundle）、dsh plugin add 安装、工具/服务/事件注册，以及 git 安装与发布分发陷阱。凡是用户提到 dsh 插件、DeepSeek Harness 插件、@deepseek-ai/dsh-*、cordis.yml、cordis.patch.yml、defineTool、dsh plugin add，或要在自己的仓库里写一个 dsh 扩展能力，都先加载本 skill。
---

# 独立仓库中的 DSH 插件开发

本 skill 服务的场景：**插件代码不在 deepseek-harness 仓库里**，而是在你自己的仓库中作为独立 npm 包开发，最终被 `dsh --profile <name>` 加载。

## 0. 先分叉

不同目标走不同的路，先判断，别混用：

| 你要做的 | 走哪条路 |
|---|---|
| 独立仓库里的可安装插件包 / bundle | **本 skill 主线**，从 §1 开始 |
| 运行时动态 Cordis 插件（会话里 `cordis_define` / `cordis_run`，不落盘） | 用官方内置 skill `cordis-plugin-development`（随 cordis preset 分发） |
| 本地临时试用，不发布 | §4 的 `--patch` 覆盖即可，跳过 §6–§8 |
| 改 deepseek-harness 仓库自身 | 不是本 skill 场景，读该仓库的 `docs/cookbook/adding-a-package.md` |

## 1. 先取官方权威文本，再写代码

DSH 处于 developer preview，API 会破坏性变更。**不要凭记忆写 `ctx.*` API 或配置字段**，先取当前官方文本。

官方文档站为 agent 准备了两条通道：

- 页面索引：`https://deepseek-harness.github.io/deepseek-harness/llms.txt`
- **任意页面 URL 去掉末尾斜杠加 `.md` 就是原始 Markdown**，可直接抓取，无需渲染。中文在根路径，英文加 `/en` 前缀，例如：
  - `https://deepseek-harness.github.io/deepseek-harness/develop/basic/index.md`
  - `https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/publish.md`

页面地图与"什么时候读哪页"见 `references/official-docs.md`。

除此之外，**已安装包的 `.d.ts` 是第二权威源**：`node_modules/@deepseek-ai/dsh-tools/lib/types/index.d.ts` 之类。类型定义能给出官方文档没展开的参数与返回。

### 要用的能力在哪个包：先搜能力，再读一个已经这么做的插件

`.d.ts` 只说"这个服务有什么方法"，不说"你要的那件事被谁提供"。按能力名跨包搜一遍，比逐个猜服务名快：

```bash
cd <dsh 安装目录>
grep -rl "listSessions\|archiveSession" node_modules/@deepseek-ai/*/lib/types/*.d.ts
```

找到候选服务后，`.d.ts` 常常还不够——它给出 `stream(options)`，但不说 options 怎么拼、路由怎么解析、chunk 怎么拼回文本。这时**读一个已经在做同一件事的官方插件的 `lib/index.js`**，一次就能拿到完整调用形态：

```bash
grep -n "for await" -B 12 -A 12 node_modules/@deepseek-ai/dsh-session-title-llm/lib/index.js
```

这个惯例的由来：想做一次性 LLM 调用（不建会话、不进历史）时，`.d.ts` 只暴露 `ctx.llm.stream()`；而 `dsh-session-title-llm` 正是靠这个接口做逐会话标题生成，它的调用点直接给出了 `provider`/`model` 从哪来、`createUserMessage` 怎么造、`text-delta` 怎么累加。

**注意 `.d.ts` 会缺方法**：`SessionStore` 有 `get(id)` 却没有 `list()`，要列全部会话得用 `sessionQuery.listSessions()`。搜不到时是没找对服务，不是没这个能力。

## 2. 最小插件契约

一个插件就是一个导出 `apply` 的模块：

```ts
import type { Context } from '@deepseek-ai/cordis'

export const name = 'my-plugin'
export const inject = ['tools']

export function apply(ctx: Context) {
  // 这里 ctx.tools 已经就绪
}
```

三种形态，函数形态在多数场景够用：

```ts
// 对象形态
export default {
  name: 'my-plugin',
  inject: ['tools'],
  apply(ctx: Context) { /* ... */ },
}

// 类形态：用于向其他插件提供服务
import { Service, type Context } from '@deepseek-ai/cordis'

export default class MyService extends Service {
  static inject = ['tools']
  constructor(ctx: Context) { super(ctx, 'myService') }
}
```

**函数形态必须只用 named export，不能同时存在 default export。** Loader 遇到两种形态混用时会把函数插件的 namespace 丢掉，`inject` 静默失效——插件能加载但拿不到依赖。

其他硬性规则：

- **注册即 effect。** `ctx.on()`、`ctx.tools.register()` 等经由 `ctx` 的注册，在插件卸载时自动撤销，不要手写 `removeListener`。
- 需要显式清理的资源（连接、定时器）用 `ctx.effect()` 交出销毁函数：

  ```ts
  ctx.effect(() => {
    const timer = setInterval(tick, 5000)
    return () => clearInterval(timer)
  })
  ```

- **可选依赖用 `ctx.get('name')`**，不要用 `ctx.name`。`ctx.<name>` 是拓扑敏感的代理，只用于已声明 `inject` 的必需服务。

- **生命周期**是 `PENDING → LOADING → ACTIVE → UNLOADING → DISPOSED`，`apply` 抛错则 `FAILED`。必需服务消失时插件自动卸载，服务恢复后自动重载。

## 3. 配置

导出 `Config` 接口 + 同名 Schemastery schema，默认值写在 schema 字段上：

```ts
import Schema from '@deepseek-ai/schemastery'

export interface Config {
  greeting: string
  maxRetries: number
}

export const Config: Schema<Config> = Schema.object({
  greeting: Schema.string().default('Hello'),
  maxRetries: Schema.number().default(3),
})

export function apply(ctx: Context, config: Config) { /* ... */ }
```

两条设计红线：

- **不许硬编码可调值。** 判据是"`cordis.yml` 能不能不改代码就改掉它"。做不到就说明它该是 `Config` 字段。
- **非法配置要在加载期失败。** 自包含约束写进 schema；引用外部服务或资源的约束交给 `inject`。

不要导出普通对象当 `Config`——它不实现 Cordis 要求的 Standard Schema 接口。

**跨字段约束不要用 `Schema.transform` 包一层。** 实测 `Schema.transform(Schema.object({...默认值}), fn)['~standard'].validate(undefined)` 返回 `{}`，内层默认值全部丢失；而 `cordis.yml` 中不写 `config:` 的行恰好传 `undefined`，套了 transform 就会拿空配置激活。约束写进 `apply` 开头并在加载期 `throw`，让非法组合在启动时就炸。

## 4. 本地试用：patch 覆盖

不打包也能先跑通。写一个 patch overlay：

```yaml
- insert:
    - id: hello
      name: '/absolute/path/to/my-plugin/src/index.ts'
      config:
        greeting: 'Hi there'
```

```sh
pnpm dsh web --patch ./my-plugin/cordis.yml   # 源码 checkout 内
dsh web --patch ./my-plugin/cordis.yml        # 已安装 dsh
```

两个坑：

- **插件路径必须是绝对路径。** patch 文件只贡献配置，不会把 loader 的模块解析根改到 patch 所在目录，所以相对路径解析不到。
- `cordis.yml` 的 `!!js` 只能写在插件 `config` 和条目 `disabled` 下，且必须是双感叹号（`!js` 非法）。其他元数据字段保持字面量。

## 5. 注册能力

### Tool

```ts
import { defineTool } from '@deepseek-ai/dsh-tools'

export const inject = ['tools']

export function apply(ctx: Context) {
  ctx.tools.register(defineTool({
    name: 'greet',
    description: 'Greet someone by name.',
    parameters: { name: { type: 'string', required: true, description: 'The name to greet' } },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) { return `Hello, ${args.name}!` },
  }))
}
```

`defineTool` 从 `parameters` 推导并校验 `args`；`execute` 返回 `output.schema` 声明的规范值，`output.render` 把它转成模型可见内容。嵌套 schema、后台任务、策略钩子、UI 卡片见 `docs/cookbook/adding-a-tool.md`（用 §1 的 `.md` 规则取）。

**`parameters` 里的 `default` 是非校验注解，不会填充实参。** 类型定义原文即 "Non-validating default annotation"：模型省略该参数时 `args.x` 仍是 `undefined`。默认值必须在 `execute` 里显式套用（或从 `Config` 取），把 `default` 当成自动填充是最容易写错的一处。

### Service

```ts
import { Service, type Context } from '@deepseek-ai/cordis'

declare module '@deepseek-ai/cordis' {
  interface Context { metrics: MetricsService }
}

export default class MetricsService extends Service {
  static inject = ['llm']
  constructor(ctx: Context) { super(ctx, 'metrics') }
  record(event: string, value: number) { /* ... */ }
}
```

服务名重复注册会顶替，`static inject` 让服务自身也能依赖别的服务。

### Event

`ctx.on` 监听、`ctx.emit` 广播，另有三种模式：`ctx.bail`（首个非 `null`/`false`/`undefined` 结果短路）、`ctx.serial`（按序 await）、`ctx.waterfall`（管道）。

**waterfall 监听器必须调用 `next()`**，否则按设计短路整条链：

```ts
ctx.on('my-plugin/transform', async (_input, next) => (await next()).trim())
```

用 declaration merging 给事件补类型：

```ts
declare module '@deepseek-ai/cordis' {
  interface Events {
    'my-plugin/ready': (payload: { id: string }) => void
  }
}
```

**一个常见误解**：`turn/*`、`step/*`、`tool/call`、`tool/result`、`compaction/*` 是**持久化 session 事件**，不是同名 Cordis 事件。要观察它们得监听 `session/event` 再判断 `event.type`。

## 6. 打包成可安装 bundle

**bundle**（你创作的、对外分发的）与 **profile**（用户 `dsh --profile <name>` 启动的）是两个不同概念，都由 `package.json` 描述但承载不同 manifest。

```
my-plugin/
├── package.json       # 声明 dsh.bundle
├── cordis.patch.yml   # 被 profile 引入时应用的层
└── index.js           # patch 行引用的插件模块
```

```json
{
  "name": "dsh-my-plugin",
  "version": "0.1.0",
  "type": "module",
  "main": "index.js",
  "files": ["index.js", "cordis.patch.yml"],
  "dsh": { "bundle": { "patch": "./cordis.patch.yml" } }
}
```

```yaml
# cordis.patch.yml：用包名引用，让 Node 解析找到已安装代码
- insert:
    - id: my-plugin
      name: dsh-my-plugin
```

要点：

- **没有 `dsh.bundle` 声明也能安装，但只是普通依赖**：`dsh plugin` 会警告且不激活任何层。库包（被插件 import 而非用户启用的）就用这种形态。
- 用裸包名引用插件时，该包必须出现在解析清单的 `dependencies` 里。
- **harness 包写进 `peerDependencies`（+ `devDependencies`），不要写 `dependencies`。** 写进 `dependencies` 会在 profile 里再落一份真实例，与运行中 dsh 提供的那份分叉。dsh 通过 `$DSH_HOME/profiles/node_modules` 提供它们，不需要从 registry 拉。
- **`files` 必须覆盖 `cordis.patch.yml` 和运行时入口。** 漏掉 patch 文件时 `add` 仍然成功、层也进了 `dsh.profile.bundles`，直到启动才报 `failed to read overlay ... ENOENT`。
- manifest 细节、profile manifest、四层层序见 `references/bundle-and-profile.md`。

## 7. 安装与验证

```sh
dsh plugin --profile demo add ./my-plugin   # 首次会初始化 profile
dsh --profile demo --dump-config            # 应出现 "# == dsh-my-plugin" 层
dsh --profile demo                          # 启动
dsh plugin --profile demo remove dsh-my-plugin
```

`--profile` 是**必填**选项：`dsh plugin add x` 直接报 `required option '--profile <name>' not specified`，没有默认 profile 或环境变量兜底。

`dsh plugin` 把参数转发给 profile 目录里的 pnpm，所以 `add`/`remove`/`update`/`why` 等 pnpm verb 都能用。相对路径（`.`, `../x`, `file:`/`link:`）先按调用目录锚定，再安装。

**`dsh plugin --profile demo add .` 是 pnpm 的 `link:` 安装**：不复制文件，也不安装该目录自己的依赖。所以本地用 `.` 安装前，插件目录必须先跑过 `pnpm install`，否则 `index.js` 里的 `@deepseek-ai/*` 解析不到。tarball / npm / git 三种安装落在 profile 依赖树里，由 dsh 安装自身提供，没有这一步。

**层序（后者按行覆盖前者）**：

1. profile 的 `dsh.profile.bundles` 列表顺序
2. profile 自己的 `cordis.patch.yml`
3. `$DSH_HOME/cordis.patch.yml`（机器级偏好）
4. 每个 `--patch <path>` overlay（argv 顺序）

**一个 patch 会替换整行的 `config` 值，不做深合并**——覆盖别人的行时必须重述该行需要的每个键。反过来说，用户可以在 profile 的 `cordis.patch.yml` 里覆盖你的行而不动你的包。

## 8. 分发

先选形态，再决定要不要踩构建闸门：

- **交构建产物**（`lib/` 已提交，或包本身是纯 ESM 源码）：npm / tarball / git 三条路用户都一条命令装完，**完全不需要放行构建**。代价是少了编译期检查，用 `typecheck` + `test` 补。
- **交 TS 源码 + `prepare`**：git 安装时 pnpm 先跑 `prepare`，但首次 `add` 必然被拒，用户必须手工放行。

### git 安装拿到的是源码，不是产物

`dsh plugin --profile demo add github:you/my-plugin` 会拉源码，不跑你的 `build` 脚本。没有 `lib/` 入口时，**`add` 仍然成功、层也进了 `dsh.profile.bundles`，直到启动才报找不到包入口**——这是最容易漏掉的静默陷阱。两边都得配合：

- **作者**提供自包含 `prepare` 脚本（pnpm 在 git 安装后运行它），从 `src/` 构建产物，不能假设存在同仓 checkout 之类的 dev-only 上下文。
- **用户**必须显式放行构建。pnpm ≥10 默认拒绝执行 git 依赖的 `prepare`，首次 `add` 报 `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`，并把修复方式打出来。

放行的键**必须原样抄 pnpm 打印的那一行**——不要推导键的形态，也不要简写成包名。GitHub 上的一个实例形态是：

```yaml
allowBuilds:
  dsh-my-plugin@https://codeload.github.com/you/my-plugin/tar.gz/<40-位sha>: true
```

这只是示例：`github:o/r` 与 `git+https://github.com/o/r.git#<sha>` 都被 pnpm 归一成 codeload tarball fetcher，而其他主机、`git+file://` 等各自不同，**键形态取决于 pnpm 实际选中的 fetcher**。实测裸包名、去掉 hash、`git+https` 三种写法全部被拒。pnpm 打印的只是映射行本身，`allowBuilds:` 父键要自己补；同一个 `pnpm-workspace.yaml` 里也不能出现两个 `allowBuilds:` 键。

键里含解析出的 commit，**换一个 commit 就要换一次键**——这是这条路的持续摩擦，也是它的安全价值。

**放行等于允许该包的代码在安装期于本机执行**，运行在任何 agent 沙箱之外。只放行你信任源码的包，并 pin 到 commit（`github:you/my-plugin#<sha>`）使后续推送不能悄悄改变执行内容。

### 不想让用户放行，就分发产物

- **发 npm**：`pnpm publish` 前构建好 `lib/`，用户 `dsh plugin --profile demo add your-package` 直接装预构建代码。
- **发 tarball**：`pnpm pack`（会自动跑 `prepare` 并把产物打进包里），用户 `dsh plugin --profile demo add ./my-plugin-0.1.0.tgz`。

两种都不需要任何构建许可。

### 选依赖版本时注意 dist-tag

`@deepseek-ai/*` 的 npm `latest` 可能是过期的旧版本——`@deepseek-ai/dsh-tools` 的 `latest` 长期停在 `0.0.1-rc.1`，真实版本在 `next`。装依赖或写 peer 范围前先 `npm view <pkg> dist-tags` 确认。

## 9. 常驻硬约束

以下规则在本 skill 加载时即生效。**不要在每个插件仓库里再复制一份 `AGENTS.md`**——指引集中在本 skill，副本只会各自漂移、版本不一。只有当某个仓库确实需要一个独立于 skill 的常驻约束文件时，才把这份内容摘过去。

```markdown
## DeepSeek Harness plugin

- 本仓库产出一个 dsh 插件包，最终由 `dsh --profile <name>` 加载；不要改 harness 仓库。
- 插件模块函数形态只允许 named export（`name` / `inject` / `Config` / `apply`），不得同时提供 default export。
- 每个可调值都必须是 `Config` 字段，不许留 `const TIMEOUT = ...` 之类硬编码。
- 只对已声明 `inject` 的服务使用 `ctx.<name>`；可选依赖一律 `ctx.get('<name>')`。
- 所有 `waterfall` 监听器必须调用 `next()`。
- 修改 `ctx.*` API 或配置字段前，先抓官方当前文档：站点页面 URL 加 `.md` 即原始 Markdown，索引起点 https://deepseek-harness.github.io/deepseek-harness/llms.txt
- 交付前跑 `dsh --profile <name> --dump-config`，确认本包的层出现且配置生效。
```

## 10. 交付前检查清单

- [ ] 函数插件只有 named export，没有 default export
- [ ] 每个部署可变值都有 `Config` 字段与 schema 默认值，没有模块级 `DEFAULT_*` 常量充当可调值
- [ ] `Config` 没有被 `Schema.transform` 包裹；跨字段约束在 `apply` 里校验
- [ ] harness 包写在 `peerDependencies`（+ `devDependencies`）而非 `dependencies`
- [ ] 没有用 `ctx.<name>` 读取未 `inject` 的服务
- [ ] 所有 waterfall 监听器都调用了 `next()`
- [ ] `cordis.patch.yml` 用包名（而非绝对路径）引用插件模块
- [ ] `package.json` 声明了 `dsh.bundle.patch`，`files` 覆盖 `cordis.patch.yml` 与运行时产物
- [ ] `dsh --profile <name> --dump-config` 能看到 `# == <package>` 层
- [ ] 选择 git 安装则提供了自包含 `prepare`，并在 README 说明 `allowBuilds` 的完整键
- [ ] 公开仓库加了 `dsh-plugin` topic，便于社区发现

## 参考文件

- `references/official-docs.md` —— 官方页面地图、raw Markdown 取法、每页何时读
- `references/bundle-and-profile.md` —— bundle/profile manifest 全文、四层层序、git 安装细节
