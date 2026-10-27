import assert from 'node:assert/strict';
import {webcrypto,randomUUID} from 'node:crypto';
import {initializeApp,deleteApp} from '/workspace/rendimentobb/node_modules/firebase-admin/lib/esm/app/index.js';
import {getFirestore,FieldValue} from '/workspace/rendimentobb/node_modules/firebase-admin/lib/esm/firestore/index.js';
import {createPMSApiClient} from '/workspace/rendimentobb/js/pms-api-client.js';
import {performPMSOperation} from '/workspace/rendimentobb/lib/pms-booking-service.js';
if(!/^127\.0\.0\.1:\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST||''))throw Error('Refusing execution without local emulator');
const app=initializeApp({projectId:'demo-rendimentobb-security'},'audit-idempotency');
const db=getFirestore(app),uid='audit-synthetic-'+randomUUID(),propertyId='audit-property-'+randomUUID();
const decoded={uid,email_verified:true,email:'synthetic@example.test'};
try{
 await db.collection('users').doc(uid).set({plan:'investor'});
 await db.collection('properties').doc(propertyId).set({uid,name:'Synthetic audit property'});
 let first=true;const receipts=[];
 const api=createPMSApiClient({getUser:()=>({uid,getIdToken:async()=> 'synthetic-local-token'}),cryptoImpl:webcrypto,fetchImpl:async(url,options)=>{
  const body=JSON.parse(options.body),result=await performPMSOperation(db,decoded,body,{timestamp:()=>FieldValue.serverTimestamp()});
  receipts.push({guest:body.data.guestName,requestId:body.requestId,bookingId:result.bookingId,duplicate:result.duplicate===true});
  if(first){first=false;throw Error('Synthetic network response lost after real emulator commit');}
  return {ok:true,json:async()=>result};
 }});
 const data={propertyId,guestName:'Synthetic A',checkin:'2027-01-10',checkout:'2027-01-12',guests:2,totalAmount:300,status:'pending',source:'direct'};
 await assert.rejects(api('save',{data}),e=>e.code==='booking/write_uncertain');
 await api('save',{data:{...data,guestName:'Synthetic B'}});
 await api('save',{data});
 const rows=(await db.collection('bookings').where('propertyId','==',propertyId).get()).docs.map(d=>({id:d.id,...d.data()}));
 const a=rows.filter(r=>r.guestName==='Synthetic A');
 assert.equal(a.length,2,'Current defect reproduces two actual saved A bookings');
 assert.notEqual(receipts[0].requestId,receipts[2].requestId);
 assert.notEqual(receipts[0].bookingId,receipts[2].bookingId);
 console.log(JSON.stringify({probe:'A committed with lost response; B succeeded; A retried',emulator:process.env.FIRESTORE_EMULATOR_HOST,project:'demo-rendimentobb-security',totalSavedBookings:rows.length,syntheticABookings:a.length,requestIdChanged:receipts[0].requestId!==receipts[2].requestId,distinctBookingIds:receipts[0].bookingId!==receipts[2].bookingId,allPending:rows.every(r=>r.status==='pending'),defectConfirmed:true},null,2));
}finally{await db.terminate();await deleteApp(app);}
