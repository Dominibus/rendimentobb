import test from 'node:test';
import assert from 'node:assert/strict';
import {buildStripeEntitlementUpdate,stripeFieldName} from '../lib/stripe-entitlements.js';
import {getPlanForScope,resolveAccountPlan} from '../js/account-plan.js';
test('test purchase and cancellation never overwrite a real paid subscription',()=>{
 const live={plan:'pro',subscriptionId:'live-sub',stripeLiveMode:true,lastStripeEventCreated:100};
 const testPurchase=buildStripeEntitlementUpdate({plan:'pro_yearly',subscriptionId:'test-sub'},{id:'test-purchase',created:200,livemode:false});
 const account={...live,...testPurchase};
 assert.equal(account.plan,'pro');
 assert.equal(account.subscriptionId,'live-sub');
 assert.equal(account.lastStripeEventCreated,100);
 assert.equal(getPlanForScope(account,false),'pro');
 assert.equal(getPlanForScope(account,true),'pro_yearly');
 Object.assign(account,buildStripeEntitlementUpdate({plan:'free',subscriptionId:null},{id:'test-cancel',created:201,livemode:false}));
 assert.equal(getPlanForScope(account,false),'pro');
 assert.equal(getPlanForScope(account,true),'free');
 assert.equal(stripeFieldName('lastStripeEventCreated',false),'sandboxLastStripeEventCreated');
});
test('legacy test purchases are recognized only in the known sandbox, not the live site',()=>{
 const legacy={plan:'pro_yearly',stripeSessionId:'cs_test_legacy'};
 assert.equal(resolveAccountPlan(legacy,'www.rendimentobb.it'),'free');
 assert.equal(resolveAccountPlan(legacy,'rendimentobb-git-stripe-sandbox-test-dominibus-projects.vercel.app'),'pro_yearly');
 assert.equal(resolveAccountPlan(legacy,'other.vercel.app'),'free');
 assert.equal(getPlanForScope({plan:'pro_yearly',stripeSessionId:'cs_live_paid'}),'pro_yearly');
 assert.equal(getPlanForScope({plan:'investor',stripeSessionId:'cs_test_legacy',stripeLiveMode:true}),'investor');
});
