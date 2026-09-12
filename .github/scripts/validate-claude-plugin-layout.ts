#!/usr/bin/env bun
/**
 * Validates Claude/plugin-dev layout rules for local plugins.
 *
 * Checks:
 *   - `.claude-plugin/plugin.json` exists and `.claude-plugin/` contains only `plugin.json`
 *   - Claude manifest has required `name`, `version`, `description`
 *   - manifest component paths stay `./`-relative, in-root, and point to existing files/directories
 *   - explicit Claude hook and MCP manifest paths use the repo-standard canonical locations
 *   - auto-discovered `commands/` and `agents/` directories contain Markdown definitions
 *   - `hooks/hooks.json` uses the Claude plugin wrapper format
 *   - `.mcp.json` parses as a JSON object with at least one server definition
 *   - every `${CLAUDE_PLUGIN_ROOT}/...` path named in agent-facing text exists
 *   - every discovered `skills/<name>/SKILL.md`, `commands/*.md` and `agents/*.md`
 *     carries YAML frontmatter with the fields Claude Code reads: a skill and an
 *     agent need `name` and `description`, a command needs `description`
 *
 * One gate answers "is this a plugin directory Claude Code will load, and does it
 * say what it needs to say", so an author runs one command instead of two that
 * walk the same directories.
 *
 * Exit 0 on success, exit 1 on any validation error.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join, relative, resolve } from "path";
import { parse as parseYaml } from "yaml";

const ROOT = process.env.PLUGIN_REPO_ROOT
  ? resolve(process.env.PLUGIN_REPO_ROOT)
  : resolve(import.meta.dir, "../..");
const PLUGINS_ROOT = join(ROOT, "plugins");
const CLAUDE_HOOK_EVENTS = new Set([
  "Notification",
  "PostToolUse",
  "PreCompact",
  "PreToolUse",
  "SessionEnd",
  "SessionStart",
  "Stop",
  "SubagentStop",
  "UserPromptSubmit",
]);

type JsonObject = Record<string, unknown>;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function isRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

function validateRelativePluginPath(
  pluginRoot: string,
  value: string,
  label: string,
  errors: string[],
  options?: { expectDirectory?: boolean }
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
}

function normalizePathList(
  value: unknown,
  label: string,
  errors: string[]
): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (isNonEmptyString(value)) {
    return [value];
  }
  if (Array.isArray(value)) {
    const normalized: string[] = [];
    for (const [index, item] of value.entries()) {
      if (!isNonEmptyString(item)) {
        errors.push(`${label}[${index}]: must be a non-empty string`);
      } else {
        normalized.push(item);
      }
    }
    return normalized;
  }

  errors.push(`${label}: must be a non-empty string or an array of non-empty strings`);
  return undefined;
}

function validateMarkdownDirectory(
  pluginRoot: string,
  directoryName: "commands" | "agents",
  errors: string[]
): void {
  const dirPath = join(pluginRoot, directoryName);
  if (!existsSync(dirPath)) {
    return;
  }

  if (!statSync(dirPath).isDirectory()) {
    errors.push(`${relative(ROOT, pluginRoot)}: ${directoryName}/ must be a directory`);
    return;
  }

  const markdownFiles = readdirSync(dirPath).filter(entry => entry.endsWith(".md"));
  if (markdownFiles.length === 0) {
    errors.push(`${relative(ROOT, pluginRoot)}: ${directoryName}/ must contain at least one .md file`);
  }
}

function validateHookDefinitions(value: unknown, label: string, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push(`${label}: must be an array`);
    return;
  }

  for (const [index, item] of value.entries()) {
    if (!isRecord(item)) {
      errors.push(`${label}[${index}]: must be an object`);
      continue;
    }
    if ("matcher" in item && item.matcher !== undefined && !isNonEmptyString(item.matcher)) {
      errors.push(`${label}[${index}].matcher: must be a non-empty string`);
    }
    if (!Array.isArray(item.hooks)) {
      errors.push(`${label}[${index}].hooks: must be an array`);
      continue;
    }
    for (const [hookIndex, hook] of item.hooks.entries()) {
      if (!isRecord(hook)) {
        errors.push(`${label}[${index}].hooks[${hookIndex}]: must be an object`);
        continue;
      }
      if (!isNonEmptyString(hook.type)) {
        errors.push(`${label}[${index}].hooks[${hookIndex}].type: must be a non-empty string`);
      }
      if ("command" in hook && hook.command !== undefined && !isNonEmptyString(hook.command)) {
        errors.push(`${label}[${index}].hooks[${hookIndex}].command: must be a non-empty string`);
      }
      if ("prompt" in hook && hook.prompt !== undefined && !isNonEmptyString(hook.prompt)) {
        errors.push(`${label}[${index}].hooks[${hookIndex}].prompt: must be a non-empty string`);
      }
      if ("timeout" in hook && hook.timeout !== undefined && typeof hook.timeout !== "number") {
        errors.push(`${label}[${index}].hooks[${hookIndex}].timeout: must be a number`);
      }
    }
  }
}

function validateClaudeHooks(pluginRoot: string, errors: string[]): void {
  const filePath = join(pluginRoot, "hooks", "hooks.json");
  if (!existsSync(filePath)) {
    return;
  }

  const pluginRel = relative(ROOT, pluginRoot);
  let parsed: unknown;
  try {
    parsed = readJson(filePath);
  } catch (err) {
    errors.push(`${pluginRel}: invalid JSON in hooks/hooks.json: ${err}`);
    return;
  }

  if (!isRecord(parsed)) {
    errors.push(`${pluginRel}: hooks/hooks.json must contain a JSON object`);
    return;
  }

  if ("description" in parsed && parsed.description !== undefined && !isNonEmptyString(parsed.description)) {
    errors.push(`${pluginRel}: hooks/hooks.json description must be a non-empty string when present`);
  }

  if (!isRecord(parsed.hooks)) {
    errors.push(`${pluginRel}: hooks/hooks.json must contain a top-level "hooks" object`);
    return;
  }

  for (const [eventName, definitions] of Object.entries(parsed.hooks)) {
    if (!CLAUDE_HOOK_EVENTS.has(eventName)) {
      errors.push(`${pluginRel}: hooks/hooks.json has unsupported event "${eventName}"`);
      continue;
    }
    validateHookDefinitions(definitions, `${pluginRel}: hooks/hooks.json hooks.${eventName}`, errors);
  }
}

function validateMcpConfig(pluginRoot: string, errors: string[]): void {
  const filePath = join(pluginRoot, ".mcp.json");
  if (!existsSync(filePath)) {
    return;
  }

  const pluginRel = relative(ROOT, pluginRoot);
  let parsed: unknown;
  try {
    parsed = readJson(filePath);
  } catch (err) {
    errors.push(`${pluginRel}: invalid JSON in .mcp.json: ${err}`);
    return;
  }

  if (!isRecord(parsed)) {
    errors.push(`${pluginRel}: .mcp.json must contain a JSON object`);
    return;
  }

  const serverDefinitions = isRecord(parsed.mcpServers) ? parsed.mcpServers : parsed;
  const serverNames = Object.keys(serverDefinitions);
  if (serverNames.length === 0) {
    errors.push(`${pluginRel}: .mcp.json must define at least one MCP server`);
    return;
  }

  for (const serverName of serverNames) {
    const server = serverDefinitions[serverName];
    if (!isRecord(server)) {
      errors.push(`${pluginRel}: .mcp.json server "${serverName}" must be an object`);
      continue;
    }
    if (
      "command" in server &&
      server.command !== undefined &&
      !isNonEmptyString(server.command)
    ) {
      errors.push(`${pluginRel}: .mcp.json server "${serverName}".command must be a non-empty string`);
    }
    if ("args" in server && server.args !== undefined) {
      if (!Array.isArray(server.args) || !server.args.every(isNonEmptyString)) {
        errors.push(`${pluginRel}: .mcp.json server "${serverName}".args must be an array of non-empty strings`);
      }
    }
    if ("env" in server && server.env !== undefined && !isRecord(server.env)) {
      errors.push(`${pluginRel}: .mcp.json server "${serverName}".env must be an object when present`);
    }
    if ("url" in server && server.url !== undefined && !isNonEmptyString(server.url)) {
      errors.push(`${pluginRel}: .mcp.json server "${serverName}".url must be a non-empty string`);
    }
  }
}

function validateClaudeManifest(pluginRoot: string, errors: string[]): void {
  const pluginRel = relative(ROOT, pluginRoot);
  const claudeDir = join(pluginRoot, ".claude-plugin");
  const manifestPath = join(claudeDir, "plugin.json");

  if (!existsSync(manifestPath)) {
    errors.push(`${pluginRel}: missing .claude-plugin/plugin.json`);
    return;
  }

  const claudeEntries = readdirSync(claudeDir);
  if (claudeEntries.length !== 1 || claudeEntries[0] !== "plugin.json") {
    errors.push(`${pluginRel}: only plugin.json should exist inside .claude-plugin/`);
  }

  let manifest: unknown;
  try {
    manifest = readJson(manifestPath);
  } catch (err) {
    errors.push(`${pluginRel}: invalid JSON in .claude-plugin/plugin.json: ${err}`);
    return;
  }

  if (!isRecord(manifest)) {
    errors.push(`${pluginRel}: .claude-plugin/plugin.json must contain a JSON object`);
    return;
  }

  for (const field of ["name", "version", "description"] as const) {
    if (!isNonEmptyString(manifest[field])) {
      errors.push(`${pluginRel}: manifest.${field} must be a non-empty string`);
    }
  }

  if (isNonEmptyString(manifest.name) && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.name)) {
    errors.push(`${pluginRel}: manifest.name should be a stable kebab-case identifier`);
  }

  const commandPaths = normalizePathList(manifest.commands, `${pluginRel}: manifest.commands`, errors);
  for (const [index, commandPath] of (commandPaths ?? []).entries()) {
    validateRelativePluginPath(
      pluginRoot,
      commandPath,
      `${pluginRel}: manifest.commands[${index}]`,
      errors,
      { expectDirectory: true }
    );
  }

  const agentPaths = normalizePathList(manifest.agents, `${pluginRel}: manifest.agents`, errors);
  for (const [index, agentPath] of (agentPaths ?? []).entries()) {
    validateRelativePluginPath(
      pluginRoot,
      agentPath,
      `${pluginRel}: manifest.agents[${index}]`,
      errors,
      { expectDirectory: true }
    );
  }

  if ("hooks" in manifest && manifest.hooks !== undefined) {
    if (!isNonEmptyString(manifest.hooks)) {
      errors.push(`${pluginRel}: manifest.hooks must be a non-empty string when present`);
    } else {
      if (manifest.hooks === "./hooks/hooks.json") {
        errors.push(
          `${pluginRel}: manifest.hooks must not point to "./hooks/hooks.json"; standard hooks/hooks.json is auto-discovered`
        );
      }
      validateRelativePluginPath(pluginRoot, manifest.hooks, `${pluginRel}: manifest.hooks`, errors);
    }
  }

  if ("mcpServers" in manifest && manifest.mcpServers !== undefined) {
    if (!isNonEmptyString(manifest.mcpServers)) {
      errors.push(`${pluginRel}: manifest.mcpServers must be a non-empty string when present`);
    } else {
      if (manifest.mcpServers !== "./.mcp.json") {
        errors.push(`${pluginRel}: manifest.mcpServers must point to "./.mcp.json"`);
      }
      validateRelativePluginPath(pluginRoot, manifest.mcpServers, `${pluginRel}: manifest.mcpServers`, errors);
    }
  }
}

/**
 * Walk the surfaces an agent reads at runtime and collect text files that may
 * name plugin-local paths. Source, build output, and the config UI are excluded:
 * they run in the repository, not inside an installed plugin.
 */
