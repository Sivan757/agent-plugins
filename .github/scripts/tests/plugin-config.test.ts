import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";

import {
  generatePluginFiles,
  packPlugins,
  validatePluginMetadata,
} from "../../../scripts/plugin-config";

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
  mkdirSync(join(root, "src"), { recursive: true });
  writeJson(join(root, ".agents/plugins/marketplace.json"), {
    name: "agent-plugins",
    interface: { displayName: "Agent Plugins" },
    plugins: [
      {
        name: "external-codex",
        source: { source: "url", url: "https://example.test/plugin.git" },
        policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
        category: "Coding",
      },
    ],
  });
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

function createRuntimePlugin(root: string, name = "sample-plugin"): string {
  const pluginRoot = join(root, "src", name);
  writeText(join(pluginRoot, "skills", name, "SKILL.md"), "---\nname: sample\ndescription: Sample skill\n---\n");
  writeJson(join(pluginRoot, "hooks.json"), { hooks: { SessionStart: [] } });
  writeJson(join(pluginRoot, "hooks", "hooks.json"), { hooks: { SessionStart: [] } });
  writeJson(join(pluginRoot, ".mcp.json"), { mcpServers: { sample: { command: "node", args: ["dist/sample.mjs"] } } });
  writeText(join(pluginRoot, "README.md"), "# Sample Plugin\n");
  writeText(join(pluginRoot, "src", "sample.ts"), "console.log('source');\n");
  writeJson(join(pluginRoot, "package.json"), { name, version: "1.2.3", type: "module" });
  writeText(join(root, ".build", "plugin-dist", name, "dist", "sample.mjs"), "console.log('dist');\n");
  writeText(join(root, ".build", "plugin-dist", name, "dist", "extra.dat"), "runtime data\n");
  writeText(join(pluginRoot, "plugin.config.ts"), `
export default {
  name: "${name}",
  version: "1.2.3",
  description: "Sample generated plugin.",
  author: { name: "Agent Plugins" },
  keywords: ["sample", "metadata"],
  category: "Coding",
  interface: {
    displayName: "Sample Plugin",
    shortDescription: "Sample short description.",
    longDescription: "Sample generated plugin.",
    developerName: "Agent Plugins",
    category: "Coding"
  },
  build: { entry: "src/sample.ts", output: "dist/sample.mjs" },
  surfaces: {
    skills: true,
    hooks: "native",
    mcp: true
  },
  artifact: {
    include: ["dist/extra.dat"]
  },
  marketplace: {
    codex: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
    claude: { description: "Sample marketplace description." }
  }
};
`);
  return pluginRoot;
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("plugin metadata pipeline", () => {
  test("generates marketplace metadata without writing manifests into source", async () => {
    const root = createRepo();
    const pluginRoot = createRuntimePlugin(root);
    const originalCodexHooks = readFileSync(join(pluginRoot, "hooks.json"), "utf-8");
    const originalClaudeHooks = readFileSync(join(pluginRoot, "hooks", "hooks.json"), "utf-8");

    await generatePluginFiles(root);

    expect(existsSync(join(pluginRoot, ".codex-plugin", "plugin.json"))).toBe(false);
    expect(existsSync(join(pluginRoot, ".claude-plugin", "plugin.json"))).toBe(false);

    expect(readFileSync(join(pluginRoot, "hooks.json"), "utf-8")).toBe(originalCodexHooks);
    expect(readFileSync(join(pluginRoot, "hooks", "hooks.json"), "utf-8")).toBe(originalClaudeHooks);

    const codexMarketplace = readJson<{ plugins: Array<{ name: string; source: unknown }> }>(
      join(root, ".agents/plugins/marketplace.json")
    );
    expect(codexMarketplace.plugins.map((plugin) => plugin.name)).toEqual(["external-codex", "sample-plugin"]);
    expect(codexMarketplace.plugins[1]).toMatchObject({
      name: "sample-plugin",
      source: { source: "local", path: "./plugins/sample-plugin" },
      category: "Coding",
    });

    const claudeMarketplace = readJson<{ plugins: Array<{ name: string; source: unknown; version?: string }> }>(
      join(root, ".claude-plugin/marketplace.json")
    );
    expect(claudeMarketplace.plugins.map((plugin) => plugin.name)).toEqual(["external-claude", "sample-plugin"]);
    expect(claudeMarketplace.plugins[1]).toMatchObject({
      name: "sample-plugin",
      version: "1.2.3",
      source: "./plugins/sample-plugin",
      description: "Sample marketplace description.",
    });
  });

  test("packs installable artifacts without source-only files", async () => {
    const root = createRepo();
    createRuntimePlugin(root);
    await generatePluginFiles(root);

    await packPlugins(root, { outDir: ".release/plugins" });

    const packedRoot = join(root, ".release/plugins/sample-plugin");
    expect(existsSync(join(packedRoot, ".codex-plugin", "plugin.json"))).toBe(true);
    expect(existsSync(join(packedRoot, ".claude-plugin", "plugin.json"))).toBe(true);
    expect(readJson<Record<string, unknown>>(join(packedRoot, ".claude-plugin", "plugin.json")).hooks).toBeUndefined();
    expect(existsSync(join(packedRoot, "skills", "sample-plugin", "SKILL.md"))).toBe(true);
    expect(existsSync(join(packedRoot, "hooks.json"))).toBe(true);
    expect(existsSync(join(packedRoot, "hooks", "hooks.json"))).toBe(true);
    expect(existsSync(join(packedRoot, ".mcp.json"))).toBe(true);
    expect(existsSync(join(packedRoot, "README.md"))).toBe(true);
    expect(existsSync(join(packedRoot, "dist", "sample.mjs"))).toBe(true);
    expect(existsSync(join(packedRoot, "dist", "extra.dat"))).toBe(true);

    expect(existsSync(join(packedRoot, "src"))).toBe(false);
    expect(existsSync(join(root, "src", "sample-plugin", "dist"))).toBe(false);
    expect(existsSync(join(packedRoot, "package.json"))).toBe(false);
    expect(existsSync(join(packedRoot, "package-lock.json"))).toBe(false);
    expect(existsSync(join(packedRoot, "tsconfig.json"))).toBe(false);
    expect(existsSync(join(packedRoot, "plugin.config.ts"))).toBe(false);
    expect(existsSync(join(packedRoot, "node_modules"))).toBe(false);
  });

  test("validation reports drift when generated manifests are edited directly", async () => {
    const root = createRepo();
    createRuntimePlugin(root);
    await generatePluginFiles(root);
    await packPlugins(root, { outDir: "plugins" });

    const manifestPath = join(root, "plugins", "sample-plugin", ".codex-plugin", "plugin.json");
    const manifest = readJson<Record<string, unknown>>(manifestPath);
    manifest.version = "9.9.9";
    writeJson(manifestPath, manifest);

    const errors = await validatePluginMetadata(root, { packsRoot: "plugins" });

    expect(errors.some((error) => error.includes("sample-plugin") && error.includes(".codex-plugin/plugin.json"))).toBe(
      true
    );
  });
});
