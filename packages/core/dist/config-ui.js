/**
 * config-ui.ts — Serves a pre-bundled React config form for plugins.
 *
 * Launches a local HTTP server that injects plugin specs + config state into
 * the bundled React app from packages/config-ui/dist/index.html. Credentials
 * flow browser → file, never through the LLM.
 */
import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { exec } from 'child_process';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';
import { configPath } from './config.js';
import { PluginError } from './errors.js';
import { requireConfig } from './config.js';
// ── Deep merge helper ───────────────────────────────────────────────────────
function isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
}
/**
 * Deep-merge `source` into `target`. Returns a new object; inputs are not
 * mutated. Arrays are replaced, not concatenated.
 */
export function deepMerge(target, source) {
    const out = { ...target };
    for (const key of Object.keys(source)) {
        if (isPlainObject(out[key]) && isPlainObject(source[key])) {
            out[key] = deepMerge(out[key], source[key]);
        }
        else {
            out[key] = source[key];
        }
    }
    return out;
}
// ── State ↔ Config conversion for collections ──────────────────────────────
/**
 * Resolve a JSON-pointer-style path ("/connections") into an array of keys.
 */
function pointerToKeys(pointer) {
    return pointer.replace(/^\//, '').split('/').filter(Boolean);
}
function getAtPath(obj, keys) {
    let cur = obj;
    for (const k of keys) {
        if (cur == null || typeof cur !== 'object')
            return undefined;
        cur = cur[k];
    }
    return cur;
}
function setAtPath(obj, keys, value) {
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in cur) || typeof cur[keys[i]] !== 'object') {
            cur[keys[i]] = {};
        }
        cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = value;
}
/**
 * Convert config-file format (keyed objects) → UI state format (arrays with
 * `_name` injected from the key).
 *
 * Config: `{ connections: { "default": {host, port}, "qa": {host, port} } }`
 * State:  `{ connections: [{_name: "default", host, port}, {_name: "qa", host, port}] }`
 */
export function configToState(config, collections) {
    if (!collections || collections.length === 0)
        return { ...config };
    const state = { ...config };
    for (const mapping of collections) {
        const keys = pointerToKeys(mapping.statePath);
        const nameKey = mapping.nameKey ?? '_name';
        const obj = getAtPath(config, keys);
        if (isPlainObject(obj)) {
            const arr = Object.entries(obj).map(([name, value]) => {
                if (isPlainObject(value)) {
                    return { [nameKey]: name, ...value };
                }
                return { [nameKey]: name, value };
            });
            setAtPath(state, keys, arr);
        }
    }
    return state;
}
/**
 * Convert UI state format (arrays with `_name`) → config-file format (keyed
 * objects with `_name` stripped).
 *
 * State:  `{ connections: [{_name: "default", host, port}, {_name: "qa", host, port}] }`
 * Config: `{ connections: { "default": {host, port}, "qa": {host, port} } }`
 */
