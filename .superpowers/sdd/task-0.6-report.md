# Task 0.6 Report: HTML UI Launch + Plugin Selector Tab

## Status: Complete

## Commit

`ec775dc` — `feat(config-center): real HTML UI launch + plugin selector tab`

## Test / Build Summary

- `bun test src/config-center/src/` — 56 pass, 0 fail (44 pre-existing + 12 new launch-ui tests).
- `npm run validate:plugins` — all 5 validators pass (metadata, claude-layout, codex-layout, marketplace, versions).
- `cd src/config-center && npx vite build --config ui/vite.config.ts` — builds clean (357 kB single-file HTML).
- `npm run build` (full plugin build including esbuild bundle) — produces `.build/plugin-dist/config-center/dist/config-center.mjs` (141 kB) with `config-ui/dist/index.html` shipped alongside.

## What Was Done

### 1. `src/config-center/src/launch-ui.ts` (new, ~430 lines)

Ported `launchConfigUI` + `requireConfigWithSetup` + `configToState`/`stateToConfig`/`deepMerge` from `packages/core/src/config-ui.ts`. Key changes from the source:

- **HTML lookup**: `loadBundledHTML` candidate paths updated to `<__dirname>/config-ui/dist/index.html` (bundled, matches `build-plugin.sh`'s copy step) then `<src>/../ui/dist/index.html` (dev fallback from `src/config-center/src/`).
- **Config IO**: uses `loadConfig`, `saveConfig`, `configPath`, `configDir`, `requireConfig` from `./config-store.js` instead of the old `readConfigFile`/`writeConfigFile`/flat-path logic. `saveConfig(name, data, {merge:false})` overwrites.
- **`launchUI(pluginName?, options?)`** returns a `LaunchHandle` (`{ port, url, csrfToken, ready, done, close() }`) synchronously. The server binds to `127.0.0.1:0`, prints `Open the config UI at: http://localhost:<port>` to stderr, and resolves `done` on save (true) or timeout/close (false).
- **New endpoints** for the plugin selector:
  - `GET /api/plugins` — returns sorted, de-duplicated list of known plugin names (hardcoded migrated list + directories under `~/.cache/agent-plugins/`).
  - `GET /api/config/<plugin>` — returns the plugin's raw config JSON (plaintext to browser).
  - `POST /api/config/<plugin>` — overwrites the plugin's config via `saveConfig` (CSRF required), then closes the server.
- **Security**: 127.0.0.1 only; CSRF token on all POSTs; URL to stderr only (stdout stays clean for Agent parsing); plaintext config IS sent to the browser (the human needs it to edit).
- **`requireConfigWithSetup<T>(name, uiOptions)`** — convenience wrapper that calls `launchUI` when config is missing or invalid, then retries.

### 2. `src/config-center/src/config-center.ts` (modified)

- Removed the stub `launchUI` function; imported the real `launchUI` from `./launch-ui.js`.
- `init`/`edit` actions now call `launchUI(plugin, { output, open, timeoutMs })` and `await handle.ready` + `await handle.done`. In real usage the process stays alive until the user saves or the 5-minute timeout expires.
- `CLIOutput` type re-exported from `launch-ui.js` for backward compatibility.
- Test mode controlled by env vars: `CC_UI_NO_OPEN=1` (no browser) and `CC_UI_TIMEOUT_MS=<ms>` (short timeout).

### 3. `src/config-center/src/config-center.test.ts` (modified)

- `before` hook sets `CC_UI_NO_OPEN=1` and `CC_UI_TIMEOUT_MS=20` so `init`/`edit` tests resolve in ~20ms without opening a browser.
- `after` hook cleans up the env vars.
- All 23 existing CLI tests pass unchanged (the URL format `Open the config UI at: http://localhost:<port>` is preserved).

### 4. `src/config-center/src/launch-ui.test.ts` (new, 12 tests)

Tests the HTTP server lifecycle: start, GET HTML, GET /api/plugins, GET/POST /api/config, POST /save with collections, CSRF rejection, timeout, close idempotency. Uses a temp HOME and `open: false`. All tests mock the browser-open via the `open` option.

### 5. React UI: Plugin Selector Tab

- **`src/config-center/ui/src/components/PluginEditor.tsx`** (new) — generic key/value editor:
  - Dropdown to select a plugin (populated from `GET /api/plugins`).
  - Key/value rows with add/remove. Values are edited as strings; non-string values are JSON-stringified for editing and JSON-parsed on save (so numbers, booleans, and nested objects round-trip correctly).
  - Save button POSTs to `/api/config/<plugin>` with CSRF; shows a success overlay; server closes after save.
- **`src/config-center/ui/src/app/App.tsx`** (modified) — tab system:
  - When a spec is injected (`window.__CONFIG_SPEC__`), shows two tabs: "Schema Form" (existing `Renderer`) and "Plugin Editor". Schema Form is the default.
  - When no spec is injected, the Plugin Editor is the sole/default view.
  - `window.__PLUGIN_NAME__` global added so the PluginEditor can pre-select the plugin passed to `launchUI`.

## Manual End-to-End Verification

Ran a full end-to-end test via `npx tsx`: server starts, serves HTML with `__PLUGIN_NAME__`, returns plugin list, accepts POST with CSRF, writes config, closes, and the config is readable via `loadConfig`. Non-string values (e.g. `OTHER: 42`) round-trip correctly through the key/value editor's JSON parse/stringify.

## Concerns / Deferred Polish

1. **Plugin editor closes the server after save.** Both `/save` (schema form) and `/api/config/<plugin>` (plugin editor) close the server after a successful POST. This means the user can only edit one plugin per `init`/`edit` invocation. If multi-plugin editing in one session is desired later, the plugin editor's POST handler should NOT call `settle(true)` — only the schema form's `/save` should. The current behavior is intentional for the minimal version: the user runs `config-center edit <plugin>` again for the next plugin.

2. **No `src/index.ts` created.** The brief mentions "the index re-exports them." The config-center `package.json` declares `"main": "src/index.ts"` but no such file exists (pre-existing gap). No module currently imports from `@agent-plugins/config-center` (plugins still import from `@agent-plugins/core`). Creating an index.ts was skipped to avoid unnecessary files; it should be created when plugins are migrated to import from config-center instead of core.

3. **Value type fidelity in the key/value editor.** The PluginEditor edits all values as strings. Non-string values are JSON-stringified for display and JSON-parsed on save. This handles numbers, booleans, and nested objects/arrays correctly (e.g. `42` -> `"42"` -> `42`), but deeply nested objects are edited as raw JSON strings (not a nested form). This is acceptable for the minimal version (e.g. `TEMU_APPKEY` is a plain string). A richer nested-object editor can be added later if needed.

4. **UI dist is gitignored.** The `src/config-center/ui/dist/index.html` is gitignored. Tests that check GET / (HTML serving) require the UI to be built first (`npx vite build --config ui/vite.config.ts`). The `launch-ui.test.ts` tests assume the dist exists. If the dist is missing, `launchUI` still starts the server and prints the URL (so CLI tests pass), but GET / returns a 500 with a helpful "run vite build" message.

5. **`packages/core/src/config-ui.ts` is still present.** The brief notes it is "to be deleted in final cleanup." This task ports the code but does not delete the source. Plugins (postgresql, mysql, ticktick, aliyunlog) still import `launchConfigUI`/`requireConfigWithSetup` from `@agent-plugins/core`. Deleting the core file requires migrating those imports first — out of scope for this task.

## Fixes

Review findings addressed (Important + cheap Minors):

1. **Path traversal in /api/config/<plugin>** (IMPORTANT): Added `isValidPluginName` (`/^[A-Za-z0-9_-]+$/`) validation after `decodeURIComponent` in the GET and POST `/api/config/<plugin>` handlers, and in the `/save` handler's `pluginName`. Encoded slashes (`%2F`) that decode to `../../` are now rejected with 404 (GET/POST config) or 400 (/save). Regression test added: `GET /api/config/..%2F..%2Fconfig` returns 4xx and does not read a sentinel file outside the cache dir.

2. **Test runner mismatch** (IMPORTANT): Changed `package.json` `test` script from `tsx --test src/config-center.test.ts` (ran only 1 file, failed on `require()`) to `bun test src/` (runs all 4 test files, bun supports `require()`).

3. **Three tests leaked the server** (IMPORTANT): Added `await handle.close()` in try/finally blocks to "POST /api/config writes config", "POST /save writes config for schema-driven form", and "handle.done resolves false on timeout" so the server socket is released.

4. **No end-to-end CLI security test for init/edit** (IMPORTANT): Added two tests in `config-center.test.ts` that write a fixture config with plaintext, run `init <plugin>` and `edit <plugin>` (with `CC_UI_NO_OPEN=1`, `CC_UI_TIMEOUT_MS=20`), and assert neither stdout nor stderr contains `.cache/agent-plugins`, the tmp HOME path, or the plaintext config value.

5. **Dropped unused `__CONFIG_PATH__` injection** (MINOR): Removed `window.__CONFIG_PATH__` from `injectGlobals` in `launch-ui.ts` and the `__CONFIG_PATH__` type declaration from `App.tsx` (the React UI never reads it). Defense-in-depth: the on-disk config path is no longer sent to the browser.

6. **Await `server.close()`** (MINOR): `LaunchHandle.close()` now wraps `server.close()` in a Promise so `await handle.close()` resolves after the socket actually closes.

### Test output

```
cd src/config-center && bun test src/
bun test v1.3.13
 59 pass
 0 fail
Ran 59 tests across 4 files. [1356ms]

cd src/config-center && npx vite build --config ui/vite.config.ts
  125 modules transformed.
  ../dist/index.html  357.11 kB | gzip: 105.75 kB
  built in 692ms

npm run validate:plugins
  Plugin metadata validation passed.
  Claude plugin layout validation passed.
  Codex plugin layout validation passed.
  Marketplace validation passed: codex=6 plugin(s), claude=8 plugin(s).
  Version validation passed: 6 local plugin(s) checked, all consistent.

bun test ./.github/scripts/tests/plugin-config.test.ts ./.github/scripts/tests/validate-claude-plugin-layout.test.ts
  8 pass
  0 fail
  36 expect() calls
  Ran 8 tests across 2 files. [143ms]
```

### Files changed

- `src/config-center/src/launch-ui.ts` - path traversal validation, removed `__CONFIG_PATH__` injection, await `server.close()`
- `src/config-center/src/launch-ui.test.ts` - path traversal regression test, try/finally cleanup on 3 leaking tests
- `src/config-center/src/config-center.test.ts` - init/edit plaintext leak security tests
- `src/config-center/package.json` - test script: `bun test src/`
- `src/config-center/ui/src/app/App.tsx` - removed `__CONFIG_PATH__` type declaration
