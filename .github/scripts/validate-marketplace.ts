#!/usr/bin/env bun
/**
 * Validates .claude-plugin/marketplace.json structure and content.
 *
 * Checks:
 *  - File is valid JSON with a root object
 *  - Has a `plugins` array
 *  - Each plugin has required fields: name (string), description (string),
 *    source (string), version (string)
 *  - No duplicate plugin names
 *
 * Exit 0 on success, exit 1 on any validation error.
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const MARKETPLACE_PATH = resolve(
  import.meta.dir,
  "../../.claude-plugin/marketplace.json"
);

// "version" is only required for local plugins; external URL plugins omit it
const REQUIRED_FIELDS = ["name", "description", "source"] as const;

function main(): void {
  const errors: string[] = [];

  // --- Read and parse JSON ---
  let raw: string;
  try {
    raw = readFileSync(MARKETPLACE_PATH, "utf-8");
  } catch (err) {
    console.error(`ERROR: Cannot read ${MARKETPLACE_PATH}: ${err}`);
    process.exit(1);
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`ERROR: Invalid JSON in marketplace.json: ${err}`);
    process.exit(1);
  }

  // --- Root must be an object ---
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    console.error("ERROR: Root of marketplace.json must be a JSON object");
    process.exit(1);
  }

  const root = data as Record<string, unknown>;

  // --- Must have a plugins array ---
  if (!Array.isArray(root.plugins)) {
    errors.push('"plugins" must be an array');
  } else {
    const plugins = root.plugins as unknown[];
    const seenNames = new Map<string, number>(); // name -> first index

    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i];
      const prefix = `plugins[${i}]`;

      if (typeof plugin !== "object" || plugin === null || Array.isArray(plugin)) {
        errors.push(`${prefix}: must be an object`);
        continue;
      }

      const obj = plugin as Record<string, unknown>;

      // Check required fields
      for (const field of REQUIRED_FIELDS) {
        const val = obj[field];
        if (field === "source") {
          // source can be a string (local path) or object (url/git-subdir)
          const isLocalSource = typeof val === "string" && val.trim() !== "";
          const isRemoteSource =
            typeof val === "object" &&
            val !== null &&
            !Array.isArray(val) &&
            typeof (val as Record<string, unknown>).source === "string";
          if (!isLocalSource && !isRemoteSource) {
            errors.push(
              `${prefix}: "source" must be a string (local path) or object with { source, url } (got ${typeof val})`
            );
          }
        } else if (typeof val !== "string") {
          errors.push(
            `${prefix}: "${field}" must be a string (got ${typeof val})`
          );
        } else if ((val as string).trim() === "") {
          errors.push(`${prefix}: "${field}" must not be empty`);
        }
      }

      // Local plugins (string source) must have a version
      if (typeof obj.source === "string" && typeof obj.version !== "string") {
        errors.push(`${prefix}: local plugin must have a "version" string`);
      }

      // Check for duplicate names
      if (typeof obj.name === "string") {
        const name = obj.name as string;
        if (seenNames.has(name)) {
          errors.push(
            `${prefix}: duplicate plugin name "${name}" (first seen at plugins[${seenNames.get(name)}])`
          );
        } else {
          seenNames.set(name, i);
        }
      }
    }
  }

  // --- Report results ---
  if (errors.length > 0) {
    console.error("Marketplace validation failed:\n");
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    console.error(`\n${errors.length} error(s) found.`);
    process.exit(1);
  }

  const count = (root.plugins as unknown[]).length;
  console.log(`Marketplace validation passed: ${count} plugin(s) valid.`);
}

main();
