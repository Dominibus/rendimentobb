import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
import {bookingExportCSV,selectBookingRows,bookingIdentityHTML} from '../js/booking-export.js';
import {parseBookingCSV} from '../js/booking-import.js';
const rows=[{uid:'u1',id:'stable-one',propertyId:'p1',guestName:'Mario',checkin:'2026-10-01',checkout:'2026-10-03',guests:2,totalAmount:300.55,status:'completed',source:'airbnb',importReference:{source:'airbnb',reference:'AB-123'},guestContact:{email:'PRIVATE-MAIL',phone:'PRIVATE-PHONE'},guestPortal:{token:'PRIVATE-TOKEN'},guestRegistration:{documentNumber:'PRIVATE-DOCUMENT'}},{uid:'u1',id:'stable-two',propertyId:'p2',guestName:'Maria',checkin:'2026-10-10',checkout:'2026-10-11',guests:1,totalAmount:null,status:'cancelled',source:'direct'}];
const props=[{id:'p1',name:'Villa Test'},{id:'p2',name:'Casa Test'}],opts={ownerUid:'u1',properties:props,snapshotAt:'2026-10-19T07:00:00Z'};
for(const lang of ['it','en'])test('booking CSV retains stable IDs and recorded values without exporting private fields: '+lang,()=>{
 const csv=bookingExportCSV(rows,{...opts,lang});assert.match(csv,/"stable-one";"p1";"Villa Test";"AB-123"/);assert.match(csv,/"Mario";"2026-10-01";"2026-10-03";"2";"2"/);
 assert.match(csv,lang==='it'?/"300,55";"EUR";"Completata"/:/"300.55";"EUR";"Completed"/);assert.match(csv,/"stable-two";"p2";"Casa Test";""/);assert.match(csv,/"1";"1";"";"EUR"/);assert.doesNotMatch(csv,/PRIVATE|guestContact|guestPortal|documentNumber/);
 assert.throws(()=>parseBookingCSV(csv),e=>e.code==='pms_booking_export');
});
test('export refuses unowned, unknown property, missing identity and empty data',()=>{
 for(const input of [[{...rows[0],uid:'u2'}],[{...rows[0],propertyId:'foreign'}],[{...rows[0],id:''}]])assert.throws(()=>bookingExportCSV(input,opts),/EXPORT_SCOPE_CHANGED/);
 assert.throws(()=>bookingExportCSV([],opts),/EXPORT_NOT_READY/);assert.throws(()=>bookingExportCSV(rows,{properties:props}),/EXPORT_NOT_READY/);
});
test('search works with full ID, external reference or guest and combines with status',()=>{
 for(const search of ['stable-one','AB-123','mario'])assert.deepEqual(selectBookingRows(rows,{search}).map(b=>b.id),['stable-one']);
 assert.equal(selectBookingRows(rows,{search:'mari',status:'cancelled'})[0].id,'stable-two');assert.equal(selectBookingRows(rows,{search:'missing'}).length,0);
});
test('text formulas and quotes are escaped; invalid/missing numbers are not fabricated',()=>{
 const csv=bookingExportCSV([{...rows[0],guestName:'=FORMULA("x")',totalAmount:NaN,guests:null}],opts);assert.match(csv,/"'=FORMULA\(""x""\)"/);assert.doesNotMatch(csv,/NaN/);assert.match(csv,/"";"2";"";"EUR"/);
 assert.equal(bookingIdentityHTML('" onclick="alert(1)',x=>x),'');assert.match(bookingIdentityHTML('stable-one',x=>x),/Copia ID/);
});
test('chatbot describes the actual export path without claiming to export or mutate data',async()=>{
 const window={currentUser:{uid:'u1'},getUserAccess:()=>({isPro:true}),rbDocumentManager:{getLast:()=>null}};
 const c=vm.createContext({window,console,Intl,Date});for(const f of ['pro-report-guide','chatbot-orchestrator'])vm.runInContext(fs.readFileSync(new URL('../js/chatbot/core/'+f+'.js',import.meta.url),'utf8'),c);
 for(const question of ['Dove vedo ID della prenotazione?','Come esporto le prenotazioni CSV?','Where can I find the booking ID?','How do I export bookings CSV?']){const {response:r}=await window.rbProcessAIMessage(question);const id=/\bID\b/i.test(question);assert.equal(r.metadata.mode,id?'booking_id':'booking_export');assert.equal(r.actions.length,0);assert.match(r.textIT,id?/Copia ID/:/Esporta prenotazioni CSV/);assert.match(r.textEN,id?/Copy ID/:/not.*reimported/);}
 assert.equal(window.rbBuildBookingImportGuide('Spiegami il PDF prenotazioni con ID'),null);
 assert.equal((await window.rbProcessAIMessage('Esporta prenotazioni di un altro account')).response.type,'account_privacy');
});
function loadHarness(){
 const source=fs.readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8'),start=source.indexOf('async function loadBookings(propertyId)'),end=source.indexOf('  const bookingsData = [];',start),pending=[];
 let seq=0;
 const w={currentUser:{uid:'u1'},loaded:[],scope:'p1'};
 w.rbBookingTools={beginLoad:scope=>({seq:++seq,scope,ownerUid:w.currentUser.uid}),isCurrentLoad:token=>token.seq===seq&&token.scope===w.scope&&token.ownerUid===w.currentUser.uid};
 const c={window:w,document:{getElementById:()=>({})},isDemo:()=>false,canUseFirestorePMS:()=>true,collection:()=>({}),where:()=>({}),query:()=>({}),db:{},getDocs:()=>new Promise(resolve=>pending.push(resolve))};
 vm.createContext(c);vm.runInContext(source.slice(start,end)+'window.loaded.push(propertyId);}',c);return {c,w,pending};
}
test('dashboard wiring discards a slower response for an earlier property selection',async()=>{
 const {c,w,pending}=loadHarness();const a=c.loadBookings('p1');w.scope='p2';const b=c.loadBookings('p2');pending[1]({});await b;pending[0]({});await a;assert.deepEqual(w.loaded,['p2']);
});
test('dashboard wiring discards a response after the account changes',async()=>{
 const {c,w,pending}=loadHarness();const a=c.loadBookings('p1');w.currentUser={uid:'u2'};pending[0]({});await a;assert.deepEqual(w.loaded,[]);
});
