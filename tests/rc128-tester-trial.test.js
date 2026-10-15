import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {MemoryFirestore} from './helpers/pms-memory-firestore.js';
import {startAccountTrial} from '../lib/account-subscription-service.js';
import {TRIAL_DAYS,TERMS_VERSION,TESTER_TERMS_VERSION,activeTrial} from '../js/subscription-offer.js';
import {getPlanForScope} from '../js/account-plan.js';
import {CONTRACT_TERMS} from '../js/contract-terms.js';
const day=86400000,now=Date.UTC(2026,9,15,8,0),ts=ms=>({seconds:ms/1000});
const base={uid:'owner',email:'tester@example.test',emailVerified:true,acceptedTerms:true,termsVersion:TERMS_VERSION,timestamp:ts,now};
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
for(const liveMode of [true,false])test(`new tester activation is exactly 30 days; live=${liveMode}`,async()=>{
 const db=new MemoryFirestore({'users/owner':{plan:'free'}});
 const result=await startAccountTrial({...base,db,liveMode,trialDays:365});
 assert.equal(TRIAL_DAYS,30);assert.equal(Date.parse(result.trialEndsAt),now+30*day);
 const profile=db.documents.get('users/owner'),prefix=liveMode?'trial':'sandboxTrial';
 assert.equal(profile[`${prefix}TermsVersion`],TESTER_TERMS_VERSION);
 assert.equal(getPlanForScope(profile,!liveMode,now+29*day),'investor');
 assert.equal(getPlanForScope(profile,!liveMode,now+30*day-1),'investor');
 assert.equal(getPlanForScope(profile,!liveMode,now+30*day),'free');
 assert.equal(getPlanForScope(profile,!liveMode,now+31*day),'free');
 assert.equal(profile.plan,'free');
 if(!liveMode)assert.equal(getPlanForScope(profile,false,now),'free');
 await assert.rejects(startAccountTrial({...base,db,liveMode,now:now+31*day}),e=>e.code==='TRIAL_ALREADY_USED');
});
test('old trials preserve their actual expiry and never gain access from invalid longer dates',()=>{
 const legacy={plan:'free',trialStartedAt:ts(now),trialEndsAt:ts(now+7*day),trialTermsVersion:'2026-10-14-rc122'};
 assert.equal(getPlanForScope(legacy,false,now+7*day-1),'investor');
 assert.equal(getPlanForScope(legacy,false,now+7*day),'free');
 for(const version of [undefined,'2026-10-14-rc122','unknown'])assert.equal(activeTrial({...legacy,trialEndsAt:ts(now+8*day),trialTermsVersion:version},false,now),false);
 const tester={...legacy,trialTermsVersion:TESTER_TERMS_VERSION};
 assert.equal(activeTrial({...tester,trialEndsAt:ts(now+30*day)},false,now),true);
 assert.equal(activeTrial({...tester,trialEndsAt:ts(now+31*day)},false,now),false);
});
test('activation rejects stale terms, unverified email, reused address and existing paid access',async()=>{
 const db=new MemoryFirestore({'users/owner':{plan:'free'},'users/other':{plan:'free'},'users/paid':{plan:'pro',stripeLiveMode:true}});
 await assert.rejects(startAccountTrial({...base,db,liveMode:true,termsVersion:'2026-10-14-rc122'}),e=>e.code==='TERMS_REQUIRED');
 await assert.rejects(startAccountTrial({...base,db,liveMode:true,emailVerified:false}),e=>e.code==='EMAIL_VERIFICATION_REQUIRED');
 await assert.rejects(startAccountTrial({...base,db,liveMode:true,uid:'paid'}),e=>e.code==='ACTIVE_SUBSCRIPTION');
 await startAccountTrial({...base,db,liveMode:true});
 await assert.rejects(startAccountTrial({...base,db,liveMode:true,uid:'other'}),e=>e.code==='TRIAL_ALREADY_USED');
});
test('current contract copy and public IT/EN documentation match the tester offer',()=>{
 assert.equal(CONTRACT_TERMS.version,TERMS_VERSION);
 assert.ok(CONTRACT_TERMS.terms.some(row=>row.it.includes('30 giorni')&&row.en.includes('30 days')));
 for(const p of ['index.html','tool/index.html','dashboard/index.html','plans.html','terms.html','plan-interest.html','contact.html','privacy.html']){
  const s=read(p);assert.match(s,/30 giorni/);assert.match(s,/30 days|30-day|30 free days/);
  assert.doesNotMatch(s,/7 giorni|7 days|7-day/);
 }
 assert.match(read('terms.html'),/non vengono prorogate, riattivate o cancellate/);
 assert.match(read('privacy.html'),/consenso separato/);
 assert.match(read('contact.html'),/non è un preordine/);
});
test('old and new trial questions in IT/EN route to the 30-day tester offer; PMS stays seven days',async()=>{
 const window={currentLang:'en',location:{pathname:'/dashboard/'}};
 const context=vm.createContext({window,console,Intl,Date});
 for(const file of ['response-engine.js','chatbot-orchestrator.js'])vm.runInContext(read('js/chatbot/core/'+file),context);
 for(const q of ['Come attivo la prova di 30 giorni?','Come divento tester?','How do I become a tester?','How do I activate the 30-day trial?','Come attivo la prova di 7 giorni?']){
  const response=(await window.rbProcessAIMessage(q)).response;assert.equal(response.type,'subscriptions',q);
  assert.match(response.textIT,/30 giorni/);assert.match(response.textEN,/30 days/);
  assert.match(response.textEN,/Earlier trials retain/);
 }
 assert.match(read('js/chatbot/core/pms-autopilot-engine.js'),/7 giorni|7 days/);
 assert.match(read('js/dashboard.js'),/Prossimi 7 giorni/);
});
test('about, collaboration, skills and footer make the testing stage and non-binding contact clear in both languages',()=>{
 const about=read('about/index.html');assert.match(about,/Diventa uno dei primi tester/);assert.match(about,/Become one of our first testers/);
 assert.ok(about.includes('/plan-interest.html'));assert.match(about,/PDF esclusi/);
 for(const p of ['partner/index.html','lavora-con-noi/index.html']){
  const html=read(p);assert.match(html,/non costituisce un’offerta di lavoro/);assert.match(html,/not a job offer/);
  assert.ok(html.includes('/privacy.html#business-enquiries'));assert.ok(html.includes('/plans.html#tester-programme'));
 }
 const footer=read('js/footer.js');assert.ok(footer.includes('/plans.html#tester-programme'));assert.ok(footer.includes('/plan-interest.html'));
 assert.match(read('privacy.html'),/id="business-enquiries"/);
});
