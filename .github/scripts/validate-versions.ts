#!/usr/bin/env bun
/**
 * Validates that plugin versions are consistent across:
 *   - .claude-plugin/marketplace.json  (the registry)
 *   - {source}/package.json            (if it exists)
 *   - {source}/.claude-plugin/plugin.json  (if it exists)
 *
 * For each plugin in marketplace.json, compares versions across all files
 * that exist and reports mismatches.
 *
 * Exit 0 if all consistent, exit 1 on any mismatch.
 */

import { readFileSync, existsSync } from "fs";
import { resolve, join } from "path";

const ROOT = resolve(import.meta.dir, "../..");
const MARKETPLACE_PATH = join(ROOT, ".claude-plugin/marketplace.json");

interface VersionEntry {
  file: string;
  version: string;
}

function main(): void {
  const raw = readFileSync(MARKETPLACE_PATH, "utf-8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data.plugins)) {
    console.error("ERROR: marketplace.json has no plugins array");
    process.exit(1);
  }

  const plugins = data.plugins as Array<{
    name: string;
    version: string;
    source: string;
  }>;

  const errors: string[] = [];
  let checkedCount = 0;

  for (const plugin of plugins) {
    // Skip external plugins (URL/git-subdir sources) — no local files to check
    if (typeof plugin.source !== "string") {
      continue;
    }

    const versions: VersionEntry[] = [];

    // Marketplace version is the baseline
    versions.push({
      file: "marketplace.json",
      version: plugin.version,
    });

    // Resolve the source directory (strip leading ./)
    const sourceDir = resolve(ROOT, plugin.source.replace(/^\.\//, ""));

    // Check package.json
    const packageJsonPath = join(sourceDir, "package.json");
    if (existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
        if (typeof pkg.version === "string") {
          versions.push({
            file: `${plugin.source}/package.json`,
            version: pkg.version,
          });
        }
      } catch {
        errors.push(`${plugin.name}: failed to parse ${packageJsonPath}`);
      }
    }

    // Check plugin.json
    const pluginJsonPath = join(sourceDir, ".claude-plugin/plugin.json");
    if (existsSync(pluginJsonPath)) {
      try {
        const pj = JSON.parse(readFileSync(pluginJsonPath, "utf-8"));
        if (typeof pj.version === "string") {
          versions.push({
            file: `${plugin.source}/.claude-plugin/plugin.json`,
            version: pj.version,
          });
        }
      } catch {
        errors.push(`${plugin.name}: failed to parse ${pluginJsonPath}`);
      }
    }

    // Compare all found versions
    const uniqueVersions = new Set(versions.map((v) => v.version));
    if (uniqueVersions.size > 1) {
      const details = versions
        .map((v) => `    ${v.file}: ${v.version}`)
        .join("\n");
      errors.push(`${plugin.name}: version mismatch\n${details}`);
    }

    checkedCount++;
  }

  if (errors.length > 0) {
    console.error("Version validation failed:\n");
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    console.error(`\n${errors.length} mismatch(es) found.`);
    process.exit(1);
  }

  console.log(
    `Version validation passed: ${checkedCount} plugin(s) checked, all consistent.`
  );
}

main();
