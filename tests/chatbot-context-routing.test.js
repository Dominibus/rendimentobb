import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const load=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
function setup(){
 const doc={id:'napoli',status:'ready',fileName:'Napoli.pdf',analysis:{investmentScore:9,dscr:.71,benchmarkROI:10.2,roi:-7.2,cashflow:-11418,risk:78,roiBasis:'equity'}};
 const window={currentUser:{uid:'owner'},getUserAccess:()=>({isPro:true}),rbPMSData:{ownerUid:'owner',portalSnapshotReady:true,propertyList:[],portalBookingList:[],renovationList:[]},rbDocumentManager:{getLast:()=>doc},rbPDFConversationDocumentId:'napoli'};
 const c={window,console,Date,Intl};vm.createContext(c);
 for(const file of ['js/chatbot/document-engine.js','js/chatbot/core/portal-facts-engine.js','js/chatbot/core/chatbot-orchestrator.js'])vm.runInContext(load(file),c);
 window.rbDocumentManager={getLast:()=>doc};
 window.rbGenerateResponse=({message,documentKnowledge})=>window.rbBuildPDFResponse(message,documentKnowledge.activeDocument);
 return {window,doc};
}
test('exact payment question is grounded in PMS and never falls through to market',async()=>{
 const {window}=setup();const result=await window.rbProcessAIMessage('Quanto devo pagare domani?');
 assert.equal(result.response.type,'portal_grounded');assert.match(result.response.textIT,/Non posso indicare un totale certo/);assert.doesNotMatch(result.response.textIT,/ROI medio/);
});
test('all indicators follow-up returns six current PDF metrics through orchestrator',async()=>{
 const {window}=setup();const result=await window.rbProcessAIMessage('Spiegami insieme tutti gli indicatori');
 assert.equal(result.response.type,'document_grounded');
 for(const value of ['9/100','0,71','10,2%','-7,2%','11.418','78/100'])assert.ok(result.response.textIT.includes(value),value);
 assert.match(result.response.textIT,/Napoli.pdf/);
});
test('replacement PDF controls the subsequent risk follow-up',async()=>{
 const {window,doc}=setup();doc.id='roma';doc.fileName='Roma.pdf';doc.analysis.risk=23;window.rbPDFConversationDocumentId='roma';
 const result=await window.rbProcessAIMessage('E il rischio?');
 assert.match(result.response.textIT,/23\/100/);assert.match(result.response.textIT,/Roma.pdf/);assert.doesNotMatch(result.response.textIT,/78\/100/);
});
test('payment paraphrases use the same missing-ledger explanation and tomorrow date',()=>{
 const {window}=setup();
 for(const message of ['Quanto devo pagare domani?','Ho pagamenti in scadenza domani?','What do I owe tomorrow?']){
 const response=window.rbBuildPortalResponse(message,new Date('2026-10-01T12:00:00'));assert.equal(response.type,'portal_grounded');assert.equal(response.metadata.period.start,'2026-10-02');assert.match(response.textIT,/non registra un calendario/);
 }
});
