import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {MemoryFirestore} from './helpers/pms-memory-firestore.js';
import {startAccountTrial,createAccountPortal,saveCheckoutContract,getAccountContract} from '../lib/account-subscription-service.js';
import {getPlanForScope,getBillingPlanForScope} from '../js/account-plan.js';
import {TERMS_VERSION,TRIAL_DAYS} from '../js/subscription-offer.js';
const now=1800000000000,timestamp=ms=>({seconds:ms/1000});
const base=db=>({db,uid:'u1',email:'a@example.test',emailVerified:true,liveMode:true,acceptedTerms:true,termsVersion:TERMS_VERSION,timestamp,now});
const seed=(extra={})=>new MemoryFirestore({'users/u1':{plan:'free'},...extra});
test('concurrent trial activation succeeds once and cannot renew on retry',async()=>{
 const db=seed();const results=await Promise.allSettled(Array.from({length:8},()=>startAccountTrial(base(db))));
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 assert.ok(results.filter(r=>r.status==='rejected').every(r=>r.reason.code==='TRIAL_ALREADY_USED'));
 const user=db.documents.get('users/u1');assert.equal(user.plan,'free');
 assert.equal(getPlanForScope(user,false,now),'investor');assert.equal(getBillingPlanForScope(user,false),'free');
 assert.equal(getPlanForScope(user,false,now+TRIAL_DAYS*86400000),'free');
 assert.equal(getPlanForScope(user,false,now-1),'free');
});
test('verified email identity prevents reused trial from another UID, not another email',async()=>{
 const db=seed({'users/u2':{plan:'free'}});await startAccountTrial(base(db));
 await assert.rejects(startAccountTrial({...base(db),uid:'u2',email:' A@EXAMPLE.TEST '}),e=>e.code==='TRIAL_ALREADY_USED');
 await startAccountTrial({...base(db),uid:'u2',email:'b@example.test'});
});
test('unverified identity, missing profile, paid plan and stale terms cannot activate',async()=>{
 for(const [extra,code] of [[{emailVerified:false},'EMAIL_VERIFICATION_REQUIRED'],[{email:null},'EMAIL_VERIFICATION_REQUIRED'],[{acceptedTerms:false},'TERMS_REQUIRED'],[{termsVersion:'old'},'TERMS_REQUIRED'],[{uid:'absent'},'PROFILE_REQUIRED']]){
  const db=seed();await assert.rejects(startAccountTrial({...base(db),...extra}),e=>e.code===code);assert.equal(db.documents.size,1);
 }
 const db=seed({'users/u1':{plan:'pro'}});await assert.rejects(startAccountTrial(base(db)),e=>e.code==='ACTIVE_SUBSCRIPTION');
});
test('sandbox trial and malformed or excessive dates never grant live access',async()=>{
 const db=seed();await startAccountTrial({...base(db),liveMode:false});
 const user=db.documents.get('users/u1');assert.equal(getPlanForScope(user,false,now),'free');assert.equal(getPlanForScope(user,true,now),'investor');
 for(const ends of [timestamp(now),timestamp(now+8*86400000),'2099-01-01'])assert.equal(getPlanForScope({plan:'free',trialStartedAt:timestamp(now),trialEndsAt:ends},false,now),'free');
});
test('paid entitlement takes priority over active trial',()=>assert.equal(getPlanForScope({plan:'investor',trialStartedAt:timestamp(now),trialEndsAt:timestamp(now+86400000)},false,now),'investor'));
test('portal uses only protected customer for account and environment',async()=>{
 const db=seed({'users/u1':{plan:'pro',stripeCustomerId:'cus_live',sandboxStripeCustomerId:'cus_test'}});const calls=[];
 const stripe={billingPortal:{sessions:{create:async p=>{calls.push(p);return {url:'https://billing.stripe.com/p/owned'};}}}};
 await createAccountPortal({db,stripe,uid:'u1',liveMode:true,baseUrl:'https://example.test',locale:'en'});
 await createAccountPortal({db,stripe,uid:'u1',liveMode:false,baseUrl:'https://example.test'});
 assert.deepEqual(calls.map(c=>c.customer),['cus_live','cus_test']);
 await assert.rejects(createAccountPortal({db,stripe,uid:'other',liveMode:true,baseUrl:'https://example.test'}),e=>e.code==='BILLING_ACCOUNT_NOT_FOUND');assert.equal(calls.length,2);
});
test('contract freezes accepted terms and is idempotent even after checkout lock removal',async()=>{
 const key=createHash('sha256').update('live:u1').digest('hex');
 const db=seed({['_stripe_checkouts/'+key]:{sessionId:'cs_live_1',termsVersion:TERMS_VERSION,termsSnapshot:{terms:[{it:'originale',en:'original'}],withdrawal:[]},plan:'pro',acceptedAt:'2026-10-09T15:00:00Z'}});
 const session={id:'cs_live_1',client_reference_id:'u1',livemode:true,mode:'subscription',payment_status:'paid',subscription:'sub_1',metadata:{termsVersion:TERMS_VERSION},amount_total:2900,currency:'eur',created:now/1000};
 const args={db,session,subscription:{current_period_end:now/1000+2592000},liveMode:true,now};
 const saved=await saveCheckoutContract(args);db.documents.delete('_stripe_checkouts/'+key);
 assert.deepEqual(await saveCheckoutContract({...args,now:now+500}),saved);
 db.documents.set('users/u1',{stripeSessionId:'cs_live_1'});
 assert.equal((await getAccountContract({db,uid:'u1',liveMode:true})).contract.terms.terms[0].it,'originale');
 db.documents.set('users/u2',{stripeSessionId:'cs_live_1'});
 await assert.rejects(getAccountContract({db,uid:'u2',liveMode:true}),e=>e.code==='CONTRACT_NOT_AVAILABLE');
 await assert.rejects(getAccountContract({db,uid:'u1',liveMode:false}),e=>e.code==='CONTRACT_NOT_AVAILABLE');
});
test('legacy and wrong environment purchases do not invent accepted terms',async()=>{
 const db=seed();assert.equal(await saveCheckoutContract({db,session:{},subscription:{},liveMode:true}),null);
 await assert.rejects(saveCheckoutContract({db,session:{metadata:{termsVersion:TERMS_VERSION},client_reference_id:'u1',livemode:false,mode:'subscription',payment_status:'paid'},subscription:{},liveMode:true}),/identity mismatch/);
 assert.equal(db.documents.size,1);
});
test('rules protect trial profile fields and use server time with a seven-day bound',()=>{
 const rules=fs.readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');
 assert.equal((rules.match(/"trialStartedAt", "trialEndsAt", "trialTermsVersion"/g)||[]).length,2);
 assert.match(rules,/end > request.time/);assert.match(rules,/end <= start \+ duration.value\(7, "d"\)/);
});

