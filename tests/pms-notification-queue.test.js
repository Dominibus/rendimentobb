import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {MemoryFirestore} from './helpers/pms-memory-firestore.js';
import {makeTaskNotification,taskNotificationId,dispatchTaskNotification,drainTaskNotifications} from '../lib/pms-notification-queue.js';
import {performPMSOperation} from '../lib/pms-booking-service.js';
import {sendTaskUpdates} from '../lib/pms-task-email.js';
import {reconcilePMSTasks} from '../js/pms-tasks.js';

const now=Date.parse('2026-10-05T07:00:00Z'),timestamp=()=> 'server-time';
const who={uid:'u1',email:'host@example.test',email_verified:true};
const event={id:'a'.repeat(64)+'.documents.in_progress',code:'documents',status:'in_progress',actor:{uid:'u1',name:'Owner'},at:new Date(now).toISOString()};
const booking={uid:'u1',propertyId:'p1',guestName:'Mario <test>',checkin:'2026-10-10',checkout:'2026-10-12',guests:1,status:'arrival',guestRegistration:{documentsReceived:0,authorityStatus:'not_required'},cleaning:{required:false},_pmsVersion:1,autopilotEvents:[event]};
const id=taskNotificationId(who.uid,event.id),path=`_pms_notifications/${id}`;
const make=(extra={})=>makeTaskNotification({uid:who.uid,bookingId:'b1',booking,event,propertyName:'Home',recipient:who.email,lang:'it',sandbox:false,now,timestamp,...extra});
function setup(extra={}){
 const db=new MemoryFirestore({'users/u1':{plan:'pro',notificationPreferences:{pmsTaskEmail:true}},'bookings/b1':booking,'properties/p1':{uid:'u1',name:'Home'},[path]:make(),...extra});
 const mails=[];const resend={emails:{send:async(payload,options)=>{mails.push({payload,options});return {data:{id:'accepted-1'}};}}};
 const getAuthUser=async uid=>{assert.equal(uid,'u1');return {uid,email:who.email,emailVerified:true,disabled:false};};
 return {db,resend,getAuthUser,mails};
}
const dispatch=(ctx,extra={})=>dispatchTaskNotification({...ctx,id,timestamp,now,...extra});
const drain=(ctx,extra={})=>drainTaskNotifications({...ctx,timestamp,now,pause:async()=>{},...extra});

