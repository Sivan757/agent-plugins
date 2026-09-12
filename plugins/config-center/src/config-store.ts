import { readFile, rename, open, unlink } from 'fs/promises';
import { chmodSync, existsSync, mkdirSync, statSync } from 'fs';
import { randomUUID } from 'crypto';
import { dirname, join } from 'path';
import { homedir } from 'os';
import { PluginError } from './errors.js';

/**
 * The user's home directory. `os.homedir()` is the standard capability for this
 * and is right on all three platforms: `$HOME` on POSIX, `USERPROFILE` on
 * Windows, where Node deliberately ignores `$HOME` because a POSIX shell exports
 * it in a form that would resolve against the current drive.
 */
function homeDir(): string {
  return homedir();
}

/**
 * Overriding the cache root is how tooling reads or renders a plugin's
 * configuration without touching the operator's real one. It is resolved on
 * every call rather than at import time, so it works even when the override is
 * set after this module has loaded — which HOME does not do, and that is exactly
 * how a preview script once rendered real credentials.
 */
const CACHE_DIR_ENV = 'AGENT_PLUGINS_CACHE_DIR';

/**
 * The single root of everything this repository persists: `~/.cache/agent-plugins`.
 * Every plugin's own directory lives under it and nothing is written anywhere
 * else. Paths are built with `path.join`, so they are correct on macOS, Linux and
 * Windows alike.
 */
export function cacheRoot(): string {
  const override = (process.env[CACHE_DIR_ENV] ?? '').trim();
  return override || join(homeDir(), '.cache', 'agent-plugins');
}

/** The default cache root, captured at import time. Prefer {@link cacheRoot}. */
export const CACHE_DIR = join(homeDir(), '.cache', 'agent-plugins');

/**
 * Where a plugin's config lived before it moved into the plugin directory. Both
 * older homes are resolved relative to {@link cacheRoot}, so redirecting the root
 * isolates the whole tree: a preview that read them from the real home would
 * carry real credentials into its scratch directory.
 */
function legacyFlatPath(name: string): string {
  return join(cacheRoot(), `${name}.json`);
}

function legacyOlderPath(name: string): string {
  return join(cacheRoot(), '..', 'ap', 'ex-plugin', `${name}.json`);
}

/** The plugin's own directory. Everything the plugin persists lives under it. */
export function configDir(name: string): string {
  return join(cacheRoot(), name);
}

export function configPath(name: string): string {
  return join(configDir(name), 'config.json');
}

export function artifactsDir(name: string): string {
  return join(configDir(name), 'artifacts');
}

/**
 * A file inside a plugin's private directory — a session cache, a downloaded
 * artifact, a written-out query result. Build every persisted path with this
 * rather than joining the root by hand: a plugin that recomputes the root can
 * disagree with the store about where it is (the root honours
 * `AGENT_PLUGINS_CACHE_DIR`) and would then persist outside the private
 * directory.
 */
export function pluginFilePath(name: string, ...segments: string[]): string {
  return join(configDir(name), ...segments);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// ── Private storage ─────────────────────────────────────────────────────────

/**
 * A plugin's directory holds its plaintext credentials, session caches and
 * artifacts, so it is the owner's business and nobody else's. Directories are
 * created 0700, files are written 0600, and anything left readable by other
 * accounts is tightened in place. When it cannot be tightened the operation fails
 * instead of continuing, because continuing would leave exactly the hole this
 * closes.
 *
 * Windows has no POSIX mode to check, so the check is skipped there rather than
 * faked.
 */
const POSIX_MODES = process.platform !== 'win32';

/** Group and other: any of those bits means someone else can reach the path. */
const OTHERS_BITS = 0o077;

function permissionsMessage(what: string, detail: string): string {
  return (
    `Refusing to continue: ${what} is readable by other users and could not be ` +
    `restricted (${detail}). Run 'chmod 700' on the plugin cache directory and ` +
    `'chmod 600' on its config file.`
  );
}

/**
 * Restrict a path to its owner. Synchronous because plugins also persist from
 * synchronous code, and one implementation of the rule beats two that can drift.
 */
function tightenModeSync(path: string, mode: number, what: string): void {
  if (!POSIX_MODES) return;

  let current;
  try {
    current = statSync(path);
  } catch (e: any) {
    if (e.code === 'ENOENT') return;
    throw new PluginError(permissionsMessage(what, e.code ?? e.message), 'CONFIG_PERMISSIONS');
  }
  if ((current.mode & OTHERS_BITS) === 0) return;

  try {
    chmodSync(path, mode);
  } catch (e: any) {
    throw new PluginError(permissionsMessage(what, e.code ?? e.message), 'CONFIG_PERMISSIONS');
  }
  if ((statSync(path).mode & OTHERS_BITS) !== 0) {
    throw new PluginError(permissionsMessage(what, 'the mode did not change'), 'CONFIG_PERMISSIONS');
  }
}

/**
 * Create a directory private and tighten an existing one. A directory that
 * already exists keeps its mode through `mkdirSync`, so the tightening step is
 * what repairs an installation created before this rule existed. Returns the
 * directory.
 */
function ensurePrivateDirSync(dir: string): string {
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  tightenModeSync(dir, 0o700, 'the plugin cache directory');
  return dir;
}

/**
 * Create a directory inside a plugin's private tree and tighten it, the plugin
 * directory included. `segments` names a subdirectory such as `artifacts` or
 * `tmp`; passing none means the plugin directory itself. Returns the directory.
 */
export function ensurePrivatePluginDirSync(name: string, ...segments: string[]): string {
  const dir = ensurePrivateDirSync(configDir(name));
  if (segments.length === 0) return dir;
  return ensurePrivateDirSync(pluginFilePath(name, ...segments));
}

/** Create the plugin's own directory private and tighten an existing one. */
export function ensurePrivateConfigDirSync(name: string): string {
  return ensurePrivatePluginDirSync(name);
}

/** Await-style entry point for the same policy. */
export async function ensurePrivateConfigDir(name: string): Promise<string> {
  return ensurePrivateConfigDirSync(name);
}

/** Tighten a stored config file and its directory to owner-only. */
function tightenStoredConfig(name: string): void {
  tightenModeSync(configDir(name), 0o700, 'the plugin cache directory');
  tightenModeSync(configPath(name), 0o600, 'the stored configuration');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Windows reports a replace that another process is holding open as `EACCES`,
 * `EBUSY` or `EPERM` rather than waiting for it, so a transient holder would
 * otherwise fail a save that POSIX would have completed. The retry reuses the
 * same complete sibling file and backs off in bounded steps.
 */
const REPLACE_RETRY_CODES = new Set(['EACCES', 'EBUSY', 'EPERM']);
const REPLACE_RETRY_LIMIT = 6;

async function replaceFile(tmp: string, path: string): Promise<void> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      await rename(tmp, path);
      return;
    } catch (e: any) {
      if (!REPLACE_RETRY_CODES.has(e.code) || attempt >= REPLACE_RETRY_LIMIT) {
        await unlink(tmp).catch(() => {});
        throw e;
      }
      await delay(5 * 2 ** attempt);
    }
  }
}

