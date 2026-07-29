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