function claimRequest(db){
 const tasks=reconcilePMSTasks(booking,{},new Date(now).toISOString());
 db.documents.set('bookings/b1',{...booking,autopilotTasks:tasks});
 return {operation:'task',bookingId:'b1',expectedVersion:1,requestId:randomUUID(),taskCode:'documents',taskStatus:'in_progress',taskFingerprint:tasks.documents.fingerprint,notificationLang:'en'};
}
test('claim commits booking transition and immutable English notification in one transaction',async()=>{
 const c=setup();c.db.documents.delete(path);const req=claimRequest(c.db);
 const result=await performPMSOperation(c.db,who,req,{now,timestamp});
 assert.equal(result.taskNotificationsQueued,1);
 const [key,row]=[...c.db.documents].find(([key])=>key.startsWith('_pms_notifications/'));
 assert.equal(row.status,'pending');assert.equal(row.readyAt,now);assert.equal(row.lang,'en');assert.deepEqual(row.payload.to,[who.email]);assert.match(row.payload.html,/Mario &lt;test&gt;/);
 assert.equal(c.db.documents.get('bookings/b1').autopilotTasks.documents.status,'in_progress');
 const duplicate=await performPMSOperation(c.db,who,req,{now,timestamp});assert.equal(duplicate.duplicate,true);
 assert.equal([...c.db.documents].filter(([key])=>key.startsWith('_pms_notifications/')).length,1);
 // Close the browser: only the scheduled worker executes after this point.
 assert.equal((await drain(c)).sent,1);assert.equal(c.db.documents.get(key).status,'sent');
});
test('failed operation creates no queued email or partial booking update',async()=>{
 const c=setup();c.db.documents.delete(path);const req=claimRequest(c.db);req.expectedVersion=0;
 await assert.rejects(performPMSOperation(c.db,who,req,{now,timestamp}),error=>error.code==='stale_version');
 assert.equal([...c.db.documents].some(([key])=>key.startsWith('_pms_notifications/')),false);
 assert.equal(c.db.documents.get('bookings/b1')._pmsVersion,1);
});
test('disabled preference and unverified token do not enqueue old notifications for later delivery',async()=>{
 for(const mode of ['preference','verification']){
  const c=setup();c.db.documents.delete(path);const req=claimRequest(c.db);
  if(mode==='preference')c.db.documents.set('users/u1',{plan:'pro',notificationPreferences:{pmsTaskEmail:false}});
  const result=await performPMSOperation(c.db,mode==='verification'?{...who,email_verified:false}:who,req,{now,timestamp});
  assert.equal(result.taskNotificationsQueued,0);assert.equal([...c.db.documents].some(([key])=>key.startsWith('_pms_notifications/')),false);
 }
});
test('cancellation produces no new resolution notifications and suppresses pending ones',async()=>{
 const c=setup();await performPMSOperation(c.db,who,{operation:'cancel',bookingId:'b1',expectedVersion:1,requestId:randomUUID()},{now,timestamp});
 assert.equal([...c.db.documents].filter(([key])=>key.startsWith('_pms_notifications/')).length,1);
 assert.equal((await drain(c)).suppressed,1);assert.equal(c.mails.length,0);
});
test('immediate authenticated sender and cron racing use a single provider call',async()=>{
 const c=setup();const result=await Promise.all([
  sendTaskUpdates({...c,decoded:who,body:{bookingId:'b1',eventIds:[event.id],lang:'en'},timestamp,now}),drain(c)
 ]);
 assert.equal(c.mails.length,1);assert.equal(c.db.documents.get(path).status,'sent');
 assert.equal((await dispatch(c)).status,'duplicate');assert.equal((await drain(c)).checked,0);
});
test('queue recipient and HTML remain immutable after booking/name/language change',async()=>{
 const c=setup();c.db.documents.set('bookings/b1',{...booking,guestName:'Changed guest'});c.db.documents.set('properties/p1',{uid:'u1',name:'Changed home'});
 await sendTaskUpdates({...c,decoded:who,body:{bookingId:'b1',eventIds:[event.id],lang:'en',recipient:'attacker@example.test'},timestamp,now});
 assert.match(c.mails[0].payload.subject,/presa in carico/);assert.match(c.mails[0].payload.text,/Mario <test>/);assert.ok(!c.mails[0].payload.text.includes('Changed'));assert.deepEqual(c.mails[0].payload.to,[who.email]);
});
test('definitive provider rejection retries after its delay, even on next daily cron',async()=>{
 const c=setup();c.resend.emails.send=async()=>({error:{name:'rate_limit_exceeded',message:'Rejected'}});
 assert.equal((await dispatch(c)).status,'retry');assert.equal(c.db.documents.get(path).uncertain,false);
 assert.equal((await drain(c)).checked,0);
 c.resend.emails.send=async()=>({data:{id:'recovered'}});
 assert.equal((await drain(c,{now:now+25*60*60*1000})).sent,1);assert.equal(c.db.documents.get(path).providerId,'recovered');
});
test('ambiguous network outcome reuses the exact payload and key inside safe retry window',async()=>{
 const c=setup();c.resend.emails.send=async(payload,options)=>{c.mails.push({payload,options});throw Error('connection lost');};
 assert.equal((await dispatch(c)).uncertain,true);
 c.resend.emails.send=async(payload,options)=>{c.mails.push({payload,options});return {data:{id:'same-provider-result'}};};
 assert.equal((await dispatch(c,{now:now+6*60*1000})).status,'sent');
 assert.deepEqual(c.mails[0],c.mails[1]);
});
test('uncertain delivery beyond safe window is stopped for review, never blindly duplicated',async()=>{
 const c=setup();c.resend.emails.send=async()=>{throw Error('connection lost');};await dispatch(c);
 c.resend.emails.send=async()=>{assert.fail('must not send again after expired provider deduplication');};
 assert.equal((await dispatch(c,{now:now+24*60*60*1000})).status,'manual_review');assert.equal(c.db.documents.get(path).readyAt,null);
});
test('expired sending lease recovers with same key; live lease blocks second sender',async()=>{
 const c=setup();c.db.documents.set(path,{...make(),status:'sending',lease:'old',readyAt:now+300000,firstAttemptAt:now,attempts:1});
 assert.equal((await dispatch(c)).status,'busy');assert.equal(c.mails.length,0);
 assert.equal((await dispatch(c,{now:now+300001})).status,'sent');assert.equal(c.mails.length,1);
});
test('current authorization, email verification, preference and account status are rechecked at send time',async()=>{
 for(const mode of ['unverified','changed_email','disabled','free','preferences','ownership','deleted','moved']){
  const c=setup();
  if(mode==='unverified')c.getAuthUser=async()=>({email:who.email,emailVerified:false});
  if(mode==='changed_email')c.getAuthUser=async()=>({email:'other@example.test',emailVerified:true});
  if(mode==='disabled')c.getAuthUser=async()=>({email:who.email,emailVerified:true,disabled:true});
  if(mode==='free')c.db.documents.set('users/u1',{plan:'free',notificationPreferences:{pmsTaskEmail:true}});
  if(mode==='preferences')c.db.documents.set('users/u1',{plan:'pro',notificationPreferences:{pmsTaskEmail:false}});
  if(mode==='ownership')c.db.documents.set('properties/p1',{uid:'u2'});
  if(mode==='deleted')c.db.documents.delete('bookings/b1');
  if(mode==='moved')c.db.documents.set('bookings/b1',{...booking,propertyId:'p2'});
  assert.equal((await dispatch(c)).status,'suppressed',mode);assert.equal(c.mails.length,0,mode);
 }
});
test('temporary validation failure remains retriable without counting a provider attempt',async()=>{
 const c=setup();c.getAuthUser=async()=>{throw Error('Firebase unavailable');};assert.equal((await dispatch(c)).status,'retry');assert.equal(c.db.documents.get(path).attempts,0);
 c.getAuthUser=async()=>({email:who.email,emailVerified:true});assert.equal((await dispatch(c,{now:now+900001})).status,'sent');
});
test('malformed queue recipient cannot send a forged notification',async()=>{
 const c=setup();const row=make();row.payload.to=['attacker@example.test'];c.db.documents.set(path,row);
 assert.equal((await dispatch(c)).reason,'invalid_queue_entry');assert.equal(c.mails.length,0);
});
test('scheduled production worker never dispatches sandbox notifications',async()=>{
 const c=setup({[path]:make({sandbox:true})});assert.equal((await drain(c)).sent,0);assert.equal(c.mails.length,0);
});
test('worker limits batch size and respects oldest due first without scanning completed notifications',async()=>{
 const c=setup();c.db.documents.delete(path);
 for(let i=0;i<12;i++){
  const next={...event,id:i.toString(16).padStart(64,'0')+'.documents.in_progress'};
  c.db.documents.set('_pms_notifications/'+taskNotificationId(who.uid,next.id),make({event:next,now:now-i}));
 }
 const stats=await drain(c,{limit:3});assert.equal(stats.checked,3);assert.equal(stats.sent,3);assert.equal(c.mails.length,3);
 assert.equal((await drain(c,{limit:20})).sent,9);assert.equal((await drain(c)).checked,0);
});
test('worker stops before starting additional emails when invocation budget is consumed',async()=>{
 const c=setup();let calls=0;const stats=await drain(c,{clock:()=>calls++===0?0:30000,budgetMs:20000});assert.equal(stats.checked,0);assert.equal(c.mails.length,0);
});
test('repeated definitive provider rejection ends after a bounded number of attempts',async()=>{
 const c=setup();c.resend.emails.send=async()=>({error:{message:'Rejected'}});
 for(let i=0;i<5;i++)await dispatch(c,{now:now+i*900001});
 assert.equal(c.db.documents.get(path).status,'manual_review');assert.equal(c.db.documents.get(path).attempts,5);
});

