# TypeScript Plugin SDK Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate apex-plugins from mixed JS/shell to a TypeScript monorepo with a thin shared `@apex/core` package, esbuild-compiled per-plugin bundles, and archetype-aware scaffold generator.

**Architecture:** npm workspaces monorepo. `@apex/core` provides config loading, types, and error handling. Each plugin compiles via esbuild to a self-contained `dist/<plugin>.mjs` that runs with plain `node`. SessionStart hooks are removed; config is validated lazily at plugin invocation time.

**Tech Stack:** TypeScript 5.8+, esbuild, tsx (dev only), npm workspaces, Node.js ESM

**Spec:** `docs/superpowers/specs/2026-04-02-typescript-plugin-sdk-design.md`

---

## Phase 1: Foundation

### Task 1: Root Toolchain Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Modify: `.gitignore`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "apex-plugins",
  "private": true,
  "type": "module",
  "workspaces": [
    "packages/*"
  ],
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

Note: Plugin directories will be added to `workspaces` as they are migrated.

- [ ] **Step 2: Create tsconfig.base.json**

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

- [ ] **Step 3: Update .gitignore**

Add these lines to the existing `.gitignore`:

```
node_modules/
dist/
*.tsbuildinfo
```

- [ ] **Step 4: Install root dependencies**

Run: `npm install`
Expected: `node_modules/` created with typescript, tsx, esbuild

- [ ] **Step 5: Verify toolchain**

Run: `npx tsc --version`
Expected: `Version 5.8.x`

Run: `npx esbuild --version`
Expected: `0.25.x`

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.base.json package-lock.json .gitignore
git commit -m "feat: add root TypeScript toolchain with esbuild and tsx"
```

---

### Task 2: Create @apex/core Package

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/src/types.ts`
- Create: `packages/core/src/errors.ts`
- Create: `packages/core/src/config.ts`
- Create: `packages/core/src/index.ts`

- [ ] **Step 1: Create packages/core/package.json**

```json
{
  "name": "@apex/core",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "files": ["dist"]
}
```

- [ ] **Step 2: Create packages/core/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create packages/core/src/types.ts**

```typescript
export interface PluginConfig {
  [key: string]: unknown;
}

export interface SchemaField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'number' | 'textarea' | 'checkbox';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  lang?: Record<string, string>;
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

- [ ] **Step 4: Create packages/core/src/errors.ts**

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

- [ ] **Step 5: Create packages/core/src/config.ts**

```typescript
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { PluginError } from './errors.js';

const CACHE_DIR = join(homedir(), '.cache', 'apex-plugin');

export function configPath(pluginName: string): string {
  return join(CACHE_DIR, `${pluginName}.json`);
}

export async function loadConfig<T extends Record<string, unknown>>(
  pluginName: string
): Promise<T | null> {
  const path = configPath(pluginName);
  if (!existsSync(path)) return null;
  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (e) {
    throw new PluginError(
      `Failed to parse config at ${path}: ${(e as Error).message}`,
      'CONFIG_INVALID'
    );
  }
}

export async function saveConfig(
  pluginName: string,
  data: Record<string, unknown>,
  merge = false
): Promise<void> {
  const path = configPath(pluginName);
  await mkdir(dirname(path), { recursive: true });

  let finalData = data;
  if (merge) {
    const existing = await loadConfig(pluginName);
    if (existing) {
      finalData = { ...existing, ...data };
    }
  }

  await writeFile(path, JSON.stringify(finalData, null, 2) + '\n', 'utf-8');
}

export async function requireConfig<T extends Record<string, unknown>>(
  pluginName: string
): Promise<T> {
  const config = await loadConfig<T>(pluginName);
  if (!config) {
    throw new PluginError(
      `No config found at ${configPath(pluginName)}. Run the plugin setup to configure credentials.`,
      'CONFIG_MISSING'
    );
  }
  return config;
}
```

- [ ] **Step 6: Create packages/core/src/index.ts**

```typescript
export { configPath, loadConfig, saveConfig, requireConfig } from './config.js';
export { PluginError } from './errors.js';
export type { PluginConfig, SchemaField, HookResult, CLIArgs } from './types.js';
```

- [ ] **Step 7: Build @apex/core**

Run: `npm run build --workspace=packages/core`
Expected: `packages/core/dist/` created with `.js` and `.d.ts` files

- [ ] **Step 8: Verify exports resolve**

Run: `node -e "import('@apex/core').then(m => console.log(Object.keys(m)))"`
Expected: `['configPath', 'loadConfig', 'saveConfig', 'requireConfig', 'PluginError']`

- [ ] **Step 9: Commit**

```bash
git add packages/core/
git commit -m "feat: create @apex/core shared package with config, types, and errors"
```

---

### Task 3: Remove get-shit-done and Update Marketplace

**Files:**
- Modify: `.claude-plugin/marketplace.json`
- Remove: `get-shit-done/` directory

- [ ] **Step 1: Remove get-shit-done entry from marketplace.json**

Remove the get-shit-done plugin entry from `.claude-plugin/marketplace.json`:

```json
    {
      "name": "get-shit-done",
      "version": "1.25.1",
      "source": "./get-shit-done",
      "description": "Meta-prompting, context engineering and spec-driven development system. Solves context rot with phased execution, parallel subagents, and atomic commits."
    },
```

- [ ] **Step 2: Delete the get-shit-done directory**

Run: `rm -rf get-shit-done/`

- [ ] **Step 3: Verify marketplace.json is valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf-8')); console.log('OK')"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add .claude-plugin/marketplace.json
git rm -r get-shit-done/
git commit -m "chore: remove get-shit-done plugin from project"
```

---

## Phase 2: First Migration (Validates Pattern)

### Task 4: Migrate config-ui.mjs to TypeScript

