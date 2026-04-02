# Typed Plugin SDK — Scripting Reorganization Design

**Date:** 2026-04-02
**Status:** Draft
**Scope:** Migrate apex-plugins scripting to TypeScript with a thin shared SDK and compiled per-plugin output

## Problem

The apex-plugins project has 10 active plugins (get-shit-done excluded) using a mix of `.mjs`, `.cjs`, `.js`, and `.sh` scripts with no shared runtime, no TypeScript, and inconsistent conventions. Config path drift exists across multiple plugins (MySQL, Feishu, Aliyun). Creating new plugins requires manual copying and is error-prone.

## Decision

**Solution A: Compiled Plugin SDK with Workspaces** — a structured monorepo where a thin shared `@apex/core` package provides config loading, types, and error handling. Each plugin compiles to self-contained JS in `dist/` for standalone deployment.

## Plugins In Scope

| Plugin | Type | Current Lang | Migration Complexity |
|--------|------|-------------|---------------------|
| mysql | CLI | .mjs | Medium (300 lines) |
| postgresql | CLI | .mjs | Medium |
| aliyunlog | CLI | .mjs | Medium |
| ticktick | CLI | .mjs | Medium |
| feishu | MCP | .js | Medium (MCP server + setup) |
| jetbrains | MCP | .json config | Low (config only) |
| augment-mcp | MCP | .json config | Low (config only) |
| p3c | Rules | Markdown only | None (no scripts) |
| kotlin-architect | Skills | Markdown only | None (no scripts) |
| find-skills | CLI | .sh wrapper | Low |

**Excluded:** get-shit-done (removed from project)

## Target Directory Structure

```
apex-plugins/
├── package.json                    # workspaces: ["packages/*", "mysql", "postgresql", ...]
├── tsconfig.base.json              # strict, ESM, target ES2022, moduleResolution bundler
├── .claude/settings.json           # existing hooks
├── .claude-plugin/marketplace.json # registry (get-shit-done entry removed)
├── CLAUDE.md
│
├── packages/
│   └── core/                       # @apex/core
│       ├── src/
│       │   ├── config.ts           # loadConfig(), saveConfig(), configPath()
│       │   ├── types.ts            # PluginConfig, SchemaField, HookResult, CLIArgs
│       │   ├── errors.ts           # PluginError, ConfigError, typed error classes
│       │   └── index.ts            # barrel export
│       ├── package.json            # name: "@apex/core", type: "module"
│       └── tsconfig.json           # extends ../../tsconfig.base.json
│
├── templates/                      # archetype-specific scaffolds
│   ├── cli/                        # CLI plugin template (mysql-like)
│   │   ├── src/__PLUGIN__.ts       # CLI entrypoint template (includes requireConfig)
│   │   ├── skills/__PLUGIN__/SKILL.md
│   │   ├── skills/__PLUGIN__/references/config-schema.md
│   │   ├── skills/__PLUGIN__/references/troubleshooting.md
│   │   ├── .claude-plugin/plugin.json
│   │   ├── .claude-plugin/hooks.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── mcp/                        # MCP plugin template (feishu-like)
│   │   ├── src/__PLUGIN__-mcp-start.ts
│   │   ├── .mcp.json
│   │   ├── .claude-plugin/plugin.json
│   │   ├── .claude-plugin/hooks.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── rules/                      # Rules-only template (p3c-like)
│       ├── skills/__PLUGIN__/SKILL.md
│       ├── .claude-plugin/plugin.json
│       └── .claude-plugin/hooks.json
│
├── scripts/
│   ├── create-plugin.ts            # scaffold generator (runs via tsx)
│   ├── config-ui.ts                # migrated from config-ui.mjs
│   ├── dist/config-ui.mjs          # compiled config-ui output
│   ├── dev.sh                      # kept as shell
│   ├── check-plugin-versions.sh    # kept as shell
│   └── bump-plugin-version.sh      # kept as shell
│
├── <plugin>/                       # e.g., mysql/
│   ├── src/<plugin>.ts             # CLI entrypoint (includes lazy config check)
│   ├── dist/<plugin>.mjs           # compiled output (node runs this)
│   ├── hooks/                      # only if plugin needs PreToolUse/PostToolUse guards
│   ├── skills/<plugin>/SKILL.md
│   ├── skills/<plugin>/references/
│   ├── .claude-plugin/plugin.json
│   ├── .claude-plugin/hooks.json
│   ├── package.json                # depends on @apex/core
│   └── tsconfig.json               # extends ../../tsconfig.base.json
```

## Shared Package: @apex/core

