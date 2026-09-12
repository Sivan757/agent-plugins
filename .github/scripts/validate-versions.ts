#!/usr/bin/env bun
/**
 * Validates local plugin version consistency. A plugin version is declared in
 * several places by design, so this gate keeps them from drifting:
 *   - plugins/<name>/plugin.config.ts        (metadata source of truth)
 *   - plugins/<name>/package.json            (only for plugins that build)
 *   - plugins/<name>/.claude-plugin/plugin.json  (generated)
 *   - .claude-plugin/marketplace.json        (generated entry)
 *
 * Exit 0 if all consistent, exit 1 on any mismatch.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, relative, resolve } from "path";
import { pathToFileURL } from "url";

const ROOT = resolve(import.meta.dir, "../..");
const PLUGINS_ROOT = join(ROOT, "plugins");
const CLAUDE_MARKETPLACE_PATH = join(ROOT, ".claude-plugin/marketplace.json");

interface VersionEntry {
  file: string;
  version: string;
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
  const configPath = join(pluginRoot, "plugin.config.ts");
  if (!existsSync(configPath)) {
    return undefined;
  }

  const imported = (await import(`${pathToFileURL(configPath).href}?mtime=${Date.now()}`)) as {
    default?: PluginConfig;
  };
  return imported.default;
}

/**
 * A CLI that prints a version the metadata disagrees with is the worst kind of
 * drift: it is the answer an agent reads back when diagnosing an install.
 */
function readCliDeclaredVersions(pluginRoot: string): VersionEntry[] {
  const srcRoot = join(pluginRoot, "src");
  if (!existsSync(srcRoot)) {
    return [];
  }

  const entries: VersionEntry[] = [];
  const pattern = /\.version\(\s*["']([^"']+)["']\s*\)/g;

  const walk = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(path);
      } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
        for (const match of readFileSync(path, "utf-8").matchAll(pattern)) {
          entries.push({ file: relative(ROOT, path), version: match[1] });
        }
      }
    }
  };
  walk(srcRoot);

  return entries;
}

async function main(): Promise<void> {
  const claude = readJson<{ plugins?: Array<{ name: string; version?: string; source?: unknown }> }>(
    CLAUDE_MARKETPLACE_PATH
  );

  if (!Array.isArray(claude.plugins)) {
    console.error("ERROR: Claude marketplace has no plugins array");
    process.exit(1);
  }

  const claudeLocal = new Map<string, ClaudeLocalEntry>();
  for (const plugin of claude.plugins) {
    if (typeof plugin.source === "string" && typeof plugin.version === "string") {
      claudeLocal.set(plugin.name, { name: plugin.name, path: plugin.source, version: plugin.version });
    }
  }

  const pluginNames = new Set<string>(claudeLocal.keys());
  for (const entry of readdirSync(PLUGINS_ROOT)) {
    const pluginRoot = join(PLUGINS_ROOT, entry);
    if (statSync(pluginRoot).isDirectory() && existsSync(join(pluginRoot, "plugin.config.ts"))) {
      pluginNames.add(entry);
    }
  }

  const errors: string[] = [];
  let checkedCount = 0;

  for (const pluginName of [...pluginNames].sort()) {
    checkedCount++;

    const pluginRoot = join(PLUGINS_ROOT, pluginName);
    const relativeRoot = `plugins/${pluginName}`;
    const claudeEntry = claudeLocal.get(pluginName);

    const config = await loadPluginConfig(pluginRoot);
    if (!config) {
      errors.push(`${pluginName}: marketplace entry exists but ${relativeRoot}/plugin.config.ts is missing`);
      continue;
    }
    if (config.name !== pluginName) {
      errors.push(`${pluginName}: plugin.config name is ${config.name} (expected ${pluginName})`);
    }

    const versions: VersionEntry[] = [
      {
        file: `${relativeRoot}/plugin.config.ts`,
        version: config.version,
      },
      ...readCliDeclaredVersions(pluginRoot),
    ];

    const packageJsonPath = join(pluginRoot, "package.json");
    if (existsSync(packageJsonPath)) {
      const pkg = readJson<{ version?: string }>(packageJsonPath);
      if (typeof pkg.version === "string") {
        versions.push({ file: `${relativeRoot}/package.json`, version: pkg.version });
      }
    }

    const claudeManifestPath = join(pluginRoot, ".claude-plugin/plugin.json");
    if (!existsSync(claudeManifestPath)) {
      errors.push(`${pluginName}: missing ${relativeRoot}/.claude-plugin/plugin.json`);
      continue;
    }
    const claudeManifest = readJson<{ name?: string; version?: string }>(claudeManifestPath);
    if (claudeManifest.name !== pluginName) {
      errors.push(`${pluginName}: .claude-plugin/plugin.json name is ${claudeManifest.name} (expected ${pluginName})`);
    }
    if (typeof claudeManifest.version === "string") {
      versions.push({ file: `${relativeRoot}/.claude-plugin/plugin.json`, version: claudeManifest.version });
    }

    if (!claudeEntry) {
      errors.push(`${pluginName}: missing from .claude-plugin/marketplace.json`);
    } else {
      const expectedPath = `./${relativeRoot}`;
      if (claudeEntry.path !== expectedPath) {
        errors.push(`${pluginName}: Claude marketplace path is ${claudeEntry.path} (expected ${expectedPath})`);
      }
      versions.push({ file: ".claude-plugin/marketplace.json", version: claudeEntry.version });
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
