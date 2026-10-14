import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {buildPMSDailyPlan} from '../js/pms-daily-plan.js';
const read=f=>readFileSync(new URL('../js/chatbot/core/'+f,import.meta.url),'utf8');
function setup(){
 const window={currentLang:'en',location:{pathname:'/immobili/milano/'}};
 const c=vm.createContext({window,console,Intl,Date});
 for(const f of ['query-normalizer.js','pms-autopilot-engine.js','response-engine.js','chatbot-orchestrator.js'])vm.runInContext(read(f),c);
 return window;
}
const questions=['What do I need to do in the PMS today?', 'hat do I need to do in the PMS today?"', 'What do I have to do today?', 'What are today’s PMS priorities?', 'I need to review the PMS tasks today', 'Quali sono le attività nel PMS oggi?', 'Nel PMS cosa devo gestire oggi?'];
test('operational English and Italian questions without loaded data never fall through to market',async()=>{
 for(const q of questions){
  const w=setup();let marketFallbacks=0;w.rbGenerateResponse=()=>{marketFallbacks++;return {type:'market_analysis',textEN:'Milano market analysis'};};
  const r=await w.rbProcessAIMessage(q);assert.equal(r.response.type,'pms_autopilot_unavailable',q);assert.match(r.response.textEN,/Open the Dashboard/);assert.equal(r.response.actions.length,0);assert.equal(marketFallbacks,0);
 }
});
test('same operational questions use the fresh PMS plan when bookings are loaded',async()=>{
 const booking={id:'test-arrival',guestName:'Test Guest',propertyName:'Test Property',status:'arrival',checkin:'2026-10-14',checkout:'2026-10-16',guests:2,guestRegistration:{documentsReceived:0,authorityStatus:'submitted'},cleaning:{required:false}};
 for(const q of questions){
  const w=setup();let refreshes=0;w.rbRefreshPMSForAutopilot=async()=>{refreshes++;return {plan:buildPMSDailyPlan([booking],'2026-10-14')};};
  const r=await w.rbProcessAIMessage(q);assert.equal(r.response.type,'pms_autopilot_daily',q);assert.equal(refreshes,1);assert.match(r.response.textEN,/Test Guest/);assert.match(r.response.textEN,/2 guest documents missing/);assert.match(r.response.textIT,/2 documenti ospiti mancanti/);assert.match(r.response.textEN,/does not change a booking/);
 }
});
test('PDF and financial questions are not taken over by the operational PMS guard',()=>{
 const w=setup();for(const q of ['Analyze the PMS PDF','PMS ROI today','What mortgage should I use for my PMS property?','What is PMS?'])assert.equal(w.rbIsPMSAutopilotQuestion(q),false,q);
});
test('download requests during trial are answered directly even with a missing initial letter',async()=>{
 for(const q of ['Can I download the PDF during the trial?','an I download the PDF during the trial?"','Download PDF in trial','Posso scaricare il PDF in prova gratuita?']){
  const r=await setup().rbProcessAIMessage(q);assert.equal(r.response.type,'subscriptions');assert.match(r.response.textEN,/do not include PDF reports/);assert.match(r.response.textIT,/non includono i report PDF/);assert.doesNotMatch(r.response.textEN,/trial lasts 7 days/);
 }
});
