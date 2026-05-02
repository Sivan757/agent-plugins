# Plugin Compiled Release Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add typed plugin metadata generation and clean packed plugin artifacts while keeping hooks and other runtime configs native.

**Architecture:** `scripts/plugin-config.ts` owns typed metadata loading, manifest rendering, marketplace rendering, validation, and packing. Small CLI wrappers call that module. Per-plugin `plugin.config.ts` files become the metadata source of truth; hooks, MCP, app configs, skills, and static runtime assets are copied and validated without semantic translation.

**Tech Stack:** TypeScript scripts run through `tsx`, Bun tests for script behavior, existing esbuild plugin build flow, existing Codex/Claude validators.

---

### Task 1: Test Metadata Generation And Packing

**Files:**
- Create: `.github/scripts/tests/plugin-config.test.ts`

- [ ] **Step 1: Write failing tests**

Add Bun tests that create temporary plugin repos and assert:

```ts
import { describe, expect, test, afterEach } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import {
  generatePluginFiles,
  packPlugins,
  validatePluginMetadata,
  type PluginConfig,
} from "../../scripts/plugin-config";

// Tests cover:
// - Codex and Claude manifests generated from shared metadata.
// - Native hooks are copied, not transformed.
// - Pack output excludes source-only files and includes dist/static runtime files.
// - Validation fails when generated manifests drift from plugin.config metadata.
```

- [ ] **Step 2: Run tests and verify they fail**

Run: `bun test .github/scripts/tests/plugin-config.test.ts`

Expected: fail because `scripts/plugin-config.ts` does not exist yet.

### Task 2: Implement Plugin Metadata Core

**Files:**
- Create: `scripts/plugin-config.ts`

- [ ] **Step 1: Add typed config and rendering functions**

Implement:

```ts
export interface PluginConfig {
  name: string;
  version: string;
  description: string;
  author?: { name: string };
  keywords?: string[];
  category: string;
  interface?: Record<string, unknown>;
  build?: { entry: string; output: string };
  surfaces?: {
    skills?: boolean;
    hooks?: false | "native";
    claudeManifestHooks?: boolean;
    mcp?: boolean;
    app?: boolean;
  };
  artifact?: { include?: string[] };
  marketplace?: {
    codex?: { installation?: string; authentication?: string; products?: string[] };
    claude?: { description?: string };
  };
}
```

Render Codex manifests with generated `skills`, `hooks`, `mcpServers`, and `apps` path fields only when declared. Render Claude manifests with common metadata and optional `hooks: "./hooks/hooks.json"` only when declared.

- [ ] **Step 2: Add generation, validation, and pack functions**

Implement:

```ts
export async function generatePluginFiles(root: string, configs?: PluginConfig[]): Promise<void>
export async function validatePluginMetadata(root: string, options?: { packsRoot?: string }): Promise<string[]>
export async function packPlugins(root: string, options?: { outDir?: string; clean?: boolean }): Promise<void>
```

Validation returns all metadata drift and artifact layout errors. Packing writes `.build/plugins/<name>` by default, copies native runtime surfaces, copies `skills/`, copies declared static files, and excludes source-only files.

- [ ] **Step 3: Run targeted tests**

Run: `bun test .github/scripts/tests/plugin-config.test.ts`

Expected: pass.

### Task 3: Add CLI Wrappers And Root Commands

**Files:**
- Create: `scripts/generate-plugin-metadata.ts`
- Create: `scripts/validate-plugin-metadata.ts`
- Create: `scripts/pack-plugins.ts`
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Add wrappers**

Each wrapper imports `scripts/plugin-config.ts` and reports actionable errors. `validate-plugin-metadata.ts` exits non-zero when any validation error is returned.

- [ ] **Step 2: Add commands**

Add root scripts:

```json
"generate:plugins": "tsx scripts/generate-plugin-metadata.ts",
"pack:plugins": "tsx scripts/pack-plugins.ts",
"validate:plugin-metadata": "tsx scripts/validate-plugin-metadata.ts",
"validate:plugin-packs": "tsx scripts/validate-plugin-metadata.ts --packs",
"validate:plugins": "npm run validate:plugin-metadata && npm run validate:claude-layout && npm run validate:codex-layout && npm run validate:marketplace && npm run validate:versions"
```

Add `.build/` to `.gitignore`.

