import {bookingOperations,operationSelection} from '../js/pms-booking-operations.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {dailyChecklist} from '../js/pms-daily-checklist.js';
import {buildPMSDailyPlan} from '../js/pms-daily-plan.js';
const source=readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');
function harness(lang='it'){const container={innerHTML:''},calls=[];const ctx={buildPMSDailyPlan,dailyChecklist,bookingOperations,operationSelection,checklistDay:()=> '2026-10-05',renderPMSEmailVerification:()=>{},document:{getElementById:()=>container},escapeDashboardHTML:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),window:{t:(it,en)=>lang==='en'?en:it},alert:m=>calls.push(m),dashboardError:()=>{}};vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('function renderPMSPortalAlerts'),source.indexOf('window.togglePMSReminderEmail')),ctx);return {ctx,container,calls};}
const base={id:'b1',guestName:'Carlo',status:'arrival',guests:2,checkin:'2026-10-05',checkout:'2026-10-11',cleaning:{required:false},guestRegistration:{documentsReceived:0,authorityStatus:'submitted'}};
test('daily overview counts pending facts and operations while keeping future tasks separate',()=>{
 const {ctx,container}=harness();
 const overdue={...base,id:'old',status:'checkin',checkin:'2026-09-01',checkout:'2026-10-04',propertyName:'<Casa>',guestRegistration:{documentsReceived:2,authorityStatus:'submitted'}};
 ctx.renderPMSPortalAlerts({bookingList:[base,overdue,{...base,id:'future',checkin:'2026-11-08'}]});
 assert.match(container.innerHTML,/<span>Da gestire<\/span><strong>3<\/strong>/);
 assert.match(container.innerHTML,/<span>Con data superata<\/span><strong>1<\/strong>/);
 assert.match(container.innerHTML,/1 attività future/);
 assert.match(container.innerHTML,/&lt;Casa>/);
 assert.match(container.innerHTML,/La data di partenza è raggiunta/);
 assert.match(container.innerHTML,/Verifica soggiorno →/);
});
test('empty daily overview opens all tasks without leaving stale filters',async()=>{
 const {ctx,container}=harness();ctx.renderPMSPortalAlerts({bookingList:[{...base,checkin:'2026-11-08'}]});
 assert.match(container.innerHTML,/openPMSAllTasks/);
 let loaded=false;ctx.window.rbChecklistSearch='old';ctx.window.rbOperationFilter='arrival';ctx.window.openCurrentBookings=async()=>{loaded=true;};
 await ctx.window.openPMSAllTasks();
 assert.equal(loaded,true);assert.equal(ctx.window.rbChecklistFilter,'all');assert.equal(ctx.window.rbChecklistSearch,'');assert.equal(ctx.window.rbOperationFilter,null);
});
test('in-progress count follows current booking facts and ignores stale task claims',()=>{
 const {ctx,container}=harness();
 const task=dailyChecklist([base],'2026-10-05').find(item=>item.code==='documents');
 const claimed={...base,autopilotTasks:{documents:{...task,status:'in_progress'}}};
 ctx.renderPMSPortalAlerts({bookingList:[claimed]});
 assert.match(container.innerHTML,/<span>In carico<\/span><strong>1<\/strong>/);
 ctx.renderPMSPortalAlerts({bookingList:[{...claimed,guestRegistration:{documentsReceived:2,authorityStatus:'submitted'}}]});
 assert.match(container.innerHTML,/<span>In carico<\/span><strong>0<\/strong>/);
 assert.doesNotMatch(container.innerHTML,/data-task-code="documents"/);
});
test('host centre puts urgent issues first and separates future work',()=>{for(const lang of ['it','en']){const {ctx,container}=harness(lang);ctx.renderPMSPortalAlerts({bookingList:[base,{...base,id:'future',guestName:'Future',checkin:'2026-11-08'},{...base,id:'urgent',guestName:'Mario',guests:0,guestIssue:{active:true,priority:'urgent',status:'open'}}]});assert.ok(container.innerHTML.indexOf('Mario')<container.innerHTML.indexOf('Carlo'));assert.ok(!container.innerHTML.includes('>Future<'));assert.match(container.innerHTML,lang==='it'?/1 attività future/:/1 upcoming tasks/);assert.match(container.innerHTML,/data-booking-id="urgent"/);assert.match(container.innerHTML,/openPMSAlertBooking/);}});
test('host centre with only future work does not claim urgent work',()=>{const {ctx,container}=harness();ctx.renderPMSPortalAlerts({bookingList:[{...base,checkin:'2026-11-08'}]});assert.match(container.innerHTML,/Nessun problema o attività in scadenza oggi/);assert.match(container.innerHTML,/1 attività future/);});
test('alert opens after fresh booking load and clears stale checklist filters',async()=>{const {ctx}=harness();const calls=[];ctx.window.rbChecklistSearch='mario';ctx.window.rbChecklistFilter='documents';ctx.window.openCurrentBookings=async()=>{calls.push('load');ctx.window.currentBookingsData=[base];};ctx.window.openBookingForEdit=id=>calls.push(id);const button={disabled:false};await ctx.window.openPMSAlertBooking('b1',button);assert.deepEqual(calls,['load','b1']);assert.equal(ctx.window.rbChecklistSearch,'');assert.equal(ctx.window.rbChecklistFilter,'daily');assert.equal(button.disabled,false);});
test('missing booking gives feedback and repeated clicks cannot race the load',async()=>{const {ctx,calls}=harness();let release;ctx.window.openCurrentBookings=()=>new Promise(resolve=>{release=resolve;});const button={disabled:false};const first=ctx.window.openPMSAlertBooking('missing',button);await ctx.window.openPMSAlertBooking('missing',button);assert.equal(button.disabled,true);release();await first;assert.equal(calls.length,1);assert.equal(button.disabled,false);});
test('host centre exposes overdue checkout from saved status and opens its booking',()=>{const {ctx,container}=harness();ctx.renderPMSPortalAlerts({bookingList:[{...base,id:'dario',guestName:'Dario',status:'checkin',checkin:'2026-09-07',checkout:'2026-09-14',guests:0}]});assert.match(container.innerHTML,/Check-out da registrare/);assert.match(container.innerHTML,/Arretrato · verifica/);assert.match(container.innerHTML,/data-booking-id="dario"/);assert.match(container.innerHTML,/1 arrivi\/check-out arretrati/);});
