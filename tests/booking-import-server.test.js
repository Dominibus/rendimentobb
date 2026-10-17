import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {performPMSOperation} from '../lib/pms-booking-service.js';
import {MemoryFirestore} from './helpers/pms-memory-firestore.js';
import {buildPMSOperationalReport} from '../js/pms-operational-report.js';
const auth={uid:'u1',email:'test@example.test',email_verified:true},opts={now:100000,timestamp:()=> 'server-time'};
const data={propertyId:'p1',guestName:'Guest',checkin:'2026-10-01',checkout:'2026-10-03',guests:2,totalAmount:300,status:'arrival',source:'airbnb'};
const body=(patch={})=>({operation:'save',requestId:randomUUID(),bookingId:null,expectedVersion:0,data:{...data},importReference:{source:'airbnb',reference:'AB-123'},...patch});
const seed=(extra={})=>new MemoryFirestore({'users/u1':{plan:'investor'},'properties/p1':{uid:'u1'},'properties/p2':{uid:'u1'},...extra});
const run=(db,request,who=auth)=>performPMSOperation(db,who,request,opts);
const bookings=db=>[...db.documents].filter(([path])=>path.startsWith('bookings/'));
test('import enters the normal booking model with derived nights, tasks, property tax and provenance',async()=>{
  const db=seed({'properties/p1':{uid:'u1',touristTaxConfig:{enabled:true,ratePerGuestNight:4}}});const result=await run(db,body());const row=db.documents.get('bookings/'+result.bookingId);
  assert.equal(row.nights,2);assert.equal(row.totalAmount,300);assert.equal(row.uid,'u1');assert.equal(row.importReference.reference,'AB-123');assert.equal(row.importReference.importedAt,'1970-01-01T00:01:40.000Z');assert.equal(row.touristTax.amount,16);assert.equal(row.guestRegistration.completed,false);assert.ok(row.autopilotTasks);assert.equal(row._pmsVersion,1);
});
test('same reference in another request or browser produces one booking',async()=>{
  const db=seed(),a=await run(db,body()),b=await run(db,body());assert.equal(bookings(db).length,1);assert.equal(b.bookingId,a.bookingId);assert.equal(b.importDuplicate,true);
});
test('concurrent delivery with separate request IDs deduplicates atomically',async()=>{
  const db=seed(),results=await Promise.all([run(db,body()),run(db,body())]);assert.equal(bookings(db).length,1);assert.equal(results[0].bookingId,results[1].bookingId);assert.equal(results.filter(r=>r.importDuplicate).length,1);
});
test('changed reference data is rejected and the original is preserved',async()=>{
  const db=seed(),r=await run(db,body());await assert.rejects(run(db,body({data:{...data,totalAmount:400}})),e=>e.code==='import_changed');assert.equal(db.documents.get('bookings/'+r.bookingId).totalAmount,300);
});
test('reimport never overwrites later manual changes and does not recreate a deleted import',async()=>{
  const db=seed(),r=await run(db,body());await run(db,{operation:'save',requestId:randomUUID(),bookingId:r.bookingId,expectedVersion:1,data:{...data,totalAmount:350}});
  assert.equal((await run(db,body())).importDuplicate,true);assert.equal(db.documents.get('bookings/'+r.bookingId).totalAmount,350);
  await run(db,{operation:'delete',requestId:randomUUID(),bookingId:r.bookingId,expectedVersion:2});await assert.rejects(run(db,body()),e=>e.code==='import_deleted');assert.equal(bookings(db).length,0);
});
test('different refs still use authoritative property availability and preserve consecutive stays',async()=>{
  const db=seed();await run(db,body());await assert.rejects(run(db,body({importReference:{source:'airbnb',reference:'OTHER'}})),e=>e.code==='conflict');
  await run(db,body({data:{...data,checkin:'2026-10-03',checkout:'2026-10-04'},importReference:{source:'airbnb',reference:'NEXT'}}));assert.equal(bookings(db).length,2);
});
test('same reference is isolated by account, property and channel',async()=>{
  const db=seed({'users/u2':{plan:'pro'},'properties/p3':{uid:'u2'}});await run(db,body());await run(db,body({data:{...data,propertyId:'p2'}}));await run(db,body({data:{...data,propertyId:'p3'}}),{uid:'u2'});assert.equal(bookings(db).length,3);
  await assert.rejects(run(db,body({data:{...data,source:'booking'},importReference:{source:'booking',reference:'AB-123'}})),e=>e.code==='conflict');
});
test('Free and expired trial imports cannot bypass server entitlement',async()=>{
  for(const user of [{plan:'free'},{plan:'free',trialStartedAt:'2020-01-01',trialEndsAt:'2020-02-01'}])await assert.rejects(run(seed({'users/u1':user}),body()),e=>e.code==='plan_required');
});
test('import cannot mutate another property, spoof source, or attach metadata to an edit',async()=>{
  await assert.rejects(run(seed({'properties/p1':{uid:'u2'}}),body()),e=>e.code==='forbidden');
  for(const patch of [{importReference:{source:'booking',reference:'A'}},{importReference:{source:'airbnb',reference:'\n'}},{importReference:{source:'airbnb',reference:'x'.repeat(129)}},{bookingId:'existing',expectedVersion:1}])await assert.rejects(run(seed(),body(patch)),e=>e.code==='invalid_import_reference');
});
test('uncertain original response retried with same request preserves one result',async()=>{
  const db=seed(),request=body();const a=await run(db,request),b=await run(db,request);assert.equal(a.bookingId,b.bookingId);assert.equal(b.duplicate,true);assert.equal(bookings(db).length,1);
});
test('imported bookings feed the existing period report without a second revenue model',async()=>{
  const db=seed();await run(db,body());const rows=bookings(db).map(([path,row])=>({...row,id:path.split('/')[1]}));
  const report=buildPMSOperationalReport({snapshot:{ownerUid:'u1',portalSnapshotReady:true,propertyList:[{id:'p1',name:'Example'}],portalBookingList:rows},ownerUid:'u1',month:'2026-10'});
  assert.equal(report.totals.revenue,300);assert.equal(report.totals.nights,2);assert.equal(report.totals.adr,150);assert.equal(report.totals.revpar,300/31);assert.equal(report.warnings.missingAmounts,0);
});
