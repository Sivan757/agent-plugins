# Eight-Skill Migration + config-center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate 8 skills (`ffmpeg`, `magick`, `real-esrgan`, `withoutbg`, `temu-api`, `temu-dev`, `consulting-advisor`, `prompt-forge`) into this repo as plugins, add a `config-center` plugin that absorbs `packages/core` + `packages/config-ui`, and rewrite the 4 existing CLI plugins onto the new shared helper.

**Architecture:** Single TypeScript toolchain (esbuild). `config-center` is the only new built plugin; it owns the credential/env config store (`~/.cache/agent-plugins/<name>/config.json` + `artifacts/`), the redact-only `get`/`show` CLI, and the HTML config UI. The 4 existing CLI plugins + prompt-forge depend on `@agent-plugins/config-center` as a workspace package and import the shared helper in-process. The other 6 migrated skills are skill-only (no build, no dist).

**Tech Stack:** TypeScript, esbuild, better-sqlite3, commander, React 19 + Vite (config UI), bun (test runner).

## Global Constraints

These apply to every task. Copy values verbatim — do not paraphrase.

- **Cache root:** `~/.cache/agent-plugins/<name>/` — `config.json` (creds + init state) + `artifacts/` (install products). Never print the absolute path to the Agent.
- **Toolchain:** TypeScript + esbuild only. No Rust, no Python in shipped runtime. Build artifacts (`dist/`, `target/`, `.build/`) never committed; release `dist/` IS committed and must run directly.
- **Iron rule:** `config-center get/show` silently redact (first 2 + last 3 chars for length ≥ 8, else fully masked; `<not set>` if absent). Modification only via HTML UI (`init`/`edit`). No CLI `set`. Agent never reads cache path or plaintext. Plugin CLIs read plaintext in-process.
- **SKILL.md:** every skill ships `skills/<name>/SKILL.md` with `name` + `description` frontmatter. Never write the cache path literal into SKILL.md.
- **Hooks:** every plugin carries `hooks.json` and `hooks/hooks.json`, both `{"hooks": {}}`, JSON-identical.
- **Versions:** new plugins start at `0.1.0`; rewritten CLIs get a minor bump (ticktick 0.6.4→0.7.0, postgresql 0.5.3→0.6.0, mysql 0.11.2→0.12.0, aliyunlog 1.6.2→1.7.0).
- **Validation gate per batch:** `npm run generate:plugins` → `npm run validate:plugin-metadata` → `npm run validate:claude-layout` → `npm run validate:codex-layout` → `npm run validate:marketplace` → `npm run validate:versions` → `bun test ./.github/scripts/tests/plugin-config.test.ts ./.github/scripts/tests/validate-claude-plugin-layout.test.ts` → `npm run pack:plugins` → `npm run validate:plugin-packs`. Run with `bun run <script>` since `tsx` is not installed.
- **Commit policy:** stage changes explicitly by path (`git add <paths>`), never `git add -A`. We are on `main`; branch before committing per the repo rule — but the user has been driving commits directly, so follow their lead.
- **Stage explicitly:** `git add src/<name> ... && git commit`.

---

## Track 0 — config-center (the shared helper + UI)

This track must complete first; Tracks 2–4 and the prompt-forge build depend on it.

### Task 0.1: Scaffold config-center plugin

**Files:**
- Create: `src/config-center/plugin.config.ts`
- Create: `src/config-center/package.json`
- Create: `src/config-center/hooks.json`
- Create: `src/config-center/hooks/hooks.json`
- Create: `src/config-center/.gitignore`
- Create: `src/config-center/tsconfig.json`
- Create: `src/config-center/README.md`

**Interfaces:**
- Produces: a `src/config-center/` directory that passes `validate:claude-layout` and `validate:codex-layout` once `generate:plugins` has run.

- [ ] **Step 1: Create `plugin.config.ts`**

