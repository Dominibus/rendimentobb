// Local emulator only. Refuse to initialize against production.
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {initializeApp,deleteApp} from 'firebase-admin/app';
import {getFirestore,FieldValue} from 'firebase-admin/firestore';
import {performPMSOperation} from '../lib/pms-booking-service.js';
if(!/^127\.0\.0\.1:\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST||''))throw Error('Local Firestore emulator required');
const app=initializeApp({projectId:'demo-rendimentobb-security'},'rc148-import');
const db=getFirestore(app),options={timestamp:()=>FieldValue.serverTimestamp()};
let sequence=0;
async function fixture(plan='investor'){
  const uid='rc148-'+(++sequence),propertyId='rc148-property-'+sequence;
  await db.collection('users').doc(uid).set({plan});await db.collection('properties').doc(propertyId).set({uid});
  const data={propertyId,guestName:'Synthetic guest',checkin:'2027-01-10',checkout:'2027-01-12',guests:2,totalAmount:300,status:'arrival',source:'airbnb'};
  const request=(reference='TEST-1',patch={})=>({operation:'save',requestId:randomUUID(),bookingId:null,expectedVersion:0,data:{...data,...patch},importReference:{source:'airbnb',reference}});
  const run=body=>performPMSOperation(db,{uid,email_verified:true,email:'synthetic@example.test'},body,options);
  const rows=async()=> (await db.collection('bookings').where('propertyId','==',propertyId).get()).docs.map(s=>s.data());
  return {uid,propertyId,data,request,run,rows};
}
test('actual Firestore transactions serialize concurrent imports with separate request IDs',async()=>{
  const f=await fixture();const result=await Promise.all([f.run(f.request()),f.run(f.request())]);assert.equal(result[0].bookingId,result[1].bookingId);assert.equal(result.filter(r=>r.importDuplicate).length,1);assert.equal((await f.rows()).length,1);
});
test('actual Firestore availability prevents separate references from overlapping',async()=>{
  const f=await fixture();const result=await Promise.allSettled([f.run(f.request('A')),f.run(f.request('B'))]);assert.equal(result.filter(r=>r.status==='fulfilled').length,1);assert.equal(result.find(r=>r.status==='rejected').reason.code,'conflict');assert.equal((await f.rows()).length,1);
});
test('actual Firestore keeps original amounts and provenance on changed reimport',async()=>{
  const f=await fixture();await f.run(f.request());await assert.rejects(f.run(f.request('TEST-1',{totalAmount:400})),e=>e.code==='import_changed');const [row]=await f.rows();assert.equal(row.totalAmount,300);assert.equal(row.importReference.reference,'TEST-1');assert.equal(row.uid,f.uid);assert.equal(row.nights,2);
});
test('actual Firestore rejects Free and another owner property',async()=>{
  const f=await fixture('free');await assert.rejects(f.run(f.request()),e=>e.code==='plan_required');assert.equal((await f.rows()).length,0);
  const g=await fixture();await db.collection('properties').doc(g.propertyId).set({uid:'different-owner'});await assert.rejects(g.run(g.request()),e=>e.code==='forbidden');assert.equal((await g.rows()).length,0);
});
test.after(async()=>{await db.terminate();await deleteApp(app);});
