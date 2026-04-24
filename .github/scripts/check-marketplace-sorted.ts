#!/usr/bin/env bun
/**
 * Checks that both marketplace files are sorted alphabetically by plugin name.
 *
 * Usage:
 *   bun run check-marketplace-sorted.ts
 *   bun run check-marketplace-sorted.ts --fix
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dir, "../..");
const CODEX_MARKETPLACE_PATH = resolve(ROOT, ".agents/plugins/marketplace.json");
const CLAUDE_MARKETPLACE_PATH = resolve(ROOT, ".claude-plugin/marketplace.json");
const shouldFix = process.argv.includes("--fix");

function checkSorted(filePath: string, label: string): string[] {
  const raw = readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data.plugins)) {
    return [`${label}: marketplace has no plugins array`];
  }

  const plugins = data.plugins as Array<{ name: string; [k: string]: unknown }>;
  const sorted = [...plugins].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  const isSorted = plugins.every((plugin, index) => plugin.name === sorted[index]?.name);
  if (isSorted) {
    return [];
  }

  if (shouldFix) {
    data.plugins = sorted;
    writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
    return [];
  }

  return [
    `${label}: plugins are not sorted alphabetically`,
    `${label}: current order = ${plugins.map((plugin) => plugin.name).join(", ")}`,
    `${label}: expected order = ${sorted.map((plugin) => plugin.name).join(", ")}`,
  ];
}

function main(): void {
  const errors = [
    ...checkSorted(CODEX_MARKETPLACE_PATH, "Codex marketplace"),
    ...checkSorted(CLAUDE_MARKETPLACE_PATH, "Claude marketplace"),
  ];

  if (errors.length > 0) {
    console.error("Marketplace ordering failed:\n");
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    console.error('\nRun with --fix to auto-sort both marketplace files.');
    process.exit(1);
  }

  if (shouldFix) {
    console.log("Both marketplace files are sorted alphabetically.");
    return;
  }

  console.log("Both marketplace files are sorted alphabetically.");
}

main();
