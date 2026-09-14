# bundle 与 profile 的 manifest 与层序

来源：官方 `develop/basic/publish.md`（用 `SKILL.md` §1 的 `.md` 规则取最新版）。本页是提要，冲突时以官方页为准。

## 两个概念

安装机制建立在两个概念上。两者都由 `package.json` 描述，但在 `dsh` 键下承载不同 manifest，回答不同问题：

- **bundle** —— 你创作并分发的 npm 包，携带一个配置层。manifest 声明 `dsh.bundle`，回答"这个包贡献了什么"：一个插入或覆盖插件行的 patch 文件。
- **profile** —— `$DSH_HOME/profiles/<name>` 下的目录，描述一份可运行的组合。manifest 声明 `dsh.profile`，回答"哪些 bundle 以什么顺序组成这套环境"。

**bundle 是作者写的，profile 是用户启动的。没有东西同时是两者。**

## bundle 的目录与 manifest

```
my-plugin/
├── package.json       # 声明 dsh.bundle
├── cordis.patch.yml   # 被 profile 列出时应用的层
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
# cordis.patch.yml
- insert:
    - id: my-plugin
      name: dsh-my-plugin
```

patch 是 YAML 数组，与 `--patch` overlay 同构；区别是插件行**用包名引用**而不是相对源码路径，这样 Node 解析能找到已安装的代码。

**没有 `dsh.bundle` 声明的包照样能装，但只作为普通依赖**：`dsh plugin` 打印一次警告且不激活任何层。库包（被插件 import 而非用户启用）用这种形态。

**用裸包名引用插件时，该包必须出现在解析清单的 `dependencies` 里。**

## profile manifest

profile 目录两个文件：

- `package.json` —— profile 的树外插件依赖（pnpm 管理）加上 `dsh.profile` manifest 及其有序 `bundles` 列表。
- `cordis.patch.yml` —— 用户自己的 patch 层，在所有 bundle 层之后应用。

**不要手写 profile manifest。** `dsh plugin` 会创建一个 base-backed profile 并维护其已安装 bundle 列表。安装后形态：

```json
{
  "name": "dsh-profile-demo",
  "private": true,
  "dependencies": { "dsh-my-plugin": "link:/path/to/my-plugin" },
  "dsh": {
    "profile": {
      "bundles": ["@deepseek-ai/dsh-base", "dsh-my-plugin"]
    }
  }
}
```

## 有效配置的组装顺序

从空根出发，按序应用：

1. profile 的 `dsh.profile.bundles` 列表中的每个 bundle patch，**按列表顺序**——`@deepseek-ai/dsh-base` 在前，之后按加入顺序。
2. profile 自己的 `cordis.patch.yml`。
3. `$DSH_HOME/cordis.patch.yml`——同机器所有 profile 共享的本机偏好。
4. 每个 `--patch <path>` overlay，**按 argv 顺序**。

应用参数（app arguments）不是又一个 patch 层。

### 两条对 bundle 作者有实际后果的规则

- **后面的层按行覆盖前面的层，且 patch 替换整行的 `config` 值，不做深合并。** 所以覆盖别人的行时，必须重述该行需要的每个键，而不只是改动的那个。
- 用户可以只改自己 profile 的 `cordis.patch.yml` 就覆盖你的行，不动你的包。因此**优先选择用户大概率愿意保留的配置默认值**，其余交给 schema。

箱内（in-box）bundle 名始终从 dsh 安装本身解析，pnpm 只管理树外包，所以你的 bundle 可以依赖 `@deepseek-ai/dsh-base` 存在且为当前版本。

## 验证与卸载

```sh
dsh plugin --profile demo add ./my-plugin
dsh --profile demo --dump-config    # 应出现 "# == dsh-my-plugin" 层
dsh --profile demo
dsh plugin --profile demo remove dsh-my-plugin   # 同时移除依赖与该层
```

`dsh plugin --profile <name> <args...>` 把参数转发给 profile 目录里的 pnpm，`add` / `remove` / `why` / `update` 等 verb 原样可用，pnpm 必须在 PATH 上。相对路径规格（`.`, `../plugin`，以及 `file:` / `link:` 形式）先锚定到调用目录，所以在插件 checkout 里 `add .` 装的是该 checkout 而不是 profile。

每次成功运行后，`dsh.profile.bundles` 会与已安装状态对账：manifest 声明了 `"dsh": { "bundle": { "patch": "./cordis.patch.yml" } }` 的依赖进入层栈（因此 `update` 后新获得的声明会激活），无 bundle 声明的依赖保持普通依赖并打印一次警告，被移除的依赖离开层栈。

