import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { PluginError } from './errors.js';
const CACHE_DIR = join(homedir(), '.cache', 'agent-plugins');
const LEGACY_CACHE_DIR = join(homedir(), '.cache', ['ap', 'ex-plugin'].join(''));
export function configPath(pluginName) {
    return join(CACHE_DIR, `${pluginName}.json`);
}
function legacyConfigPath(pluginName) {
    return join(LEGACY_CACHE_DIR, `${pluginName}.json`);
}
function resolveConfigPathForRead(pluginName) {
    const primaryPath = configPath(pluginName);
    if (existsSync(primaryPath))
        return primaryPath;
    const legacyPath = legacyConfigPath(pluginName);
    return existsSync(legacyPath) ? legacyPath : primaryPath;
}
export async function loadConfig(pluginName) {
    const path = resolveConfigPathForRead(pluginName);
    if (!existsSync(path))
        return null;
    try {
        const raw = await readFile(path, 'utf-8');
        return JSON.parse(raw);
    }
    catch (e) {
        throw new PluginError(`Failed to parse config at ${path}: ${e.message}`, 'CONFIG_INVALID');
    }
}
export async function saveConfig(pluginName, data, merge = false) {
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
export async function requireConfig(pluginName) {
    const config = await loadConfig(pluginName);
    if (!config) {
        throw new PluginError(`No config found at ${configPath(pluginName)}. Run the plugin setup to configure credentials.`, 'CONFIG_MISSING');
    }
    return config;
}
//# sourceMappingURL=config.js.map
