import { afterEach, describe, expect, test } from "bun:test";
import { spawnSync } from "child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";

const SCRIPT_PATH = resolve(import.meta.dir, "../validate-frontmatter.ts");
const tempRoots: string[] = [];

function createRepo(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-plugins-frontmatter-"));
  tempRoots.push(root);
  mkdirSync(join(root, "src"), { recursive: true });
  return root;
}

function writeText(filePath: string, content: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}

function run(root: string, args: string[] = ["--all"]) {
  const result = spawnSync("bun", ["run", SCRIPT_PATH, ...args], {
    encoding: "utf8",
    env: { ...process.env, PLUGIN_REPO_ROOT: root },
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function writeSkill(root: string, name = "demo", frontmatter = 'name: demo\ndescription: Demo skill\n'): string {
  const file = join(root, "src", "sample-plugin", "skills", name, "SKILL.md");
  writeText(file, `---\n${frontmatter}---\n\n# Demo\n`);
  return file;
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("frontmatter validation (--all)", () => {
  test("validates every discovered skill and command", () => {
    const root = createRepo();
    writeSkill(root);
    writeText(
      join(root, "src", "sample-plugin", "commands", "init.md"),
      '---\ndescription: Initialize\nargument-hint: "[target] [--dry-run]"\n---\n\nbody\n',
    );

    const result = run(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("2 file(s) validated");
  });

  test("rejects an unquoted flow-sequence argument hint", () => {
    const root = createRepo();
    writeText(
      join(root, "src", "sample-plugin", "commands", "init.md"),
      "---\ndescription: Initialize\nargument-hint: [target] [--dry-run]\n---\n\nbody\n",
    );

    const result = run(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("invalid YAML frontmatter");
    expect(result.stderr).toContain("flow-seq-start");
  });

  test("requires a skill description", () => {
    const root = createRepo();
    writeSkill(root, "demo", "name: demo\n");

    const result = run(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('must have "description"');
  });

  test("leaves a skill's internal agents directory out of scope", () => {
    const root = createRepo();
    writeSkill(root);
    writeText(join(root, "src", "sample-plugin", "skills", "demo", "agents", "note.md"), "# resource file\n");

    const result = run(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("1 file(s) validated");
  });

  test("reports an empty repository instead of failing", () => {
    const result = run(createRepo());

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("No frontmatter files found.");
  });

  test("still validates explicit paths passed as arguments", () => {
    const root = createRepo();
    const skill = writeSkill(root);
    writeText(join(root, "src", "sample-plugin", "commands", "broken.md"), "---\nargument-hint: [a] [b]\n---\n");

    const result = run(root, [skill]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("1 file(s) validated");
  });
});