export function stateToConfig(state, collections) {
    if (!collections || collections.length === 0)
        return { ...state };
    const config = { ...state };
    for (const mapping of collections) {
        const keys = pointerToKeys(mapping.statePath);
        const nameKey = mapping.nameKey ?? '_name';
        const arr = getAtPath(state, keys);
        if (Array.isArray(arr)) {
            const obj = {};
            for (const item of arr) {
                if (isPlainObject(item)) {
                    const name = String(item[nameKey] ?? '');
                    if (!name)
                        continue;
                    const { [nameKey]: _ignored, ...rest } = item;
                    obj[name] = rest;
                }
            }
            setAtPath(config, keys, obj);
        }
    }
    return config;
}
// ── Config read/write helpers ───────────────────────────────────────────────
function readConfigFile(cfgPath) {
    if (!existsSync(cfgPath))
        return {};
    const raw = readFileSync(cfgPath, 'utf-8').trim();
    if (!raw)
        return {};
    try {
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
}
function writeConfigFile(cfgPath, data) {
    mkdirSync(dirname(cfgPath), { recursive: true });
    writeFileSync(cfgPath, JSON.stringify(data, null, 2) + '\n');
}
// ── Bundled HTML loader ─────────────────────────────────────────────────────
/**
 * Locate and read the pre-bundled React app HTML. Searches relative to this
 * module file: `../../../packages/config-ui/dist/index.html` (when running
 * from a bundled plugin under `plugins/<name>/dist/`) or
 * `../../config-ui/dist/index.html` (source layout).
 */
function loadBundledHTML() {
    // __dirname is shimmed by esbuild banner to the bundled file's directory.
    // When a plugin runs from <repo>/plugins/ticktick/dist/,
    //   __dirname = <repo>/plugins/ticktick/dist/
    // When a plugin runs from an installed marketplace copy, the plugin still
    // ends in plugins/<name>/dist/.
    // In both cases, going up 3 levels reaches the marketplace or repo root,
    // then into packages/config-ui/dist/.
    const thisDir = typeof __dirname !== 'undefined'
        ? __dirname
        : dirname(fileURLToPath(import.meta.url));
    const candidates = [
        // From plugins/<name>/dist/ → config-ui bundle shipped alongside the .mjs
        resolve(thisDir, 'config-ui', 'dist', 'index.html'),
        // From plugins/<name>/dist/ → ../../../packages/config-ui/dist/index.html
        resolve(thisDir, '..', '..', '..', 'packages', 'config-ui', 'dist', 'index.html'),
        // Legacy root-level plugin layout → ../../packages/config-ui/dist/index.html
        resolve(thisDir, '..', '..', 'packages', 'config-ui', 'dist', 'index.html'),
        // From packages/core/dist/ → ../../config-ui/dist/index.html (unbundled/dev)
        resolve(thisDir, '..', '..', 'config-ui', 'dist', 'index.html'),
        // From packages/core/src/ → ../../config-ui/dist/index.html (tsx dev)
        resolve(thisDir, '..', '..', 'config-ui', 'dist', 'index.html'),
    ];
    for (const candidate of candidates) {
        if (existsSync(candidate)) {
            return readFileSync(candidate, 'utf-8');
        }
    }
    throw new PluginError(`Config-UI bundle not found. Searched:\n${candidates.map(c => `  - ${c}`).join('\n')}`, 'CONFIG_MISSING');
}
/**
 * Inject window globals into the HTML by inserting a <script> block
 * before </head>.
 */
/** Escape a JSON string for safe embedding in a <script> tag. */
function safeJSON(value) {
    // JSON.stringify then escape </script> and <!-- to prevent injection
    return JSON.stringify(value)
        .replace(/<\//g, '<\\/')
        .replace(/<!--/g, '<\\!--');
}
function injectGlobals(html, spec, state, cfgPath, csrfToken) {
    const scriptTag = `<script>
window.__CONFIG_SPEC__ = ${safeJSON(spec)};
window.__CONFIG_STATE__ = ${safeJSON(state)};
window.__CONFIG_PATH__ = ${safeJSON(cfgPath)};
window.__CSRF_TOKEN__ = ${safeJSON(csrfToken)};
</script>`;
    return html.replace('</head>', `${scriptTag}\n</head>`);
}
// ── Server ──────────────────────────────────────────────────────────────────
/**
 * Launch a browser-based configuration form. Starts a local HTTP server,
 * opens the browser, and resolves when the user submits or the timeout expires.
 *
 * @returns true if configuration was saved successfully
 */
export function launchConfigUI(pluginName, options) {
    const cfgPath = configPath(pluginName);
    return new Promise((resolve) => {
        const csrfToken = randomBytes(16).toString('hex');
        const existing = readConfigFile(cfgPath);
        // Merge spec defaults with existing config
        const defaults = options.spec.state ?? {};
        const merged = deepMerge(defaults, existing);
        // Convert config → UI state for collections
        const uiState = configToState(merged, options.collections);
        // Load and inject the bundled HTML
        let html;
        try {
            const rawHTML = loadBundledHTML();
            html = injectGlobals(rawHTML, options.spec, uiState, cfgPath, csrfToken);
        }
        catch (e) {
            process.stderr.write(`[config-ui] ${e.message}\n`);
            resolve(false);
            return;
        }
        const server = createServer(async (req, res) => {
            if (req.method === 'GET' && req.url === '/') {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(html);
                return;
            }
            if (req.method === 'POST' && req.url === '/save') {
                const chunks = [];
                for await (const chunk of req)
                    chunks.push(chunk);
                const body = Buffer.concat(chunks).toString();
                try {
                    const token = req.headers['x-csrf-token'];
                    if (token !== csrfToken) {
                        res.writeHead(403, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ ok: false, error: 'Invalid CSRF token' }));
                        return;
                    }
                    const submittedState = JSON.parse(body);
                    // Convert UI state → config-file format (collections: arrays → objects)
                    const configData = stateToConfig(submittedState, options.collections);
                    // Merge with existing config to preserve keys not in the form
                    const finalConfig = deepMerge(existing, configData);
                    writeConfigFile(cfgPath, finalConfig);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: true }));
                    // Shut down after response is flushed
                    setTimeout(() => { server.close(); resolve(true); }, 500);
                }
                catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: false, error: e.message }));
                }
                return;
            }
            res.writeHead(404);
            res.end('Not found');
        });
        server.listen(0, '127.0.0.1', () => {
            const addr = server.address();
            const url = `http://127.0.0.1:${addr.port}`;
            process.stderr.write(`[setup] Opening configuration form in browser...\n`);
            process.stderr.write(JSON.stringify({ url, port: addr.port }) + '\n');
            const cmd = process.platform === 'darwin' ? 'open'
                : process.platform === 'win32' ? 'start' : 'xdg-open';
            exec(`${cmd} "${url}"`, () => { });
        });
        // Timeout: auto-close after 5 minutes
        setTimeout(() => {
            server.close();
            resolve(false);
        }, 5 * 60 * 1000);
    });
}
// ── High-level config loader with auto-setup ────────────────────────────────
/**
 * Load config with auto-setup: if config is missing or invalid, automatically
 * launches the browser config form. After the user completes setup, retries.
 *
 * @param pluginName - Plugin name used for config path resolution
 * @param options - ConfigUIOptions containing spec, collections, and optional validate
 */
export async function requireConfigWithSetup(pluginName, options) {
    const { validate } = options;
    let config;
    // Load config (auto-launch setup if missing)
    try {
        config = await requireConfig(pluginName);
    }
    catch (e) {
        if (e instanceof PluginError && e.code === 'CONFIG_MISSING') {
            if (await launchConfigUI(pluginName, options)) {
                try {
                    config = await requireConfig(pluginName);
                    if (!validate || !validate(config))
                        return config;
                }
                catch { /* fall through */ }
            }
            throw new PluginError(`No config found. Run: ${pluginName} setup (or init)`, 'CONFIG_MISSING');
        }
        throw e;
    }
    // Validate (auto-launch setup if invalid)
    if (validate && validate(config)) {
        process.stderr.write(`[${pluginName}] Configuration is incomplete.\n`);
        if (await launchConfigUI(pluginName, options)) {
            try {
                const newConfig = await requireConfig(pluginName);
                if (!validate(newConfig))
                    return newConfig;
            }
            catch { /* fall through */ }
        }
        throw new PluginError(`Invalid configuration. Run: ${pluginName} setup`, 'CONFIG_INVALID');
    }
    return config;
}
//# sourceMappingURL=config-ui.js.map