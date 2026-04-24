#!/usr/bin/env bun
/**
 * Validates Codex plugin layout rules derived from official Codex plugin docs.
 *
 * Checks:
 *   - `.codex-plugin/plugin.json` exists and `.codex-plugin/` contains only `plugin.json`
 *   - plugin manifest has required `name`, `version`, `description`
 *   - manifest paths (`skills`, `hooks`, `mcpServers`, `apps`, and interface asset paths) are `./`-prefixed,
 *     stay inside the plugin root, and point to existing files/directories
 *   - repo-local surfaces stay at canonical root paths (`./skills/`, `./hooks.json`, `./.mcp.json`, `./.app.json`)
 *   - if `skills/`, `hooks.json`, `.mcp.json`, or `.app.json` exist, manifest pointers are present
 *   - `hooks.json` and `hooks/hooks.json` stay in sync when hook config exists
 *   - each skill directory contains `SKILL.md`
 *   - optional `agents/openai.yaml` parses as YAML and matches the documented top-level shape
 *
 * Exit 0 on success, exit 1 on any validation error.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join, relative, resolve } from "path";
import { parse as parseYaml } from "yaml";

const ROOT = resolve(import.meta.dir, "../..");
const PLUGINS_ROOT = join(ROOT, "plugins");

type JsonObject = Record<string, unknown>;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

function isCanonicalDirectoryPath(value: string, canonical: string): boolean {
  return value === canonical || value === canonical.replace(/\/$/, "");
}

function validateRelativePluginPath(
  pluginRoot: string,
  value: string,
  label: string,
  errors: string[],
  options?: { expectDirectory?: boolean; preferAssets?: boolean }
): void {
  if (!value.startsWith("./")) {
    errors.push(`${label}: must start with "./"`);
    return;
  }

  const resolved = resolve(pluginRoot, value);
  const rel = relative(pluginRoot, resolved);
  if (rel === "" || rel.startsWith("..")) {
    errors.push(`${label}: must stay inside the plugin root`);
    return;
  }

  if (!existsSync(resolved)) {
    errors.push(`${label}: target does not exist (${value})`);
    return;
  }

  const stats = statSync(resolved);
  if (options?.expectDirectory && !stats.isDirectory()) {
    errors.push(`${label}: expected a directory (${value})`);
  }
  if (!options?.expectDirectory && stats.isDirectory()) {
    errors.push(`${label}: expected a file (${value})`);
  }

  if (options?.preferAssets && !value.startsWith("./assets/")) {
    errors.push(`${label}: visual assets should live under "./assets/" when possible`);
  }
}

function validateOpenAiYaml(filePath: string, errors: string[]): void {
  let parsed: unknown;
  try {
    parsed = parseYaml(readFileSync(filePath, "utf-8"));
  } catch (err) {
    errors.push(`${filePath}: invalid YAML in agents/openai.yaml: ${err}`);
    return;
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    errors.push(`${filePath}: agents/openai.yaml must be a YAML mapping`);
    return;
  }

  const root = parsed as JsonObject;

  if ("interface" in root) {
    const value = root.interface;
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      errors.push(`${filePath}: interface must be a mapping`);
    }
  }

  if ("policy" in root) {
    const value = root.policy;
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      errors.push(`${filePath}: policy must be a mapping`);
    } else {
      const policy = value as JsonObject;
      if ("allow_implicit_invocation" in policy && typeof policy.allow_implicit_invocation !== "boolean") {
        errors.push(`${filePath}: policy.allow_implicit_invocation must be boolean`);
      }
    }
  }

  if ("dependencies" in root) {
    const value = root.dependencies;
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      errors.push(`${filePath}: dependencies must be a mapping`);
    } else {
      const dependencies = value as JsonObject;
      if ("tools" in dependencies && !Array.isArray(dependencies.tools)) {
        errors.push(`${filePath}: dependencies.tools must be an array`);
      }
    }
  }
}

function validateSkillDirectories(pluginRoot: string, skillsPath: string | undefined, errors: string[]): void {
  const skillsDir = join(pluginRoot, "skills");

  if (existsSync(skillsDir)) {
    if (!skillsPath) {
      errors.push(`${relative(ROOT, pluginRoot)}: manifest is missing "skills" even though skills/ exists`);
      return;
    }
    if (!isCanonicalDirectoryPath(skillsPath, "./skills/")) {
      errors.push(`${relative(ROOT, pluginRoot)}: manifest.skills must point to the root skills directory ("./skills/")`);
    }
  } else if (!skillsPath) {
    return;
  } else if (!isCanonicalDirectoryPath(skillsPath, "./skills/")) {
    errors.push(`${relative(ROOT, pluginRoot)}: manifest.skills must point to the root skills directory ("./skills/")`);
  }

  if (!skillsPath) {
    return;
  }

  const errorsBeforePathValidation = errors.length;
  validateRelativePluginPath(pluginRoot, skillsPath, `${relative(ROOT, pluginRoot)}: manifest.skills`, errors, {
    expectDirectory: true,
  });
  if (errors.length !== errorsBeforePathValidation) {
    return;
  }

  const resolvedSkillsDir = resolve(pluginRoot, skillsPath);
  const skillDirs = readdirSync(resolvedSkillsDir)
    .map(name => join(resolvedSkillsDir, name))
    .filter(filePath => statSync(filePath).isDirectory());

  if (skillDirs.length === 0) {
    errors.push(`${relative(ROOT, pluginRoot)}: skills/ must contain at least one skill directory`);
  }

  for (const skillDir of skillDirs) {
    const skillMarkdown = join(skillDir, "SKILL.md");
    if (!existsSync(skillMarkdown)) {
      errors.push(`${relative(ROOT, skillDir)}: missing SKILL.md`);
    }

    const metadataPath = join(skillDir, "agents", "openai.yaml");
    if (existsSync(metadataPath)) {
      validateOpenAiYaml(metadataPath, errors);
    }
  }
}

function validateHookConfig(pluginRoot: string, hooksPath: string | undefined, errors: string[]): void {
  const pluginRel = relative(ROOT, pluginRoot);
  const codexHooksPath = join(pluginRoot, "hooks.json");
  const claudeHooksPath = join(pluginRoot, "hooks", "hooks.json");
  const codexHooksExists = existsSync(codexHooksPath);
  const claudeHooksExists = existsSync(claudeHooksPath);

  if (codexHooksExists) {
    if (!hooksPath) {
      errors.push(`${pluginRel}: manifest is missing "hooks" even though hooks.json exists`);
      return;
    }
    if (hooksPath !== "./hooks.json") {
      errors.push(`${pluginRel}: manifest.hooks must point to "./hooks.json"`);
    }
  } else if (hooksPath && hooksPath !== "./hooks.json") {
    errors.push(`${pluginRel}: manifest.hooks must point to "./hooks.json"`);
  }

  if (hooksPath) {
    validateRelativePluginPath(pluginRoot, hooksPath, `${pluginRel}: manifest.hooks`, errors);
  }

  if (claudeHooksExists && !codexHooksExists) {
    errors.push(`${pluginRel}: hooks/hooks.json exists but hooks.json is missing`);
    return;
  }

  if (codexHooksExists && !claudeHooksExists) {
    errors.push(`${pluginRel}: hooks.json exists but hooks/hooks.json is missing`);
    return;
  }

  if (!codexHooksExists || !claudeHooksExists) {
    return;
  }

  let codexHooks: unknown;
  let claudeHooks: unknown;
  try {
    codexHooks = readJson(codexHooksPath);
  } catch (err) {
    errors.push(`${pluginRel}: invalid JSON in hooks.json: ${err}`);
    return;
  }
  try {
    claudeHooks = readJson(claudeHooksPath);
  } catch (err) {
    errors.push(`${pluginRel}: invalid JSON in hooks/hooks.json: ${err}`);
    return;
  }

  if (JSON.stringify(codexHooks) !== JSON.stringify(claudeHooks)) {
    errors.push(`${pluginRel}: hooks.json and hooks/hooks.json must stay JSON-identical`);
  }
}

function validateCodexManifest(pluginRoot: string, errors: string[]): void {
  const pluginRel = relative(ROOT, pluginRoot);
  const codexDir = join(pluginRoot, ".codex-plugin");
  const manifestPath = join(codexDir, "plugin.json");

  if (!existsSync(manifestPath)) {
    errors.push(`${pluginRel}: missing .codex-plugin/plugin.json`);
    return;
  }

  const codexEntries = readdirSync(codexDir);
  if (codexEntries.length !== 1 || codexEntries[0] !== "plugin.json") {
    errors.push(`${pluginRel}: only plugin.json should exist inside .codex-plugin/`);
  }

  let manifest: unknown;
  try {
    manifest = readJson(manifestPath);
  } catch (err) {
    errors.push(`${pluginRel}: invalid JSON in .codex-plugin/plugin.json: ${err}`);
    return;
  }

  if (typeof manifest !== "object" || manifest === null || Array.isArray(manifest)) {
    errors.push(`${pluginRel}: .codex-plugin/plugin.json must contain a JSON object`);
    return;
  }

  const obj = manifest as JsonObject;
  for (const field of ["name", "version", "description"] as const) {
    if (!isNonEmptyString(obj[field])) {
      errors.push(`${pluginRel}: manifest.${field} must be a non-empty string`);
    }
  }

  if (isNonEmptyString(obj.name) && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(obj.name)) {
    errors.push(`${pluginRel}: manifest.name should be a stable kebab-case identifier`);
  }

  if ("skills" in obj && obj.skills !== undefined && !isNonEmptyString(obj.skills)) {
    errors.push(`${pluginRel}: manifest.skills must be a non-empty string when present`);
  }
  const skillsPath = typeof obj.skills === "string" ? obj.skills : undefined;
  validateSkillDirectories(pluginRoot, skillsPath, errors);

  if ("hooks" in obj && obj.hooks !== undefined && !isNonEmptyString(obj.hooks)) {
    errors.push(`${pluginRel}: manifest.hooks must be a non-empty string when present`);
  }
  const hooksPath = typeof obj.hooks === "string" ? obj.hooks : undefined;
  validateHookConfig(pluginRoot, hooksPath, errors);

  const mcpConfigPath = join(pluginRoot, ".mcp.json");
  if ("mcpServers" in obj && obj.mcpServers !== undefined && !isNonEmptyString(obj.mcpServers)) {
    errors.push(`${pluginRel}: manifest.mcpServers must be a non-empty string when present`);
  }
  if (existsSync(mcpConfigPath) && !isNonEmptyString(obj.mcpServers)) {
    errors.push(`${pluginRel}: manifest is missing "mcpServers" even though .mcp.json exists`);
  }
  if (isNonEmptyString(obj.mcpServers)) {
    if (obj.mcpServers !== "./.mcp.json") {
      errors.push(`${pluginRel}: manifest.mcpServers must point to "./.mcp.json"`);
    }
    validateRelativePluginPath(pluginRoot, obj.mcpServers, `${pluginRel}: manifest.mcpServers`, errors);
  }

  const appConfigPath = join(pluginRoot, ".app.json");
  if ("apps" in obj && obj.apps !== undefined && !isNonEmptyString(obj.apps)) {
    errors.push(`${pluginRel}: manifest.apps must be a non-empty string when present`);
  }
  if (existsSync(appConfigPath) && !isNonEmptyString(obj.apps)) {
    errors.push(`${pluginRel}: manifest is missing "apps" even though .app.json exists`);
  }
  if (isNonEmptyString(obj.apps)) {
    if (obj.apps !== "./.app.json") {
      errors.push(`${pluginRel}: manifest.apps must point to "./.app.json"`);
    }
    validateRelativePluginPath(pluginRoot, obj.apps, `${pluginRel}: manifest.apps`, errors);
  }

  if ("interface" in obj && obj.interface !== undefined) {
    if (typeof obj.interface !== "object" || obj.interface === null || Array.isArray(obj.interface)) {
      errors.push(`${pluginRel}: manifest.interface must be an object`);
    } else {
      const iface = obj.interface as JsonObject;
      for (const field of [
        "displayName",
        "shortDescription",
        "longDescription",
        "developerName",
        "category",
        "websiteURL",
        "privacyPolicyURL",
        "termsOfServiceURL",
        "brandColor",
      ] as const) {
        if (field in iface && iface[field] !== undefined && typeof iface[field] !== "string") {
          errors.push(`${pluginRel}: manifest.interface.${field} must be a string`);
        }
      }

      if ("capabilities" in iface && iface.capabilities !== undefined) {
        if (!Array.isArray(iface.capabilities) || !iface.capabilities.every(isNonEmptyString)) {
          errors.push(`${pluginRel}: manifest.interface.capabilities must be an array of non-empty strings`);
        }
      }

      if ("defaultPrompt" in iface && iface.defaultPrompt !== undefined) {
        if (!Array.isArray(iface.defaultPrompt) || !iface.defaultPrompt.every(isNonEmptyString)) {
          errors.push(`${pluginRel}: manifest.interface.defaultPrompt must be an array of non-empty strings`);
        }
      }

      if (isNonEmptyString(iface.composerIcon)) {
        validateRelativePluginPath(
          pluginRoot,
          iface.composerIcon,
          `${pluginRel}: manifest.interface.composerIcon`,
          errors,
          { preferAssets: true }
        );
      }
      if (isNonEmptyString(iface.logo)) {
        validateRelativePluginPath(
          pluginRoot,
          iface.logo,
          `${pluginRel}: manifest.interface.logo`,
          errors,
          { preferAssets: true }
        );
      }
      if ("screenshots" in iface && iface.screenshots !== undefined) {
        if (!Array.isArray(iface.screenshots) || !iface.screenshots.every(isNonEmptyString)) {
          errors.push(`${pluginRel}: manifest.interface.screenshots must be an array of non-empty strings`);
        } else {
          for (const [index, screenshot] of iface.screenshots.entries()) {
            validateRelativePluginPath(
              pluginRoot,
              screenshot,
              `${pluginRel}: manifest.interface.screenshots[${index}]`,
              errors,
              { preferAssets: true }
            );
          }
        }
      }
    }
  }
}

function main(): void {
  const errors: string[] = [];

  for (const entry of readdirSync(PLUGINS_ROOT)) {
    const pluginRoot = join(PLUGINS_ROOT, entry);
    if (!statSync(pluginRoot).isDirectory()) {
      continue;
    }
    validateCodexManifest(pluginRoot, errors);
  }

  if (errors.length > 0) {
    console.error("Codex plugin layout validation failed:\n");
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    console.error(`\n${errors.length} error(s) found.`);
    process.exit(1);
  }

  console.log("Codex plugin layout validation passed.");
}

main();
