//
// http.ts — request execution for the CodeArts CLI.
//
// Owns endpoint resolution, authentication (AK/SK signature or project token),
// transport, and the actionable shape of failures. Every failure message here
// is written for an agent that has to decide what to do next.

import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { PluginError } from "@agent-plugins/config-center";
import type { AuthType, CodeartsConfig } from "./config.js";
import { DEFAULT_TIMEOUT_MS, credentialDiagnosis, redactEchoedSecrets } from "./config.js";
import { signRequest, type QueryValue } from "./sign.js";

export type { QueryValue };

export interface ApiRequestSpec {
  /** Catalog service flag, used only to pick an endpoint override. */
  service: string;
  method: string;
  /** Resource path; may still contain `{placeholder}` segments. */
  path: string;
  /** Values substituted into `{placeholder}` path segments. */
  pathParams?: Record<string, string>;
  query?: Record<string, QueryValue>;
  /** Object bodies are JSON-encoded; strings and buffers are sent verbatim. */
  body?: Record<string, unknown> | string | Buffer;
  headers?: Record<string, string>;
  /** Project id used for `X-Project-Id` and token scoping. */
  projectId?: string;
  /** Sign the request but do not send it. */
  dryRun?: boolean;
}

/** Thrown to unwind out of a command after `--dry-run` has printed the request. */
export class DryRunSignal extends Error {
  constructor() {
    super("dry run");
    this.name = "DryRunSignal";
  }
}

export interface ApiRequestPreview {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

export interface ApiResponse {
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  /** Parsed JSON when the response is JSON, otherwise the raw text. */
  body: unknown;
  /** Response decoded as UTF-8; lossy for binary payloads. */
  raw: string;
  /** Response bytes, for file downloads. */
  buffer: Buffer;
  preview: ApiRequestPreview;
}

/** The origin that serves a service, honouring per-service overrides. */
export function resolveEndpoint(config: CodeartsConfig, service: string): string {
  const override = config.endpoints?.[service];
  const endpoint = (override ?? config.gateway ?? "").trim();
  if (!endpoint) {
    throw new PluginError(
      "No CodeArts endpoint configured.\n" +
        "Set a gateway with: codearts config --ui\n" +
        "Or discover per-service hosts with: codearts endpoint discover --region <region> --domain <domain> --write",
      "CONFIG_INVALID"
    );
  }
  try {
    const parsed = new URL(endpoint);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    throw new PluginError(
      `Configured endpoint is not a valid URL: ${endpoint}\nFix it with: codearts config --ui`,
      "CONFIG_INVALID"
    );
  }
}

/** Replace `{placeholders}`; report every unresolved one at once. */
export function buildPath(template: string, values: Record<string, string>): string {
  const missing: string[] = [];
  const path = template.replace(/\{([^}]+)\}/g, (_, name: string) => {
    const value = values[name];
    if (value === undefined || value === "") {
      missing.push(name);
      return `{${name}}`;
    }
    return encodeURIComponent(value);
  });
  if (missing.length > 0) {
    throw new PluginError(
      `Missing path parameter${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}\n` +
        `Pass ${missing.map((name) => `--param ${name}=<value>`).join(" ")}`,
      "QUERY_FAILED"
    );
  }
  return path;
}

function encodeQuery(query: Record<string, QueryValue>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
    }
  }
  return parts.join("&");
}

function serializeBody(body: ApiRequestSpec["body"]): Buffer | undefined {
  if (body === undefined) return undefined;
  if (Buffer.isBuffer(body)) return body;
  if (typeof body === "string") return Buffer.from(body, "utf8");
  return Buffer.from(JSON.stringify(body), "utf8");
}

// ── Token authentication ────────────────────────────────────────────────────

let cachedToken: { token: string; endpoint: string; expiresAt: number } | null = null;