**Files:**
- Create: `scripts/config-ui.ts` (migrate from `scripts/config-ui.mjs`)
- Remove: `scripts/config-ui.mjs` (after migration verified)

This is an 830-line file. The migration is primarily:
1. Add type annotations to function parameters and return types
2. Replace `require`/dynamic imports with ESM imports
3. Type the schema/form handling logic
4. Type the HTTP server request/response handling

- [ ] **Step 1: Copy and rename**

Run: `cp scripts/config-ui.mjs scripts/config-ui.ts`

- [ ] **Step 2: Add type annotations**

Key transformations to apply throughout `scripts/config-ui.ts`:

At the top of the file, add the `@apex/core` import and any needed Node types:
```typescript
import type { SchemaField } from '@apex/core';
import type { IncomingMessage, ServerResponse } from 'http';
```

Type function signatures. Key functions to type:
- `parseArgs()` — return type: `{ config: string; schema: SchemaObject; lang: string }`
- `startServer(config, schema, lang)` — return type: `Promise<{ port: number; url: string }>`
- `handleFormSubmit(req, res, config, schema)` — return type: `Promise<void>`
- `generateHTML(schema, csrfToken, lang)` — return type: `string`

Replace `any` types from the JS code with proper types. For the schema object:
```typescript
interface SchemaObject {
  title?: string;
  description?: string;
  fields: SchemaField[];
  lang?: string;
  i18n?: Record<string, Record<string, string>>;
}
```

Replace untyped `let`/`const` declarations with typed ones where inference is insufficient.

- [ ] **Step 3: Build config-ui.ts with esbuild**

Run: `npx esbuild scripts/config-ui.ts --bundle --platform=node --format=esm --outfile=scripts/dist/config-ui.mjs`
Expected: `scripts/dist/config-ui.mjs` created

- [ ] **Step 4: Verify the compiled output works**

Run: `node scripts/dist/config-ui.mjs --help 2>&1 || true`
Expected: Usage output or no errors (config-ui exits if no --config is given)

Run: `node scripts/dist/config-ui.mjs --config /tmp/test-config.json --schema '{"title":"Test","fields":[{"key":"test","label":"Test","type":"text"}]}' &`
Wait 2 seconds, then kill the background process. Verify it started without errors.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit scripts/config-ui.ts --esModuleInterop --module ESNext --moduleResolution bundler --target ES2022 --strict`
Expected: No errors (or fix any type errors that surface)

- [ ] **Step 6: Remove old config-ui.mjs**

Run: `rm scripts/config-ui.mjs`

- [ ] **Step 7: Commit**

```bash
git add scripts/config-ui.ts scripts/dist/config-ui.mjs
git rm scripts/config-ui.mjs
git commit -m "refactor: migrate config-ui to TypeScript with esbuild compilation"
```

---

### Task 5: Migrate ticktick Plugin (Reference Pattern)

This is the first plugin migration and establishes the pattern for all subsequent plugins. Follow every step exactly.

**Files:**
- Create: `ticktick/src/ticktick.ts` (migrate from `ticktick/scripts/ticktick.mjs`)
- Create: `ticktick/package.json`
- Create: `ticktick/tsconfig.json`
- Modify: `ticktick/hooks/hooks.json` (remove SessionStart hook)
- Modify: `package.json` (add ticktick to workspaces)
- Remove: `ticktick/scripts/ticktick.mjs` (after migration verified)
- Remove: `ticktick/hooks/ticktick-setup.sh` (no longer needed)

- [ ] **Step 1: Create ticktick/package.json**

```json
{
  "name": "ticktick",
  "version": "0.2.0",
  "type": "module",
  "scripts": {
    "build": "esbuild src/ticktick.ts --bundle --platform=node --format=esm --outfile=dist/ticktick.mjs",
    "dev": "tsx src/ticktick.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@apex/core": "*"
  }
}
```

- [ ] **Step 2: Create ticktick/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Add ticktick to root workspaces**

In root `package.json`, add `"ticktick"` to the workspaces array:
```json
{
  "workspaces": [
    "packages/*",
    "ticktick"
  ]
}
```

- [ ] **Step 4: Run npm install to link workspace**

Run: `npm install`
Expected: ticktick linked to @apex/core via workspace

- [ ] **Step 5: Create ticktick/src/ directory**

Run: `mkdir -p ticktick/src`

- [ ] **Step 6: Migrate ticktick.mjs to ticktick.ts**

Copy `ticktick/scripts/ticktick.mjs` to `ticktick/src/ticktick.ts` and apply these transformations:

**a) Replace config loading with @apex/core:**

Remove the existing `loadEnv()`, `findEnvPath()`, and config parsing code. Replace with:
```typescript
import { requireConfig, configPath } from '@apex/core';

interface TickTickConfig {
  host: string;
  username: string;
  password: string;
  deviceId?: string;
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
}

// At the top of the main function:
const config = await requireConfig<TickTickConfig>('ticktick');
```

Note: ticktick currently uses `.env` format at `~/.cache/apex-plugin/ticktick.env`. This migration changes it to JSON format at `~/.cache/apex-plugin/ticktick.json`. The `.env` keys map to JSON as:
- `TICKTICK_HOST` → `host`
- `TICKTICK_USERNAME` → `username`
- `TICKTICK_PASSWORD` → `password`
- `TICKTICK_DEVICE_ID` → `deviceId`
- `TICKTICK_ACCESS_TOKEN` → `accessToken`
- `TICKTICK_CLIENT_ID` → `clientId`
- `TICKTICK_CLIENT_SECRET` → `clientSecret`

**b) Add type annotations** to all function parameters, return types, and variables where inference is insufficient. Key areas:
- API response types (projects, tasks, tags, habits)
- HTTP request/response handling
- CLI argument parsing

**c) Replace `process.exit(1)` with `throw new PluginError(...)` where appropriate:**
```typescript
import { PluginError } from '@apex/core';
```

**d) Update the shebang to `#!/usr/bin/env node`** (it will run the compiled .mjs)

