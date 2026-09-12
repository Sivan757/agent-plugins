//
// sign.ts — Huawei Cloud AK/SK request signing (SDK-HMAC-SHA256).
//
// Follows the algorithm implemented by the official
// `@huaweicloud/huaweicloud-sdk-core` signer (Apache-2.0) so requests signed
// here are accepted by the same gateways.
//
// CanonicalRequest =
//   HTTPRequestMethod \n
//   CanonicalURI \n
//   CanonicalQueryString \n
//   CanonicalHeaders \n
//   SignedHeaders \n
//   HexEncode(SHA256(RequestPayload))
//
// StringToSign = "SDK-HMAC-SHA256" \n RequestDateTime \n HexEncode(SHA256(CanonicalRequest))
// Signature    = HexEncode(HMAC-SHA256(SK, StringToSign))

import { createHash, createHmac } from "node:crypto";

/** SHA-256 of an empty request body. */
export const EMPTY_BODY_SHA256 =
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

export const SDK_SIGNING_ALGORITHM = "SDK-HMAC-SHA256";
export const HEADER_X_SDK_DATE = "x-sdk-date";
export const HEADER_HOST = "host";
export const HEADER_CONTENT_SHA256 = "x-sdk-content-sha256";

const UNRESERVED = /^[A-Za-z0-9\-._~]$/;

/** RFC 3986 percent-encoding using only the unreserved set, as the SDK does. */
export function urlEncode(value: string): string {
  let out = "";
  for (const char of value) {
    if (UNRESERVED.test(char)) {
      out += char;
      continue;
    }
    for (const byte of Buffer.from(char, "utf8")) {
      out += `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
    }
  }
  return out;
}

export function sha256Hex(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hmacSha256Hex(key: string, value: string): string {
  return createHmac("sha256", key).update(value).digest("hex");
}

/** `YYYYMMDDTHHmmssZ` in UTC. */
export function requestDateTime(date: Date = new Date()): string {
  const iso = date.toISOString();
  return `${iso.slice(0, 4)}${iso.slice(5, 7)}${iso.slice(8, 10)}T${iso.slice(11, 13)}${iso.slice(
    14,
    16
  )}${iso.slice(17, 19)}Z`;
}

/**
 * Encode the request path per segment; the result always ends with `/`.
 * The trailing slash is part of the upstream algorithm and must not be dropped.
 */
export function canonicalUri(path: string): string {
  if (!path) return path;
  const encoded = path.split("/").map(urlEncode).join("/");
  return encoded.endsWith("/") ? encoded : `${encoded}/`;
}

export type QueryValue = string | number | boolean | Array<string | number | boolean>;

/** Query parameters sorted by name, with repeated values sorted, joined by `&`. */
export function canonicalQueryString(query: Record<string, QueryValue> = {}): string {
  const parts: string[] = [];
  for (const key of Object.keys(query).sort()) {
    const value = query[key];
    const values = Array.isArray(value) ? [...value].map(String).sort() : [String(value)];
    for (const item of values) {
      parts.push(`${urlEncode(key)}=${urlEncode(item)}`);
    }
  }
  return parts.join("&");
}

/** Lower-cased, name-sorted `name:value\n` block plus the matching signed list. */
export function canonicalHeaders(headers: Record<string, string>): {
  canonical: string;
  signedHeaders: string;
} {
  const names = Object.keys(headers)
    .map((name) => name.toLowerCase())
    .sort();
  const canonical = names.map((name) => `${name}:${headers[name] ?? headerValue(headers, name)}\n`).join("");
  return { canonical, signedHeaders: names.join(";") };
}

/** Case-insensitive header lookup for the canonical header block. */
function headerValue(headers: Record<string, string>, lowerName: string): string {
  for (const [name, value] of Object.entries(headers)) {
    if (name.toLowerCase() === lowerName) return value;
  }
  return "";
}

export interface SignRequestInput {
  method: string;
  /** Gateway origin, e.g. `https://codearts.example.com` or `http://10.0.0.1:8099`. */
  endpoint: string;
  /** Resource path; any `?query` suffix is ignored in favour of `query`. */
  path: string;
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  /** Exact bytes that will be sent as the request body. */
  body?: string | Buffer;
  accessKeyId: string;
  accessKeySecret: string;
  /** Signing time; defaults to now. Useful for deterministic tests. */
  date?: Date;
}

export interface SignRequestResult {
  /** Headers to send: host, X-Sdk-Date, Authorization and the signed extras. */
  headers: Record<string, string>;
  canonicalRequest: string;
  stringToSign: string;
  signature: string;
  signedHeaders: string;
}

/**
 * Sign a request with AK/SK. The returned headers must be merged into (and not
 * reordered relative to) the request actually sent, because the payload hash
 * covers the exact body string passed here.
 */
export function signRequest(input: SignRequestInput): SignRequestResult {
  const endpoint = new URL(input.endpoint);
  const dateTimeStamp = requestDateTime(input.date);

  const headers: Record<string, string> = {};
  for (const [name, value] of Object.entries(input.headers ?? {})) {
    headers[name.toLowerCase()] = value;
  }
  headers[HEADER_X_SDK_DATE] = dateTimeStamp;
  headers[HEADER_HOST] = endpoint.host;

  // A multipart boundary is generated per request, so that content-type is
  // excluded from the signature exactly as the upstream signer does.
  if (/multipart\/form-data/i.test(headers["content-type"] ?? "")) {
    delete headers["content-type"];
  }

  const payloadHash = headers[HEADER_CONTENT_SHA256]
    ? headers[HEADER_CONTENT_SHA256]
    : input.body !== undefined && input.body !== ""
      ? sha256Hex(input.body)
      : EMPTY_BODY_SHA256;

  const { canonical, signedHeaders } = canonicalHeaders(headers);
  const canonicalRequest = [
    input.method.toUpperCase(),
    canonicalUri(input.path.split("?")[0]),
    canonicalQueryString(input.query ?? {}),
    canonical,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const stringToSign = [SDK_SIGNING_ALGORITHM, dateTimeStamp, sha256Hex(canonicalRequest)].join("\n");
  const signature = hmacSha256Hex(input.accessKeySecret, stringToSign);

  return {
    headers: {
      ...headers,
      Authorization: `${SDK_SIGNING_ALGORITHM} Access=${input.accessKeyId}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    canonicalRequest,
    stringToSign,
    signature,
    signedHeaders,
  };
}
