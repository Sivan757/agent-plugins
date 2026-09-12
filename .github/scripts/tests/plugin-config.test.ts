import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";

import { generatePluginFiles, loadPluginConfigs, validatePluginMetadata } from "../../../scripts/plugin-config";

const tempRoots: string[] = [];

function writeText(filePath: string, content: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}

function writeJson(filePath: string, value: unknown): void {
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf-8")) as T;
}

function createRepo(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-plugins-metadata-"));
  tempRoots.push(root);
  mkdirSync(join(root, "plugins"), { recursive: true });
  writeJson(join(root, ".claude-plugin/marketplace.json"), {
    name: "agent-plugins",
    plugins: [
      {
        name: "external-claude",
        description: "External plugin",
        source: { source: "url", url: "https://example.test/plugin.git" },
      },
    ],
  });
  return root;
}

/** A plugin directory is the whole artifact: native files plus its own metadata source. */
function createPlugin(root: string, name = "sample-plugin"): string {
  const pluginRoot = join(root, "plugins", name);
  writeText(join(pluginRoot, "skills", name, "SKILL.md"), "---\nname: sample\ndescription: Sample skill\n---\n");
  writeJson(join(pluginRoot, "hooks", "hooks.json"), { hooks: { SessionStart: [] } });
  writeJson(join(pluginRoot, ".mcp.json"), { mcpServers: { sample: { command: "node", args: ["dist/sample.mjs"] } } });
  writeText(join(pluginRoot, "README.md"), "# Sample Plugin\n");
  writeJson(join(pluginRoot, "package.json"), { name, version: "1.2.3", type: "module" });
  writeText(join(pluginRoot, "src", "sample.ts"), "program.version('1.2.3');\n");
  writeText(join(pluginRoot, "dist", "sample.mjs"), "console.log('dist');\n");
  writeText(
    join(pluginRoot, "plugin.config.ts"),
    `export default {
  name: "${name}",
  version: "1.2.3",
  description: "Sample plugin.",
  author: { name: "Agent Plugins" },
  keywords: ["sample", "metadata"],
  marketplace: { description: "Sample marketplace description." },
};
`
  );
  return pluginRoot;
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("plugin metadata generation", () => {
  test("writes each manifest beside its plugin and the marketplace at the root", async () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root);
    const originalHooks = readFileSync(join(pluginRoot, "hooks", "hooks.json"), "utf-8");

    await generatePluginFiles(root);

    expect(readJson(join(pluginRoot, ".claude-plugin", "plugin.json"))).toEqual({
      name: "sample-plugin",
      version: "1.2.3",
      description: "Sample plugin.",
      author: { name: "Agent Plugins" },
      keywords: ["sample", "metadata"],
    });
    // Native runtime files are authored by hand and must survive generation untouched.
    expect(readFileSync(join(pluginRoot, "hooks", "hooks.json"), "utf-8")).toBe(originalHooks);
    expect(existsSync(join(pluginRoot, "dist", "sample.mjs"))).toBe(true);
    expect(existsSync(join(root, ".agents/plugins/marketplace.json"))).toBe(false);

    const marketplace = readJson<{ plugins: Array<Record<string, unknown>> }>(
      join(root, ".claude-plugin/marketplace.json")
    );
    expect(marketplace.plugins.map((plugin) => plugin.name)).toEqual(["external-claude", "sample-plugin"]);
    expect(marketplace.plugins[1]).toEqual({
      name: "sample-plugin",
      version: "1.2.3",
      source: "./plugins/sample-plugin",
      description: "Sample marketplace description.",
    });
  });

  test("falls back to the plugin description when no marketplace override is configured", async () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root);
    writeText(
      join(pluginRoot, "plugin.config.ts"),
      `export default { name: "sample-plugin", version: "1.2.3", description: "Plain description." };\n`
    );

    await generatePluginFiles(root);

    expect(readJson<Record<string, unknown>>(join(pluginRoot, ".claude-plugin/plugin.json"))).toEqual({
      name: "sample-plugin",
      version: "1.2.3",
      description: "Plain description.",
    });
    const marketplace = readJson<{ plugins: Array<{ name: string; description: string }> }>(
      join(root, ".claude-plugin/marketplace.json")
    );
    expect(marketplace.plugins.find((plugin) => plugin.name === "sample-plugin")?.description).toBe("Plain description.");
  });

  test("rejects a plugin directory without a metadata source", async () => {
    const root = createRepo();
    mkdirSync(join(root, "plugins", "orphan"), { recursive: true });

    await expect(loadPluginConfigs(root)).rejects.toThrow("missing plugin.config.ts");
  });

  test("rejects a config whose name disagrees with its directory", async () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root);
    writeText(
      join(pluginRoot, "plugin.config.ts"),
      `export default { name: "other-name", version: "1.2.3", description: "Mismatched." };\n`
    );

    await expect(loadPluginConfigs(root)).rejects.toThrow("config.name must match plugin directory name");
  });
});

