import { afterEach, describe, expect, test } from "bun:test";
import { spawnSync } from "child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";

const SCRIPT_PATH = join(process.cwd(), ".github/scripts/validate-config-ui-contract.ts");
const tempRoots: string[] = [];

function writeText(filePath: string, content: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}

/** The contract module the gate reads, kept identical in shape to the real one. */
function createRepo(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-plugins-config-ui-"));
  tempRoots.push(root);
  writeText(
    join(root, "plugins/config-center/ui/src/shared/catalog-contract.ts"),
    [
      "export const CONFIG_UI_COMPONENTS = ['Header', 'Collection', 'Field', 'SaveBar'] as const;",
      "export const CONFIG_UI_FIELD_TYPES = ['text', 'password'] as const;",
      "export const CONFIG_UI_ACTIONS = ['save'] as const;",
      "",
    ].join("\n")
  );
  return root;
}

interface PluginFixture {
  /** Elements map; omitted entirely when the plugin declares no form. */
  form?: Record<string, { type: string; props?: Record<string, unknown>; children?: string[] }>;
  root?: string;
  /** Whether the bundle contains the marker that makes it serve the UI. */
  serves?: boolean;
  html?: string;
  /** Value of `CONFIG_UI.collections`, which sits next to `spec`. */
  collections?: unknown[];
}

function addPlugin(root: string, name: string, fixture: PluginFixture): void {
  const pluginRoot = join(root, "plugins", name);
  writeText(join(pluginRoot, "plugin.config.ts"), `export default { name: "${name}" };\n`);

  if (fixture.form) {
    const collections =
      fixture.collections === undefined ? "" : `, collections: ${JSON.stringify(fixture.collections)}`;
    writeText(
      join(pluginRoot, "src/config-ui.ts"),
      `export const CONFIG_UI = { spec: { root: ${JSON.stringify(fixture.root ?? "page")}, elements: ${JSON.stringify(fixture.form)} }${collections} };\n`
    );
  }

  const bundle = fixture.serves ? "const candidate = 'config-ui';\n" : "const other = 1;\n";
  writeText(join(pluginRoot, "dist", `${name}.mjs`), bundle);

  if (fixture.html !== undefined) {
    writeText(join(pluginRoot, "dist/config-ui/dist/index.html"), fixture.html);
  }
}

function run(root: string) {
  return spawnSync("bun", ["run", SCRIPT_PATH], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, PLUGIN_REPO_ROOT: root },
  });
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

const validForm = {
  page: { type: "Header", children: ["connections", "save"] },
  connections: {
    type: "Collection",
    props: { statePath: "/connections" },
    children: ["conn-host"],
  },
  "conn-host": { type: "Field", props: { type: "text" } },
  save: { type: "SaveBar" },
};
/** The mapping a Collection needs so the form and the file agree on its shape. */
const validCollections = [{ statePath: "/connections" }];

describe("validate-config-ui-contract", () => {
  test("passes for a form within the vocabulary that ships the UI it serves", () => {
    const root = createRepo();
    addPlugin(root, "sample", {
      form: validForm,
      collections: validCollections,
      serves: true,
      html: "ui",
    });

    const result = run(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Config UI contract validation passed");
  });

  test("fails on a component the vocabulary does not define", () => {
    const root = createRepo();
    addPlugin(root, "sample", {
      form: { ...validForm, page: { type: "Sidebar", children: ["save"] } },
      serves: true,
      html: "ui",
    });

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('uses unknown component "Sidebar"');
  });

  test("fails on a field type the vocabulary does not define", () => {
    const root = createRepo();
    addPlugin(root, "sample", {
      form: { ...validForm, "conn-host": { type: "Field", props: { type: "secret" } } },
      serves: true,
      html: "ui",
    });

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('uses unknown field type "secret"');
  });

  test("fails on an element unreachable from the spec root", () => {
    const root = createRepo();
    addPlugin(root, "sample", {
      form: { ...validForm, page: { type: "Header", children: ["save"] } },
      serves: true,
      html: "ui",
    });

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("unreachable from spec.root");
  });

  test("fails on a child naming an element that does not exist", () => {
    const root = createRepo();
    addPlugin(root, "sample", {
      form: { ...validForm, page: { type: "Header", children: ["save", "ghost"] } },
      serves: true,
      html: "ui",
    });

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('lists child "ghost"');
  });

  test("fails when a Collection has no matching collections mapping", () => {
    const root = createRepo();
    addPlugin(root, "sample", { form: validForm, serves: true, html: "ui" });

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("CONFIG_UI.collections does not list it");
  });

  test("fails when collections maps a path no Collection renders", () => {
    const root = createRepo();
    addPlugin(root, "sample", {
      form: validForm,
      collections: [{ statePath: "/elsewhere" }],
      serves: true,
      html: "ui",
    });

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("no Collection element renders it");
  });

  test("fails when a Collection has no statePath to render", () => {
    const root = createRepo();
    addPlugin(root, "sample", {
      form: { ...validForm, connections: { type: "Collection", children: ["conn-host"] } },
      collections: validCollections,
      serves: true,
      html: "ui",
    });

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("has no string props.statePath");
  });

  test("fails when the form is served but the shared UI is missing", () => {
    const root = createRepo();
    addPlugin(root, "sample", { form: validForm, serves: true });

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("does not ship dist/config-ui/dist/index.html");
  });

  test("fails when the shared UI is shipped but nothing serves it", () => {
    const root = createRepo();
    addPlugin(root, "sample", { serves: false, html: "ui" });

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("without anything that serves it");
  });

  test("fails when a declared form is not wired into the bundle", () => {
    const root = createRepo();
    addPlugin(root, "sample", { form: validForm, serves: false, html: "ui" });

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("declares a config form but its bundle never serves it");
  });

  test("fails when two shipped copies of the shared UI disagree", () => {
    const root = createRepo();
    addPlugin(root, "alpha", { serves: true, html: "ui" });
    addPlugin(root, "beta", { serves: true, html: "ui-stale" });

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("both are the same shared UI bundle");
  });
});
