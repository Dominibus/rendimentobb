import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const dashboardHtml = fs.readFileSync(
  new URL("../dashboard/index.html", import.meta.url),
  "utf8"
);

const dashboardSource = fs.readFileSync(
  new URL("../js/dashboard.js", import.meta.url),
  "utf8"
);

test("dashboard does not ship hardcoded executive KPI values", () => {
  assert.doesNotMatch(dashboardHtml, /id="exec-score">94</);
  assert.doesNotMatch(dashboardHtml, /id="exec-cash">\+€584</);
  assert.doesNotMatch(dashboardHtml, /Strategia consigliata: ACQUISTA \/ ESPANDI\s*<\/span>/);
  assert.match(dashboardHtml, /id="executive-summary"[\s\S]*?style="display:none;"/);
});

test("dashboard labels investment averages and PMS performance explicitly", () => {
  assert.match(dashboardHtml, /Cashflow mensile medio per analisi/);
  assert.match(dashboardHtml, /Average monthly cash flow per analysis/);
  assert.match(dashboardSource, /Performance operativa PMS/);
  assert.match(dashboardSource, /PMS Operating Performance/);
});

test("executive PMS panel refuses to score an empty operational dataset", () => {
  assert.match(dashboardSource, /const hasPMSPerformanceData\s*=\s*bookings > 0 \|\| revenue > 0/);
  assert.match(dashboardSource, /Dati PMS non disponibili/);
  assert.match(dashboardSource, /PMS data is not available/);
});
