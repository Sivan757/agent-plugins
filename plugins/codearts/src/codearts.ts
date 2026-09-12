#!/usr/bin/env node
//
// codearts.ts — Huawei Cloud CodeArts CLI.
//
// One binary drives the whole development-to-operations chain: pipelines,
// compilation builds, code checks, code repositories, deployments, artifact
// repositories, wiki documents and board data.
//
// Design:
//   * Scenario commands are the golden path — they resolve names to ids, chain
//     the required calls, and return an answer rather than a raw payload.
//   * `api list/show/call` is the fallback surface over a generated catalog of
//     every documented operation, with parameter ground truth on mistakes.

import { readFileSync } from "node:fs";
import { Command } from "commander";
import { PluginError, openConfigUI, summarizeConfig } from "@agent-plugins/config-center";
import { CONFIG_UI as CODEARTS_CONFIG_UI, REASON_NEEDS_CONFIG } from "./config-ui.js";
import { codeartsConfigPath, credentialDiagnosis, readConfig, updateConfig } from "./config.js";
import {
  docUrl,
  loadCatalog,
  resolveOperation,
  resolveService,
  searchOperations,
} from "./catalog.js";
import type { CatalogOperation } from "./catalog.js";
import type { QueryValue } from "./http.js";
import { probeEndpoint } from "./http.js";
import { SERVICE_PROBES, discoverEndpoints } from "./endpoint.js";
import { createClient, parseKeyValues, coerceValue, setDeep, toQuery } from "./runtime.js";
import type { CodeartsClient } from "./runtime.js";
import { isRecord, pickPaths, renderValue, valueAtPath } from "./output.js";
import type { OutputFormat } from "./output.js";
import { action, asRows, emit, note, renderPreview } from "./cli-helpers.js";
import { registerScenarios } from "./scenarios/index.js";

// ── Program ─────────────────────────────────────────────────────────────────

function collectFields(value: string, previous: string[]): string[] {
  // Both forms are accepted: `--fields a.b --fields c.d` and `--fields a.b,c.d`.
  return [...previous, ...value.split(",").map((entry) => entry.trim()).filter(Boolean)];
}

const program = new Command();

program
  .name("codearts")
  .description(
    "Huawei Cloud CodeArts CLI — pipelines, builds, checks, repos, deploys, artifacts, wiki and board"
  )
  .version("0.1.0")
  .option("--format <format>", "output format: table | json | text", "table")
  .option("--project <name|id>", "CodeArts project for this command; required when several are visible")
  .option("--endpoint <url>", "override the configured gateway for this invocation")
  .option("--dry-run", "print the request that would be sent without sending it")
  .option("--verbose", "print request details and extra context on stderr")
  .option("--fields <path>", "keep only this dotted path in the response (repeatable)", collectFields, []);

// ── setup / config / doctor ─────────────────────────────────────────────────

program
  .command("setup")
  .description("Configure the CodeArts gateway and credentials in the browser")
  .action(
    action(async () => {
      const existing = await readConfig();
      const { saved } = await openConfigUI("codearts", {
        ...CODEARTS_CONFIG_UI,
        intent: existing ? "edit" : "create",
      });
      if (!saved) {
        process.stderr.write("Setup was closed without saving.\n");
        process.exit(1);
      }
      process.stdout.write("Configuration saved.\n");
    })
  );

program
  .command("config")
  .description("Show the configured endpoints and credentials (secrets masked)")
  .option("--ui", "open the configuration form, pre-filled, instead of only printing")
  .action(
    action(async (options: { ui?: boolean }) => {
      const before = await readConfig();
      if (options.ui) {
        // Same command serves both intents: opening the form is how the user
        // sees or changes anything, and printing afterwards reports what is
        // actually on disk now.
        const result = await openConfigUI("codearts", {
          ...CODEARTS_CONFIG_UI,
          intent: before ? "edit" : "create",
          reason: REASON_NEEDS_CONFIG,
        });
        if (!result.opened) {
          process.stderr.write("Could not serve the configuration form; printing the stored configuration instead.\n");
        } else if (!result.saved) {
          process.stderr.write("No changes were saved.\n");
        }
      }

      const config = await readConfig();
      if (!config) {
        process.stderr.write("No configuration yet. Run: codearts config --ui\n");
        process.exit(1);
      }
      // Every configured value is masked, with its length; the verdict below
      // adds what a mask cannot say (a key of the wrong shape, and whether
      // these exact credentials have ever been accepted).
      process.stdout.write(
        `${summarizeConfig(config, { spec: CODEARTS_CONFIG_UI.spec }).join("\n")}\n`
      );
      for (const line of credentialDiagnosis(config)) process.stdout.write(`${line}\n`);
      process.stdout.write(`configPath=${codeartsConfigPath()}\n`);
    })
  );

