import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const appSource = fs.readFileSync(
  new URL("../js/app.js", import.meta.url),
  "utf8"
);

const toolHtml = fs.readFileSync(
  new URL("../tool/index.html", import.meta.url),
  "utf8"
);

test("full simulator declares costs as monthly euros", () => {
  assert.match(appSource, /const expensesUnit = isTool \? "monthly_eur" : "percentage"/);
  assert.match(appSource, /expensesUnit,/);
  assert.match(toolHtml, /id="expenses"[^>]*min="0"[^>]*required/);
  assert.match(toolHtml, /sempre espresso in euro, mai in percentuale/);
  assert.match(toolHtml, /always expressed in euros, never as a percentage/);
});

test("manual simulator analysis refuses an undeclared monthly cost", () => {
  assert.match(appSource, /window\.__MANUAL_ANALYSIS__[\s\S]*?monthlyCostsInput\.reportValidity\(\)/);
  assert.match(appSource, /Inserisci i costi mensili stimati/);
  assert.match(appSource, /Enter estimated monthly costs/);
});
