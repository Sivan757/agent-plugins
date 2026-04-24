#!/usr/bin/env bun
/**
 * Validates both marketplace files:
 *   - .agents/plugins/marketplace.json
 *   - .claude-plugin/marketplace.json
 *
 * Exit 0 on success, exit 1 on any validation error.
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dir, "../..");
const CODEX_MARKETPLACE_PATH = resolve(ROOT, ".agents/plugins/marketplace.json");
const CLAUDE_MARKETPLACE_PATH = resolve(ROOT, ".claude-plugin/marketplace.json");
const VALID_INSTALL_POLICIES = new Set(["NOT_AVAILABLE", "AVAILABLE", "INSTALLED_BY_DEFAULT"]);
const VALID_AUTH_POLICIES = new Set(["ON_INSTALL", "ON_USE"]);

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

function validateCodexMarketplace(data: unknown): { errors: string[]; count: number } {
  const errors: string[] = [];

  if (!isRecord(data)) {
    return { errors: ["Root of Codex marketplace must be a JSON object"], count: 0 };
  }

  const root = data;
  if (typeof root.name !== "string" || root.name.trim() === "") {
    errors.push('Codex marketplace: top-level "name" must be a non-empty string');
  }
  if (
    !isRecord(root.interface) ||
    typeof root.interface.displayName !== "string" ||
    root.interface.displayName.toString().trim() === ""
  ) {
    errors.push('Codex marketplace: top-level "interface.displayName" must be a non-empty string');
  }
  if (!Array.isArray(root.plugins)) {
    return { errors: ['Codex marketplace: "plugins" must be an array'], count: 0 };
  }

  const plugins = root.plugins as unknown[];
  const seenNames = new Map<string, number>();

  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i];
    const prefix = `Codex plugins[${i}]`;

    if (!isRecord(plugin)) {
      errors.push(`${prefix}: must be an object`);
      continue;
    }

    const obj = plugin;
    if (typeof obj.name !== "string" || obj.name.trim() === "") {
      errors.push(`${prefix}: "name" must be a non-empty string`);
    }

    const expectedPath = typeof obj.name === "string" && obj.name.trim() !== "" ? `./plugins/${obj.name}` : undefined;
    const source = obj.source;
    if (!isRecord(source)) {
      errors.push(`${prefix}: "source" must be a local source object`);
    } else {
      if (source.source !== "local") {
        errors.push(`${prefix}: "source.source" must be "local"`);
      }
      if (typeof source.path !== "string" || source.path.trim() === "") {
        errors.push(`${prefix}: local "source.path" must be a non-empty string`);
      } else if (!source.path.startsWith("./")) {
        errors.push(`${prefix}: local "source.path" must start with "./"`);
      } else {
        if (expectedPath && source.path !== expectedPath) {
          errors.push(`${prefix}: local "source.path" must be ${expectedPath}`);
        }
        const target = resolve(ROOT, source.path);
        if (!existsSync(target)) {
          errors.push(`${prefix}: local "source.path" target does not exist (${source.path})`);
        }
      }
    }

    const policy = obj.policy;
    if (!isRecord(policy)) {
      errors.push(`${prefix}: "policy" must be an object`);
    } else {
      if (typeof policy.installation !== "string" || policy.installation.trim() === "") {
        errors.push(`${prefix}: "policy.installation" must be a non-empty string`);
      } else if (!VALID_INSTALL_POLICIES.has(policy.installation)) {
        errors.push(
          `${prefix}: "policy.installation" must be one of ${[...VALID_INSTALL_POLICIES].join(", ")}`
        );
      }
      if (typeof policy.authentication !== "string" || policy.authentication.trim() === "") {
        errors.push(`${prefix}: "policy.authentication" must be a non-empty string`);
      } else if (!VALID_AUTH_POLICIES.has(policy.authentication)) {
        errors.push(
          `${prefix}: "policy.authentication" must be one of ${[...VALID_AUTH_POLICIES].join(", ")}`
        );
      }
      if (
        "products" in policy &&
        policy.products !== undefined &&
        (!Array.isArray(policy.products) || !policy.products.every(item => typeof item === "string" && item.trim() !== ""))
      ) {
        errors.push(`${prefix}: optional "policy.products" must be an array of non-empty strings`);
      }
    }

    if (typeof obj.category !== "string" || obj.category.trim() === "") {
      errors.push(`${prefix}: "category" must be a non-empty string`);
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
  const codexResult = validateCodexMarketplace(readJson(CODEX_MARKETPLACE_PATH));
  const claudeResult = validateClaudeMarketplace(readJson(CLAUDE_MARKETPLACE_PATH));
  const errors = [...codexResult.errors, ...claudeResult.errors];

  if (errors.length > 0) {
    console.error("Marketplace validation failed:\n");
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    console.error(`\n${errors.length} error(s) found.`);
    process.exit(1);
  }

  console.log(
    `Marketplace validation passed: codex=${codexResult.count} plugin(s), claude=${claudeResult.count} plugin(s).`
  );
}

main();
