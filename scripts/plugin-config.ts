import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "fs/promises";
import { existsSync } from "fs";
import { dirname, join, relative, resolve } from "path";
import { pathToFileURL } from "url";

type JsonObject = Record<string, unknown>;

export interface PluginConfig {
  name: string;
  version: string;
  description: string;
  author?: { name: string };
  keywords?: string[];
  category: string;
  interface?: JsonObject;
  build?: {
    entry: string;
    output: string;
  };
  surfaces?: {
    skills?: boolean;
    mcp?: boolean;
    app?: boolean;
  };
  artifact?: {
    include?: string[];
  };
  marketplace?: {
    claude?: {
      description?: string;
    };
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

export interface PackOptions {
  outDir?: string;
  clean?: boolean;
}

export interface ValidateOptions {
  packsRoot?: string;
}

const SOURCE_PLUGINS_DIR = "src";
const RELEASE_PLUGINS_DIR = "plugins";
const BUILD_STAGING_DIR = ".build/plugin-dist";
const CLAUDE_MARKETPLACE_PATH = ".claude-plugin/marketplace.json";
const DEFAULT_PACK_ROOT = RELEASE_PLUGINS_DIR;
const SOURCE_ONLY_ARTIFACT_ENTRIES = [
  "src",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "plugin.config.ts",
  "plugin.config.json",
  "node_modules",
];

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

  for (const field of ["name", "version", "description", "category"] as const) {
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

  if ("interface" in value && value.interface !== undefined && !isRecord(value.interface)) {
    throw new Error(`${filePath}: "interface" must be an object when present`);
  }

  if ("build" in value && value.build !== undefined) {
    if (!isRecord(value.build) || !isNonEmptyString(value.build.entry) || !isNonEmptyString(value.build.output)) {
      throw new Error(`${filePath}: "build.entry" and "build.output" must be non-empty strings`);
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
  const pluginsRoot = join(root, SOURCE_PLUGINS_DIR);
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
  if (filePath.endsWith(".json")) {
    const parsed = await readJsonFile(filePath);
    assertPluginConfig(parsed, filePath);
    return parsed;
  }

  const stats = await stat(filePath);
  const moduleUrl = `${pathToFileURL(filePath).href}?mtime=${stats.mtimeMs}`;
  const imported = (await import(moduleUrl)) as { default?: unknown };
  assertPluginConfig(imported.default, filePath);
  return imported.default;
}

async function loadPluginConfigs(root: string): Promise<LoadedPluginConfig[]> {
  const loaded: LoadedPluginConfig[] = [];

  for (const pluginRoot of await listPluginDirectories(root)) {
    const tsConfig = join(pluginRoot, "plugin.config.ts");
    const jsonConfig = join(pluginRoot, "plugin.config.json");
    const configPath = existsSync(tsConfig) ? tsConfig : existsSync(jsonConfig) ? jsonConfig : undefined;
    if (!configPath) {
      continue;
    }

    const config = await loadConfigFile(configPath);
    const expectedRoot = join(root, SOURCE_PLUGINS_DIR, config.name);
    if (resolve(pluginRoot) !== resolve(expectedRoot)) {
      throw new Error(`${relative(root, configPath)}: config.name must match plugin directory name`);
    }

    loaded.push({ config, pluginRoot });
  }

  return loaded.sort((a, b) => a.config.name.localeCompare(b.config.name));
}

function commonManifestFields(config: PluginConfig): JsonObject {
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

export function renderClaudeManifest(config: PluginConfig): JsonObject {
  return commonManifestFields(config);
}

function claudeMarketplaceEntry(config: PluginConfig): JsonObject {
  return {
    name: config.name,
    version: config.version,
    source: `./${RELEASE_PLUGINS_DIR}/${config.name}`,
    description: config.marketplace?.claude?.description ?? config.description,
  };
}

function isClaudeLocalPluginEntry(entry: unknown): boolean {
  return isRecord(entry) && isNonEmptyString(entry.source) && entry.source.startsWith(`./${RELEASE_PLUGINS_DIR}/`);
}

function sortMarketplacePlugins(plugins: unknown[]): unknown[] {
  return [...plugins].sort((a, b) => {
    const left = isRecord(a) && isNonEmptyString(a.name) ? a.name : "";
    const right = isRecord(b) && isNonEmptyString(b.name) ? b.name : "";
    return left.toLowerCase().localeCompare(right.toLowerCase());
  });
}

async function renderClaudeMarketplace(root: string, configs: PluginConfig[]): Promise<MarketplaceFile> {
  const filePath = join(root, CLAUDE_MARKETPLACE_PATH);
  const marketplace = await readMarketplace(filePath, {
    name: "agent-plugins",
    plugins: [],
  });
  const existingPlugins = Array.isArray(marketplace.plugins) ? marketplace.plugins : [];
  const externalPlugins = existingPlugins.filter((entry) => !isClaudeLocalPluginEntry(entry));

  return {
    ...marketplace,
    plugins: sortMarketplacePlugins([...externalPlugins, ...configs.map(claudeMarketplaceEntry)]),
  };
}

export async function generatePluginFiles(root = process.cwd()): Promise<void> {
  const repoRoot = resolve(root);
  const loaded = await loadPluginConfigs(repoRoot);
  const configs = loaded.map((entry) => entry.config);

  await writeJsonFile(join(repoRoot, CLAUDE_MARKETPLACE_PATH), await renderClaudeMarketplace(repoRoot, configs));
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
    errors.push(`${label}: generated content does not match plugin metadata`);
  }
}

async function validateSourceTree(root: string, loaded: LoadedPluginConfig[], errors: string[]): Promise<void> {
  const pluginRoots = await listPluginDirectories(root);
  for (const pluginRoot of pluginRoots) {
    const hasManifest = existsSync(join(pluginRoot, ".claude-plugin", "plugin.json"));
    const hasConfig = existsSync(join(pluginRoot, "plugin.config.ts")) || existsSync(join(pluginRoot, "plugin.config.json"));
    if (!hasConfig) {
      errors.push(`${relative(root, pluginRoot)}: missing plugin.config.ts or plugin.config.json`);
    }
    if (hasManifest) {
      errors.push(`${relative(root, pluginRoot)}: source tree must not contain generated plugin manifests`);
    }
  }

  for (const { config, pluginRoot } of loaded) {
    const packageJsonPath = join(pluginRoot, "package.json");
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = await readJsonFile(packageJsonPath);
        if (isRecord(packageJson) && packageJson.version !== config.version) {
          errors.push(
            `${relative(root, packageJsonPath)}: package.json version ${String(packageJson.version)} does not match plugin.config version ${config.version}`
          );
        }
      } catch (err) {
        errors.push(`${relative(root, packageJsonPath)}: invalid JSON: ${(err as Error).message}`);
      }
    }

    if (config.surfaces?.skills && !existsSync(join(pluginRoot, "skills"))) {
      errors.push(`${relative(root, pluginRoot)}: metadata declares skills but skills/ is missing`);
    }
    if (config.surfaces?.mcp && !existsSync(join(pluginRoot, ".mcp.json"))) {
      errors.push(`${relative(root, pluginRoot)}: metadata declares mcp but .mcp.json is missing`);
    }
    if (config.surfaces?.app && !existsSync(join(pluginRoot, ".app.json"))) {
      errors.push(`${relative(root, pluginRoot)}: metadata declares app but .app.json is missing`);
    }
  }

  const configs = loaded.map((entry) => entry.config);
  await compareJsonFile(
    join(root, CLAUDE_MARKETPLACE_PATH),
    await renderClaudeMarketplace(root, configs),
    errors,
    CLAUDE_MARKETPLACE_PATH
  );
}

async function copyPath(source: string, destination: string): Promise<void> {
  if (!existsSync(source)) {
    throw new Error(`Cannot copy missing path: ${source}`);
  }

  const stats = await stat(source);
  if (stats.isDirectory()) {
    await mkdir(destination, { recursive: true });
    const entries = await readdir(source, { withFileTypes: true });
    for (const entry of entries) {
      await copyPath(join(source, entry.name), join(destination, entry.name));
    }
    return;
  }

  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

function assertInsideRoot(root: string, relativePath: string, label: string): string {
  const resolved = resolve(root, relativePath);
  const rel = relative(root, resolved);
  if (rel === "" || rel.startsWith("..")) {
    throw new Error(`${label}: path must stay inside plugin root (${relativePath})`);
  }
  return resolved;
}

async function copyRelativePath(pluginRoot: string, packedRoot: string, relativePath: string): Promise<void> {
  const source = assertInsideRoot(pluginRoot, relativePath, relativePath);
  const destination = resolve(packedRoot, relativePath);
  await copyPath(source, destination);
}

export async function packPlugins(root = process.cwd(), options: PackOptions = {}): Promise<void> {
  const repoRoot = resolve(root);
  const loaded = await loadPluginConfigs(repoRoot);
  const outRoot = resolve(repoRoot, options.outDir ?? DEFAULT_PACK_ROOT);

  if (options.clean !== false) {
    await rm(outRoot, { recursive: true, force: true });
  }

  for (const { config, pluginRoot } of loaded) {
    const packedRoot = join(outRoot, config.name);
    await rm(packedRoot, { recursive: true, force: true });

    await writeJsonFile(join(packedRoot, ".claude-plugin", "plugin.json"), renderClaudeManifest(config));

    if (config.surfaces?.skills) {
      await copyRelativePath(pluginRoot, packedRoot, "skills");
    }
    if (config.surfaces?.mcp) {
      await copyRelativePath(pluginRoot, packedRoot, ".mcp.json");
    }
    if (config.surfaces?.app) {
      await copyRelativePath(pluginRoot, packedRoot, ".app.json");
    }
    if (existsSync(join(pluginRoot, "README.md"))) {
      await copyRelativePath(pluginRoot, packedRoot, "README.md");
    }

    // Claude Code auto-discovers hooks/hooks.json; pack it whenever present.
    for (const nativeDirectory of ["assets", "commands", "agents", "hooks"] as const) {
      if (existsSync(join(pluginRoot, nativeDirectory))) {
        await copyRelativePath(pluginRoot, packedRoot, nativeDirectory);
      }
    }

    const stagedPluginRoot = join(repoRoot, BUILD_STAGING_DIR, config.name);
    if (existsSync(join(stagedPluginRoot, "dist"))) {
      await copyRelativePath(stagedPluginRoot, packedRoot, "dist");
    } else if (existsSync(join(pluginRoot, "dist"))) {
      await copyRelativePath(pluginRoot, packedRoot, "dist");
    } else if (config.build?.output) {
      throw new Error(
        `${relative(repoRoot, pluginRoot)}: build output directory is missing; run npm run build before npm run pack:plugins`
      );
    }

    for (const includePath of config.artifact?.include ?? []) {
      const includeRoot = existsSync(join(stagedPluginRoot, includePath)) ? stagedPluginRoot : pluginRoot;
      await copyRelativePath(includeRoot, packedRoot, includePath);
    }
  }
}

async function validatePackArtifacts(
  root: string,
  loaded: LoadedPluginConfig[],
  packsRoot: string,
  errors: string[]
): Promise<void> {
  const outRoot = resolve(root, packsRoot);

  for (const { config } of loaded) {
    const packedRoot = join(outRoot, config.name);
    if (!existsSync(packedRoot)) {
      errors.push(`${relative(root, packedRoot)}: missing packed plugin artifact`);
      continue;
    }

    await compareJsonFile(
      join(packedRoot, ".claude-plugin", "plugin.json"),
      renderClaudeManifest(config),
      errors,
      `${relative(root, packedRoot)}/.claude-plugin/plugin.json`
    );

    for (const sourceOnlyEntry of SOURCE_ONLY_ARTIFACT_ENTRIES) {
      if (existsSync(join(packedRoot, sourceOnlyEntry))) {
        errors.push(`${relative(root, packedRoot)}: source-only entry should not be packed (${sourceOnlyEntry})`);
      }
    }

    if (config.surfaces?.skills && !existsSync(join(packedRoot, "skills"))) {
      errors.push(`${relative(root, packedRoot)}: packed artifact is missing skills/`);
    }
    if (config.surfaces?.mcp && !existsSync(join(packedRoot, ".mcp.json"))) {
      errors.push(`${relative(root, packedRoot)}: packed artifact is missing .mcp.json`);
    }
    if (config.surfaces?.app && !existsSync(join(packedRoot, ".app.json"))) {
      errors.push(`${relative(root, packedRoot)}: packed artifact is missing .app.json`);
    }
    if (config.build?.output && !existsSync(join(packedRoot, config.build.output))) {
      errors.push(`${relative(root, packedRoot)}: packed artifact is missing build output ${config.build.output}`);
    }
    for (const includePath of config.artifact?.include ?? []) {
      if (!existsSync(join(packedRoot, includePath))) {
        errors.push(`${relative(root, packedRoot)}: packed artifact is missing declared include ${includePath}`);
      }
    }
  }
}

export async function validatePluginMetadata(
  root = process.cwd(),
  options: ValidateOptions = {}
): Promise<string[]> {
  const repoRoot = resolve(root);
  const errors: string[] = [];
  let loaded: LoadedPluginConfig[] = [];

  try {
    loaded = await loadPluginConfigs(repoRoot);
  } catch (err) {
    errors.push((err as Error).message);
    return errors;
  }

  await validateSourceTree(repoRoot, loaded, errors);

  if (options.packsRoot) {
    await validatePackArtifacts(repoRoot, loaded, options.packsRoot, errors);
  }

  return errors;
}
