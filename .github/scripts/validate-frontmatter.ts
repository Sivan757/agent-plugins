#!/usr/bin/env bun
/**
 * Validates YAML frontmatter in skill, agent, and command markdown files.
 *
 * Accepts file paths as arguments. For each file:
 *  - Extracts YAML frontmatter between --- delimiters
 *  - Parses it with the `yaml` package
 *  - Validates required fields based on file type:
 *    - Skills  (skills/SKILL.md):  must have "description" or "when_to_use"
 *    - Agents  (agents/*.md):      must have "name" and "description"
 *    - Commands (commands/*.md):    must have "description"
 *
 * Exit 0 if all files pass, exit 1 if any errors found.
 */

import { readFileSync } from "fs";
import { parse as parseYaml } from "yaml";

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
    content = readFileSync(filePath, "utf-8");
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
      // Skills must have `description` or `when_to_use`
      const hasDescription =
        typeof fm.description === "string" && fm.description.trim() !== "";
      const hasWhenToUse =
        typeof fm.when_to_use === "string" && fm.when_to_use.trim() !== "";
      if (!hasDescription && !hasWhenToUse) {
        errors.push(
          `${filePath}: skill frontmatter must have "description" or "when_to_use"`
        );
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
  const files = process.argv.slice(2);

  if (files.length === 0) {
    console.log("No files to validate.");
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
