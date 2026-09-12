#!/usr/bin/env tsx
//
// extract-api-catalog.ts
//
// Builds `dist/api-catalog.json`: a machine-readable inventory of every
// documented Huawei Cloud CodeArts API operation.
//
// Source of truth is the documentation mirror configured by CODEARTS_DOC_BASE
// (default https://docs.ai-huadu.com). Each service exposes its documentation
// tree as `<locale>/api/<service>/menu.json`; every leaf page is fetched as
// `<locale>/api/<service>/<page>.json` and parsed for its request shape.
//
// Usage:
//   npm run extract --prefix plugins/codearts
//   CODEARTS_DOC_BASE=... CODEARTS_DOC_LOCALE=zh-cn tsx scripts/extract-api-catalog.ts
//
// Fetched pages are cached under ~/.cache/codearts-doc-cache so re-runs are cheap
// and an offline refresh is possible from the cache. Override with CODEARTS_DOC_CACHE.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = join(HERE, "..");
// The fetched documentation pages are a local cache, not repository content:
// keeping them outside the tree avoids bloating the repo and keeps secret
// scanners from having to read hundreds of doc dumps.
const CACHE_ROOT = process.env.CODEARTS_DOC_CACHE ?? join(homedir(), ".cache", "codearts-doc-cache");
const OUTPUT_PATH = join(PLUGIN_ROOT, "dist", "api-catalog.json");

const DOC_BASE = process.env.CODEARTS_DOC_BASE ?? "https://docs.ai-huadu.com";
const DOC_LOCALE = process.env.CODEARTS_DOC_LOCALE ?? "zh-cn";
const CONCURRENCY = Number(process.env.CODEARTS_EXTRACT_CONCURRENCY ?? 8);

/** Services covered by the plugin, in the order the CLI presents them. */
export const CATALOG_SERVICES = [
  { service: "codeartspipeline", serviceName: "流水线 CodeArts Pipeline", label: "pipeline" },
  { service: "codeartsbuild", serviceName: "编译构建 CodeArts Build", label: "build" },
  { service: "codeartscheck", serviceName: "代码检查 CodeArts Check", label: "check" },
  { service: "codeartsrepo", serviceName: "代码托管 CodeArts Repo", label: "repo" },
  { service: "codeartsdeploy", serviceName: "部署 CodeArts Deploy", label: "deploy" },
  { service: "codeartsartifact", serviceName: "制品仓库 CodeArts Artifact", label: "artifact" },
  { service: "codeartswiki", serviceName: "知识库 CodeArts Wiki", label: "wiki" },
  { service: "codeartsboard", serviceName: "效能洞察 CodeArts Board", label: "board" },
] as const;

/** Documentation groups that describe how to call APIs rather than APIs. */
const NON_API_GROUPS = ["如何调用API", "附录", "修订记录", "变更历史"];

interface MenuNode {
  name: string;
  code: string;
  pCode: string;
  position: number;
  url: string;
  type?: string;
  [key: string]: unknown;
}

interface DocPage extends MenuNode {
  content?: string;
}

export interface CatalogParam {
  name: string;
  required: boolean;
  type: string;
  description: string;
}

export interface CatalogOperation {
  /** Stable identifier, `<service>.<page>`, e.g. `codeartspipeline.RunPipeline`. */
  id: string;
  service: string;
  serviceName: string;
  /** Human-facing group, e.g. `流水线管理`. */
  group: string;
  name: string;
  method: string;
  /** Resource path including `{placeholders}`. */
  path: string;
  /** Present when the documented URI carried its own host placeholder. */
  host?: string;
  /** True for operations the documentation marks as outdated or deprecated. */
  legacy?: boolean;
  pathParams: CatalogParam[];
  queryParams: CatalogParam[];
  headerParams: CatalogParam[];
  bodyParams: CatalogParam[];
  bodyObjects?: Record<string, CatalogParam[]>;
}

export interface Catalog {
  generatedAt: string;
  source: string;
  locale: string;
  services: { service: string; serviceName: string; label: string; operationCount: number }[];
  operations: CatalogOperation[];
}

// ── HTML helpers ─────────────────────────────────────────────────────────────

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

