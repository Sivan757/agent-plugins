#!/usr/bin/env bun
/**
 * Validates the Claude Code marketplace file:
 *   - .claude-plugin/marketplace.json
 *
 * Exit 0 on success, exit 1 on any validation error.
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dir, "../..");
const CLAUDE_MARKETPLACE_PATH = resolve(ROOT, ".claude-plugin/marketplace.json");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readJson(filePath: string): unknown {
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error(`ERROR: Cannot read or parse ${filePath}: ${err}`);
    process.exit(1);
  }
}

function validateClaudeMarketplace(data: unknown): { errors: string[]; count: number } {
  const errors: string[] = [];

  if (!isRecord(data)) {
    return { errors: ["Root of Claude marketplace must be a JSON object"], count: 0 };
  }

  const root = data;
  if (typeof root.name !== "string" || root.name.trim() === "") {
    errors.push('Claude marketplace: top-level "name" must be a non-empty string');
  }
  if (!Array.isArray(root.plugins)) {
    return { errors: ['Claude marketplace: "plugins" must be an array'], count: 0 };
  }

  const plugins = root.plugins as unknown[];
  const seenNames = new Map<string, number>();

  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i];
    const prefix = `Claude plugins[${i}]`;

    if (!isRecord(plugin)) {
      errors.push(`${prefix}: must be an object`);
      continue;
    }

    const obj = plugin;
    if (typeof obj.name !== "string" || obj.name.trim() === "") {
      errors.push(`${prefix}: "name" must be a non-empty string`);
    }
    if (typeof obj.description !== "string" || obj.description.trim() === "") {
      errors.push(`${prefix}: "description" must be a non-empty string`);
    }

    const expectedPath = typeof obj.name === "string" && obj.name.trim() !== "" ? `./plugins/${obj.name}` : undefined;
    const source = obj.source;
    const isLocalSource = typeof source === "string" && source.trim() !== "";
    const isRemoteSource = isRecord(source) && typeof source.source === "string";
    if (!isLocalSource && !isRemoteSource) {
      errors.push(`${prefix}: "source" must be a local path string or remote source object`);
    }

    if (isLocalSource) {
      if (expectedPath && source !== expectedPath) {
        errors.push(`${prefix}: local "source" must be ${expectedPath}`);
      } else {
        const target = resolve(ROOT, source);
        if (!existsSync(target)) {
          errors.push(`${prefix}: local "source" target does not exist (${source})`);
        }
      }

      if (typeof obj.version !== "string" || obj.version.trim() === "") {
        errors.push(`${prefix}: local plugin must have a non-empty "version" string`);
      }
    }

    if (typeof obj.name === "string") {
      if (seenNames.has(obj.name)) {
        errors.push(`${prefix}: duplicate plugin name "${obj.name}"`);
      } else {
        seenNames.set(obj.name, i);
      }
    }
  }

  return { errors, count: plugins.length };
}

function main(): void {
  const claudeResult = validateClaudeMarketplace(readJson(CLAUDE_MARKETPLACE_PATH));

  if (claudeResult.errors.length > 0) {
    console.error("Marketplace validation failed:\n");
    for (const err of claudeResult.errors) {
      console.error(`  - ${err}`);
    }
    console.error(`\n${claudeResult.errors.length} error(s) found.`);
    process.exit(1);
  }

  console.log(`Marketplace validation passed: claude=${claudeResult.count} plugin(s).`);
}

main();
