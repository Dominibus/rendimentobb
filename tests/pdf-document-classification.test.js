import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const classifierSource = await readFile(new URL("../js/chatbot/core/document-classifier.js", import.meta.url), "utf8");
const parserSource = await readFile(new URL("../js/chatbot/pdf-parser-engine.js", import.meta.url), "utf8");

function context(){
  const sandbox = {window:{RB_DEBUG:false},console:{debug(){},error(){}}};
  vm.createContext(sandbox);
  vm.runInContext(classifierSource,sandbox);
  vm.runInContext(parserSource,sandbox);
  return sandbox.window;
}

test("a test brochure mentioning RendimentoBB in its filename stays a generic PDF", async()=>{
  const w=context();
  const classification=w.rbClassifyDocument({name:"Brochure_Immobile_Test_RendimentoBB.pdf"});
  assert.equal(classification.type,"generic_pdf");
  const doc={type:classification.type,extractedText:"PREZZO IMMOBILE €210.000 Superficie 85 mq Camere 2 Bagni 1"};
  await w.rbParseExecutivePDF(doc);
  assert.equal(doc.analysis.reportType,"property_document");
  assert.equal(doc.analysis.propertyPrice,210000);
  assert.equal(doc.analysis.roi,null);
  assert.equal(doc.analysis.cashflow,null);
  assert.equal(doc.analysis.verdict,null);
});

test("an explicitly named RendimentoBB report remains an Executive Report",()=>{
  const w=context();
  assert.equal(w.rbClassifyDocument({name:"RendimentoBB-report-investimento.pdf"}).type,"executive_report");
});