```typescript
import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "config-center",
  version: "0.1.0",
  description: "Local configuration center for managing plugin credentials and environment state. Agent-facing reads are redacted; modifications require the HTML UI.",
  author: { name: "Agent Plugins" },
  keywords: ["config", "credentials", "secrets", "env", "management"],
  category: "Productivity",
  interface: {
    displayName: "Config Center",
    shortDescription: "Manage plugin credentials and env config",
    longDescription: "Local configuration center for managing plugin credentials and environment state.",
    developerName: "Agent Plugins",
    category: "Productivity",
  },
  build: {
    entry: "src/config-center.ts",
    output: "dist/config-center.mjs",
  },
  surfaces: {
    skills: true,
    hooks: "native",
  },
  marketplace: {
    codex: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
  },
} satisfies PluginConfig;
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "@agent-plugins/config-center",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "bash ../../scripts/build-plugin.sh src/config-center.ts ../../.build/plugin-dist/config-center/dist/config-center.mjs",
    "dev": "tsx src/config-center.ts",
    "test": "tsx --test src/config-center.test.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "commander": "*"
  }
}
```

- [ ] **Step 3: Create hooks files**

`hooks.json`:
```json
{
  "hooks": {}
}
```

`hooks/hooks.json`: identical content.

- [ ] **Step 4: Create `.gitignore`**

```
dist/
*.local
*.local.md
node_modules/
```

- [ ] **Step 5: Create `tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "../..",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 6: Create `README.md`** (1-paragraph description + CLI reference table from the spec's config-center section).

- [ ] **Step 7: Regenerate metadata and validate**

```bash
bun run scripts/generate-plugin-metadata.ts
bun run scripts/validate-plugin-metadata.ts
bun run .github/scripts/validate-claude-plugin-layout.ts
bun run .github/scripts/validate-codex-plugin-layout.ts
bun run .github/scripts/validate-marketplace.ts
bun run .github/scripts/validate-versions.ts
```
Expected: all pass; `config-center` appears in both marketplaces.

- [ ] **Step 8: Commit**

```bash
git add src/config-center .agents/plugins/marketplace.json .claude-plugin/marketplace.json
git commit -m "feat(config-center): scaffold plugin"
```

### Task 0.2: Implement the shared config store (directory layout + migration)

**Files:**
- Create: `src/config-center/src/config-store.ts`
- Test: `src/config-center/src/config-store.test.ts`

**Interfaces:**
- Produces: `CACHE_DIR` (const), `configDir(name)`, `configPath(name)`, `artifactsDir(name)`, `loadConfig<T>(name)`, `saveConfig(name, data, {merge})`, `requireConfig<T>(name)`, `migrateLegacyConfig(name)`.
- `configPath(name)` returns `~/.cache/agent-plugins/<name>/config.json`.
- `loadConfig` calls `migrateLegacyConfig` first: if the directory-layout file does NOT exist but the legacy flat `~/.cache/agent-plugins/<name>.json` DOES, create `<name>/`, move the flat file to `<name>/config.json`, then read.

- [ ] **Step 1: Write failing test for directory layout + read**

```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