test('provider acceptance followed by database failure recovers without a second delivery',async()=>{
 const c=setup();const delivered=new Map();const original=c.db.runTransaction.bind(c.db);let failCommit=true;
 c.resend.emails.send=async(payload,options)=>{
  if(!delivered.has(options.idempotencyKey))delivered.set(options.idempotencyKey,{data:{id:'accepted-once'}});
  c.db.runTransaction=async action=>{if(failCommit){failCommit=false;throw Error('write outage');}return original(action);};
  return delivered.get(options.idempotencyKey);
 };
 await assert.rejects(dispatch(c),/write outage/);assert.equal(c.db.documents.get(path).status,'sending');
 c.db.runTransaction=original;
 assert.equal((await dispatch(c,{now:now+300001})).status,'sent');assert.equal(delivered.size,1);
});
test('temporary validation failure after a crashed sending attempt preserves uncertainty',async()=>{
 const c=setup();c.db.documents.set(path,{...make(),status:'sending',readyAt:now,firstAttemptAt:now-600000,attempts:1});
 c.getAuthUser=async()=>{throw Error('Firebase unavailable');};assert.equal((await dispatch(c)).status,'retry');assert.equal(c.db.documents.get(path).uncertain,true);
 c.getAuthUser=async()=>({email:who.email,emailVerified:true});
 assert.equal((await dispatch(c,{now:now+24*60*60*1000})).status,'manual_review');assert.equal(c.mails.length,0);
});
test('timed-out provider call stays uncertain rather than claiming failed delivery',async()=>{
 const c=setup();c.resend.emails.send=()=>new Promise(()=>{});
 const result=await dispatch(c,{timeoutMs:5});assert.equal(result.status,'retry');assert.equal(result.uncertain,true);assert.equal(c.db.documents.get(path).status,'retry');
});

test('SDK 3.x request options transmit deduplication without losing authentication',async()=>{
 const c=setup();c.resend.headers=new Headers({'Authorization':'Bearer test-only','Content-Type':'application/json'});
 await dispatch(c);
 const headers=c.mails[0].options.headers;
 assert.equal(headers.get('Idempotency-Key'),`rb-task-${id}`);
 assert.equal(headers.get('Authorization'),'Bearer test-only');
 assert.equal(headers.get('Content-Type'),'application/json');
 assert.equal(c.resend.headers.has('Idempotency-Key'),false);
});
test('SDK network errors returned as application_error retain uncertain delivery',async()=>{
 const c=setup();c.resend.emails.send=async()=>({error:{name:'application_error',message:'Unable to fetch data'}});
 await dispatch(c);assert.equal(c.db.documents.get(path).uncertain,true);
 assert.equal((await dispatch(c,{now:now+24*60*60*1000})).status,'manual_review');
});
