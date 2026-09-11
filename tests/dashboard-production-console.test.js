import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../js/dashboard.js", import.meta.url),
  "utf8"
);

test("Dashboard and PMS routine diagnostics stay development-only", () => {
  assert.match(source, /const dashboardDebug =/);
  assert.match(source, /const IS_DEVELOPMENT =/);
  assert.doesNotMatch(source, /console\.warn\s*\(/);
  assert.match(source, /dashboardDebug\(\s*"Dashboard già inizializzata/);
  assert.match(source, /dashboardDebug\("Dashboard auth già inizializzato/);
  assert.match(source, /dashboardDebug\("Dashboard report PMS snapshot unavailable"/);
});

test("Dashboard and PMS real failures remain observable", () => {
  assert.match(source, /const dashboardError =/);
  assert.match(source, /console\.error\(message\)/);
  assert.match(source, /dashboardError\(\s*"PROPERTY SAVE ERROR:"/);
  assert.match(source, /dashboardError\("Booking save failed", error\)/);
});
