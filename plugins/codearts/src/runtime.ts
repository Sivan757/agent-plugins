//
// runtime.ts — glue between the CLI surface and the execution layer.
//
// Commands call `createClient` once, then use `client.request(...)` and the
// project helpers. All project discovery funnels through here so behaviour
// stays consistent: one project resolves silently, several require a choice.

import type { Command } from "commander";
import { PluginError, fingerprintAll, recordVerification } from "@agent-plugins/config-center";
import type { CodeartsConfig } from "./config.js";
import { CODEARTS_PLUGIN_NAME, credentialValues, requireConfig } from "./config.js";
import {
  execute,
  formatPreview,
  type ApiRequestSpec,
  type ApiResponse,
  type QueryValue,
} from "./http.js";
import type { OutputFormat } from "./output.js";
import { isRecord, valueAtPath } from "./output.js";

export interface CliContext {
  format: OutputFormat;
  /** `--project`, explicit project id for this invocation. */
  projectId?: string;
  dryRun: boolean;
  /** `--endpoint`, one-off gateway override. */
  endpoint?: string;
  verbose: boolean;
  /** `--fields`, dotted paths to keep from the response. */
  fields?: string[];
}

export function readContext(command: Command): CliContext {
  const options = command.optsWithGlobals() as Record<string, unknown>;
  return {
    format: (options.format as OutputFormat) ?? "table",
    projectId: (options.project as string | undefined) || undefined,
    dryRun: options.dryRun === true,
    endpoint: (options.endpoint as string | undefined) || undefined,
    verbose: options.verbose === true,
    fields: (options.fields as string[] | undefined)?.filter(Boolean),
  };
}

export interface ProjectSummary {
  identifier: string;
  name: string;
}

export interface CodeartsClient {
  config: CodeartsConfig;
  ctx: CliContext;
  /** Run a catalog operation (or an ad-hoc request) with context defaults applied. */
  request(
    spec: Pick<
      ApiRequestSpec,
      "service" | "method" | "path" | "pathParams" | "query" | "body" | "headers"
    > & {
      projectId?: string;
      dryRun?: boolean;
    }
  ): Promise<ApiResponse>;
  /** Resolve the project id to use, discovering it when necessary. */
  projectId(options?: { required?: boolean }): Promise<string | undefined>;
  /** List every project visible to the caller. */
  projects(): Promise<ProjectSummary[]>;
  /** Account (tenant) id, needed by a few Artifact paths. */
  tenantId(): Promise<string>;
}

