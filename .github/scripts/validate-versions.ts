#!/usr/bin/env bun
/**
 * Validates local plugin version consistency across:
 *   - src/<name>/plugin.config.ts
 *   - src/<name>/package.json          (if it exists)
 *   - .agents/plugins/marketplace.json
 *   - .claude-plugin/marketplace.json
 *   - plugins/<name>/.codex-plugin/plugin.json
 *   - plugins/<name>/.claude-plugin/plugin.json
 *
 * Exit 0 if all consistent, exit 1 on any mismatch.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import { pathToFileURL } from "url";

const ROOT = resolve(import.meta.dir, "../..");
const SOURCE_ROOT = join(ROOT, "src");
const RELEASE_ROOT = join(ROOT, "plugins");
const CODEX_MARKETPLACE_PATH = join(ROOT, ".agents/plugins/marketplace.json");
const CLAUDE_MARKETPLACE_PATH = join(ROOT, ".claude-plugin/marketplace.json");

interface VersionEntry {
  file: string;
  version: string;
}

interface CodexLocalEntry {
  name: string;
  path: string;
}

interface ClaudeLocalEntry {
  name: string;
  path: string;
  version: string;
}

interface PluginConfig {
  name: string;
  version: string;
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf-8")) as T;
}

async function loadPluginConfig(pluginRoot: string): Promise<PluginConfig | undefined> {
  const tsConfig = join(pluginRoot, "plugin.config.ts");
  const jsonConfig = join(pluginRoot, "plugin.config.json");

  if (existsSync(tsConfig)) {
    const imported = (await import(`${pathToFileURL(tsConfig).href}?mtime=${Date.now()}`)) as {
      default?: PluginConfig;
    };
    return imported.default;
  }

  if (existsSync(jsonConfig)) {
    return readJson<PluginConfig>(jsonConfig);
  }

  return undefined;
}

async function main(): Promise<void> {
  const codex = readJson<{ plugins?: Array<{ name: string; source?: unknown }> }>(CODEX_MARKETPLACE_PATH);
  const claude = readJson<{ plugins?: Array<{ name: string; version?: string; source?: unknown }> }>(
    CLAUDE_MARKETPLACE_PATH
  );

  if (!Array.isArray(codex.plugins)) {
    console.error("ERROR: Codex marketplace has no plugins array");
    process.exit(1);
  }

  if (!Array.isArray(claude.plugins)) {
    console.error("ERROR: Claude marketplace has no plugins array");
    process.exit(1);
  }

  const codexLocal = new Map<string, CodexLocalEntry>();
  for (const plugin of codex.plugins) {
    if (typeof plugin.source === "string") {
      codexLocal.set(plugin.name, { name: plugin.name, path: plugin.source });
      continue;
    }
    if (
      typeof plugin.source === "object" &&
      plugin.source !== null &&
      !Array.isArray(plugin.source) &&
      (plugin.source as Record<string, unknown>).source === "local" &&
      typeof (plugin.source as Record<string, unknown>).path === "string"
    ) {
      codexLocal.set(plugin.name, {
        name: plugin.name,
        path: (plugin.source as Record<string, string>).path,
      });
    }
  }

  const claudeLocal = new Map<string, ClaudeLocalEntry>();
  for (const plugin of claude.plugins) {
    if (typeof plugin.source === "string" && typeof plugin.version === "string") {
      claudeLocal.set(plugin.name, { name: plugin.name, path: plugin.source, version: plugin.version });
    }
  }

  const sourcePlugins = new Set<string>();
  for (const entry of readdirSync(SOURCE_ROOT)) {
    const pluginRoot = join(SOURCE_ROOT, entry);
    if (!statSync(pluginRoot).isDirectory()) {
      continue;
    }
    if (existsSync(join(pluginRoot, "plugin.config.ts")) || existsSync(join(pluginRoot, "plugin.config.json"))) {
      sourcePlugins.add(entry);
    }
  }

  const releasePlugins = new Set<string>();
  if (existsSync(RELEASE_ROOT)) {
    for (const entry of readdirSync(RELEASE_ROOT)) {
      const pluginRoot = join(RELEASE_ROOT, entry);
      if (!statSync(pluginRoot).isDirectory()) {
        continue;
      }

      const hasCodexManifest = existsSync(join(pluginRoot, ".codex-plugin", "plugin.json"));
      const hasClaudeManifest = existsSync(join(pluginRoot, ".claude-plugin", "plugin.json"));
      if (hasCodexManifest || hasClaudeManifest) {
        releasePlugins.add(entry);
      }
    }
  }

  const pluginNames = new Set<string>([
    ...sourcePlugins,
    ...releasePlugins,
    ...codexLocal.keys(),
    ...claudeLocal.keys(),
  ]);
  const errors: string[] = [];
  let checkedCount = 0;

  for (const pluginName of [...pluginNames].sort()) {
    checkedCount++;

    const sourceDir = join(SOURCE_ROOT, pluginName);
    const releaseDir = join(RELEASE_ROOT, pluginName);
    const expectedPath = `./plugins/${pluginName}`;
    const codexEntry = codexLocal.get(pluginName);
    const claudeEntry = claudeLocal.get(pluginName);

    if (!sourcePlugins.has(pluginName)) {
      errors.push(`${pluginName}: release or marketplace entry exists but src/${pluginName} is missing`);
      continue;
    }

    if (!releasePlugins.has(pluginName)) {
      errors.push(`${pluginName}: source plugin exists but ${expectedPath} is missing`);
      continue;
    }

    if (!codexEntry) {
      errors.push(`${pluginName}: missing from .agents/plugins/marketplace.json`);
      continue;
    }
    if (!claudeEntry) {
      errors.push(`${pluginName}: missing from .claude-plugin/marketplace.json`);
      continue;
    }

    if (codexEntry.path !== expectedPath) {
      errors.push(`${pluginName}: Codex marketplace path is ${codexEntry.path} (expected ${expectedPath})`);
    }
    if (claudeEntry.path !== expectedPath) {
      errors.push(`${pluginName}: Claude marketplace path is ${claudeEntry.path} (expected ${expectedPath})`);
    }

    const config = await loadPluginConfig(sourceDir);
    if (!config) {
      errors.push(`${pluginName}: missing src/${pluginName}/plugin.config.ts or plugin.config.json`);
      continue;
    }
    if (config.name !== pluginName) {
      errors.push(`${pluginName}: plugin.config name is ${config.name} (expected ${pluginName})`);
    }

    const versions: VersionEntry[] = [
      {
        file: `src/${pluginName}/plugin.config.ts`,
        version: config.version,
      },
      {
        file: ".claude-plugin/marketplace.json",
        version: claudeEntry.version,
      },
    ];

    const packageJsonPath = join(sourceDir, "package.json");
    if (existsSync(packageJsonPath)) {
      const pkg = readJson<{ version?: string }>(packageJsonPath);
      if (typeof pkg.version === "string") {
        versions.push({
          file: `src/${pluginName}/package.json`,
          version: pkg.version,
        });
      }
    }

    const codexManifestPath = join(releaseDir, ".codex-plugin/plugin.json");
    if (!existsSync(codexManifestPath)) {
      errors.push(`${pluginName}: missing ${expectedPath}/.codex-plugin/plugin.json`);
      continue;
    }
    const codexManifest = readJson<{ name?: string; version?: string }>(codexManifestPath);
    if (codexManifest.name !== pluginName) {
      errors.push(`${pluginName}: .codex-plugin/plugin.json name is ${codexManifest.name} (expected ${pluginName})`);
    }
    if (typeof codexManifest.version === "string") {
      versions.push({
        file: `${expectedPath}/.codex-plugin/plugin.json`,
        version: codexManifest.version,
      });
    }

    const claudeManifestPath = join(releaseDir, ".claude-plugin/plugin.json");
    if (!existsSync(claudeManifestPath)) {
      errors.push(`${pluginName}: missing ${expectedPath}/.claude-plugin/plugin.json`);
      continue;
    }
    const claudeManifest = readJson<{ name?: string; version?: string }>(claudeManifestPath);
    if (claudeManifest.name !== pluginName) {
      errors.push(`${pluginName}: .claude-plugin/plugin.json name is ${claudeManifest.name} (expected ${pluginName})`);
    }
    if (typeof claudeManifest.version === "string") {
      versions.push({
        file: `${expectedPath}/.claude-plugin/plugin.json`,
        version: claudeManifest.version,
      });
    }

    const uniqueVersions = new Set(versions.map((entry) => entry.version));
    if (uniqueVersions.size > 1) {
      const details = versions.map((entry) => `    ${entry.file}: ${entry.version}`).join("\n");
      errors.push(`${pluginName}: version mismatch\n${details}`);
    }
  }

  if (errors.length > 0) {
    console.error("Version validation failed:\n");
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    console.error(`\n${errors.length} mismatch(es) found.`);
    process.exit(1);
  }

  console.log(`Version validation passed: ${checkedCount} local plugin(s) checked, all consistent.`);
}

main().catch((err) => {
  console.error(`Version validation failed: ${(err as Error).message}`);
  process.exit(1);
});
