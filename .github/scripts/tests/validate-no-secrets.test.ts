import { describe, expect, test } from "bun:test";

import {
  findAccessKeyLiteral,
  isExcludedPath,
  isScannedFile,
  previewOf,
  scanText,
  type SecretFinding,
} from "../validate-no-secrets";

// Synthetic literals shaped like the real leaked Temu credentials. Never use
// genuine secret material in tests.
const HEX_SECRET = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0";
const HEX_SECRET_ALT = "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0a1";
const TOKEN_LIKE = "t1z26vlvwq1kulyyyybkdy0bfwnlrgfls8e4ssefhxpanh1mltyodjacc";
// A Huawei access key id is 20 uppercase alphanumerics: too short for any
// entropy rule, but half of a live credential pair.
const ACCESS_KEY_LIKE = "Q7XK3M9PLW2ZR5TV8BND";

function rules(findings: SecretFinding[]): string[] {
  return findings.map(finding => finding.rule);
}

describe("secret scanner", () => {
  test("flags a keyed hex assignment", () => {
    const findings = scanText(
      "src/demo/SKILL.md",
      `app_secret = ${HEX_SECRET}\n`
    );
    expect(rules(findings)).toEqual(["keyed-entropy"]);
    expect(findings[0].line).toBe(1);
  });

  test("flags markdown-escaped canonical signing strings", () => {
    // Mirrors the escaped form used in the temu-openapi reference mirror.
    const line = `${HEX_SECRET}access\\_token${TOKEN_LIKE}app\\_key${HEX_SECRET_ALT}data\\_typeJSON`;
    const findings = scanText("src/demo/references/signing.md", line);
    expect(rules(findings)).toContain("keyed-entropy");
  });

  test("flags the accessKeyId spelling used by Huawei and AWS", () => {
    // `accessKeyId`/`accessKeySecret` were absent from the credential-field
    // pattern, so a long value beside them was never even considered.
    for (const field of ["accessKeyId", "accessKeySecret", "access_key_id", "accessKey"]) {
      const findings = scanText(`src/demo/client.ts`, `const ${field} = "${HEX_SECRET}";\n`);
      expect(findings.map(finding => finding.rule)).toContain("keyed-entropy");
    }
  });

  test("flags a bare standalone hex blob line", () => {
    const findings = scanText(
      "src/demo/references/basic.md",
      `- \`${HEX_SECRET}\`\n`
    );
    expect(rules(findings)).toEqual(["bare-secret"]);
  });

  test("passes redacted placeholder markers", () => {
    const findings = scanText(
      "src/demo/references/signing.md",
      "- app_secret = <REDACTED_APP_SECRET>\n- access_token = <REDACTED_ACCESS_TOKEN>\n"
    );
    expect(findings).toEqual([]);
  });

  test("skips lines carrying the allow marker", () => {
    const line = `token: ${HEX_SECRET} # sample fixture value, secret-scan: allow`;
    const findings = scanText("src/demo/config.yaml", line);
    expect(findings).toEqual([]);
  });

  test("ignores short or pure-numeric candidates", () => {
    const text = [
      "timestamp 1739688901 order WB2411113267800",
      "short token abc123",
      "see RFC 6749 and RFC 6750 for details",
      "",
    ].join("\n");
    const findings = scanText("src/demo/notes.md", text);
    expect(findings).toEqual([]);
  });

  test("strips benign hex carried inside URLs", () => {
    const text = [
      // Doc-site navigation codes next to an API name containing "accesstoken".
      "> **Official docs**: [bg.open.accesstoken.create](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=82674d12ebe64af2820d62ebbc2ecc16)",
      // CDN content hash in a path, on a line whose payload has redacted keys.
      '`{"app_key": "<REDACTED_APP_KEY>", "access_token": "<REDACTED_ACCESS_TOKEN>"} -> https://img.cdnfe.com/product/open/2ec3bee011324459b1e42b440201ed02-goods.jpeg`',
      "",
    ].join("\n");
    const findings = scanText("src/demo/references/mirror.md", text);
    expect(findings).toEqual([]);
  });

  test("skips a fenced block whose opening fence carries the allow marker", () => {
    const text = [
      "Walkthrough with verified sample values:",
      "```text secret-scan: allow",
      `access_token = ${TOKEN_LIKE}`,
      `app_secret = ${HEX_SECRET}`,
      "```",
      `real leak below the block: app_key = ${HEX_SECRET_ALT}`,
      "",
    ].join("\n");
    const findings = scanText("src/demo/references/walkthrough.md", text);
    expect(findings).toHaveLength(1);
    expect(rules(findings)).toEqual(["keyed-entropy"]);
    expect(findings[0].line).toBe(6);
  });

  test("reports file and line numbers across a multi-line document", () => {
    const text = ["safe line", "password: not-a-secret-value", `app_key = ${HEX_SECRET}`].join("\n");
    const findings = scanText("docs/report.md", text);
    expect(findings).toHaveLength(1);
    expect(findings[0].line).toBe(3);
    expect(findings[0].file).toBe("docs/report.md");
  });

  test("flags an access-key-shaped literal in code", () => {
    const findings = scanText("src/demo/client.ts", `const ak = "${ACCESS_KEY_LIKE}";\n`);
    expect(rules(findings)).toEqual(["ak-literal"]);
    expect(findings[0].line).toBe(1);
    // The shape is only reported, never reproduced in full.
    expect(findings[0].preview).not.toContain(ACCESS_KEY_LIKE);
  });

  test("flags an access-key literal in docs only beside a credential field", () => {
    const bare = scanText("src/demo/references/ids.md", `- orderNo: "${ACCESS_KEY_LIKE}"\n`);
    expect(bare).toEqual([]);

    const keyed = scanText("src/demo/references/auth.md", `- accessKeyId: "${ACCESS_KEY_LIKE}"\n`);
    expect(rules(keyed)).toEqual(["ak-literal"]);
  });

  test("accepts values that announce themselves as fixtures", () => {
    for (const value of [
      "EXAMPLEKEY0000000001",
      "AKIAIOSFODNN7EXAMPLE",
      "FIXTUREACCESSKEY0001",
      "TESTDUMMYACCESSKEY01",
    ]) {
      expect(findAccessKeyLiteral(`const ak = "${value}";`)).toBeNull();
    }
  });

  test("ignores unquoted, hyphenated and wrong-length access keys", () => {
    expect(findAccessKeyLiteral("const ak = Q7XK3M9PLW2ZR5TV8BND;")).toBeNull();
    expect(findAccessKeyLiteral('const ak = "Q7XK3M9PLW2ZR5TV8BN";')).toBeNull();
    expect(findAccessKeyLiteral('const ak = "SDK-HMAC-SHA256-ABCDEF";')).toBeNull();
    expect(findAccessKeyLiteral('const ak = "q7xk3m9plw2zr5tv8bnd";')).toBeNull();
  });

  test("previews never contain the full literal", () => {
    const preview = previewOf(HEX_SECRET + TOKEN_LIKE);
    expect(preview).not.toContain(HEX_SECRET);
    expect(preview).not.toContain(TOKEN_LIKE);
    expect(preview.endsWith(`<${(HEX_SECRET + TOKEN_LIKE).length} chars>`)).toBe(true);
  });
});

describe("scan scope selection", () => {
  test("excludes generated and third-party data surfaces", () => {
    expect(isExcludedPath("plugins/demo/dist/demoo.mjs")).toBe(true);
    expect(isExcludedPath("plugins/demo/node_modules/lib/index.js")).toBe(true);
    expect(isExcludedPath("plugins/prompt-forge/skills/prompt-forge/data/prompts.jsonl")).toBe(true);
    expect(isExcludedPath("plugins/database/dist/bundle.mjs")).toBe(true);
  });

  test("keeps human-authored surfaces in scope", () => {
    expect(isExcludedPath("plugins/ecommerce-expert/skills/temu-openapi/SKILL.md")).toBe(false);
    expect(isExcludedPath("plugins/database/plugin.config.ts")).toBe(false);
    expect(isScannedFile("docs/decisions/single-tree-plugin-layout.md")).toBe(true);
    expect(isScannedFile("plugins/config-center/src/config-center.test.ts")).toBe(true);
    expect(isScannedFile("assets/logo.png")).toBe(false);
  });
});
