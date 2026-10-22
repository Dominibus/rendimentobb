import test from 'node:test';
import assert from 'node:assert/strict';
import {controlSummary} from '../js/admin-control-model.js';
import {notifyAdminOperations} from '../lib/admin-operations-alerts.js';
const now=Date.parse('2026-10-22T10:00:00Z');
const queue=entries=>({available:true,counts:{live:entries.filter(x=>x.environment==='live').length,test:entries.filter(x=>x.environment==='test').length,unknown:entries.filter(x=>x.environment==='unknown').length},entries});
const data=()=>({observedAt:now,jobs:[{id:'task_notifications',available:true,check:{state:'recorded_success',lastRunAt:now,metrics:{}}}],queues:{due:queue([]),manual:queue([])},interests:{available:true,entries:[]}});
const env={ADMIN_OPS_ALERTS_ENABLED:'true',VERCEL_ENV:'production'};
function store(){let state={},chain=Promise.resolve();const ref={async set(p){Object.assign(state,p);}};return {collection:()=>({doc:()=>ref}),runTransaction(fn){const run=chain.then(()=>fn({get:async()=>({data:()=>({...state})}),set:(r,p)=>{state={...p};}}));chain=run.catch(()=>{});return run;},get state(){return state;}};}
test('healthy stored results do not certify uncovered services',()=>{
 const s=controlSummary(data(),now);assert.equal(s.issues.length,0);assert.equal(s.snapshotStale,false);
 assert.equal(controlSummary(data(),now+300001).snapshotStale,true);
});
test('scheduled due work and test-only queues do not become live incidents',()=>{
 const d=data();d.queues.due=queue([{environment:'live',ageMs:1000},{environment:'test',ageMs:48*3600000}]);d.queues.manual=queue([{environment:'test'}]);
 assert.equal(controlSummary(d,now).issues.length,0);
 d.queues.due.entries.push({environment:'live',ageMs:25*3600000});
 assert.equal(controlSummary(d,now).issues[0].reason,'backlog');
});
test('missing evidence, stale runs and unknown environments remain separate',()=>{
 const d=data();d.jobs[0].check.lastRunAt=now-37*3600000;d.queues.manual=queue([{environment:'unknown'}]);
 const s=controlSummary(d,now);assert.equal(s.issues[0].reason,'stale');assert.equal(s.gaps[0].reason,'unknown_environment');
 d.jobs[0].check={state:'attention',lastRunAt:null};assert.ok(!controlSummary(d,now).issues.some(x=>x.reason==='stale'));
});
test('only unexpired recorded live interests are counted as opportunities',()=>{
 const d=data();d.interests.entries=[{environment:'live',state:'recorded'},{environment:'test',state:'recorded'},{environment:'unknown',state:'recorded'},{environment:'live',state:'expired'}];
 assert.equal(controlSummary(d,now).interests,1);
});
test('email is opt-in and production-only; disabled paths never read',async()=>{
 for(const e of [{},{...env,VERCEL_ENV:'preview'},{...env,ADMIN_OPS_ALERTS_ENABLED:'false'}]){
  assert.equal((await notifyAdminOperations({env:e,read:()=>{throw Error('must not read');}})).state,'disabled');
 }
});
test('quiet snapshots do not send or reserve a daily attempt',async()=>{
 const db=store();assert.equal((await notifyAdminOperations({db,env,now,read:async()=>data()})).state,'quiet');assert.deepEqual(db.state,{});
});
test('concurrent digest calls send only once, only to admin, without source payloads',async()=>{
 const db=store(),sent=[];const d=data();d.jobs[0].check.state='attention';d.secret='PRIVATE_EMAIL_PHONE_TOKEN';
 const resend={emails:{send:async(p,o)=>{sent.push({p,o});return {data:{id:'ok'}};}}};
 const result=await Promise.all([1,2,3].map(()=>notifyAdminOperations({db,resend,env,now,read:async()=>d})));
 assert.equal(sent.length,1);assert.equal(result.filter(r=>r.state==='accepted').length,1);
 assert.deepEqual(sent[0].p.to,['rendimentobb@gmail.com']);assert.ok(!JSON.stringify(sent).includes(d.secret));assert.equal(db.state.state,'accepted');
});
test('ambiguous delivery becomes manual review and is not replayed that day',async()=>{
 const db=store(),d=data();d.jobs[0].check.state='attention';let calls=0;
 const resend={emails:{send:async()=>{calls++;throw Error('provider private payload');}}};
 const options={db,resend,env,now,read:async()=>d};
 assert.equal((await notifyAdminOperations(options)).state,'review_required');
 assert.equal((await notifyAdminOperations(options)).state,'already_attempted');assert.equal(calls,1);
 assert.ok(!JSON.stringify(db.state).includes('provider private'));
 assert.equal((await notifyAdminOperations({...options,now:now+86400000})).state,'review_required');assert.equal(calls,2);
});
