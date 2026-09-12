//
// sign.test.ts — frozen signature vectors.
//
// Every expected Authorization value below was produced by the official
// `@huaweicloud/huaweicloud-sdk-core` AKSKSigner for the same inputs, so this
// test pins compatibility with the upstream SDK-HMAC-SHA256 implementation.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  canonicalQueryString,
  canonicalUri,
  requestDateTime,
  signRequest,
  urlEncode,
} from "./sign.js";

const ACCESS_KEY_ID = "ZIRRKMTWPABCDEFGH1WKNKB";
const ACCESS_KEY_SECRET = "Us0mdMNHkABCDEFGHYrRCnW0ecfzl";
const DATE = "20260911T115411Z";

function parseSdkDate(value: string): Date {
  return new Date(
    Date.UTC(
      Number(value.slice(0, 4)),
      Number(value.slice(4, 6)) - 1,
      Number(value.slice(6, 8)),
      Number(value.slice(9, 11)),
      Number(value.slice(11, 13)),
      Number(value.slice(13, 15))
    )
  );
}

interface SignVector {
  name: string;
  method: string;
  endpoint: string;
  path: string;
  query: Record<string, string | string[]>;
  headers: Record<string, string>;
  body: string | undefined;
  authorization: string;
}

const VECTORS: SignVector[] = [
  {
    name: "POST with JSON body",
    method: "POST",
    endpoint: "https://codearts.cn-north-4.myhuaweicloud.com",
    path: "/v5/abc123/api/pipelines/def456/run",
    query: {},
    headers: { "content-type": "application/json" },
    body: '{"sources":[{"type":"code"}],"description":"x"}',
    authorization:
      "SDK-HMAC-SHA256 Access=ZIRRKMTWPABCDEFGH1WKNKB, SignedHeaders=content-type;host;x-sdk-date, Signature=4f8f6f0c46737fd1f834315cf0a410d8de47ceaf5c5548d670858b74bf87a7a0",
  },
  {
    name: "GET with sorted, encoded query values",
    method: "GET",
    endpoint: "https://codearts.cn-north-4.myhuaweicloud.com",
    path: "/v2/tasks/t1/defects-summary",
    query: { limit: "10", name: "a b/c", tags: ["z", "a"] },
    headers: { "content-type": "application/json" },
    body: undefined,
    authorization:
      "SDK-HMAC-SHA256 Access=ZIRRKMTWPABCDEFGH1WKNKB, SignedHeaders=content-type;host;x-sdk-date, Signature=219d6ad1321f93bf768f08ae29eed0d8f94fce38346821779bc803d40d7d3ee1",
  },
  {
    name: "GET against a host with a port and no body",
    method: "GET",
    endpoint: "http://10.250.63.100:8099",
    path: "/v4/projects/p1/watermark",
    query: {},
    headers: { "content-type": "application/json" },
    body: undefined,
    authorization:
      "SDK-HMAC-SHA256 Access=ZIRRKMTWPABCDEFGH1WKNKB, SignedHeaders=content-type;host;x-sdk-date, Signature=96b9a35c0006235b834f5059ed7fa7b35e0349bcc9d7719e2665f6b2a88f354e",
  },
  {
    name: "UTF-8 path and query",
    method: "POST",
    endpoint: "https://codearts.example.com",
    path: "/v1/应用/查询",
    query: { q: "中文 值" },
    headers: { "content-type": "application/json" },
    body: '{"n":"中文"}',
    authorization:
      "SDK-HMAC-SHA256 Access=ZIRRKMTWPABCDEFGH1WKNKB, SignedHeaders=content-type;host;x-sdk-date, Signature=c0a4dd4841e29266e9f09fb8c3d68c7fe0a614a7890e7b04a3a08ed7e412f9ca",
  },
];

for (const vector of VECTORS) {
  test(`signRequest matches the official SDK: ${vector.name}`, () => {
    const result = signRequest({
      method: vector.method,
      endpoint: vector.endpoint,
      path: vector.path,
      query: vector.query,
      headers: vector.headers,
      body: vector.body,
      accessKeyId: ACCESS_KEY_ID,
      accessKeySecret: ACCESS_KEY_SECRET,
      date: parseSdkDate(DATE),
    });
    assert.equal(result.headers["x-sdk-date"], DATE);
    assert.equal(result.headers.Authorization, vector.authorization);
  });
}

test("canonicalUri always ends with a slash", () => {
  assert.equal(canonicalUri("/v5/a/b"), "/v5/a/b/");
  assert.equal(canonicalUri("/v5/a/b/"), "/v5/a/b/");
  assert.equal(canonicalUri("/"), "/");
});

test("canonicalQueryString sorts names and repeated values", () => {
  assert.equal(canonicalQueryString({ b: "2", a: "1" }), "a=1&b=2");
  assert.equal(canonicalQueryString({ a: ["z", "b"] }), "a=b&a=z");
  assert.equal(canonicalQueryString({}), "");
});

test("urlEncode keeps only RFC 3986 unreserved characters", () => {
  assert.equal(urlEncode("aA0-._~"), "aA0-._~");
  assert.equal(urlEncode("a b/c"), "a%20b%2Fc");
  assert.equal(urlEncode("中"), "%E4%B8%AD");
  assert.equal(urlEncode("!*'()"), "%21%2A%27%28%29");
});

test("requestDateTime renders UTC basic ISO-8601", () => {
  assert.equal(requestDateTime(new Date("2026-09-11T11:54:11Z")), "20260911T115411Z");
});

test("multipart content-type is excluded from the signature", () => {
  const result = signRequest({
    method: "POST",
    endpoint: "https://codearts.example.com",
    path: "/v1/upload",
    query: {},
    headers: { "content-type": "multipart/form-data; boundary=xyz" },
    body: "payload",
    accessKeyId: ACCESS_KEY_ID,
    accessKeySecret: ACCESS_KEY_SECRET,
    date: parseSdkDate(DATE),
  });
  assert.equal(result.signedHeaders, "host;x-sdk-date");
});
