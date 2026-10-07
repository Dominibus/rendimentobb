import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {stripeFieldName,buildStripeEntitlementUpdate} from '../lib/stripe-entitlements.js';
import {canApplyStripeBinding,checkoutIdentityMatches} from '../lib/stripe-subscription-binding.js';

const price='price_pro';
const subscription=(id='sub_new', extra={})=>({id,customer:'cus_1',metadata:{uid:'user_1'},status:'active',items:{data:[{price:{id:price}}]},...extra});
const session=(extra={})=>({id:'cs_1',client_reference_id:'user_1',metadata:{uid:'user_1'},mode:'subscription',payment_status:'paid',customer:'cus_1',subscription:'sub_new',line_items:{data:[{price:{id:price}}]},...extra});
const account=(extra={})=>({plan:'pro',stripeCustomerId:'cus_1',subscriptionId:'sub_new',subscriptionStatus:'active',...extra});
const event=(type,object,extra={})=>({id:'evt_1',created:100,livemode:true,type,data:{object},...extra});

// Execute the real handler and transaction, replacing external SDK boundaries only.
function harness(initial, {checkout=session(), latest, live=true}={}){
 const accounts=new Map(Object.entries(initial));
 let writes=0, currentEvent;
 const db={collection(){return {doc(uid){return {uid};},where(field,op,value){return {limit(){return {async get(){const docs=[...accounts].filter(([,a])=>a[field]===value).map(([id])=>({id}));return {empty:!docs.length,docs};}};}};}};},async runTransaction(fn){return fn({async get(ref){return {exists:accounts.has(ref.uid),data:()=>accounts.get(ref.uid)};},set(ref,data){writes++; accounts.set(ref.uid,{...accounts.get(ref.uid),...data});}});}};
 const firestore=()=>db;
 firestore.FieldValue={serverTimestamp:()=> 'timestamp'};
 const stripe={webhooks:{constructEvent(raw,signature){if(signature!=='valid') throw Error('signature');return currentEvent;}},checkout:{sessions:{retrieve:async()=>checkout}},subscriptions:{retrieve:async id=>latest ?? (currentEvent.type==='checkout.session.completed'?subscription(id):currentEvent.data.object)}};
 const context={Buffer,process:{env:{STRIPE_SECRET_KEY:live?'sk_live_mock':'sk_test_mock'}},console:{error(){},warn(){}},stripeFieldName,buildStripeEntitlementUpdate,canApplyStripeBinding,checkoutIdentityMatches,Stripe:function(){return stripe;},admin:{apps:[{}],firestore},getStripePrices:()=>({pro:price}),assertStripeEventMode:e=>{if(e.livemode!==live)throw Error('mode');}};
 let source=fs.readFileSync(new URL('../api/stripe-webhook.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace('export const config','const config').replace('export default async function handler','async function handler');
 vm.createContext(context);vm.runInContext(source+'\nglobalThis.handler=handler;',context);
 return {accounts,get writes(){return writes;},async send(e, signature='valid'){currentEvent=e;const req={method:'POST',headers:{'stripe-signature':signature},async *[Symbol.asyncIterator](){yield Buffer.from('{}');}};const res={code:0,setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}};await context.handler(req,res);return res;}};
}

test('checkout establishes the binding only for an existing account',async()=>{
 const h=harness({user_1:{plan:'free'}});assert.equal((await h.send(event('checkout.session.completed',{id:'cs_1'}))).code,200);assert.equal(h.accounts.get('user_1').plan,'pro');assert.equal(h.accounts.get('user_1').subscriptionId,'sub_new');
 const missing=harness({});await missing.send(event('checkout.session.completed',{id:'cs_1'}));assert.equal(missing.writes,0);assert.equal(missing.accounts.size,0);
});
for(const [name,checkout,latest] of [
 ['checkout UID mismatch',session({metadata:{uid:'other'}}),subscription()],
 ['subscription UID mismatch',session(),subscription('sub_new',{metadata:{uid:'other'}})],
 ['customer mismatch',session(),subscription('sub_new',{customer:'cus_other'})],
 ['subscription ID mismatch',session(),subscription('sub_other')],
 ['missing ownership metadata',session({metadata:{}}),subscription()]
]) test(name+' cannot grant a plan',async()=>{const h=harness({user_1:{plan:'free'}},{checkout,latest});assert.equal((await h.send(event('checkout.session.completed',{id:'cs_1'}))).code,400);assert.equal(h.writes,0);});
for(const type of ['customer.subscription.updated','customer.subscription.deleted','invoice.payment_failed']){
 test(type+' for a previous subscription cannot change the replacement',async()=>{
  const object=type==='invoice.payment_failed'?{id:'in_1',customer:'cus_1',subscription:'sub_old'}:subscription('sub_old',{status:type.endsWith('deleted')?'canceled':'active'});
  const h=harness({user_1:account()});assert.equal((await h.send(event(type,object))).code,200);assert.equal(h.writes,0);assert.equal(h.accounts.get('user_1').plan,'pro');
 });
}
test('metadata pointing to a different account cannot alter either account',async()=>{
 const h=harness({user_1:account(),other:account({stripeCustomerId:'cus_other',subscriptionId:'sub_other'})});await h.send(event('customer.subscription.updated',subscription('sub_new',{metadata:{uid:'other'}})));assert.equal(h.writes,0);
});
test('cancellation retains a tombstone; delayed snapshots and invoices cannot reactivate it',async()=>{
 const h=harness({user_1:account()});await h.send(event('customer.subscription.deleted',subscription('sub_new',{status:'canceled'})));assert.equal(h.accounts.get('user_1').plan,'free');assert.equal(h.accounts.get('user_1').subscriptionId,'sub_new');
 await h.send(event('customer.subscription.updated',subscription(),{id:'evt_2',created:101}));await h.send(event('invoice.payment_failed',{customer:'cus_1',subscription:'sub_new'},{id:'evt_3',created:102}));await h.send(event('checkout.session.completed',{id:'cs_1'},{id:'evt_4',created:103}));assert.equal(h.writes,1);assert.equal(h.accounts.get('user_1').subscriptionStatus,'canceled');
});
test('a new checkout can replace a canceled binding, including a new customer',async()=>{
 const h=harness({user_1:account({subscriptionId:'sub_old',subscriptionStatus:'canceled',plan:'free'})},{checkout:session({customer:'cus_new'}),latest:subscription('sub_new',{customer:'cus_new'})});await h.send(event('checkout.session.completed',{id:'cs_1'}));assert.equal(h.accounts.get('user_1').stripeCustomerId,'cus_new');assert.equal(h.accounts.get('user_1').plan,'pro');
});
test('checkout cannot replace an active or unmapped paid legacy subscription',async()=>{
 for(const initial of [account({subscriptionId:'sub_other'}),{plan:'investor'}]){const h=harness({user_1:initial});await h.send(event('checkout.session.completed',{id:'cs_1'}));assert.equal(h.writes,0);}
});
test('subscription updates use current Stripe status rather than delayed event snapshots',async()=>{
 const h=harness({user_1:account()},{latest:subscription('sub_new',{status:'canceled'})});await h.send(event('customer.subscription.updated',subscription()));assert.equal(h.accounts.get('user_1').plan,'free');assert.equal(h.accounts.get('user_1').subscriptionStatus,'canceled');
});
test('duplicate events and older events do not write again',async()=>{
 const h=harness({user_1:account()});const e=event('customer.subscription.updated',subscription());await h.send(e);await h.send(e);await h.send(event('customer.subscription.deleted',subscription(),{id:'older',created:99}));assert.equal(h.writes,1);
});
test('a lifecycle event before checkout cannot bootstrap access; checkout can subsequently activate',async()=>{
 const h=harness({user_1:{plan:'free'}});await h.send(event('customer.subscription.updated',subscription()));assert.equal(h.writes,0);await h.send(event('checkout.session.completed',{id:'cs_1'},{id:'evt_2',created:101}));assert.equal(h.accounts.get('user_1').plan,'pro');
});
test('binding checks use sandbox fields without touching production entitlement',()=>{
 const a=account({sandboxPlan:'free',sandboxSubscriptionId:'sub_test_old',sandboxStripeCustomerId:'cus_test',sandboxSubscriptionStatus:'canceled'});
 assert.equal(canApplyStripeBinding(a,{livemode:false},{source:'checkout',subscriptionId:'sub_test_new',customerId:'cus_test_new'}),true);
 assert.equal(canApplyStripeBinding(a,{livemode:false},{source:'subscription',subscriptionId:'sub_new',customerId:'cus_1'}),false);
});
test('invalid signatures and wrong environment do not mutate accounts',async()=>{
 const h=harness({user_1:account()});assert.equal((await h.send(event('customer.subscription.deleted',subscription()),'invalid')).code,400);assert.equal((await h.send(event('customer.subscription.deleted',subscription(),{livemode:false}))).code,400);assert.equal(h.writes,0);
});


test('a matching active subscription still updates the plan and cancellation flag',async()=>{
 const h=harness({user_1:account({plan:'investor'})});await h.send(event('customer.subscription.updated',subscription('sub_new',{cancel_at_period_end:true})));assert.equal(h.accounts.get('user_1').plan,'pro');assert.equal(h.accounts.get('user_1').cancelAtPeriodEnd,true);
});
test('a matching payment failure retains access under the existing recovery policy',async()=>{
 const h=harness({user_1:account()});await h.send(event('invoice.payment_failed',{customer:'cus_1',subscription:'sub_new'}));assert.equal(h.accounts.get('user_1').plan,'pro');assert.equal(h.accounts.get('user_1').subscriptionStatus,'past_due');
});
test('the same subscription ID with a different customer is rejected',async()=>{
 const h=harness({user_1:account()});await h.send(event('customer.subscription.deleted',subscription('sub_new',{customer:'cus_other'})));assert.equal(h.writes,0);
});
test('sandbox checkout and cancellation leave the live subscription unchanged',async()=>{
 const h=harness({user_1:account()},{live:false});await h.send(event('checkout.session.completed',{id:'cs_1'},{livemode:false}));assert.equal(h.accounts.get('user_1').sandboxPlan,'pro');await h.send(event('customer.subscription.deleted',subscription(),{id:'evt_2',created:101,livemode:false}));assert.equal(h.accounts.get('user_1').sandboxPlan,'free');assert.equal(h.accounts.get('user_1').plan,'pro');assert.equal(h.accounts.get('user_1').subscriptionStatus,'active');assert.equal(h.accounts.get('user_1').subscriptionId,'sub_new');
});
