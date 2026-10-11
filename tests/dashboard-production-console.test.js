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
  assert.match(source, /dashboardDebug\("Optional PMS snapshot unavailable for investment report"/);
});

test("Dashboard and PMS failures do not print account data in the browser", () => {
  assert.match(source, /const dashboardError =/);
  assert.doesNotMatch(source, /console\.(?:log|debug|warn|error|trace)\s*\(/);
  assert.match(source, /dashboardError\(\s*"PROPERTY SAVE ERROR:"/);
  assert.match(source, /dashboardError\("Booking save failed", error\)/);
});
