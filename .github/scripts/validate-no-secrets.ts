#!/usr/bin/env bun
/**
 * Scans human-authored text surfaces (src/, plugins/, docs/) for credential
 * material that must never live in the repository.
 *
 * Motivation: skill-sync commits twice re-introduced plaintext Temu
 * credentials that had already been redacted (see
 * docs/superpowers/evals/2026-07-28-fresh-eyes-evaluation.md). This gate makes
 * such a regression fail validation instead of relying on reviewer vigilance.
 *
 * Rules:
 *   1. bare-secret      - a line whose whole payload is a single long
 *                         high-entropy hex blob (>= 32 chars).
 *   2. keyed-entropy    - a line that names a credential field (secret,
 *                         token, key, password...) and also carries a long
 *                         high-entropy literal.
 *
 * Known limitation (accepted until a real case justifies more): URL substrings
 * are stripped before matching. Reference mirrors are full of benign URL
 * noise (doc-site menu codes, CDN content hashes, expired presigned URLs);
 * a credential smuggled inside a URL will therefore not be caught here.
 *
 * Findings never echo the full matched literal; output shows a short prefix
 * only. Lines containing `secret-scan: allow` are skipped; when such a marker
 * sits on an opening ``` fence line, the whole fenced block is skipped (for
 * verified sample-value walkthroughs). Generated surfaces (dist bundles,
 * third-party .jsonl corpora, lockfiles) are excluded.
 *
 * Exit 0 when clean, exit 1 when any finding is reported.
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative, resolve, sep } from "path";

const ROOT = resolve(import.meta.dir, "../..");

const SCAN_ROOTS = ["src", "plugins", "docs"];
const SCANNED_EXTENSIONS = new Set([
  ".md",
  ".txt",
  ".json",
  ".yaml",
  ".yml",
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
]);
const EXCLUDED_PATH_PARTS = ["node_modules", "dist", ".build"];
const EXCLUDED_EXTENSIONS = new Set([".jsonl"]);
const ALLOW_MARKER = "secret-scan: allow";

const CREDENTIAL_KEY_PATTERN =
  /(app[\\_]?-?(?:secret|key)|access[\\_]?-?token|refresh[\\_]?-?token|api[\\_]?-?key|apikey|secret[\\_]?-?key|client[\\_]?-?secret|password|passwd|credential)/i;

// Long hex blobs: >= 32 chars, must contain at least one [a-f] letter so pure
// numeric identifiers do not trigger.
const HEX_BLOB_PATTERN = /[0-9a-f]{32,}/gi;
// Generic opaque tokens: >= 40 chars of base64/url-safe alphabet containing
// at least one letter and one digit (excludes prose and plain words).
const OPAQUE_TOKEN_PATTERN = /[A-Za-z0-9+/_=-]{40,}/g;
// Whole-payload line: optional markdown list punctuation and quotes around a
// single hex blob.
const BARE_HEX_LINE_PATTERN =
  /^(?:[-*>\s]|`|"|')*[0-9a-f]{32,}(?:`|"|'|[,;.\s]*)$/i;

export interface SecretFinding {
  file: string;
  line: number;
  rule: "bare-secret" | "keyed-entropy";
  preview: string;
}

function resolveFromRoot(path: string): string {
  // Local import alias kept explicit so ROOT stays the single anchor.
  return join(ROOT, path);
}

export function isExcludedPath(relativePath: string): boolean {
  const parts = relativePath.split(sep);
  return parts.some(
    part =>
      EXCLUDED_PATH_PARTS.includes(part) ||
      [...EXCLUDED_EXTENSIONS].some(ext => part.endsWith(ext))
  );
}

export function isScannedFile(relativePath: string): boolean {
  const extension = relativePath.slice(relativePath.lastIndexOf("."));
  return SCANNED_EXTENSIONS.has(extension);
}

/** Redacts a matched literal down to a short prefix for diagnostics. */
export function previewOf(literal: string): string {
  const head = literal.slice(0, 6);
  return `${head}…<${literal.length} chars>`;
}

function hasHexLetter(candidate: string): boolean {
  return /[a-f]/i.test(candidate);
}

function hasLetterAndDigit(candidate: string): boolean {
  return /[a-z]/i.test(candidate) && /[0-9]/.test(candidate);
}

