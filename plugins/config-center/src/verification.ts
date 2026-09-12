//
// verification.ts — when the stored credentials were last accepted.
//
// Redaction hides the value, which leaves a failure ambiguous: is the key
// wrong, or was it fine a minute ago and something else broke? Recording the
// last successful authentication — with a one-way digest of the credentials
// that were used — lets a diagnostic answer that without ever holding the
// plaintext.

import { existsSync, readFileSync } from 'node:fs';
import { rm, writeFile } from 'node:fs/promises';
import { configDir, ensurePrivateConfigDir } from './config-store.js';
import { fingerprintAll } from './redact.js';

export interface VerificationRecord {
  /** ISO timestamp of the last successful authenticated request. */
  verifiedAt: string;
  /** Endpoint that accepted the credentials, when known. */
  endpoint?: string;
  /** Authentication mode in use at that moment. */
  authType?: string;
  /** Digest of the credentials that were accepted, for change detection. */
  fingerprint?: string;
}

export function verificationPath(name: string): string {
  return `${configDir(name)}/verification.json`;
}

function parse(raw: string): VerificationRecord | null {
  try {
    const parsed = JSON.parse(raw) as VerificationRecord;
    return typeof parsed?.verifiedAt === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

export function readVerificationSync(name: string): VerificationRecord | null {
  const path = verificationPath(name);
  if (!existsSync(path)) return null;
  try {
    return parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

/** Read the record without throwing; diagnostics must never fail on it. */
export async function readVerification(name: string): Promise<VerificationRecord | null> {
  return readVerificationSync(name);
}

/**
 * Remember that these credentials worked. Best effort: a failure to write the
 * marker must never break the request that just succeeded.
 */
export async function recordVerification(
  name: string,
  record: Omit<VerificationRecord, 'verifiedAt'> & { verifiedAt?: string },
): Promise<void> {
  try {
    await ensurePrivateConfigDir(name);
    await writeFile(
      verificationPath(name),
      `${JSON.stringify({ ...record, verifiedAt: record.verifiedAt ?? new Date().toISOString() }, null, 2)}\n`,
      'utf-8',
    );
  } catch {
    // ignored on purpose
  }
}

export async function clearVerification(name: string): Promise<void> {
  await rm(verificationPath(name), { force: true });
}

// ── Reading a record back ───────────────────────────────────────────────────

export interface CredentialAssessment {
  /** Short digest of the credentials currently configured, when hashable. */
  fingerprint?: string;
  /** Last successful authentication for this plugin. */
  verification: VerificationRecord | null;
  /** True when credentials changed since that success. */
  changedSinceVerification: boolean;
  /** One sentence an agent can act on. */
  summary: string;
}

/**
 * Compare the configured credentials with the last successful authentication
 * and describe the situation in words.
 *
 * Only one-way digests are compared, so the plaintext is never needed here —
 * which is what makes this safe to call from an error path an agent will read.
 */
export function assessCredentials(
  name: string,
  values: Array<string | undefined>,
  now: Date = new Date(),
): CredentialAssessment {
  const fingerprint = fingerprintAll(values);
  const verification = readVerificationSync(name);

  if (!verification) {
    return {
      fingerprint,
      verification: null,
      changedSinceVerification: false,
      summary: 'These credentials have not been used successfully yet; a read-only call is the way to settle it.',
    };
  }

  const comparable = Boolean(fingerprint) && Boolean(verification.fingerprint);
  const changed = comparable && fingerprint !== verification.fingerprint;

  const age = now.getTime() - Date.parse(verification.verifiedAt);
  const ageText = Number.isFinite(age) ? describeAge(age) : 'at an unknown time';
  const where = verification.endpoint ? ` against ${verification.endpoint}` : '';

  let summary: string;
  if (changed) {
    summary = `These credentials have changed since they last worked (last success ${ageText}${where}), so a wrong or mis-pasted key is the first thing to check.`;
  } else if (comparable) {
    summary = `These same credentials worked ${ageText}${where}, so the key itself is unlikely to be the problem.`;
  } else {
    // No digest to compare — the last success is still useful, but claiming
    // "the key is fine" would be a guess.
    summary = `The last authenticated call succeeded ${ageText}${where}.`;
  }

  return { fingerprint, verification, changedSinceVerification: changed, summary };
}

function describeAge(ms: number): string {
  const minutes = Math.max(0, Math.round(ms / 60_000));
  if (minutes < 1) return 'moments ago';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `${Math.round(hours / 24)} days ago`;
}
