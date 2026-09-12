//
// catalog.ts — access to the generated CodeArts API catalog.
//
// The catalog is produced by `npm run extract --prefix plugins/codearts` from the
// CodeArts API documentation. It answers three questions for the CLI:
//   1. which operations exist,
//   2. what a given operation needs (path, query, body parameters),
//   3. what the caller probably meant when a name does not match.

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface CatalogParam {
  name: string;
  required: boolean;
  type: string;
  description: string;
}

export interface CatalogOperation {
  id: string;
  service: string;
  serviceName: string;
  group: string;
  name: string;
  method: string;
  path: string;
  host?: string;
  legacy?: boolean;
  pathParams: CatalogParam[];
  queryParams: CatalogParam[];
  headerParams: CatalogParam[];
  bodyParams: CatalogParam[];
  bodyObjects?: Record<string, CatalogParam[]>;
}

export interface CatalogService {
  service: string;
  serviceName: string;
  label: string;
  operationCount: number;
}

export interface Catalog {
  generatedAt: string;
  source: string;
  locale: string;
  services: CatalogService[];
  operations: CatalogOperation[];
}

/** Read the catalog without triggering setup; used by every CLI command. */
let cachedCatalog: Catalog | null = null;

/** Locations tried in order: beside the bundle, then the plugin's `dist/` for `tsx` runs. */
function catalogCandidates(): string[] {
  const thisDir =
    typeof __dirname !== "undefined" ? __dirname : dirname(fileURLToPath(import.meta.url));
  return [
    resolve(thisDir, "api-catalog.json"),
    resolve(thisDir, "..", "dist", "api-catalog.json"),
  ];
}

export function catalogPath(): string {
  const candidates = catalogCandidates();
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(
      `CodeArts API catalog not found. Searched:\n${candidates
        .map((candidate) => `  - ${candidate}`)
        .join("\n")}\nRun: npm run extract --prefix plugins/codearts`
    );
  }
  return found;
}

export function loadCatalog(): Catalog {
  if (cachedCatalog) return cachedCatalog;
  cachedCatalog = JSON.parse(readFileSync(catalogPath(), "utf-8")) as Catalog;
  return cachedCatalog;
}

/**
 * Documentation page for an operation, derived from its id and the catalog's
 * source so the deployment's documentation host is stored once instead of
 * being repeated on all 782 entries.
 */
export function docUrl(operation: CatalogOperation, catalog = loadCatalog()): string {
  return `${catalog.source}/api/${operation.service}/${pageName(operation)}.html`;
}

/** Short, stable reference for an operation, e.g. `codeartspipeline.RunPipeline`. */
export function shortId(operation: CatalogOperation): string {
  return operation.id;
}

/** The documentation page name embedded in the catalog id. */
export function pageName(operation: CatalogOperation): string {
  return operation.id.slice(operation.service.length + 1);
}

export type OperationLookup =
  | { kind: "found"; operation: CatalogOperation }
  | { kind: "ambiguous"; candidates: CatalogOperation[] }
  | { kind: "missing"; suggestions: CatalogOperation[] };

/**
 * Resolve a user-supplied operation reference. Accepts, in order of precedence:
 * an exact id (`codeartspipeline.RunPipeline`), a page name (`RunPipeline`),
 * a full documentation URL, or an operation name (`启动流水线`).
 */
