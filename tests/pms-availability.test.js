import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {evaluateAvailability,canAdvanceBooking,createBookingOperationGuard,isKnownBookingStatus} from '../js/pms-availability.js';
const source=readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');
const candidate={propertyId:'p1',checkin:'2026-10-24',checkout:'2026-10-26',status:'arrival'};
const occupied={...candidate,id:'b1'};
for(const [label,checkin,checkout,expected] of [
  ['same stay','2026-10-24','2026-10-26',false],
  ['partial before','2026-10-23','2026-10-25',false],
  ['partial after','2026-10-25','2026-10-27',false],
  ['contains existing','2026-10-23','2026-10-27',false],
  ['consecutive before','2026-10-22','2026-10-24',true],
  ['consecutive after','2026-10-26','2026-10-28',true]
]) test(`availability: ${label}`,()=>assert.equal(evaluateAvailability({...candidate,checkin,checkout},[occupied]).available,expected));
test('all-property view excludes stays belonging to other properties',()=>{
  assert.equal(evaluateAvailability(candidate,[{...occupied,propertyId:'p2'}]).available,true);
});
test('editing excludes itself but still checks other destination bookings',()=>{
  assert.equal(evaluateAvailability(candidate,[occupied],'b1').available,true);
  assert.equal(evaluateAvailability(candidate,[occupied,{...occupied,id:'b2'}],'b1').available,false);
});
test('pending and cancelled stays release availability while all confirmed states retain history',()=>{
  for(const status of ['pending','cancelled']) assert.equal(evaluateAvailability(candidate,[{...occupied,status}]).available,true);
  for(const status of ['arrival','checkin','checkout','completed']) assert.equal(evaluateAvailability(candidate,[{...occupied,status}]).available,false);
});
test('pending requests may overlap, but their confirmation must pass availability',()=>{
  assert.equal(evaluateAvailability({...candidate,status:'pending'},[occupied]).available,true);
  assert.equal(evaluateAvailability(candidate,[occupied]).reason,'conflict');
});
test('invalid existing occupied dates block unverified availability',()=>{
  assert.equal(evaluateAvailability(candidate,[{...occupied,checkout:'bad'}]).reason,'invalid_existing_dates');
  assert.equal(evaluateAvailability(candidate,[{...occupied,checkout:'bad',status:'cancelled'}]).available,true);
});
test('invalid candidate dates and statuses cannot be saved as valid bookings',()=>{
  assert.equal(evaluateAvailability({...candidate,checkout:candidate.checkin},[]).reason,'invalid_dates');
  assert.equal(evaluateAvailability({...candidate,status:'invented'},[]).reason,'invalid_status');
  assert.equal(isKnownBookingStatus('arrival'),true);
});
test('status action accepts only the next operational step and rejects stale or cancelled steps',()=>{
  for(const [current,next] of [['pending','arrival'],['arrival','checkin'],['checkin','checkout'],['checkout','completed']]) assert.equal(canAdvanceBooking(current,next),true);
  for(const [current,next] of [['cancelled','arrival'],['completed','checkout'],['pending','completed'],['checkin','checkin']]) assert.equal(canAdvanceBooking(current,next),false);
});
test('operation guard blocks double click and unlocks after successful completion',async()=>{
  const guard=createBookingOperationGuard();let release,calls=0;
  const first=guard('new',async()=>{calls++;await new Promise(resolve=>release=resolve);return 'saved';});
  assert.equal(await guard('new',async()=>calls++),false);assert.equal(calls,1);
  release();assert.equal(await first,'saved');await guard('new',async()=>calls++);assert.equal(calls,2);
});
test('operation guard unlocks after rejected writes and separates unrelated bookings',async()=>{
  const guard=createBookingOperationGuard();await assert.rejects(guard('b1',async()=>{throw Error('offline');}));
  assert.equal(await guard('b1',async()=>true),true);
  let release;const first=guard('b1',async()=>new Promise(resolve=>release=resolve));
  assert.equal(await guard('b2',async()=>true),true);release();await first;
});
function runtime(rows=[],current={...occupied,uid:'u1',status:'pending'}){
  const notices=[],writes=[],reads=[],refreshes=[];
  const ctx={evaluateAvailability,canAdvanceBooking,isKnownBookingStatus,createBookingOperationGuard,
    db:{},window:{currentUser:{uid:'u1'},currentPropertyId:'p1',currentBookingsData:[],currentSelectedBooking:null},
    t:(it,en)=>ctx.lang==='en'?en:it,alert:m=>notices.push(m),confirm:()=>true,dashboardError:()=>{},
    doc:(db,type,id)=>({type,id}),collection:(db,type)=>({type}),where:(key,op,value)=>({key,value}),query:(ref,...filters)=>({ref,filters}),
    getDocFromServer:async ref=>{reads.push(ref);return {id:ref.id,exists:()=>true,data:()=>ref.type==='properties'?{uid:'u1'}:current};},
    getDocsFromServer:async q=>{reads.push(q);return {docs:rows.map(row=>({id:row.id,data:()=>row}))};},
    updateDoc:async (ref,data)=>writes.push({ref,data}),serverTimestamp:()=> 'server-time',
    loadPMSStats:async()=>refreshes.push('stats'),loadProperties:async()=>refreshes.push('properties'),loadBookings:async scope=>refreshes.push(scope),
    document:{getElementById:()=>null}};
  vm.createContext(ctx);
  vm.runInContext(source.slice(source.indexOf('const runBookingOperation ='),source.indexOf('// ================= INVESTMENT SCORE')),ctx);
  vm.runInContext(source.slice(source.indexOf('window.cancelBooking ='),source.indexOf('// =====================================\n// 🗑 DELETE BOOKING')),ctx);
  return {ctx,notices,writes,reads,refreshes};
}
test('save availability adapter reads server even when local data is empty',async()=>{
  const {ctx,reads}=runtime([occupied]);
  await assert.rejects(ctx.verifyBookingAvailability(candidate),error=>error.code==='booking/conflict');
  assert.equal(reads[0].type,'properties');assert.equal(reads[1].filters.find(x=>x.key==='propertyId').value,'p1');
});
test('transfer checks server availability in destination and verifies existing booking',async()=>{
  const {ctx,reads}=runtime([{...occupied,id:'b2',propertyId:'p2'}]);
  await assert.rejects(ctx.verifyBookingAvailability({...candidate,propertyId:'p2'},'b1'),error=>error.code==='booking/conflict');
  assert.equal(reads[0].id,'p2');assert.equal(reads[1].type,'bookings');assert.equal(reads[2].filters.find(x=>x.key==='propertyId').value,'p2');
});
test('unavailable server or unowned property cannot silently approve a booking',async()=>{
  const {ctx}=runtime();ctx.getDocsFromServer=async()=>{throw Error('offline');};
  await assert.rejects(ctx.verifyBookingAvailability(candidate));
  ctx.getDocFromServer=async()=>({exists:()=>true,data:()=>({uid:'someone-else'})});
  await assert.rejects(ctx.verifyBookingAvailability(candidate),error=>error.code==='booking/not_found');
});
test('pending confirmation sees new server conflict and performs no write',async()=>{
  const {ctx,writes,notices}=runtime([{...occupied,id:'b2'}]);
  await ctx.window.advanceBookingStatus('b1','arrival');assert.equal(writes.length,0);assert.match(notices[0],/Date non disponibili/);
});
test('advance uses fresh status and rejects a stale action',async()=>{
  const {ctx,writes,notices}=runtime([],{...occupied,uid:'u1',status:'cancelled'});
  await ctx.window.advanceBookingStatus('b1','checkin');assert.equal(writes.length,0);assert.match(notices[0],/stato è cambiato/);
});
test('confirmation writes once and preserves all-property view during refresh',async()=>{
  const {ctx,writes,refreshes}=runtime([]);ctx.window.bookingsAllPropertiesView=true;ctx.window.bookingsPropertyFilter='all';
  await ctx.window.advanceBookingStatus('b1','arrival');assert.equal(writes.length,1);assert.equal(writes[0].data.status,'arrival');assert.deepEqual(refreshes,['stats','properties','all']);
});
test('failed status write has no success refresh and produces English retry feedback',async()=>{
  const {ctx,writes,notices,refreshes}=runtime([]);ctx.lang='en';ctx.updateDoc=async()=>{throw Error('offline');};
  await ctx.window.advanceBookingStatus('b1','arrival');assert.equal(writes.length,0);assert.equal(refreshes.length,0);assert.match(notices[0],/Unable to verify or save/);
});
test('cancellation failure preserves history and can be retried',async()=>{
  const {ctx,writes}=runtime();ctx.getDocFromServer=async()=>{throw Error('offline');};
  await ctx.window.cancelBooking('b1');assert.equal(writes.length,0);
  ctx.getDocFromServer=async ref=>({id:ref.id,exists:()=>true,data:()=>({...occupied,uid:'u1'})});
  await ctx.window.cancelBooking('b1');assert.equal(writes[0].data.status,'cancelled');
});
test('a successful status write followed by refresh failure reports saved without repeating the write',async()=>{
  const {ctx,writes,notices}=runtime();ctx.loadPMSStats=async()=>{throw Error('refresh');};
  await ctx.window.advanceBookingStatus('b1','arrival');assert.equal(writes.length,1);assert.match(notices[0],/Modifica salvata/);
});
function saveRuntime(rows=[]){
  const result=runtime(rows),{ctx,writes}=result;
  const fields=new Map(Object.entries({
    'booking-property':'p1','booking-guest':'Test Availability','booking-checkin':'2026-10-24','booking-checkout':'2026-10-26','booking-guests':'2','booking-total':'300','booking-status':'arrival'
  }).map(([id,value])=>[id,{value}]));
  fields.set('booking-save-button',{disabled:false,textContent:''});fields.set('booking-pricing-box',{style:{display:'none'},dataset:{}});
  ctx.document.getElementById=id=>fields.get(id);
  ctx.window.updateBookingTouristTax=()=>{};ctx.window.getBookingStayMetrics=()=>({nights:2});
  ctx.window.loadCurrentPropertyTouristTax=async()=>{};ctx.window.dispatchEvent=()=>{};
  ctx.CustomEvent=class{};ctx.closeBookingModal=()=>{};
  ctx.stayNights=(a,b)=>a==='2026-10-24' && b==='2026-10-26'?2:0;
  ctx.addDoc=async(ref,data)=>{writes.push({ref,data});return {id:'new-id'};};
  vm.runInContext(source.slice(source.indexOf('async function performSaveBooking(){'),source.indexOf('// 📅 LOAD BOOKINGS')),ctx);
  return {...result,fields};
}
test('complete save blocks a server conflict without creating any document',async()=>{
  const {ctx,writes,fields,notices}=saveRuntime([occupied]);
  await ctx.window.saveBooking();assert.equal(writes.length,0);assert.equal(fields.get('booking-save-button').disabled,false);assert.match(notices[0],/Date non disponibili/);
});
test('complete save allows consecutive destination dates and writes captured values',async()=>{
  const {ctx,writes,notices}=saveRuntime([{...occupied,checkin:'2026-10-22',checkout:'2026-10-24'}]);
  await ctx.window.saveBooking();assert.equal(writes.length,1);assert.equal(writes[0].data.totalAmount,300);assert.equal(writes[0].data.propertyId,'p1');assert.match(notices[0],/Prenotazione salvata/);
});
test('complete save cannot duplicate a booking with two concurrent clicks',async()=>{
  const {ctx,writes}=saveRuntime();let release;
  ctx.getDocsFromServer=async()=>{await new Promise(resolve=>release=resolve);return {docs:[]};};
  const first=ctx.window.saveBooking();assert.equal(await ctx.window.saveBooking(),false);
  await new Promise(resolve=>setImmediate(resolve));release();await first;assert.equal(writes.length,1);
});
test('complete save recovers from offline verification and permits a retry',async()=>{
  const {ctx,writes,fields}=saveRuntime();ctx.getDocsFromServer=async()=>{throw Error('offline');};
  await ctx.window.saveBooking();assert.equal(writes.length,0);assert.equal(fields.get('booking-save-button').disabled,false);
  ctx.getDocsFromServer=async()=>({docs:[]});await ctx.window.saveBooking();assert.equal(writes.length,1);
});
