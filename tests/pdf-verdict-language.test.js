import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const appSource = await readFile(
  new URL("../js/app.js", import.meta.url),
  "utf8"
);

test("Executive PDF localizes the canonical verdict without changing it", () => {
  const start = appSource.indexOf("const pdfVerdictLabel =");
  const end = appSource.indexOf("// SAVE", start);
  const pdfSource = appSource.slice(start, end);

  assert.match(pdfSource, /T\("Favorevole", "Favourable"\)/);
  assert.match(pdfSource, /T\("Da verificare", "Review"\)/);
  assert.match(pdfSource, /T\("Critico", "Critical"\)/);
  assert.match(pdfSource, /doc\.text\(pdfVerdictLabel,82,249\)/);
  assert.match(pdfSource, /doc\.text\(\s*pdfVerdictLabel,\s*28,/);
});

test("Executive report data keeps the canonical machine verdict", () => {
  assert.match(
    appSource,
    /window\.buildExecutiveReport\(\{[\s\S]*?investmentScore,[\s\S]*?verdict,[\s\S]*?confidence,/
  );
});