// Exercise the real endpoint without credentials, provider calls or real writes.
import vm from 'node:vm';
import {SubscriptionError} from '../lib/account-subscription-service.js';
import {CheckoutConflict} from '../lib/stripe-checkout-guard.js';
function apiHarness(enabled=true){
 const db=seed();let checkoutCalls=0;const portalCalls=[];
 const stripe={billingPortal:{sessions:{create:async p=>{portalCalls.push(p);return {url:'https://billing.stripe.com/p/owned'};}}}};
 const firestore=()=>db;firestore.Timestamp={fromMillis:timestamp};
 const context={process:{env:{STRIPE_SECRET_KEY:'sk_live_test_boundary',BASE_URL:'https://example.test',RB_INVESTOR_TRIAL_ENABLED:enabled?'true':'false'}},console:{error(){}},Stripe:function(){return stripe;},admin:{apps:[{}],firestore,auth:()=>({verifyIdToken:async()=>({uid:'u1',email:'a@example.test',email_verified:true})})},getStripePrices:()=>({pro:'price_pro'}),TERMS_VERSION,startAccountTrial,createAccountPortal,getAccountContract,SubscriptionError,CheckoutConflict,guardedCheckout:async()=>{checkoutCalls++;return {url:'https://checkout.stripe.com/owned'};}};
 const source=fs.readFileSync(new URL('../api/create-checkout-session.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace('export default async function handler','async function handler');vm.createContext(context);vm.runInContext(source+'\nglobalThis.handler=handler;',context);
 return {db,portalCalls,get checkoutCalls(){return checkoutCalls;},async send(body,authorized=true){const res={setHeader(){},status(c){this.code=c;return this;},json(b){this.body=b;return this;}};await context.handler({method:'POST',headers:authorized?{authorization:'Bearer synthetic-token'}:{},body},res);return res;}};
}
test('all account actions require authentication and disabled trial performs no writes',async()=>{
 const h=apiHarness(false);
 for(const action of ['trial','portal','contract','checkout'])assert.equal((await h.send({action,plan:'pro'},false)).code,401);
 assert.equal((await h.send({action:'trial',acceptedTerms:true,termsVersion:TERMS_VERSION})).body.code,'TRIAL_NOT_ENABLED');assert.equal(h.db.documents.size,1);assert.equal(h.checkoutCalls,0);
});
test('actual API requires current explicit acceptance before Stripe creation',async()=>{
 const h=apiHarness();for(const body of [{plan:'pro'},{plan:'pro',acceptedTerms:true,termsVersion:'old'}])assert.equal((await h.send(body)).code,400);
 assert.equal(h.checkoutCalls,0);assert.equal((await h.send({plan:'pro',acceptedTerms:true,termsVersion:TERMS_VERSION})).code,200);assert.equal(h.checkoutCalls,1);
});
test('trial action can grant Investor but never creates a payment session',async()=>{
 const h=apiHarness();assert.equal((await h.send({action:'trial',acceptedTerms:true,termsVersion:TERMS_VERSION})).code,200);
 const user=h.db.documents.get('users/u1');assert.equal(getPlanForScope(user,false),'investor');assert.equal(user.plan,'free');assert.equal(h.checkoutCalls,0);
});
test('actual portal endpoint ignores client supplied customer and owner',async()=>{
 const h=apiHarness();h.db.documents.set('users/u1',{stripeCustomerId:'cus_owned'});
 assert.equal((await h.send({action:'portal',customer:'cus_foreign',uid:'other'})).code,200);assert.equal(h.portalCalls[0].customer,'cus_owned');
});
test('purchase review cannot call Stripe until acceptance, and account change cancels it',async()=>{
 const full=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8');const code=full.slice(full.indexOf('window.buyPlan = async function(plan){'),full.indexOf('// ================= PROPERTY SCRAPER',full.indexOf('window.buyPlan = async function(plan){')));
 let accept,requests=0;const user={uid:'u1',getIdToken:async()=> 'synthetic-token'};
 const c={window:{currentUser:user,currentLang:'it',rbReviewPurchase:()=>new Promise(r=>accept=r),location:{assign(){}}},showToast(){},fetch:async()=>{requests++;return {ok:true,status:200,json:async()=>({url:'https://checkout.stripe.com/owned'})};}};vm.createContext(c);vm.runInContext(code,c);
 const cancelled=c.window.buyPlan('pro');assert.equal(requests,0);accept(false);await cancelled;assert.equal(requests,0);
 const switched=c.window.buyPlan('pro');c.window.currentUser={uid:'other'};accept(true);await switched;assert.equal(requests,0);
 c.window.currentUser=user;const accepted=c.window.buyPlan('pro');assert.equal(requests,0);accept(true);await accepted;assert.equal(requests,1);
});
test('real access resolver grants trial Investor features and denies Pro PDF, then expires',()=>{
 const source=fs.readFileSync(new URL('../js/firebase-init.js',import.meta.url),'utf8');const start=source.indexOf('window.getUserAccess = function(){');const end=source.indexOf('\n};',start)+3;
 const trialNow=Date.now();const c={resolveAccountPlan:(data,host)=>getPlanForScope(data,false),window:{location:{hostname:'www.rendimentobb.it'},currentUser:{uid:'u1'},rbAccountOwner:'u1',rbAccountData:{plan:'free',trialStartedAt:timestamp(trialNow-1000),trialEndsAt:timestamp(trialNow+86400000)},currentPlan:'investor',userRole:'user'}};
 vm.createContext(c);vm.runInContext(source.slice(start,end),c);const access=c.window.getUserAccess();assert.equal(access.isInvestor,true);assert.equal(access.canSeeFullAnalysis,true);assert.equal(access.canDownloadPDF,false);assert.equal(access.isPro,false);
 c.window.rbAccountData.trialEndsAt=timestamp(trialNow-1);assert.equal(c.window.getUserAccess().isFree,true);assert.equal(c.window.getUserAccess().canDownloadPDF,false);
});
