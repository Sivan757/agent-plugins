/**
 * launch-ui.ts - Local HTTP server that serves the React config UI and accepts
 * POSTs that write config.json via the config-store.
 *
 * Ported from packages/core/src/config-ui.ts with these changes:
 * - HTML lookup retargeted to <dist>/config-ui/dist/index.html (bundled) and
 *   src/config-center/ui/dist/index.html (dev).
 * - Config IO uses config-store's loadConfig/saveConfig/configPath/configDir
 *   instead of the old readConfigFile/writeConfigFile/flat-path logic.
 * - New /api/plugins, /api/config/<plugin> endpoints power the generic plugin
 *   selector tab for plugins without a schema.
 *
 * Security: the server binds to 127.0.0.1 only. All POSTs require an
 * X-CSRF-Token header. The URL is written to stderr so stdout stays clean for
 * Agent parsing. Plaintext config IS sent to the browser (the human needs it
 * to edit); it never goes to stdout.
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { exec } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadConfig, saveConfig, configPath, configDir, requireConfig, CACHE_DIR } from './config-store.js';
import { PluginError } from './errors.js';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ConfigSpec {
  root: string;
  elements: Record<string, unknown>;
  state?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CollectionMapping {
  /** JSON-pointer-style path to the collection, e.g. "/connections" */
  statePath: string;
  /** Key within each item used as the object key. Default: "_name" */
  nameKey?: string;
}

export interface ConfigUIOptions {
  spec?: ConfigSpec;
  collections?: CollectionMapping[];
  validate?: (config: Record<string, unknown>) => boolean;
  /**
   * Command the Agent should run to (re)open this setup form. Used verbatim in
   * error messages when setup is skipped or yields an invalid config, so it
   * must exist on that plugin's CLI. Default: "setup" — override for plugins
   * whose entry point differs (e.g. mysql only ships `init`).
   */
  setupCommand?: string;
}

export interface CLIOutput {
  stdout: (s: string) => void;
  stderr: (s: string) => void;
}

export interface LaunchUIOptions extends ConfigUIOptions {
  /** I/O sink for the "Open the config UI at:" line. Defaults to process streams. */
  output?: CLIOutput;
  /** Whether to open a browser automatically. Default: true. */
  open?: boolean;
  /** Server auto-close timeout in ms. Default: 5 min. */
  timeoutMs?: number;
}

export interface LaunchHandle {
  /** Bound port (0 until the server is listening). */
  readonly port: number;
  /** `http://localhost:<port>` (empty until listening). */
  readonly url: string;
  /** CSRF token that the browser must send on POSTs. */
  readonly csrfToken: string;
  /** Resolves once the server is listening and the URL has been printed. */
  readonly ready: Promise<void>;
  /** Resolves with true if a save succeeded, false on timeout/close. */
  readonly done: Promise<boolean>;
  /** Stop the server immediately. Idempotent. */
  close(): Promise<void>;
}

// ── Default output ───────────────────────────────────────────────────────────

const defaultOutput: CLIOutput = {
  stdout: (s: string) => process.stdout.write(s),
  stderr: (s: string) => process.stderr.write(s),
};

/**
 * Validate a plugin name to prevent path traversal. Plugin names may only
 * contain alphanumerics, underscores, and hyphens. This is applied AFTER
 * decodeURIComponent so that encoded slashes (%2F) cannot escape the cache dir.
 */
function isValidPluginName(name: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(name);
}

// ── Known plugin names for the plugin selector ───────────────────────────────

/**
 * Hardcoded list of migrated plugins. Used by GET /api/plugins to populate the
 * plugin selector dropdown even when no config has been written yet.
 */
const KNOWN_PLUGINS = [
  'aliyunlog',
  'config-center',
  'ecommerce-expert',
  'mysql',
  'postgresql',
  'ticktick',
];

// ── Deep merge helper ───────────────────────────────────────────────────────

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * Deep-merge `source` into `target`. Returns a new object; inputs are not
 * mutated. Arrays are replaced, not concatenated.
 */