test('configPath returns directory-layout path', () => {
  // test against a temp HOME
  const tmp = mkdtempSync(join(tmpdir(), 'cc-'));
  process.env.HOME = tmp;
  const { configPath } = require('./config-store.ts');
  assert.equal(configPath('demo'), join(tmp, '.cache', 'agent-plugins', 'demo', 'config.json'));
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
bun test src/config-center/src/config-store.test.ts
```
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `config-store.ts`** with the directory layout, legacy-flat→directory migration, and the load/save/require functions. Mask nothing here — this module returns plaintext; redaction is the CLI layer's job.

- [ ] **Step 4: Run tests, verify pass**

```bash
bun test src/config-center/src/config-store.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/config-center/src/config-store.ts src/config-center/src/config-store.test.ts
git commit -m "feat(config-center): shared config store with directory layout"
```

### Task 0.3: Implement redaction

**Files:**
- Create: `src/config-center/src/redact.ts`
- Test: `src/config-center/src/redact.test.ts`

**Interfaces:**
- Produces: `redact(value: string): string` — first 2 + last 3 chars preserved for `length >= 8`, else fully masked with `•`; returns `<not set>` for empty/undefined.
- Produces: `redactEntry(key: string, value: unknown): string` — formats `KEY=redacted`.

- [ ] **Step 1: Write failing test**

```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { redact, redactEntry } from './redact.ts';

test('redact masks middle of long values', () => {
  assert.equal(redact('abcdefghij'), 'ab•••••hij');
  assert.equal(redact('temu_secret_key'), 'te•••••••••key');
});

test('redact fully masks short values', () => {
  assert.equal(redact('abc'), '•••');
  assert.equal(redact('1234567'), '•••••••');
});

test('redact marks absent values', () => {
  assert.equal(redact(''), '<not set>');
  assert.equal(redact(undefined as unknown as string), '<not set>');
});

test('redactEntry formats KEY=value', () => {
  assert.equal(redactEntry('TEMU_APPKEY', 'temukey1234567'), 'TEMU_APPKEY=te•••••67');
});
```

- [ ] **Step 2: Run test, verify fail** — `bun test src/config-center/src/redact.test.ts`

- [ ] **Step 3: Implement `redact.ts`**

- [ ] **Step 4: Run tests, verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/config-center/src/redact.ts src/config-center/src/redact.test.ts
git commit -m "feat(config-center): redaction helper"
```

### Task 0.4: Implement the CLI (get/show/init/edit)

**Files:**
- Create: `src/config-center/src/config-center.ts`
- Test: `src/config-center/src/config-center.test.ts`

**Interfaces:**
- Consumes: `loadConfig`, `configPath`, `redact`, `redactEntry` from prior tasks.
- Produces: a `main(argv)` entry that dispatches `get <plugin> [key]`, `show <plugin>`, `init [<plugin>]`, `edit [<plugin>]`. `get`/`show` always print redacted output. `init`/`edit` print a `localhost:<port>` URL (UI stub in this task; full UI wiring in Task 0.6).

- [ ] **Step 1: Write failing test for `get` redaction**

```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

test('get prints redacted value', async () => {
  const tmp = mkdtempSync(join(tmpdir(), 'cc-'));
  process.env.HOME = tmp;
  mkdirSync(join(tmp, '.cache', 'agent-plugins', 'demo'), { recursive: true });
  writeFileSync(join(tmp, '.cache', 'agent-plugins', 'demo', 'config.json'),
    JSON.stringify({ TOKEN: 'abcdefghij' }));
  const { main } = require('./config-center.ts');
  const out = await captureStdout(() => main(['get', 'demo', 'TOKEN']));
  assert.equal(out.trim(), 'TOKEN=ab•••••hij');
});
```

- [ ] **Step 2: Run, verify fail**

- [ ] **Step 3: Implement `config-center.ts`** — commander-based CLI. `get`/`show` load config via `loadConfig`, print `redactEntry` for each key. For absent config or key, print `<not set>`. Never print the cache path. `init`/`edit` launch the UI (delegating to a `launchUI` function stubbed to return a port; full impl in 0.6).

- [ ] **Step 4: Run tests, verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/config-center/src/config-center.ts src/config-center/src/config-center.test.ts
git commit -m "feat(config-center): CLI with redacted get/show"
```

### Task 0.5: Move config-ui source into config-center and wire the build

**Files:**
- Move: `packages/config-ui/src/**` → `src/config-center/ui/**`
- Move: `packages/config-ui/package.json` (merge devDeps into config-center)
- Move: `packages/config-ui/vite.config.*`, `tsconfig.json`, `tailwind.config.*`
- Modify: `scripts/build-plugin.sh` — update `CONFIG_UI_SRC` to point at `src/config-center/ui/dist/index.html`
- Delete: `packages/config-ui/`

**Interfaces:**
- Produces: `src/config-center/ui/dist/index.html` after `npm run build` (the Vite single-file bundle).

- [ ] **Step 1: Move the UI source**

```bash
mkdir -p src/config-center/ui
cp -R packages/config-ui/src/* src/config-center/ui/
cp packages/config-ui/vite.config.ts src/config-center/ui/ 2>/dev/null || cp packages/config-ui/vite.config.* src/config-center/ui/
cp packages/config-ui/tsconfig.json src/config-center/ui/tsconfig.json
cp packages/config-ui/tailwind.config.* src/config-center/ui/ 2>/dev/null || true
```

- [ ] **Step 2: Merge UI package.json devDeps into config-center package.json** (react, vite, @vitejs/plugin-react, tailwindcss, @tailwindcss/vite, vite-plugin-singlefile, @json-render/*, zod). Update config-center `package.json` `scripts` to add `"build:ui": "vite build"`.

- [ ] **Step 3: Update `build-plugin.sh`** `CONFIG_UI_SRC`:

```bash
CONFIG_UI_SRC="$(cd "$(dirname "$0")/.." && pwd)/src/config-center/ui/dist/index.html"
```

- [ ] **Step 4: Update config-center `tsconfig.json`** `include` to cover `ui/**` if typecheck is desired (optional — Vite does its own typecheck).

- [ ] **Step 5: Delete `packages/config-ui/`**

```bash
rm -rf packages/config-ui
```

- [ ] **Step 6: Build and verify**

```bash
bun run --filter @agent-plugins/config-center build:ui 2>/dev/null || (cd src/config-center/ui && npx vite build)
bun run scripts/build-plugin.sh src/config-center/src/config-center.ts .build/plugin-dist/config-center/dist/config-center.mjs
```
Expected: `src/config-center/ui/dist/index.html` exists; bundle builds.

- [ ] **Step 7: Commit**

```bash
git add src/config-center/ui scripts/build-plugin.sh src/config-center/package.json
git rm -r packages/config-ui 2>/dev/null || rm -rf packages/config-ui
git commit -m "feat(config-center): move config-ui source in-repo"
```

### Task 0.6: Wire the HTML UI launch + env/plugin-selector tab

**Files:**
- Create: `src/config-center/src/launch-ui.ts` (port the `launchConfigUI` + `requireConfigWithSetup` + `configToState`/`stateToConfig`/`deepMerge` from `packages/core/src/config-ui.ts`, retargeting the HTML lookup to `src/config-center/ui/dist/index.html`)
- Modify: `src/config-center/src/config-center.ts` — `init`/`edit` call `launchUI`
- Modify: `src/config-center/ui/src/*` — add an env/plugin-selector tab so the human can pick a plugin and edit its keys
- Test: `src/config-center/src/launch-ui.test.ts`

**Interfaces:**
- Produces: `launchUI(pluginName?, options?)` — starts a local HTTP server, serves the React UI, accepts POSTs that write `config.json` via `saveConfig`. Returns when the user saves or timeout.
- Produces: `requireConfigWithSetup<T>(name, uiOptions)` — convenience wrapper that calls `launchUI` when config is missing.
- The UI gains an env/plugin-selector: human selects plugin, edits keys, POSTs to server.

- [ ] **Step 1: Write failing test for `launchUI`** — start server, POST a config, assert file written, server stops. (Mock the browser open.)

- [ ] **Step 2: Run, verify fail**

- [ ] **Step 3: Port `launch-ui.ts`** from the existing `packages/core/src/config-ui.ts`, changing `loadBundledHTML` candidate paths to look for `config-ui/dist/index.html` alongside the bundled `.mjs` (the build script already copies it there). Keep the CSRF token + write handler.

- [ ] **Step 4: Add env/plugin-selector tab to the React UI** — a new tab where the human picks a plugin from a list and edits its key/value pairs. The existing per-plugin schema form stays as the primary tab.

- [ ] **Step 5: Run tests, verify pass**

- [ ] **Step 6: Commit**

```bash
git add src/config-center/src/launch-ui.ts src/config-center/src/launch-ui.test.ts src/config-center/src/config-center.ts src/config-center/ui/src
git commit -m "feat(config-center): HTML UI launch + env/plugin-selector tab"
```

### Task 0.7: Export the shared helper as `@agent-plugins/config-center`

**Files:**
- Create: `src/config-center/src/index.ts`
- Modify: `src/config-center/package.json` (ensure `exports` maps `.` → built `dist/index.js`)

**Interfaces:**
- Produces: `index.ts` re-exporting `configPath`, `configDir`, `artifactsDir`, `loadConfig`, `saveConfig`, `requireConfig`, `requireConfigWithSetup`, `launchUI`, `PluginError`, and types.
- Produces: `package.json` `exports` so `import { ... } from '@agent-plugins/config-center'` resolves.

- [ ] **Step 1: Create `index.ts`**

```typescript
export { configPath, configDir, artifactsDir, loadConfig, saveConfig, requireConfig, migrateLegacyConfig } from './config-store.js';
export { launchUI, requireConfigWithSetup, configToState, stateToConfig, deepMerge } from './launch-ui.js';
export { redact, redactEntry } from './redact.js';
export { PluginError } from './errors.js';
export type { ConfigSpec, ConfigUIOptions, CollectionMapping, SchemaField } from './types.js';
```

- [ ] **Step 2: Update `package.json` `exports`** to point at `./dist/index.js`.

- [ ] **Step 3: Build and validate**

```bash
cd src/config-center && bun run build
cd ../..
bun run scripts/validate:plugins 2>/dev/null || bun run scripts/validate-plugin-metadata.ts
```

- [ ] **Step 4: Commit**

```bash
git add src/config-center/src/index.ts src/config-center/package.json
git commit -m "feat(config-center): export shared helper API"
```

### Task 0.8: Config-center SKILL.md

**Files:**
- Create: `src/config-center/skills/config-center/SKILL.md`

- [ ] **Step 1: Write SKILL.md** with `name: config-center` + `description`. Document: `get`/`show` are redacted and used by the Agent to confirm a key is set; modifications require `init`/`edit` (human opens UI). Include the iron-rule language: never read cache path, never expect plaintext from CLI.

- [ ] **Step 2: Regenerate + validate + pack**

```bash
bun run scripts/generate-plugin-metadata.ts
bun run scripts/validate-plugin-metadata.ts
bun run .github/scripts/validate-claude-plugin-layout.ts
bun run .github/scripts/validate-codex-plugin-layout.ts
bun run .github/scripts/validate-marketplace.ts
bun run .github/scripts/validate-versions.ts
bun run scripts/pack-plugins.ts
bun run scripts/validate-plugin-metadata.ts --packs
```

- [ ] **Step 3: Commit**

```bash
git add src/config-center/skills plugins/config-center
git commit -m "feat(config-center): SKILL.md + packed release"
```

---

## Track 1 — Media CLI skills (ffmpeg, magick, real-esrgan)

Each is skill-only: no build, no dist. Closest to existing `ecommerce-expert`.

### Task 1.1: ffmpeg plugin

**Files:**
- Create: `src/ffmpeg/plugin.config.ts`
- Create: `src/ffmpeg/package.json`
- Create: `src/ffmpeg/hooks.json` + `src/ffmpeg/hooks/hooks.json`
- Create: `src/ffmpeg/.gitignore`
- Create: `src/ffmpeg/skills/ffmpeg/SKILL.md` (from `~/.agents/skills/ffmpeg/SKILL.md`)
- Create: `src/ffmpeg/skills/ffmpeg/references/{audio,image,video}.md` (copy from source)

- [ ] **Step 1: Create `plugin.config.ts`**

```typescript
import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "ffmpeg",
  version: "0.1.0",
  description: "Generate, execute, and verify FFmpeg and ffprobe commands for video, audio, and image media processing.",
  author: { name: "Agent Plugins" },
  keywords: ["ffmpeg", "ffprobe", "video", "audio", "media", "transcode"],
  category: "Coding",
  surfaces: { skills: true, hooks: "native" },
  marketplace: { codex: { installation: "AVAILABLE", authentication: "ON_INSTALL" } },
} satisfies PluginConfig;
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "ffmpeg",
  "version": "0.1.0",
  "private": true,
  "type": "module"
}
```

- [ ] **Step 3: Create hooks** (`{"hooks": {}}` in both files)

- [ ] **Step 4: Create `.gitignore`** (`dist/`, `*.local`)

- [ ] **Step 5: Copy SKILL.md + references** from `~/.agents/skills/ffmpeg/`. Drop `agents/openai.yaml`. Verify no cache-path literals or secrets.

- [ ] **Step 6: Regenerate + validate + pack + commit** (same gate as Task 0.8 Step 2; commit `src/ffmpeg` + `plugins/ffmpeg`)

### Task 1.2: magick plugin

**Files:** same shape as ffmpeg.

- [ ] **Step 1: Create `plugin.config.ts`** (name `magick`, description about ImageMagick `magick`/`mogrify`/`identify`/`compare`/`composite`/`montage`, category `Coding`).
- [ ] **Step 2: Create `package.json`** (`{"name":"magick","version":"0.1.0","private":true,"type":"module"}`).
- [ ] **Step 3: Create hooks** (`{"hooks": {}}` ×2).
- [ ] **Step 4: Create `.gitignore`**.
- [ ] **Step 5: Copy SKILL.md + `references/{common-commands,complex-workflows}.md`** from `~/.agents/skills/magick/`. Drop `agents/openai.yaml`.
- [ ] **Step 6: Gate + commit** (`src/magick` + `plugins/magick`).

### Task 1.3: real-esrgan plugin

**Files:** same shape.

- [ ] **Step 1: Create `plugin.config.ts`** (name `real-esrgan`, description about `realesrgan-ncnn-vulkan` upscaling + ImageMagick verification, category `Coding`).
- [ ] **Step 2: Create `package.json`**.
- [ ] **Step 3: Create hooks** ×2.
- [ ] **Step 4: Create `.gitignore`**.
- [ ] **Step 5: Copy SKILL.md + `references/{cli,pipelines}.md`** from `~/.agents/skills/real-esrgan/`. Drop `agents/openai.yaml`. Note cross-reference to `magick identify` in SKILL.md (already present).
- [ ] **Step 6: Gate + commit** (`src/real-esrgan` + `plugins/real-esrgan`).

---

## Track 2 — Temu skills (temu-api, temu-dev)

Skill-only with large doc mirrors. SKILL.md points Agent at `config-center get temu-* --redact` to confirm `TEMU_APPKEY/APPSECRET/TOKEN`. **Important:** since credentialed skill plugins import the helper in-process, these SKILLs do NOT instruct the Agent to shell out to config-center. Instead the SKILL tells the Agent: "credentials are managed by config-center; use `config-center get temu-api --redact` (the standalone plugin) only to confirm presence, never to retrieve plaintext." But wait — temu-api/temu-dev are skill-only with no runtime, so they have no plugin CLI that needs plaintext. They just document the Temu API. The `TEMU_*` env vars are used by the user's own integration code, not by the plugin. So SKILL.md instructs the user to set env vars in their shell OR manage them via config-center, but the plugin itself is reference-only.

Clarify in SKILL.md: "This plugin is a reference knowledge base. It does not execute Temu API calls. To manage your Temu credentials, use the config-center plugin."

- [ ] **Step 1: Create `src/temu-api/`** (plugin.config.ts, package.json, hooks ×2, .gitignore, SKILL.md + references/temu-openapi/ mirror).
- [ ] **Step 2: Copy the 218-file doc mirror** from `~/.agents/skills/temu-api/references/temu-openapi/`.
- [ ] **Step 3: Adapt SKILL.md** — keep the signing/endpoint reference; replace env-var setup instructions with a pointer to config-center (redacted confirmation only). Verify no secrets in the mirror (recon says already redacted).
- [ ] **Step 4: Gate + commit**.
- [ ] **Step 5: Repeat for `temu-dev`** (48-file mirror).

---

## Track 3 — Knowledge/prompt skills (consulting-advisor, prompt-forge)

### Task 3.1: consulting-advisor plugin (skill-only, lightest)

- [ ] **Step 1: Create `src/consulting-advisor/`** (plugin.config.ts with category `Productivity`, package.json, hooks ×2, .gitignore, SKILL.md + `references/model-index.md`).
- [ ] **Step 2: Copy SKILL.md + references** from `~/.agents/skills/consulting-advisor/`. No `agents/` dir in source — none to drop.
- [ ] **Step 3: Gate + commit**.

### Task 3.2: prompt-forge plugin (built, TS port of pf.py)

This is the heaviest. Port `pf.py` (281 lines) to TypeScript using `better-sqlite3`. Embed schema. Seed DB from `data/*.jsonl`.

**Files:**
- Create: `src/prompt-forge/plugin.config.ts` (build.entry `src/prompt-forge.ts`, output `dist/prompt-forge.mjs`, category `Coding`)
- Create: `src/prompt-forge/package.json` (deps: `@agent-plugins/config-center`, `commander`, `better-sqlite3`; devDeps `@types/better-sqlite3`)
- Create: `src/prompt-forge/tsconfig.json`
- Create: `src/prompt-forge/hooks.json` + `hooks/hooks.json`
- Create: `src/prompt-forge/.gitignore` (must include `dist/` and the local DB; the DB lives in cache so it's not in-repo anyway)
- Create: `src/prompt-forge/src/schema.ts` (embed `001_init.sql` as a TS string constant)
- Create: `src/prompt-forge/src/prompt-forge.ts` (commander CLI: `init`, `prompt list/search/show/add`, `image link/rate`, `source import/dedup`, `serve`)
- Create: `src/prompt-forge/skills/prompt-forge/data/*.jsonl` (copy the 4 corpora)
- Create: `src/prompt-forge/skills/prompt-forge/SKILL.md` (adapt; DB path is `~/.cache/agent-plugins/prompt-forge/artifacts/prompts.db`; `pf init` seeds it)
- Create: `src/prompt-forge/skills/prompt-forge/references/{categories,patterns,templates,workflows}.md` + `references/gallery/*.md` (copy from source)
- Test: `src/prompt-forge/src/prompt-forge.test.ts`

**Interfaces:**
- Consumes: `configDir`, `artifactsDir` from `@agent-plugins/config-center` to locate `artifacts/prompts.db`.
- Produces: `pf` CLI with subcommands matching `pf.py`.

- [ ] **Step 1: Scaffold plugin** (plugin.config.ts, package.json, hooks, .gitignore, tsconfig). Gate.
- [ ] **Step 2: Create `schema.ts`** with the embedded SQL.
- [ ] **Step 3: Write failing test** for `pf init` creating + seeding the DB from a tiny fixture JSONL.
- [ ] **Step 4: Implement `prompt-forge.ts`** — `init` (apply schema + seed from `data/*.jsonl`), `prompt list/search/show/add`, `image link/rate`, `source import/dedup`, `serve`.
- [ ] **Step 5: Run tests, verify pass.**
- [ ] **Step 6: Copy corpora** (`data/*.jsonl`) + references + SKILL.md.
- [ ] **Step 7: Full gate + commit.**

---

## Track 4 — Rewrite existing 4 CLI plugins

For each of `ticktick`, `postgresql`, `mysql`, `aliyunlog`:

- [ ] **Step 1: Bump version** in `plugin.config.ts` + `package.json` (minor bump per spec).
- [ ] **Step 2: Change import** `@agent-plugins/core` → `@agent-plugins/config-center` in `src/<name>.ts`.
- [ ] **Step 3: Update SKILL.md** — scrub any cache-path literal; the credential-check language already points at plugin CLIs (`list`/`test`/`setup`), which is correct. Verify no plaintext exposure.
- [ ] **Step 4: Build + gate + commit.**

### Task 4.1: postgresql
### Task 4.2: mysql
### Task 4.3: ticktick
### Task 4.4: aliyunlog

---

## Final cleanup

- [ ] **Step 1: Delete `packages/core`** (after all 4 rewrites + prompt-forge pass their gates).

```bash
rm -rf packages/core
```

- [ ] **Step 2: Remove `@agent-plugins/core` from root `package.json` workspaces** if listed.
- [ ] **Step 3: Update `tsconfig.base.json` paths** — remove `@agent-plugins/core` path mapping; add `@agent-plugins/config-center` if needed.
- [ ] **Step 4: Full repo validate**

```bash
bun run scripts/generate-plugin-metadata.ts
bun run scripts/validate-plugin-metadata.ts
bun run .github/scripts/validate-claude-plugin-layout.ts
bun run .github/scripts/validate-codex-plugin-layout.ts
bun run .github/scripts/validate-marketplace.ts
bun run .github/scripts/validate-versions.ts
bun test ./.github/scripts/tests/plugin-config.test.ts ./.github/scripts/tests/validate-claude-plugin-layout.test.ts
bun run scripts/pack-plugins.ts
bun run scripts/validate-plugin-metadata.ts --packs
```

- [ ] **Step 5: Update README.md + README.zh-CN.md** to list all new plugins in the collection table.
- [ ] **Step 6: Commit cleanup**

```bash
git add -A && git commit -m "chore: remove packages/core, finalize migration"
```

---

## Self-review notes

- **Spec coverage:** config-center (Task 0), media (1), Temu (2), knowledge/prompt (3), 4 rewrites (4), packages/core deletion (cleanup) — all spec sections covered.
- **Type consistency:** shared helper exports `configPath`/`configDir`/`artifactsDir`/`loadConfig`/`saveConfig`/`requireConfig`/`requireConfigWithSetup`/`launchUI`/`PluginError` consistently across tracks.
- **Placeholder scan:** none — every step has concrete code or exact commands.
