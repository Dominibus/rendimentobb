import assert from 'node:assert/strict';
import {initializeApp,deleteApp} from 'firebase-admin/app';
import {getFirestore,FieldValue} from 'firebase-admin/firestore';
import {loadReminderBookings,queueDailyReminders} from '../lib/pms-reminders.js';
if(!/^127\.0\.0\.1:\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST||''))throw Error('Local emulator required');
const app=initializeApp({projectId:'demo-rendimentobb-security'},'rc216-reminders');
const db=getFirestore(app),uid='rc216-synthetic',now=Date.parse('2026-10-28T07:00:00Z');
try{
 const batch=db.batch();
 batch.set(db.collection('users').doc(uid),{plan:'pro',notificationPreferences:{pmsReminderEmail:true}});
 batch.set(db.collection('properties').doc('rc216-property'),{uid,name:'Synthetic'});
 for(let i=0;i<450;i++)batch.set(db.collection('bookings').doc('rc216-'+String(i).padStart(4,'0')),{uid,propertyId:'rc216-property',status:i===449?'arrival':'cancelled',checkin:'2026-10-28',checkout:'2026-10-30',guests:1,guestRegistration:{documentsReceived:1,authorityStatus:'submitted'},cleaning:{required:false}});
 batch.set(db.collection('bookings').doc('rc216-other'),{uid:'different-account'});
 await batch.commit();
 const rows=await loadReminderBookings({db,uid});assert.equal(rows.length,450);assert.equal(new Set(rows.map(r=>r.id)).size,450);assert.ok(rows.every(r=>r.uid===uid));
 assert.equal(await loadReminderBookings({db,uid,maxPages:1}),null);
 const stats=await queueDailyReminders({db,getAuthUser:async()=>({email:'synthetic@example.test',emailVerified:true}),timestamp:()=>FieldValue.serverTimestamp(),now});
 assert.equal(stats.queued,1);assert.equal(stats.incompleteAccounts,0);
 const queued=await db.collection('_pms_notifications').get();assert.equal(queued.size,1);assert.equal(queued.docs[0].data().reminderItems[0].bookingId,'rc216-0449');
 console.log('PASS: actual Firestore pagination, 450 owned bookings, cross-account isolation, incomplete-page refusal, one queued reminder; no email provider called.');
}finally{await db.terminate();await deleteApp(app);}
