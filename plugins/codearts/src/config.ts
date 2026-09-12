//
// config.ts — credentials and endpoint configuration for the codearts CLI.
//
// Values live in the shared config center at
// `~/.cache/agent-plugins/codearts/config.json`. Nothing in this module ever
// prints a secret: use `redactConfig` for any human- or agent-facing summary.

import {
  PluginError,
  assessCredentials,
  configPath,
  describeSecret,
  loadConfig,
  requireConfigWithSetup,
  saveConfig,
} from "@agent-plugins/config-center";
import type { ConfigUIOptions, SecretExpectation } from "@agent-plugins/config-center";
import { CONFIG_UI, REASON_NEEDS_CONFIG } from "./config-ui.js";

export type AuthType = "aksk" | "token";

export interface CodeartsConfig extends Record<string, unknown> {
  /** Base URL shared by every CodeArts service, e.g. `http://10.0.0.1:8099`. */
  gateway: string;
  /** `aksk` signs every request; `token` reuses an IAM project token. */
  authType: AuthType;
  accessKeyId?: string;
  accessKeySecret?: string;
  /** Account name that owns the IAM user; required for token auth. */
  domain?: string;
  username?: string;
  password?: string;
  /** IAM endpoint used to exchange credentials for a project token. */
  iamEndpoint?: string;
  region?: string;
  /**
   * Project id the API gateway authenticates against (`X-Project-Id`).
   *
   * On a private cloud the gateway scopes the IAM token exchange by a project,
   * and that IAM project is not the same identifier as a CodeArts project.
   * Leave empty when the deployment uses one id for both.
   */
  authProjectId?: string;
  /** Account (tenant) id, required by a few Artifact paths. */
  tenantId?: string;
  /**
   * Deployment domain used when discovering per-service endpoints, e.g.
   * `ai-huadu.com` for a Huawei Cloud Stack install. Private deployments serve
   * each CodeArts service from its own host, so the region alone is not enough.
   */
  deploymentDomain?: string;
  /**
   * A ready-made X-Auth-Token. Some private deployments front CodeArts with an
   * API gateway that only accepts IAM tokens and do not expose the IAM token
   * API, so a pasted token is the only workable credential.
   */
  token?: string;
  /** Per-service endpoint overrides, keyed by service flag. */
  endpoints?: Record<string, string>;
  /** Request timeout in milliseconds. */
  timeoutMs?: number;
  /** Skip TLS certificate verification (private clouds with an internal CA). */
  insecure?: boolean;
}

export const DEFAULT_TIMEOUT_MS = 60_000;

/** Cache-directory name; also the key credentials are verified under. */
export const CODEARTS_PLUGIN_NAME = "codearts";

export function codeartsConfigPath(): string {
  return configPath(CODEARTS_PLUGIN_NAME);
}

/**
 * A config is usable when requests have somewhere to go and the selected auth
 * mode is satisfied. Somewhere to go means either a shared gateway or at least
 * one per-service endpoint: private deployments frequently have no single
 * gateway and serve each CodeArts service from its own host.
 */
export function isConfigComplete(config: CodeartsConfig): boolean {
  const hasGateway = Boolean(String(config.gateway ?? "").trim());
  const hasServiceEndpoints = Object.keys(config.endpoints ?? {}).length > 0;
  if (!hasGateway && !hasServiceEndpoints) return false;
  if (config.authType === "token") {
    // A pre-issued token needs nothing else; otherwise IAM must be reachable.
    if (String(config.token ?? "").trim()) return true;
    return Boolean(
      String(config.username ?? "").trim() &&
        String(config.password ?? "").trim() &&
        String(config.domain ?? "").trim() &&
        String(config.iamEndpoint ?? "").trim()
    );
  }
  return Boolean(
    String(config.accessKeyId ?? "").trim() && String(config.accessKeySecret ?? "").trim()
  );
}



