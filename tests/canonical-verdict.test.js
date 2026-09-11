import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const appSource = await readFile(
  new URL("../js/app.js", import.meta.url),
  "utf8"
);

test("the Executive AI panel accepts the canonical score verdict", () => {
  const start = appSource.indexOf("function renderInvestmentVerdict(");
  const end = appSource.indexOf("// ================= SMART PAYWALL", start);
  const verdictSource = appSource.slice(start, end);

  assert.match(verdictSource, /canonicalVerdict = null/);
  assert.match(verdictSource, /normalizedCanonicalVerdict/);
  assert.match(verdictSource, /\["BUY", "ACQUISTA"\]/);
  assert.match(verdictSource, /\["WAIT", "ATTENDI"\]/);
  assert.match(verdictSource, /\["AVOID", "EVITA"\]/);
});

test("simulation and language refresh pass the saved canonical verdict", () => {
  assert.match(
    appSource,
    /Number\(window\.lastAnalysisData\.occupancy \?\? 0\),\s*window\.lastAnalysisData\.verdict\s*\);/
  );
  assert.match(
    appSource,
    /renderInvestmentVerdict\(roi, risk, cashflow, occupancy, data\.verdict\);/
  );
});
