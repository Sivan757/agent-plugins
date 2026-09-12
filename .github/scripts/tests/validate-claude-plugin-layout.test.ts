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

/** A valid skill frontmatter block, so a case can vary one field. */
function writeSkill(
  pluginRoot: string,
  name = "demo",
  frontmatter = "name: demo\ndescription: Demo skill\n"
): void {
  writeText(
    join(pluginRoot, "skills", name, "SKILL.md"),
    `---\n${frontmatter}---\n\n# Demo\n`
  );
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
    expect(result.stdout).toContain("Claude plugin layout validation passed");
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

  test("passes when agent-facing text names a path the plugin ships", () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root, "sample-plugin");

    writeText(join(pluginRoot, "dist", "sample.mjs"), "console.log('bundle');\n");
    writeText(
      join(pluginRoot, "skills", "sample", "SKILL.md"),
      "---\nname: sample\ndescription: Sample skill\n---\n\nRun `node ${CLAUDE_PLUGIN_ROOT}/dist/sample.mjs --help`.\n"
    );

    const result = runValidator(root);

    expect(result.status).toBe(0);
  });

  test("fails when agent-facing text names a plugin path that does not exist", () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root, "sample-plugin");

    writeText(
      join(pluginRoot, "skills", "sample", "SKILL.md"),
      "---\nname: sample\ndescription: Sample skill\n---\n\nRun `node ${CLAUDE_PLUGIN_ROOT}/scripts/sample.mjs --help`.\n"
    );

    const result = runValidator(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("references missing path ${CLAUDE_PLUGIN_ROOT}/scripts/sample.mjs");
  });

  test("ignores placeholder and glob segments in plugin-root paths", () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root, "sample-plugin");

    writeText(
      join(pluginRoot, "commands", "run.md"),
      "---\ndescription: Run a script\n---\n\nRun `bash ${CLAUDE_PLUGIN_ROOT}/scripts/<name>.sh` over `${CLAUDE_PLUGIN_ROOT}/scripts/*.mjs`.\n"
    );

    const result = runValidator(root);

    expect(result.status).toBe(0);
  });

  // Frontmatter of the definitions Claude Code reads. Ported from the gate this one
  // absorbed: it walked the same directories for the same reason.

  test("checks the frontmatter of every discovered skill and command", () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root, "sample-plugin");
    writeSkill(pluginRoot);
    writeText(
      join(pluginRoot, "commands", "init.md"),
      '---\ndescription: Initialize\nargument-hint: "[target] [--dry-run]"\n---\n\nbody\n'
    );

    const result = runValidator(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("2 frontmatter file(s) checked");
  });

  test("rejects an unquoted flow-sequence argument hint", () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root, "sample-plugin");
    writeText(
      join(pluginRoot, "commands", "init.md"),
      "---\ndescription: Initialize\nargument-hint: [target] [--dry-run]\n---\n\nbody\n"
    );

    const result = runValidator(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("invalid YAML frontmatter");
    expect(result.stderr).toContain("flow-seq-start");
  });

  test("requires a skill description", () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root, "sample-plugin");
    writeSkill(pluginRoot, "demo", "name: demo\n");

    const result = runValidator(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('skill frontmatter must have "description"');
  });

  test("requires an agent name and description", () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root, "sample-plugin");
    writeText(join(pluginRoot, "agents", "reviewer.md"), "---\ndescription: Reviews\n---\n\nbody\n");

    const result = runValidator(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('agent frontmatter must have "name"');
  });

  test("accepts a command that carries only a description", () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root, "sample-plugin");
    writeText(join(pluginRoot, "commands", "review.md"), "---\ndescription: Reviews\n---\n\nbody\n");

    const result = runValidator(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("1 frontmatter file(s) checked");
  });

  test("leaves a skill's internal agents directory out of scope", () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root, "sample-plugin");
    writeSkill(pluginRoot);
    writeText(join(pluginRoot, "skills", "demo", "agents", "note.md"), "# resource file\n");

    const result = runValidator(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("1 frontmatter file(s) checked");
  });

  test("reports a repository with nothing to check instead of an empty pass", () => {
    const result = runValidator(createRepo());

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("0 frontmatter file(s) checked");
  });
});