program
  .command("doctor")
  .description("Verify the gateway, credentials and catalog before doing real work")
  .action(
    action(async (options: unknown, command: Command) => {
      void options;
      const lines: string[] = [];
      const config = await readConfig();
      if (!config) {
        process.stderr.write("No configuration yet. Run: codearts config --ui\n");
        process.exit(1);
      }

      lines.push("Configuration");
      for (const line of summarizeConfig(config, { spec: CODEARTS_CONFIG_UI.spec })) {
        lines.push(`  ${line}`);
      }

      lines.push("", "Credentials");
      for (const line of credentialDiagnosis(config)) lines.push(`  ${line}`);

      const catalog = loadCatalog();
      lines.push("", "Catalog");
      lines.push(`  operations=${catalog.operations.length}`);
      lines.push(`  services=${catalog.services.length}`);
      lines.push(`  extractedFrom=${catalog.source}`);
      lines.push(`  generatedAt=${catalog.generatedAt}`);

      lines.push("", "Connectivity");
      let connected = false;
      try {
        const client = await createClient(command);
        const projects = await client.projects();
        connected = true;
        lines.push(`  project discovery: OK (${projects.length} visible)`);
        for (const project of projects.slice(0, 10)) {
          lines.push(`    ${project.identifier}  ${project.name}`);
        }
        if (projects.length > 10) lines.push(`    … and ${projects.length - 10} more`);
      } catch (error) {
        lines.push(`  project discovery: FAILED — ${(error as Error).message}`);
      }

      process.stdout.write(`${lines.join("\n")}\n`);
      if (!connected) process.exit(1);
    })
  );

program
  .command("probe")
  .argument("<url...>", "candidate gateway addresses to test")
  .description("Test candidate gateway addresses without credentials")
  .option(
    "--service <service>",
    "probe the documented path of this service instead of the generic one"
  )
  .action(
    action(async (urls: string[], options: Record<string, unknown>, command: Command) => {
      const requested = options.service ? resolveService(String(options.service)) : undefined;
      if (options.service && !requested) {
        throw new PluginError(
          `Unknown service "${String(options.service)}".\nAvailable: ${loadCatalog()
            .services.map((entry) => entry.label)
            .join(", ")}`,
          "CONFIG_INVALID"
        );
      }
      // Probing a service's own path is what makes the answer trustworthy: the
      // generic path is not published everywhere.
      const probe = requested
        ? SERVICE_PROBES.find((entry) => entry.service === requested.service)
        : undefined;
      const globals = command.optsWithGlobals() as { project?: string };
      const probePath = probe
        ? probe.path.replace("{project_id}", globals.project ?? "0000000000000000000000000000abcd")
        : undefined;

      const results: Record<string, unknown>[] = [];
      for (const url of urls) {
        const result = await probeEndpoint(url, 8_000, {
          ...(probe ? { method: probe.method, path: probePath } : {}),
        });
        results.push({
          url: result.url,
          service: requested?.label ?? "",
          reachable: result.reachable ? "yes" : "no",
          codearts: result.looksLikeCodearts ? "yes" : "",
          status: result.status ?? "",
          detail: result.detail,
        });
      }
      emit(command, results, {
        columns: ["url", "service", "reachable", "status", "codearts", "detail"],
        footnote: requested
          ? `Probed ${requested.label}'s documented path. A host answering 401/403 serves this service; 404/APIGW.0101 here means this path is not published on it.`
          : "Without --service this probes one generic path, which some deployments do not publish; prefer `codearts endpoint discover` for endpoint decisions.",
      });
    })
  );

// ── endpoint ────────────────────────────────────────────────────────────────

const endpoint = program
  .command("endpoint")
  .description("Discover and manage the per-service API endpoints of your deployment");

endpoint
  .command("list")
  .description("Show the endpoint each service will use")
  .action(
    action(async (options: unknown, command: Command) => {
      void options;
      const config = await readConfig();
      const rows = loadCatalog().services.map((service) => ({
        service: service.label,
        endpoint: config?.endpoints?.[service.service] ?? service.service,
        source: config?.endpoints?.[service.service] ? "override" : "gateway",
      }));
      emit(command, rows, {
        columns: ["service", "endpoint", "source"],
        footnote:
          "`override` comes from the per-service endpoint map; everything else goes to the configured gateway.",
      });
    })
  );

