#!/usr/bin/env bun
/**
 * Validates every plugin's browser config form against the shared UI contract.
 *
 * A plugin's form is data (`plugins/<name>/src/config-ui.ts` exporting
 * `CONFIG_UI`), rendered by one shared React app. Nothing type-checks that data
 * against the renderer, so a form can be wrong in ways the plugin's own tests do
 * not notice:
 *
 *   - an element `type` the catalog does not define renders nothing;
 *   - a `Field` whose `props.type` is not a catalog field type renders nothing;
 *   - a `children` entry naming a missing element never renders (this is how the
 *     CodeArts AK/SK inputs were silently lost once);
 *   - an element unreachable from `spec.root` renders nothing.
 *
 * It also checks the other half of the contract: a plugin ships the shared HTML
 * exactly when its bundle actually serves it. Shipping it otherwise is 348 KB of
 * dead weight per plugin; not shipping it means the form cannot open.
 *
 * Exit 0 on success, exit 1 on any finding.
 */

import { createHash } from "crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, relative, resolve } from "path";
import { pathToFileURL } from "url";

const ROOT = process.env.PLUGIN_REPO_ROOT
  ? resolve(process.env.PLUGIN_REPO_ROOT)
  : resolve(import.meta.dir, "../..");
const PLUGINS_ROOT = join(ROOT, "plugins");
const CONTRACT_PATH = join(PLUGINS_ROOT, "config-center/ui/src/shared/catalog-contract.ts");
const SPEC_MODULE = join("src", "config-ui.ts");
const UI_HTML = join("dist", "config-ui", "dist", "index.html");
/** `loadBundledHTML` resolves this directory; its literal is what ships it. */
const UI_MARKER = "config-ui";

interface CatalogElement {
  type?: unknown;
  props?: Record<string, unknown> | null;
  children?: unknown;
}

interface ContractModule {
  CONFIG_UI_COMPONENTS: readonly string[];
  CONFIG_UI_FIELD_TYPES: readonly string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function importModule(path: string): Promise<Record<string, unknown>> {
  return (await import(`${pathToFileURL(path).href}?v=${Date.now()}`)) as Record<string, unknown>;
}

/** Walk one form spec, reporting anything the renderer cannot draw. */
function checkSpec(pluginRel: string, spec: unknown, errors: string[]): void {
  if (!isRecord(spec) || !isRecord(spec['elements'])) {
    errors.push(`${pluginRel}: CONFIG_UI.spec must be an object with an "elements" map`);
    return;
  }

  const elements = spec['elements'] as Record<string, unknown>;
  const root = spec['root'];
  if (typeof root !== "string" || !(root in elements)) {
    errors.push(`${pluginRel}: CONFIG_UI.spec.root must name an element in "elements"`);
    return;
  }

  const reachable = new Set<string>();
  const visit = (id: string): void => {
    if (reachable.has(id)) return;
    reachable.add(id);
    const element = elements[id];
    if (!isRecord(element)) return;
    const children = element['children'];
    if (Array.isArray(children)) {
      for (const child of children) {
        if (typeof child === "string") visit(child);
      }
    }
  };
  visit(root);

  for (const [id, rawElement] of Object.entries(elements)) {
    if (!isRecord(rawElement)) {
      errors.push(`${pluginRel}: element "${id}" must be an object`);
      continue;
    }

    const element = rawElement as CatalogElement;
    const type = element.type;
    if (typeof type !== "string") {
      errors.push(`${pluginRel}: element "${id}" has no string "type"`);
      continue;
    }
    if (!componentTypes.has(type)) {
      errors.push(`${pluginRel}: element "${id}" uses unknown component "${type}"`);
    }

    if (type === "Field") {
      const props = isRecord(element.props) ? element.props : {};
      const fieldType = props['type'];
      if (typeof fieldType !== "string") {
        errors.push(`${pluginRel}: Field "${id}" has no string props.type`);
      } else if (!fieldTypes.has(fieldType)) {
        errors.push(`${pluginRel}: Field "${id}" uses unknown field type "${fieldType}"`);
      }
    }

    if (Array.isArray(element.children)) {
      for (const child of element.children) {
        if (typeof child !== "string") {
          errors.push(`${pluginRel}: element "${id}" has a non-string child entry`);
        } else if (!(child in elements)) {
          errors.push(`${pluginRel}: element "${id}" lists child "${child}", which is not in "elements"`);
        }
      }
    }

    if (!reachable.has(id)) {
      errors.push(`${pluginRel}: element "${id}" is unreachable from spec.root and never renders`);
    }
  }
}

const contract = (await importModule(CONTRACT_PATH)) as unknown as ContractModule;
const componentTypes = new Set<string>(contract.CONFIG_UI_COMPONENTS);
const fieldTypes = new Set<string>(contract.CONFIG_UI_FIELD_TYPES);
const errors: string[] = [];

/** One shared UI bundle: every shipped copy must be byte-identical. */
const uiCopies: { path: string; digest: string }[] = [];

for (const entry of readdirSync(PLUGINS_ROOT)) {
  const pluginRoot = join(PLUGINS_ROOT, entry);
  if (!statSync(pluginRoot).isDirectory()) continue;

  const pluginRel = relative(ROOT, pluginRoot);
  const specPath = join(pluginRoot, SPEC_MODULE);
  const declaresForm = existsSync(specPath);

  if (declaresForm) {
    const module = await importModule(specPath);
    if (module['CONFIG_UI'] === undefined) {
      errors.push(`${pluginRel}: ${SPEC_MODULE} must export CONFIG_UI`);
    } else {
      const configUi = module['CONFIG_UI'];
      checkSpec(pluginRel, isRecord(configUi) ? configUi['spec'] : undefined, errors);
    }
  }

  const bundlePath = join(pluginRoot, "dist", `${entry}.mjs`);
  const servesForm = existsSync(bundlePath) && readFileSync(bundlePath, "utf-8").includes(UI_MARKER);
  const htmlPath = join(pluginRoot, UI_HTML);
  const shipsHtml = existsSync(htmlPath);

  if (declaresForm && !servesForm) {
    errors.push(`${pluginRel}: declares a config form but its bundle never serves it`);
  }
  if (servesForm && !shipsHtml) {
    errors.push(`${pluginRel}: serves the config form but does not ship ${UI_HTML}`);
  }
  if (shipsHtml && !servesForm) {
    errors.push(`${pluginRel}: ships ${UI_HTML} without anything that serves it (dead weight)`);
  }
  if (shipsHtml) {
    uiCopies.push({
      path: relative(ROOT, htmlPath),
      digest: createHash("sha256").update(readFileSync(htmlPath)).digest("hex"),
    });
  }
}

// A stale copy is invisible in isolation: compare the copies to each other rather
// than to a fresh Vite build, whose byte-for-byte reproducibility across
// platforms this repository does not rely on.
const [reference, ...rest] = uiCopies;
if (!reference) {
  errors.push("no plugin ships the shared config UI; is config-center still the renderer?");
}
for (const copy of rest) {
  if (copy.digest !== reference.digest) {
    errors.push(`${copy.path}: differs from ${reference.path}; both are the same shared UI bundle`);
  }
}

if (errors.length > 0) {
  console.error("Config UI contract validation failed:\n");
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  console.error(`\n${errors.length} finding(s).`);
  process.exit(1);
}

console.log(`Config UI contract validation passed: ${componentTypes.size} components, ${fieldTypes.size} field types.`);
