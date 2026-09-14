/**
 * Behaviour tests for the survival rule.
 *
 * These pin the four groups separately, because the failure mode worth catching
 * is not "it retired the wrong skill" but "it retired a skill for being new".
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluate, rate, turnsAvailable, type Member } from "./library.js";

const OPTIONS = { maturity: 100, capacity: 3 };

function member(name: string, anchor: number, use: number, view = 0): Member {
  return { name, anchor, use, view };
}

test("a skill inside probation is never retired, even with no use at all", () => {
  const decision = evaluate([member("auto-new", 0, 0, 0)], 10, OPTIONS);
  assert.deepEqual(decision.probation, ["auto-new"]);
  assert.deepEqual(decision.archive, []);
});

test("a graduated skill that was never loaded and never read retires", () => {
  const decision = evaluate([member("auto-dead", 0, 0, 0)], 100, OPTIONS);
  assert.deepEqual(decision.archive, ["auto-dead"]);
  assert.deepEqual(decision.pool, []);
});

test("a graduated skill that was read but never loaded is spared and takes no slot", () => {
  const decision = evaluate([member("auto-read", 0, 0, 2)], 100, OPTIONS);
  assert.deepEqual(decision.spared, ["auto-read"]);
  assert.deepEqual(decision.archive, []);
  assert.deepEqual(decision.pool, []);
});

test("inside capacity nothing in use retires", () => {
  const members = [member("auto-a", 0, 5), member("auto-b", 0, 2), member("auto-c", 0, 1)];
  const decision = evaluate(members, 100, OPTIONS);
  assert.deepEqual(decision.archive, []);
  assert.deepEqual(decision.pool, ["auto-a", "auto-b", "auto-c"]);
});

test("above capacity the lowest rate retires first", () => {
  const members = [
    member("auto-hot", 0, 40),
    member("auto-warm", 0, 10),
    member("auto-cold", 0, 2),
    member("auto-ice", 0, 1),
  ];
  const decision = evaluate(members, 100, OPTIONS);
  assert.deepEqual(decision.archive, ["auto-ice"]);
  assert.deepEqual(decision.pool, ["auto-cold", "auto-hot", "auto-warm"]);
});

test("equal rates break ties deterministically by name", () => {
  const members = [
    member("auto-beta", 0, 4),
    member("auto-alpha", 0, 4),
    member("auto-gamma", 0, 4),
    member("auto-delta", 0, 4),
  ];
  assert.deepEqual(evaluate(members, 100, OPTIONS).archive, ["auto-alpha"]);
});

test("a new skill and an idle veteran are judged by the same rule", () => {
  const decision = evaluate([member("auto-veteran", 0, 0, 0), member("auto-rookie", 95, 0, 0)], 100, OPTIONS);
  assert.deepEqual(decision.probation, ["auto-rookie"]);
  assert.deepEqual(decision.archive, ["auto-veteran"]);
});

test("the rate is opportunity-relative, not absolute", () => {
  // Both were loaded twice, but one has been available for ten times as long.
  assert.ok(rate(member("auto-old", 0, 2), 100) < rate(member("auto-new", 90, 2), 100));
  assert.equal(turnsAvailable(member("auto-old", 0, 2), 100), 100);
});