/** Load configuration and build a client with the command's context applied. */
export async function createClient(command: Command): Promise<CodeartsClient> {
  const ctx = readContext(command);
  const config = await requireConfig();
  if (ctx.endpoint) {
    // A one-off override replaces the gateway and any per-service override.
    config.gateway = ctx.endpoint;
    delete config.endpoints;
  }

  let projectPromise: Promise<ProjectSummary[]> | null = null;

  const listProjects = async (): Promise<ProjectSummary[]> => {
    projectPromise ??= loadProjects(config);
    return projectPromise;
  };

  const client: CodeartsClient = {
    config,
    ctx,
    request: async (spec) => {
      const pathParams = { ...(spec.pathParams ?? {}) };
      // Most paths carry `{project_id}`; fill it from the resolved project so a
      // caller never has to paste a UUID. A project the caller already passed
      // wins, and is never re-resolved.
      const projectKeys = ["project_id", "projectId", "project_uuid"];
      const pathWantsProject = projectKeys.some((key) => spec.path.includes(`{${key}}`));
      const supplied = projectKeys.some((key) => Boolean(pathParams[key]));
      // Resolve through `client.projectId()` rather than reading the flag
      // directly, so a project *name* becomes the id the path needs.
      const resolved =
        spec.projectId ??
        (pathWantsProject && !supplied
          ? await client.projectId({ required: false })
          : undefined);
      for (const key of projectKeys) {
        if (resolved && spec.path.includes(`{${key}}`) && !pathParams[key]) pathParams[key] = resolved;
      }
      const response = await execute(
        config,
        {
          ...spec,
          pathParams,
          // The header scope prefers the gateway auth project inside `execute`.
          ...(resolved ? { projectId: resolved } : {}),
          dryRun: spec.dryRun ?? ctx.dryRun,
        },
        { extraHeaders: { "x-language": "zh-cn" } }
      );
      // `--verbose` promises the request that was actually sent, for every
      // command — not only for `api call`.
      if (ctx.verbose) process.stderr.write(`${formatPreview(response.preview)}\n`);
      await noteCredentialSuccess(config, response.preview.url);
      return response;
    },
    projectId: async (options) => {
      // Only an explicit choice counts: `--project` for this command. No
      // default is persisted, because the same commands must work against
      // several projects (front end today, back end tomorrow).
      if (ctx.projectId) return resolveProjectRef(ctx.projectId);

      const projects = await listProjects();
      if (projects.length === 1) {
        // No default project is persisted: a single visible project is simply
        // unambiguous for this invocation.
        return projects[0].identifier;
      }
      if (projects.length === 0) {
        if (options?.required === false) return undefined;
        throw new PluginError(
          "No CodeArts project is visible to the current credentials.\n" +
            "Check that the account has joined a project, or pass --project <name|id>.",
          "QUERY_FAILED"
        );
      }
      throw new PluginError(
        `This deployment has several CodeArts projects, so one must be chosen per command:\n` +
          projects.map((project) => `  --project ${project.name}   (${project.identifier})`).join("\n") +
          `\nExample: codearts pipeline list --project ${projects[0].name}`,
        "CONFIG_INVALID"
      );
    },
    projects: listProjects,
    tenantId: async () => {
      if (config.tenantId) return config.tenantId;
      const iamEndpoint = (config.iamEndpoint ?? "").trim();
      if (!iamEndpoint) {
        throw new PluginError(
          "This operation needs the account (tenant) id, which is not configured.\n" +
            "Find it in the console under 我的凭证 → 账号ID, then set it with `codearts config --ui` " +
            "(or configure the IAM endpoint so it can be discovered automatically).",
          "CONFIG_INVALID"
        );
      }

      // Ask IAM for the projects of the current credentials; each carries the
      // owning account id. The gateway is swapped only for this one call.
      const gateway = config.gateway;
      const endpoints = config.endpoints;
      config.gateway = iamEndpoint;
      delete config.endpoints;
      try {
        const response = await execute(config, {
          service: "codeartsbuild",
          method: "GET",
          path: "/v3/projects/",
        });
        const accountId = valueAtPath(response.body, "projects.0.domain_id");
        if (!accountId) {
          throw new PluginError(
            `IAM returned no usable project for these credentials.\n${JSON.stringify(response.body).slice(0, 300)}`,
            "QUERY_FAILED"
          );
        }
        config.tenantId = String(accountId);
        return config.tenantId;
      } finally {
        config.gateway = gateway;
        if (endpoints) config.endpoints = endpoints;
      }
    },
  };

  /** Resolve a project reference that may be an id or a project name. */
  async function resolveProjectRef(reference: string): Promise<string> {
    const value = reference.trim();
    if (!value) return value;
    // 32-character hexadecimal ids are unambiguous; avoid a lookup for them.
    if (/^[0-9a-f]{32}$/i.test(value)) return value;

    const projects = await listProjects();
    const exact = projects.filter((project) => project.name === value);
    if (exact.length === 1) return exact[0].identifier;

    const partial = projects.filter((project) =>
      project.name.toLowerCase().includes(value.toLowerCase())
    );
    const matches = exact.length > 0 ? exact : partial;
    if (matches.length === 1) return matches[0].identifier;

    throw new PluginError(
      matches.length === 0
        ? `No CodeArts project matches "${reference}".\nAvailable projects:\n${projects
            .map((project) => `  ${project.name}  (${project.identifier})`)
            .join("\n")}`
        : `"${reference}" matches several projects; use the full name or id:\n${matches
            .map((project) => `  ${project.name}  (${project.identifier})`)
            .join("\n")}`,
      "QUERY_FAILED"
    );
  }

  return client;
}

/**
 * Remember the first authenticated success of this run, so a later failure can
 * be judged rather than guessed at. Only a one-way digest is stored, and only
 * once per run: a failure to write it must never affect the request that just
 * succeeded, which is why `recordVerification` swallows its own errors.
 */
let credentialSuccess: Promise<void> | null = null;