- [ ] **Step 7: Update ticktick SKILL.md**

In `ticktick/skills/ticktick/SKILL.md`, update any references to the script path:
- Old: `node ${CLAUDE_PLUGIN_ROOT}/scripts/ticktick.mjs`
- New: `node ${CLAUDE_PLUGIN_ROOT}/dist/ticktick.mjs`

Also add a setup instruction for when config is missing:
```markdown
If the CLI reports CONFIG_MISSING, run the config UI:
`node ${CLAUDE_PLUGIN_ROOT}/../../scripts/dist/config-ui.mjs --config ~/.cache/apex-plugin/ticktick.json --schema '{"title":"TickTick","fields":[{"key":"host","label":"Host","type":"select","required":true,"options":["ticktick.com","dida365.com"]},{"key":"username","label":"Username","type":"text","required":true},{"key":"password","label":"Password","type":"password","required":true}]}'`
```

- [ ] **Step 8: Remove SessionStart hook from hooks.json**

Replace `ticktick/hooks/hooks.json` with an empty hooks file (no SessionStart):

```json
{
  "hooks": {}
}
```

- [ ] **Step 9: Delete old files**

Run: `rm ticktick/scripts/ticktick.mjs ticktick/hooks/ticktick-setup.sh`

If the `ticktick/scripts/` directory is now empty, remove it:
Run: `rmdir ticktick/scripts/ 2>/dev/null || true`

- [ ] **Step 10: Build**

Run: `npm run build --workspace=ticktick`
Expected: `ticktick/dist/ticktick.mjs` created

- [ ] **Step 11: Verify the build works**

Run: `node ticktick/dist/ticktick.mjs --help`
Expected: Help output showing available commands

- [ ] **Step 12: Type-check**

Run: `npm run typecheck --workspace=ticktick`
Expected: No errors

- [ ] **Step 13: Commit**

```bash
git add ticktick/src/ticktick.ts ticktick/package.json ticktick/tsconfig.json ticktick/hooks/hooks.json ticktick/skills/ package.json package-lock.json
git rm ticktick/scripts/ticktick.mjs ticktick/hooks/ticktick-setup.sh
git commit -m "feat(ticktick): migrate to TypeScript with @apex/core and esbuild"
```

---

## Phase 3: Plugin Migrations

Each plugin follows the same pattern established in Task 5. Key steps per plugin:
1. Create `<plugin>/package.json` with @apex/core dependency (+ native deps as needed)
2. Create `<plugin>/tsconfig.json` extending base
3. Add plugin to root workspaces, run `npm install`
4. Migrate `.mjs`/`.js` to `src/<plugin>.ts` — replace config loading with `requireConfig()`, add types
5. Update SKILL.md script paths (`scripts/` → `dist/`)
6. Remove SessionStart hook from hooks.json
7. Delete old `.mjs`/`.js` files and setup shell scripts
8. Build with esbuild, verify, type-check
9. Commit

### Task 6: Migrate postgresql

**Files:**
- Create: `postgresql/src/postgresql.ts` (from `postgresql/scripts/postgresql.mjs`)
- Create: `postgresql/tsconfig.json`
- Modify: `postgresql/package.json` (add @apex/core, build scripts)
- Modify: `postgresql/hooks/hooks.json` (remove SessionStart)
- Modify: `package.json` (add postgresql to workspaces)
- Remove: `postgresql/scripts/postgresql.mjs`
- Remove: `postgresql/hooks/postgresql-setup.sh`

- [ ] **Step 1: Create postgresql/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Update postgresql/package.json**

Add to the existing package.json (which already has `pg` as a dependency):
```json
{
  "name": "postgresql",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "build": "esbuild src/postgresql.ts --bundle --platform=node --format=esm --outfile=dist/postgresql.mjs --external:pg",
    "dev": "tsx src/postgresql.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@apex/core": "*",
    "pg": "^8.20.0"
  }
}
```

Note: `pg` is external in esbuild — it has native bindings and must be installed per-plugin.

- [ ] **Step 3: Add postgresql to root workspaces and install**

Add `"postgresql"` to root `package.json` workspaces array. Run: `npm install`

- [ ] **Step 4: Migrate postgresql.mjs to src/postgresql.ts**

Copy `postgresql/scripts/postgresql.mjs` to `postgresql/src/postgresql.ts`.

Key transformations:
```typescript
import { requireConfig, PluginError } from '@apex/core';
import pg from 'pg';

interface PostgresConnectionConfig {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean | Record<string, unknown>;
}

interface PostgresConfig {
  connections: Record<string, PostgresConnectionConfig>;
}

// Replace loadConfig() call:
const config = await requireConfig<PostgresConfig>('postgresql');
```

Remove the existing `loadConfig()` function and `CONFIG_PATH` constant.
Remove `createRequire` import (use `pg` as ESM import).
Add type annotations to all functions.

- [ ] **Step 5: Update SKILL.md script path**

Change `scripts/postgresql.mjs` to `dist/postgresql.mjs` in `postgresql/skills/postgresql/SKILL.md`.

Add CONFIG_MISSING setup instruction (same pattern as ticktick Task 5, Step 7, with PostgreSQL schema fields).

- [ ] **Step 6: Remove SessionStart hook**

Replace `postgresql/hooks/hooks.json` SessionStart entry with empty hooks:
```json
{
  "hooks": {}
}
```

- [ ] **Step 7: Delete old files**

```bash
rm postgresql/scripts/postgresql.mjs postgresql/hooks/postgresql-setup.sh
rmdir postgresql/scripts/ 2>/dev/null || true
```

