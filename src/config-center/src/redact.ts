/**
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
 * Formats a key-value pair for display with the value redacted.
 * Returns "KEY=<redacted value>".
 */
export function redactEntry(key: string, value: unknown): string {
  const str = value == null ? '' : String(value);
  return `${key}=${redact(str)}`;
}

/** Maximum object/array nesting expanded by redactStructure. */
const MAX_STRUCTURE_DEPTH = 2;

/**
 * Flattens a config value into "dotted.path=<redacted scalar>" lines so
 * Agents can see which keys exist without ever reading plaintext.
 *
 * - Scalars render through redact() exactly like redactEntry.
 * - Objects/arrays expand one path segment per level, up to MAX_STRUCTURE_DEPTH.
 * - Deeper containers collapse to "<object: N keys>" / "<array: N items>"
 *   summaries; empty ones always do.
 */
export function redactStructure(prefix: string, value: unknown, depth = 0): string[] {
  if (value === null || value === undefined) {
    return [`${prefix}=<not set>`];
  }
  if (Array.isArray(value)) {
    if (depth >= MAX_STRUCTURE_DEPTH || value.length === 0) {
      return [`${prefix}=<array: ${value.length} item${value.length === 1 ? '' : 's'}>`];
    }
    return value.flatMap((item, i) => redactStructure(`${prefix}[${i}]`, item, depth + 1));
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (depth >= MAX_STRUCTURE_DEPTH || entries.length === 0) {
      return [`${prefix}=<object: ${entries.length} key${entries.length === 1 ? '' : 's'}>`];
    }
    return entries.flatMap(([k, v]) => redactStructure(`${prefix}.${k}`, v, depth + 1));
  }
  // Numbers and booleans are configuration facts (ports, toggles), not
  // secrets — render them verbatim so diagnostics stay useful.
  if (typeof value === 'number' || typeof value === 'boolean') {
    return [`${prefix}=${value}`];
  }
  return [`${prefix}=${redact(String(value))}`];
}
