#!/usr/bin/env bun
/**
 * Checks that plugins in marketplace.json are sorted alphabetically by name
 * (case-insensitive).
 *
 * Usage:
 *   bun run check-marketplace-sorted.ts          # check only, exit 1 if unsorted
 *   bun run check-marketplace-sorted.ts --fix     # auto-sort and rewrite file
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const MARKETPLACE_PATH = resolve(
  import.meta.dir,
  "../../.claude-plugin/marketplace.json"
);

const shouldFix = process.argv.includes("--fix");

function main(): void {
  const raw = readFileSync(MARKETPLACE_PATH, "utf-8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data.plugins)) {
    console.error("ERROR: marketplace.json has no plugins array");
    process.exit(1);
  }

  const plugins = data.plugins as Array<{ name: string; [k: string]: unknown }>;

  // Build sorted copy for comparison
  const sorted = [...plugins].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  // Find first out-of-order entry
  const unsortedIndices: number[] = [];
  for (let i = 0; i < plugins.length; i++) {
    if (plugins[i].name !== sorted[i].name) {
      unsortedIndices.push(i);
    }
  }

  if (unsortedIndices.length === 0) {
    console.log("Plugins are sorted alphabetically.");
    return;
  }

  if (shouldFix) {
    data.plugins = sorted;
    writeFileSync(MARKETPLACE_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
    console.log("Fixed: plugins sorted alphabetically by name.");
    return;
  }

  // Report the issue
  console.error("Plugins are NOT sorted alphabetically by name.\n");
  console.error("Current order:");
  for (const p of plugins) {
    console.error(`  - ${p.name}`);
  }
  console.error("\nExpected order:");
  for (const p of sorted) {
    console.error(`  - ${p.name}`);
  }
  console.error('\nRun with --fix to auto-sort, or reorder manually.');
  process.exit(1);
}

main();
