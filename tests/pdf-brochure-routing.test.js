import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const parserSource = await readFile(new URL("../js/chatbot/pdf-parser-engine.js", import.meta.url), "utf8");
const responseSource = await readFile(new URL("../js/chatbot/core/response-engine.js", import.meta.url), "utf8");

async function setup(){
  const window={RB_DEBUG:false,location:{pathname:"/tool/"},getUserAccess:()=>({isPro:true})};
  const sandbox={window,document:{getElementById:()=>null,querySelector:()=>null},console:{debug(){},warn(){},error(){}}};
  vm.createContext(sandbox);
  vm.runInContext(parserSource,sandbox);
  vm.runInContext(responseSource,sandbox);
  const documentObject={type:"generic_pdf",extractedText:`BROCHURE IMMOBILIARE - DOCUMENTO DI TEST
PREZZO IMMOBILE €210.000
Superficie 85 mq Camere da letto 2 Bagni 1
Il documento non contiene dati su ricavi, occupazione, costi operativi o finanziamento.
Nessun indicatore finanziario e stato calcolato dal venditore.`};
  await window.rbParseExecutivePDF(documentObject);
  return {window,documentObject};
}

test("brochure wording about absent financing does not become a zero mortgage",async()=>{
  const {documentObject}=await setup();
  assert.equal(documentObject.analysis.reportType,"property_document");
  assert.equal(documentObject.analysis.propertyPrice,210000);
  assert.equal(documentObject.analysis.mortgage,null);
  assert.equal(documentObject.analysis.equity,null);
  assert.equal(documentObject.analysis.roi,null);
});

test("upload summary and price follow-up stay grounded in the active brochure",async()=>{
  const {window,documentObject}=await setup();
  for(const [message,intent] of [
    ["Analizza automaticamente il documento appena caricato. Fornisci un Executive Summary.","investment_executive"],
    ["Qual è il prezzo dell’immobile e quali dati finanziari mancano?","market_analysis"]
  ]){
    const response=window.rbGenerateResponse({message,intent:{intent},documentKnowledge:{activeDocument:documentObject,activeReport:documentObject},analysisData:{}});
    assert.equal(response.type,"document_grounded_summary");
    assert.match(response.textIT,/210\.000/);
    assert.match(response.textIT,/ROI: dato non disponibile/);
    assert.doesNotMatch(response.textIT,/Analisi mercato Firenze|Score AI\s*0\/100/);
  }
});
