#!/usr/bin/env bun
/**
 * Validates local plugin consistency across:
 *   - .agents/plugins/marketplace.json
 *   - .claude-plugin/marketplace.json
 *   - plugins/<name>/package.json          (if it exists)
 *   - plugins/<name>/.codex-plugin/plugin.json
 *   - plugins/<name>/.claude-plugin/plugin.json
 *
 * Exit 0 if all consistent, exit 1 on any mismatch.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dir, "../..");
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

function main(): void {
  const codex = JSON.parse(readFileSync(CODEX_MARKETPLACE_PATH, "utf-8"));
  const claude = JSON.parse(readFileSync(CLAUDE_MARKETPLACE_PATH, "utf-8"));
  const pluginsRoot = join(ROOT, "plugins");

  if (!Array.isArray(codex.plugins)) {
    console.error("ERROR: Codex marketplace has no plugins array");
    process.exit(1);
  }

  if (!Array.isArray(claude.plugins)) {
    console.error("ERROR: Claude marketplace has no plugins array");
    process.exit(1);
  }

  const codexLocal = new Map<string, CodexLocalEntry>();
  for (const plugin of codex.plugins as Array<{ name: string; source?: unknown }>) {
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
  for (const plugin of claude.plugins as Array<{ name: string; version?: string; source?: unknown }>) {
    if (typeof plugin.source === "string" && typeof plugin.version === "string") {
      claudeLocal.set(plugin.name, { name: plugin.name, path: plugin.source, version: plugin.version });
    }
  }

  const filesystemPlugins = new Set<string>();
  for (const entry of readdirSync(pluginsRoot)) {
    const pluginRoot = join(pluginsRoot, entry);
    if (!statSync(pluginRoot).isDirectory()) {
      continue;
    }

    const hasCodexManifest = existsSync(join(pluginRoot, ".codex-plugin", "plugin.json"));
    const hasClaudeManifest = existsSync(join(pluginRoot, ".claude-plugin", "plugin.json"));
    if (hasCodexManifest || hasClaudeManifest) {
      filesystemPlugins.add(entry);
    }
  }

  const pluginNames = new Set<string>([...filesystemPlugins, ...codexLocal.keys(), ...claudeLocal.keys()]);
  const errors: string[] = [];
  let checkedCount = 0;

  for (const pluginName of [...pluginNames].sort()) {
    checkedCount++;

    const codexEntry = codexLocal.get(pluginName);
    const claudeEntry = claudeLocal.get(pluginName);
    const expectedPath = `./plugins/${pluginName}`;
    const sourceDir = resolve(ROOT, expectedPath.replace(/^\.\//, ""));
    const pluginExistsOnDisk = filesystemPlugins.has(pluginName);

    if (!pluginExistsOnDisk) {
      errors.push(`${pluginName}: marketplace entry exists but ${expectedPath} is missing`);
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

    const versions: VersionEntry[] = [
      {
        file: ".claude-plugin/marketplace.json",
        version: claudeEntry.version,
      },
    ];

    const packageJsonPath = join(sourceDir, "package.json");
    if (existsSync(packageJsonPath)) {
      const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      if (typeof pkg.version === "string") {
        versions.push({
          file: `${expectedPath}/package.json`,
          version: pkg.version,
        });
      }
    }

    const codexManifestPath = join(sourceDir, ".codex-plugin/plugin.json");
    if (!existsSync(codexManifestPath)) {
      errors.push(`${pluginName}: missing ${expectedPath}/.codex-plugin/plugin.json`);
      continue;
    }
    const codexManifest = JSON.parse(readFileSync(codexManifestPath, "utf-8"));
    if (codexManifest.name !== pluginName) {
      errors.push(`${pluginName}: .codex-plugin/plugin.json name is ${codexManifest.name} (expected ${pluginName})`);
    }
    if (typeof codexManifest.version === "string") {
      versions.push({
        file: `${expectedPath}/.codex-plugin/plugin.json`,
        version: codexManifest.version,
      });
    }

    const claudeManifestPath = join(sourceDir, ".claude-plugin/plugin.json");
    if (!existsSync(claudeManifestPath)) {
      errors.push(`${pluginName}: missing ${expectedPath}/.claude-plugin/plugin.json`);
      continue;
    }
    const claudeManifest = JSON.parse(readFileSync(claudeManifestPath, "utf-8"));
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

main();
