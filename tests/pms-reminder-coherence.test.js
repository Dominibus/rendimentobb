import test from 'node:test';
import assert from 'node:assert/strict';
import {selectReminderTasks,buildReminderEmail} from '../lib/pms-reminder-model.js';
import {queueDailyReminders} from '../lib/pms-reminders.js';
import {dispatchTaskNotification} from '../lib/pms-notification-queue.js';
import {reconcilePMSTasks} from '../js/pms-tasks.js';
import {MemoryFirestore} from './helpers/pms-memory-firestore.js';

const now=Date.parse('2026-10-06T07:00:00Z');
const booking={id:'b1',uid:'u1',propertyId:'p1',guestName:'Francesca',guests:2,status:'arrival',checkin:'2026-10-07',checkout:'2026-10-11',guestRegistration:{documentsReceived:2,authorityStatus:'submitted'},cleaning:{required:true,status:'scheduled',scheduledDate:'2026-10-11'}};
const account=async()=>({email:'owner@example.test',emailVerified:true});
function setup(row=booking){return new MemoryFirestore({'users/u1':{plan:'pro',notificationPreferences:{pmsReminderEmail:true}},'properties/p1':{uid:'u1',name:'Residenza'},'bookings/b1':row});}
async function queue(db){await queueDailyReminders({db,getAuthUser:account,timestamp:()=>now,now});return [...db.documents].find(([path])=>path.startsWith('_pms_notifications/'));}
async function send(db,path,calls){return dispatchTaskNotification({db,getAuthUser:account,id:path.split('/')[1],timestamp:()=>now,now,resend:{emails:{send:async payload=>{calls.push(payload);return {data:{id:'mail-1'}};}}}});}

test('ready arrival tomorrow and post-checkout cleaning later in the week generate no dated reminder',()=>{
  assert.equal(selectReminderTasks([booking],now).length,0);
});
test('overdue arrival and check-out are removed only when their corresponding saved status changes',()=>{
  const arrival={...booking,checkin:'2026-10-04'};
  const departure={...booking,id:'b2',status:'checkin',checkin:'2026-10-03',checkout:'2026-10-05',cleaning:{required:false}};
  assert.deepEqual(selectReminderTasks([arrival,departure],now).map(row=>[row.bookingId,row.code,row.period]),[['b1','arrival','overdue'],['b2','departure','overdue']]);
  assert.equal(selectReminderTasks([{...arrival,status:'checkin'},{...departure,status:'checkout'}],now).length,0);
});
test('completed stay retains unfinished turnover due today, while cancelled stays are excluded',()=>{
  const cleaning={...booking,status:'completed',cleaning:{required:true,status:'scheduled',scheduledDate:'2026-10-06'}};
  assert.deepEqual(selectReminderTasks([cleaning],now).map(row=>row.code),['cleaning']);
  assert.equal(selectReminderTasks([{...cleaning,status:'cancelled'}],now).length,0);
});
test('resolved facts before queuing are absent from the email, and repeated cron generation cannot duplicate it',async()=>{
  const row={...booking,checkin:'2026-10-05'};
  const db=setup(row),entry=await queue(db);
  assert.deepEqual(entry[1].reminderItems.map(item=>item.code),['arrival']);
  assert.match(entry[1].payload.text,/Arrivo da registrare/);
  assert.ok(!entry[1].payload.text.includes('· Documenti ospiti'));
  await queue(db);const calls=[];
  assert.equal((await send(db,entry[0],calls)).status,'sent');
  assert.equal((await send(db,entry[0],calls)).status,'duplicate');
  assert.equal(calls.length,1);
});
test('arrival recorded after queuing suppresses the outdated snapshot before calling the provider',async()=>{
  const row={...booking,checkin:'2026-10-05'},db=setup(row),entry=await queue(db);
  db.documents.set('bookings/b1',{...row,status:'checkin'});
  const calls=[];assert.equal((await send(db,entry[0],calls)).status,'suppressed');
  assert.equal(calls.length,0);assert.equal(db.documents.get(entry[0]).reason,'reminder_changed');
});
test('taking charge after queuing suppresses an email with outdated task status',async()=>{
  const row={...booking,guestRegistration:{documentsReceived:0,authorityStatus:'submitted'}},db=setup(row),entry=await queue(db);
  const autopilotTasks=reconcilePMSTasks(row,{},'now');autopilotTasks.documents.status='in_progress';
  db.documents.set('bookings/b1',{...row,autopilotTasks});
  const calls=[];assert.equal((await send(db,entry[0],calls)).status,'suppressed');assert.equal(calls.length,0);
});
test('email distinguishes dates and operation labels in both languages and escapes guest content',()=>{
  const items=[{dueDate:'2026-10-05',code:'arrival',propertyName:'Casa',guestName:'<script>alert(1)</script>',status:'open'},
    {dueDate:'2026-10-06',code:'departure',propertyName:'Casa',guestName:'Carlo',status:'open'},
    {dueDate:'2026-10-07',code:'documents',propertyName:'Casa',guestName:'Francesca',status:'in_progress'}];
  const it=buildReminderEmail(items,'2026-10-06'),en=buildReminderEmail(items,'2026-10-06','en');
  assert.match(it.text,/Con data superata/);assert.match(it.text,/Oggi/);assert.match(it.text,/Domani/);
  assert.match(en.text,/Arrival to register/);assert.match(en.text,/Check-out to register/);
  assert.ok(!it.html.includes('<script>'));assert.ok(!en.html.includes('undefined'));
});
