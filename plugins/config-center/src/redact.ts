import { createHash } from 'node:crypto';

/** Below this length a digest could be attacked by enumeration, so none is emitted. */
const FINGERPRINT_MIN_LENGTH = 16;

/**
 * Partial mask: keeps the first two and last three characters so a reader can
 * recognise a value they already know.
 *
 * The configuration summaries deliberately do not use this — five surviving
 * characters are a real share of a short credential, and {@link maskFully} plus
 * a length says everything a reader needs. Kept as the package's documented
 * value-masking primitive.
 *
 * Masks a secret value so plaintext is never exposed to the Agent.
 * - length >= 8: keep first 2 + last 3 characters, mask the middle with "•"
 * - length 1-7: fully mask with "•" (one per character)
 * - empty / undefined / null: return "<not set>"
 */
export function redact(value: string): string {
  if (value == null || value === '') {
    return '<not set>';
  }

  if (value.length >= 8) {
    const prefix = value.slice(0, 2);
    const suffix = value.slice(-3);
    const middleLen = value.length - 2 - 3;
    return prefix + '•'.repeat(middleLen) + suffix;
  }

  // length 1-7: fully masked
  return '•'.repeat(value.length);
}

/**
 * Container nesting expanded before collapsing. Three levels is what a
 * collection of objects needs — `connections.local.host` is two containers deep
 * — and anything shallower would hide the field names a reader is looking for.
 */
const MAX_STRUCTURE_DEPTH = 3;

export interface RedactStructureOptions {
  /**
   * Append each masked value's character count. A length is the one fact that
   * makes a truncated paste visible without revealing the value, so it is worth
   * having on every field rather than on a hand-picked list.
   */
  lengths?: boolean;
  /** Container nesting kept before collapsing. Default 3. */
  maxDepth?: number;
  /**
   * Return true to print that path's value in the clear. Defaults to never,
   * which is the only safe default: a value is hidden unless a caller can say
   * what it is and why showing it is harmless.
   */
  reveal?: (path: string) => boolean;
}

/** Bullets standing in for a hidden value. Nothing of the value survives. */
export function maskFully(value: string): string {
  return '•'.repeat(value.length);
}

/**
 * Flattens a configured value into "dotted.path=<redacted>" lines so a reader
 * can see which keys exist without ever seeing a value.
 *
 * The masking rule has no field list behind it: **every string is hidden**
 * unless the caller passes `reveal` to name the paths it can vouch for.
 * Deciding per field which ones are secret meant keeping that list in step with
 * every plugin's schema, and a field that was added without being listed would
 * have been printed in the clear. Numbers and booleans are the only built-in
 * exception, because a number or a toggle cannot carry a credential — no list
 * needed, the type settles it.
 *
 * - Strings are masked whole, then optionally their length.
 * - Objects/arrays expand one path segment per level, up to maxDepth.
 * - Deeper containers collapse to "<object: N keys>" / "<array: N items>".
 */
export function redactStructure(
  prefix: string,
  value: unknown,
  options: RedactStructureOptions = {},
): string[] {
  const maxDepth = options.maxDepth ?? MAX_STRUCTURE_DEPTH;

  const walk = (path: string, current: unknown, depth: number): string[] => {
    // An empty string is "not configured" in every schema here, and a length of
    // zero says nothing a reader needs.
    if (current === null || current === undefined || current === '') {
      return [`${path}=<not set>`];
    }
    if (Array.isArray(current)) {
      if (depth >= maxDepth || current.length === 0) {
        return [`${path}=<array: ${current.length} item${current.length === 1 ? '' : 's'}>`];
      }
      return current.flatMap((item, index) => walk(`${path}[${index}]`, item, depth + 1));
    }
    if (typeof current === 'object') {
      const entries = Object.entries(current as Record<string, unknown>);
      if (depth >= maxDepth || entries.length === 0) {
        return [`${path}=<object: ${entries.length} key${entries.length === 1 ? '' : 's'}>`];
      }
      return entries.flatMap(([key, child]) => walk(`${path}.${key}`, child, depth + 1));
    }
    if (typeof current === 'number' || typeof current === 'boolean') {
      return [`${path}=${current}`];
    }
    const text = String(current);
    if (options.reveal?.(path)) {
      return [`${path}=${text}`];
    }
    // Fully masked, not partially: a prefix and suffix of a credential is a
    // real share of it (`hu••••••••••er2` gives away five characters), and the
    // length already carries every fact a reader needs.
    return [`${path}=${maskFully(text)}${options.lengths ? `  len=${text.length}` : ''}`];
  };

  return walk(prefix, value, 0);
}


// ── Judging a secret without reading it ─────────────────────────────────────

/**
 * What a field is expected to look like. Passing it turns a masked value into
 * a judgement ("this is not shaped like an AK") instead of a dead end.
 */
export interface SecretExpectation {
  /** Shape the value should match. */
  pattern?: RegExp;
  /** Human description used in the hint, e.g. "20 alphanumeric characters". */
  description?: string;
}

export interface SecretReport {
  /** Character count, or null when unset. */
  length: number | null;
  shape: 'unset' | 'ok' | 'unexpected';
  /** Why the shape is unexpected, when it is. */
  shapeHint?: string;
}

/** Describe the character classes present, without revealing the value. */
export function describeCharset(value: string): string {
  if (/^[0-9a-f]+$/i.test(value)) return 'hex';
  if (/^[A-Za-z0-9]+$/.test(value)) return 'alphanumeric';
  if (/^https?:\/\//.test(value)) return 'url';
  if (/\s/.test(value)) return 'contains whitespace';
  if (/^[A-Za-z0-9+/_=-]+$/.test(value)) return 'base64-ish';
  return 'mixed';
}

/** First 10 hex characters of the value's SHA-256. Not reversible. */
export function fingerprintOf(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex').slice(0, 10);
}

/**
 * Turn a stored secret into something an agent can reason about without
 * carrying it: its length and whether its shape matches the field.
 *
 * The digest that answers "is this the same credential as last time" is not here
 * — it covers several fields at once and lives in {@link fingerprintAll}.
 */
export function describeSecret(
  value: unknown,
  expectation: SecretExpectation = {},
): SecretReport {
  const text = value == null ? '' : String(value);
  if (text === '') {
    return { length: null, shape: 'unset' };
  }

  const report: SecretReport = {
    length: text.length,
    shape: 'ok',
  };

  if (expectation.pattern && !expectation.pattern.test(text)) {
    report.shape = 'unexpected';
    const observed = `${describeCharset(text)}, ${text.length} chars`;
    report.shapeHint = expectation.description
      ? `expected ${expectation.description}; got ${observed}`
      : `does not match the expected shape; got ${observed}`;
  }

  return report;
}

/**
 * One digest covering several credential fields, so a caller can detect "the
 * credentials changed" without seeing any of them. Returns undefined when any
 * component is too short to hash safely.
 */
export function fingerprintAll(values: Array<string | undefined>): string | undefined {
  const parts = values.map((value) => (value ?? '').trim()).filter(Boolean);
  if (parts.length === 0) return undefined;
  if (parts.some((part) => part.length < 8)) return undefined;
  if (parts.join('').length < FINGERPRINT_MIN_LENGTH) return undefined;
  return fingerprintOf(parts.join('\u0000'));
}