function collectAgentFacingFiles(pluginRoot: string): string[] {
  const files: string[] = [];

  const walk = (directory: string): void => {
    if (!existsSync(directory)) {
      return;
    }
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(path);
      } else if (/\.(md|json|sh|mjs|py)$/.test(entry.name)) {
        files.push(path);
      }
    }
  };

  for (const directoryName of ["agents", "commands", "hooks", "skills"] as const) {
    walk(join(pluginRoot, directoryName));
  }
  for (const fileName of ["README.md", ".mcp.json"] as const) {
    const path = join(pluginRoot, fileName);
    if (existsSync(path)) {
      files.push(path);
    }
  }

  return files;
}

/**
 * A plugin ships its bundle under `dist/`, so an instruction that names a
 * missing plugin-local path sends the agent to a command that cannot run.
 * Placeholder segments (`<name>`) and globs are skipped.
 */
function validatePluginRootReferences(pluginRoot: string, errors: string[]): void {
  const pattern = /\$\{CLAUDE_PLUGIN_ROOT\}((?:\/[^\s"'`)\]}]*)+)/g;

  for (const filePath of collectAgentFacingFiles(pluginRoot)) {
    const contents = readFileSync(filePath, "utf-8");
    const fileRel = relative(ROOT, filePath);

    for (const match of contents.matchAll(pattern)) {
      const referenced = match[1].replace(/[.,;:]+$/, "");
      if (/[<>*$]/.test(referenced)) {
        continue;
      }
      if (!existsSync(join(pluginRoot, referenced))) {
        errors.push(`${fileRel}: references missing path \${CLAUDE_PLUGIN_ROOT}${referenced}`);
      }
    }
  }
}

/** How many frontmatter files the walk reached, so a silent zero is visible. */
let frontmatterFiles = 0;

/**
 * Check the YAML frontmatter of every definition Claude Code reads: each
 * `skills/<name>/SKILL.md`, `commands/*.md` and `agents/*.md` directly under the
 * plugin root. Returns how many files were checked.
 *
 * Anchoring at the plugin root matters: a skill's own `agents/` directory holds
 * resource files (prompt-forge's curator/evaluator/synthesizer notes), not Claude
 * Code subagent definitions, so those stay out of scope.
 */
function validateFrontmatter(pluginRoot: string, errors: string[]): number {
  const files: string[] = [];

  const skillsDir = join(pluginRoot, "skills");
  if (existsSync(skillsDir)) {
    for (const skill of readdirSync(skillsDir, { withFileTypes: true })) {
      if (!skill.isDirectory()) continue;
      const skillFile = join(skillsDir, skill.name, "SKILL.md");
      if (existsSync(skillFile)) files.push(skillFile);
    }
  }

  for (const dirName of ["commands", "agents"] as const) {
    const dir = join(pluginRoot, dirName);
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(join(dir, entry.name));
      }
    }
  }

  for (const filePath of files) {
    const fileRel = relative(ROOT, filePath);
    const frontmatter = extractFrontmatter(readFileSync(filePath, "utf-8"));
    if (frontmatter === null) {
      errors.push(`${fileRel}: no YAML frontmatter found (expected --- delimiters)`);
      continue;
    }

    let fields: Record<string, unknown>;
    try {
      const parsed = parseYaml(frontmatter);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        errors.push(`${fileRel}: frontmatter must be a YAML mapping`);
        continue;
      }
      fields = parsed as Record<string, unknown>;
    } catch (err) {
      errors.push(`${fileRel}: invalid YAML frontmatter: ${err}`);
      continue;
    }

    const segments = relative(pluginRoot, filePath).split(/[\\/]/);
    const kind = segments[0] === "skills" ? "skill" : segments[0] === "agents" ? "agent" : "command";
    // Claude Code reads a skill's and an agent's name and description; a command is
    // addressed by its file name, so it needs only a description.
    const required = kind === "command" ? ["description"] : ["name", "description"];

    for (const field of required) {
      const value = fields[field];
      if (typeof value !== "string" || value.trim() === "") {
        errors.push(`${fileRel}: ${kind} frontmatter must have "${field}"`);
      }
    }
  }

  return files.length;
}

/** The YAML block between the leading `---` delimiters, or null when absent. */
function extractFrontmatter(contents: string): string | null {
  const match = contents.match(/^---\s*\n([\s\S]*?)\n---/);
  return match ? match[1] : null;
}

function main(): void {
  const errors: string[] = [];

  for (const entry of readdirSync(PLUGINS_ROOT)) {
    const pluginRoot = join(PLUGINS_ROOT, entry);
    if (!statSync(pluginRoot).isDirectory()) {
      continue;
    }

    validateClaudeManifest(pluginRoot, errors);
    validateMarkdownDirectory(pluginRoot, "commands", errors);
    validateMarkdownDirectory(pluginRoot, "agents", errors);
    validateClaudeHooks(pluginRoot, errors);
    validateMcpConfig(pluginRoot, errors);
    validatePluginRootReferences(pluginRoot, errors);
    frontmatterFiles += validateFrontmatter(pluginRoot, errors);
  }

  if (errors.length > 0) {
    console.error("Claude plugin layout validation failed:\n");
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    console.error(`\n${errors.length} error(s) found.`);
    process.exit(1);
  }

  console.log(
    `Claude plugin layout validation passed: ${frontmatterFiles} frontmatter file(s) checked.`,
  );
}

main();
