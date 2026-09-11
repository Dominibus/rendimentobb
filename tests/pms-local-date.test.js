import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const dashboardSource = await readFile(
  new URL("../js/dashboard.js", import.meta.url),
  "utf8"
);

test("PMS calendar day is built from the host local timezone", () => {
  const helper = dashboardSource.match(
    /function getLocalISODate\(date = new Date\(\)\)\{([\s\S]*?)\n\}/
  )?.[1] || "";

  assert.match(helper, /getFullYear\(\)/);
  assert.match(helper, /getMonth\(\)/);
  assert.match(helper, /getDate\(\)/);
  assert.doesNotMatch(helper, /toISOString\s*\(/);
});

test("PMS day comparisons never derive today from UTC", () => {
  assert.doesNotMatch(
    dashboardSource,
    /new Date\(\)\s*\.toISOString\(\)\s*\.(?:slice|split)\s*\(/
  );

  assert.match(dashboardSource, /const copilotToday = getLocalISODate\(\);/);
  assert.match(dashboardSource, /const today = getLocalISODate\(\);/);
});
