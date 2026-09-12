#!/usr/bin/env bun
/**
 * Validates YAML frontmatter in skill, agent, and command markdown files.
 *
 * Accepts file paths as arguments, or `--all` to validate every frontmatter
 * file in the repository (`skills/<name>/SKILL.md`, `commands/*.md`,
 * `agents/*.md` under each plugin root). For each file:
 *  - Extracts YAML frontmatter between --- delimiters
 *  - Parses it with the `yaml` package
 *  - Validates required fields based on file type:
 *    - Skills  (skills/SKILL.md):  must have "name" and "description"
 *    - Agents  (agents/*.md):      must have "name" and "description"
 *    - Commands (commands/*.md):    must have "description"
 *
 * Exit 0 if all files pass, exit 1 if any errors found.
 */

import { existsSync, readdirSync, readFileSync } from "fs";
import { isAbsolute, join, relative, resolve } from "path";
import { parse as parseYaml } from "yaml";

const ROOT = process.env.PLUGIN_REPO_ROOT
  ? resolve(process.env.PLUGIN_REPO_ROOT)
  : resolve(import.meta.dir, "../..");

/**
 * Discover every file that must carry frontmatter, anchored at plugin roots:
 * `skills/<name>/SKILL.md`, `commands/*.md`, and `agents/*.md`.
 *
 * Anchoring matters: a skill's own `agents/` directory holds resource files
 * (for example prompt-forge's curator/evaluator/synthesizer notes), not
 * Claude Code subagent definitions, so those must stay out of scope.
 */
function discoverFrontmatterFiles(): string[] {
  const files: string[] = [];

  for (const base of ["src", "plugins"]) {
    const baseDir = join(ROOT, base);
    if (!existsSync(baseDir)) continue;

    for (const plugin of readdirSync(baseDir, { withFileTypes: true })) {
      if (!plugin.isDirectory()) continue;
      const pluginRoot = join(baseDir, plugin.name);

      const skillsDir = join(pluginRoot, "skills");
      if (existsSync(skillsDir)) {
        for (const skill of readdirSync(skillsDir, { withFileTypes: true })) {
          if (!skill.isDirectory()) continue;
          const skillFile = join(skillsDir, skill.name, "SKILL.md");
          if (existsSync(skillFile)) files.push(relative(ROOT, skillFile));
        }
      }

      for (const dirName of ["commands", "agents"] as const) {
        const dir = join(pluginRoot, dirName);
        if (!existsSync(dir)) continue;
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          if (entry.isFile() && entry.name.endsWith(".md")) {
            files.push(relative(ROOT, join(dir, entry.name)));
          }
        }
      }
    }
  }

  return files.sort();
}

// Determine file type from its path
type FileType = "skill" | "agent" | "command" | "unknown";

function detectFileType(filePath: string): FileType {
  if (/skills\/[^/]+\/SKILL\.md$/i.test(filePath)) return "skill";
  if (/agents\/[^/]+\.md$/i.test(filePath)) return "agent";
  if (/commands\/[^/]+\.md$/i.test(filePath)) return "command";
  return "unknown";
}

// Extract frontmatter string between --- delimiters
function extractFrontmatter(content: string): string | null {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  return match ? match[1] : null;
}

function validateFile(filePath: string): string[] {
  const errors: string[] = [];
  const fileType = detectFileType(filePath);

  if (fileType === "unknown") {
    // Skip files we don't know how to validate
    return [];
  }

  let content: string;
  try {
    // Resolve against ROOT so discovery paths work regardless of the caller's
    // working directory; absolute paths pass through unchanged.
    content = readFileSync(isAbsolute(filePath) ? filePath : resolve(ROOT, filePath), "utf-8");
  } catch (err) {
    errors.push(`${filePath}: cannot read file: ${err}`);
    return errors;
  }

  const fmRaw = extractFrontmatter(content);
  if (!fmRaw) {
    errors.push(`${filePath}: no YAML frontmatter found (expected --- delimiters)`);
    return errors;
  }

  let fm: Record<string, unknown>;
  try {
    const parsed = parseYaml(fmRaw);
    if (typeof parsed !== "object" || parsed === null) {
      errors.push(`${filePath}: frontmatter must be a YAML mapping`);
      return errors;
    }
    fm = parsed as Record<string, unknown>;
  } catch (err) {
    errors.push(`${filePath}: invalid YAML frontmatter: ${err}`);
    return errors;
  }

  switch (fileType) {
    case "skill": {
      if (typeof fm.name !== "string" || fm.name.trim() === "") {
        errors.push(`${filePath}: skill frontmatter must have "name"`);
      }
      if (typeof fm.description !== "string" || fm.description.trim() === "") {
        errors.push(`${filePath}: skill frontmatter must have "description"`);
      }
      break;
    }
    case "agent": {
      // Agents must have `name` and `description`
      if (typeof fm.name !== "string" || fm.name.trim() === "") {
        errors.push(`${filePath}: agent frontmatter must have "name"`);
      }
      if (typeof fm.description !== "string" || fm.description.trim() === "") {
        errors.push(`${filePath}: agent frontmatter must have "description"`);
      }
      break;
    }
    case "command": {
      // Commands must have `description`
      if (typeof fm.description !== "string" || fm.description.trim() === "") {
        errors.push(`${filePath}: command frontmatter must have "description"`);
      }
      break;
    }
  }

  return errors;
}

function main(): void {
  const args = process.argv.slice(2);
  const all = args.includes("--all");
  const files = all ? discoverFrontmatterFiles() : args.filter((arg) => arg !== "--all");

  if (files.length === 0) {
    console.log(all ? "No frontmatter files found." : "No files to validate.");
    return;
  }

  const allErrors: string[] = [];
  let validCount = 0;

  for (const file of files) {
    const errors = validateFile(file);
    if (errors.length === 0) {
      validCount++;
    } else {
      allErrors.push(...errors);
    }
  }

  if (allErrors.length > 0) {
    console.error("Frontmatter validation failed:\n");
    for (const err of allErrors) {
      console.error(`  - ${err}`);
    }
    console.error(`\n${allErrors.length} error(s) in ${files.length} file(s).`);
    process.exit(1);
  }

  console.log(
    `Frontmatter validation passed: ${validCount} file(s) validated.`
  );
}

main();