- [ ] **Step 8: Build, verify, type-check**

```bash
npm run build --workspace=postgresql
node postgresql/dist/postgresql.mjs --help
npm run typecheck --workspace=postgresql
```

- [ ] **Step 9: Commit**

```bash
git add postgresql/src/postgresql.ts postgresql/package.json postgresql/tsconfig.json postgresql/hooks/hooks.json postgresql/skills/ package.json package-lock.json
git rm postgresql/scripts/postgresql.mjs postgresql/hooks/postgresql-setup.sh
git commit -m "feat(postgresql): migrate to TypeScript with @apex/core and esbuild"
```

---

### Task 7: Migrate mysql

**Files:**
- Create: `mysql/src/mysql.ts` (from `mysql/scripts/mysql.mjs`)
- Create: `mysql/tsconfig.json`
- Modify: `mysql/package.json` (add @apex/core, build scripts)
- Modify: `mysql/hooks/hooks.json` (remove SessionStart, keep PreToolUse guard)
- Modify: `package.json` (add mysql to workspaces)
- Remove: `mysql/scripts/mysql.mjs`
- Remove: `mysql/hooks/mysql-setup.sh`

MySQL has two additional concerns vs postgresql:
1. **Config path fix:** Current code reads `.mysql-connections.json` — must change to `mysql.json` via `requireConfig('mysql')`
2. **PreToolUse guard hook:** `mysql/hooks/guard-write-sql.js` must be kept (it blocks unsafe SQL). This hook stays in hooks.json.

- [ ] **Step 1: Create mysql/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Update mysql/package.json**

```json
{
  "name": "mysql",
  "version": "0.6.1",
  "type": "module",
  "scripts": {
    "build": "esbuild src/mysql.ts --bundle --platform=node --format=esm --outfile=dist/mysql.mjs --external:mysql2",
    "dev": "tsx src/mysql.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@apex/core": "*",
    "mysql2": "^3"
  }
}
```

- [ ] **Step 3: Add mysql to root workspaces and install**

Add `"mysql"` to root `package.json` workspaces array. Run: `npm install`

- [ ] **Step 4: Migrate mysql.mjs to src/mysql.ts**

Copy `mysql/scripts/mysql.mjs` to `mysql/src/mysql.ts`.

Key transformations:
```typescript
import { requireConfig, PluginError } from '@apex/core';
import mysql from 'mysql2/promise';

interface MySQLConnectionConfig {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
}

interface MySQLConfig {
  connections: Record<string, MySQLConnectionConfig>;
}

// Replace loadConfig(), findLegacyConfig(), CONFIG_PATH, LEGACY_CONFIG_DIR, LEGACY_CONFIG_FILE:
const config = await requireConfig<MySQLConfig>('mysql');
```

Remove all legacy config fallback code (`.claude/.mysql-connections.json` path walking). The migration to `~/.cache/apex-plugin/mysql.json` is the standardized path via `requireConfig()`.

Remove `createRequire` import, use ESM import for mysql2.
Add type annotations to all functions.

- [ ] **Step 5: Update hooks.json — remove SessionStart, keep PreToolUse guard**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/guard-write-sql.js",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

Note: The guard hook (`guard-write-sql.js`) stays as JS for now. It's a small file that reads stdin and exits 0/2 — minimal benefit from TypeScript migration. Can be migrated later.

- [ ] **Step 6: Update SKILL.md script path**

Change `scripts/mysql.mjs` to `dist/mysql.mjs` in `mysql/skills/mysql/SKILL.md`.

Add CONFIG_MISSING setup instruction with MySQL schema fields.

- [ ] **Step 7: Delete old files**

```bash
rm mysql/scripts/mysql.mjs mysql/hooks/mysql-setup.sh
rmdir mysql/scripts/ 2>/dev/null || true
```

- [ ] **Step 8: Build, verify, type-check**

```bash
npm run build --workspace=mysql
node mysql/dist/mysql.mjs --help
npm run typecheck --workspace=mysql
```

- [ ] **Step 9: Commit**

```bash
git add mysql/src/mysql.ts mysql/package.json mysql/tsconfig.json mysql/hooks/hooks.json mysql/skills/ package.json package-lock.json
git rm mysql/scripts/mysql.mjs mysql/hooks/mysql-setup.sh
git commit -m "feat(mysql): migrate to TypeScript, fix config path to mysql.json"
```

---

### Task 8: Migrate aliyunlog

**Files:**
- Create: `aliyunlog/src/aliyunlog.ts` (from `aliyunlog/scripts/aliyunlog.mjs`)
- Create: `aliyunlog/tsconfig.json`
- Modify: `aliyunlog/package.json` (add @apex/core, build scripts)
- Modify: `aliyunlog/hooks/hooks.json` (remove SessionStart)
- Modify: `package.json` (add aliyunlog to workspaces)
- Remove: `aliyunlog/scripts/aliyunlog.mjs`
- Remove: `aliyunlog/hooks/aliyunlog-setup.sh`

Aliyunlog has a **config path inconsistency** between hook and CLI. This migration fixes it by using `requireConfig('aliyunlog')` which enforces `~/.cache/apex-plugin/aliyunlog.json`.

- [ ] **Step 1: Create aliyunlog/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Update aliyunlog/package.json**

```json
{
  "name": "aliyunlog",
  "version": "1.1.2",
  "type": "module",
  "scripts": {
    "build": "esbuild src/aliyunlog.ts --bundle --platform=node --format=esm --outfile=dist/aliyunlog.mjs --external:@alicloud/log",
    "dev": "tsx src/aliyunlog.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@apex/core": "*",
    "@alicloud/log": "^1.2.5"
  }
}
```

