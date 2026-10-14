import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
// Text extracted by PyMuPDF from eight PDFs rendered by the actual generators
// with real jsPDF: both report types, languages and property modes.
const fixtures=JSON.parse(readFileSync(new URL('./fixtures/rc123-rendered-pdf-text.json',import.meta.url),'utf8'));
const source=readFileSync(new URL('../js/chatbot/pdf-parser-engine.js',import.meta.url),'utf8');
for(const [name,text] of Object.entries(fixtures))test(`PDF reader preserves actual exported financial evidence: ${name}`,async()=>{
 const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);
 const doc={type:'executive_report',extractedText:text};await ctx.window.rbParseExecutivePDF(doc);
 const owned=name.includes('owned');
 assert.equal(doc.analysis.roi,owned?null:32.7);
 assert.equal(doc.analysis.equity,owned?0:30000);
 assert.equal(doc.analysis.propertyPrice,owned?null:150000);
 assert.ok(Math.abs(doc.analysis.cashflow-(owned?18151.24:9799.82))<0.01);
 assert.equal(doc.aiSummary.roi,doc.analysis.roi);
 assert.equal(doc.executiveContext.grounding,'document_only');
});
