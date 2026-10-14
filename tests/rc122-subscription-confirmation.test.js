import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {MemoryFirestore} from './helpers/pms-memory-firestore.js';
import {saveCheckoutContract} from '../lib/account-subscription-service.js';
import {TERMS_VERSION} from '../js/subscription-offer.js';
import {CONTRACT_TERMS} from '../js/contract-terms.js';
import {deliverSubscriptionConfirmation, drainSubscriptionConfirmations, subscriptionConfirmation} from '../lib/subscription-confirmation.js';
import {Resend} from 'resend';
import {sendCheckedEmail} from '../lib/email-templates.js';
const now=Date.UTC(2026,9,14,9);
test('installed Resend SDK sends the real HTTP idempotency header without dropping authentication or sharing keys',async()=>{
  const previous=globalThis.fetch,requests=[];
  globalThis.fetch=async(url,options)=>{requests.push({url,headers:new Headers(options.headers)});return {ok:true,json:async()=>({id:'mock-accepted'})};};
  try{
    const client=new Resend('re_local_test_only');
    await Promise.all(['contract-a','contract-b'].map(key=>sendCheckedEmail(client,{from:'test@example.test',to:['owner@example.test'],subject:'TEST',text:'No actual mail'}, {idempotencyKey:key})));
    assert.equal(requests.length,2);
    assert.deepEqual(requests.map(row=>row.headers.get('Idempotency-Key')).sort(),['contract-a','contract-b']);
    for(const row of requests){assert.equal(row.url,'https://api.resend.com/emails');assert.equal(row.headers.get('Authorization'),'Bearer re_local_test_only');}
    assert.equal(client.headers.get('Idempotency-Key'),null);
  }finally{globalThis.fetch=previous;}
});
function provider(fail=false){const sent=[];return {sent,emails:{send:async(mail,options)=>{sent.push({mail,options});return fail?{error:{message:'unavailable'}}:{data:{id:'accepted-1'}};}}};}
async function setup(liveMode=true){
  const key=createHash('sha256').update(`${liveMode?'live':'test'}:owner`).digest('hex');
  const db=new MemoryFirestore({'users/owner':{email:'owner@example.test'},
    ['_stripe_checkouts/'+key]:{sessionId:'cs_owned',plan:'pro',termsVersion:TERMS_VERSION,termsSnapshot:CONTRACT_TERMS,acceptedAt:'2026-10-14T08:58:00Z'}});
  const session={id:'cs_owned',client_reference_id:'owner',livemode:liveMode,mode:'subscription',payment_status:'paid',subscription:'sub_owned',metadata:{termsVersion:TERMS_VERSION},amount_total:2900,currency:'eur',customer_details:{email:'different@example.test'}};
  const args={db,session,subscription:{},liveMode,now};
  const contract=await saveCheckoutContract(args);return {db,args,contract,id:`${liveMode?'live':'test'}_cs_owned`};
}
test('new purchase queues the immutable accepted contract for the protected account email; delivery includes full IT/EN copy',async()=>{
  const s=await setup(),resend=provider();assert.equal(s.contract.receiptEmail,'owner@example.test');
  await deliverSubscriptionConfirmation({...s,resend,now});assert.equal(resend.sent.length,1);
  assert.deepEqual(resend.sent[0].mail.to,['owner@example.test']);
  assert.ok(resend.sent[0].mail.text.includes(TERMS_VERSION));
  for(const row of CONTRACT_TERMS.terms)assert.ok(resend.sent[0].mail.text.includes(row.it)&&resend.sent[0].mail.text.includes(row.en));
  const saved=(await s.db.collection('_subscription_contracts').doc(s.id).get()).data();
  assert.equal(saved.receiptStatus,'accepted_by_provider');assert.deepEqual(saved.terms,s.contract.terms);
  assert.equal(saved.acceptedAt,s.contract.acceptedAt);
});
test('duplicate webhook deliveries and concurrent retries send a single contractual email',async()=>{
  const s=await setup(),resend=provider();
  await Promise.all([1,2,3].map(()=>deliverSubscriptionConfirmation({...s,resend,now})));
  await saveCheckoutContract({...s.args,now:now+10});
  await deliverSubscriptionConfirmation({...s,resend,now:now+10});assert.equal(resend.sent.length,1);
});
test('provider error preserves accepted terms and retry uses the same idempotency key',async()=>{
  const s=await setup(),failed=provider(true);await deliverSubscriptionConfirmation({...s,resend:failed,now});
  const saved=(await s.db.collection('_subscription_contracts').doc(s.id).get()).data();
  assert.equal(saved.receiptPending,true);assert.equal(saved.receiptStatus,'pending');
  const recovered=provider();const result=await drainSubscriptionConfirmations({db:s.db,resend:recovered,now:now+1000});
  assert.equal(result.pending,0);assert.equal(result.needsAttention,false);
  assert.equal(failed.sent[0].options.idempotencyKey,recovered.sent[0].options.idempotencyKey);
});
test('ambiguous attempts beyond the provider deduplication window require operator review instead of duplicate mail',async()=>{
  const s=await setup();await deliverSubscriptionConfirmation({...s,resend:provider(true),now});
  const resend=provider(),result=await drainSubscriptionConfirmations({db:s.db,resend,now:now+23*3600000});
  assert.equal(resend.sent.length,0);assert.equal(result.manualReview,1);assert.equal(result.needsAttention,true);
});
test('legacy contracts are not retroactively mailed, absent configuration preserves queue, test purchases are explicitly labelled',async()=>{
  const s=await setup(false);await deliverSubscriptionConfirmation({...s,resend:null,now});
  assert.equal((await s.db.collection('_subscription_contracts').doc(s.id).get()).data().receiptPending,true);
  s.db.documents.set('_subscription_contracts/live_legacy',{uid:'owner',terms:s.contract.terms});
  const resend=provider();await deliverSubscriptionConfirmation({db:s.db,id:'live_legacy',resend,now});assert.equal(resend.sent.length,0);
  assert.match(subscriptionConfirmation(s.contract).text,/TEST/);
  const escaped=subscriptionConfirmation({...s.contract,plan:'<script>alert(1)</script>'});assert.ok(!escaped.html.includes('<script>'));
});
