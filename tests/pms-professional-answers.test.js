import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {inspectProfessionalBookings} from '../js/pms-professional-queries.js';
import {checklistDay} from '../js/pms-daily-checklist.js';
import {evaluateAvailability} from '../js/pms-availability.js';

const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const day='2026-10-31';
const booking=(id,propertyId='a',extra={})=>({id,uid:'owner',propertyId,status:'arrival',checkin:day,checkout:'2026-11-02',...extra});
const snapshot=()=>({ownerUid:'owner',portalSnapshotReady:true,isDemo:false,
 propertyList:[{id:'a',name:'Casa Alfa'},{id:'b',name:'Casa Beta'}],
 portalBookingList:[booking('one'),booking('two','b',{checkin:'2026-10-30',checkout:day})]});
function setup({paid=true,data=snapshot(),path='/dashboard/'}={}){
 const window={currentUser:{uid:'owner'},getUserAccess:()=>paid?{isInvestor:true}:{},location:{pathname:path},currentLang:'it',dispatchEvent(){},rbPMSData:data,
  rbPMSProfessionalTools:{inspect:inspectProfessionalBookings,today:()=>day}};
 const storage=()=>({getItem:()=>null,setItem(){},removeItem(){}});
 const c=vm.createContext({window,console,Date,Intl,document:{getElementById:()=>null,addEventListener(){},dispatchEvent(){}},localStorage:storage(),sessionStorage:storage(),CustomEvent:class{}});
 const loader=read('js/chatbot-loader.js'),block=loader.slice(loader.indexOf('const scripts = ['),loader.indexOf('];',loader.indexOf('const scripts = [')));
 for(const m of block.matchAll(/"(\/js\/[^"?]+)(?:\?[^\"]*)?"/g)){
  const f=m[1].slice(1);if(/vendor|ui\/|attachments|file-dispatcher|source-registry-data/.test(f))continue;
  vm.runInContext(read(f),c,{filename:f});
 }
 return {w:window,ask:async q=>(await window.rbProcessAIMessage(q)).response};
}
const arrivalQueries=['Quali strutture hanno arrivi oggi?','Which properties have arrivals today?'];
const overlapQueries=['Ci sono prenotazioni sovrapposte?','Are there overlapping bookings?'];
for(const q of arrivalQueries)test('arrivals list exact property, booking and date: '+q,async()=>{
 const {w,ask}=setup();const r=await ask(q);
 assert.equal(r.type,'pms_professional');assert.equal(r.metadata.answerMode,'arrivals_today');assert.equal(r.metadata.matchedBookings,1);
 assert.match(r.textIT,/Casa Alfa/);assert.match(r.textEN,/2026-10-31/);assert.doesNotMatch(r.textIT,/Casa Beta ·/);
 assert.equal(r.actions[0].bookingId,'one');assert.equal(w.rbValidateEvidenceBookingAction(r.actions[0]),true);
 assert.match(r.textEN,/No bookings have been opened or changed/);assert.match(r.textEN,/no OTA synchronization/);
});
for(const q of overlapQueries)test('overlaps use canonical availability, not a count of all bookings: '+q,async()=>{
 const data=snapshot();data.portalBookingList.push(booking('overlap','a',{checkin:'2026-11-01',checkout:'2026-11-03'}));
 const {ask}=setup({data});const r=await ask(q);
 assert.equal(r.type,'pms_professional');assert.equal(r.metadata.matchedBookings,2);
 assert.deepEqual(Array.from(r.actions,a=>a.bookingId),['one','overlap']);assert.match(r.textEN,/not a count of pairs/);
});
test('back-to-back, pending, cancelled and different-property bookings are not conflicts',()=>{
 const rows=[booking('a'),booking('b','a',{checkin:'2026-11-02',checkout:'2026-11-04'}),booking('c','a',{status:'cancelled'}),booking('d','a',{status:'pending'}),booking('e','b')];
 const r=inspectProfessionalBookings(rows,day);assert.equal(r.conflicts.length,0);assert.equal(r.arrivals.length,2);
});
test('nested and chained stays identify all affected bookings without counting pairs',()=>{
 const rows=[booking('long','a',{checkin:'2026-10-01',checkout:'2026-10-10'}),
  booking('inner','a',{checkin:'2026-10-02',checkout:'2026-10-03'}),
  booking('chain','a',{checkin:'2026-10-09',checkout:'2026-10-15'}),
  booking('tail','a',{checkin:'2026-10-14',checkout:'2026-10-16'}),
  booking('adjacent','a',{checkin:'2026-10-16',checkout:'2026-10-17'})];
 assert.deepEqual(inspectProfessionalBookings(rows,day).conflicts.map(b=>b.id),['long','inner','chain','tail']);
});
test('optimized scan agrees with canonical all-pairs decisions across deterministic interval sets',()=>{
 let seed=45;
 const next=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
 const date=n=>'2026-10-'+String(n).padStart(2,'0');
 for(let trial=0;trial<150;trial++){
  const rows=Array.from({length:20},(_,i)=>{
   const start=1+next(20);return booking(String(i),String(next(3)),{checkin:date(start),checkout:date(start+1+next(7))});
  });
  const expected=rows.filter(row=>evaluateAvailability(row,rows.filter(other=>other!==row)).reason==='conflict').map(b=>b.id);
  assert.deepEqual(inspectProfessionalBookings(rows,day).conflicts.map(b=>b.id),expected);
 }
});
test('dashboard bridge exposes the canonical inspector and Rome calendar without record writes',()=>{
 const src=read('js/dashboard.js');
 const bridge=src.match(/window\.rbPMSProfessionalTools=\{inspect:inspectProfessionalBookings,today:checklistDay\};/)?.[0];
 assert.ok(bridge);
 const window={};vm.runInNewContext(bridge,{window,inspectProfessionalBookings,checklistDay});
 assert.equal(window.rbPMSProfessionalTools.inspect,inspectProfessionalBookings);
 assert.equal(window.rbPMSProfessionalTools.today,checklistDay);
});
test('invalid dates and statuses explicitly mark a partial check, including impossible civil days',async()=>{
 const data=snapshot();data.portalBookingList.push(booking('bad','a',{checkin:'2026-02-30'}),booking('unknown','a',{status:'invalid'}));
 const r=await setup({data}).ask(overlapQueries[0]);assert.equal(r.metadata.complete,false);assert.equal(r.metadata.invalidBookings,2);assert.match(r.textEN,/this check is incomplete/);
});
test('canonical Rome day remains correct around midnight and DST',()=>{
 assert.equal(checklistDay(Date.parse('2026-10-30T23:30:00Z')),day);
 assert.equal(checklistDay(Date.parse('2026-03-28T23:30:00Z')),'2026-03-29');
 assert.equal(inspectProfessionalBookings([booking('a')],'2026-02-30'),null);
});
test('large directory does not become a false zero',async()=>{
 const data=snapshot();data.portalBookingList=Array.from({length:2001},(_,i)=>booking(String(i)));
 const r=await setup({data}).ask(overlapQueries[1]);assert.equal(r.metadata.state,'scan_unavailable');assert.equal(r.actions.length,0);assert.doesNotMatch(r.textEN,/0 bookings/);
});
test('loaded empty directory is a known zero, not unavailable',async()=>{
 const data=snapshot();data.portalBookingList=[];const r=await setup({data}).ask(arrivalQueries[0]);
 assert.equal(r.metadata.matchedBookings,0);assert.equal(r.metadata.complete,true);assert.equal(r.actions.length,0);
});
for(const state of ['absent','loading','error','access','foreign','demo_without_mode'])test('unavailable snapshot never reveals account facts: '+state,async()=>{
 const {w,ask}=setup({paid:state!=='access'});
 if(state==='absent')w.rbPMSData=null;
 if(['loading','error'].includes(state))w.rbPMSSnapshotLoad={ownerUid:'owner',status:state};
 if(state==='foreign')w.currentUser={uid:'other'};
 if(state==='demo_without_mode')w.rbPMSData.isDemo=true;
 const r=await ask(overlapQueries[0]);assert.equal(r.type,'pms_context');assert.equal(r.actions.length,0);assert.doesNotMatch(JSON.stringify(r),/Casa Alfa|Casa Beta|"one"/);
});
test('explicit demo remains labeled and does not become an account snapshot',async()=>{
 const data=snapshot();data.isDemo=true;data.bookingList=data.portalBookingList;
 const {w,ask}=setup({data});w.isDemoDashboard=true;const r=await ask(arrivalQueries[0]);
 assert.equal(r.metadata.source,'demo_pms');assert.match(r.textEN,/DEMO/);assert.equal(w.rbValidateEvidenceBookingAction(r.actions[0]),true);
 w.isDemoDashboard=false;assert.equal(w.rbValidateEvidenceBookingAction(r.actions[0]),false);
});
test('scope and identity are rechecked for existing action handlers',async()=>{
 const {w,ask}=setup();w.bookingsPropertyFilter='a';const r=await ask(arrivalQueries[0]);
 assert.deepEqual(Array.from(r.metadata.propertyIds),['a']);w.bookingsPropertyFilter='b';assert.equal(w.rbValidateEvidenceBookingAction(r.actions[0]),false);
 assert.equal((await ask(arrivalQueries[1])).metadata.matchedBookings,0);
 w.currentUser=null;assert.equal(w.rbValidateEvidenceBookingAction(r.actions[0]),false);
});
test('foreign records and duplicate IDs cannot become shortcuts',async()=>{
 const data=snapshot();data.portalBookingList.push(booking('one'),booking('secret','foreign'),booking('other-owner','a',{uid:'other'}));
 const r=await setup({data}).ask(arrivalQueries[0]);assert.equal(r.actions.length,0);assert.doesNotMatch(JSON.stringify(r),/secret|other-owner/);assert.match(r.textEN,/unique booking ID/);
});
test('unknown or out-of-filter requested property requires clarification',async()=>{
 const {w,ask}=setup();let r=await ask('Quali arrivi oggi per immobile Sconosciuto?');assert.equal(r.metadata.state,'unknown_property');
 w.bookingsPropertyFilter='b';r=await ask('Quali arrivi oggi per Casa Alfa?');assert.equal(r.metadata.state,'unknown_property');assert.equal(r.actions.length,0);
});
test('fresh server snapshot replaces stale arrivals',async()=>{
 const {w,ask}=setup();let calls=0;w.rbRefreshPortalSnapshot=async()=>{calls++;w.rbPMSData.portalBookingList=[];return w.rbPMSData;};
 const r=await ask(arrivalQueries[0]);assert.equal(calls,1);assert.equal(r.metadata.matchedBookings,0);
});
for(const change of ['reject','null','logout','account','scope'])test('refresh race/failure fails closed: '+change,async()=>{
 const {w,ask}=setup();w.rbRefreshPortalSnapshot=async()=>{
  if(change==='reject')throw Error('offline');if(change==='null')return null;
  if(change==='logout')w.currentUser=null;if(change==='account')w.currentUser={uid:'other'};if(change==='scope')w.bookingsPropertyFilter='b';return w.rbPMSData;
 };
 const r=await ask(overlapQueries[1]);assert.equal(r.metadata.state,'refresh_unavailable');assert.equal(r.actions.length,0);assert.doesNotMatch(JSON.stringify(r),/Casa Alfa|"one"/);
});
test('missing dashboard bridge or different requested period is not silently answered',async()=>{
 const {w,ask}=setup();w.rbPMSProfessionalTools=null;assert.equal((await ask(arrivalQueries[0])).metadata.state,'tools_unavailable');
 const r=await setup().ask('Which bookings overlap next month?');assert.equal(r.metadata.state,'period_required');assert.equal(r.actions.length,0);
});
for(const q of ['Quali strutture hanno costi superiori alle previsioni?','Which properties have costs above forecast?','Quali dati mancano per completare il rendiconto?','What data are missing to complete the owner statement?'])test('accounting capability boundary is educational and never invents personal results: '+q,async()=>{
 const {w,ask}=setup({paid:false});w.lastAnalysisData={roi:987,cashflow:654};const r=await ask(q);
 assert.equal(r.type,'pms_accounting_limits');assert.equal(r.metadata.personalCompletenessVerified,false);assert.equal(r.actions.length,0);
 assert.match(r.textEN,/booked revenue/i);assert.doesNotMatch(JSON.stringify(r),/Casa Alfa|987|654|€19|€29/);
});
test('explicit plan, PDF and commercial queries keep their established routes',async()=>{
 const {ask}=setup();assert.equal((await ask('Quanto costa Investor?')).type,'subscriptions');
 const r=await ask('Quali costi sono previsti nel PDF?');assert.notEqual(r.type,'pms_accounting_limits');
 const commercial=await ask('Quali costi sono previsti per immobili commerciali?');assert.notEqual(commercial.type,'pms_accounting_limits');
});
test('more than five matches are disclosed and actions remain bound to visible references',async()=>{
 const data=snapshot();data.portalBookingList=Array.from({length:8},(_,i)=>booking('stay-'+i));
 const r=await setup({data}).ask(arrivalQueries[0]);assert.equal(r.metadata.matchedBookings,8);assert.equal(r.actions.length,5);assert.match(r.textEN,/Showing 5 of 8/);
});
