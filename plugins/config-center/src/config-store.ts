import { readFile, rename, mkdir, chmod, open, stat, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { homedir } from 'os';
import { PluginError } from './errors.js';

const home = process.env.HOME || homedir();

/**
 * Overriding the cache root is how tooling reads or renders a plugin's
 * configuration without touching the operator's real one. It is resolved on
 * every call rather than at import time, so it works even when the override is
 * set after this module has loaded — setting HOME inside a script does not,
 * which is exactly how a preview script once rendered real credentials.
 */
const CACHE_DIR_ENV = 'AGENT_PLUGINS_CACHE_DIR';

export function cacheRoot(): string {
  const override = (process.env[CACHE_DIR_ENV] ?? '').trim();
  return override || join(home, '.cache', 'agent-plugins');
}

/** The default cache root, captured at import time. Prefer {@link cacheRoot}. */
export const CACHE_DIR = join(home, '.cache', 'agent-plugins');

function legacyFlatPath(name: string): string {
  return join(cacheRoot(), `${name}.json`);
}

function legacyOlderPath(name: string): string {
  return join(home, '.cache', 'ap', 'ex-plugin', `${name}.json`);
}

export function configDir(name: string): string {
  return join(cacheRoot(), name);
}

export function configPath(name: string): string {
  return join(configDir(name), 'config.json');
}

export function artifactsDir(name: string): string {
  return join(configDir(name), 'artifacts');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// ── Private storage ─────────────────────────────────────────────────────────

/**
 * A plugin's cache directory holds its plaintext credentials, session caches and
 * artifacts, so it is the owner's business and nobody else's. Directories are
 * created 0700, the config file is written 0600, and a file left readable by
 * other accounts is tightened in place. When it cannot be tightened the operation
 * fails instead of continuing, because continuing would leave exactly the hole
 * this closes.
 *
 * Windows has no POSIX mode to check, so the check is skipped there rather than
 * faked.
 */
const POSIX_MODES = process.platform !== 'win32';

function permissionsMessage(what: string, detail: string): string {
  return (
    `Refusing to continue: ${what} is readable by other users and could not be ` +
    `restricted (${detail}). Run 'chmod 700' on the plugin cache directory and ` +
    `'chmod 600' on its config file.`
  );
}

async function tightenMode(path: string, mode: number, what: string): Promise<void> {
  if (!POSIX_MODES) return;
  try {
    // 0o077 is group and other: any of those bits means someone else can reach it.
    if (((await stat(path)).mode & 0o077) === 0) return;
    await chmod(path, mode);
    if (((await stat(path)).mode & 0o077) === 0) return;
  } catch (e: any) {
    if (e.code === 'ENOENT') return;
    throw new PluginError(permissionsMessage(what, e.code ?? e.message), 'CONFIG_PERMISSIONS');
  }
  throw new PluginError(permissionsMessage(what, 'the mode did not change'), 'CONFIG_PERMISSIONS');
}

/**
 * Create the plugin's cache directory private and tighten an existing one.
 * Directories that already exist keep their mode through `mkdir`, so the second
 * step is what repairs an installation created before this rule existed.
 */
export async function ensurePrivateConfigDir(name: string): Promise<string> {
  const dir = configDir(name);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  await tightenMode(dir, 0o700, 'the plugin cache directory');
  return dir;
}

/** Tighten a stored config file and its directory to owner-only. */
async function tightenStoredConfig(name: string): Promise<void> {
  await tightenMode(configDir(name), 0o700, 'the plugin cache directory');
  await tightenMode(configPath(name), 0o600, 'the stored configuration');
}

/**
 * Write in one step: the content goes to a private file in the same directory, is
 * flushed, and is then renamed over the target. A reader or a crash therefore
 * finds either the complete old file or the complete new one, never a truncated
 * one, and the target cannot exist with looser permissions because the rename
 * carries the temporary file's 0600.
 */
async function writeConfigAtomic(path: string, data: string): Promise<void> {
  const tmp = `${path}.tmp-${process.pid}-${randomUUID().slice(0, 8)}`;
  const handle = await open(tmp, 'wx', 0o600);
  try {
    await handle.writeFile(data, 'utf-8');
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    await rename(tmp, path);
  } catch (e) {
    await unlink(tmp).catch(() => {});
    throw e;
  }
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

  const dir = configDir(name);

  // Check legacy flat path: ~/.cache/agent-plugins/<name>.json
  const flat = legacyFlatPath(name);
  if (existsSync(flat)) {
    await mkdir(dir, { recursive: true, mode: 0o700 });
    await rename(flat, target);
    await tightenMode(target, 0o600, 'the stored configuration');
    return;
  }

  // Check even-older path: ~/.cache/ap/ex-plugin/<name>.json
  const older = legacyOlderPath(name);
  if (existsSync(older)) {
    await mkdir(dir, { recursive: true, mode: 0o700 });
    await rename(older, target);
    await tightenMode(target, 0o600, 'the stored configuration');
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
  await tightenStoredConfig(name);

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
  await ensurePrivateConfigDir(name);

  let finalData = data;

  if (options.merge === true) {
    const existing = await readConfigRaw<Record<string, unknown>>(name);
    if (existing) {
      finalData = deepMerge(existing, data);
    }
  }

  await writeConfigAtomic(
    configPath(name),
    JSON.stringify(finalData, null, 2) + '\n'
  );
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