- [ ] **Step 3: Add aliyunlog to root workspaces and install**

Add `"aliyunlog"` to root `package.json` workspaces array. Run: `npm install`

- [ ] **Step 4: Migrate aliyunlog.mjs to src/aliyunlog.ts**

Copy `aliyunlog/scripts/aliyunlog.mjs` to `aliyunlog/src/aliyunlog.ts`.

Key transformations:
```typescript
import { requireConfig, PluginError } from '@apex/core';

interface AliyunLogConfig {
  accessKeyId: string;
  accessKeySecret: string;
  endpoint: string;
  projects?: Record<string, string>;
}

const config = await requireConfig<AliyunLogConfig>('aliyunlog');
```

Remove existing config loading code and path constants. Fix any inconsistent config path references.
Add type annotations to all functions.

- [ ] **Step 5: Update SKILL.md and remove SessionStart hook**

Update `aliyunlog/skills/aliyunlog/SKILL.md`: change `scripts/aliyunlog.mjs` to `dist/aliyunlog.mjs`.

Replace hooks.json SessionStart with empty hooks:
```json
{
  "hooks": {}
}
```

- [ ] **Step 6: Delete old files**

```bash
rm aliyunlog/scripts/aliyunlog.mjs aliyunlog/hooks/aliyunlog-setup.sh
rmdir aliyunlog/scripts/ 2>/dev/null || true
```

- [ ] **Step 7: Build, verify, type-check**

```bash
npm run build --workspace=aliyunlog
node aliyunlog/dist/aliyunlog.mjs --help
npm run typecheck --workspace=aliyunlog
```

- [ ] **Step 8: Commit**

```bash
git add aliyunlog/src/aliyunlog.ts aliyunlog/package.json aliyunlog/tsconfig.json aliyunlog/hooks/hooks.json aliyunlog/skills/ package.json package-lock.json
git rm aliyunlog/scripts/aliyunlog.mjs aliyunlog/hooks/aliyunlog-setup.sh
git commit -m "feat(aliyunlog): migrate to TypeScript, fix config path consistency"
```

---

### Task 9: Migrate feishu

**Files:**
- Create: `feishu/src/feishu-mcp-start.ts` (from `feishu/scripts/feishu-mcp-start.js`)
- Create: `feishu/tsconfig.json`
- Modify: `feishu/package.json` (add @apex/core, build scripts)
- Modify: `feishu/hooks/hooks.json` (remove SessionStart)
- Modify: `package.json` (add feishu to workspaces)
- Remove: `feishu/scripts/feishu-mcp-start.js`
- Remove: `feishu/scripts/feishu-setup.js`
- Remove: `feishu/hooks/feishu-setup.sh` (if exists)

Feishu is an MCP plugin. Its main script is the MCP server starter, not a CLI. The config path is inconsistent (`.feishu.json` vs `feishu.json`) — this migration fixes it to `~/.cache/apex-plugin/feishu.json`.

- [ ] **Step 1: Create feishu/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Update feishu/package.json**

Preserve existing dependencies (feishu MCP server deps) and add:
```json
{
  "name": "feishu",
  "version": "0.5.0",
  "type": "module",
  "scripts": {
    "build": "esbuild src/feishu-mcp-start.ts --bundle --platform=node --format=esm --outfile=dist/feishu-mcp-start.mjs --external:@anthropic-ai/sdk",
    "dev": "tsx src/feishu-mcp-start.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@apex/core": "*"
  }
}
```

Preserve any existing MCP-related dependencies. Mark them as external in the esbuild command if they have native bindings.

- [ ] **Step 3: Add feishu to root workspaces and install**

Add `"feishu"` to root `package.json` workspaces array. Run: `npm install`

- [ ] **Step 4: Migrate feishu-mcp-start.js to src/feishu-mcp-start.ts**

Copy `feishu/scripts/feishu-mcp-start.js` to `feishu/src/feishu-mcp-start.ts`.

Key transformations:
```typescript
import { requireConfig, PluginError } from '@apex/core';

interface FeishuConfig {
  appId: string;
  appSecret: string;
  [key: string]: unknown;
}

const config = await requireConfig<FeishuConfig>('feishu');
```

Fix the config path inconsistency — all references should use `requireConfig('feishu')` which resolves to `~/.cache/apex-plugin/feishu.json`.

- [ ] **Step 5: Update .mcp.json server command path**

In `feishu/.mcp.json`, update the command to point to the compiled output:
- Old: `node scripts/feishu-mcp-start.js`
- New: `node dist/feishu-mcp-start.mjs`

- [ ] **Step 6: Remove SessionStart hook and old files**

Replace hooks.json SessionStart with empty hooks:
```json
{
  "hooks": {}
}
```

```bash
rm feishu/scripts/feishu-mcp-start.js feishu/scripts/feishu-setup.js
rmdir feishu/scripts/ 2>/dev/null || true
```

- [ ] **Step 7: Build, verify, type-check**

```bash
npm run build --workspace=feishu
npm run typecheck --workspace=feishu
```

