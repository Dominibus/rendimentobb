import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const parserSource = await readFile(new URL("../js/chatbot/pdf-parser-engine.js", import.meta.url), "utf8");

async function parse(extractedText, type = "external_pdf") {
  const context = { window: { RB_DEBUG: false }, console: { debug() {}, error() {} } };
  vm.createContext(context);
  vm.runInContext(parserSource, context);
  const documentObject = { extractedText, type };
  await context.window.rbParseExecutivePDF(documentObject);
  return documentObject;
}

test("a property brochure extracts its price but no financial verdict", async () => {
  const doc = await parse("Appartamento Roma. Prezzo immobile €210.000. Superficie 85 mq. Camere 2. Bagni 1.");
  assert.equal(doc.analysis.reportType, "property_document");
  assert.equal(doc.analysis.propertyPrice, 210000);
  assert.equal(doc.analysis.propertyFacts.surfaceSqm, 85);
  assert.equal(doc.analysis.roi, null);
  assert.equal(doc.analysis.cashflow, null);
  assert.equal(doc.analysis.verdict, null);
  assert.equal(doc.executiveContext.isFinancialReport, false);
});

test("a brochure with no price does not invent one", async () => {
  const doc = await parse("Appartamento Roma. Superficie 85 mq. Camere 2. Bagni 1.");
  assert.equal(doc.analysis.propertyPrice, null);
  assert.equal(doc.analysis.roi, null);
  assert.equal(doc.analysis.reportType, "property_document");
});

test("ambiguous unlabeled prices are not selected arbitrarily", async () => {
  const doc = await parse("Appartamento in vendita. €210.000 oppure €240.000. Superficie 85 mq.");
  assert.equal(doc.analysis.propertyPrice, null);
  assert.equal(doc.analysis.roi, null);
});

test("scanned PDF with no extracted text cannot produce an analysis", async () => {
  const doc = await parse("");
  assert.equal(doc.analysis, undefined);
  assert.equal(doc.executiveContext, undefined);
});

test("an external financial report retains its own extracted price and ROI", async () => {
  const doc = await parse("Property price €210,000. Invested capital €70,000. Annual revenue €42,000. Return on equity 18.0%. Net cash flow €12,600.");
  assert.equal(doc.analysis.propertyPrice, 210000);
  assert.equal(doc.analysis.roi, 18);
  assert.equal(doc.analysis.cashflow, 12600);
  assert.equal(doc.executiveContext.isFinancialReport, true);
});