endpoint
  .command("discover")
  .description("Probe the deployment for the host that serves each service")
  .option("--region <region>", "region or region0_id, e.g. cn-north-4")
  .option("--domain <domain>", "deployment domain, e.g. example.com")
  .option("--service <service>", "limit discovery to one service")
  .option("--timeout <seconds>", "per-candidate timeout", "6")
  .option("--write", "save the discovered endpoints to the configuration")
  .action(
    action(async (options: Record<string, unknown>, command: Command) => {
      const config = await readConfig();
      const region = (options.region as string | undefined) ?? config?.region;
      const domain = normaliseDomain(
        (options.domain as string | undefined) ?? config?.deploymentDomain
      );
      if (!region || !domain) {
        throw new PluginError(
          "Endpoint discovery needs a region and a domain.\n" +
            "Pass them explicitly, for example:\n" +
            "  codearts endpoint discover --region <region0_id> --domain <domain>\n" +
            "or save them with `codearts config --ui`.",
          "CONFIG_INVALID"
        );
      }
      const globals = command.optsWithGlobals() as { project?: string };
      // Only used to build a realistic probe path; discovery does not need a
      // project that actually exists.
      const projectId = globals.project ?? "0000000000000000000000000000abcd";

      const results = await discoverEndpoints({
        region,
        domain,
        projectId,
        services: options.service ? [String(options.service)] : undefined,
        timeoutMs: Number(options.timeout ?? 6) * 1000,
      });

      emit(
        command,
        results.map((result) => ({
          service: result.label,
          endpoint: result.endpoint ?? "(not found)",
          detail: result.endpoint ? "serves this service" : result.detail,
        })),
        { columns: ["service", "endpoint", "detail"] }
      );

      const found = results.filter((result) => result.endpoint);
      if (options.write === true && found.length > 0) {
        const endpoints = { ...(config?.endpoints ?? {}) };
        for (const result of found) endpoints[result.service] = result.endpoint as string;
        await updateConfig({ endpoints, deploymentDomain: domain, region });
        process.stdout.write(`\nSaved ${found.length} endpoint(s) to the configuration.\n`);
      } else if (options.write === true) {
        process.stderr.write("\nNothing to save: no endpoint answered.\n");
      } else if (found.length > 0) {
        process.stdout.write("\nRe-run with --write to save these endpoints.\n");
      }
    })
  );

endpoint
  .command("set")
  .argument("<service>", "service flag or label, e.g. pipeline")
  .argument("<url>", "endpoint origin, e.g. https://codeartsrepo.example.com")
  .description("Pin one service to a specific endpoint")
  .action(
    action(async (serviceRef: string, url: string, options: unknown, command: Command) => {
      void options;
      const service = resolveService(serviceRef);
      if (!service) {
        throw new PluginError(
          `Unknown service "${serviceRef}".\nAvailable: ${loadCatalog()
            .services.map((entry) => entry.label)
            .join(", ")}`,
          "CONFIG_INVALID"
        );
      }
      const config = await readConfig();
      const endpoints = { ...(config?.endpoints ?? {}), [service.service]: url };
      await updateConfig({ endpoints });
      process.stdout.write(`${service.label} -> ${url}\n`);
    })
  );

endpoint
  .command("clear")
  .argument("[service]", "service flag or label; omit to clear every override")
  .description("Remove a per-service endpoint override")
  .action(
    action(async (serviceRef: string | undefined, options: unknown, command: Command) => {
      void options;
      const config = await readConfig();
      if (!serviceRef) {
        await updateConfig({ endpoints: {} });
        process.stdout.write("Cleared every endpoint override.\n");
        return;
      }
      const service = resolveService(serviceRef);
      const endpoints = { ...(config?.endpoints ?? {}) };
      if (service) delete endpoints[service.service];
      await updateConfig({ endpoints });
      process.stdout.write("Cleared.\n");
    })
  );

/** Accept `https://example.com`, `example.com/` and `example.com` alike. */
function normaliseDomain(value: string | undefined): string | undefined {
  const raw = (value ?? "").trim();
  if (!raw) return undefined;
  return raw
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/^\.+/, "");
}

// ── services ────────────────────────────────────────────────────────────────