/** Exchange IAM credentials for a project-scoped token (valid ~24h). */
export async function fetchProjectToken(
  config: CodeartsConfig,
  projectId?: string
): Promise<string> {
  const iamEndpoint = (config.iamEndpoint ?? "").trim();
  if (!iamEndpoint) {
    throw new PluginError(
      "Token authentication needs an IAM endpoint.\nSet it with: codearts config --ui",
      "CONFIG_INVALID"
    );
  }
  const scope = projectId ?? config.projectId;
  if (!scope) {
    throw new PluginError(
      "Token authentication needs a project id. Pass --project <id> or run: codearts project use <id>",
      "CONFIG_INVALID"
    );
  }

  const cacheKey = `${iamEndpoint}|${scope}`;
  if (cachedToken && cachedToken.endpoint === cacheKey && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const payload = {
    auth: {
      identity: {
        methods: ["password"],
        password: {
          user: {
            name: config.username,
            password: config.password,
            domain: { name: config.domain },
          },
        },
      },
      scope: { project: { id: scope } },
    },
  };

  const result = await transport(
    {
      method: "POST",
      url: `${iamEndpoint.replace(/\/$/, "")}/v3/auth/tokens`,
      headers: { "content-type": "application/json" },
      body: Buffer.from(JSON.stringify(payload), "utf8"),
    },
    { timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS, insecure: config.insecure === true }
  );

  const token = result.headers["x-subject-token"];
  if (!result.ok || !token) {
    throw new PluginError(
      `IAM did not return a project token (HTTP ${result.status}).\n` +
        `Check the IAM endpoint, account name, username and password.\n` +
        `Response: ${redactEchoedSecrets(truncate(result.raw, 400), config)}`,
      "AUTH_FAILED"
    );
  }

  cachedToken = {
    token,
    endpoint: cacheKey,
    // Refresh well before the documented 24h lifetime.
    expiresAt: Date.now() + 20 * 60 * 60 * 1000,
  };
  return token;
}

// ── Transport ───────────────────────────────────────────────────────────────

interface TransportRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: Buffer;
}

interface TransportOptions {
  timeoutMs: number;
  insecure: boolean;
}

interface TransportResponse {
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  raw: string;
  buffer: Buffer;
}

function transport(
  spec: TransportRequest,
  options: TransportOptions
): Promise<TransportResponse> {
  return new Promise((resolve, reject) => {
    const url = new URL(spec.url);
    const send = url.protocol === "https:" ? httpsRequest : httpRequest;

    const req = send(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: spec.method,
        headers: spec.headers,
        ...(url.protocol === "https:" ? { rejectUnauthorized: !options.insecure } : {}),
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          const headers: Record<string, string> = {};
          for (const [name, value] of Object.entries(res.headers)) {
            headers[name.toLowerCase()] = Array.isArray(value) ? value.join(", ") : String(value ?? "");
          }
          const status = res.statusCode ?? 0;
          resolve({
            status,
            ok: status >= 200 && status < 300,
            headers,
            raw: buffer.toString("utf8"),
            buffer,
          });
        });
      }
    );

    req.setTimeout(options.timeoutMs, () => {
      req.destroy(
        new Error(
          `Request timed out after ${options.timeoutMs}ms. Check the gateway address and network reachability.`
        )
      );
    });
    req.on("error", reject);
    if (spec.body && spec.body.length > 0) req.write(spec.body);
    req.end();
  });
}

// ── Execution ───────────────────────────────────────────────────────────────

export interface ExecuteOptions {
  /** Extra headers applied before signing. */
  extraHeaders?: Record<string, string>;
}

/**
 * Execute a CodeArts API request. Returns the parsed response, or throws a
 * PluginError carrying the status, upstream error code, and corrective hints.
 */
export async function execute(
  config: CodeartsConfig,
  spec: ApiRequestSpec,
  options: ExecuteOptions = {}
): Promise<ApiResponse> {
  const endpoint = resolveEndpoint(config, spec.service);
  const path = spec.pathParams ? buildPath(spec.path, spec.pathParams) : spec.path;
  const query = spec.query ?? {};
  const queryString = encodeQuery(query);
  const url = `${endpoint}${path}${queryString ? `?${queryString}` : ""}`;
  const body = serializeBody(spec.body);

  const headers: Record<string, string> = {
    accept: "application/json",
    ...(body ? { "content-type": "application/json" } : {}),
    ...(spec.headers ?? {}),
    ...(options.extraHeaders ?? {}),
  };

  // The gateway authenticates against its own project id, which on a private
  // cloud differs from the CodeArts project used in request paths.
  const scopeProjectId =
    (config.authProjectId ?? "").trim() ||
    spec.projectId ||
    spec.pathParams?.project_id ||
    spec.pathParams?.project_uuid;
  if (scopeProjectId && !headers["x-project-id"]) {
    headers["x-project-id"] = scopeProjectId;
  }

  const authType: AuthType = config.authType ?? "aksk";
  if (authType === "aksk") {
    if (!config.accessKeyId || !config.accessKeySecret) {
      throw new PluginError("AK/SK are not configured.\nSet them with: codearts config --ui", "CONFIG_INVALID");
    }
    const signed = signRequest({
      method: spec.method,
      endpoint,
      path,
      query,
      headers,
      body,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
    });
    Object.assign(headers, signed.headers);
  } else {
    // A pasted token is used as-is: some private deployments require an IAM
    // token but do not expose the IAM token API to reach the CLI.
    headers["x-auth-token"] =
      (config.token ?? "").trim() || (await fetchProjectToken(config, scopeProjectId));
  }

  const preview: ApiRequestPreview = {
    method: spec.method.toUpperCase(),
    url,
    headers: redactHeaders(headers),
    ...(body ? { body: body.toString("utf8") } : {}),
  };

  if (spec.dryRun) {
    process.stdout.write(`${formatPreview(preview)}\n`);
    throw new DryRunSignal();
  }

  let response: TransportResponse;
  try {
    response = await transport(
      { method: spec.method.toUpperCase(), url, headers, body },
      { timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS, insecure: config.insecure === true }
    );
  } catch (error) {
    throw new PluginError(
      `Request to ${endpoint} failed: ${(error as Error).message}\n` +
        `Check the gateway address, network reachability, and certificate trust (codearts config --ui).`,
      "QUERY_FAILED"
    );
  }

  const parsed = parseBody(response.raw);
  const result: ApiResponse = {
    status: response.status,
    ok: response.ok,
    headers: response.headers,
    body: parsed,
    raw: response.raw,
    buffer: response.buffer,
    preview,
  };

  if (!response.ok) throw httpError(result, config);
  return result;
}

