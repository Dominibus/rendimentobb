import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../js/chatbot/core/'+p,import.meta.url),'utf8');
function setup(){
 const c={window:{},document:{getElementById:id=>['price','analyze-btn'].includes(id)?{value:'150000'}:null},console,Intl,Date};
 vm.createContext(c);
 for(const p of ['query-normalizer.js','semantic-router.js','entity-engine.js','intent-engine.js','investment-autopilot-engine.js','pms-autopilot-engine.js'])vm.runInContext(read(p),c);
 return c;
}
test('ROI typos reach the same real intent parser as ROI without changing figures',()=>{
 const c=setup();
 for(const text of ['Spiegami il roy','Qual è il mio roy?','roy 8,5% con capitale 30.000 euro']){
  const n=c.window.rbNormalizeAIQuery(text);assert.match(n.text,/roi/i);assert.equal(n.corrections[0].to,'roi');
  assert.equal(c.window.rbDetectIntent(text).intent,c.window.rbDetectIntent(text.replace(/roy/i,'roi')).intent);
 }
 assert.equal(c.window.rbNormalizeAIQuery('roy 8,5% con capitale 30.000 euro').text,'roi 8,5% con capitale 30.000 euro');
 const entities=c.window.rbExtractEntities('roy 8%');assert.equal(entities.roi,8);
});
test('known domain spelling is corrected without changing people, cities or ordinary words',()=>{
 const c=setup();const n=c.window.rbNormalizeAIQuery('mutou, cashfolw, ocupazione, ristruturazione e prenotazzioni');
 assert.equal(n.text,'mutuo, cashflow, occupazione, ristrutturazione e prenotazioni');
 for(const text of ['Ospite Roy: spiega la prenotazione','My friend Roy','Roy','Volla','royalty 8%'])assert.equal(c.window.rbNormalizeAIQuery(text).text,text);
});
test('investment Autopilot recognizes paraphrases and retains missing-data safeguards',()=>{
 const c=setup();
 for(const q of ['Sono corretti i parametri del simulatore?','Verifica i dati del mio investimento','Aiutami a capire questi risultati','Da dove parto con il simulatore?','What is the next step for my investment?','Review the simulator inputs']){
  const r=c.window.rbBuildInvestmentAutopilotResponse(q);assert.equal(r?.type,'investment_autopilot',q);assert.match(r.textEN,/not guaranteed returns/);
 }
 for(const q of ['Spiegami il roy','Differenza tra Pro mensile e annuale','Leggi il PDF','Controlla i documenti ospiti'])assert.equal(c.window.rbBuildInvestmentAutopilotResponse(q),null,q);
});
test('PMS Autopilot recognizes varied wording without swallowing financial questions',()=>{
 const c=setup();
 for(const q of ['C’è qualcosa da fare oggi?','Quali attività sono rimaste da gestire?','Which tasks are pending today?','Quali documenti sono mancanti?'])assert.equal(c.window.rbIsPMSAutopilotQuestion(q),true,q);
 for(const q of ['Spiegami il roy','Qual è il mio ROI?','Leggi il PDF'])assert.equal(c.window.rbIsPMSAutopilotQuestion(q),false,q);
});
test('investment Autopilot reports equity ROI as N/A for zero equity',()=>{
 const c=setup();c.window.rbGetInvestmentAnalysisState=()=>({status:'current',calculatedAt:Date.now(),tier:'paid',metrics:{roi:0,roiBasis:'equity',equity:0,annualCashflow:1200,monthlyCashflow:100}});
 const r=c.window.rbBuildInvestmentAutopilotResponse('Leggi la mia analisi');
 assert.match(r.textIT,/ROI sul capitale proprio: N\/A/);assert.match(r.textEN,/Return on equity: N\/A/);
 assert.doesNotMatch(r.textEN,/Return on equity: 0/);
});
test('renovation chatbot uses loaded owner data and rejects another account',()=>{
 const c=setup();vm.runInContext(read('renovation-recovery-engine.js'),c);
 c.window.currentUser={uid:'owner'};c.window.getUserAccess=()=>({isPro:true});
 let r=c.window.rbBuildRenovationRecoveryResponse('Quando rientro dalle spese di ristruturazione?');assert.match(r.textIT,/attendi il caricamento/);
 c.window.rbRenovationRecoveryData={ownerUid:'owner',loadedAt:'2026-10-09',totalSpent:10000,rows:[{name:'Test',actualSpent:10000,annualCashflow:5000,paybackYears:2,projections:[{balance:-5000},{balance:5000},{balance:15000}]}]};
 r=c.window.rbBuildRenovationRecoveryResponse('Quando rientro dalle spese di ristrutturazione?');assert.equal(r.confidence,1);assert.match(r.textIT,/2 anni/);assert.match(r.textEN,/not actual receipts/);
 c.window.currentUser={uid:'other'};r=c.window.rbBuildRenovationRecoveryResponse('Renovation costs payback');assert.equal(r.confidence,0);assert.doesNotMatch(r.textEN,/10,000/);
 assert.equal(c.window.rbBuildRenovationRecoveryResponse('How does the annual plan pricing work?'),null);
});