program
  .command("services")
  .description("List the CodeArts services covered by this CLI")
  .action(
    action(async (options: unknown, command: Command) => {
      void options;
      const catalog = loadCatalog();
      const rows = catalog.services.map((service) => ({
        label: service.label,
        service: service.service,
        name: service.serviceName,
        operations: service.operationCount,
      }));
      emit(command, rows, { columns: ["label", "service", "name", "operations"] });
    })
  );

// ── project ─────────────────────────────────────────────────────────────────

const project = program.command("project").description("Discover and select the CodeArts project");

project
  .command("list")
  .description("List every CodeArts project visible to the credentials")
  .action(
    action(async (options: unknown, command: Command) => {
      void options;
      const client: CodeartsClient = await createClient(command);
      const projects = await client.projects();
      emit(command, projects, { columns: ["identifier", "name"] });
    })
  );

project
  .command("current")
  .description("Explain which project this command would use")
  .action(
    action(async (options: unknown, command: Command) => {
      void options;
      const selected = (command.optsWithGlobals() as { project?: string }).project;
      if (selected) {
        process.stdout.write(`--project ${selected}\n`);
        return;
      }
      const client = await createClient(command);
      const projects = await client.projects();
      if (projects.length === 1) {
        process.stdout.write(
          `${projects[0].identifier}  ${projects[0].name}  (the only visible project)\n`
        );
        return;
      }
      process.stdout.write(
        "No project selected, and no default is stored — pick one per command:\n" +
          projects.map((entry) => `  --project ${entry.name}   (${entry.identifier})`).join("\n") +
          "\n"
      );
    })
  );

// ── api ─────────────────────────────────────────────────────────────────────

const api = program
  .command("api")
  .description("Explore and call any documented CodeArts API operation");

api
  .command("list")
  .argument("[service]", "service flag, label or name, e.g. pipeline")
  .description("List catalog operations")
  .option("--search <keyword>", "match name, id, path or group")
  .option("--method <method>", "filter by HTTP method")
  .option("--include-legacy", "include operations the documentation marks as outdated")
  .option("--all", "do not truncate the result")
  .action(
    action(
      async (serviceRef: string | undefined, options: Record<string, unknown>, command: Command) => {
        const service = serviceRef ? resolveService(serviceRef) : undefined;
        if (serviceRef && !service) {
          const catalog = loadCatalog();
          throw new PluginError(
            `Unknown service "${serviceRef}".\nAvailable services:\n` +
              catalog.services.map((entry) => `  ${entry.label}  (${entry.service})`).join("\n"),
            "CONFIG_INVALID"
          );
        }
        const operations = searchOperations({
          service: service?.service,
          keyword: options.search as string | undefined,
          method: options.method as string | undefined,
          includeLegacy: options.includeLegacy === true,
          limit: options.all ? Number.MAX_SAFE_INTEGER : 60,
        });
        const rows = operations.map((operation) => ({
          id: operation.id,
          method: operation.method,
          path: operation.path,
          name: operation.name,
          group: operation.group,
        }));
        emit(command, rows, { columns: ["id", "method", "path", "name"] });
        if (rows.length === 60) {
          process.stderr.write("Showing the first 60 matches. Narrow with --search or add --all.\n");
        }
      }
    )
  );

api
  .command("show")
  .argument("<operation>", "operation id, page name, doc URL or Chinese operation name")
  .description("Show an operation's method, path and parameters")
  .action(
    action(async (reference: string, options: unknown, command: Command) => {
      void options;
      const operation = requireOperation(reference);
      const { format } = command.optsWithGlobals() as { format?: OutputFormat };
      if (format === "json") {
        process.stdout.write(`${JSON.stringify(operation, null, 2)}\n`);
        return;
      }
      process.stdout.write(renderOperation(operation));
    })
  );

api
  .command("call")
  .argument("<operation>", "operation id, page name, doc URL or Chinese operation name")
  .description("Call an operation, routing --param values by the catalog")
  .option("--param <name=value>", "path, query, header or body parameter (repeatable)", collectFields, [])
  .option("--path <name=value>", "force a path parameter (repeatable)", collectFields, [])
  .option("--query <name=value>", "force a query parameter (repeatable)", collectFields, [])
  .option("--header <name=value>", "force a request header (repeatable)", collectFields, [])
  .option("--body <json>", "full request body as JSON, or @path to read a file")
  .option("--body-file <path>", "read the request body from a file")
  .action(
    action(async (reference: string, options: Record<string, unknown>, command: Command) => {
      const operation = requireOperation(reference);
      const client = await createClient(command);
      const request = buildOperationRequest(operation, options);

      const response = await client.request({
        service: operation.service,
        method: operation.method,
        path: operation.path,
        ...(Object.keys(request.pathParams).length > 0 ? { pathParams: request.pathParams } : {}),
        query: request.query,
        ...(request.body !== undefined ? { body: request.body } : {}),
        ...(Object.keys(request.headers).length > 0 ? { headers: request.headers } : {}),
      });

      if (client.ctx.dryRun) return;
      note(command, `${renderPreview(response.preview)}\n`);
      emit(command, response.body);
    })
  );

