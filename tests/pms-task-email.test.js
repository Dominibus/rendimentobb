import test from 'node:test';
import assert from 'node:assert/strict';
import {MemoryFirestore} from './helpers/pms-memory-firestore.js';
import {sendTaskUpdates,buildTaskEmail} from '../lib/pms-task-email.js';
const who={uid:'u1',email:'host@example.test',email_verified:true};
const event={id:'a'.repeat(64)+'.documents.in_progress',code:'documents',status:'in_progress',actor:{uid:'u1',name:'Host <admin>'},at:'2026-10-04T16:00:00Z'};
const booking={uid:'u1',propertyId:'p1',guestName:'Guest <test>',checkin:'2026-10-10',checkout:'2026-10-12',autopilotEvents:[event]};
function setup(extra={}){const db=new MemoryFirestore({'bookings/b1':booking,'properties/p1':{uid:'u1',name:'Home'},'users/u1':{notificationPreferences:{pmsTaskEmail:true}},...extra}),mails=[];const resend={emails:{send:async(...args)=>{mails.push(args);return {data:{id:'mail-id'}};}}};return {db,resend,mails};}
const body={bookingId:'b1',eventIds:[event.id],lang:'it'};
const send=(ctx,options={})=>sendTaskUpdates({...ctx,decoded:who,body,timestamp:()=> 'server-time',now:100000,...options});
test('task mail sends only authoritative stored event to authenticated owner and deduplicates',async()=>{
 const c=setup();assert.equal((await send(c)).sent,1);assert.equal((await send(c)).duplicates,1);assert.equal(c.mails.length,1);assert.deepEqual(c.mails[0][0].to,['host@example.test']);assert.match(c.mails[0][0].html,/Host &lt;admin&gt;/);assert.match(c.mails[0][1].idempotencyKey,/rb-task-/);
});
test('simultaneous mail requests deliver a single notification',async()=>{
 const c=setup();await Promise.all([send(c),send(c)]);assert.equal(c.mails.length,1);
});
test('task emails are opt in and require verified email',async()=>{
 const c=setup({'users/u1':{notificationPreferences:{}}});assert.equal((await send(c)).reason,'preference_disabled');assert.equal(c.mails.length,0);
 assert.equal((await send(setup(),{decoded:{...who,email_verified:false}})).httpStatus,403);
});
test('other account and fabricated event cannot select recipient or notification content',async()=>{
 const c=setup();assert.equal((await send(c,{decoded:{...who,uid:'u2'}})).httpStatus,403);assert.equal((await send(c,{body:{...body,eventIds:['b'.repeat(64)+'.documents.in_progress'],recipient:'attacker@example.test'}})).error,'event_not_found');assert.equal(c.mails.length,0);
});
test('failed provider response is recorded as failed and can be retried',async()=>{
 const c=setup();c.resend.emails.send=async()=>({error:{message:'provider failure'}});assert.equal((await send(c)).httpStatus,502);assert.equal([...c.db.documents].find(([key])=>key.startsWith('_pms_notifications/'))[1].status,'failed');
 c.resend.emails.send=async()=>({data:{id:'retry-id'}});assert.equal((await send(c)).sent,1);
});
test('batch rejects oversize and malformed event identifiers without sending',async()=>{
 const c=setup();for(const ids of [[],Array(6).fill(event.id),['bad']])assert.equal((await send(c,{body:{...body,eventIds:ids}})).httpStatus,400);assert.equal(c.mails.length,0);
});
test('resolution email is localized and describes saved booking facts',()=>{
 const result=buildTaskEmail(booking,{...event,status:'resolved'},'Home','en');assert.match(result.title,/resolved/);assert.match(result.text,/does not independently verify/);assert.match(result.text,/Europe\/Rome/);assert.match(result.html,/Guest &lt;test&gt;/);
});
