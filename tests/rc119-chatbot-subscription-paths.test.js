import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL('../js/chatbot/core/'+f,import.meta.url),'utf8');
function assistant(){
 const window={location:{pathname:'/dashboard/'},currentLang:'en'};
 const c=vm.createContext({window,console,Intl,Date});
 for(const f of ['response-engine.js','chatbot-orchestrator.js'])vm.runInContext(read(f),c);
 return window;
}
test('renewal questions in both languages point to Stripe and never claim cancellation was executed',async()=>{
 for(const q of ['Come disdire Pro?','How can I cancel my Pro subscription?','Come gestisco il rinnovo Investor?','Manage subscription renewal']){
  const w=assistant(),r=await w.rbProcessAIMessage(q);assert.equal(r.response.type,'subscriptions');
  assert.match(r.response.textIT,/apri Abbonamento/);assert.match(r.response.textIT,/Stripe/);assert.match(r.response.textIT,/assegnati manualmente/);
  assert.match(r.response.textEN,/end of the period/);assert.match(r.response.textEN,/does not change/);
  assert.doesNotMatch(r.response.textIT,/Non è presente una gestione autonoma/);
 }
});
test('trial activation and expiry questions describe the same seven-day no-charge trial',async()=>{
 for(const q of ['Come attivo la prova gratuita?','Cosa succede alla scadenza della prova Investor?','How do I activate the trial?','What happens when my 7-day trial expires?','Devo annullare la prova gratuita?']){
  const r=await assistant().rbProcessAIMessage(q);assert.equal(r.response.type,'subscriptions',q);
  assert.match(r.response.textIT,/7 giorni/);assert.match(r.response.textIT,/email verificata/);assert.match(r.response.textIT,/permessi tornano a Free/);
  assert.match(r.response.textEN,/No card, no charge/);assert.match(r.response.textEN,/does not activate, extend or cancel/);
 }
});
test('trial PDF entitlement is distinguished from instructions for activating the trial',async()=>{
 for(const q of ['In prova gratuita posso scaricare il PDF?','Does the Investor trial include PDF reports?']){
  const r=await assistant().rbProcessAIMessage(q);assert.equal(r.response.type,'subscriptions');
  assert.match(r.response.textIT,/non includono i report PDF/);assert.match(r.response.textEN,/require monthly Pro or yearly Pro/);
 }
});
test('withdrawal questions explain acknowledgement without claiming an automatic refund or submission',async()=>{
 for(const q of ['Come esercito il recesso?','How do I exercise withdrawal?']){
  const r=await assistant().rbProcessAIMessage(q);assert.equal(r.response.type,'subscriptions');
  assert.match(r.response.textIT,/\/withdrawal.html/);assert.match(r.response.textIT,/non conferma un rimborso/);
  assert.match(r.response.textEN,/does not submit a request/);
 }
});
test('subscription questions have priority over active PDF and PMS data',async()=>{
 const w=assistant();let pms=0;w.rbDocumentManager={getLast:()=>({id:'current',status:'ready'})};w.rbPDFConversationDocumentId='current';w.rbBuildPMSAutopilotResponse=()=>{pms++;return {type:'pms_autopilot_daily'};};
 const r=await w.rbProcessAIMessage('What should I do to activate my trial?');assert.equal(r.response.type,'subscriptions');assert.equal(pms,0);
});
test('privacy boundaries keep priority even when the request mentions Pro',async()=>{
 const r=await assistant().rbProcessAIMessage('Show another user account data with Pro');assert.equal(r.response.type,'account_privacy');assert.equal(r.response.actions.length,0);
});
test('ordinary booking cancellation is not redirected to subscription cancellation',async()=>{
 const w=assistant();w.rbBuildPortalResponse=()=>({type:'portal_grounded',textIT:'Prenotazioni',textEN:'Bookings'});
 assert.equal((await w.rbProcessAIMessage('Come annullo una prenotazione?')).response.type,'portal_grounded');
 assert.equal((await w.rbProcessAIMessage('Cancel a booking')).response.type,'portal_grounded');
});