export function decodeEntities(value: string): string {
  return value.replace(/&(nbsp|amp|lt|gt|quot|#39|apos);/g, (m) => ENTITIES[m] ?? m);
}

export function htmlToText(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

interface DocTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

/** Parse every `<table>` in a documentation page into caption, headers and rows. */
export function parseTables(html: string): DocTable[] {
  const tables: DocTable[] = [];
  for (const match of html.matchAll(/<table[\s\S]*?<\/table>/g)) {
    const table = match[0];
    const caption = htmlToText((table.match(/<caption>([\s\S]*?)<\/caption>/) ?? [])[1] ?? "");
    const headers = [
      ...((table.match(/<thead[^>]*>[\s\S]*?<\/thead>/) ?? [""])[0]).matchAll(/<th[\s\S]*?<\/th>/g),
    ].map((cell) => htmlToText(cell[0]));
    const body = (table.match(/<tbody>([\s\S]*?)<\/tbody>/) ?? [])[1] ?? "";
    const rows = [...body.matchAll(/<tr[\s\S]*?<\/tr>/g)]
      .map((row) =>
        [...row[0].matchAll(/<td[\s\S]*?<\/td>/g)].map((cell) => htmlToText(cell[0]))
      )
      .filter((cells) => cells.length > 0);
    if (caption || rows.length > 0) {
      tables.push({ caption, headers, rows });
    }
  }
  return tables;
}

/** Split `表3 请求Body参数` / `Table 3 Request Body Parameters` into its ordinal-free title. */
function tableTitle(caption: string): string {
  return caption.replace(/^\s*(表|Table)\s*\d+\s*/i, "").trim();
}

function cleanDescription(raw: string): string {
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return "";
  const parts = text.split(/(?:参数解释|约束限制|取值范围|默认取值)\s*[:：]\s*/);
  const first = parts.length > 1 ? parts[1] : text;
  return first.trim().slice(0, 400);
}

function toParam(row: string[]): CatalogParam | null {
  const [name = "", required = "", type = "", description = ""] = row;
  const cleanName = name.trim();
  if (!cleanName) return null;
  return {
    name: cleanName,
    required: /^(是|必选|Yes|yes)$/.test(required.trim()),
    type: type.trim(),
    description: cleanDescription(description),
  };
}

function parseParams(table: DocTable | undefined): CatalogParam[] {
  if (!table) return [];
  return table.rows
    .map(toParam)
    .filter((param): param is CatalogParam => param !== null);
}

/**
 * Locate the URI section and split it into method, path and optional host.
 * Documented URIs look like `POST /v5/{project_id}/api/pipelines/...`, and
 * some carry their own host, e.g. `POST https://{hostURL}/v4/repositories/...`.
 */
export function parseUri(html: string): { method: string; path: string; host?: string } | null {
  const section = html.match(/<h4[^>]*>\s*URI\s*<\/h4>\s*<p[^>]*>([\s\S]*?)<\/p>/);
  const raw = section ? htmlToText(section[1]) : "";
  if (!raw) return null;

  const match = raw.match(/\b(GET|POST|PUT|DELETE|PATCH|HEAD)\b\s*(\S+)/i);
  if (!match) return null;
  const method = match[1].toUpperCase();
  const target = match[2];

  const hostMatch = target.match(/^https?:\/\/(\{[^}]+\}|[^/]+)(\/.*)$/);
  if (hostMatch) {
    return { method, path: hostMatch[2], host: hostMatch[1] };
  }
  return { method, path: target };
}

const BODY_TABLE = /请求\s*Body\s*参数|请求参数（Body）|Request\s+Body\s+Parameters/i;
const PATH_TABLE = /路径参数|Path\s+Parameters/i;
const QUERY_TABLE = /Query\s*参数|查询参数|Query\s+Parameters/i;
const HEADER_TABLE = /Header\s*参数|请求消息头|请求\s*Header|Request\s+Header\s+Parameters/i;
const RESPONSE_TABLE = /响应\s*(Body\s*)?参数|响应消息头|Response\s+(Body\s+)?Parameters/i;

/** Split request-side tables into path/query/header/body plus nested DTO tables. */
export function parseRequestTables(tables: DocTable[]): {
  pathParams: CatalogParam[];
  queryParams: CatalogParam[];
  headerParams: CatalogParam[];
  bodyParams: CatalogParam[];
  bodyObjects: Record<string, CatalogParam[]>;
} {
  const result = {
    pathParams: [] as CatalogParam[],
    queryParams: [] as CatalogParam[],
    headerParams: [] as CatalogParam[],
    bodyParams: [] as CatalogParam[],
    bodyObjects: {} as Record<string, CatalogParam[]>,
  };

  let sawRequestBody = false;
  for (const table of tables) {
    const title = tableTitle(table.caption);
    if (!title) continue;

    // Response tables must be classified before request tables: a caption such
    // as `响应Body参数` also contains the substring `Body参数`.
    if (RESPONSE_TABLE.test(title)) {
      sawRequestBody = false;
      continue;
    }
    if (PATH_TABLE.test(title)) {
      result.pathParams = parseParams(table);
      continue;
    }
    if (QUERY_TABLE.test(title)) {
      result.queryParams = parseParams(table);
      continue;
    }
    if (HEADER_TABLE.test(title)) {
      result.headerParams = parseParams(table);
      continue;
    }
    if (BODY_TABLE.test(title)) {
      result.bodyParams = parseParams(table);
      sawRequestBody = true;
      continue;
    }
    if (sawRequestBody) {
      // A DTO table named after the object type it describes.
      result.bodyObjects[title] = parseParams(table);
    }
  }

  return result;
}

// ── Fetching ─────────────────────────────────────────────────────────────────

async function fetchJson<T>(url: string, attempt = 0): Promise<T> {
  try {
    const response = await fetch(url, { headers: { "user-agent": "agent-plugins-codearts-extract" } });
    if (!response.ok) {
      if (response.status === 404) {
        throw Object.assign(new Error(`not found: ${url}`), { status: 404 });
      }
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    const body = await response.text();
    if (!body.trim()) {
      throw new Error(`empty response body for ${url}`);
    }
    return JSON.parse(body) as T;
  } catch (error) {
    if ((error as { status?: number }).status === 404) throw error;
    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
      return fetchJson<T>(url, attempt + 1);
    }
    throw new Error(`unreadable documentation page ${url}: ${(error as Error).message}`);
  }
}

async function fetchDocPage(service: string, page: string): Promise<DocPage | null> {
  const cachePath = join(CACHE_ROOT, service, `${page}.json`);
  if (existsSync(cachePath)) {
    try {
      return JSON.parse(await readFile(cachePath, "utf-8")) as DocPage;
    } catch {
      // fall through and refetch a corrupt cache entry
    }
  }

  const url = `${DOC_BASE}/${DOC_LOCALE}/api/${service}/${page}.json`;
  try {
    const page_data = await fetchJson<DocPage>(url);
    await mkdir(dirname(cachePath), { recursive: true });
    await writeFile(cachePath, JSON.stringify(page_data), "utf-8");
    return page_data;
  } catch (error) {
    if ((error as { status?: number }).status === 404) return null;
    throw error;
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

// ── Menu handling ────────────────────────────────────────────────────────────

interface OperationTarget {
  service: string;
  serviceName: string;
  group: string;
  name: string;
  page: string;
  legacy: boolean;
  position: number;
}

function pageFromUrl(url: string): string | null {
  const match = url.match(/\/([^/]+)\.html$/);
  return match ? match[1] : null;
}

export function collectTargets(
  service: string,
  serviceName: string,
  menu: MenuNode[]
): OperationTarget[] {
  const byCode = new Map(menu.map((node) => [node.code, node]));
  const parents = new Set(menu.map((node) => node.pCode).filter(Boolean));

  const chainOf = (node: MenuNode): MenuNode[] => {
    const chain: MenuNode[] = [];
    let current: MenuNode | undefined = node.pCode ? byCode.get(node.pCode) : undefined;
    while (current) {
      chain.unshift(current);
      current = current.pCode ? byCode.get(current.pCode) : undefined;
    }
    return chain;
  };

  const targets: OperationTarget[] = [];
  for (const node of menu) {
    if (parents.has(node.code)) continue; // not a leaf
    const chain = chainOf(node);
    const groupNames = [...chain.map((entry) => entry.name), node.name];
    if (groupNames.some((groupName) => NON_API_GROUPS.includes(groupName))) continue;

    const page = pageFromUrl(String(node.url ?? ""));
    if (!page) continue;

    targets.push({
      service,
      serviceName,
      group: chain.length > 0 ? chain[chain.length - 1].name : "",
      name: node.name,
      page,
      legacy: chain.some((entry) =>
        /已过时|旧版本|历史API|废弃|Deprecated/i.test(entry.name)
      ),
      position: targets.length,
    });
  }
  return targets;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function buildCatalog(): Promise<Catalog> {
  const operations: CatalogOperation[] = [];
  const services: Catalog["services"] = [];

  for (const { service, serviceName, label } of CATALOG_SERVICES) {
    const menuUrl = `${DOC_BASE}/${DOC_LOCALE}/api/${service}/menu.json`;
    let menu: MenuNode[];
    try {
      menu = await fetchJson<MenuNode[]>(menuUrl);
    } catch (error) {
      console.warn(`! ${service}: cannot read menu (${(error as Error).message})`);
      services.push({ service, serviceName, label, operationCount: 0 });
      continue;
    }

    const targets = collectTargets(service, serviceName, menu);
    let skipped = 0;
    const parsed = await mapWithConcurrency(targets, CONCURRENCY, async (target) => {
      const pageData = await fetchDocPage(service, target.page);
      if (!pageData) {
        skipped += 1;
        return null;
      }
      const html = String(pageData.content ?? "");
      const uri = parseUri(html);
      if (!uri) {
        skipped += 1;
        return null;
      }
      const tables = parseTables(html);
      const request = parseRequestTables(tables);
      const operation: CatalogOperation = {
        id: `${service}.${target.page}`,
        service,
        serviceName,
        group: target.group,
        name: target.name,
        method: uri.method,
        path: uri.path,
        ...(uri.host ? { host: uri.host } : {}),
        ...(target.legacy ? { legacy: true } : {}),
        pathParams: request.pathParams,
        queryParams: request.queryParams,
        headerParams: request.headerParams.filter(
          (param) => !/^x-auth-token$/i.test(param.name)
        ),
        bodyParams: request.bodyParams,
        ...(Object.keys(request.bodyObjects).length > 0
          ? { bodyObjects: request.bodyObjects }
          : {}),
      };
      return operation;
    });

    const kept = parsed.filter((operation): operation is CatalogOperation => operation !== null);
    operations.push(...kept);
    services.push({ service, serviceName, label, operationCount: kept.length });
    console.log(
      `  ${service.padEnd(20)} ${String(kept.length).padStart(4)} operations` +
        (skipped > 0 ? ` (${skipped} leaf pages without a URI skipped)` : "")
    );
  }

  return {
    generatedAt: new Date().toISOString(),
    source: `${DOC_BASE}/${DOC_LOCALE}`,
    locale: DOC_LOCALE,
    services,
    operations,
  };
}

/**
 * Serialise the catalog with one operation per line, but keep the resource
 * `path` on its own line.
 *
 * A single-line JSON blob puts every field of every operation on one line,
 * which makes diffs unreadable and trips line-oriented secret scanners: a
 * documented parameter literally named `password` would share a line with a
 * long path-shaped token and look like a credential. Documentation URLs are
 * derived from the catalog source at read time, not stored per operation.
 */
function serializeCatalog(catalog: Catalog): string {
  const head = JSON.stringify(
    {
      generatedAt: catalog.generatedAt,
      source: catalog.source,
      locale: catalog.locale,
      services: catalog.services,
    },
    null,
    2
  );
  const body = catalog.operations.map((operation) => {
    const { path, ...rest } = operation;
    const compact = JSON.stringify(rest).slice(0, -1);
    return `${compact},\n   "path": ${JSON.stringify(path)}}`;
  });
  return `${head.slice(0, -1).trimEnd()},\n  "operations": [\n${body.join(",\n")}\n  ]\n}\n`;
}

async function main(): Promise<void> {
  console.log(`Extracting CodeArts API catalog from ${DOC_BASE}/${DOC_LOCALE}`);
  const catalog = await buildCatalog();
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  const text = serializeCatalog(catalog);
  await writeFile(OUTPUT_PATH, text, "utf-8");
  console.log(
    `\nWrote ${catalog.operations.length} operations to ${OUTPUT_PATH} (${(
      Buffer.byteLength(text) / 1024
    ).toFixed(0)} KiB)`
  );
}

const invokedDirectly = process.argv[1] ? process.argv[1].includes("extract-api-catalog") : false;
if (invokedDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
