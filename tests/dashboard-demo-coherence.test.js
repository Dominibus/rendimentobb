import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

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

test("historical bookings alone do not produce a poor current-period score", () => {
  const start = dashboardSource.indexOf("function renderExecutiveSummary(data)");
  const end = dashboardSource.indexOf('document.addEventListener("rb_language_changed"', start);
  const box = { style: {}, innerHTML: "" };
  const context = { document: { getElementById: () => box }, t: (it) => it };
  vm.createContext(context);
  vm.runInContext(dashboardSource.slice(start, end), context);
  context.renderExecutiveSummary({ bookings: 13, properties: 4, revenue: 0, occupancy: 0, revpar: 0, adr: 0 });
  assert.match(box.innerHTML, /Nessuna attività economica registrata nel periodo corrente/);
  assert.doesNotMatch(box.innerHTML, /Richiede attenzione|OTA|exec-score/);
});
