import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {MemoryFirestore} from './helpers/pms-memory-firestore.js';
import {normalizePlanInterest,savePlanInterest,purgeExpiredPlanInterests,InterestError,INTEREST_CONSENT_VERSION,INTEREST_PRIVACY_VERSION,INTEREST_RETENTION_MS} from '../lib/plan-interest-service.js';
import * as copy from '../js/plan-interest-copy.js';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const body=(extra={})=>({type:'plan_interest',email:'person@example.test',plan:'pro',lang:'en',notificationConsent:true,consentVersion:INTEREST_CONSENT_VERSION,privacyVersion:INTEREST_PRIVACY_VERSION,...extra});
const origin='https://www.rendimentobb.it';
test('IT/EN consent versions agree with the server and the public privacy notice',()=>{
 assert.equal(copy.INTEREST_CONSENT_VERSION,INTEREST_CONSENT_VERSION);
 assert.equal(copy.INTEREST_PRIVACY_VERSION,INTEREST_PRIVACY_VERSION);
 assert.ok(read('privacy.html').includes(INTEREST_PRIVACY_VERSION));
 for(const lang of ['it','en'])assert.ok(copy.INTEREST_COPY[lang].saved);
});
for(const bad of [null,'',{},[],false])test(`missing or invalid consent rejects: ${JSON.stringify(bad)}`,()=>{
 assert.throws(()=>normalizePlanInterest(body({notificationConsent:bad}),origin),e=>e.code==='CONSENT_REQUIRED');
});
test('invalid plan, email, bot field, stale consent and foreign origins reject',()=>{
 for(const extra of [{plan:'admin'},{plan:'free'},{plan:{toString:'pro'}},{email:'a\r\nb@example.test'},{email:'<a>@example.test'},{email:'a@b'},{email:'a'.repeat(255)+'@x.test'},{website:'bot'},{consentVersion:'old'},{privacyVersion:'old'}])assert.throws(()=>normalizePlanInterest(body(extra),origin),InterestError);
 for(const other of [undefined,'null','https://evil.example','https://rendimentobb.it.evil.test','http://www.rendimentobb.it'])assert.throws(()=>normalizePlanInterest(body(),other),e=>e.status===403);
});
test('requests preserve only the allowlisted fields and have an explicit environment',()=>{
 const value=normalizePlanInterest(body({email:' Person@Example.Test ',uid:'foreign',planRole:'admin',marketingConsent:true,scope:'test'}),origin);
 assert.deepEqual(value,{email:'person@example.test',plan:'pro',lang:'en',scope:'live'});
 assert.equal(normalizePlanInterest(body(), 'https://rendimentobb-git-stripe-sandbox-test-dominibus-projects.vercel.app').scope,'test');
});
test('concurrent duplicate requests save one record and do not extend expiry or create entitlements',async()=>{
 const db=new MemoryFirestore({'users/owner':{plan:'free'}}),value=normalizePlanInterest(body(),origin),now=1800000000000;
 await Promise.all(Array.from({length:6},()=>savePlanInterest({db,value,now})));
 assert.equal(db.documents.size,2);const record=[...db.documents].find(([key])=>key.startsWith('_plan_interest/'))[1];
 assert.equal(record.emailVerified,false);assert.equal(record.marketingConsent,false);assert.equal(record.status,'requested');
 assert.equal(record.expiresAt,now+INTEREST_RETENTION_MS);assert.deepEqual(db.documents.get('users/owner'),{plan:'free'});
 assert.deepEqual(await savePlanInterest({db,value,now:now+1000}),{success:true,saved:true});
 assert.equal([...db.documents.values()].find(v=>v.email).expiresAt,record.expiresAt);
});
test('plans and test/live interest records remain distinct',async()=>{
 const db=new MemoryFirestore();
 for(const scope of ['live','test'])for(const plan of ['investor','pro','pro_yearly'])await savePlanInterest({db,value:{...normalizePlanInterest(body(),origin),scope,plan}});
 assert.equal(db.documents.size,6);
});
test('expired records renew only with a new explicit request',async()=>{
 const db=new MemoryFirestore(),value=normalizePlanInterest(body(),origin),now=1800000000000;
 await savePlanInterest({db,value,now});await savePlanInterest({db,value,now:now+INTEREST_RETENTION_MS+1});
 assert.equal(db.documents.size,1);assert.equal([...db.documents.values()][0].createdAt,now+INTEREST_RETENTION_MS+1);
});
test('bounded retention cleanup affects only expired private interest records',async()=>{
 const db=new MemoryFirestore({'_plan_interest/old':{expiresAt:10},'_plan_interest/fresh':{expiresAt:30},'users/owner':{plan:'pro'},'leads/keep':{expiresAt:1},'_plan_interest/malformed':{expiresAt:'bad'}});
 assert.deepEqual(await purgeExpiredPlanInterests({db,now:20}),{deleted:1,limitReached:false});
 assert.equal(db.documents.has('_plan_interest/old'),false);assert.equal(db.documents.size,4);
});
function api(){
 const db=new MemoryFirestore();const run=db.runTransaction.bind(db);
 db.runTransaction=fn=>run(tx=>{tx.getAll=(...refs)=>Promise.all(refs.map(ref=>tx.get(ref)));return fn(tx);});
 const context={process:{env:{}},Buffer,Date,Intl,crypto,console:{error(){}},
  normalizePlanInterest,savePlanInterest,InterestError,
  admin:{apps:[{}],firestore:Object.assign(()=>db,{FieldValue:{serverTimestamp:()=>new Date()}})},Resend:function(){this.emails={send(){throw Error('Must not send email');}};}};
 vm.createContext(context);
 const source=read('api/send-lead.js').replace(/^import .*;\s*$/gm,'').replace('export default async function handler','async function handler');
 vm.runInContext(source+'\nglobalThis.handler=handler;',context);
 return {db,async send(value,headers={origin}){const res={setHeader(){},status(code){this.code=code;return this;},json(data){this.body=data;return this;}};await context.handler({method:'POST',headers,body:value,socket:{remoteAddress:'test-ip'}},res);return res;}};
}
test('actual API saves a request without Stripe, lead funnels or email dispatch',async()=>{
 const h=api(),r=await h.send(body());assert.equal(r.code,200);assert.equal(r.body.success,true);
 assert.equal([...h.db.documents.keys()].filter(k=>k.startsWith('_plan_interest/')).length,1);
 assert.equal([...h.db.documents.keys()].some(k=>k.startsWith('leads/')||k.startsWith('users/')),false);
});
test('actual API validates before writes and enforces existing persistent rate limits',async()=>{
 const h=api();assert.equal((await h.send(body({notificationConsent:false}))).code,400);assert.equal(h.db.documents.size,0);
 assert.equal((await h.send(body(),{origin:'https://evil.example'})).code,403);assert.equal(h.db.documents.size,0);
 for(let n=0;n<3;n++)assert.equal((await h.send(body())).code,200);
 assert.equal((await h.send(body())).code,429);
 assert.equal([...h.db.documents.keys()].filter(k=>k.startsWith('_plan_interest/')).length,1);
});
test('private collection is not exposed by existing Firestore rules',()=>{
 const rules=read('firestore.rules');assert.equal(rules.includes('match /_plan_interest'),false);
 assert.match(rules,/match \/\{document=\*\*\} \{\s*allow read, write: if false;/);
});
test('static form is bilingual, optional, plan-specific, and has no payment input',()=>{
 const html=read('plan-interest.html');
 assert.match(html,/name="notificationConsent" type="checkbox" required/);assert.doesNotMatch(html,/checkbox[^>]*checked/);
 for(const plan of ['investor','pro','pro_yearly'])assert.ok(html.includes(`value="${plan}"`));
 assert.ok(html.includes('data-en='));assert.ok(html.includes('/privacy.html#plan-interest-privacy'));
 assert.doesNotMatch(html,/name="(?:card|password|phone)"/);
});
function client({plan='pro_yearly',lang='it',reply=async()=>({ok:true,status:200,json:async()=>({success:true})})}={}){
 const events={},calls=[],status={dataset:{},textContent:''},submit={disabled:false};
 const form={elements:{plan:{value:'investor'},email:{value:'person@example.test'},notificationConsent:{checked:false},website:{value:''}},
  querySelector:()=>submit,reportValidity(){return this.elements.notificationConsent.checked;},reset(){this.elements.email.value='';this.elements.notificationConsent.checked=false;},addEventListener:(name,fn)=>events[name]=fn};
 const window={currentLang:lang};
 const document={getElementById:id=>id==='plan-interest-form'?form:status,addEventListener:(name,fn)=>events[name]=fn};
 const code=read('js/plan-interest.js').replace(/^import .*;\n/gm,'');
 vm.runInNewContext(code,{window,document,location:{search:'?plan='+plan},URLSearchParams,
  ...copy,fetch:async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return reply();}});
 return {form,status,submit,events,calls,window,send:()=>events.submit({preventDefault(){}})};
}
for(const lang of ['it','en'])test(`${lang}: actual client preserves selected plan, checks consent and only confirms saved requests`,async()=>{
 const c=client({lang});assert.equal(c.form.elements.plan.value,'pro_yearly');
 await c.send();assert.equal(c.calls.length,0);
 c.form.elements.notificationConsent.checked=true;await c.send();
 assert.equal(c.calls.length,1);assert.equal(c.calls[0].url,'/api/send-lead');
 assert.equal(c.calls[0].body.plan,'pro_yearly');assert.equal(c.calls[0].body.lang,lang);
 assert.equal(c.status.dataset.result,'saved');assert.equal(c.status.textContent,copy.INTEREST_COPY[lang].saved);
 assert.equal(c.form.elements.plan.value,'pro_yearly');assert.equal(c.form.elements.plan.disabled,true);
 assert.equal(c.submit.disabled,true);await c.send();assert.equal(c.calls.length,1);
});
test('actual client handles rate limiting, failed JSON and network loss without false success',async()=>{
 for(const [reply,key] of [[async()=>({ok:false,status:429,json:async()=>({})}),'limited'],[async()=>({ok:false,status:500,json:async()=>({})}),'failed'],[async()=>({ok:true,status:200,json:async()=>{throw Error('json');}}),'failed'],[async()=>{throw Error('network');},'failed']]){
  const c=client({reply});c.form.elements.notificationConsent.checked=true;await c.send();
  assert.equal(c.status.dataset.result,key);assert.equal(c.submit.disabled,false);
 }
});
test('client suppresses concurrent submits and retranslates the result on language changes',async()=>{
 let release;const c=client({reply:()=>new Promise(resolve=>release=resolve)});
 c.form.elements.notificationConsent.checked=true;
 const pending=c.send();await c.send();assert.equal(c.calls.length,1);
 release({ok:true,status:200,json:async()=>({success:true})});await pending;
 c.window.currentLang='en';c.events.rb_language_changed();assert.equal(c.status.textContent,copy.INTEREST_COPY.en.saved);
});
test('invalid plan query never supplies an arbitrary plan to the client',()=>{
 assert.equal(client({plan:'admin'}).form.elements.plan.value,'investor');
});
