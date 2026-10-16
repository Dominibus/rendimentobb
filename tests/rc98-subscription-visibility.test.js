import {hasUsedTrial} from '../js/subscription-offer.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {OFFERS,activeTrial,timestampMillis} from '../js/subscription-offer.js';
import {getBillingPlanForScope,isSandboxHost} from '../js/account-plan.js';
const source=fs.readFileSync(new URL('../js/subscription-ui.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
function render(plan,lang='it',trial=false,sandbox=false,manual=false){
 const now=Date.now(),prefix=sandbox?'sandboxTrial':'trial';
 const data={plan,sandboxPlan:plan,stripeLiveMode:true,...(!manual?{stripeCustomerId:"cus_live",sandboxStripeCustomerId:"cus_test"}:{})};
 if(trial)Object.assign(data,{[`${prefix}StartedAt`]:new Date(now-1000),[`${prefix}EndsAt`]:new Date(now+86400000)});
 const nodes=[];
 const document={readyState:'loading',addEventListener(){},querySelectorAll(){return [];},body:{append(){}},createElement(tag){const el={tag,textContent:'',style:{},setAttribute(){},append(){},addEventListener(){},showModal(){},remove(){},close(){}};nodes.push(el);return el;}};
 const window={currentLang:lang,currentUser:{uid:'owner',emailVerified:true},rbAccountOwner:'owner',rbAccountData:data};
 vm.runInNewContext(source,{hasUsedTrial,isLiveSalesPaused:()=>false,SALES_NOTICE:{it:'',en:''},window,document,location:{hostname:sandbox?'localhost':'rendimentobb.it'},OFFERS,activeTrial,timestampMillis,getBillingPlanForScope,isSandboxHost,TERMS_VERSION:'test',setInterval(){}});
 window.rbOpenSubscription();return nodes.map(x=>x.textContent).join('\n');
}
for(const lang of ['it','en']){
 test(`${lang}: Free receives trial offer`,()=>assert.match(render('free',lang),/Prova Investor:|Investor trial:/));
 test(`${lang}: active trial keeps expiry and conditions`,()=>assert.match(render('free',lang,true),/Investor in prova · termina|Investor trial · ends/));
 for(const plan of ['investor','pro','pro_yearly']){
  test(`${lang}: ${plan} suppresses trial offer even with residual trial dates`,()=>{
   for(const trial of [false,true])for(const sandbox of [false,true]){
    const text=render(plan,lang,trial,sandbox);
    assert.doesNotMatch(text,/Prova Investor:|Investor trial:|Investor in prova · termina|Investor trial · ends|Attiva 7 giorni|Start 7 free days/);
    assert.ok(text.includes(OFFERS[plan].name));
    assert.match(text,/Gestisci rinnovo e fatture su Stripe|Manage renewal and invoices on Stripe/);
   }
  });
 }
}

for(const lang of ['it','en'])test(`${lang}: manual paid plan has explanation instead of unavailable Stripe action`,()=>{const text=render('pro_yearly',lang,false,false,true);assert.match(text,/Piano assegnato direttamente|Directly assigned plan/);assert.doesNotMatch(text,/Gestisci rinnovo e fatture su Stripe|Manage renewal and invoices on Stripe/);});
