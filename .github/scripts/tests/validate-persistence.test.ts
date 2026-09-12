import { afterEach, describe, expect, test } from "bun:test";
import { spawnSync } from "child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";

const SCRIPT_PATH = join(process.cwd(), ".github/scripts/validate-persistence.ts");
const tempRoots: string[] = [];

function writeText(filePath: string, content: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}

/** A repository fixture holding one plugin whose source is `source`. */
function createRepo(source: string, file = "src/tool.ts"): string {
  const root = mkdtempSync(join(tmpdir(), "agent-plugins-persistence-"));
  tempRoots.push(root);
  writeText(join(root, "plugins/example/plugin.config.ts"), 'export default { name: "example" };\n');
  writeText(join(root, "plugins/example", file), source);
  return root;
}

function run(root: string) {
  const result = spawnSync("bun", ["run", SCRIPT_PATH], {
    env: { ...process.env, PLUGIN_REPO_ROOT: root },
    encoding: "utf-8",
  });
  return { code: result.status ?? -1, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("validate-persistence", () => {
  test("accepts a plugin that builds its paths from the shared helpers", () => {
    const root = createRepo(
      [
        'import { pluginFilePath, writePluginFile } from "@agent-plugins/config-center";',
        'const CACHE = pluginFilePath("example", "session.json");',
        "export async function save(data: string) {",
        '  await writePluginFile("example", ["session.json"], data);',
        "}",
        "",
      ].join("\n")
    );

    const { code, stdout } = run(root);
    expect(code).toBe(0);
    expect(stdout).toContain("Persistence validation passed");
  });

  test("rejects a storage path taken from the system temporary directory", () => {
    const root = createRepo(
      [
        'import { tmpdir } from "os";',
        "import { join } from \"path\";",
        'const SESSION = join(tmpdir(), "example-session.json");',
        "export const path = SESSION;",
        "",
      ].join("\n")
    );

    const { code, stderr } = run(root);
    expect(code).toBe(1);
    expect(stderr).toContain("system temporary directory");
    expect(stderr).toContain("src/tool.ts:3");
  });

  test("rejects a root recomputed from the home directory", () => {
    const root = createRepo(
      [
        'import { homedir } from "os";',
        'const ROOT = homedir() + "/.cache/agent-plugins";',
        "export const root = ROOT;",
        "",
      ].join("\n")
    );

    const { code, stderr } = run(root);
    expect(code).toBe(1);
    expect(stderr).toContain("reads the home directory");
  });

  test("rejects a path resolved against the working directory", () => {
    const root = createRepo(
      [
        'import { resolve } from "path";',
        'export const file = resolve(process.cwd(), "data.json");',
        "",
      ].join("\n")
    );

    const { code, stderr } = run(root);
    expect(code).toBe(1);
    expect(stderr).toContain("working directory");
  });

  test("rejects a shared temporary path written literally", () => {
    const root = createRepo('export const file = "/tmp/example-session.json";\n');

    const { code, stderr } = run(root);
    expect(code).toBe(1);
    expect(stderr).toContain("shared temporary path literally");
  });

  test("allows the module that owns the root to read the home directory", () => {
    // The plugin under scan stays compliant; the root owner is the one module the
    // rule exempts, and it lives in config-center.
    const root = createRepo("export const ok = 1;\n");
    writeText(
      join(root, "plugins/config-center/src/config-store.ts"),
      [
        'import { homedir } from "os";',
        'import { join } from "path";',
        'export function cacheRoot() { return join(homedir(), ".cache", "agent-plugins"); }',
        "",
      ].join("\n")
    );

    const { code } = run(root);
    expect(code).toBe(0);
  });

  test("ignores tests, which point at temporary directories on purpose", () => {
    const root = createRepo(
      ['import { tmpdir } from "os";', 'export const scratch = tmpdir();', ""].join("\n"),
      "src/tool.test.ts"
    );

    const { code } = run(root);
    expect(code).toBe(0);
  });
});