/** Load configuration, opening the browser setup form when it is missing. */
export async function requireConfig(): Promise<CodeartsConfig> {
  const config = await requireConfigWithSetup<CodeartsConfig>("codearts", {
    ...CONFIG_UI,
    // Completeness is a config-domain rule shared with the CLI, so it is applied
    // here rather than baked into the form's data module.
    validate: (candidate) => !isConfigComplete(candidate as CodeartsConfig),
  });
  if (!isConfigComplete(config)) {
    throw new PluginError(
      `CodeArts configuration is incomplete. Run: codearts config --ui`,
      "CONFIG_INVALID"
    );
  }
  return config;
}

/** Read configuration without triggering the setup form. */
export async function readConfig(): Promise<CodeartsConfig | null> {
  return loadConfig<CodeartsConfig>("codearts");
}

/** Persist a partial configuration, merged over the existing file. */
export async function updateConfig(patch: Partial<CodeartsConfig>): Promise<void> {
  await saveConfig("codearts", patch as Record<string, unknown>, { merge: true });
}

// ── Credentials, described without being read ───────────────────────────────

/**
 * Shapes a Huawei Cloud access key pair takes. These are used only to judge a
 * stored value ("this is not 40 characters, so it was probably truncated"),
 * never to accept or reject a request.
 */
export const AK_EXPECTATION: SecretExpectation = {
  pattern: /^[A-Z0-9]{20}$/,
  description: "20 characters, uppercase letters and digits",
};

export const SK_EXPECTATION: SecretExpectation = {
  pattern: /^[A-Za-z0-9]{40}$/,
  description: "40 letters and digits",
};

/** One secret field of the configuration, with the shape it should have. */
export interface CredentialField {
  key: string;
  value: unknown;
  expectation: SecretExpectation;
}

/**
 * The secret fields the active authentication mode actually uses.
 *
 * A pasted X-Auth-Token is deliberately absent: it expires by design, so
 * treating a new token as changed credentials would be noise rather than
 * information. Only an access key pair is expected to stay the same.
 */
export function credentialFields(config: CodeartsConfig): CredentialField[] {
  if (config.authType === "token") {
    return [
      { key: "password", value: config.password, expectation: {} },
      { key: "token", value: config.token, expectation: {} },
    ].filter((field) => String(field.value ?? "").trim() !== "");
  }
  return [
    { key: "accessKeyId", value: config.accessKeyId, expectation: AK_EXPECTATION },
    { key: "accessKeySecret", value: config.accessKeySecret, expectation: SK_EXPECTATION },
  ];
}

/**
 * The values that identify "these credentials" for change detection. Empty for
 * the modes where a change is expected rather than suspicious.
 */
export function credentialValues(config: CodeartsConfig): string[] {
  if (config.authType === "token") return [];
  return [config.accessKeyId ?? "", config.accessKeySecret ?? ""];
}

/**
 * Remove any configured secret that upstream text echoed back.
 *
 * A gateway report is not trusted to be discreet: an unknown access key
 * produces `... ak <AK> not exist`, which would put the AK into an error
 * message, a log and an agent's context. Scrubbing by value is precise — only
 * strings the user actually configured are replaced.
 */
export function redactEchoedSecrets(text: string, config: CodeartsConfig): string {
  let result = text;
  for (const field of credentialFields(config)) {
    const secret = String(field.value ?? "");
    // Short values would match unrelated text; they are also not secrets worth
    // echoing, since nothing here accepts a credential that short.
    if (secret.length >= 8) result = result.split(secret).join("<redacted>");
  }
  return result;
}

/**
 * The credential facts an agent can act on, as sentences — whether each field
 * is present and shaped correctly, and whether these exact credentials have
 * ever been accepted by this deployment.
 *
 * Shared by the 401/403 path and `codearts doctor` so the two never disagree.
 */
export function credentialDiagnosis(config: CodeartsConfig): string[] {
  const lines: string[] = [];

  for (const field of credentialFields(config)) {
    const report = describeSecret(field.value, field.expectation);
    if (report.shape === "unset") {
      lines.push(`${field.key} is not set.`);
    } else if (report.shape === "unexpected") {
      lines.push(
        `${field.key} does not look like a valid value: ${report.shapeHint}.`,
        `Re-copy it from the console; a truncated paste is the usual cause.`
      );
    }
  }

  lines.push(assessCredentials(CODEARTS_PLUGIN_NAME, credentialValues(config)).summary);
  return lines;
}

