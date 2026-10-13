import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {TERMS_VERSION} from '../js/subscription-offer.js';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('js/app.js');
const body=app.slice(app.indexOf('window.buyPlan = async function(plan){'),app.indexOf('// ================= PROPERTY SCRAPER',app.indexOf('window.buyPlan = async function(plan){')));
for(const plan of ['investor','pro','pro_yearly'])test(`real ${plan} purchase sends the currently accepted terms and bearer authentication`,async()=>{
 const requests=[],redirects=[];
 const c={TERMS_VERSION,window:{currentUser:{uid:'owner',getIdToken:async()=>'test-token'},currentLang:'it',rbReviewPurchase:async()=>true,location:{assign:url=>redirects.push(url)}},showToast(){},fetch:async(url,options)=>{requests.push({url,options});return {ok:true,status:200,json:async()=>({url:'https://checkout.stripe.com/test-only'})};}};
 vm.createContext(c);vm.runInContext(body,c);await c.window.buyPlan(plan);
 assert.equal(requests.length,1);
 assert.equal(requests[0].url,'/api/create-checkout-session');
 assert.equal(requests[0].options.headers.Authorization,'Bearer test-token');
 assert.deepEqual(JSON.parse(requests[0].options.body),{plan,acceptedTerms:true,termsVersion:TERMS_VERSION});
 assert.deepEqual(redirects,['https://checkout.stripe.com/test-only']);
});
test('checkout terms come from the shared module, not another hard-coded release',()=>{
 assert.match(app,/import\s*\{\s*TERMS_VERSION\s*\}\s*from\s*["']\.\/subscription-offer\.js/);
 assert.doesNotMatch(body,/termsVersion\s*:\s*["']/);
});
test('mortgage purchase entry point goes through the reviewed home flow, never the legacy unauthenticated request',async()=>{
 const html=read('mutui/index.html');
 const start=html.indexOf('async function startPlanPurchase(plan){');
 const code=html.slice(start,html.indexOf('function showUpgradeModal(){',start));
 const c={window:{location:{href:''}}};vm.createContext(c);vm.runInContext(code,c);
 await c.startPlanPurchase('pro');assert.equal(c.window.location.href,'/#pricing');
 c.window.location.href='';await c.startPlanPurchase('invalid');assert.equal(c.window.location.href,'');
 assert.doesNotMatch(code,/create-checkout-session|fetch\(|uid:|email:/);
});