(MCP server can't easily be verified with `--help` — just check the build succeeds and types pass.)

- [ ] **Step 8: Commit**

```bash
git add feishu/src/feishu-mcp-start.ts feishu/package.json feishu/tsconfig.json feishu/hooks/hooks.json feishu/.mcp.json package.json package-lock.json
git rm feishu/scripts/feishu-mcp-start.js feishu/scripts/feishu-setup.js
git commit -m "feat(feishu): migrate MCP server to TypeScript, fix config path to feishu.json"
```

---

### Task 10: Migrate find-skills

**Files:**
- Modify: `find-skills/hooks/hooks.json` (remove SessionStart if present)
- Remove: `find-skills/hooks/setup.sh` (if exists)

find-skills is a thin shell wrapper around `skills.sh`. It has no substantial JS scripts to migrate — the skill is implemented via SKILL.md and a simple shell call. The only change is removing the SessionStart hook.

- [ ] **Step 1: Check current hooks.json**

Read `find-skills/hooks/hooks.json` (or `find-skills/.claude-plugin/hooks.json`). If it has a SessionStart hook, replace with empty hooks:

```json
{
  "hooks": {}
}
```

- [ ] **Step 2: Remove setup script if it exists**

```bash
rm -f find-skills/hooks/setup.sh find-skills/hooks/find-skills-setup.sh
```

- [ ] **Step 3: Commit**

```bash
git add find-skills/
git commit -m "chore(find-skills): remove SessionStart hook"
```

---

### Task 11: Clean Up Config-Only Plugins

**Files:**
- Modify: `jetbrains/hooks/hooks.json` (remove SessionStart if present)
- Modify: `augment/hooks/hooks.json` (remove SessionStart if present)
- Remove: `augment/hooks/setup.sh` (generic name, should be removed)

jetbrains, augment-mcp, p3c, and kotlin-architect have no scripts to migrate. The only change is removing any SessionStart hooks.

- [ ] **Step 1: Remove SessionStart hooks from jetbrains and augment**

For each plugin that has a SessionStart hook in its hooks.json, replace with empty hooks:
```json
{
  "hooks": {}
}
```

Delete `augment/hooks/setup.sh` (generic-named, should have been `augment-setup.sh` — now obsolete).

- [ ] **Step 2: Verify p3c and kotlin-architect have no hooks to remove**

These are rules/skills-only plugins. Check their hooks.json files and confirm no SessionStart entries exist.

- [ ] **Step 3: Commit**

```bash
git add jetbrains/ augment/ p3c/ kotlin-architect/
git rm -f augment/hooks/setup.sh
git commit -m "chore: remove SessionStart hooks from config-only plugins"
```

---

## Phase 4: Scaffold and Templates

### Task 12: Create CLI Plugin Template

**Files:**
- Create: `templates/cli/src/__PLUGIN__.ts`
- Create: `templates/cli/skills/__PLUGIN__/SKILL.md`
- Create: `templates/cli/skills/__PLUGIN__/references/config-schema.md`
- Create: `templates/cli/skills/__PLUGIN__/references/troubleshooting.md`
- Create: `templates/cli/.claude-plugin/plugin.json`
- Create: `templates/cli/.claude-plugin/hooks.json`
- Create: `templates/cli/package.json`
- Create: `templates/cli/tsconfig.json`

- [ ] **Step 1: Create templates/cli/src/__PLUGIN__.ts**

```typescript
#!/usr/bin/env node
import { requireConfig, PluginError } from '@apex/core';

interface __PLUGIN_PASCAL__Config {
  // Add config fields here
  [key: string]: unknown;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`Usage: node dist/__PLUGIN__.mjs <command> [options]

Commands:
  --help       Show this help
  --test       Test configuration
  --list       List available items

Config: ~/.cache/apex-plugin/__PLUGIN__.json`);
    return;
  }

  const config = await requireConfig<__PLUGIN_PASCAL__Config>('__PLUGIN__');

  if (args.includes('--test')) {
    console.log('Config loaded successfully.');
    return;
  }

  // Implement commands here
  console.error(`Unknown command: ${args[0]}`);
  process.exit(1);
}

main().catch((err: unknown) => {
  if (err instanceof PluginError) {
    console.error(`Error [${err.code}]: ${err.message}`);
    process.exit(err.exitCode);
  }
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Create templates/cli/.claude-plugin/plugin.json**

```json
{
  "name": "__PLUGIN__",
  "version": "0.1.0",
  "description": "__DESCRIPTION__",
  "author": {
    "name": "Robotees"
  },
  "keywords": ["__PLUGIN__"]
}
```

- [ ] **Step 3: Create templates/cli/.claude-plugin/hooks.json**

```json
{
  "hooks": {}
}
```

- [ ] **Step 4: Create templates/cli/package.json**

```json
{
  "name": "__PLUGIN__",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "build": "esbuild src/__PLUGIN__.ts --bundle --platform=node --format=esm --outfile=dist/__PLUGIN__.mjs",
    "dev": "tsx src/__PLUGIN__.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@apex/core": "*"
  }
}
```

- [ ] **Step 5: Create templates/cli/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Create templates/cli/skills/__PLUGIN__/SKILL.md**

```markdown
---
name: __PLUGIN__
description: >-
  __DESCRIPTION__
model: sonnet
allowed-tools: Bash(node:*), Read, AskUserQuestion
---

# __PLUGIN__

## Usage

\`\`\`bash
node ${CLAUDE_PLUGIN_ROOT}/dist/__PLUGIN__.mjs <command> [options]
\`\`\`

## Commands

- `--help` — Show usage
- `--test` — Test configuration
- `--list` — List available items

## Setup

If CONFIG_MISSING error appears, configure credentials:
\`\`\`bash
node ${CLAUDE_PLUGIN_ROOT}/../../scripts/dist/config-ui.mjs --config ~/.cache/apex-plugin/__PLUGIN__.json --schema '{"title":"__PLUGIN_TITLE__","fields":[{"key":"apiKey","label":"API Key","type":"password","required":true}]}'
\`\`\`
```

- [ ] **Step 7: Create reference docs**

`templates/cli/skills/__PLUGIN__/references/config-schema.md`:
```markdown
# __PLUGIN__ Config Schema

Config location: `~/.cache/apex-plugin/__PLUGIN__.json`

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| (add fields) | | | |
```

