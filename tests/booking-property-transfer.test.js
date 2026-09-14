import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [dashboard, script] = await Promise.all([
  readFile(new URL("../dashboard/index.html", import.meta.url), "utf8"),
  readFile(new URL("../js/dashboard.js", import.meta.url), "utf8")
]);

test("booking form exposes a bilingual property selector", () => {
  assert.match(dashboard, /id="booking-property"/);
  assert.match(dashboard, /data-it="Struttura" data-en="Property"/);
});

test("booking details load the current property and edit enables transfer", () => {
  assert.match(script, /loadBookingPropertyOptions\?\.\(window\.bookingOriginPropertyId, false\)/);
  assert.match(script, /const property = document\.getElementById\("booking-property"\);\s*if\(property\) property\.disabled = false;/);
});

test("saving an edited booking persists the selected property", () => {
  assert.match(script, /const selectedPropertyId = document\.getElementById\("booking-property"\)\?\.value \|\| window\.currentPropertyId;/);
  assert.match(script, /propertyId: selectedPropertyId,/);
  assert.match(script, /await loadBookings\(returnToAllProperties \? "all" : selectedPropertyId\);/);
});

test("moving a booking checks conflicts in the destination property", () => {
  assert.match(script, /if\(selectedPropertyId !== window\.bookingOriginPropertyId\)[\s\S]*where\("propertyId", "==", selectedPropertyId\)/);
});

test("bookings visibility baseline remains intact", () => {
  assert.match(script, /\[\.\.\.bookingsByProperty\.entries\(\)\][\s\S]*await openBookings\(propertyId, null, true\)/);
});
