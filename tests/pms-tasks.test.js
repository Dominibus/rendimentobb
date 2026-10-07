import {bookingOperations,operationSelection} from '../js/pms-booking-operations.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {dailyChecklist,checklistDay} from '../js/pms-daily-checklist.js';
import {derivePMSTasks,reconcilePMSTasks,visiblePMSTasks} from '../js/pms-tasks.js';
const booking={id:'b1',guestName:'Guest',status:'arrival',guests:2,checkin:'2026-10-06',checkout:'2026-10-08',guestRegistration:{documentsReceived:0,authorityStatus:'pending'},cleaning:{required:true,status:'pending'},touristTax:{enabled:true,amount:20,currency:'EUR',status:'pending'},guestIssue:{active:true,status:'open',priority:'urgent',note:'Leak',reportedAt:'2026-10-04T09:00:00Z'}};
test('five obligations derive from booking facts with stable codes and due dates',()=>{
 const tasks=derivePMSTasks(booking);assert.equal(tasks.length,5);assert.equal(tasks.find(t=>t.code==='issue').priority,0);assert.equal(tasks.find(t=>t.code==='cleaning').dueDate,'2026-10-08');assert.equal(tasks.find(t=>t.code==='issue').dueDate,'2026-10-04');
});
test('pending and cancelled stays do not generate host obligations',()=>{
 for(const status of ['pending','cancelled'])assert.deepEqual(derivePMSTasks({...booking,status}),[]);
});
test('completed stay retains unfinished cleaning and unpaid tax',()=>{
 const tasks=derivePMSTasks({...booking,status:'completed'});assert.ok(tasks.some(t=>t.code==='cleaning'));assert.ok(tasks.some(t=>t.code==='tax'));
});
test('taking charge survives identical refresh but a material change reopens task',()=>{
 const old=reconcilePMSTasks(booking,{},'first');old.documents.status='in_progress';old.documents.takenAt='taken';
 const same=reconcilePMSTasks(booking,old,'second');assert.equal(same.documents.status,'in_progress');assert.equal(same.documents.createdAt,'first');
 const changed=reconcilePMSTasks({...booking,guests:3},same,'third');assert.equal(changed.documents.status,'open');assert.equal(changed.documents.takenAt,undefined);
});
test('resolution follows source data and resolved obligations reopening get new state',()=>{
 const old=reconcilePMSTasks(booking,{},'first');old.cleaning.status='in_progress';
 const next=reconcilePMSTasks({...booking,cleaning:{required:true,status:'completed'}},old,'second');assert.equal(next.cleaning.status,'resolved');
 const again=reconcilePMSTasks(booking,next,'third');assert.equal(again.cleaning.status,'open');assert.equal(again.cleaning.createdAt,'third');
});
test('zero tax exempt tax and disabled cleaning generate no corresponding task',()=>{
 const tasks=derivePMSTasks({...booking,touristTax:{enabled:true,amount:0,status:'pending'},cleaning:{required:false}});assert.ok(!tasks.some(t=>['tax','cleaning'].includes(t.code)));
 assert.ok(!derivePMSTasks({...booking,touristTax:{enabled:true,amount:20,status:'exempt'}}).some(t=>t.code==='tax'));
});
test('unrelated amount edit preserves claim but new guest issue reopens',()=>{
 const old=reconcilePMSTasks(booking,{},'first');old.issue.status='in_progress';
 assert.equal(reconcilePMSTasks({...booking,totalAmount:400},old,'second').issue.status,'in_progress');
 assert.equal(reconcilePMSTasks({...booking,guestIssue:{...booking.guestIssue,note:'New issue'}},old,'third').issue.status,'open');
});
test('visible legacy tasks are open and resolved saved state cannot conceal current facts',()=>{
 assert.ok(visiblePMSTasks(booking).every(t=>t.status==='open'));
 const old=reconcilePMSTasks(booking,{},'first');old.documents.status='resolved';assert.equal(visiblePMSTasks({...booking,autopilotTasks:old}).find(t=>t.code==='documents').status,'open');
});
test('invalid due date stays undated rather than inventing a deadline',()=>{assert.equal(derivePMSTasks({...booking,checkin:'bad'}).find(t=>t.code==='documents').dueDate,'');});
test('operations render translated persistent controls and keep urgent issue first',()=>{
 const source=readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');
 for(const lang of ['it','en']){
  const container={innerHTML:''};const ctx={visiblePMSTasks,dailyChecklist,checklistDay,bookingOperations,operationSelection,document:{getElementById:()=>container},escapeDashboardHTML:s=>String(s).replace(/</g,'&lt;'),isConfirmedBooking:()=>true,window:{rbChecklistFilter:"all",t:(it,en)=>lang==='en'?en:it,getTouristTaxCurrencySymbol:()=> '€'},Intl,Date};vm.createContext(ctx);
  vm.runInContext(source.slice(source.indexOf('function renderTodayBookingOperations'),source.indexOf('window.setPMSTaskStatus')),ctx);
  const states=reconcilePMSTasks(booking,{},'first');states.documents.status='in_progress';ctx.renderTodayBookingOperations([{...booking,guestName:'<Guest>',autopilotTasks:states}]);
  assert.match(container.innerHTML,lang==='en'?/Take charge/:/Prendi in carico/);assert.match(container.innerHTML,lang==='en'?/In progress · Reopen/:/In carico · Riapri/);assert.match(container.innerHTML,/&lt;Guest>/);
  const taskCodes=Array.from(container.innerHTML.matchAll(/data-task-code="([^"]+)"/g),match=>match[1]);
  assert.equal(taskCodes[0],'issue');assert.ok(taskCodes.indexOf('issue')<taskCodes.indexOf('documents'));assert.match(container.innerHTML,/max-height:360px;overflow-y:auto/);
 }
});
test('task action sends fresh server revision and source fingerprint then refreshes',async()=>{
 const source=readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8'),calls=[];const current={...booking,propertyId:'p1',_pmsVersion:7};
 const ctx={visiblePMSTasks,window:{currentUser:{uid:'u1'}},isDemo:()=>false,runBookingOperation:async(key,action)=>action(),readFreshBooking:async id=>{calls.push(['read',id]);return current;},mutatePMS:async(operation,payload)=>calls.push([operation,payload]),refreshAfterBookingMutation:async()=>calls.push(['refresh']),dashboardError:()=>{},bookingOperationError:()=>{},failBookingOperation:()=>{throw Error('unexpected');}};vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('window.setPMSTaskStatus ='),source.indexOf('async function loadBookings')),ctx);
 await ctx.window.setPMSTaskStatus('b1','documents','in_progress');assert.equal(calls[0][0],'read');assert.equal(calls[1][0],'task');assert.equal(calls[1][1].expectedVersion,7);assert.equal(calls[1][1].taskFingerprint,visiblePMSTasks(current).find(t=>t.code==='documents').fingerprint);assert.equal(calls[2][0],'refresh');
});
test('failed task action reports error without updating local task state or success refresh',async()=>{
 const source=readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8'),calls=[];const current={...booking,_pmsVersion:7};
 const ctx={visiblePMSTasks,window:{currentUser:{uid:'u1'}},isDemo:()=>false,runBookingOperation:async(key,action)=>action(),readFreshBooking:async()=>current,mutatePMS:async()=>{throw {code:'booking/stale_version'};},refreshAfterBookingMutation:async()=>calls.push('refresh'),dashboardError:()=>{},bookingOperationError:error=>calls.push(error.code),failBookingOperation:()=>{throw Error('unexpected');}};vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('window.setPMSTaskStatus ='),source.indexOf('async function loadBookings')),ctx);
 await ctx.window.setPMSTaskStatus('b1','documents','in_progress');assert.deepEqual(calls,['booking/stale_version']);assert.equal(current.autopilotTasks,undefined);
});
test('operations show overdue checkout and clickable card selection without changing booking facts',()=>{
 const source=readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8'),container={innerHTML:''};
 const ctx={visiblePMSTasks,dailyChecklist,checklistDay:()=> '2026-10-05',bookingOperations,operationSelection,document:{getElementById:()=>container},escapeDashboardHTML:String,isConfirmedBooking:()=>true,window:{t:it=>it,getTouristTaxCurrencySymbol:()=> '€'},Date,Intl};vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('function renderTodayBookingOperations'),source.indexOf('window.setPMSTaskStatus')),ctx);
 const dario={...booking,id:'dario',guestName:'Dario',status:'checkin',checkin:'2026-09-07',checkout:'2026-09-14'};ctx.renderTodayBookingOperations([dario]);assert.match(container.innerHTML,/Check-out da registrare/);assert.match(container.innerHTML,/Arretrato · verifica prenotazione/);assert.match(container.innerHTML,/setPMSOperationFilter\('departure'\)/);ctx.window.setPMSOperationFilter('arrival');assert.match(container.innerHTML,/Nessuna prenotazione per questa selezione/);assert.equal(dario.status,'checkin');
});
