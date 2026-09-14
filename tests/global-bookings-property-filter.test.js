import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [dashboardHTML, dashboardSource] = await Promise.all([
  readFile(new URL("../dashboard/index.html", import.meta.url), "utf8"),
  readFile(new URL("../js/dashboard.js", import.meta.url), "utf8")
]);

test("global bookings exposes a separate bilingual property filter", () => {
  assert.match(dashboardHTML, /id="bookings-property-filter"/);
  assert.match(dashboardHTML, /data-it="Filtra per struttura" data-en="Filter by property"/);
  assert.match(dashboardHTML, /data-it="Tutte le strutture" data-en="All properties"/);
});

test("dashboard bookings opens the aggregate view without changing property-card scope", () => {
  assert.match(dashboardSource, /await openBookings\(propertyId, null, true\)/);
  assert.match(dashboardSource, /onclick="openBookings\('\$\{docItem\.id\}'\)"/);
});

test("aggregate bookings query uses only the user while property view remains scoped", () => {
  assert.match(dashboardSource, /const showAllProperties = propertyId === "all";/);
  assert.match(dashboardSource, /showAllProperties[\s\S]*where\("uid", "==", window\.currentUser\.uid\)[\s\S]*where\("propertyId", "==", propertyId\)/);
});

test("aggregate cards resolve each booking property name and city", () => {
  assert.match(dashboardSource, /window\.bookingPropertyDirectory\?\.get\(b\.propertyId\)/);
  assert.match(dashboardSource, /\[bookingProperty\.name, bookingProperty\.city\]/);
});
