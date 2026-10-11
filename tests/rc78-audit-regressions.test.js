import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
function chat(){
 const document={getElementById:id=>['price','analyze-btn'].includes(id)?{value:'150000'}:null};
 const window={rbGetInvestmentAnalysisState:()=>({status:'missing'})};
 const c={window,document,console,Intl,Date};vm.createContext(c);
 for(const f of ['query-normalizer','investment-autopilot-engine','renovation-recovery-engine','chatbot-orchestrator'])vm.runInContext(read('js/chatbot/core/'+f+'.js'),c);
 return window;
}
test('common Italian and English ROI definitions do not require completed analysis',async()=>{
 for(const q of ['Cosa vuol dire ROI?','Mi spieghi il roy?','Explain ROI','What does ROI stand for?','How is ROI calculated?','Come si calcola il ROI?','Il ROI con capitale proprio nullo?','ROI with no own capital?']){
  const result=await chat().rbProcessAIMessage(q);
  assert.equal(result.response?.type,'education',q);
  assert.match(result.response.textIT,/N\/A/);
 }
});
test('focused PDF followups win over actual investment and renovation handlers',async()=>{
 const w=chat();w.rbDocumentManager={getLast:()=>({id:'current'})};
 w.rbGenerateResponse=()=>({type:'document_grounded',textIT:'Source current PDF'});
 for(const q of ['Spiega i risultati','Explain the results','Come recupero i costi di ristrutturazione?','How can I recover renovation costs?']){
  w.rbPDFConversationDocumentId='current';
  const result=await w.rbProcessAIMessage(q);
  assert.equal(result.response?.type,'document_grounded',q);
 }
 w.rbPDFConversationDocumentId='current';
 const explicit=await w.rbProcessAIMessage('Autopilot investimento: leggi la mia analisi');
 assert.equal(explicit.response.type,'investment_autopilot');
});
function language(search,saved='it',browser='it-IT'){
 const callbacks={};let stored=saved;
 const window={location:{search},addEventListener:(e,f)=>callbacks[e]=f};
 const c={window,URLSearchParams,navigator:{language:browser},localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelectorAll:()=>[],querySelector:()=>null,documentElement:{setAttribute(){ }},getElementById:()=>null,dispatchEvent(){}},Node:{TEXT_NODE:3},CustomEvent:class{},setTimeout(){}};
 vm.runInNewContext(read('js/lang.js'),c);callbacks.DOMContentLoaded();
 return {window,stored};
}
test('language URLs override saved language while invalid URLs keep preference',()=>{
 assert.equal(language('?lang=en').window.currentLang,'en');
 assert.equal(language('?lang=it','en','en-GB').window.currentLang,'it');
 assert.equal(language('?lang=xx','en').window.currentLang,'en');
 assert.equal(language('',null,'en-GB').window.currentLang,'en');
});
