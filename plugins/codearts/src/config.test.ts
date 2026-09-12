//
// config.test.ts — guards the browser config form against key drift.
//
// The form is a flat element map plus `children` lists; a child whose key is
// missing from `elements` simply never renders, which silently hides fields
// (the AK/SK inputs were lost this way once). These tests make that failure
// mode impossible.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { CONFIG_UI as CODEARTS_CONFIG_UI } from "./config-ui.js";
import {
  credentialDiagnosis,
  credentialValues,
  isConfigComplete,
  redactEchoedSecrets,
} from "./config.js";
import type { CodeartsConfig } from "./config.js";

interface Element {
  type: string;
  props?: Record<string, unknown> & { statePath?: string };
  children?: string[];
}

const spec = CODEARTS_CONFIG_UI.spec as unknown as {
  root: string;
  elements: Record<string, Element>;
};

test("every element references existing children", () => {
  for (const [key, element] of Object.entries(spec.elements)) {
    for (const child of element.children ?? []) {
      assert.ok(
        spec.elements[child],
        `element "${key}" lists child "${child}", which is not defined in elements`
      );
    }
  }
});

test("every element is reachable from the root", () => {
  const reachable = new Set<string>();
  const visit = (key: string): void => {
    if (reachable.has(key)) return;
    reachable.add(key);
    for (const child of spec.elements[key]?.children ?? []) visit(child);
  };
  visit(spec.root);

  const orphans = Object.keys(spec.elements).filter((key) => !reachable.has(key));
  assert.deepEqual(orphans, [], `unreachable form elements: ${orphans.join(", ")}`);
});

test("every field binds to a known configuration key", () => {
  const configKeys: Array<keyof CodeartsConfig> = [
    "gateway",
    "authType",
    "accessKeyId",
    "accessKeySecret",
    "domain",
    "username",
    "password",
    "iamEndpoint",
    "region",
    "projectId",
    "authProjectId",
    "tenantId",
    "deploymentDomain",
    "token",
    "endpoints",
    "timeoutMs",
    "insecure",
  ];

  for (const [key, element] of Object.entries(spec.elements)) {
    const statePath = element.props?.statePath;
    if (typeof statePath !== "string") continue;
    assert.ok(
      configKeys.includes(statePath as keyof CodeartsConfig),
      `element "${key}" binds to unknown config key "${statePath}"`
    );
  }
});

test("the form exposes both credential modes", () => {
  const statePaths = Object.values(spec.elements)
    .map((element) => element.props?.statePath)
    .filter((value): value is string => typeof value === "string");

  for (const required of [
    "gateway",
    "authType",
    "accessKeyId",
    "accessKeySecret",
    "username",
    "password",
    "iamEndpoint",
    "token",
    "deploymentDomain",
  ]) {
    assert.ok(statePaths.includes(required), `form is missing a field for "${required}"`);
  }
});

test("completeness requires the gateway and the selected auth mode", () => {
  const base = { gateway: "https://codearts.example.com" } as CodeartsConfig;

  assert.equal(isConfigComplete({ ...base, authType: "aksk" }), false);
  assert.equal(
    isConfigComplete({ ...base, authType: "aksk", accessKeyId: "AK", accessKeySecret: "SK" }),
    true
  );

  assert.equal(isConfigComplete({ ...base, authType: "token" }), false);
  // A pre-issued token is enough on its own.
  assert.equal(isConfigComplete({ ...base, authType: "token", token: "abc" }), true);
  assert.equal(
    isConfigComplete({
      ...base,
      authType: "token",
      username: "user",
      password: "pass",
      domain: "account",
      iamEndpoint: "https://iam.example.com",
    }),
    true
  );

  assert.equal(isConfigComplete({ ...base, authType: "aksk", accessKeyId: "", accessKeySecret: "" }), false);

  // Per-service endpoints can replace a shared gateway entirely.
  const aksk = { authType: "aksk" as const, accessKeyId: "AK", accessKeySecret: "SK" };
  assert.equal(isConfigComplete({ gateway: "", ...aksk, endpoints: {} }), false);
  assert.equal(
    isConfigComplete({ gateway: "", ...aksk, endpoints: { codeartsbuild: "https://build.example.com" } }),
    true
  );
  assert.equal(
    isConfigComplete({ ...base, ...aksk, endpoints: { codeartsbuild: "https://build.example.com" } }),
    true
  );
  assert.equal(
    isConfigComplete({ gateway: "", authType: "aksk", accessKeyId: "AK", accessKeySecret: "SK" }),
    false
  );
});

