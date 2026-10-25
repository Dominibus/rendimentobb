import test from 'node:test';import assert from 'node:assert/strict';
import {randomUUID,webcrypto} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {MemoryFirestore} from './helpers/pms-memory-firestore.js';
import {createCommercialDemo,calculateCommercial} from '../js/commercial-property-engine.js';
import {newCommercialWorkspace,applyCommercialOperation,commercialWorkspaceSummary,createCommercialWorkspaceDemo,normalizeCommercialModel} from '../js/commercial-workspace-model.js';
import {performCommercialOperation,createCommercialWorkspaceHandler} from '../lib/commercial-workspace-service.js';
import {createCommercialClient} from '../js/commercial-workspace-client.js';
import {answerCommercialAutopilot,commercialPriorities} from '../js/commercial-autopilot.js';
import {stageCommercialTransfer,consumeCommercialTransfer} from '../js/commercial-transfer.js';
import {safeAuthDestination} from '../js/auth-safety.js';
const now=Date.parse('2027-01-20T12:00:00Z'),iso=new Date(now).toISOString();
const fixture=()=>newCommercialWorkspace({name:'Generic space',model:createCommercialDemo('mixed')},iso,'space1');
const apply=(w,op,data,id=randomUUID())=>applyCommercialOperation(w,op,data,{now:iso,id});
const confirmed=()=>apply(fixture(),'confirm',{});
const receipt=(w,values={})=>apply(w,'add_movement',{kind:'receipt',date:'2027-01-10',period:'2027-01',contractId:'A1',cents:120000,reference:'REF-01',...values});
const decoded={uid:'user-a',email:'a@example.test',email_verified:true};
const serviceDB=(plan='investor')=>new MemoryFirestore({'users/user-a':{plan},'users/user-b':{plan:'pro'}});
const request=(operation,values={})=>({action:'commercial_workspace',operation,requestId:randomUUID(),...values});

