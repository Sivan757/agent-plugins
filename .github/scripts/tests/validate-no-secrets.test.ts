import { describe, expect, test } from "bun:test";

import {
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
    // Mirrors the escaped form used in the temu-dev reference mirror.
    const line = `${HEX_SECRET}access\\_token${TOKEN_LIKE}app\\_key${HEX_SECRET_ALT}data\\_typeJSON`;
    const findings = scanText("src/demo/references/signing.md", line);
    expect(rules(findings)).toContain("keyed-entropy");
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
    expect(isExcludedPath("src/demo/node_modules/lib/index.js")).toBe(true);
    expect(isExcludedPath("plugins/prompt-forge/skills/prompt-forge/data/prompts.jsonl")).toBe(true);
    expect(isExcludedPath("plugins/mysql/dist/bundle.mjs")).toBe(true);
  });

  test("keeps human-authored surfaces in scope", () => {
    expect(isExcludedPath("plugins/ecommerce-expert/skills/temu-dev/SKILL.md")).toBe(false);
    expect(isExcludedPath("src/mysql/plugin.config.ts")).toBe(false);
    expect(isScannedFile("docs/superpowers/evals/report.md")).toBe(true);
    expect(isScannedFile("src/config-center/package.json")).toBe(true);
    expect(isScannedFile("assets/logo.png")).toBe(false);
  });
});