// ── Judging credentials without reading them ────────────────────────────────

const GOOD_AK = "EXAMPLEKEY0000000001";
const GOOD_SK = "skaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const akskConfig: CodeartsConfig = {
  gateway: "https://codearts.example.com",
  authType: "aksk",
  accessKeyId: GOOD_AK,
  accessKeySecret: GOOD_SK,
};

test("credentialDiagnosis names a bad field and never guesses about a good one", () => {
  const lines = credentialDiagnosis({ ...akskConfig, accessKeyId: "not-a-key" }).join("\n");
  assert.match(lines, /accessKeyId does not look like a valid value: expected 20 characters, uppercase letters and digits/);
  assert.match(lines, /Re-copy it from the console/);
  assert.equal(lines.includes("accessKeySecret does not look"), false);

  // A well-shaped pair produces no verdict at all, only the verification note.
  const clean = credentialDiagnosis(akskConfig);
  assert.equal(clean.some((line) => line.includes("does not look like")), false);
  assert.equal(clean.some((line) => line.includes("is not set")), false);
  assert.equal(clean.length, 1, "only the verification sentence should remain");
});

test("credentialDiagnosis reports unset credentials", () => {
  const lines = credentialDiagnosis({ ...akskConfig, accessKeyId: "", accessKeySecret: "" });
  assert.deepEqual(lines.slice(0, 2), ["accessKeyId is not set.", "accessKeySecret is not set."]);
});

test("token auth is judged without treating a fresh token as a changed key", () => {
  const config: CodeartsConfig = {
    gateway: "https://codearts.example.com",
    authType: "token",
    token: "abcdefghijklmnopqrstuvwxyz012345",
    iamEndpoint: "https://iam.example.com",
    password: "p".repeat(20),
  };
  assert.deepEqual(credentialValues(config), [], "a rotated token must never look like changed credentials");

  // The token and the IAM password are still diagnosed, but only in words: the
  // verdict never carries either value.
  const lines = credentialDiagnosis(config).join("\n");
  assert.equal(lines.includes(String(config.token)), false);
  assert.equal(lines.includes(String(config.password)), false);
  assert.match(lines, /not been used successfully yet|last authenticated call/);
});

test("redactEchoedSecrets removes a credential the gateway echoed back", () => {
  const echoed = `ak ${GOOD_AK} not exist; secret ${GOOD_SK} rejected`;
  const scrubbed = redactEchoedSecrets(echoed, akskConfig);
  assert.equal(scrubbed, "ak <redacted> not exist; secret <redacted> rejected");
  assert.equal(scrubbed.includes(GOOD_AK), false);
  assert.equal(scrubbed.includes(GOOD_SK), false);

  // Unrelated text and short values are left alone: only real secrets are cut.
  assert.equal(redactEchoedSecrets("apigw.0301 not found", akskConfig), "apigw.0301 not found");
  assert.equal(redactEchoedSecrets("code abc", { ...akskConfig, accessKeyId: "abc" }), "code abc");
});

test("redactEchoedSecrets scrubs a token mode password too", () => {
  const password = "sup3r-s3cret-password";
  const config: CodeartsConfig = { gateway: "", authType: "token", password, token: "t".repeat(24) };
  assert.equal(redactEchoedSecrets(`bad password ${password}`, config), "bad password <redacted>");
});
