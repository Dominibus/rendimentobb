import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const dashboardSource = await readFile(
  new URL("../js/dashboard.js", import.meta.url),
  "utf8"
);

test("bookings wait for the selected property's tourist-tax configuration", () => {
  const openBookingsBlock = dashboardSource.match(
    /window\.openBookings\s*=\s*async function\(propertyId, bookingId = null\)\{([\s\S]*?)\/\/ Evidenzia la tab Prenotazioni/
  )?.[1] || "";

  assert.match(
    openBookingsBlock,
    /await window\.loadCurrentPropertyTouristTax\(propertyId\)/
  );
});

test("global bookings visibility fix remains part of the dashboard baseline", () => {
  assert.match(
    dashboardSource,
    /\[\.\.\.bookingsByProperty\.entries\(\)\][\s\S]*?await openBookings\(propertyId\)/
  );
});
