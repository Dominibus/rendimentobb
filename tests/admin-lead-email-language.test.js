import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../api/send-lead.js", import.meta.url),
  "utf8"
);

const start = source.indexOf("// ================= ADMIN EMAIL");
const adminSource = source.slice(start);

test("admin lead email keeps its operational copy in Italian", () => {
  assert.match(adminSource, /Nuovo lead acquisito da RendimentoBB/);
  assert.doesNotMatch(adminSource, /New lead generated from RendimentoBB/);
  assert.match(adminSource, /Suggerimento operativo/);
  assert.match(adminSource, /Contatta Lead/);
  assert.match(adminSource, /Apri Dashboard/);
});

test("admin lead email localizes ROI and DSCR as Italian numbers", () => {
  assert.match(adminSource, /ROI \$\{formatNumber\(roiRounded, "it", 1\)\}%/);
  assert.match(adminSource, /formatNumber\(canonicalDSCR, "it", 2\)/);
});
