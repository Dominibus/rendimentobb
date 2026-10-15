import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {LIVE_SALES_PAUSED,isLiveSalesPaused,SALES_NOTICE} from '../js/sales-policy.js';
import {isSandboxHost} from '../js/account-plan.js';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('operational policy defaults to pausing only explicit live mode',()=>{
 assert.equal(LIVE_SALES_PAUSED,true);assert.equal(isLiveSalesPaused(true),true);
 for(const v of [false,undefined,null,'false',0])assert.equal(isLiveSalesPaused(v),false);
 for(const host of ['www.rendimentobb.it','www.rendimentobb.com','other.vercel.app'])assert.equal(isSandboxHost(host),false);
 assert.equal(isSandboxHost('rendimentobb-git-stripe-sandbox-test-dominibus-projects.vercel.app'),true);
});
test('pause order preserves account actions and blocks checkout before provider calls; public EN date is corrected',()=>{
 const api=read('api/create-checkout-session.js');
 assert.ok(api.indexOf('if(action === "portal")')<api.indexOf('if(isLiveSalesPaused(liveMode))'));
 assert.ok(api.indexOf('if(action === "trial")')<api.indexOf('if(isLiveSalesPaused(liveMode))'));
 assert.ok(api.indexOf('if(isLiveSalesPaused(liveMode))')<api.indexOf('const session = await guardedCheckout'));
 assert.match(read('plans.html'),/updated October 15, 2026/);
});
for(const lang of ['it','en'])test(`${lang}: live review shows information without login, fetch or payment consent`,async()=>{
 const nodes=[];
 const document={readyState:'loading',addEventListener(){},body:{append(){}},createElement(tag){const n={tag,style:{},setAttribute(){},append(){},addEventListener(){},showModal(){},remove(){},close(){}};nodes.push(n);return n;}};
 const window={currentLang:lang};
 const source=read('js/subscription-ui.js').replace(/^import .*;\n/gm,'');
 vm.runInNewContext(source,{window,document,location:{hostname:'www.rendimentobb.it'},isLiveSalesPaused,SALES_NOTICE,isSandboxHost,setInterval(){},fetch(){throw Error('Unexpected request');}});
 assert.equal(await window.rbReviewPurchase('pro'),false);
 assert.ok(nodes.some(n=>n.tag==='a'&&n.href==='/contact.html'));
 assert.ok(nodes.some(n=>n.textContent===SALES_NOTICE[lang]));
 assert.equal(nodes.some(n=>n.tag==='input'),false);
});
test('purchase entrypoints intercept guests before registration or pending plan storage',async()=>{
 const app=read('js/app.js');
 for(const name of ['buyPlan','startPlanPurchase']){
  const start=app.indexOf(`window.${name} = `);
  const guardEnd=app.indexOf('\n',app.indexOf('if(window.rbLiveSalesPaused?.())',start));
  const prefix=app.slice(start,guardEnd);
  let shown=0;
  const w={rbLiveSalesPaused:()=>true,rbShowSalesPause:()=>shown++};
  vm.runInNewContext(prefix+'\n};',{window:w});
  await w[name]('pro');assert.equal(shown,1);
 }
});
for(const paused of [true,false])test(`assistant aligns IT/EN availability; paused=${paused}`,async()=>{
 const window={location:{pathname:'/dashboard/'},currentLang:'en',rbLiveSalesPaused:()=>paused};
 const c=vm.createContext({window,console,Intl,Date});
 for(const f of ['response-engine.js','chatbot-orchestrator.js'])vm.runInContext(read('js/chatbot/core/'+f),c);
 const r=(await window.rbProcessAIMessage('What does Pro cost?')).response;
 assert.equal(r.textEN.includes('temporarily unavailable'),paused);
 assert.equal(r.textIT.includes('temporaneamente non disponibili'),paused);
 const cancel=(await window.rbProcessAIMessage('How do I cancel Pro?')).response;
 assert.match(cancel.textEN,/Stripe/);assert.equal(cancel.textEN.includes('temporarily unavailable'),false);
});
