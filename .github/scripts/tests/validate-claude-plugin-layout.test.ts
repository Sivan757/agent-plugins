import { spawnSync } from "child_process";
import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";

const SCRIPT_PATH = join(process.cwd(), ".github/scripts/validate-claude-plugin-layout.ts");
const tempRoots: string[] = [];

function writeText(filePath: string, content: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}

function writeJson(filePath: string, value: unknown): void {
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function createRepo(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-plugins-claude-layout-"));
  tempRoots.push(root);
  mkdirSync(join(root, "plugins"), { recursive: true });
  return root;
}

function createPlugin(root: string, pluginName: string): string {
  const pluginRoot = join(root, "plugins", pluginName);
  mkdirSync(pluginRoot, { recursive: true });
  writeJson(join(pluginRoot, ".claude-plugin", "plugin.json"), {
    name: pluginName,
    version: "1.0.0",
    description: `${pluginName} plugin`,
  });
  return pluginRoot;
}

function runValidator(root: string) {
  return spawnSync("bun", ["run", SCRIPT_PATH], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      PLUGIN_REPO_ROOT: root,
    },
  });
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("validate-claude-plugin-layout", () => {
  test("passes for a minimal plugin using default discovery directories", () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root, "sample-plugin");

    writeText(
      join(pluginRoot, "commands", "review.md"),
      "---\ndescription: Review code changes\n---\n\nRun the review workflow.\n"
    );
    writeText(
      join(pluginRoot, "agents", "reviewer.md"),
      "---\nname: reviewer\ndescription: Review repository changes\n---\n\nAct as a reviewer.\n"
    );
    writeJson(join(pluginRoot, "hooks", "hooks.json"), {
      description: "Claude hook config",
      hooks: {},
    });

    const result = runValidator(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Claude plugin layout validation passed.");
  });

  test("fails when .claude-plugin contains extra files", () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root, "sample-plugin");

    writeText(join(pluginRoot, ".claude-plugin", "notes.txt"), "extra");

    const result = runValidator(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("only plugin.json should exist inside .claude-plugin/");
  });

  test("fails when hooks/hooks.json is not in Claude plugin wrapper format", () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root, "sample-plugin");

    writeJson(join(pluginRoot, "hooks", "hooks.json"), {
      PreToolUse: [],
    });

    const result = runValidator(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("hooks/hooks.json must contain a top-level \"hooks\" object");
  });

  test("fails when manifest hooks points to auto-discovered hooks file", () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root, "sample-plugin");

    writeJson(join(pluginRoot, ".claude-plugin", "plugin.json"), {
      name: "sample-plugin",
      version: "1.0.0",
      description: "sample plugin",
      hooks: "./hooks/hooks.json",
    });
    writeJson(join(pluginRoot, "hooks", "hooks.json"), {
      hooks: {},
    });

    const result = runValidator(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("manifest.hooks must not point to \"./hooks/hooks.json\"");
  });

  test("fails when manifest commands path is not plugin-root relative", () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root, "sample-plugin");

    writeJson(join(pluginRoot, ".claude-plugin", "plugin.json"), {
      name: "sample-plugin",
      version: "1.0.0",
      description: "sample plugin",
      commands: "commands",
    });

    const result = runValidator(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('manifest.commands[0]: must start with "./"');
  });
});