- [ ] **Step 3: Run wrapper help and validation tests**

Run: `npm run validate:plugin-metadata`

Expected: fail until plugin configs are added.

### Task 4: Add Plugin Configs And Generate Metadata

**Files:**
- Create: `plugins/*/plugin.config.ts`
- Generated: `plugins/*/.codex-plugin/plugin.json`
- Generated: `plugins/*/.claude-plugin/plugin.json`
- Generated: `.agents/plugins/marketplace.json`
- Generated: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Add one `plugin.config.ts` per local plugin**

Cover `aliyunlog`, `augment-mcp`, `ecommerce-expert`, `mysql`, `notebook`, `postgresql`, `prompt-enhancer`, and `ticktick`. Preserve current descriptions, author, keywords, interface metadata, categories, versions, and marketplace descriptions.

- [ ] **Step 2: Generate metadata**

Run: `npm run generate:plugins`

Expected: generated manifests and marketplace files match existing behavior except for stable JSON formatting.

- [ ] **Step 3: Run metadata validation**

Run: `npm run validate:plugin-metadata`

Expected: pass.

### Task 5: Pack Artifacts And Validate Full Repo

**Files:**
- Generated: `.build/plugins/**`
- Modify: docs if command docs need updating

- [ ] **Step 1: Build runtime bundles**

Run: `npm run build`

Expected: workspace builds complete or existing build warnings are identified before continuing.

- [ ] **Step 2: Pack clean artifacts**

Run: `npm run pack:plugins`

Expected: `.build/plugins/<name>` exists and excludes `src/`, `package.json`, `package-lock.json`, `tsconfig.json`, `plugin.config.ts`, and `node_modules/`.

- [ ] **Step 3: Validate generated packs**

Run: `npm run validate:plugin-packs`

Expected: pass.

- [ ] **Step 4: Run full validation**

Run: `bun test .github/scripts/tests && npm run validate:plugins && npm run typecheck`

Expected: pass.

### Task 6: Commit Implementation

**Files:**
- Stage only files changed for this feature.

- [ ] **Step 1: Inspect diff**

Run: `git diff --stat && git diff --check`

Expected: no whitespace errors and only intended files changed.

- [ ] **Step 2: Commit**

Run explicit path staging and commit:

```bash
git add docs/superpowers/plans/2026-05-02-plugin-compiled-release-pipeline.md \
  scripts/plugin-config.ts scripts/generate-plugin-metadata.ts scripts/validate-plugin-metadata.ts scripts/pack-plugins.ts \
  .github/scripts/tests/plugin-config.test.ts package.json .gitignore \
  plugins/aliyunlog/plugin.config.ts plugins/augment-mcp/plugin.config.ts plugins/ecommerce-expert/plugin.config.ts \
  plugins/mysql/plugin.config.ts plugins/notebook/plugin.config.ts plugins/postgresql/plugin.config.ts \
  plugins/prompt-enhancer/plugin.config.ts plugins/ticktick/plugin.config.ts \
  plugins/aliyunlog/.codex-plugin/plugin.json plugins/aliyunlog/.claude-plugin/plugin.json \
  plugins/augment-mcp/.codex-plugin/plugin.json plugins/augment-mcp/.claude-plugin/plugin.json \
  plugins/ecommerce-expert/.codex-plugin/plugin.json plugins/ecommerce-expert/.claude-plugin/plugin.json \
  plugins/mysql/.codex-plugin/plugin.json plugins/mysql/.claude-plugin/plugin.json \
  plugins/notebook/.codex-plugin/plugin.json plugins/notebook/.claude-plugin/plugin.json \
  plugins/postgresql/.codex-plugin/plugin.json plugins/postgresql/.claude-plugin/plugin.json \
  plugins/prompt-enhancer/.codex-plugin/plugin.json plugins/prompt-enhancer/.claude-plugin/plugin.json \
  plugins/ticktick/.codex-plugin/plugin.json plugins/ticktick/.claude-plugin/plugin.json \
  plugins/aliyunlog/tsconfig.json plugins/mysql/tsconfig.json plugins/postgresql/tsconfig.json plugins/ticktick/tsconfig.json \
  .agents/plugins/marketplace.json .claude-plugin/marketplace.json
git commit -m "feat: add plugin metadata release pipeline"
```

Expected: commit succeeds and `.serena/` remains untracked.
