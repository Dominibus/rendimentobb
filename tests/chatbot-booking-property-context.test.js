import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const dashboardSource = fs.readFileSync(
  new URL("../js/dashboard.js", import.meta.url),
  "utf8"
);

const responseEngineSource = fs.readFileSync(
  new URL("../js/chatbot/core/response-engine.js", import.meta.url),
  "utf8"
);

test("the PMS chatbot memory includes property name and city in both booking loaders", () => {
  const propertyNameMatches = dashboardSource.match(/propertyName:\s*String\(/g) || [];
  const propertyCityMatches = dashboardSource.match(/propertyCity:\s*String\(/g) || [];

  assert.ok(propertyNameMatches.length >= 2);
  assert.ok(propertyCityMatches.length >= 2);
  assert.match(dashboardSource, /window\.bookingPropertyDirectory\?\.get/);
  assert.match(dashboardSource, /const pmsPropertyDirectory = new Map/);
});

test("attention responses identify the property in Italian and English", () => {
  assert.match(responseEngineSource, /🏠 Struttura: \$\{propertyText\}/);
  assert.match(responseEngineSource, /🏠 Property: \$\{propertyText\}/);
  assert.match(responseEngineSource, /propertyName/);
  assert.match(responseEngineSource, /propertyCity/);
});
