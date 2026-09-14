import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [dashboardSource, dashboardHTML] = await Promise.all([
  readFile(new URL("../js/dashboard.js", import.meta.url), "utf8"),
  readFile(new URL("../dashboard/index.html", import.meta.url), "utf8")
]);

test("bookings panel exposes the selected property context in both languages", () => {
  assert.match(dashboardHTML, /id="bookings-property-context"/);
  assert.match(dashboardSource, /Struttura: \$\{propertyLabel\}/);
  assert.match(dashboardSource, /Property: \$\{propertyLabel\}/);
  assert.match(dashboardSource, /context\.dataset\.it = italianLabel/);
  assert.match(dashboardSource, /context\.dataset\.en = englishLabel/);
});

test("booking cards display the current property name and city", () => {
  assert.match(
    dashboardSource,
    /\[bookingProperty\.name, bookingProperty\.city\]/
  );
});

test("property context is refreshed only after the selected property is loaded", () => {
  const openBookingsBlock = dashboardSource.match(
    /window\.openBookings\s*=\s*async function\(propertyId, bookingId = null, viewAllProperties = false\)\{([\s\S]*?)\/\/ Evidenzia la tab Prenotazioni/
  )?.[1] || "";

  assert.ok(
    openBookingsBlock.indexOf("await window.loadCurrentPropertyTouristTax(propertyId)") <
      openBookingsBlock.indexOf("window.updateBookingsPropertyContext()")
  );
});