`templates/cli/skills/__PLUGIN__/references/troubleshooting.md`:
```markdown
# __PLUGIN__ Troubleshooting

## CONFIG_MISSING

Config file not found. Run the setup command shown in the error message.

## AUTH_FAILED

Check credentials in `~/.cache/apex-plugin/__PLUGIN__.json`.
```

- [ ] **Step 8: Commit**

```bash
git add templates/cli/
git commit -m "feat: add CLI plugin template for scaffold generator"
```

---

### Task 13: Create MCP Plugin Template

**Files:**
- Create: `templates/mcp/src/__PLUGIN__-mcp-start.ts`
- Create: `templates/mcp/.mcp.json`
- Create: `templates/mcp/.claude-plugin/plugin.json`
- Create: `templates/mcp/.claude-plugin/hooks.json`
- Create: `templates/mcp/package.json`
- Create: `templates/mcp/tsconfig.json`

- [ ] **Step 1: Create templates/mcp/src/__PLUGIN__-mcp-start.ts**

```typescript
#!/usr/bin/env node
import { requireConfig, PluginError } from '@apex/core';

interface __PLUGIN_PASCAL__Config {
  [key: string]: unknown;
}

async function main(): Promise<void> {
  const config = await requireConfig<__PLUGIN_PASCAL__Config>('__PLUGIN__');

  // MCP server startup logic here
  console.log('[__PLUGIN__] MCP server starting...');
}

main().catch((err: unknown) => {
  if (err instanceof PluginError) {
    console.error(`Error [${err.code}]: ${err.message}`);
    process.exit(err.exitCode);
  }
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Create templates/mcp/.mcp.json**

```json
{
  "mcpServers": {
    "__PLUGIN__": {
      "command": "node",
      "args": ["dist/__PLUGIN__-mcp-start.mjs"]
    }
  }
}
```

- [ ] **Step 3: Create remaining template files**

Same pattern as CLI template (Step 2-5 from Task 12) but with MCP-specific build script:

`templates/mcp/package.json`:
```json
{
  "name": "__PLUGIN__",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "build": "esbuild src/__PLUGIN__-mcp-start.ts --bundle --platform=node --format=esm --outfile=dist/__PLUGIN__-mcp-start.mjs",
    "dev": "tsx src/__PLUGIN__-mcp-start.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@apex/core": "*"
  }
}
```

`templates/mcp/.claude-plugin/plugin.json`, `templates/mcp/.claude-plugin/hooks.json`, `templates/mcp/tsconfig.json` — identical to CLI template equivalents.

- [ ] **Step 4: Commit**

```bash
git add templates/mcp/
git commit -m "feat: add MCP plugin template for scaffold generator"
```

---

### Task 14: Create Rules Plugin Template

**Files:**
- Create: `templates/rules/skills/__PLUGIN__/SKILL.md`
- Create: `templates/rules/.claude-plugin/plugin.json`
- Create: `templates/rules/.claude-plugin/hooks.json`

- [ ] **Step 1: Create template files**

`templates/rules/.claude-plugin/plugin.json`:
```json
{
  "name": "__PLUGIN__",
  "version": "0.1.0",
  "description": "__DESCRIPTION__",
  "author": {
    "name": "Robotees"
  },
  "keywords": ["__PLUGIN__"]
}
```

`templates/rules/.claude-plugin/hooks.json`:
```json
{
  "hooks": {}
}
```

`templates/rules/skills/__PLUGIN__/SKILL.md`:
```markdown
---
name: __PLUGIN__
description: >-
  __DESCRIPTION__
model: sonnet
allowed-tools: Read
---

# __PLUGIN__

(Add rules and guidelines here)
```

- [ ] **Step 2: Commit**

```bash
git add templates/rules/
git commit -m "feat: add rules-only plugin template for scaffold generator"
```

---

### Task 15: Create Scaffold Generator

**Files:**
- Create: `scripts/create-plugin.ts`

- [ ] **Step 1: Create scripts/create-plugin.ts**

```typescript
#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

interface Args {
  name: string;
  type: 'cli' | 'mcp' | 'rules';
  description: string;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  let name = '';
  let type: 'cli' | 'mcp' | 'rules' = 'cli';
  let description = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) {
      name = args[++i];
    } else if (args[i] === '--type' && args[i + 1]) {
      const t = args[++i];
      if (t !== 'cli' && t !== 'mcp' && t !== 'rules') {
        console.error(`Invalid type: ${t}. Must be cli, mcp, or rules.`);
        process.exit(1);
      }
      type = t;
    } else if (args[i] === '--description' && args[i + 1]) {
      description = args[++i];
    } else if (args[i] === '--help') {
      console.log(`Usage: tsx scripts/create-plugin.ts --name <plugin-name> --type <cli|mcp|rules> --description <text>

Options:
  --name         Plugin name (kebab-case)
  --type         Plugin archetype: cli, mcp, or rules (default: cli)
  --description  One-line description`);
      process.exit(0);
    }
  }

  if (!name) {
    console.error('Error: --name is required');
    process.exit(1);
  }

  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    console.error('Error: Plugin name must be kebab-case (lowercase letters, numbers, hyphens)');
    process.exit(1);
  }

  if (!description) {
    description = `${name} plugin`;
  }

  return { name, type, description };
}