/** Scans one file's text and returns findings with repo-relative paths. */
export function scanText(
  relativePath: string,
  text: string,
  { skipAllowMarker = true }: { skipAllowMarker?: boolean } = {}
): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const lines = text.split(/\r?\n/);
  let skipFencedBlock = false;

  for (let index = 0; index < lines.length; index++) {
    const rawLine = lines[index];
    const trimmedLine = rawLine.trim();

    if (trimmedLine.startsWith("```")) {
      if (skipFencedBlock) {
        skipFencedBlock = false;
        continue;
      }
      if (rawLine.includes(ALLOW_MARKER)) {
        skipFencedBlock = true;
      }
      continue;
    }
    if (skipFencedBlock) {
      continue;
    }

    // Normalize markdown escapes (\_ -> _) so reference-doc mirrors are
    // analyzed the way an agent would read them, then strip URLs: reference
    // mirrors carry benign hex in URLs (doc-site menu codes, CDN content
    // hashes, expired presigned links) that would otherwise swamp the scan.
    const line = rawLine
      .replace(/\\([_^`*[\]()#])/g, "$1")
      .replace(/https?:\/\/\S+/gi, " ");

    if (skipAllowMarker && line.includes(ALLOW_MARKER)) {
      continue;
    }

    // Rule 1: the whole line payload is a single long hex blob.
    const bareMatch = line.match(BARE_HEX_LINE_PATTERN);
    if (bareMatch) {
      const blob = bareMatch[0].replace(/[^0-9a-f]/gi, "");
      if (blob.length >= 32 && hasHexLetter(blob)) {
        findings.push({
          file: relativePath,
          line: index + 1,
          rule: "bare-secret",
          preview: previewOf(blob),
        });
        continue;
      }
    }

    // Rule 2: credential field name plus a long opaque literal on one line.
    if (!CREDENTIAL_KEY_PATTERN.test(line)) {
      continue;
    }
    let flagged = false;
    for (const pattern of [HEX_BLOB_PATTERN, OPAQUE_TOKEN_PATTERN]) {
      if (flagged) {
        break;
      }
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(line)) !== null) {
        const candidate = match[0];
        const qualifies =
          (pattern === HEX_BLOB_PATTERN &&
            candidate.length >= 32 &&
            hasHexLetter(candidate)) ||
          (pattern === OPAQUE_TOKEN_PATTERN &&
            hasLetterAndDigit(candidate));
        if (qualifies) {
          findings.push({
            file: relativePath,
            line: index + 1,
            rule: "keyed-entropy",
            preview: previewOf(candidate),
          });
          flagged = true;
          break;
        }
      }
    }
  }

  return findings;
}

function walk(dir: string, relativeBase: string, files: string[]): void {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relativePath = relativeBase ? `${relativeBase}/${entry}` : entry;
    let stats;
    try {
      stats = statSync(fullPath);
    } catch {
      continue;
    }
    if (stats.isDirectory()) {
      if (!isExcludedPath(relativePath)) {
        walk(fullPath, relativePath, files);
      }
    } else if (
      stats.isFile() &&
      !isExcludedPath(relativePath) &&
      isScannedFile(relativePath)
    ) {
      files.push(fullPath);
    }
  }
}

/** Scans all configured roots and returns every finding. */
export function scanRepository(): SecretFinding[] {
  const files: string[] = [];
  for (const scanRoot of SCAN_ROOTS) {
    walk(resolveFromRoot(scanRoot), scanRoot, files);
  }

  const findings: SecretFinding[] = [];
  for (const filePath of files) {
    const relativePath = relative(ROOT, filePath);
    const text = readFileSync(filePath, "utf-8");
    findings.push(...scanText(relativePath, text));
  }
  return findings;
}

function main(): void {
  const findings = scanRepository();

  if (findings.length > 0) {
    console.error("Secret scan failed:\n");
    for (const finding of findings) {
      console.error(`  - ${finding.file}:${finding.line} [${finding.rule}] ${finding.preview}`);
    }
    console.error(
      `\n${findings.length} finding(s). Redact the values (keep <REDACTED_*> markers)` +
        `, or add \`secret-scan: allow\` on the line only for verified non-secrets.`
    );
    process.exit(1);
  }

  console.log("Secret scan passed: no credential material found.");
}

if (import.meta.main) {
  main();
}
