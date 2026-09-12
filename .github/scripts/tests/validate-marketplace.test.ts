import { afterEach, describe, expect, test } from "bun:test";
import { spawnSync } from "child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";

const SCRIPT_PATH = join(process.cwd(), ".github/scripts/validate-marketplace.ts");
const tempRoots: string[] = [];

interface Entry {
  name?: unknown;
  description?: unknown;
  version?: unknown;
  source?: unknown;
}

function writeText(filePath: string, content: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}

/** A repository whose marketplace holds `entries`, with a directory per local one. */
function createRepo(entries: Entry[], topLevel: Record<string, unknown> = { name: "test-marketplace" }): string {
  const root = mkdtempSync(join(tmpdir(), "agent-plugins-marketplace-"));
  tempRoots.push(root);

  for (const entry of entries) {
    if (typeof entry.source === "string" && entry.source.startsWith("./plugins/")) {
      // A local entry only validates when its directory exists.
      mkdirSync(join(root, entry.source), { recursive: true });
    }
  }

  writeText(
    join(root, ".claude-plugin", "marketplace.json"),
    `${JSON.stringify({ ...topLevel, plugins: entries }, null, 2)}\n`
  );
  return root;
}

/** A well-formed local entry, so a case can vary one field. */
function localEntry(name = "sample", overrides: Partial<Entry> = {}): Entry {
  return {
    name,
    description: `${name} plugin`,
    version: "1.0.0",
    source: `./plugins/${name}`,
    ...overrides,
  };
}

function run(root: string) {
  const result = spawnSync("bun", ["run", SCRIPT_PATH], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, PLUGIN_REPO_ROOT: root },
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("validate-marketplace", () => {
  test("passes for a local entry and a remote entry", () => {
    const root = createRepo([
      localEntry("sample"),
      {
        name: "external-toolkit",
        description: "Somebody else's plugin",
        source: { source: "url", url: "https://example.test/toolkit.git" },
      },
    ]);

    const result = run(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Marketplace validation passed: claude=2 plugin(s).");
  });

  test("accepts entries that are not in name order", () => {
    // Ordering belongs to the generator's byte-for-byte comparison, which is the
    // only thing that can see the order the metadata renders. Asserted here so
    // this gate does not quietly take the rule back.
    const root = createRepo([localEntry("zulu"), localEntry("alpha")]);

    const result = run(root);

    expect(result.status).toBe(0);
  });

  test("rejects a local source that is not the plugin directory", () => {
    const root = createRepo([localEntry("sample", { source: "./plugins/elsewhere" })]);

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('local "source" must be ./plugins/sample');
  });

  test("rejects a local source whose directory does not exist", () => {
    const root = createRepo([localEntry("sample")]);
    rmSync(join(root, "plugins", "sample"), { recursive: true, force: true });

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("local \"source\" target does not exist (./plugins/sample)");
  });

  test("rejects a local entry with no version", () => {
    const root = createRepo([localEntry("sample", { version: undefined })]);

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('local plugin must have a non-empty "version" string');
  });

  test("rejects an entry with no description", () => {
    const root = createRepo([localEntry("sample", { description: "" })]);

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('"description" must be a non-empty string');
  });

  test("rejects a duplicate plugin name", () => {
    const root = createRepo([localEntry("sample"), localEntry("sample")]);

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('duplicate plugin name "sample"');
  });

  test("rejects a source that is neither a local path nor a remote source object", () => {
    const root = createRepo([{ name: "sample", description: "Sample", source: 42 }]);

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('"source" must be a local path string or remote source object');
  });

  test("rejects a marketplace whose plugins key is not an array", () => {
    // Written by hand rather than through the helper, which always supplies an
    // array for the key it is testing.
    const root = createRepo([]);
    writeText(
      join(root, ".claude-plugin", "marketplace.json"),
      `${JSON.stringify({ name: "test-marketplace", plugins: {} }, null, 2)}\n`
    );

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('"plugins" must be an array');
  });

  test("rejects a marketplace with no top-level name", () => {
    const root = createRepo([localEntry("sample")], {});

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('top-level "name" must be a non-empty string');
  });
});