Thin shared utilities only. No CLI framework, no opinionated abstractions.

### config.ts

```typescript
const CACHE_DIR = join(homedir(), '.cache', 'apex-plugin');

export function configPath(pluginName: string): string {
  return join(CACHE_DIR, `${pluginName}.json`);
}

export async function loadConfig<T extends Record<string, unknown>>(
  pluginName: string
): Promise<T | null> {
  // Read from ~/.cache/apex-plugin/<name>.json
  // Return null if missing, parsed T if exists
}

export async function saveConfig(
  pluginName: string,
  data: Record<string, unknown>,
  merge?: boolean
): Promise<void> {
  // mkdir -p, merge-on-write if merge=true, atomic write
}
```

### types.ts

```typescript
export interface PluginConfig {
  [key: string]: unknown;
}

export interface SchemaField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'number' | 'textarea' | 'checkbox';
  required?: boolean;
  options?: string[];        // for select type
  placeholder?: string;
  lang?: Record<string, string>; // i18n labels
}

export interface HookResult {
  exitCode: number;
  message?: string;
}

export interface CLIArgs {
  command: string;
  flags: Record<string, string | boolean | number>;
  positional: string[];
}
```

### errors.ts

```typescript
export class PluginError extends Error {
  constructor(
    message: string,
    public readonly code: 'CONFIG_MISSING' | 'CONFIG_INVALID' | 'AUTH_FAILED' | 'QUERY_FAILED',
    public readonly exitCode: number = 1
  ) {
    super(message);
    this.name = 'PluginError';
  }
}
```

## Build System

### Toolchain

| Tool | Purpose | Scope |
|------|---------|-------|
| `typescript` | Type checking | Dev dependency at root |
| `tsx` | Run .ts files without compiling | Dev scripts only (create-plugin, local iteration) |
| `esbuild` | Bundle each plugin to single .mjs | Build step, per-plugin |
| `npm workspaces` | Link @apex/core during development | Dev only, not runtime |

### Build Flow

```
src/<plugin>.ts  ──esbuild──►  dist/<plugin>.mjs  (self-contained, @apex/core inlined)
```