export function resolveOperation(reference: string): OperationLookup {
  const catalog = loadCatalog();
  const raw = reference.trim();
  if (!raw) return { kind: "missing", suggestions: [] };

  const needle = raw.toLowerCase();
  const urlPage = raw.match(/\/([^/]+)\.html?$/);

  const exact = catalog.operations.find((operation) => operation.id.toLowerCase() === needle);
  if (exact) return { kind: "found", operation: exact };

  if (urlPage) {
    const byPage = catalog.operations.filter(
      (operation) => pageName(operation).toLowerCase() === urlPage[1].toLowerCase()
    );
    if (byPage.length === 1) return { kind: "found", operation: byPage[0] };
    if (byPage.length > 1) return { kind: "ambiguous", candidates: byPage };
  }

  // `service.page` where the service was given in a different form.
  const split = raw.match(/^([A-Za-z]+)[.:/](.+)$/);
  if (split) {
    const [, servicePart, pagePart] = split;
    const byServiceAndPage = catalog.operations.filter(
      (operation) =>
        operation.service.toLowerCase().endsWith(servicePart.toLowerCase()) &&
        pageName(operation).toLowerCase() === pagePart.toLowerCase()
    );
    if (byServiceAndPage.length === 1) return { kind: "found", operation: byServiceAndPage[0] };
    if (byServiceAndPage.length > 1) return { kind: "ambiguous", candidates: byServiceAndPage };
  }

  const byPage = catalog.operations.filter(
    (operation) => pageName(operation).toLowerCase() === needle
  );
  if (byPage.length === 1) return { kind: "found", operation: byPage[0] };
  if (byPage.length > 1) return { kind: "ambiguous", candidates: byPage };

  const byName = catalog.operations.filter((operation) => operation.name === raw);
  if (byName.length === 1) return { kind: "found", operation: byName[0] };
  if (byName.length > 1) return { kind: "ambiguous", candidates: byName };

  const suggestions = catalog.operations
    .filter(
      (operation) =>
        operation.name.includes(raw) ||
        pageName(operation).toLowerCase().includes(needle)
    )
    .sort((a, b) => a.name.length - b.name.length)
    .slice(0, 10);

  return { kind: "missing", suggestions };
}

export interface SearchOptions {
  service?: string;
  keyword?: string;
  method?: string;
  /** Include operations the documentation marks as outdated. */
  includeLegacy?: boolean;
  limit?: number;
}

/** Filter the catalog for discovery. Keyword matches name, page id and path. */
export function searchOperations(options: SearchOptions = {}): CatalogOperation[] {
  const catalog = loadCatalog();
  const keyword = options.keyword?.trim().toLowerCase();
  const service = options.service?.trim().toLowerCase();
  const method = options.method?.trim().toUpperCase();
  const limit = options.limit ?? 40;

  const matched = catalog.operations.filter((operation) => {
    if (!options.includeLegacy && operation.legacy) return false;
    if (service && operation.service.toLowerCase() !== service) {
      const label = catalog.services.find((entry) => entry.service === operation.service)?.label;
      if (label !== service) return false;
    }
    if (method && operation.method !== method) return false;
    if (keyword) {
      const haystack = `${operation.name} ${operation.id} ${operation.path} ${operation.group}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    return true;
  });

  return matched.slice(0, limit);
}

/** Normalise a service reference (`pipeline`, `codeartspipeline`, `流水线`) to its flag. */
export function resolveService(reference: string): CatalogService | undefined {
  const catalog = loadCatalog();
  const needle = reference.trim().toLowerCase();
  return catalog.services.find(
    (service) =>
      service.service.toLowerCase() === needle ||
      service.label.toLowerCase() === needle ||
      service.serviceName.toLowerCase() === needle ||
      service.serviceName.toLowerCase().includes(needle)
  );
}

export function serviceOperations(service: string, includeLegacy = false): CatalogOperation[] {
  const catalog = loadCatalog();
  return catalog.operations.filter(
    (operation) =>
      operation.service === service && (includeLegacy || !operation.legacy)
  );
}

/** Body parameter names, including nested object field names, for validation. */
export function bodyParamNames(operation: CatalogOperation): string[] {
  const names = operation.bodyParams.map((param) => param.name);
  for (const fields of Object.values(operation.bodyObjects ?? {})) {
    for (const field of fields) {
      if (!names.includes(field.name)) names.push(field.name);
    }
  }
  return names;
}
