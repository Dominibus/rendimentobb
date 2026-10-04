import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {performPMSOperation,normalizeBookingInput,createHostBookingHandler} from '../lib/pms-booking-service.js';
import {MemoryFirestore} from './helpers/pms-memory-firestore.js';
const auth={uid:'u1',email:'host@example.test',email_verified:true};
const data={propertyId:'p1',guestName:'Test Host',checkin:'2026-10-24',checkout:'2026-10-26',guests:2,totalAmount:300,status:'arrival',source:'direct',guestContact:{email:'guest@example.test',phone:'+39000'},guestRegistration:{documentsReceived:0,authorityStatus:'pending'},cleaning:{required:true,status:'pending',scheduledDate:'2026-10-26'},guestIssue:{active:false},touristTax:{enabled:false,amount:0}};
const options={now:100000,timestamp:()=> 'server-time'};
const request=(overrides={})=>({action:'host_booking',operation:'save',requestId:randomUUID(),bookingId:null,expectedVersion:0,data:structuredClone(data),...overrides});
const seed=(extra={})=>new MemoryFirestore({'users/u1':{plan:'pro'},'properties/p1':{uid:'u1'},'properties/p2':{uid:'u1'},...extra});
const execute=(db,body,who=auth)=>performPMSOperation(db,who,body,options);
const bookingRows=db=>[...db.documents].filter(([key])=>key.startsWith('bookings/'));
const existing={...data,uid:'u1',_pmsVersion:1};
test('two simultaneous creates on an empty calendar commit exactly one occupied stay',async()=>{
  const db=seed();const results=await Promise.allSettled([execute(db,request()),execute(db,request())]);
  assert.equal(results.filter(x=>x.status==='fulfilled').length,1);assert.equal(bookingRows(db).length,1);
  assert.equal(results.find(x=>x.status==='rejected').reason.code,'conflict');assert.ok(db.retries>0);
});
test('simultaneous consecutive bookings both commit',async()=>{
  const db=seed();const second={...data,checkin:'2026-10-26',checkout:'2026-10-27',cleaning:{required:false}};
  await Promise.all([execute(db,request()),execute(db,request({data:second}))]);assert.equal(bookingRows(db).length,2);
});
test('independent properties do not block one another',async()=>{
  const db=seed();await Promise.all([execute(db,request()),execute(db,request({data:{...data,propertyId:'p2'}}))]);assert.equal(bookingRows(db).length,2);
});
test('existing legacy stays are checked without a migration',async()=>{
  const db=seed({'bookings/legacy':{...existing,_pmsVersion:undefined}});
  await assert.rejects(execute(db,request()),error=>error.code==='conflict');assert.equal(bookingRows(db).length,1);
});
test('pending stays overlap but simultaneous confirmations cannot both succeed',async()=>{
  const db=seed({'bookings/a':{...existing,status:'pending'},'bookings/b':{...existing,status:'pending'}});
  const next=bookingId=>request({operation:'advance',data:undefined,bookingId,expectedVersion:1,nextStatus:'arrival'});
  const results=await Promise.allSettled([execute(db,next('a')),execute(db,next('b'))]);
  assert.equal(results.filter(x=>x.status==='fulfilled').length,1);assert.equal(bookingRows(db).filter(([key,row])=>row.status==='arrival').length,1);
});
test('transfer to occupied property fails with both original and destination preserved',async()=>{
  const db=seed({'bookings/a':existing,'bookings/b':{...existing,propertyId:'p2'}});
  await assert.rejects(execute(db,request({bookingId:'a',expectedVersion:1,data:{...data,propertyId:'p2'}})),error=>error.code==='conflict');
  assert.equal(db.documents.get('bookings/a').propertyId,'p1');assert.equal(db.documents.get('bookings/b').propertyId,'p2');
});
test('simultaneous transfer and create cannot occupy the destination twice',async()=>{
  const db=seed({'bookings/a':existing});
  const results=await Promise.allSettled([
    execute(db,request({bookingId:'a',expectedVersion:1,data:{...data,propertyId:'p2'}})),
    execute(db,request({data:{...data,propertyId:'p2'}}))
  ]);
  assert.equal(results.filter(x=>x.status==='fulfilled').length,1);assert.equal(bookingRows(db).filter(([key,row])=>row.propertyId==='p2').length,1);
});
test('cancel releases availability and retains history, including retry idempotence',async()=>{
  const db=seed({'bookings/a':existing}),cancel=request({operation:'cancel',bookingId:'a',expectedVersion:1,data:undefined});
  await execute(db,cancel);const duplicate=await execute(db,cancel);assert.equal(duplicate.duplicate,true);
  assert.equal(db.documents.get('bookings/a').status,'cancelled');assert.equal(db.documents.get('bookings/a')._pmsVersion,2);
  await execute(db,request());assert.equal(bookingRows(db).length,2);
});
test('delete and replacement are serialized; successful retry creates no duplicate',async()=>{
  const db=seed({'bookings/a':existing});await execute(db,request({operation:'delete',bookingId:'a',expectedVersion:1,data:undefined}));
  assert.equal(db.documents.has('bookings/a'),false);await execute(db,request());assert.equal(bookingRows(db).length,1);
});
test('stale editor cannot overwrite a booking changed elsewhere',async()=>{
  const db=seed({'bookings/a':existing});await execute(db,request({bookingId:'a',expectedVersion:1,data:{...data,totalAmount:350}}));
  await assert.rejects(execute(db,request({bookingId:'a',expectedVersion:1})),error=>error.code==='stale_version');assert.equal(db.documents.get('bookings/a').totalAmount,350);
});
test('double delivery with the same request ID creates once and returns same booking ID',async()=>{
  const db=seed(),body=request();const results=await Promise.all([execute(db,body),execute(db,body)]);
  assert.equal(results[0].bookingId,results[1].bookingId);assert.equal(bookingRows(db).length,1);assert.equal(results.filter(x=>x.duplicate).length,1);
});
test('request ID cannot be reused with a different body',async()=>{
  const db=seed(),body=request();await execute(db,body);
  await assert.rejects(execute(db,{...body,data:{...data,totalAmount:500}}),error=>error.code==='idempotency_mismatch');
});
test('property deletion blocks any booking history, including cancelled records',async()=>{
  const db=seed({'bookings/a':{...existing,status:'cancelled'}});
  await assert.rejects(execute(db,request({operation:'delete_property',propertyId:'p1',data:undefined})),error=>error.code==='property_has_bookings');assert.ok(db.documents.has('properties/p1'));
});
test('simultaneous property deletion and creation cannot leave an orphan',async()=>{
  const db=seed();const results=await Promise.allSettled([execute(db,request()),execute(db,request({operation:'delete_property',propertyId:'p1',data:undefined}))]);
  assert.equal(results.filter(x=>x.status==='fulfilled').length,1);
  for(const [key,row] of bookingRows(db)) assert.ok(db.documents.has(`properties/${row.propertyId}`));
});
test('empty property removal unlinks its owned analysis in the same transaction',async()=>{
  const db=seed({'properties/p1':{uid:'u1',analysisId:'a1'},'analyses/a1':{uid:'u1',isPortfolio:true,propertyId:'p1'}});
  await execute(db,request({operation:'delete_property',propertyId:'p1',data:undefined}));assert.equal(db.documents.has('properties/p1'),false);assert.equal(db.documents.get('analyses/a1').isPortfolio,false);
});
test('ownership checked for property, booking and linked analysis',async()=>{
  for(const extra of [{'properties/p1':{uid:'u2'}},{'bookings/a':{...existing,uid:'u2'}}]){
    const db=seed(extra);await assert.rejects(execute(db,request(extra['bookings/a']?{bookingId:'a',expectedVersion:1}:{})),error=>error.code==='forbidden');
  }
});
for(const plan of ['investor','pro','pro_yearly'])test(`server allows ${plan}`,async()=>{const db=seed({'users/u1':{plan}});await execute(db,request());assert.equal(bookingRows(db).length,1);});
test('Free and unknown plans are refused even with client fields claiming Pro',async()=>{
  for(const plan of ['free','unknown'])await assert.rejects(execute(seed({'users/u1':{plan}}),request({plan:'pro',isAdmin:true})),error=>error.code==='plan_required');
});
test('sandbox billing cannot grant production entitlement',async()=>{
  const db=seed({'users/u1':{plan:'pro',stripeLiveMode:false,sandboxPlan:'pro'}});
  await assert.rejects(execute(db,request()),error=>error.code==='plan_required');
  await performPMSOperation(db,auth,request(),{...options,sandbox:true});assert.equal(bookingRows(db).length,1);
});
test('only verified administrator identity can bypass plan gating',async()=>{
  const db=seed({'users/u1':{plan:'free'}});
  await assert.rejects(execute(db,request(),{...auth,email:'rendimentobb@gmail.com',email_verified:false}),error=>error.code==='plan_required');
  await execute(db,request(),{...auth,email:'rendimentobb@gmail.com',email_verified:true});
});
test('server derives nights and ignores forged privileged fields',()=>{
  const row=normalizeBookingInput({...data,nights:99,uid:'u2',_pmsVersion:999,guestPortal:{enabled:true},createdAt:'fake'});
  assert.equal(row.nights,2);for(const key of ['uid','_pmsVersion','guestPortal','createdAt'])assert.equal(key in row,false);
});
test('server validates dates, amounts, registration and cleaning',()=>{
  for(const patch of [{checkout:'2026-10-24'},{checkout:'2026-02-30'},{totalAmount:NaN},{guests:1.5},{guests:0},{status:'invalid'},{guestRegistration:{documentsReceived:1,authorityStatus:'submitted'}},{cleaning:{scheduledDate:'2026-10-23'}}])assert.throws(()=>normalizeBookingInput({...data,...patch}));
});
test('tax recomputed from transaction property config and calendar nights',async()=>{
  const db=seed({'properties/p1':{uid:'u1',touristTaxConfig:{enabled:true,ratePerGuestNight:5,maxTaxableNights:1,currency:'EUR'}}});
  await execute(db,request({data:{...data,touristTax:{enabled:true,taxableGuests:2,taxableNights:1,ratePerGuestNight:1,amount:1,paymentMethod:'bank'}}}));
  assert.equal(bookingRows(db)[0][1].touristTax.amount,10);assert.equal(bookingRows(db)[0][1].touristTax.paymentMethod,'bank');
});
test('rate limit applies to new mutations but idempotent delivery bypasses counting',async()=>{
  const db=seed({'_pms_rate/u1':{start:100000,count:60}});await assert.rejects(execute(db,request()),error=>error.code==='too_many_requests');
  const fresh=seed(),body=request();await execute(fresh,body);fresh.documents.set('_pms_rate/u1',{start:100000,count:60});assert.equal((await execute(fresh,body)).duplicate,true);
});
test('invalid existing date range blocks confirmation, not cancellation or cleanup',async()=>{
  const db=seed({'bookings/a':{...existing,checkout:'bad'}});await assert.rejects(execute(db,request()),error=>error.code==='invalid_existing_dates');
  await execute(db,request({operation:'cancel',bookingId:'a',expectedVersion:1,data:undefined}));assert.equal(db.documents.get('bookings/a').status,'cancelled');
});
test('server rejects stale operational transition',async()=>{
  const db=seed({'bookings/a':{...existing,status:'completed'}});await assert.rejects(execute(db,request({operation:'advance',bookingId:'a',expectedVersion:1,nextStatus:'checkin',data:undefined})),error=>error.code==='stale_status');
});
function response(){return {statusCode:200,status(value){this.statusCode=value;return this;},json(value){this.body=value;return this;}};}
test('host route rejects missing and invalid bearer before executing a mutation',async()=>{
  const db=seed();const handler=createHostBookingHandler({getFirestore:()=>db,verifyToken:async()=>{throw Error('invalid');},timestamp:options.timestamp});
  for(const headers of [{},{authorization:'Bearer bad'}]){const res=response();await handler({method:'POST',headers,body:request()},res);assert.equal(res.statusCode,401);}assert.equal(bookingRows(db).length,0);
});
test('host route validates body size and returns conflict status without PII',async()=>{
  const db=seed({'bookings/a':existing});const handler=createHostBookingHandler({getFirestore:()=>db,verifyToken:async()=>auth,timestamp:options.timestamp});
  const res=response();await handler({method:'POST',headers:{authorization:'Bearer good'},body:request()},res);assert.equal(res.statusCode,409);assert.equal(res.body.error,'conflict');assert.equal(JSON.stringify(res.body).includes('Test Host'),false);
  const large=response();await handler({method:'POST',headers:{authorization:'Bearer good'},body:{...request(),junk:'x'.repeat(40000)}},large);assert.equal(large.statusCode,400);
});
test('rules close direct occupancy writes and preserve owner guest link management',()=>{
  const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');
  const booking=rules.slice(rules.indexOf('match /bookings/'),rules.indexOf('match /leads/'));
  assert.match(booking,/allow create, delete: if false/);assert.match(booking,/hasOnly\(\["guestPortal"\]\)/);
  const properties=rules.slice(rules.indexOf('match /properties/'),rules.indexOf('match /bookings/'));assert.match(properties,/allow delete: if false/);
});
test('new booking persists generated obligations atomically',async()=>{
 const db=seed(),result=await execute(db,request());const row=db.documents.get(`bookings/${result.bookingId}`);assert.equal(row.autopilotTasks.documents.status,'open');assert.equal(row.autopilotTasks.cleaning.status,'open');
});
const taskRequest=(row,overrides={})=>request({operation:'task',bookingId:'a',expectedVersion:row._pmsVersion,data:undefined,taskCode:'documents',taskStatus:'in_progress',taskFingerprint:row.autopilotTasks.documents.fingerprint,...overrides});
test('taking charge survives later save and source resolution closes the task',async()=>{
 const db=seed({'bookings/a':existing});await execute(db,request({bookingId:'a',expectedVersion:1}));let row=db.documents.get('bookings/a');
 await execute(db,taskRequest(row));row=db.documents.get('bookings/a');assert.equal(row.autopilotTasks.documents.status,'in_progress');
 await execute(db,request({bookingId:'a',expectedVersion:row._pmsVersion,data:{...data,totalAmount:350}}));row=db.documents.get('bookings/a');assert.equal(row.autopilotTasks.documents.status,'in_progress');
 await execute(db,request({bookingId:'a',expectedVersion:row._pmsVersion,data:{...data,guestRegistration:{documentsReceived:2,authorityStatus:'submitted'}}}));row=db.documents.get('bookings/a');assert.equal(row.autopilotTasks.documents.status,'resolved');assert.equal(row.autopilotTasks.authority.status,'resolved');
});
test('task operation cannot manually resolve an obligation or accept forged code',async()=>{
 const db=seed({'bookings/a':existing});await execute(db,request({bookingId:'a',expectedVersion:1}));const row=db.documents.get('bookings/a');
 for(const overrides of [{taskStatus:'resolved'},{taskCode:'__proto__'},{taskCode:'unknown'}]) await assert.rejects(execute(db,taskRequest(row,overrides)),e=>e.code==='invalid_request');
});
test('stale task facts and resolved obligations cannot be claimed',async()=>{
 const db=seed({'bookings/a':existing});await execute(db,request({bookingId:'a',expectedVersion:1}));const row=db.documents.get('bookings/a');
 await assert.rejects(execute(db,taskRequest(row,{taskFingerprint:'old'})),e=>e.code==='stale_task');
 await execute(db,request({bookingId:'a',expectedVersion:row._pmsVersion,data:{...data,guestRegistration:{documentsReceived:2,authorityStatus:'submitted'}}}));const next=db.documents.get('bookings/a');
 await assert.rejects(execute(db,taskRequest(row,{expectedVersion:next._pmsVersion})),e=>e.code==='task_resolved');
});
test('simultaneous task change and booking edit cannot overwrite each other',async()=>{
 const db=seed({'bookings/a':existing});await execute(db,request({bookingId:'a',expectedVersion:1}));const row=db.documents.get('bookings/a');
 const results=await Promise.allSettled([execute(db,taskRequest(row)),execute(db,request({bookingId:'a',expectedVersion:row._pmsVersion,data:{...data,totalAmount:400}}))]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='rejected').reason.code,'stale_version');
});
test('duplicate task delivery executes once and reopen retains underlying obligation',async()=>{
 const db=seed({'bookings/a':existing});await execute(db,request({bookingId:'a',expectedVersion:1}));let row=db.documents.get('bookings/a');const body=taskRequest(row);await execute(db,body);assert.equal((await execute(db,body)).duplicate,true);
 row=db.documents.get('bookings/a');await execute(db,taskRequest(row,{taskStatus:'open'}));row=db.documents.get('bookings/a');assert.equal(row.autopilotTasks.documents.status,'open');assert.equal(row.guestRegistration.documentsReceived,0);
});
test('cancel atomically resolves recorded obligations without deleting history',async()=>{
 const db=seed({'bookings/a':existing});await execute(db,request({bookingId:'a',expectedVersion:1}));const row=db.documents.get('bookings/a');await execute(db,request({operation:'cancel',bookingId:'a',expectedVersion:row._pmsVersion,data:undefined}));assert.ok(Object.values(db.documents.get('bookings/a').autopilotTasks).every(t=>t.status==='resolved'));
});
test('unrelated host edit preserves guest issue provenance and claimed state',async()=>{
 const issue={active:true,status:'open',category:'maintenance',priority:'urgent',note:'Guest reported issue',reportedAt:'2026-10-04T10:00:00Z',source:'guest_portal'};
 const db=seed({'bookings/a':{...existing,guestIssue:issue}});const input={...data,guestIssue:issue};await execute(db,request({bookingId:'a',expectedVersion:1,data:input}));let row=db.documents.get('bookings/a');
 await execute(db,taskRequest(row,{taskCode:'issue',taskFingerprint:row.autopilotTasks.issue.fingerprint}));row=db.documents.get('bookings/a');await execute(db,request({bookingId:'a',expectedVersion:row._pmsVersion,data:{...input,totalAmount:400}}));row=db.documents.get('bookings/a');assert.equal(row.guestIssue.source,'guest_portal');assert.equal(row.guestIssue.reportedAt,issue.reportedAt);assert.equal(row.autopilotTasks.issue.status,'in_progress');
});
