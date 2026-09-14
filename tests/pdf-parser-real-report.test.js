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

test("PDF parser ignores chart scale values in the feasibility report", async () => {
  const context = {
    window: { RB_DEBUG: false },
    console: { debug() {}, error() {} }
  };
  vm.createContext(context);
  vm.runInContext(parserSource, context);

  const documentObject = {
    extractedText: `
      59.4% ROI sul capitale proprio 0% Benchmark locale 8.4% 40%
      Punteggio investimento Esito Rischio Qualità dati 93 ACQUISTA Basso Completi
      ROI SUL CAPITALE PROPRIO 59.4%
      Prezzo immobile Ricavi annui Cashflow netto ROI equity
      80.000 € 38.325 € 14.254 € 59.4%
      Importo richiesto 56.000 € LTV 70.0% DSCR 5.90
      Indice rischio 23/100 Valutazione Rischio basso
      ROI equity di mercato 8.4%
      Raccomandazione finale ACQUISTA
    `
  };

  await context.window.rbParseExecutivePDF(documentObject);

  assert.equal(documentObject.analysis.roi, 59.4);
  assert.equal(documentObject.analysis.propertyPrice, 80000);
  assert.equal(documentObject.analysis.mortgage, 56000);
  assert.equal(documentObject.analysis.equity, 24000);
  assert.equal(documentObject.analysis.risk, 23);
  assert.equal(documentObject.analysis.verdict, "BUY");
});

test("PDF parser reads common labels from an external English report", async () => {
  const context = {
    window: { RB_DEBUG: false },
    console: { debug() {}, error() {} }
  };
  vm.createContext(context);
  vm.runInContext(parserSource, context);

  const documentObject = {
    extractedText: `
      Property price €210,000
      Invested capital €70,000
      Loan amount €140,000
      Annual revenue €42,000
      Net cash flow €12,600
      Return on equity 18.0%
      Risk score 34/100
      Occupancy rate 72%
      Average daily rate €165
      Investment score 81/100
      Recommendation BUY
    `
  };

  await context.window.rbParseExecutivePDF(documentObject);

  assert.equal(documentObject.analysis.roi, 18);
  assert.equal(documentObject.analysis.propertyPrice, 210000);
  assert.equal(documentObject.analysis.equity, 70000);
  assert.equal(documentObject.analysis.mortgage, 140000);
  assert.equal(documentObject.analysis.gross, 42000);
  assert.equal(documentObject.analysis.cashflow, 12600);
  assert.equal(documentObject.analysis.risk, 34);
  assert.equal(documentObject.analysis.occupancy, 72);
  assert.equal(documentObject.analysis.investmentScore, 81);
  assert.equal(documentObject.analysis.verdict, "BUY");
});
