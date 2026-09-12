import { existsSync } from "fs";
import { mkdir, readdir, readFile, stat, writeFile } from "fs/promises";
import { dirname, join, relative, resolve } from "path";
import { pathToFileURL } from "url";

type JsonObject = Record<string, unknown>;

/**
 * Metadata that only describes the plugin to Claude Code. Everything the plugin
 * actually runs — skills, commands, agents, hooks, MCP configs and the `dist/`
 * bundle — is a native file in the plugin directory and is never derived from
 * this config.
 */
export interface PluginConfig {
  name: string;
  version: string;
  description: string;
  author?: { name: string };
  keywords?: string[];
  marketplace?: {
    /** Longer, trigger-rich wording used for the marketplace listing. */
    description?: string;
  };
}

interface LoadedPluginConfig {
  config: PluginConfig;
  pluginRoot: string;
}

interface MarketplaceFile {
  plugins?: unknown[];
  [key: string]: unknown;
}

const PLUGINS_DIR = "plugins";
const CLAUDE_MARKETPLACE_PATH = ".claude-plugin/marketplace.json";

function isRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function assertPluginConfig(value: unknown, filePath: string): asserts value is PluginConfig {
  if (!isRecord(value)) {
    throw new Error(`${filePath}: config must export an object`);
  }

  for (const field of ["name", "version", "description"] as const) {
    if (!isNonEmptyString(value[field])) {
      throw new Error(`${filePath}: "${field}" must be a non-empty string`);
    }
  }

  if ("keywords" in value && value.keywords !== undefined) {
    if (!Array.isArray(value.keywords) || !value.keywords.every(isNonEmptyString)) {
      throw new Error(`${filePath}: "keywords" must be an array of non-empty strings`);
    }
  }

  if ("author" in value && value.author !== undefined) {
    if (!isRecord(value.author) || !isNonEmptyString(value.author.name)) {
      throw new Error(`${filePath}: "author.name" must be a non-empty string`);
    }
  }

  if ("marketplace" in value && value.marketplace !== undefined) {
    if (!isRecord(value.marketplace)) {
      throw new Error(`${filePath}: "marketplace" must be an object when present`);
    }
    const description = value.marketplace.description;
    if (description !== undefined && !isNonEmptyString(description)) {
      throw new Error(`${filePath}: "marketplace.description" must be a non-empty string when present`);
    }
  }
}

async function readJsonFile(filePath: string): Promise<unknown> {
  return JSON.parse(await readFile(filePath, "utf-8"));
}

function stringifyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, stringifyJson(value), "utf-8");
}

async function readMarketplace(filePath: string, fallback: MarketplaceFile): Promise<MarketplaceFile> {
  if (!existsSync(filePath)) {
    return fallback;
  }
  const parsed = await readJsonFile(filePath);
  if (!isRecord(parsed)) {
    throw new Error(`${filePath}: marketplace must be a JSON object`);
  }
  return parsed as MarketplaceFile;
}

async function listPluginDirectories(root: string): Promise<string[]> {
  const pluginsRoot = join(root, PLUGINS_DIR);
  if (!existsSync(pluginsRoot)) {
    return [];
  }

  const entries = await readdir(pluginsRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(pluginsRoot, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

async function loadConfigFile(filePath: string): Promise<PluginConfig> {
  const stats = await stat(filePath);
  const moduleUrl = `${pathToFileURL(filePath).href}?mtime=${stats.mtimeMs}`;
  const imported = (await import(moduleUrl)) as { default?: unknown };
  assertPluginConfig(imported.default, filePath);
  return imported.default;
}

/** Every plugin directory carries `plugin.config.ts` as its metadata source. */
export async function loadPluginConfigs(root: string): Promise<LoadedPluginConfig[]> {
  const loaded: LoadedPluginConfig[] = [];

  for (const pluginRoot of await listPluginDirectories(root)) {
    const configPath = join(pluginRoot, "plugin.config.ts");
    if (!existsSync(configPath)) {
      throw new Error(`${relative(root, pluginRoot)}: missing plugin.config.ts`);
    }

    const config = await loadConfigFile(configPath);
    const expectedRoot = join(root, PLUGINS_DIR, config.name);
    if (resolve(pluginRoot) !== resolve(expectedRoot)) {
      throw new Error(`${relative(root, configPath)}: config.name must match plugin directory name`);
    }

    loaded.push({ config, pluginRoot });
  }

  return loaded.sort((a, b) => a.config.name.localeCompare(b.config.name));
}

export function renderClaudeManifest(config: PluginConfig): JsonObject {
  const manifest: JsonObject = {
    name: config.name,
    version: config.version,
    description: config.description,
  };

  if (config.author) {
    manifest.author = config.author;
  }
  if (config.keywords) {
    manifest.keywords = config.keywords;
  }

  return manifest;
}

export function renderClaudeManifestPath(root: string, name: string): string {
  return join(root, PLUGINS_DIR, name, ".claude-plugin", "plugin.json");
}

function claudeMarketplaceEntry(config: PluginConfig): JsonObject {
  return {
    name: config.name,
    version: config.version,
    source: `./${PLUGINS_DIR}/${config.name}`,
    description: config.marketplace?.description ?? config.description,
  };
}

function isLocalPluginEntry(entry: unknown): boolean {
  return isRecord(entry) && isNonEmptyString(entry.source) && entry.source.startsWith(`./${PLUGINS_DIR}/`);
}

function sortMarketplacePlugins(plugins: unknown[]): unknown[] {
  return [...plugins].sort((a, b) => {
    const left = isRecord(a) && isNonEmptyString(a.name) ? a.name : "";
    const right = isRecord(b) && isNonEmptyString(b.name) ? b.name : "";
    return left.toLowerCase().localeCompare(right.toLowerCase());
  });
}

/** Local entries are derived from plugin.config.ts; curated third-party entries are preserved. */
async function renderClaudeMarketplace(root: string, configs: PluginConfig[]): Promise<MarketplaceFile> {
  const filePath = join(root, CLAUDE_MARKETPLACE_PATH);
  const marketplace = await readMarketplace(filePath, {
    name: "agent-plugins",
    plugins: [],
  });
  const existingPlugins = Array.isArray(marketplace.plugins) ? marketplace.plugins : [];
  const externalPlugins = existingPlugins.filter((entry) => !isLocalPluginEntry(entry));

  return {
    ...marketplace,
    plugins: sortMarketplacePlugins([...externalPlugins, ...configs.map(claudeMarketplaceEntry)]),
  };
}

export async function generatePluginFiles(root = process.cwd()): Promise<void> {
  const repoRoot = resolve(root);
  const loaded = await loadPluginConfigs(repoRoot);

  for (const { config } of loaded) {
    await writeJsonFile(renderClaudeManifestPath(repoRoot, config.name), renderClaudeManifest(config));
  }

  await writeJsonFile(
    join(repoRoot, CLAUDE_MARKETPLACE_PATH),
    await renderClaudeMarketplace(repoRoot, loaded.map((entry) => entry.config))
  );
}

interface VersionEntry {
  file: string;
  version: string;
}

async function listTypeScriptFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listTypeScriptFiles(path)));
    } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      files.push(path);
    }
  }
  return files;
}

