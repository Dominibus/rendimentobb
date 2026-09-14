import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const parserSource = await readFile(
  new URL("../js/chatbot/pdf-parser-engine.js", import.meta.url),
  "utf8"
);

test("PDF parser keeps ROI equity separate from invested capital", async () => {
  const context = {
    window: { RB_DEBUG: false },
    console: { debug() {}, error() {} }
  };
  vm.createContext(context);
  vm.runInContext(parserSource, context);

  const documentObject = {
    extractedText: `
      ROI EQUITY PREVISIONALE CLIENTE Utente RendimentoBB 59.4%
      PREZZO CAPITALE PROPRIO PROFITTO ANNUO
      80.000 € 24.000 € 14.254 €
      Investimento consigliato
      PUNTEGGIO 93/100 BREAK-EVEN 1.7 anni PROFITTO MENSILE 1.188 €
      MUTUO LTV DSCR 56.000 € 70.0% 5.90
      INDICE RISCHIO VALUTAZIONE 23/100 RISCHIO BASSO
    `
  };

  await context.window.rbParseExecutivePDF(documentObject);

  assert.equal(documentObject.analysis.roi, 59.4);
  assert.equal(documentObject.analysis.propertyPrice, 80000);
  assert.equal(documentObject.analysis.mortgage, 56000);
  assert.equal(documentObject.analysis.equity, 24000);
  assert.equal(documentObject.analysis.investmentScore, 93);
  assert.equal(documentObject.analysis.risk, 23);
  assert.equal(documentObject.analysis.verdict, "BUY");
});