describe("plugin metadata validation", () => {
  test("passes once generated files match the metadata sources", async () => {
    const root = createRepo();
    createPlugin(root);
    await generatePluginFiles(root);

    expect(await validatePluginMetadata(root)).toEqual([]);
  });

  test("reports drift when a generated manifest is edited directly", async () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root);
    await generatePluginFiles(root);

    const manifestPath = join(pluginRoot, ".claude-plugin", "plugin.json");
    const manifest = readJson<Record<string, unknown>>(manifestPath);
    manifest.version = "9.9.9";
    writeJson(manifestPath, manifest);

    const errors = await validatePluginMetadata(root);

    expect(errors.some((error) => error.includes("sample-plugin") && error.includes(".claude-plugin/plugin.json"))).toBe(
      true
    );
  });

  test("reports a missing generated manifest", async () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root);
    await generatePluginFiles(root);
    rmSync(join(pluginRoot, ".claude-plugin"), { recursive: true, force: true });

    const errors = await validatePluginMetadata(root);

    expect(errors.some((error) => error.includes("missing generated file"))).toBe(true);
  });

  test("reports a package.json version that drifts from the metadata", async () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root);
    await generatePluginFiles(root);

    const packageJsonPath = join(pluginRoot, "package.json");
    const pkg = readJson<Record<string, unknown>>(packageJsonPath);
    pkg.version = "9.9.9";
    writeJson(packageJsonPath, pkg);

    const errors = await validatePluginMetadata(root);

    const mismatch = errors.find((error) => error.includes("version mismatch"));
    expect(mismatch).toBeDefined();
    expect(mismatch).toContain("package.json: 9.9.9");
  });

  test("reports a CLI that prints a version the metadata disagrees with", async () => {
    const root = createRepo();
    const pluginRoot = createPlugin(root);
    await generatePluginFiles(root);

    writeText(join(pluginRoot, "src", "sample.ts"), "program.version('9.9.9');\n");

    const errors = await validatePluginMetadata(root);

    const mismatch = errors.find((error) => error.includes("version mismatch"));
    expect(mismatch).toBeDefined();
    expect(mismatch).toContain("src/sample.ts: 9.9.9");
  });

  test("reports a marketplace that no longer matches the plugin metadata", async () => {
    const root = createRepo();
    createPlugin(root);
    await generatePluginFiles(root);

    const marketplacePath = join(root, ".claude-plugin", "marketplace.json");
    const marketplace = readJson<{ plugins: Array<Record<string, unknown>> }>(marketplacePath);
    marketplace.plugins = marketplace.plugins.filter((plugin) => plugin.name !== "sample-plugin");
    writeJson(marketplacePath, marketplace);

    const errors = await validatePluginMetadata(root);

    expect(errors.some((error) => error.includes(".claude-plugin/marketplace.json"))).toBe(true);
  });
});