/**
 * Write a file in one step: the content goes to a private sibling created with
 * `wx` (so a pre-planted symlink at the name is refused rather than followed),
 * is flushed, and is then renamed over the target. A reader or a crash therefore
 * finds either the complete old file or the complete new one, never a truncated
 * one, and the target cannot end up with looser permissions because the rename
 * carries the sibling's 0600.
 */
async function writePrivateFile(path: string, data: string): Promise<void> {
  const tmp = `${path}.tmp-${process.pid}-${randomUUID().slice(0, 8)}`;
  const handle = await open(tmp, 'wx', 0o600);
  try {
    await handle.writeFile(data, 'utf-8');
    await handle.sync();
  } catch (e) {
    await handle.close().catch(() => {});
    await unlink(tmp).catch(() => {});
    throw e;
  }
  await handle.close();
  await replaceFile(tmp, path);
}

/**
 * Persist one of a plugin's own files. This is the only place plugin data is
 * written, so both halves of the rule — it lives inside the plugin's private
 * directory, and the write is atomic and private — are decided once here instead
 * of at every call site. Returns the path written.
 */
export async function writePluginFile(
  name: string,
  segments: string[],
  data: string
): Promise<string> {
  const path = pluginFilePath(name, ...segments);
  // The file's own directory, so nested segments such as `tmp/` are created too.
  ensurePrivateDirSync(dirname(path));
  await writePrivateFile(path, data);
  return path;
}

/**
 * Deep-merge `source` into `target`. Returns a new object; inputs are not
 * mutated. Arrays are replaced, not concatenated.
 *
 * The single implementation of this rule: the config UI merges the stored config
 * over the form's defaults and then merges the submitted values back, and both
 * paths have to agree or a save would quietly reshape the file.
 */
export function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (isRecord(value) && isRecord(result[key])) {
      result[key] = deepMerge(
        result[key] as Record<string, unknown>,
        value
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}


export async function migrateLegacyConfig(name: string): Promise<void> {
  const target = configPath(name);
  if (existsSync(target)) return;

  // Both legacy homes are beside the plugin directory, never inside it.
  for (const from of [legacyFlatPath(name), legacyOlderPath(name)]) {
    if (!existsSync(from)) continue;
    ensurePrivateConfigDirSync(name);
    await rename(from, target);
    tightenModeSync(target, 0o600, 'the stored configuration');
    return;
  }
}

async function readConfigRaw<T extends Record<string, unknown>>(
  name: string
): Promise<T | null> {
  const path = configPath(name);
  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (e: any) {
    if (e.code === 'ENOENT') return null;
    throw new PluginError('Failed to parse config', 'CONFIG_INVALID');
  }
}

export async function loadConfig<T extends Record<string, unknown>>(
  name: string
): Promise<T | null> {
  await migrateLegacyConfig(name);

  const path = configPath(name);
  if (!existsSync(path)) return null;

  // Repairs a config written before permissions were enforced.
  tightenStoredConfig(name);

  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (e: any) {
    if (e.code === 'ENOENT') return null;
    throw new PluginError('Failed to parse config', 'CONFIG_INVALID');
  }
}

export async function saveConfig(
  name: string,
  data: Record<string, unknown>,
  options: { merge?: boolean } = {}
): Promise<void> {
  let finalData = data;

  if (options.merge === true) {
    const existing = await readConfigRaw<Record<string, unknown>>(name);
    if (existing) {
      finalData = deepMerge(existing, data);
    }
  }

  await writePluginFile(name, ['config.json'], JSON.stringify(finalData, null, 2) + '\n');
}

export async function requireConfig<T extends Record<string, unknown>>(
  name: string
): Promise<T> {
  const config = await loadConfig<T>(name);
  if (!config) {
    throw new PluginError('No config found', 'CONFIG_MISSING');
  }
  return config;
}
