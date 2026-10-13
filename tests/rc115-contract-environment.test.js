import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {OFFERS,activeTrial,timestampMillis,TERMS_VERSION} from '../js/subscription-offer.js';
import {getBillingPlanForScope,isSandboxHost} from '../js/account-plan.js';
import {getAccountContract} from '../lib/account-subscription-service.js';
import {MemoryFirestore} from './helpers/pms-memory-firestore.js';

const source=fs.readFileSync(new URL('../js/subscription-ui.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
function render(data,sandbox=false,lang='it'){
 const nodes=[],requests=[],downloads=[];
 const document={body:{append(){}},createElement(tag){
  const node={tag,textContent:'',style:{},setAttribute(){},append(){},addEventListener(){},showModal(){},remove(){},close(){},click(){if(tag==='a'&&this.download)downloads.push(this.download);}};
  nodes.push(node);return node;
 }};
 const window={currentLang:lang,currentUser:{uid:'owner',emailVerified:true,getIdToken:async()=> 'test-token'},rbAccountOwner:'owner',rbAccountData:{plan:'pro_yearly',sandboxPlan:'free',stripeLiveMode:true,...data}};
 const contract={plan:'pro',purchasedAt:'2026-10-13',amountTotal:2900,currency:'eur',termsVersion:TERMS_VERSION,acceptedAt:'2026-10-13',sessionId:sandbox?'cs_test_owned':'cs_live_owned',liveMode:!sandbox,terms:{terms:[],withdrawal:[]}};
 vm.runInNewContext(source,{window,document,location:{hostname:sandbox?'rendimentobb-git-stripe-sandbox-test-dominibus-projects.vercel.app':'rendimentobb.it'},OFFERS,activeTrial,timestampMillis,getBillingPlanForScope,isSandboxHost,TERMS_VERSION,setInterval(){},setTimeout(){},Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},fetch:async(url,options)=>{requests.push({url,options});return {ok:true,json:async()=>({contract})};}});
 window.rbOpenSubscription();
 return {nodes,requests,downloads,download:nodes.find(n=>n.tag==='button'&&/Scarica conferma|Download confirmation/.test(n.textContent))};
}
for(const lang of ['it','en']){
 test(`${lang}: live manual annual plan never offers sandbox purchase confirmation`,()=>{
  const ui=render({sandboxStripeSessionId:'cs_test_owned'},false,lang);
  assert.equal(ui.download,undefined);assert.equal(ui.requests.length,0);
  assert.match(ui.nodes.map(n=>n.textContent).join('\n'),/Piano assegnato direttamente|Directly assigned plan/);
 });
 test(`${lang}: sandbox never offers live-only purchase confirmation`,()=>assert.equal(render({stripeSessionId:'cs_live_owned'},true,lang).download,undefined));
}
for(const sandbox of [false,true])test(`${sandbox?'sandbox':'live'}: correct historical purchase remains downloadable after Free downgrade`,async()=>{
 const field=sandbox?'sandboxStripeSessionId':'stripeSessionId';
 const ui=render({plan:'free',sandboxPlan:'free',[field]:sandbox?'cs_test_owned':'cs_live_owned'},sandbox);
 assert.ok(ui.download);await ui.download.onclick();
 assert.equal(ui.requests.length,1);assert.equal(JSON.parse(ui.requests[0].options.body).action,'contract');
 assert.equal(ui.requests[0].options.headers.Authorization,'Bearer test-token');
 assert.deepEqual(ui.downloads,['RendimentoBB-Conferma-Abbonamento.txt']);
});
test('missing and malformed current session references never offer a download',()=>{
 for(const value of [undefined,null,'','invalid',123,{},'cs_<script>'])assert.equal(render({stripeSessionId:value}).download,undefined);
});
test('server continues to enforce contract environment and owner independently of UI',async()=>{
 const db=new MemoryFirestore({'users/owner':{stripeSessionId:'cs_live_owned',sandboxStripeSessionId:'cs_test_owned'},'_subscription_contracts/live_cs_live_owned':{uid:'owner',liveMode:true},'_subscription_contracts/test_cs_test_owned':{uid:'owner',liveMode:false},'users/other':{stripeSessionId:'cs_live_owned'}});
 assert.equal((await getAccountContract({db,uid:'owner',liveMode:true})).contract.liveMode,true);
 assert.equal((await getAccountContract({db,uid:'owner',liveMode:false})).contract.liveMode,false);
 await assert.rejects(getAccountContract({db,uid:'other',liveMode:true}),e=>e.code==='CONTRACT_NOT_AVAILABLE');
});
