import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {getStripePrices} from '../lib/stripe-plan-config.js';
import {getBillingPlanForScope,isSandboxHost} from '../js/account-plan.js';
const sandboxHost='rendimentobb-git-stripe-sandbox-test-dominibus-projects.vercel.app';
test('sandbox branch rejects live credentials while production continues to reject test credentials',()=>{
 assert.throws(()=>getStripePrices({STRIPE_SECRET_KEY:'sk_live_mock',VERCEL_GIT_COMMIT_REF:'stripe-sandbox-test'}),/Live Stripe/);
 assert.throws(()=>getStripePrices({STRIPE_SECRET_KEY:'sk_live_mock',BASE_URL:'https://'+sandboxHost}),/Live Stripe/);
 assert.throws(()=>getStripePrices({STRIPE_SECRET_KEY:'sk_test_mock',VERCEL_ENV:'production'}),/not allowed in production/);
 assert.throws(()=>getStripePrices({STRIPE_SECRET_KEY:'sk_test_mock',VERCEL_GIT_COMMIT_REF:'stripe-sandbox-test',BASE_URL:'https://rendimentobb.it'}),/own BASE_URL/);
 assert.equal(getStripePrices({STRIPE_SECRET_KEY:'sk_test_mock',VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'stripe-sandbox-test',BASE_URL:'https://'+sandboxHost}).investor,'price_1UKvZKCSiGxuH6mMqyRJdpNI');
});
function ui(data,host='rendimentobb.it'){
 const all=[];function el(tag){const e={tag,textContent:'',children:[],style:{},append(...kids){this.children.push(...kids);},setAttribute(){},addEventListener(){},showModal(){},close(){},remove(){}};all.push(e);return e;}
 const ctx={setInterval(){},getBillingPlanForScope,isSandboxHost,TERMS_VERSION:'current',OFFERS:{pro_yearly:{name:'Pro Annuale'},investor:{name:'Investor'}},activeTrial:()=>false,timestampMillis:()=>0,window:{currentLang:'it',currentUser:{uid:'owner',emailVerified:true},rbAccountOwner:'owner',rbAccountData:data},location:{hostname:host},document:{createElement:el,body:el('body')},localStorage:{},fetch:()=>{throw Error('Unexpected network request');}};
 const code=readFileSync(new URL('../js/subscription-ui.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'');vm.createContext(ctx);vm.runInContext(code,ctx);ctx.window.rbOpenSubscription();return all;
}
test('manual annual plan shows no Stripe control or purchase download',()=>{
 const nodes=ui({plan:'pro_yearly'});assert.ok(nodes.some(n=>n.textContent.includes('Nessuna fatturazione Stripe')));assert.ok(!nodes.some(n=>n.textContent==='Gestisci rinnovo e fatture su Stripe'));assert.ok(!nodes.some(n=>n.textContent==='Scarica conferma e condizioni'));
});
test('billing buttons use only identifiers in the current environment',()=>{
 const data={plan:'pro_yearly',sandboxPlan:'investor',stripeCustomerId:'cus_liveABC',stripeSessionId:'cs_live_ABC',sandboxStripeCustomerId:'cus_testABC',sandboxStripeSessionId:'cs_test_ABC'};
 for(const host of ['rendimentobb.it',sandboxHost])assert.ok(ui(data,host).some(n=>n.textContent==='Gestisci rinnovo e fatture su Stripe'));
 assert.ok(!ui({plan:'pro_yearly',sandboxStripeCustomerId:'cus_testABC',sandboxStripeSessionId:'cs_test_ABC'}).some(n=>n.textContent==='Gestisci rinnovo e fatture su Stripe'));
 assert.ok(!ui({sandboxPlan:'investor',stripeCustomerId:'cus_liveABC',stripeSessionId:'cs_live_ABC'},sandboxHost).some(n=>n.textContent==='Gestisci rinnovo e fatture su Stripe'));
});
