import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {buildPMSDailyPlan} from '../js/pms-daily-plan.js';
const source=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const today='2026-10-06';
const base={id:'future',guestName:'Ospite prova',propertyName:'Casa Roma',status:'arrival',checkin:'2026-10-07',checkout:'2026-10-09',guests:2,
  guestRegistration:{documentsReceived:0,authorityStatus:'submitted'},cleaning:{required:true,status:'scheduled',scheduledDate:'2026-10-09'}};
function engine(bookings=[base]){
 const window={rbRefreshPMSForAutopilot:async()=>({plan:buildPMSDailyPlan(bookings,today),syncedAt:'06/10/2026, 12:00'})};
 vm.runInNewContext(source('js/chatbot/core/pms-autopilot-engine.js'),{window});return window;
}
test('seven-day window includes its last day but excludes today and the eighth day',()=>{
 const bookings=[base,{...base,id:'last',checkin:'2026-10-13',checkout:'2026-10-14'},
   {...base,id:'eighth',checkin:'2026-10-14',checkout:'2026-10-15'},{...base,id:'now',checkin:today}];
 const plan=buildPMSDailyPlan(bookings,today);
 assert.equal(plan.week.start,'2026-10-07');assert.equal(plan.week.end,'2026-10-13');
 assert.deepEqual(plan.week.arrivals.map(row=>row.bookingId),['future','last']);
 assert.equal(plan.week.toPrepare,2);
});
test('pending, cancelled, checked-in and completed bookings cannot be expected arrivals',()=>{
 const bookings=['pending','cancelled','checkin','checkout','completed','confirmed','arrival'].map((status,index)=>({...base,id:String(index),status}));
 assert.deepEqual(buildPMSDailyPlan(bookings,today).week.arrivals.map(row=>row.bookingId),['5','6']);
});
test('post-checkout cleaning stays in weekly turnover tasks and does not block pre-arrival checks',()=>{
 const complete={...base,guestRegistration:{documentsReceived:2,authorityStatus:'submitted'}};
 const plan=buildPMSDailyPlan([complete],today);
 assert.equal(plan.week.arrivals[0].pending.length,0);assert.equal(plan.week.toPrepare,0);
 assert.equal(plan.week.tasks[0].code,'cleaning');assert.equal(plan.counts.total,0);
 const before=buildPMSDailyPlan([{...complete,cleaning:{...complete.cleaning,scheduledDate:'2026-10-07'}}],today);
 assert.equal(before.week.arrivals[0].pending[0].code,'cleaning');assert.equal(before.week.toPrepare,1);
});
test('pre-arrival checks separate checkout tax from arrival tax and keep open issues',()=>{
 const tax={enabled:true,status:'pending',amount:10,collectionTime:'checkout'};
 const b={...base,touristTax:tax,guestIssue:{active:true,status:'open',priority:'urgent'},guestRegistration:{documentsReceived:0,authorityStatus:'pending'}};
 const plan=buildPMSDailyPlan([b],today);
 assert.deepEqual(plan.week.arrivals[0].pending.map(item=>item.code),['issue','documents','authority']);
 assert.equal(plan.counts.urgent,1);assert.equal(plan.week.tasks.some(item=>item.code==='tax'),true);
 const arrivalTax=buildPMSDailyPlan([{...b,touristTax:{...tax,collectionTime:'checkin'}}],today);
 assert.equal(arrivalTax.week.arrivals[0].pending.some(item=>item.code==='tax'),true);
});
test('missing guest data is flagged even when no pre-arrival tasks can be derived',()=>{
 const plan=buildPMSDailyPlan([{...base,guestName:'',guests:0,cleaning:{required:false}}],today);
 assert.equal(plan.week.arrivals[0].pending.length,0);assert.equal(plan.week.arrivals[0].guestDataIncomplete,true);
 assert.equal(plan.week.toPrepare,1);
});
test('invalid dates are omitted from upcoming arrivals and reported as incomplete coverage',()=>{
 const plan=buildPMSDailyPlan([{...base,checkin:'2026-10-32'}],today);
 assert.equal(plan.week.arrivals.length,0);assert.equal(plan.invalidDates,1);
});
test('saved documents update arrival preparation without changing arrival status',()=>{
 const before=buildPMSDailyPlan([base],today);
 const after=buildPMSDailyPlan([{...base,guestRegistration:{documentsReceived:2,authorityStatus:'submitted'}}],today);
 assert.equal(before.week.toPrepare,1);assert.equal(after.week.toPrepare,0);
 assert.equal(after.week.arrivals.length,1);assert.equal(after.week.tasks.length,before.week.tasks.length-1);
 assert.equal(base.status,'arrival');
});
test('seven-day IT and EN responses include fact-based checks and safe shortcuts',async()=>{
 const w=engine();
 for(const question of ['Prossimi 7 giorni nel PMS','Next 7 days in the PMS']){
   const response=await w.rbBuildPMSAutopilotResponse(question);
   assert.equal(response.type,'pms_autopilot_horizon');assert.match(response.textIT,/1 arrivi previsti/);
   assert.match(response.textIT,/Documenti mancanti \(2\)/);assert.match(response.textEN,/not a forecast/);
   assert.equal(response.actions[0].type,'open_pms_arrival');assert.equal(response.actions[0].bookingId,'future');
   assert.equal(response.actions[1].section,'documents');assert.equal(response.actions.at(-1).type,'open_pms_all_tasks');
   assert.equal(response.actions.some(a=>['manage_arrival','manage_departure'].includes(a.type)),false);
 }
});
test('tomorrow request excludes later arrivals and activities from its totals',async()=>{
 const w=engine([base,{...base,id:'later',checkin:'2026-10-10',checkout:'2026-10-12'}]);
 const response=await w.rbBuildPMSAutopilotResponse('Prepara gli arrivi di domani');
 assert.equal(response.type,'pms_autopilot_horizon');assert.match(response.textIT,/Preparati per domani/);
 assert.match(response.textIT,/2026-10-07 → 2026-10-07/);assert.match(response.textIT,/1 arrivi previsti/);
 assert.match(response.textIT,/1 attività future in scadenza/);assert.equal(response.actions.some(a=>a.bookingId==='later'),false);
});
test('empty future horizon does not imply that todays overdue tasks are complete',async()=>{
 const w=engine([{...base,checkin:'2026-09-01',checkout:'2026-09-10',cleaning:{required:false}}]);
 const response=await w.rbBuildPMSAutopilotResponse('Prossimi 7 giorni nel PMS');
 assert.match(response.textIT,/0 arrivi previsti/);assert.match(response.textIT,/non significa che le attività di oggi siano completate/);
 assert.equal(response.actions.length,1);
});
test('horizon requests cannot override PDF and investment context',()=>{
 const w=engine();for(const query of ['ROI dei prossimi 7 giorni','Interpreta il PDF sugli arrivi domani','Mutuo della prossima settimana'])assert.equal(w.rbIsPMSAutopilotQuestion(query),false);
});
const dashboard=source('js/dashboard.js');
function arrivalHarness(){
 const calls=[],alerts=[];const window={currentBookingsData:[base],t:it=>it,
  openPMSAllTasks:async options=>{calls.push(['refresh',options.fresh]);},openBookingForEdit:async(id,section)=>{calls.push([id,section]);return true;}};
 const ctx={window,buildPMSDailyPlan,checklistDay:()=>today,alert:message=>alerts.push(message),dashboardError:()=>{}};
 vm.createContext(ctx);vm.runInContext(dashboard.slice(dashboard.indexOf('window.openPMSUpcomingArrival='),dashboard.indexOf('window.openPMSAllTasks=')),ctx);
 return {window,calls,alerts};
}
test('upcoming shortcut reads fresh data, opens stay details and leaves booking unchanged',async()=>{
 const h=arrivalHarness();const b=structuredClone(base);
 assert.equal(await h.window.openPMSUpcomingArrival('future'),true);
 assert.deepEqual(h.calls,[['refresh',true],['future','stay']]);assert.deepEqual(base,b);
 h.calls.length=0;h.window.currentBookingsData=[{...base,status:'checkin'}];
 assert.equal(await h.window.openPMSUpcomingArrival('future'),false);assert.equal(h.calls.length,1);assert.equal(h.alerts.length,1);
});
test('upcoming shortcut honours dirty-form navigation cancellation and direct-button load errors',async()=>{
 const h=arrivalHarness();h.window.openPMSAllTasks=async()=>false;
 assert.equal(await h.window.openPMSUpcomingArrival('future'),false);assert.equal(h.calls.length,0);
 const button={disabled:false};h.window.openPMSAllTasks=async()=>{throw new Error('offline');};
 assert.equal(await h.window.openPMSUpcomingArrival('future',button),false);
 assert.equal(button.disabled,false);assert.match(h.alerts[0],/connessione/);
});
test('task shortcut can open a future document within seven days and rejects an eighth-day task',async()=>{
 const h=arrivalHarness();h.window.openPMSDailyChecklist=async()=>{};
 assert.equal(await h.window.openPMSAutopilotTask('future','documents'),true);
 h.window.currentBookingsData=[{...base,checkin:'2026-10-14',checkout:'2026-10-15'}];
 assert.equal(await h.window.openPMSAutopilotTask('future','documents'),false);
});