function parseBody(raw: string): unknown {
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/** Build an actionable error for a non-2xx response. */
function httpError(response: ApiResponse, config: CodeartsConfig): PluginError {
  const payload = response.body as Record<string, unknown> | null;
  const errorCode =
    (payload && (payload.error_code ?? payload.errorCode ?? payload.code)) ?? undefined;
  const errorMsg =
    (payload && (payload.error_msg ?? payload.errorMessage ?? payload.message)) ?? undefined;

  // Upstream text can echo a submitted credential back; scrub before printing.
  const lines = [`CodeArts API request failed with HTTP ${response.status}.`];
  if (errorCode) lines.push(`error_code: ${errorCode}`);
  if (errorMsg) lines.push(`error_msg: ${redactEchoedSecrets(String(errorMsg), config)}`);
  lines.push(`request: ${response.preview.method} ${response.preview.url}`);
  if (!errorCode && !errorMsg) {
    lines.push(`response: ${redactEchoedSecrets(truncate(response.raw, 600), config)}`);
  }

  if (response.status === 401 || response.status === 403) {
    lines.push("The gateway rejected the credentials.");
    // Say what can be known without reading the key, so the next step is a
    // decision rather than another round of guessing.
    for (const line of credentialDiagnosis(config)) lines.push(`  ${line}`);
    lines.push(
      "If the shape looks right and nothing has changed, the key may lack the CodeArts permissions for this project.",
      "Confirm the credentials themselves with: codearts doctor"
    );
    return new PluginError(lines.join("\n"), "AUTH_FAILED");
  }
  if (response.status === 404) {
    lines.push(
      "A path parameter such as project_id, pipeline_id or repository_id may not exist.",
      "Confirm identifiers with the matching list command, e.g. codearts project list"
    );
  } else if (response.status === 429) {
    lines.push("Rate limited. Retry after a short wait.");
  }
  return new PluginError(lines.join("\n"), "QUERY_FAILED");
}

/** Render a request preview for `--dry-run` and verbose runs. */
export function formatPreview(preview: ApiRequestPreview): string {
  const lines = [`${preview.method} ${preview.url}`];
  for (const [name, value] of Object.entries(preview.headers)) {
    lines.push(`${name}: ${value}`);
  }
  if (preview.body) lines.push("", preview.body);
  return lines.join("\n");
}

/** Mask credential-bearing headers; signatures reveal no secret but stay hidden. */
export function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const redacted: Record<string, string> = {};
  for (const [name, value] of Object.entries(headers)) {
    const lower = name.toLowerCase();
    if (lower === "authorization" || lower === "x-auth-token" || lower === "x-subject-token") {
      redacted[name] = `<redacted:${value.length} chars>`;
    } else {
      redacted[name] = value;
    }
  }
  return redacted;
}