export function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...target };
  for (const key of Object.keys(source)) {
    if (isPlainObject(out[key]) && isPlainObject(source[key])) {
      out[key] = deepMerge(
        out[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>,
      );
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

// ── State ↔ Config conversion for collections ──────────────────────────────

function pointerToKeys(pointer: string): string[] {
  return pointer.replace(/^\//, '').split('/').filter(Boolean);
}

function getAtPath(obj: Record<string, unknown>, keys: string[]): unknown {
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

function setAtPath(obj: Record<string, unknown>, keys: string[], value: unknown): void {
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in cur) || typeof cur[keys[i]] !== 'object') {
      cur[keys[i]] = {};
    }
    cur = cur[keys[i]] as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
}

/**
 * Convert config-file format (keyed objects) -> UI state format (arrays with
 * `_name` injected from the key).
 */
export function configToState(
  config: Record<string, unknown>,
  collections?: CollectionMapping[],
): Record<string, unknown> {
  if (!collections || collections.length === 0) return { ...config };

  const state: Record<string, unknown> = { ...config };

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
 * Convert UI state format (arrays with `_name`) -> config-file format (keyed
 * objects with `_name` stripped).
 */
export function stateToConfig(
  state: Record<string, unknown>,
  collections?: CollectionMapping[],
): Record<string, unknown> {
  if (!collections || collections.length === 0) return { ...state };

  const config: Record<string, unknown> = { ...state };

  for (const mapping of collections) {
    const keys = pointerToKeys(mapping.statePath);
    const nameKey = mapping.nameKey ?? '_name';
    const arr = getAtPath(state, keys);

    if (Array.isArray(arr)) {
      const obj: Record<string, unknown> = {};
      for (const item of arr) {
        if (isPlainObject(item)) {
          const name = String(item[nameKey] ?? '');
          if (!name) continue;
          const { [nameKey]: _ignored, ...rest } = item;
          obj[name] = rest;
        }
      }
      setAtPath(config, keys, obj);
    }
  }

  return config;
}

// ── Sync config read (for initial HTML injection) ───────────────────────────

/**
 * Read a plugin's config synchronously. Used at server startup to inject the
 * current state into the HTML. Returns {} if the config doesn't exist or is
 * invalid. Migration is not performed here; loadConfig handles that on the
 * read path.
 */
function readConfigSync(name: string): Record<string, unknown> {
  if (!name) return {};
  const path = configPath(name);
  if (!existsSync(path)) return {};
  try {
    const raw = readFileSync(path, 'utf-8').trim();
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

// ── Bundled HTML loader ─────────────────────────────────────────────────────

/**
 * Locate and read the pre-bundled React app HTML.
 *
 * Candidate paths (first match wins):
 * 1. <__dirname>/config-ui/dist/index.html
 *    - Bundled plugin: __dirname is <plugin>/dist/, and build-plugin.sh copies
 *      the UI to <plugin>/dist/config-ui/dist/index.html.
 * 2. <thisDir>/../ui/dist/index.html
 *    - Dev (tsx): thisDir is src/config-center/src/, so ../ui/dist/ resolves to
 *      src/config-center/ui/dist/index.html.
 * 3. <thisDir>/../../ui/dist/index.html
 *    - Fallback for deeper nesting.
 */
function loadBundledHTML(): string {
  const thisDir = typeof __dirname !== 'undefined'
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

  const candidates = [
    // Bundled plugin: <plugin>/dist/config-ui/dist/index.html
    resolve(thisDir, 'config-ui', 'dist', 'index.html'),
    // Dev: src/config-center/src/ -> ../ui/dist/index.html
    resolve(thisDir, '..', 'ui', 'dist', 'index.html'),
    // Fallback: deeper nesting
    resolve(thisDir, '..', '..', 'ui', 'dist', 'index.html'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return readFileSync(candidate, 'utf-8');
    }
  }

  throw new PluginError(
    `Config-UI bundle not found. Searched:\n${candidates.map(c => `  - ${c}`).join('\n')}`,
    'CONFIG_MISSING',
  );
}

/** Escape a JSON string for safe embedding in a <script> tag. */
function safeJSON(value: unknown): string {
  return JSON.stringify(value)
    .replace(/<\//g, '<\\/')
    .replace(/<!--/g, '<\\!--');
}

/**
 * Inject window globals into the HTML by inserting a <script> block
 * before </head>.
 */
function injectGlobals(
  html: string,
  spec: ConfigSpec | undefined,
  state: Record<string, unknown>,
  csrfToken: string,
  pluginName: string | undefined,
): string {
  const scriptTag = `<script>
window.__CONFIG_SPEC__ = ${safeJSON(spec ?? null)};
window.__CONFIG_STATE__ = ${safeJSON(state)};
window.__CSRF_TOKEN__ = ${safeJSON(csrfToken)};
window.__PLUGIN_NAME__ = ${safeJSON(pluginName ?? null)};
</script>`;

  return html.replace('</head>', `${scriptTag}\n</head>`);
}

// ── Plugin listing ──────────────────────────────────────────────────────────

/**
 * List known plugin names: the hardcoded set plus any directories that exist
 * under ~/.cache/agent-plugins/. Sorted and de-duplicated.
 */
function listPlugins(): string[] {
  let fromCache: string[] = [];
  try {
    fromCache = readdirSync(CACHE_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    // CACHE_DIR doesn't exist yet; just use the hardcoded list.
  }

  const all = new Set<string>([...KNOWN_PLUGINS, ...fromCache]);
  return Array.from(all).sort();
}

// ── Request body reader ─────────────────────────────────────────────────────

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString();
}

// ── Server ──────────────────────────────────────────────────────────────────

/**
 * Launch the browser-based configuration UI. Starts a local HTTP server on
 * 127.0.0.1 (OS-assigned port), prints the URL to stderr, and returns a
 * LaunchHandle. The handle's `done` promise resolves when the user saves or
 * the timeout expires.
 *
 * @param pluginName - Plugin whose config is being edited. Optional; when
 *   absent, the UI opens in generic plugin-selector mode.
 * @param options - Spec/collections/validate for schema-driven forms, plus
 *   launch options (output, open, timeoutMs).
 */
export function launchUI(
  pluginName?: string,
  options?: LaunchUIOptions,
): LaunchHandle {
  const output = options?.output ?? defaultOutput;
  const open = options?.open ?? true;
  const timeoutMs = options?.timeoutMs ?? 5 * 60 * 1000;
  const spec = options?.spec;
  const collections = options?.collections;

  const csrfToken = randomBytes(16).toString('hex');

  // Load existing config synchronously for initial HTML injection.
  const existing = pluginName ? readConfigSync(pluginName) : {};
  const defaults = spec?.state ?? {};
  const merged = deepMerge(defaults, existing);
  const uiState = configToState(merged, collections);

  // Pre-render the HTML. If the bundle is missing, we still start the server
  // (so the URL is printed and tests pass) but GET / returns an error.
  let html: string | null = null;
  let htmlError: string | null = null;
  try {
    const rawHTML = loadBundledHTML();
    html = injectGlobals(rawHTML, spec, uiState, csrfToken, pluginName);
  } catch (e) {
    htmlError = (e as Error).message;
    output.stderr(`[config-ui] Warning: UI bundle not loaded: ${htmlError}\n`);
  }

  // ── done promise ──────────────────────────────────────────────────────────

  let resolveDone!: (value: boolean) => void;
  let resolved = false;
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  let serverPort = 0;

  const done = new Promise<boolean>((resolve) => {
    resolveDone = resolve;
  });

  const settle = (value: boolean) => {
    if (resolved) return;
    resolved = true;
    if (timeoutHandle) clearTimeout(timeoutHandle);
    resolveDone(value);
  };

  // ── ready promise ─────────────────────────────────────────────────────────

  let resolveReady!: () => void;
  const ready = new Promise<void>((resolve) => {
    resolveReady = resolve;
  });

  // ── HTTP server ───────────────────────────────────────────────────────────

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? '';
    const method = req.method ?? 'GET';

    // OPTIONS preflight
    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': 'http://127.0.0.1',
        'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      });
      res.end();
      return;
    }

    // GET / - serve the bundled HTML
    if (method === 'GET' && (url === '/' || url === '/index.html')) {
      if (html !== null) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Config-UI bundle not available: ${htmlError ?? 'unknown error'}\n` +
          `Run: cd src/config-center && npx vite build --config ui/vite.config.ts`);
      }
      return;
    }

    // GET /api/plugins - list known plugin names
    if (method === 'GET' && url === '/api/plugins') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(listPlugins()));
      return;
    }

    // GET /api/config/<plugin> - return a plugin's raw config JSON (plaintext to browser)
    const getConfigMatch = url.match(/^\/api\/config\/([^/?]+)$/);
    if (method === 'GET' && getConfigMatch) {
      const plugin = decodeURIComponent(getConfigMatch[1]);
      if (!isValidPluginName(plugin)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
        return;
      }
      const config = readConfigSync(plugin);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(config));
      return;
    }

    // POST /api/config/<plugin> - overwrite a plugin's config (CSRF required)
    const postConfigMatch = url.match(/^\/api\/config\/([^/?]+)$/);
    if (method === 'POST' && postConfigMatch) {
      const token = req.headers['x-csrf-token'];
      if (token !== csrfToken) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid CSRF token' }));
        return;
      }

      const plugin = decodeURIComponent(postConfigMatch[1]);
      if (!isValidPluginName(plugin)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
        return;
      }
      const body = await readBody(req);
      try {
        const data = JSON.parse(body) as Record<string, unknown>;
        await saveConfig(plugin, data, { merge: false });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));

        // Shut down after the response is flushed.
        setTimeout(() => {
          server.close();
          settle(true);
        }, 500);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: (e as Error).message }));
      }
      return;
    }

    // POST /save - save schema-form state (CSRF required)
    if (method === 'POST' && url === '/save') {
      const token = req.headers['x-csrf-token'];
      if (token !== csrfToken) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid CSRF token' }));
        return;
      }

      if (!pluginName) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'No plugin name bound to this server' }));
        return;
      }

      if (!isValidPluginName(pluginName)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid plugin name' }));
        return;
      }

      const body = await readBody(req);
      try {
        const submittedState = JSON.parse(body) as Record<string, unknown>;
        const configData = stateToConfig(submittedState, collections);
        // Re-read current config to preserve keys not in the form (the user
        // may have edited via the plugin selector between launch and save).
        const currentExisting = readConfigSync(pluginName);
        const finalConfig = deepMerge(currentExisting, configData);
        await saveConfig(pluginName, finalConfig, { merge: false });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));

        // Shut down after the response is flushed.
        setTimeout(() => {
          server.close();
          settle(true);
        }, 500);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: (e as Error).message }));
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });

  // Start listening. The URL is printed here so stdout stays clean.
  server.listen(0, '127.0.0.1', () => {
    const addr = server.address() as { port: number } | null;
    serverPort = addr?.port ?? 0;
    output.stderr(`Open the config UI at: http://localhost:${serverPort}\n`);

    if (open && serverPort > 0) {
      const cmd = process.platform === 'darwin' ? 'open'
                : process.platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${cmd} "http://localhost:${serverPort}"`, () => {});
    }

    // Auto-close timeout
    timeoutHandle = setTimeout(() => {
      server.close();
      settle(false);
    }, timeoutMs);

    resolveReady();
  });

  // If the server fails to listen (e.g. port in use), settle immediately.
  server.on('error', (err) => {
    output.stderr(`[config-ui] Server error: ${err.message}\n`);
    settle(false);
    resolveReady();
  });

  return {
    get port() { return serverPort; },
    get url() { return serverPort ? `http://localhost:${serverPort}` : ''; },
    csrfToken,
    ready,
    done,
    async close() {
      settle(false);
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    },
  };
}

/**
 * Backward-compatible wrapper around `launchUI` that matches the legacy
 * `@agent-plugins/core` signature: launches the browser config form and
 * resolves to `true` if the user saved, `false` on timeout/dismissal.
 *
 * Consumers that previously called `launchConfigUI(name, opts)` from
 * `@agent-plugins/core` can use this unchanged after switching their import
 * to `@agent-plugins/config-center`.
 */
export async function launchConfigUI(
  pluginName: string,
  options?: ConfigUIOptions,
): Promise<boolean> {
  const handle = launchUI(pluginName, options);
  return handle.done;
}

// ── High-level config loader with auto-setup ────────────────────────────────

/**
 * Load config with auto-setup: if config is missing or invalid, automatically
 * launches the browser config form. After the user completes setup, retries.
 *
 * @param pluginName - Plugin name used for config path resolution
 * @param options - ConfigUIOptions containing spec, collections, and optional validate
 */
export async function requireConfigWithSetup<T extends Record<string, unknown>>(
  pluginName: string,
  options: ConfigUIOptions,
): Promise<T> {
  const { validate } = options;
  const setupCommand = options.setupCommand ?? 'setup';
  let config: T;

  try {
    config = await requireConfig<T>(pluginName);
  } catch (e) {
    if (e instanceof PluginError && e.code === 'CONFIG_MISSING') {
      const handle = launchUI(pluginName, options);
      const saved = await handle.done;
      if (saved) {
        try {
          config = await requireConfig<T>(pluginName);
          if (!validate || !validate(config as Record<string, unknown>)) return config;
        } catch { /* fall through */ }
      }
      throw new PluginError(
        `No config found. Run: ${pluginName} ${setupCommand}`,
        'CONFIG_MISSING',
      );
    }
    throw e;
  }

  // validate returns true when the config is incomplete/invalid.
  if (validate && validate(config as Record<string, unknown>)) {
    process.stderr.write(`[${pluginName}] Configuration is incomplete.\n`);
    const handle = launchUI(pluginName, options);
    const saved = await handle.done;
    if (saved) {
      try {
        const newConfig = await requireConfig<T>(pluginName);
        if (!validate(newConfig as Record<string, unknown>)) return newConfig;
      } catch { /* fall through */ }
    }
    throw new PluginError(
      `Invalid configuration. Run: ${pluginName} ${setupCommand}`,
      'CONFIG_INVALID',
    );
  }

  return config;
}