function toPascalCase(kebab: string): string {
  return kebab.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function toTitleCase(kebab: string): string {
  return kebab.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

function copyTemplate(templateDir: string, targetDir: string, replacements: Record<string, string>): void {
  if (!existsSync(templateDir)) {
    console.error(`Template directory not found: ${templateDir}`);
    process.exit(1);
  }

  function processDir(srcDir: string, destDir: string): void {
    mkdirSync(destDir, { recursive: true });
    const entries = readdirSync(srcDir);

    for (const entry of entries) {
      const srcPath = join(srcDir, entry);
      let destName = entry;
      for (const [search, replace] of Object.entries(replacements)) {
        destName = destName.replaceAll(search, replace);
      }
      const destPath = join(destDir, destName);

      if (statSync(srcPath).isDirectory()) {
        processDir(srcPath, destPath);
      } else {
        let content = readFileSync(srcPath, 'utf-8');
        for (const [search, replace] of Object.entries(replacements)) {
          content = content.replaceAll(search, replace);
        }
        writeFileSync(destPath, content);
      }
    }
  }

  processDir(templateDir, targetDir);
}

function addToMarketplace(name: string, description: string): void {
  const mpPath = join(ROOT, '.claude-plugin', 'marketplace.json');
  const mp = JSON.parse(readFileSync(mpPath, 'utf-8'));
  mp.plugins.push({
    name,
    version: '0.1.0',
    source: `./${name}`,
    description
  });
  writeFileSync(mpPath, JSON.stringify(mp, null, 4) + '\n');
}

function addToWorkspaces(name: string): void {
  const pkgPath = join(ROOT, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  if (!pkg.workspaces.includes(name)) {
    pkg.workspaces.push(name);
  }
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function main(): void {
  const { name, type, description } = parseArgs();
  const targetDir = join(ROOT, name);

  if (existsSync(targetDir)) {
    console.error(`Error: Directory '${name}' already exists.`);
    process.exit(1);
  }

  const templateDir = join(ROOT, 'templates', type);
  const replacements: Record<string, string> = {
    '__PLUGIN__': name,
    '__PLUGIN_PASCAL__': toPascalCase(name),
    '__PLUGIN_TITLE__': toTitleCase(name),
    '__DESCRIPTION__': description
  };

  console.log(`Creating ${type} plugin: ${name}`);

  copyTemplate(templateDir, targetDir, replacements);
  addToMarketplace(name, description);

  if (type !== 'rules') {
    addToWorkspaces(name);
    console.log('Running npm install...');
    execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
  }

  console.log(`
Plugin '${name}' created successfully!

Next steps:
  1. Edit ${name}/skills/${name}/SKILL.md — add trigger patterns and usage docs
  2. ${type === 'rules' ? `Add rules to ${name}/skills/${name}/SKILL.md` : `Implement CLI logic in ${name}/src/${name}.ts`}
  ${type !== 'rules' ? `3. Build: npm run build --workspace=${name}` : ''}
  ${type !== 'rules' ? `4. Test: node ${name}/dist/${name}.mjs --help` : ''}
  5. Bump version: bash scripts/bump-plugin-version.sh ${name} 0.1.0
`);
}

main();
```

- [ ] **Step 2: Verify the generator works**

Run: `npx tsx scripts/create-plugin.ts --name test-plugin --type cli --description "Test plugin for verification"`
Expected: `test-plugin/` directory created with all template files, marketplace.json updated, workspaces updated

- [ ] **Step 3: Verify the generated plugin builds**

```bash
npm run build --workspace=test-plugin
node test-plugin/dist/test-plugin.mjs --help
```

Expected: Help output displayed

- [ ] **Step 4: Clean up test plugin**

```bash
rm -rf test-plugin/
```

Revert marketplace.json and package.json changes from the test:
```bash
git checkout .claude-plugin/marketplace.json package.json package-lock.json
npm install
```

- [ ] **Step 5: Commit**

```bash
git add scripts/create-plugin.ts
git commit -m "feat: add scaffold generator for new plugins (cli, mcp, rules archetypes)"
```

---

### Task 16: Update dev.sh for Build Integration

**Files:**
- Modify: `scripts/dev.sh`

- [ ] **Step 1: Add build step to dev.sh**

Before the `claude` command invocation in `scripts/dev.sh`, add a build step that runs `npm run build` for all workspaces:

```bash
# Build all plugins before launching
echo "Building plugins..."
npm run build --workspaces --if-present 2>/dev/null || echo "Warning: some builds failed"
```

This ensures that when a developer runs `scripts/dev.sh`, all plugins are compiled before Claude Code loads them.

- [ ] **Step 2: Update plugin detection**

The current dev.sh detects plugins via `.claude-plugin/plugin.json`. This stays the same — no changes needed to the detection logic.

- [ ] **Step 3: Verify dev.sh works**

Run: `bash scripts/dev.sh --list`
Expected: All plugins listed with versions (minus get-shit-done)

- [ ] **Step 4: Commit**

```bash
git add scripts/dev.sh
git commit -m "chore: add build step to dev.sh before plugin loading"
```

---

### Task 17: Final Verification

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: All workspaces build successfully

- [ ] **Step 2: Type-check all**

Run: `npm run typecheck`
Expected: No type errors

- [ ] **Step 3: Verify marketplace.json**

Run: `node -e "const m=JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf-8')); console.log(m.plugins.length + ' plugins'); m.plugins.forEach(p => console.log('  ' + p.name + ' ' + p.version))"`
Expected: 10 plugins listed (no get-shit-done), correct versions

- [ ] **Step 4: Verify no old .mjs files remain in scripts/ directories**

Run: `find . -path '*/scripts/*.mjs' -not -path './node_modules/*' -not -path './scripts/dist/*'`
Expected: No results (all .mjs files migrated)

- [ ] **Step 5: Verify no SessionStart hooks remain**

Run: `grep -r "SessionStart" --include="hooks.json" --include="*.json" -l . | grep -v node_modules`
Expected: No hooks.json files contain SessionStart entries (except possibly .claude/settings.json which has PostToolUse, not SessionStart)

- [ ] **Step 6: Version check passes**

Run: `bash scripts/check-plugin-versions.sh`
Expected: Exit 0, no version mismatches

- [ ] **Step 7: Commit any remaining changes**

```bash
git add -A
git status
git commit -m "chore: final cleanup after TypeScript migration"
```
