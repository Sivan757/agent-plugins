#!/usr/bin/env bun
/**
 * Validates that a plugin persists nothing outside its own directory in the
 * shared cache root (`~/.cache/agent-plugins/<plugin>/`).
 *
 * Every path a plugin builds for its own data must come from the shared helpers
 * in `@agent-plugins/config-center` (`configDir`, `pluginFilePath`,
 * `writePluginFile`), because those are the only place that knows where the root
 * is. A plugin that derives a location itself breaks in ways nothing else
 * catches, and both of these shipped once:
 *
 *   - a session token cached with `os.tmpdir()`, i.e. plaintext in a directory
 *     every account on the machine can read;
 *   - the root recomputed with `os.homedir()`, which ignores
 *     `AGENT_PLUGINS_CACHE_DIR` and so wrote to the operator's real cache during
 *     previews and tests.
 *
 * The rule is narrow on purpose: it forbids taking a *storage location* from the
 * ambient environment, and says nothing about paths a user names (`--out`) or
 * about developer scripts, which are not shipped runtime code. `path` handling
 * itself is not restricted — the shared helpers use `path.join`, and so may a
 * plugin.
 *
 * Exit 0 on success, exit 1 on any finding.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { extname, join, relative, resolve } from "path";

const ROOT = process.env.PLUGIN_REPO_ROOT
  ? resolve(process.env.PLUGIN_REPO_ROOT)
  : resolve(import.meta.dir, "../..");
const PLUGINS_ROOT = join(ROOT, "plugins");

/**
 * The one module allowed to read the home directory: it owns the root every other
 * path is derived from, so it has to be the one that decides where home is.
 */
const ROOT_OWNER = join("config-center", "src", "config-store.ts");

const RUNTIME_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs"]);

interface Rule {
  /** What the source is doing, in the words of the fix a reader needs. */
  message: string;
  pattern: RegExp;
}

const RULES: Rule[] = [
  {
    pattern: /\b(?:os\.)?tmpdir\s*\(/,
    message:
      "uses the system temporary directory. Plugin data belongs in the plugin's own directory: build the path with pluginFilePath() / writePluginFile() from @agent-plugins/config-center.",
  },
  {
    pattern: /\b(?:os\.)?homedir\s*\(/,
    message:
      "reads the home directory to locate its own storage. Use configDir(), artifactsDir() or pluginFilePath() instead, which follow AGENT_PLUGINS_CACHE_DIR.",
  },
  {
    pattern: /\bprocess\.cwd\s*\(/,
    message:
      "resolves a path against the working directory, which depends on where the agent was run. Persist under the plugin's own directory instead.",
  },
  {
    pattern: /["'`](?:\/tmp\/|[A-Za-z]:\\+[Tt]emp\\+)/,
    message:
      "names a shared temporary path literally. Build the path with writePluginFile() so it lands under the plugin's own directory.",
  },
];

function sourceFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...sourceFiles(full));
      continue;
    }
    if (!RUNTIME_EXTENSIONS.has(extname(entry))) continue;
    // Tests and fixtures may point at temp directories on purpose.
    if (/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(entry)) continue;
    found.push(full);
  }
  return found;
}

const errors: string[] = [];
let scanned = 0;

for (const plugin of readdirSync(PLUGINS_ROOT).sort()) {
  const srcDir = join(PLUGINS_ROOT, plugin, "src");
  let files: string[];
  try {
    files = sourceFiles(srcDir);
  } catch {
    continue; // a plugin without source (skills only) has nothing to scan
  }

  for (const file of files) {
    const relativePath = relative(ROOT, file);
    scanned += 1;
    if (relativePath.endsWith(ROOT_OWNER)) continue;

    const lines = readFileSync(file, "utf-8").split("\n");
    lines.forEach((line, index) => {
      // A comment that names the rule is not a violation of it.
      const code = line.replace(/\/\/.*$/, "");
      for (const rule of RULES) {
        if (rule.pattern.test(code)) {
          errors.push(`${relativePath}:${index + 1}: ${rule.message}`);
        }
      }
    });
  }
}

if (errors.length > 0) {
  console.error("Persistence validation failed:\n");
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  console.error(`\n${errors.length} finding(s).`);
  process.exit(1);
}

console.log(
  `Persistence validation passed: ${scanned} runtime source file(s) keep their storage under the plugin directory.`
);
