import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../js/chatbot/core/chatbot-orchestrator.js',import.meta.url),'utf8');
function setup({focused=true,document=true}={}){
 let liveCalls=0,pdfCalls=0;
 const window={rbDocumentManager:{getLast:()=>document?{id:'current-pdf'}:null},rbPDFConversationDocumentId:focused?'current-pdf':null,
  rbGenerateResponse:()=>{pdfCalls++;return {type:'document_grounded',textIT:'Solo dati del PDF corrente'};},
  rbBuildInvestmentAutopilotResponse:()=>{liveCalls++;return {type:'investment_autopilot',textIT:'Simulazione precedente: 987654321'};}};
 vm.runInNewContext(source,{window,console});return {window,counts:()=>({liveCalls,pdfCalls})};
}
for(const q of ['E quindi quanto rende?','Quanto rende?','Qual è il rendimento?','So what is the return?','How much will I earn?'])test('RC209 asks scope before quoting another analysis: '+q,async()=>{
 const h=setup();const r=await h.window.rbProcessAIMessage(q);
 assert.equal(r.intent.intent,'clarification');assert.equal(r.response.metadata.documentId,'current-pdf');
 assert.match(r.response.textIT,/PDF.*simulazione/);assert.match(r.response.textEN,/PDF.*simulation/);
 assert.doesNotMatch(r.response.textIT,/987654321|\d/);assert.doesNotMatch(r.response.textEN,/987654321|\d/);
 assert.deepEqual(h.counts(),{liveCalls:0,pdfCalls:0});assert.equal(h.window.rbPDFConversationDocumentId,'current-pdf');
});
test('RC209 explicit PDF question still reads only the PDF',async()=>{const h=setup();const r=await h.window.rbProcessAIMessage('Quanto rende questo PDF?');assert.equal(r.intent.intent,'pdf_analysis');assert.deepEqual(h.counts(),{liveCalls:0,pdfCalls:1});});
test('RC209 user can explicitly return to the original simulation',async()=>{const h=setup();const r=await h.window.rbProcessAIMessage('Riepiloga la simulazione originale');assert.equal(r.intent.intent,'investment_autopilot');assert.deepEqual(h.counts(),{liveCalls:1,pdfCalls:0});assert.equal(h.window.rbPDFConversationDocumentId,null);});
for(const opt of [{focused:false},{document:false}])test('RC209 no clarification is imposed without current PDF focus '+JSON.stringify(opt),async()=>{const h=setup(opt);const r=await h.window.rbProcessAIMessage('Quanto rende?');assert.equal(r.intent.intent,'investment_autopilot');assert.equal(h.counts().liveCalls,1);});
