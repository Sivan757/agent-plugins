import { readFile, writeFile, rename, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { PluginError } from './errors.js';

const home = process.env.HOME || homedir();

export const CACHE_DIR = join(home, '.cache', 'agent-plugins');

function legacyFlatPath(name: string): string {
  return join(CACHE_DIR, `${name}.json`);
}

function legacyOlderPath(name: string): string {
  return join(home, '.cache', 'ap', 'ex-plugin', `${name}.json`);
}

export function configDir(name: string): string {
  return join(CACHE_DIR, name);
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

function deepMerge(
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
    await mkdir(dir, { recursive: true });
    await rename(flat, target);
    return;
  }

  // Check even-older path: ~/.cache/ap/ex-plugin/<name>.json
  const older = legacyOlderPath(name);
  if (existsSync(older)) {
    await mkdir(dir, { recursive: true });
    await rename(older, target);
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
  const dir = configDir(name);
  await mkdir(dir, { recursive: true });

  let finalData = data;

  if (options.merge === true) {
    const existing = await readConfigRaw<Record<string, unknown>>(name);
    if (existing) {
      finalData = deepMerge(existing, data);
    }
  }

  const path = configPath(name);
  await writeFile(path, JSON.stringify(finalData, null, 2) + '\n', 'utf-8');
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