Each plugin's `package.json` includes:
```json
{
  "scripts": {
    "build": "esbuild src/<plugin>.ts --bundle --platform=node --format=esm --outfile=dist/<plugin>.mjs --external:mysql2 --external:pg",
    "dev": "tsx src/<plugin>.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

Root `package.json`:
```json
{
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "typecheck": "tsc --build",
    "create-plugin": "tsx scripts/create-plugin.ts"
  },
  "devDependencies": {
    "typescript": "^5.8",
    "tsx": "^4",
    "esbuild": "^0.25"
  }
}
```

### esbuild Configuration

- **Format:** ESM (`--format=esm`)
- **Platform:** Node (`--platform=node`)
- **Bundle:** Yes — inlines `@apex/core` into output
- **Externals:** Native driver packages (`mysql2`, `pg`, `@alicloud/log`) remain external since they have native bindings and are installed per-plugin via `npm install --prefix`
- **Output:** Single `dist/<plugin>.mjs` file per plugin

### Installed Plugin Artifact

When copied to `~/.claude/plugins/marketplaces/apex-plugins/<plugin>/`:
- `dist/<plugin>.mjs` runs with plain `node` — no tsx, no workspace links
- `hooks/<plugin>-setup.sh` runs `npm install --prefix` for native dependencies
- `@apex/core` code is inlined in the bundle — no external reference

## tsconfig.base.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

## Hook Strategy

### Principle: Zero SessionStart Overhead

SessionStart hooks are removed or reduced to no-ops. All validation happens lazily at plugin invocation time.

| Hook Type | Language | Rationale |
|-----------|----------|-----------|
| SessionStart setup | **Removed** | No config checks, no npm install — plugins are self-contained |
| PreToolUse guards | Shell (.sh) or compiled TS | Simple guards stay shell; complex validation compiles to dist/hooks/ |
| PostToolUse monitors | Shell (.sh) | Lightweight, exit-code-based |

### Config Validation: Lazy at Invocation

Config is checked inside the CLI entrypoint when the plugin is actually used, not at session startup. `@apex/core` provides a helper:

```typescript
// packages/core/src/config.ts
export async function requireConfig<T extends Record<string, unknown>>(
  pluginName: string
): Promise<T> {
  const config = await loadConfig<T>(pluginName);
  if (!config) {
    throw new PluginError(
      `No config found. Run: node scripts/dist/config-ui.mjs --config ~/.cache/apex-plugin/${pluginName}.json --schema '...'`,
      'CONFIG_MISSING'
    );
  }
  return config;
}
```

Each plugin CLI calls `requireConfig()` at the top of execution. If config is missing, the error message tells the AI (or user) how to set it up. SKILL.md documents the setup command as a fallback.

### Native Dependency Installation

Moved to build/install time — not runtime:

| When | What |
|------|------|
| `npm run build` (dev) | esbuild bundles plugin; npm workspaces already has deps |
| `scripts/dev.sh` (local test) | Runs `npm install` for plugins with native deps before launching |
| Marketplace install | Plugin's `package.json` `postinstall` or install instructions handle `npm install --prefix` once |
| SessionStart | Nothing — deps are already present |

### config-ui Invocation

When the CLI detects missing config, it outputs the setup command. The AI or user runs it:
```bash
node "${PLUGIN_ROOT}/../../scripts/dist/config-ui.mjs" --config "$CONFIG" --schema '...'
```

## Scaffold Generator

`scripts/create-plugin.ts` — invoked via `tsx scripts/create-plugin.ts --type cli --name my-plugin`

**Inputs:**
- `--name <plugin-name>` — kebab-case plugin name
- `--type cli|mcp|rules` — archetype selection
- `--description <text>` — one-line description

**Actions:**
1. Copy archetype template from `templates/<type>/`
2. Replace `__PLUGIN__` placeholders with plugin name
3. Add entry to `.claude-plugin/marketplace.json`
4. Add plugin directory to root `package.json` workspaces array
5. Run `npm install` to link workspace
6. Print next steps (edit SKILL.md, implement CLI, build)

## Config Path Standardization

All plugins will use `@apex/core`'s `configPath()` which enforces:

```
~/.cache/apex-plugin/<plugin-name>.json
```

**Migrations needed:**
| Plugin | Current Path | Target Path |
|--------|-------------|-------------|
| mysql | `.mysql-connections.json` (project-local) | `~/.cache/apex-plugin/mysql.json` |
| feishu | `.feishu.json` / `feishu.json` (inconsistent) | `~/.cache/apex-plugin/feishu.json` |
| aliyunlog | Inconsistent between hook and CLI | `~/.cache/apex-plugin/aliyunlog.json` |
| ticktick | Already correct | No change |
| postgresql | Already correct | No change |

## Migration Order

Migrate incrementally, one plugin at a time:

1. **@apex/core** — create shared package, types, config loader
2. **config-ui.ts** — migrate top-level utility first (validates toolchain)
3. **ticktick** — simplest CLI plugin, already has correct config path
4. **postgresql** — simple CLI, correct config path
5. **mysql** — CLI + guard hook + config path migration
6. **aliyunlog** — CLI + config path migration
7. **feishu** — MCP server + setup + config path migration
8. **find-skills** — thin shell wrapper, minimal migration
9. **jetbrains, augment-mcp** — MCP config only, no script migration
10. **p3c, kotlin-architect** — rules/skills only, add tsconfig for any future scripts

## Standards

### File Naming
- Plugin directories: kebab-case (`my-plugin`)
- CLI entrypoints: `src/<plugin>.ts`
- Compiled output: `dist/<plugin>.mjs`
- Guard hooks: `hooks/<plugin>-guard.ts` → `dist/hooks/<plugin>-guard.mjs`
- MCP servers: `src/<plugin>-mcp-start.ts`
- No SessionStart setup hooks — config validation is in the CLI entrypoint

### Module System
- All TypeScript: ESM (`type: "module"` in package.json)
- No `.cjs` files in new code
- Existing CJS in get-shit-done is removed (plugin excluded)

### Code Style
- Strict TypeScript (`strict: true`)
- No `any` — use `unknown` and narrow
- Explicit return types on exported functions
- Errors are `PluginError` instances with typed codes

### SKILL.md Frontmatter
```yaml
---
name: <plugin-name>
description: >-
  Trigger patterns for AI detection
model: sonnet
allowed-tools: Bash(node:*), Read, AskUserQuestion
---
```

### Versioning
- Unchanged: `plugin.json`, `package.json`, `marketplace.json` must stay in sync
- `bash scripts/bump-plugin-version.sh <plugin> <version>` continues to work
- `check-plugin-versions.sh` PostToolUse hook enforces sync

## Out of Scope

- **get-shit-done plugin** — removed from project
- **Monorepo publish** — no npm registry publishing; plugins are installed via marketplace copy
- **Runtime tsx** — tsx is dev-only; installed plugins run compiled JS
- **CLI framework** — no commander/yargs in @apex/core; each plugin parses its own args
- **Test framework** — can be added later per-plugin as needed