export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}… (${value.length - max} more characters)`;
}

// ── Endpoint probing ────────────────────────────────────────────────────────

export interface ProbeResult {
  url: string;
  /** An HTTP response came back, whatever its status. */
  reachable: boolean;
  status?: number;
  /** The host answered with a CodeArts-shaped authentication challenge. */
  looksLikeCodearts: boolean;
  /** TLS verification had to be relaxed to get this far. */
  certificateUntrusted: boolean;
  detail: string;
}

export interface ProbeOptions {
  /** HTTP method of the probe request. Default: GET. */
  method?: string;
  /** Resource path to probe. Default: the CodeArts tenant project list. */
  path?: string;
}

/**
 * Probe a candidate endpoint without credentials.
 *
 * A host that serves the probed API answers `401` with `APIGW.0301`
 * ("x-auth-token not found"); a host that does not answers `APIGW.0101`
 * ("API does not exist or has not been published"). That difference is how a
 * deployment's per-service hosts are discovered when the documentation only
 * says "ask your administrator".
 */
export async function probeEndpoint(
  candidate: string,
  timeoutMs = 8_000,
  options: ProbeOptions = {}
): Promise<ProbeResult> {
  let origin: string;
  try {
    const parsed = new URL(candidate);
    origin = `${parsed.protocol}//${parsed.host}`;
  } catch {
    return {
      url: candidate,
      reachable: false,
      looksLikeCodearts: false,
      certificateUntrusted: false,
      detail: "not a valid URL; include the scheme, for example http://10.0.0.1:8099",
    };
  }

  const method = (options.method ?? "GET").toUpperCase();
  const target = `${origin}${options.path ?? "/v1/domain/project/related"}`;
  const attempt = (insecure: boolean) =>
    transport(
      {
        method,
        url: target,
        headers: { accept: "application/json", "content-type": "application/json" },
        ...(method === "POST" || method === "PUT" || method === "PATCH"
          ? { body: Buffer.from("{}", "utf8") }
          : {}),
      },
      { timeoutMs, insecure }
    );

  try {
    const response = await attempt(false);
    return classify(response);
  } catch (error) {
    const message = (error as Error).message ?? String(error);
    if (/certificate|self.signed|unable to verify/i.test(message)) {
      try {
        const response = await attempt(true);
        return {
          ...classify(response),
          certificateUntrusted: true,
          detail: `${classify(response).detail} (TLS certificate is not trusted by this machine)`,
        };
      } catch (retryError) {
        return {
          url: origin,
          reachable: false,
          looksLikeCodearts: false,
          certificateUntrusted: true,
          detail: `TLS handshake failed: ${(retryError as Error).message}`,
        };
      }
    }
    return {
      url: origin,
      reachable: false,
      looksLikeCodearts: false,
      certificateUntrusted: false,
      detail: message,
    };
  }

  function classify(response: TransportResponse): ProbeResult {
    const looksLikeCodearts = response.status === 401 || response.status === 403;
    const body = response.raw.slice(0, 800);

    // A Huawei API gateway answers an unpublished API with its own error code,
    // which is a different signal from "some other HTTP service lives here".
    const apigwCode = body.match(/APIGW\.\d+/)?.[0];
    // Huawei consoles bounce unauthenticated callers to the SSO login page.
    const ssoShell = /cloud_route_state|authui\/login/.test(body);

    let detail: string;
    if (looksLikeCodearts) {
      detail = "reachable and asking for credentials — a CodeArts gateway responds this way";
    } else if (apigwCode) {
      detail = `Huawei API gateway reachable, but not for this probe path (${apigwCode}). A host can serve a service on other paths, so this is not proof the host is wrong — decide endpoints with \`codearts endpoint discover\``;
    } else if (ssoShell) {
      detail = "console or single-page app shell that redirects to SSO; the REST API lives on another host";
    } else if (response.status === 404) {
      detail = "reachable HTTP service, but this path is not CodeArts; check the host and any path prefix";
    } else if (response.status >= 500) {
      detail = "reachable but returning a server error";
    } else {
      detail = `reachable (HTTP ${response.status})`;
    }

    return {
      url: origin,
      reachable: true,
      status: response.status,
      looksLikeCodearts,
      certificateUntrusted: false,
      detail,
    };
  }
}

// ── Multipart ───────────────────────────────────────────────────────────────

export interface MultipartFile {
  field: string;
  filename: string;
  content: Buffer;
  contentType?: string;
}

/** Build a multipart/form-data body with a fresh boundary. */
export function buildMultipart(
  fields: Record<string, string>,
  files: MultipartFile[]
): { body: Buffer; contentType: string } {
  const boundary = `----codearts${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
  const chunks: Buffer[] = [];
  const push = (value: string) => chunks.push(Buffer.from(value, "utf8"));

  for (const [name, value] of Object.entries(fields)) {
    push(`--${boundary}\r\n`);
    push(`Content-Disposition: form-data; name="${name}"\r\n\r\n`);
    push(`${value}\r\n`);
  }
  for (const file of files) {
    push(`--${boundary}\r\n`);
    push(
      `Content-Disposition: form-data; name="${file.field}"; filename="${file.filename}"\r\n`
    );
    push(`Content-Type: ${file.contentType ?? "application/octet-stream"}\r\n\r\n`);
    chunks.push(file.content);
    push("\r\n");
  }
  push(`--${boundary}--\r\n`);

  return { body: Buffer.concat(chunks), contentType: `multipart/form-data; boundary=${boundary}` };
}
