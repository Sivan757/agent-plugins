/**
 * Behaviour tests for the two pure layers: what the rules decide, and how a
 * session id becomes one path segment.
 *
 * The hook boundary is exercised through these, because a hook that cannot be
 * run twice with the same input and reach the same decision is not a trigger.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_THRESHOLDS } from "./config.js";
import { detect, unemitted, type TraceEntry } from "./detect.js";
import { canonical, isFailure, paramsHash } from "./hook.js";
import { stateKey } from "./store.js";

const thresholds = {
  activityQuantum: DEFAULT_THRESHOLDS.activityQuantum,
  repeatCalls: DEFAULT_THRESHOLDS.repeatCalls,
  errorStreak: DEFAULT_THRESHOLDS.errorStreak,
};

const failureConfig = { ...DEFAULT_THRESHOLDS, skillsRoot: "/none", maturity: 1, capacity: 1, verifyTimeoutMs: 1 };

function entry(tool: string, hash: string, ok = true): TraceEntry {
  return { tool, paramsHash: hash, ok };
}

test("an ordinary session reports nothing", () => {
  const entries = [entry("Read", "a"), entry("Edit", "b"), entry("Bash", "c")];
  assert.deepEqual(detect({ entries, toolCalls: 3, thresholds }), []);
});

test("identical arguments twice fire the repeat rule once", () => {
  const entries = [entry("Bash", "same"), entry("Bash", "same")];
  const findings = detect({ entries, toolCalls: 2, thresholds });
  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.kind, "repeat-call");
  // The same call a third time reports the same signature, so it is not repeated.
  const more = detect({ entries: [...entries, entry("Bash", "same")], toolCalls: 3, thresholds });
  assert.equal(more[0]?.signature, findings[0]?.signature);
});

test("different arguments to the same tool are not a repeat", () => {
  const entries = [entry("Bash", "one"), entry("Bash", "two")];
  assert.deepEqual(detect({ entries, toolCalls: 2, thresholds }), []);
});

test("a trailing failure streak fires, and a success clears it", () => {
  const failing = [entry("Bash", "a", false), entry("Bash", "b", false), entry("Bash", "c", false)];
  const findings = detect({ entries: failing, toolCalls: 3, thresholds });
  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.kind, "error-streak");

  const recovered = [...failing, entry("Bash", "d", true)];
  assert.deepEqual(detect({ entries: recovered, toolCalls: 4, thresholds }), []);
});

test("the streak counts across tools but only while trailing", () => {
  const entries = [entry("Read", "a", false), entry("Bash", "b", false), entry("Grep", "c", false)];
  const findings = detect({ entries, toolCalls: 3, thresholds });
  assert.equal(findings[0]?.kind, "error-streak");
  assert.match(findings[0]?.message ?? "", /Read/);
});

test("the volume rule fires at each milestone and not between them", () => {
  const entries = Array.from({ length: 20 }, (_, index) => entry("Bash", `h${index}`));
  const at = detect({ entries, toolCalls: 20, thresholds });
  assert.deepEqual(at.map((finding) => finding.kind), ["high-activity"]);

  const between = detect({ entries, toolCalls: 25, thresholds });
  assert.deepEqual(between.map((finding) => finding.signature), at.map((finding) => finding.signature));

  const next = detect({ entries, toolCalls: 40, thresholds });
  assert.notEqual(next[0]?.signature, at[0]?.signature);
});

test("a milestone survives the ring buffer dropping old entries", () => {
  const entries = [entry("Bash", "only")];
  const findings = detect({ entries, toolCalls: 60, thresholds });
  assert.equal(findings[0]?.kind, "high-activity");
  assert.match(findings[0]?.message ?? "", /60 tool calls/);
});

test("unemitted drops signatures already reported", () => {
  const findings = detect({ entries: [entry("Bash", "x"), entry("Bash", "x")], toolCalls: 2, thresholds });
  assert.deepEqual(unemitted(findings, []), findings);
  assert.deepEqual(unemitted(findings, [findings[0]?.signature ?? ""]), []);
});

test("canonical ignores object key order", () => {
  assert.equal(canonical({ b: 1, a: [2, 3] }), canonical({ a: [2, 3], b: 1 }));
  assert.notEqual(canonical({ a: 1 }), canonical({ a: 2 }));
});

test("paramsHash separates tools and arguments", () => {
  assert.equal(paramsHash("Bash", { command: "ls" }), paramsHash("Bash", { command: "ls" }));
  assert.notEqual(paramsHash("Bash", { command: "ls" }), paramsHash("Bash", { command: "ls -a" }));
  assert.notEqual(paramsHash("Bash", { command: "ls" }), paramsHash("Grep", { command: "ls" }));
});

test("failures are read from the host's Error: prefix", () => {
  assert.equal(isFailure("Error: skill \"x\" is unknown or no longer available", failureConfig), true);
  assert.equal(isFailure("Error: invalid skill name \"x\"", failureConfig), true);
  assert.equal(isFailure("file written", failureConfig), false);
  assert.equal(isFailure("2 errors found in the report", failureConfig), false);
});

test("session ids become one safe path segment", () => {
  assert.equal(stateKey("session-504c8b9d-0c08"), "session-504c8b9d-0c08");
  assert.equal(stateKey("../../etc/passwd"), stateKey("../../etc/passwd"));
  assert.doesNotMatch(stateKey("../../etc/passwd"), /[/\\]/);
  assert.notEqual(stateKey("../a"), stateKey("../b"));
});