test('RC196 scenario save cannot silently alter confirmed contracts',()=>{
 let w=confirmed(),model=structuredClone(w.scenario);model.assignments[0].amount=1500;
 w=apply(w,'save_scenario',{model,name:'Other generic name'});
 assert.equal(w.scenario.assignments[0].amount,1500);assert.equal(w.operating.assignments[0].amount,1200);assert.equal(w.confirmedScenarioRevision,1);assert.equal(w.scenarioRevision,2);
 w=apply(w,'update_operating',{model:w.scenario});assert.equal(w.operatingRevision,2);assert.equal(w.operating.assignments[0].amount,1500);
});
test('RC196 accrual versus cash dates, gross versus net, missing records versus zero',()=>{
 let w=confirmed();let s=commercialWorkspaceSummary(w,1);assert.equal(s.month.contractualGross,1910);assert.equal(s.month.expectedNet,null);assert.equal(s.registeredReceipts,null);assert.equal(s.recordedCashBalance,null);
 w=receipt(w,{date:'2027-01-12',period:'2027-02'});s=commercialWorkspaceSummary(w,1);assert.equal(s.registeredReceipts,null);assert.equal(s.recordedCashBalance,1200);
 s=commercialWorkspaceSummary(w,2);assert.equal(s.registeredReceipts,1200);assert.equal(s.recordedCashBalance,null);
 w=apply(w,'add_movement',{kind:'cost',date:'2027-01-13',period:'2027-02',contractId:null,cents:25000,reference:'COST-1'});assert.equal(commercialWorkspaceSummary(w,1).recordedCashBalance,950);assert.equal(commercialWorkspaceSummary(w,2).registeredCosts,250);
});
test('RC196 refunds, cents and audit-preserving corrections never fabricate payments',()=>{
 let w=receipt(confirmed());w=apply(w,'add_movement',{kind:'refund',date:'2027-01-15',period:'2027-01',contractId:'A1',cents:20000,reference:'RF-1'});
 assert.equal(commercialWorkspaceSummary(w,1).registeredReceipts,1000);
 assert.throws(()=>apply(w,'void_movement',{id:w.ledger[0].id,reason:'CORRECTION'}),e=>e.code==='refund_exceeds_receipts');
 w=apply(w,'void_movement',{id:w.ledger[1].id,reason:'CORRECTION'});w=apply(w,'void_movement',{id:w.ledger[0].id,reason:'CORRECTION'});
 assert.equal(w.ledger.length,2);assert.ok(w.ledger.every(e=>e.voided));assert.equal(commercialWorkspaceSummary(w,1).registeredReceipts,null);
 assert.equal(w.history.at(-1).operation,'void_movement');
});
test('RC196 refund chronology and future actual movements are rejected',()=>{
 let w=receipt(confirmed());assert.throws(()=>apply(w,'add_movement',{kind:'refund',date:'2027-01-05',period:'2027-01',contractId:'A1',cents:100,reference:'RF-EARLY'}),e=>e.code==='refund_exceeds_receipts');
 assert.throws(()=>receipt(w,{date:'2027-01-21'}),e=>e.code==='future_movement');
});
test('RC196 recorded contracts cannot be removed or rewritten; new free-slot contracts remain possible',()=>{
 let w=receipt(confirmed()),m=structuredClone(w.operating);m.assignments[0].amount=900;assert.throws(()=>apply(w,'update_operating',{model:m}),e=>e.code==='recorded_contract_locked');
 m=structuredClone(w.operating);m.assignments.push({...structuredClone(m.assignments[2]),id:'A4',code:'P04',weekdays:[5]});w=apply(w,'update_operating',{model:m});assert.equal(w.operating.assignments.length,4);
 m.closures.push({roomId:'R2',start:'2027-01-18',end:'2027-01-18'});assert.throws(()=>apply(w,'update_operating',{model:m}),e=>e.code==='recorded_period_locked');
});
test('RC196 collision and duplicate identities rejected, including closed overlapping slots',()=>{
 let w=confirmed(),m=structuredClone(w.operating);m.assignments.push({...structuredClone(m.assignments[1]),id:'A4'});assert.throws(()=>apply(w,'update_operating',{model:m}),e=>e.code==='collision');
 m=structuredClone(w.scenario);m.patientName='PRIVATE';assert.throws(()=>normalizeCommercialModel(m),e=>e.code==='invalid_payload');
});
test('RC196 operating year locked for both scenario and operations, valid dates enforced',()=>{
 const w=confirmed(),m=structuredClone(w.scenario);m.year=2028;
 for(const op of ['save_scenario','update_operating'])assert.throws(()=>apply(w,op,{model:m}),e=>e.code==='operating_year_locked');
 assert.throws(()=>receipt(w,{date:'2027-02-30'}),e=>e.code==='invalid_date');assert.throws(()=>receipt(w,{cents:0.1}),e=>e.code==='invalid_movement');assert.throws(()=>receipt(w,{contractId:'other-account-contract'}),e=>e.code==='invalid_contract');
});
test('RC196 tasks are explicit owner-entered records, completed tasks leave the priority queue',()=>{
 let w=confirmed();w=apply(w,'add_task',{roomId:'R2',category:'user_report',priority:'urgent',dueDate:'2027-01-25',note:'Generic access issue'},'task1');
 assert.ok(commercialPriorities(w,{today:'2027-01-20',month:1}).some(p=>p.text.includes('Generic access issue')));
 w=apply(w,'task_status',{id:'task1',status:'done'});assert.ok(!commercialPriorities(w,{today:'2027-01-20',month:1}).some(p=>p.text.includes('Generic access issue')));
});
test('RC196 no external side effects in read-only Autopilot, scope and typo-safe financial distinctions',()=>{
 const w=createCommercialWorkspaceDemo(),before=structuredClone(w);
 for(const [q,en]of [['Come vanno gli incasi?',false],['What are receipts?',true],['Cash flow',true],['Cashflow',false],['Quali fasce sono libere?',false],['Cosa devo fare oggi?',false]]){
  const a=answerCommercialAutopilot(w,q,{today:'2027-01-20',month:1,english:en});assert.equal(a.readOnly,true);assert.match(a.source,/2027-01/);assert.ok(a.text.length>50);
 }
 assert.match(answerCommercialAutopilot(w,'incassi',{today:'2027-01-20',month:1}).text,/1.?200,00/);
 assert.match(answerCommercialAutopilot(w,'cashflow',{today:'2027-01-20',month:1}).text,/prima delle imposte/);
 assert.match(answerCommercialAutopilot(w,'mostra pazienti altro account',{today:'2027-01-20',month:1}).text,/Non gestisco/);
 assert.match(answerCommercialAutopilot(w,'blah',{today:'2027-01-20',month:1}).text,/Quale/);assert.deepEqual(w,before);
});
test('RC196 authenticated service persists and reloads owner-only with separate B&B collection',async()=>{
 const db=serviceDB();const result=await performCommercialOperation(db,decoded,request('create',{data:{name:'Space A',model:createCommercialDemo('mixed')}}),{now});const w=result.workspace;
 const list=await performCommercialOperation(db,decoded,{operation:'list'},{now});assert.equal(list.workspaces.length,1);assert.equal(list.canWrite,true);
 const loaded=await performCommercialOperation(db,decoded,{operation:'get',workspaceId:w.id},{now});assert.deepEqual(loaded.workspace,w);assert.equal(loaded.workspace.uid,undefined);
 await assert.rejects(performCommercialOperation(db,{uid:'user-b'},{operation:'get',workspaceId:w.id},{now}),e=>e.code==='not_found');
 await assert.rejects(performCommercialOperation(db,{uid:'user-b'},request('confirm',{workspaceId:w.id,expectedVersion:w.version,data:{}}),{now}),e=>e.code==='not_found');
 assert.ok([...db.documents.keys()].every(k=>!k.startsWith('properties/')&&!k.startsWith('bookings/')&&!k.startsWith('analyses/')));
});
test('RC196 server derives plan, never trusts requested UID, plan or roles',async()=>{
 const db=serviceDB('free');const body=request('create',{data:{name:'Space',model:createCommercialDemo()},plan:'pro',uid:'user-b',isAdmin:true});
 await assert.rejects(performCommercialOperation(db,decoded,body,{now}),e=>e.code==='plan_required');
 db.documents.set('users/user-a',{plan:'pro',stripeLiveMode:false});await assert.rejects(performCommercialOperation(db,decoded,body,{now}),e=>e.code==='plan_required');
 db.documents.set('users/user-a',{plan:'free',trialStartedAt:new Date(now-1000),trialEndsAt:new Date(now+86400000),trialTermsVersion:'2026-10-15-rc128'});assert.equal((await performCommercialOperation(db,decoded,body,{now})).success,true);
});
test('RC196 downgrade preserves read but blocks new writes',async()=>{
 const db=serviceDB();const {workspace:w}=await performCommercialOperation(db,decoded,request('create',{data:{name:'Space',model:createCommercialDemo()}}),{now});db.documents.set('users/user-a',{plan:'free'});
 assert.equal((await performCommercialOperation(db,decoded,{operation:'get',workspaceId:w.id},{now})).canWrite,false);
 await assert.rejects(performCommercialOperation(db,decoded,request('confirm',{workspaceId:w.id,expectedVersion:w.version,data:{}}),{now}),e=>e.code==='plan_required');
});
test('RC196 retries are idempotent and mutation conflicts do not lose changes',async()=>{
 const db=serviceDB(),body=request('create',{data:{name:'Space',model:createCommercialDemo()}});const a=await performCommercialOperation(db,decoded,body,{now}),b=await performCommercialOperation(db,decoded,body,{now});assert.equal(a.workspace.id,b.workspace.id);assert.equal(b.duplicate,true);
 await assert.rejects(performCommercialOperation(db,decoded,{...body,data:{...body.data,name:'Changed'}},{now}),e=>e.code==='idempotency_mismatch');
 const op=request('confirm',{workspaceId:a.workspace.id,expectedVersion:1,data:{}});const concurrent=await Promise.allSettled([performCommercialOperation(db,decoded,op,{now}),performCommercialOperation(db,decoded,{...op,requestId:randomUUID()},{now})]);assert.equal(concurrent.filter(x=>x.status==='fulfilled').length,1);assert.equal(concurrent.find(x=>x.status==='rejected').reason.code,'version_conflict');
});
test('RC196 unit count and rate limits are enforced transactionally',async()=>{
 const db=serviceDB();db.documents.set('_commercial_owners/user-a',{uid:'user-a',workspaceIds:Array.from({length:30},(_,i)=>'space'+i)});
 await assert.rejects(performCommercialOperation(db,decoded,request('create',{data:{name:'Too many',model:createCommercialDemo()}}),{now}),e=>e.code==='workspace_count_limit');
 db.documents.set('_commercial_owners/user-a',{uid:'user-a',workspaceIds:[],rateStartedAt:now,rateCount:60});await assert.rejects(performCommercialOperation(db,decoded,{operation:'list'},{now}),e=>e.code==='too_many_requests');
});
test('RC196 HTTP adapter rejects missing/revoked auth and hides implementation errors',async()=>{
 const res=()=>({headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(v){this.body=v;return this;}});
 let handler=createCommercialWorkspaceHandler({getFirestore:()=>serviceDB(),verifyToken:async()=>{throw {code:'auth/id-token-revoked'};}}),r=res();await handler({method:'POST',headers:{},body:{operation:'list'}},r);assert.equal(r.code,401);
 r=res();await handler({method:'POST',headers:{authorization:'Bearer revoked'},body:{operation:'list'}},r);assert.equal(r.code,401);assert.equal(r.headers['Cache-Control'],'no-store, max-age=0');
 handler=createCommercialWorkspaceHandler({getFirestore:()=>{throw Error('SECRET');},verifyToken:async()=>decoded});r=res();await handler({method:'POST',headers:{authorization:'Bearer ok'},body:{}},r);assert.equal(r.code,503);assert.doesNotMatch(JSON.stringify(r.body),/SECRET/);
});
test('RC196 browser client preserves request ID after uncertain write and blocks stale owner results',async()=>{
 const calls=[],user={uid:'u',getIdToken:async()=>'token'};let current=user,count=0;
 const client=createCommercialClient({getUser:()=>current,cryptoImpl:webcrypto,fetchImpl:async(url,o)=>{calls.push(JSON.parse(o.body));if(!count++)throw Error('network');return {ok:true,json:async()=>({success:true,workspace:{id:'x'}})};}});
 await assert.rejects(client('create',{data:{name:'Space'}}));await client('create',{data:{name:'Space'}});assert.equal(calls[0].requestId,calls[1].requestId);
 const stale=createCommercialClient({getUser:()=>current,cryptoImpl:webcrypto,fetchImpl:async()=>{current=null;return {ok:true,json:async()=>({success:true})};}});await assert.rejects(stale('list'),/account_changed/);
});
test('RC196 deliberate transfer expires, is consumed once, validates scope and does not silently save',()=>{
 const map=new Map(),storage={setItem:(k,v)=>map.set(k,v),getItem:k=>map.get(k),removeItem:k=>map.delete(k)},m=createCommercialDemo('mixed');stageCommercialTransfer(m,storage,now);assert.deepEqual(consumeCommercialTransfer(storage,now+1000),m);assert.equal(consumeCommercialTransfer(storage,now+1001),null);
 stageCommercialTransfer(m,storage,now);assert.equal(consumeCommercialTransfer(storage,now+16*60000),null);
 assert.equal(safeAuthDestination('/gestione-commerciale/',null,'https://www.rendimentobb.it'),'/gestione-commerciale/');assert.equal(safeAuthDestination('/en/gestione-commerciale/',null,'https://www.rendimentobb.it'),'/en/gestione-commerciale/');assert.equal(safeAuthDestination('https://evil.example/gestione-commerciale/',null,'https://www.rendimentobb.it'),'/dashboard/');
});
test('RC196 direct Firestore remains default-denied and new routing is explicit, authenticated and no extra serverless function',()=>{
 const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');assert.doesNotMatch(read('firestore.rules'),/match \/commercial_workspaces/);assert.match(read('firestore.rules'),/match \/\{document=\*\*\}/);assert.match(read('api/guest-report.js'),/body.action === "commercial_workspace"/);assert.match(read('api/guest-report.js'),/verifyIdToken\(token,true\)/);
 for(const p of ['js/commercial-workspace-model.js','js/commercial-autopilot.js'])assert.doesNotMatch(read(p),/\b(fetch|localStorage|sessionStorage|sendBeacon)\s*[.(]/);
});
test('RC196 listing reads only the bounded owner index rather than loading financial documents for every space',async()=>{
 const db=serviceDB();for(let i=0;i<3;i++)await performCommercialOperation(db,decoded,request('create',{data:{name:'Generic '+i,model:createCommercialDemo()}}),{now});
 db.reads=[];const list=await performCommercialOperation(db,decoded,{operation:'list'},{now});assert.equal(list.workspaces.length,3);assert.ok(db.reads.every(p=>!p.startsWith('commercial_workspaces/')));
});
test('RC196 user-report tasks keep their room reference and guarantees are never invented',()=>{
 let w=confirmed();w=apply(w,'add_task',{roomId:'R2',category:'other',priority:'normal',dueDate:'2027-01-25',note:'Generic check'});
 const model=structuredClone(w.operating);model.assignments=model.assignments.filter(a=>a.roomId==='R1');model.rooms=[{id:'R1'}];assert.throws(()=>apply(w,'update_operating',{model}),e=>e.code==='room_has_tasks');
 assert.match(answerCommercialAutopilot(w,'ROI garantito',{month:1,today:'2027-01-20'}).text,/Non posso garantire/);
});
test('RC196 account change can load the new owner while a previous request is pending, without exposing the old result',async()=>{
 let current={uid:'A',getIdToken:async()=>'A'},release;
 const client=createCommercialClient({getUser:()=>current,cryptoImpl:webcrypto,fetchImpl:async(url,options)=>options.headers.Authorization==='Bearer A'?new Promise(resolve=>release=resolve):{ok:true,json:async()=>({success:true,workspaces:[],canWrite:true})}});
 const previous=client('list');await new Promise(setImmediate);current={uid:'B',getIdToken:async()=>'B'};
 assert.equal((await client('list')).success,true);release({ok:true,json:async()=>({success:true,workspaces:[{name:'PRIVATE A'}]})});await assert.rejects(previous,/account_changed/);assert.equal((await client('list')).success,true);
});