function requireOperation(reference: string): CatalogOperation {
  const lookup = resolveOperation(reference);
  if (lookup.kind === "found") return lookup.operation;
  if (lookup.kind === "ambiguous") {
    throw new PluginError(
      `"${reference}" matches several operations; use the full id:\n` +
        lookup.candidates
          .map(
            (operation) =>
              `  ${operation.id}  ${operation.name}  ${operation.method} ${operation.path}`
          )
          .join("\n"),
      "CONFIG_INVALID"
    );
  }
  const catalog = loadCatalog();
  throw new PluginError(
    `No operation matches "${reference}".\n` +
      (lookup.suggestions.length > 0
        ? `Closest matches:\n${lookup.suggestions
            .map((operation) => `  ${operation.id}  ${operation.name}`)
            .join("\n")}`
        : `Browse operations with: codearts api list <service>\nServices: ${catalog.services
            .map((entry) => entry.label)
            .join(", ")}`),
    "CONFIG_INVALID"
  );
}

interface BuiltRequest {
  pathParams: Record<string, string>;
  query: Record<string, QueryValue>;
  body?: Record<string, unknown> | string;
  headers: Record<string, string>;
}

/**
 * Route CLI parameters onto the operation using the catalog as ground truth.
 * `--param` is guarded (unknown names fail with the valid list); `--query`,
 * `--body` and `--header` stay explicit escape hatches for undocumented fields.
 */
function buildOperationRequest(
  operation: CatalogOperation,
  options: Record<string, unknown>
): BuiltRequest {
  const pathValues = parseKeyValues(options.path as string[], "--path");
  const queryValues: Record<string, unknown> = parseKeyValues(options.query as string[], "--query");
  const headers = parseKeyValues(options.header as string[], "--header");
  const params = parseKeyValues(options.param as string[], "--param");

  const pathNames = new Set(operation.pathParams.map((param) => param.name));
  const queryNames = new Map(operation.queryParams.map((param) => [param.name, param.type]));
  const bodyNames = new Map(operation.bodyParams.map((param) => [param.name, param.type]));
  const nestedNames = new Set(
    Object.values(operation.bodyObjects ?? {}).flatMap((fields) => fields.map((field) => field.name))
  );

  const body: Record<string, unknown> = {};

  for (const [name, value] of Object.entries(params)) {
    if (pathNames.has(name)) {
      pathValues[name] = value;
      continue;
    }
    if (queryNames.has(name)) {
      queryValues[name] = coerceValue(value, queryNames.get(name));
      continue;
    }
    if (bodyNames.has(name)) {
      body[name] = coerceValue(value, bodyNames.get(name));
      continue;
    }
    if (name.includes(".") || name.includes("[")) {
      setDeep(body, name, value);
      continue;
    }
    if (nestedNames.has(name) && operation.bodyObjects) {
      let placed = false;
      for (const [objectName, fields] of Object.entries(operation.bodyObjects)) {
        const field = fields.find((entry) => entry.name === name);
        if (!field) continue;
        const existing = isRecord(body[objectName])
          ? (body[objectName] as Record<string, unknown>)
          : {};
        body[objectName] = { ...existing, [name]: coerceValue(value, field.type) };
        placed = true;
      }
      if (placed) continue;
    }
    throw new PluginError(unknownParamMessage(operation, name), "CONFIG_INVALID");
  }

  const explicitBody = readExplicitBody(options);
  const finalBody =
    explicitBody !== undefined ? explicitBody : Object.keys(body).length > 0 ? body : undefined;

  if (operation.method !== "GET" && operation.method !== "DELETE" && isRecord(finalBody)) {
    const missing = operation.bodyParams
      .filter((param) => param.required && !(param.name in finalBody))
      .map((param) => param.name);
    if (missing.length > 0) {
      process.stderr.write(
        `Note: the documentation marks these body parameters as required: ${missing.join(", ")}\n`
      );
    }
  }

  // Fail early with the full missing list rather than one placeholder at a
  // time. Project placeholders are exempt: the client fills them from
  // `--project`, so `api call` works the same way scenario commands do.
  const projectPlaceholders = new Set(["project_id", "projectId", "project_uuid"]);
  const missing = operation.pathParams
    .filter(
      (param) =>
        param.required && !pathValues[param.name] && !projectPlaceholders.has(param.name)
    )
    .map((param) => param.name);
  if (missing.length > 0) {
    throw new PluginError(
      `Missing path parameter${missing.length > 1 ? "s" : ""} for ${operation.id}: ${missing.join(", ")}` +
        `\nPass ${missing.map((name) => `--param ${name}=<value>`).join(" ")}`,
      "CONFIG_INVALID"
    );
  }

  return {
    pathParams: pathValues,
    query: toQuery(queryValues),
    ...(finalBody !== undefined ? { body: finalBody } : {}),
    headers,
  };
}

