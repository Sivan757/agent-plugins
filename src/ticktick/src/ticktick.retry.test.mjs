import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const sourcePath = join(dirname(fileURLToPath(import.meta.url)), "ticktick.ts");

test("TickTick API calls use the shared transient fetch retry helper", () => {
  const source = readFileSync(sourcePath, "utf8");

  assert.match(source, /async function fetchWithRetry\(/);
  assert.match(source, /function isTransientFetchError\(/);
  assert.equal((source.match(/await fetchWithRetry\(/g) || []).length >= 4, true);
  assert.equal((source.match(/await fetch\(/g) || []).length, 1);
});
