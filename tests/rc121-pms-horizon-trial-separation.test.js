import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {buildPMSDailyPlan} from '../js/pms-daily-plan.js';
const read=f=>readFileSync(new URL('../js/chatbot/core/'+f,import.meta.url),'utf8');
function setup(bookings=[]){
 const window={currentLang:'it'};const c=vm.createContext({window,console,Intl,Date});
 for(const f of ['query-normalizer.js','pms-autopilot-engine.js','response-engine.js','chatbot-orchestrator.js'])vm.runInContext(read(f),c);
 window.rbRefreshPMSForAutopilot=async()=>({plan:buildPMSDailyPlan(bookings,'2026-10-14')});
 return window;
}
test('seven-day PMS suggestions route to operational horizon instead of trial information',async()=>{
 const next={id:'arrival',guestName:'Test Future Guest',propertyName:'Test Property',status:'arrival',checkin:'2026-10-18',checkout:'2026-10-20',guests:2,guestRegistration:{documentsReceived:0,authorityStatus:'pending'}};
 for(const q of ['Prossimi 7 giorni nel PMS','Prossimi sette giorni nel PMS','Next 7 days in the PMS','Next seven days in the PMS']){
  const r=await setup([next]).rbProcessAIMessage(q);assert.equal(r.response.type,'pms_autopilot_horizon',q);assert.match(r.response.textIT,/Test Future Guest/);assert.match(r.response.textEN,/Test Future Guest/);assert.doesNotMatch(r.response.textIT,/La prova Investor dura/);
 }
});
test('an empty next week does not hide later arrivals or imply all tasks are complete',async()=>{
 const later={id:'later',guestName:'Test Later Guest',propertyName:'Test Property',status:'arrival',checkin:'2026-10-22',checkout:'2026-10-23',guests:1,cleaning:{required:false},guestRegistration:{documentsReceived:1,authorityStatus:'pending'}};
 const w=setup([later]);const plan=buildPMSDailyPlan([later],'2026-10-14');assert.equal(plan.counts.upcoming,1);
 const r=await w.rbProcessAIMessage('Prossimi 7 giorni nel PMS');assert.equal(r.response.type,'pms_autopilot_horizon');assert.match(r.response.textIT,/2026-10-15 → 2026-10-21/);assert.match(r.response.textIT,/Nessun arrivo futuro rilevato nel periodo/);assert.doesNotMatch(r.response.textIT,/Test Later Guest/);
});
test('explicit Investor trial questions keep product priority over PMS and a PDF',async()=>{
 for(const q of ['Come attivo la prova di 7 giorni?','Come funziona la prova di sette giorni?','7-day Investor trial','How do I activate the free trial?']){
  const w=setup();w.rbDocumentManager={getLast:()=>({id:'current'})};const r=await w.rbProcessAIMessage(q);assert.equal(r.response.type,'subscriptions',q);assert.match(r.response.textIT,/La prova Investor dura 7 giorni/);
 }
});