## 从 GitHub 安装：构建脚本的坑

发布到 registry 不是必需的，用户可以直接从 git 主机装：

```sh
dsh plugin --profile demo add github:you/my-plugin
```

但 **git 安装拉的是源码，不是构建产物**：不会运行你的 `build` 脚本，TypeScript 包到手时没有 `lib/`，加载失败。两件事必须发生，各在一侧：

- **作者**提供 `prepare` 脚本（pnpm 在 git 安装后运行它），从源码构建发布的入口点，且必须自包含——不能假设存在同仓 checkout 这类 dev-only 上下文。可参考的配置形状：专用 tsdown 配置直接转译 `src/`，不用项目引用，也不做类型检查。
- **用户**必须放行构建。pnpm ≥10 在显式允许前拒绝执行 git 依赖的 `prepare`，首次 `add` 报 `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`，并打印出该抄进 profile `pnpm-workspace.yaml` 的那一行。GitHub 上的实例形态：

  ```yaml
  allowBuilds:
    dsh-my-plugin@https://codeload.github.com/you/my-plugin/tar.gz/<40-位sha>: true
  ```

  然后重跑 `add`。

**键必须原样抄，不要推导形态，也不要简写成包名。** GitHub 上 `github:o/r` 与 `git+https://github.com/o/r.git#<sha>` 都归一成 codeload tarball fetcher，其他主机与 `git+file://` 各自不同——形态取决于 pnpm 实际选中的 fetcher，且可能随 pnpm 大版本变化。实测裸包名、去掉 hash、`git+https` 三种写法全部被拒。

pnpm 打印的只是映射行本身，`allowBuilds:` 父键要自己补上；同一个 `pnpm-workspace.yaml` 里出现两个 `allowBuilds:` 键会报 YAML 缩进错误。键里含 pnpm 解析出的 commit，**所以仓库每多一个 commit，键就失效一次，用户必须重抄**。这既是这条路的持续摩擦，也是它限制"推送即执行"的安全价值。

### 两个"装得上但启动才炸"的静默陷阱

`dsh plugin add` 成功、`dsh.profile.bundles` 也加对了，都不代表插件能加载。以下两种失败只在下次启动时暴露：

- **入口产物缺失**：包声明了 `main: lib/index.js` 但仓库没提交 `lib/`、也没提供可用的 `prepare`。启动时报找不到包入口。
- **`files` 漏掉 `cordis.patch.yml`**：`files` 过滤对 git 安装生效，patch 文件不进 profile 的 `node_modules`，启动时报 `failed to read overlay ... ENOENT`。

把这条放行视为**允许该包的代码在安装期于本机执行**，其运行在 agent 所在的任何沙箱之外。只放行你信任源码的包，并 pin 到 commit（`github:you/my-plugin#<sha>`），使后续推送不能悄悄改变执行内容。

### 绕开整个闸门：交产物而不是源码

只要包里已有可运行的入口产物（提交了 `lib/`，或包本身就是纯 ESM 源码而无构建步骤），`prepare` 就不再必要，三条安装路径都不触发构建闸门。这也是最省用户摩擦的选择，代价是失去编译期检查，改用 `typecheck` + `test` 补。

### 不需要用户放行的两种分发方式

- **发 npm**：在 `pnpm publish` 时构建好 `lib/`，用户 `dsh plugin add your-package` 直接装预构建代码。
- **发 tarball**：`pnpm pack` 产包，用户 `dsh plugin add ./my-plugin-0.1.0.tgz`。

## 让 bundle 自带命令行

定义了可运行 app 的 bundle 挂载一个普通 provider 插件：

```yaml
- id: my-startup
  name: 'dsh-my-plugin/startup'
```

该插件导出 `inject = ['cmdlineArgs']`，用 `@deepseek-ai/dsh-cmdline` 的 `parseCmdline` 解析自己的 commander program，并在 program 的 action 里提供 app 自有服务。launcher 把同一份不可变参数交给每个插件，所以 app 专属 flag 不需要改 launcher，多个插件可以各自解析这份快照。Loader 行不需要 launcher 标记或特殊 kind。

由这些参数配置的行注入 provider 的服务，并在自己的 `!!js` 选项里读取它，部署值作为 fallback：

```yaml
- id: my-app
  name: '@example/my-app'
  inject: [myAppStartup]
  config:
    port: !!js ctx.myAppStartup.port ?? 8080
```

`--help` 时 provider 不发布服务，这些行因此不会激活。Loader 只挂载一次组合，等每行的普通注入就绪，然后才针对其注入上下文求值该行的 `!!js` 配置。