function noteCredentialSuccess(config: CodeartsConfig, requestUrl: string): Promise<void> {
  credentialSuccess ??= recordVerification(CODEARTS_PLUGIN_NAME, {
    authType: config.authType,
    endpoint: originOf(requestUrl),
    fingerprint: fingerprintAll(credentialValues(config)),
  });
  return credentialSuccess;
}

function originOf(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return url;
  }
}

/**
 * Discover projects through the CodeArts Build tenant API, which is the only
 * documented endpoint that lists projects without needing one up front.
 */
async function loadProjects(config: CodeartsConfig): Promise<ProjectSummary[]> {
  const response = await execute(config, {
    service: "codeartsbuild",
    method: "GET",
    path: "/v1/domain/project/related",
  });

  await noteCredentialSuccess(config, response.preview.url);

  const list =
    valueAtPath(response.body, "result.project_info_list") ??
    valueAtPath(response.body, "project_info_list");
  if (!Array.isArray(list)) {
    throw new PluginError(
      `Unexpected project list payload; expected result.project_info_list.\n${JSON.stringify(
        response.body
      ).slice(0, 400)}`,
      "QUERY_FAILED"
    );
  }

  return list.filter(isRecord).map((entry) => ({
    identifier: String(entry.identifier ?? entry.project_id ?? ""),
    name: String(entry.name ?? ""),
  }));
}

// ── Parameter helpers ───────────────────────────────────────────────────────

/** Parse repeated `key=value` flags into a keyed record. */
export function parseKeyValues(values: string[] | undefined, flag: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const entry of values ?? []) {
    const index = entry.indexOf("=");
    if (index <= 0) {
      throw new PluginError(
        `Invalid ${flag} value: ${entry}\nExpected the form ${flag} <name>=<value>`,
        "CONFIG_INVALID"
      );
    }
    result[entry.slice(0, index)] = entry.slice(index + 1);
  }
  return result;
}

/** Assign `a.b[0].c` inside a nested object, creating containers as needed. */
export function setDeep(target: Record<string, unknown>, path: string, value: unknown): void {
  const segments = path
    .split(".")
    .flatMap((segment) => {
      const match = segment.match(/^([^[\]]*)((?:\[\d+\])*)$/);
      if (!match) return [segment];
      const parts: (string | number)[] = [];
      if (match[1]) parts.push(match[1]);
      for (const index of match[2].matchAll(/\[(\d+)\]/g)) parts.push(Number(index[1]));
      return parts;
    });

  let cursor: Record<string, unknown> | unknown[] = target;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const key = segments[i];
    const next = segments[i + 1];
    if (typeof key === "number") {
      const array = cursor as unknown[];
      array[key] ??= typeof next === "number" ? [] : {};
      cursor = array[key] as Record<string, unknown> | unknown[];
    } else {
      const object = cursor as Record<string, unknown>;
      object[key] ??= typeof next === "number" ? [] : {};
      cursor = object[key] as Record<string, unknown> | unknown[];
    }
  }

  const last = segments[segments.length - 1];
  if (typeof last === "number") (cursor as unknown[])[last] = value;
  else (cursor as Record<string, unknown>)[last] = value;
}

/** Coerce a CLI string to the JSON type the catalog documents for a parameter. */
export function coerceValue(raw: string, type: string | undefined): unknown {
  if (!type) return raw;
  const normalized = type.toLowerCase();
  if (normalized.includes("bool")) {
    if (raw === "true") return true;
    if (raw === "false") return false;
    return raw;
  }
  if (
    normalized.includes("integer") ||
    normalized.includes("number") ||
    normalized.includes("int")
  ) {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : raw;
  }
  if (normalized.startsWith("array") || normalized.startsWith("map") || normalized.includes("object")) {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        return JSON.parse(trimmed) as unknown;
      } catch {
        return raw;
      }
    }
  }
  return raw;
}

/** Build a query record from string values, keeping catalog types where known. */
export function toQuery(entries: Record<string, unknown>): Record<string, QueryValue> {
  const query: Record<string, QueryValue> = {};
  for (const [key, value] of Object.entries(entries)) {
    if (value === undefined || value === null) continue;
    query[key] = value as QueryValue;
  }
  return query;
}