function readExplicitBody(
  options: Record<string, unknown>
): Record<string, unknown> | string | undefined {
  const file = options.bodyFile as string | undefined;
  if (file) return readFileSync(file, "utf8");
  const raw = options.body as string | undefined;
  if (raw === undefined) return undefined;
  if (raw.startsWith("@")) return readFileSync(raw.slice(1), "utf8");
  return raw;
}

function unknownParamMessage(operation: CatalogOperation, name: string): string {
  const pathNames = operation.pathParams.map((param) => param.name);
  const queryNames = operation.queryParams.map((param) => param.name);
  const bodyNames = operation.bodyParams.map((param) => param.name);
  const suggestions = [...pathNames, ...queryNames, ...bodyNames].filter(
    (candidate) => candidate.includes(name) || name.includes(candidate)
  );

  return [
    `Unknown parameter "${name}" for ${operation.id}.`,
    `  path:  ${pathNames.join(", ") || "(none)"}`,
    `  query: ${queryNames.join(", ") || "(none)"}`,
    `  body:  ${bodyNames.join(", ") || "(none)"}`,
    ...(suggestions.length > 0 ? [`Did you mean: ${suggestions.join(", ")}`] : []),
    `Inspect with: codearts api show ${operation.id}`,
    `Parameters the documentation omits can still be passed with --query or --body.`,
  ].join("\n");
}

interface CatalogParamLike {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

function renderOperation(operation: CatalogOperation): string {
  const lines: string[] = [];
  lines.push(`${operation.name}  (${operation.id})`);
  lines.push(`${operation.method} ${operation.path}`);
  if (operation.legacy) {
    lines.push("Documented as outdated; prefer a newer operation when one exists.");
  }
  lines.push(`Service: ${operation.serviceName} — ${operation.group}`);
  lines.push(`Docs: ${docUrl(operation)}`);

  const section = (title: string, params: CatalogParamLike[]): void => {
    lines.push("", `${title}:`);
    if (params.length === 0) {
      lines.push("  (none)");
      return;
    }
    for (const param of params) {
      const flags = [param.type, param.required ? "required" : "optional"]
        .filter(Boolean)
        .join(", ");
      lines.push(`  ${param.name}  (${flags})${param.description ? ` — ${param.description}` : ""}`);
    }
  };

  section("Path parameters", operation.pathParams);
  section("Query parameters", operation.queryParams);
  section("Body parameters", operation.bodyParams);
  if (operation.headerParams.length > 0) section("Additional headers", operation.headerParams);

  const objects = Object.entries(operation.bodyObjects ?? {});
  if (objects.length > 0) {
    lines.push("", "Nested body objects (use --param <object>.<field>=<value> or --body):");
    for (const [name, fields] of objects) {
      lines.push(`  ${name}: ${fields.map((field) => field.name).join(", ")}`);
    }
  }

  const example = [
    "codearts api call",
    operation.id,
    ...operation.pathParams
      .filter((param) => param.required)
      .map((param) => `--param ${param.name}=<value>`),
  ].join(" ");
  lines.push("", "Example:", `  ${example}`);
  return `${lines.join("\n")}\n`;
}

// ── Scenario commands ───────────────────────────────────────────────────────

registerScenarios(program);

program.parseAsync(process.argv).catch((error) => {
  process.stderr.write(`${(error as Error).message}\n`);
  process.exit(1);
});

export { program, asRows, valueAtPath, pickPaths, renderValue };
