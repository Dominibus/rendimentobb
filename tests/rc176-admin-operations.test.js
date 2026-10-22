import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {OPS_JOBS,projectJob,readOperations} from '../lib/admin-operations.js';
const now=Date.parse('2026-10-22T10:00:00Z');
function database(stores={},fail=[]){
 const reads=[];
 return {reads,collection(name){
 const query=(filters=[],sort=null,max=Infinity)=>({
 where:(...args)=>query([...filters,args],sort,max),
 orderBy:(key,direction)=>query(filters,[key,direction],max),
 limit:n=>query(filters,sort,n),
 select:()=>query(filters,sort,max),
 async get(){
 reads.push({name,max,filters,sort});if(fail.includes(name))throw Error('secret provider details');
 assert.ok(max<=21,'all list reads must be bounded');
 let rows=(stores[name]||[]).filter(d=>filters.every(([k,op,v])=>op==='=='?d[k]===v:d[k]!=null&&d[k]<=v));
 if(sort)rows=rows.filter(d=>d[sort[0]]!==undefined).sort((a,b)=>(a[sort[0]]-b[sort[0]])*(sort[1]==='desc'?-1:1));
 return {docs:rows.slice(0,max).map(d=>({data:()=>d}))};
 }});
 return {...query(),doc:id=>({async get(){
 reads.push({name,id});if(fail.includes(name))throw Error('private');
 const data=stores[name]?.[id];return {exists:!!data,data:()=>data};
 }})};
 }};
}
test('job projections distinguish missing evidence, stale data and recorded outcomes',()=>{
 assert.equal(projectJob('x',null,now).state,'unverified');
 assert.equal(projectJob('x',{lastRunAt:now},now).state,'recorded');
 assert.equal(projectJob('x',{lastRunAt:now,success:true},now).state,'recorded_success');
 assert.equal(projectJob('x',{lastRunAt:now-37*3600000,success:true},now).state,'stale');
 assert.equal(projectJob('x',{lastRunAt:now+3600000,success:true},now).state,'unverified');
 for(const field of ['errors','retry','manualReview','pending','expiredReminders'])assert.equal(projectJob('x',{lastRunAt:now,[field]:1,success:true},now).state,'attention');
 assert.equal(projectJob('x',{lastRunAt:now,needsAttention:true},now).state,'attention');
 assert.equal(projectJob('x',{lastRunAt:now-37*3600000,errors:1},now).stale,true);
 assert.deepEqual(projectJob('x',{lastRunAt:now,errors:'1',sent:-1,payload:'private'},now).metrics,{});
});
test('read-only snapshot limits reads, separates environments and never emits private payloads',async()=>{
 const queue=Array.from({length:35},(_,i)=>({readyAt:now-1000*(i+1),sandbox:i%2===0,status:'manual_review',attempts:2,recipient:'private@example.test',payload:{html:'private'},uid:'secret-owner'}));
 queue.push({readyAt:now-100000,status:'manual_review',attempts:1});
 const interests=Array.from({length:25},(_,i)=>({createdAt:now-i,expiresAt:now+100000,scope:i%2?'test':'live',plan:'pro',lang:'en',email:'secret@example.test'}));
 const db=database({_pms_notifications:queue,_plan_interest:interests,_pms_jobs:{task_notifications:{lastRunAt:now,success:true,sent:3,secret:'never-return'}}});
 const result=await readOperations({db,now,environment:'production'});
 assert.equal(result.jobs.length,OPS_JOBS.length);
 assert.equal(db.reads.length,9);
 assert.equal(result.queues.due.sampleSize,20);assert.equal(result.queues.due.more,true);
 assert.equal(result.queues.manual.sampleSize,20);assert.equal(result.queues.manual.more,true);
 assert.equal(Object.values(result.queues.due.counts).reduce((a,b)=>a+b,0),20);
 assert.equal(result.queues.due.counts.unknown,1);
 assert.equal(result.interests.entries.length,20);assert.equal(result.interests.more,true);
 assert.equal(result.interests.entries[0].createdAt,now);
 assert.equal(result.policy.newLiveSalesPaused,true);assert.equal(result.policy.trialDays,30);
 assert.doesNotMatch(JSON.stringify(result),/private|secret|recipient|payload|uid|email/);
});
test('read failures are isolated and never presented as empty successful queues',async()=>{
 const result=await readOperations({db:database({},['_pms_jobs','_pms_notifications']),now});
 assert.ok(result.jobs.every(j=>j.available===false));
 assert.equal(result.queues.due.available,false);assert.equal(result.queues.manual.available,false);
 assert.equal(result.queues.due.sampleSize,undefined);
 assert.equal(result.interests.available,true);
 assert.doesNotMatch(JSON.stringify(result),/secret provider/);
});
test('request expiry and unknown plan are explicit; legacy missing createdAt is excluded',async()=>{
 const db=database({_plan_interest:[{createdAt:now,expiresAt:now-1,scope:'live',plan:'fake'},{expiresAt:now}]});
 const r=await readOperations({db,now});
 assert.equal(r.interests.sampleSize,1);assert.equal(r.interests.entries[0].state,'expired');assert.equal(r.interests.entries[0].plan,'unknown');
 assert.equal(r.jobs[0].check.state,'unverified');
});
function api(tokenClaims,options={}){
 let dbReads=0,verifications=0;
 const context={
 process:{env:{}},readOperations:async()=>{dbReads++;return {schemaVersion:1};},
 admin:{apps:[{}],firestore:()=>({}),auth:()=>({verifyIdToken:async(token,revoked)=>{
 verifications++;assert.equal(revoked,true);
 if(options.code)throw Object.assign(Error('private auth error'),{code:options.code});
 return tokenClaims;
 }})}
 };
 vm.createContext(context);
 const source=readFileSync(new URL('../api/delete-lead.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace('export default async function handler','async function handler');
 vm.runInContext(source,context);
 return {async run({token='x',query={view:'operations'},method='GET'}={}){
 const res={setHeader(k,v){this.headers??={};this.headers[k]=v;},status(s){this.code=s;return this;},json(v){this.body=v;return this;}};
 await context.handler({method,headers:{authorization:token?'Bearer '+token:''},query,body:{}},res);
 return {res,dbReads,verifications};
 }};
}
test('operations API refuses missing, normal, unverified and forged client roles before any read',async()=>{
 for(const [claims,token,status] of [[{},'',401],[{email:'user@test',email_verified:true,isAdmin:true},'x',403],[{email:'rendimentobb@gmail.com',email_verified:false},'x',403]]){
 const r=await api(claims).run({token,query:{view:'operations',isAdmin:'true'}});
 assert.equal(r.res.code,status);assert.equal(r.dbReads,0);
 }
});
test('revoked, expired and disabled tokens cannot read operations',async()=>{
 for(const code of ['auth/id-token-revoked','auth/id-token-expired','auth/user-disabled']){
 const r=await api({}, {code}).run();assert.equal(r.res.code,401);assert.equal(r.dbReads,0);
 }
});
test('verified admin can read only the fixed operations view without target parameters',async()=>{
 const claims={uid:'admin',email:'rendimentobb@gmail.com',email_verified:true};
 const ok=await api(claims).run();assert.equal(ok.res.code,200);assert.equal(ok.dbReads,1);assert.equal(ok.res.headers['Cache-Control'],'no-store');
 for(const query of [{},{view:'users'},{view:'operations',uid:'other'},{view:['operations']}]){
 const r=await api(claims).run({query});assert.equal(r.res.code,400);assert.equal(r.dbReads,0);
 }
 const bad=await api(claims).run({method:'POST'});assert.equal(bad.res.code,405);assert.equal(bad.verifications,0);
});

import {renderOperations} from '../js/admin-operations-view.js';
class Element{
 constructor(tag,ownerDocument){this.tag=tag;this.ownerDocument=ownerDocument;this.children=[];this.textContent='';}
 append(el){this.children.push(el);}
 get allText(){return this.textContent+' '+this.children.map(c=>c.allText).join(' ');}
}
function documentStub(){
 const doc={createElement:tag=>new Element(tag,doc)};
 return {doc,root:new Element('div',doc)};
}
test('IT/EN rendering explains limited coverage and never injects submitted markup',async()=>{
 const result=await readOperations({db:database({_pms_jobs:{task_notifications:{lastRunAt:now,success:true}}}),now,environment:'production'});
 for(const lang of ['it','en']){
 const {root}=documentStub();
 renderOperations(root,result,lang,now);
 assert.match(root.allText,lang==='en'?/not continuous|not independent/:/non verifiche indipendenti/);
 assert.match(root.allText,lang==='en'?/Up to 20/:/Massimo 20/);
 assert.match(root.allText,lang==='en'?/not verified by this screen/:/non verificati da questa schermata/);
 assert.match(root.allText,lang==='en'?/30 days/:/30 giorni/);
 assert.match(root.allText,lang==='en'?/Recorded job success/:/Successo registrato del job/);
 const stale=documentStub().root;renderOperations(stale,result,lang,now+37*3600000);
 assert.match(stale.allText,lang==='en'?/Stale check/:/Controllo scaduto/);
 }
 const {root}=documentStub();result.environment='<img src=x onerror=alert(1)>';
 renderOperations(root,result,'en',now);assert.match(root.allText,/<img src=x/);
 const tags=[];function walk(node){tags.push(node.tag);node.children.forEach(walk);}walk(root);
 assert.ok(!tags.includes('img'));assert.ok(!tags.includes('script'));
});
test('operations controller clears data on logout and ignores a late response from the previous session',async()=>{
 const nodes=Object.fromEntries(['operations-content','operations-feedback','operations-refresh'].map(id=>[id,{textContent:'',disabled:false,replaceChildren(){this.content=null;},addEventListener(name,cb){this[name]=cb;}}]));
 const listeners={},pending=[];let authCallback;
 const auth={currentUser:{uid:'admin',email:'rendimentobb@gmail.com',emailVerified:true,getIdToken:async()=>'mock'}};
 const ctx={auth,onAuthStateChanged:(a,cb)=>{authCallback=cb;},renderOperations:(root,data,lang)=>{root.content={data,lang};},
 document:{hidden:false,getElementById:id=>nodes[id],addEventListener:(name,cb)=>{listeners[name]=cb;}},
 window:{currentLang:'it'},AbortController,Date,setTimeout,clearTimeout,setInterval:()=>{},fetch:(url,options)=>new Promise(resolve=>pending.push({resolve,url,options}))};
 vm.createContext(ctx);
 const source=readFileSync(new URL('../js/admin-operations.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'');
 vm.runInContext(source,ctx);
 authCallback(auth.currentUser);await new Promise(setImmediate);
 assert.equal(pending.length,1);assert.equal(pending[0].options.cache,'no-store');
 auth.currentUser=null;authCallback(null);
 pending[0].resolve({ok:true,json:async()=>({schemaVersion:1})});await new Promise(setImmediate);
 assert.equal(nodes['operations-content'].content,null);assert.equal(nodes['operations-refresh'].disabled,true);
 auth.currentUser={uid:'admin',email:'rendimentobb@gmail.com',emailVerified:true,getIdToken:async()=>'mock'};
 authCallback(auth.currentUser);await new Promise(setImmediate);
 pending[1].resolve({ok:true,json:async()=>({schemaVersion:1,observedAt:Date.now()})});await new Promise(setImmediate);
 assert.equal(nodes['operations-content'].content.lang,'it');
 ctx.window.currentLang='en';listeners.rb_language_changed();assert.equal(nodes['operations-content'].content.lang,'en');
 nodes['operations-refresh'].click();await new Promise(setImmediate);
 assert.equal(nodes['operations-content'].content,null);
 pending[2].resolve({ok:false});await new Promise(setImmediate);
 assert.equal(nodes['operations-content'].content,null);
 assert.match(nodes['operations-feedback'].textContent,/Read failed/);
});
test('cold start initializes Firebase before token verification and never accesses Firestore for a normal user',async()=>{
 let initialized=false,dbTouched=false;
 const admin={apps:[],credential:{cert:x=>x},initializeApp(){initialized=true;this.apps.push({});},
 auth(){assert.equal(initialized,true);return {verifyIdToken:async()=>({email:'user@test',email_verified:true})};},
 firestore(){dbTouched=true;throw Error('not allowed');}};
 const ctx={admin,process:{env:{FIREBASE_PRIVATE_KEY:'test-placeholder'}},readOperations:()=>{throw Error('not allowed');}};
 vm.createContext(ctx);
 vm.runInContext(readFileSync(new URL('../api/delete-lead.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace('export default async function handler','async function handler'),ctx);
 const res={setHeader(){},status(code){this.code=code;return this;},json(){return this;}};
 await ctx.handler({method:'GET',query:{view:'operations'},headers:{authorization:'Bearer user'}},res);
 assert.equal(res.code,403);assert.equal(initialized,true);assert.equal(dbTouched,false);
});