/**
 * A version is declared in several places on purpose. The generated files are
 * already compared byte-for-byte above, so what remains are the hand-written
 * declarations: `package.json`, and the CLI's own `.version()` — the value an
 * agent reads back when diagnosing an install.
 */
async function readDeclaredVersions(
  repoRoot: string,
  pluginRoot: string,
  config: PluginConfig
): Promise<VersionEntry[]> {
  const pluginRel = relative(repoRoot, pluginRoot);
  const entries: VersionEntry[] = [
    { file: `${pluginRel}/plugin.config.ts`, version: config.version },
  ];

  const packageJsonPath = join(pluginRoot, "package.json");
  if (existsSync(packageJsonPath)) {
    const pkg = JSON.parse(await readFile(packageJsonPath, "utf-8")) as { version?: unknown };
    if (typeof pkg.version === "string") {
      entries.push({ file: `${pluginRel}/package.json`, version: pkg.version });
    }
  }

  const srcRoot = join(pluginRoot, "src");
  if (existsSync(srcRoot)) {
    const pattern = /\.version\(\s*["']([^"']+)["']\s*\)/g;
    for (const file of await listTypeScriptFiles(srcRoot)) {
      for (const match of (await readFile(file, "utf-8")).matchAll(pattern)) {
        entries.push({ file: relative(repoRoot, file), version: match[1] });
      }
    }
  }

  return entries;
}

async function compareJsonFile(filePath: string, expected: unknown, errors: string[], label: string): Promise<void> {
  if (!existsSync(filePath)) {
    errors.push(`${label}: missing generated file`);
    return;
  }

  let actual: unknown;
  try {
    actual = await readJsonFile(filePath);
  } catch (err) {
    errors.push(`${label}: invalid JSON: ${(err as Error).message}`);
    return;
  }

  if (stringifyJson(actual) !== stringifyJson(expected)) {
    errors.push(`${label}: generated content does not match plugin metadata; run npm run generate:plugins`);
  }
}

/**
 * Checks every file derived from `plugin.config.ts`, plus the version
 * declarations that are written by hand: the generated `.claude-plugin/plugin.json`
 * and marketplace must match the metadata byte for byte, and `package.json` and
 * the CLI's own `.version()` must agree with it. Nothing is emitted here.
 */
export async function validatePluginMetadata(root = process.cwd()): Promise<string[]> {
  const repoRoot = resolve(root);
  const errors: string[] = [];
  let loaded: LoadedPluginConfig[] = [];

  try {
    loaded = await loadPluginConfigs(repoRoot);
  } catch (err) {
    return [(err as Error).message];
  }

  for (const { config, pluginRoot } of loaded) {
    await compareJsonFile(
      renderClaudeManifestPath(repoRoot, config.name),
      renderClaudeManifest(config),
      errors,
      `${PLUGINS_DIR}/${config.name}/.claude-plugin/plugin.json`
    );

    const declared = await readDeclaredVersions(repoRoot, pluginRoot, config);
    if (new Set(declared.map((entry) => entry.version)).size > 1) {
      const details = declared.map((entry) => `      ${entry.file}: ${entry.version}`).join("\n");
      errors.push(`${PLUGINS_DIR}/${config.name}: version mismatch across declarations\n${details}`);
    }
  }

  await compareJsonFile(
    join(repoRoot, CLAUDE_MARKETPLACE_PATH),
    await renderClaudeMarketplace(repoRoot, loaded.map((entry) => entry.config)),
    errors,
    CLAUDE_MARKETPLACE_PATH
  );

  return errors;
}
