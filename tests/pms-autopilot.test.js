import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {buildPMSDailyPlan} from '../js/pms-daily-plan.js';
import {dailyChecklist} from '../js/pms-daily-checklist.js';
const source=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const day='2026-10-06';
const base={id:'today',guestName:'Carlo',propertyName:'Casa Roma',status:'arrival',checkin:day,checkout:'2026-10-09',guests:2,guestRegistration:{documentsReceived:0,authorityStatus:'submitted'},cleaning:{required:false}};
function engine(bookings=[base]){
  const window={rbRefreshPMSForAutopilot:async()=>({plan:buildPMSDailyPlan(bookings,day),syncedAt:'06/10/2026 12:00:00'})};
  vm.runInNewContext(source('js/chatbot/core/pms-autopilot-engine.js'),{window});
  return window;
}
test('one booking can require several operations and the priority plan counts tasks',()=>{
  const plan=buildPMSDailyPlan([base],day);
  assert.equal(plan.counts.total,2);assert.deepEqual(plan.items.map(item=>item.code),['documents','arrival']);
  assert.equal(plan.counts.overdue,0);assert.equal(plan.counts.upcoming,0);
});
test('urgent future guest issue precedes older work; future preparation is separate',()=>{
  const plan=buildPMSDailyPlan([base,{...base,id:'old',checkin:'2026-10-01'},
    {...base,id:'tomorrow',checkin:'2026-10-07'},
    {...base,id:'urgent',checkin:'2026-11-01',guestIssue:{active:true,status:'open',priority:'urgent'}}],day);
  assert.equal(plan.items[0].bookingId,'urgent');assert.equal(plan.items[0].code,'issue');
  assert.equal(plan.counts.urgent,1);assert.equal(plan.counts.total,5);assert.equal(plan.counts.overdue,2);
  assert.equal(plan.counts.upcoming,2);assert.equal(plan.preparation.length,1);
  assert.equal(plan.preparation[0].bookingId,'tomorrow');
});
test('cancelled and pending reservations are not daily tasks; date quality is reported',()=>{
  const plan=buildPMSDailyPlan([{...base,status:'cancelled'},{...base,id:'pending',status:'pending'},
    {...base,id:'invalid',checkin:'invalid',checkout:'invalid'}],day);
  assert.equal(plan.counts.total,1);assert.equal(plan.invalidDates,1);
});
test('taking charge is not completion and saved facts clear the old task',()=>{
  const task=dailyChecklist([base],day)[0];
  const claimed={...base,autopilotTasks:{documents:{...task,status:'in_progress'}}};
  assert.equal(buildPMSDailyPlan([claimed],day).counts.inProgress,1);
  const complete={...claimed,guestRegistration:{documentsReceived:2,authorityStatus:'submitted'}};
  assert.equal(buildPMSDailyPlan([complete],day).counts.total,1);
  assert.equal(buildPMSDailyPlan([complete],day).counts.inProgress,0);
});
test('tomorrow remains a calendar day across month and daylight saving boundaries',()=>{
  assert.equal(buildPMSDailyPlan([],'2026-10-31').tomorrow,'2026-11-01');
  assert.equal(buildPMSDailyPlan([],'2026-03-28').tomorrow,'2026-03-29');
});
test('operational Italian and English requests route without stealing PDF and ROI questions',()=>{
  const w=engine();
  for(const query of ['Cosa devo fare oggi nel PMS?','Cosa gestire prima?','Quali documenti mancano?',
    'Quali sono le urgenze?','Tutto sotto controllo?','Which documents are missing?','What is urgent?',
    'What should I do today in the PMS?'])assert.equal(w.rbIsPMSAutopilotQuestion(query),true,query);
  for(const query of ['Quali documenti mancano nel PDF?','ROI e checklist','Come funziona un autopilot?',
    'Quanto devo pagare domani?','Analizza la brochure'])assert.equal(w.rbIsPMSAutopilotQuestion(query),false,query);
});
test('daily response loads fresh data and emits exact, read-only task section actions',async()=>{
  const w=engine();let refreshed=0;
  w.rbRefreshPMSForAutopilot=async()=>{refreshed++;return {plan:buildPMSDailyPlan([base],day)};};
  const response=await w.rbBuildPMSAutopilotResponse('Cosa devo fare oggi?');
  assert.equal(refreshed,1);assert.equal(response.type,'pms_autopilot_daily');
  assert.match(response.textIT,/2 attività e operazioni/);assert.match(response.textIT,/Casa Roma/);
  assert.match(response.textIT,/2 documenti ospiti mancanti/);
  assert.deepEqual(Array.from(response.actions,action=>[action.type,action.bookingId,action.section]),
    [['open_pms_task','today','documents'],['open_pms_task','today','arrival'],['open_pms_checklist',undefined,undefined]]);
  assert.match(response.textEN,/Opening a shortcut does not change a booking/);
});
test('resolved facts disappear on the next request rather than using conversation history',async()=>{
  const w=engine();const before=await w.rbBuildPMSAutopilotResponse('Quali documenti mancano?');
  assert.equal(before.actions[0].section,'documents');
  w.rbRefreshPMSForAutopilot=async()=>({plan:buildPMSDailyPlan([{...base,guestRegistration:{documentsReceived:2,authorityStatus:'submitted'}}],day)});
  const after=await w.rbBuildPMSAutopilotResponse('Quali documenti mancano?');
  assert.equal(after.actions.length,1);assert.match(after.textIT,/Nessuna attività quotidiana corrisponde/);
});
test('future-only and unknown-date data never produce an unconditional all-clear',async()=>{
  const future=engine([{...base,checkin:'2026-10-07'}]);
  const response=await future.rbBuildPMSAutopilotResponse('Cosa devo fare oggi?');
  assert.match(response.textIT,/Nessuna attività quotidiana rilevata/);
  assert.match(response.textIT,/Da preparare per domani/);assert.match(response.textIT,/1 attività future/);
  const unknown=engine([{...base,checkin:'invalid'}]);
  assert.match((await unknown.rbBuildPMSAutopilotResponse('Cosa devo fare oggi?')).textIT,/controlli sulle scadenze possono essere incompleti/);
});
test('failed or unavailable data gives no actions and cannot use cached counts',async()=>{
  for(const provider of [undefined,async()=>null,async()=>{throw new Error('offline');}]){
    const w=engine();w.rbRefreshPMSForAutopilot=provider;
    const response=await w.rbBuildPMSAutopilotResponse('Cosa devo fare oggi?');
    assert.equal(response.type,'pms_autopilot_unavailable');assert.equal(response.actions.length,0);
    assert.match(response.textIT,/Non posso verificare/);assert.doesNotMatch(response.textIT,/2 attività/);
  }
});
test('demo summaries identify their source and unresolved issues remain urgent',async()=>{
  const w=engine();w.rbRefreshPMSForAutopilot=async()=>({plan:buildPMSDailyPlan([{...base,guestIssue:{active:true,status:'open',priority:'urgent'}}],day),isDemo:true});
  const response=await w.rbBuildPMSAutopilotResponse('Quali sono le urgenze?');
  assert.match(response.textIT,/Dati DEMO/);assert.match(response.textIT,/1 urgenti/);
  assert.equal(response.actions[0].section,'issue');assert.equal(response.actions.length,2);
});
test('operational response takes precedence once, leaving unrelated PDF queries alone',async()=>{
  const w=engine();let portalCalls=0,memories=0;
  w.rbBuildPortalResponse=()=>{portalCalls++;return {type:'other'};};
  w.rbRememberMessage=()=>{memories++;};
  vm.runInNewContext(source('js/chatbot/core/chatbot-orchestrator.js'),{window:w,console});
  const result=await w.rbProcessAIMessage('Cosa devo fare oggi?');
  assert.equal(result.response.type,'pms_autopilot_daily');assert.equal(portalCalls,0);assert.equal(memories,1);
  await w.rbProcessAIMessage('Quanto devo pagare domani?');assert.equal(portalCalls,1);
});

const dashboard=source('js/dashboard.js');
function dashboardHarness(){
  let loads=0;const calls=[],alerts=[];
  const window={currentUser:{uid:'owner'},currentBookingsData:[base],
    rbPMSData:{ownerUid:'owner',portalSnapshotReady:true,portalBookingList:[base],lastBookingsSync:'2026-10-06T10:00:00Z'},
    t:(it)=>it,openPMSDailyChecklist:async()=>{calls.push('load');},
    openBookingForEdit:async(id,section)=>{calls.push([id,section]);return true;}};
  const ctx={window,buildPMSDailyPlan,checklistDay:()=>day,isDemo:()=>false,canUseFirestorePMS:()=>true,
    loadPMSStats:async()=>{loads++;},alert:message=>alerts.push(message)};
  vm.createContext(ctx);
  vm.runInContext(dashboard.slice(dashboard.indexOf('window.rbRefreshPMSForAutopilot='),dashboard.indexOf('function renderPMSPortalAlerts')),ctx);
  vm.runInContext(dashboard.slice(dashboard.indexOf('window.openPMSAutopilotTask='),dashboard.indexOf('window.openPMSAllTasks=')),ctx);
  return {window,ctx,calls,alerts,loads:()=>loads};
}
test('dashboard provider refreshes all properties and rejects a different account snapshot',async()=>{
  const h=dashboardHarness();assert.equal((await h.window.rbRefreshPMSForAutopilot()).plan.counts.total,2);
  assert.equal(h.loads(),1);h.window.rbPMSData.ownerUid='other';
  assert.equal(await h.window.rbRefreshPMSForAutopilot(),null);
});
test('provider rejects account switches during the refresh and incomplete snapshots',async()=>{
  const h=dashboardHarness();h.ctx.loadPMSStats=async()=>{h.window.currentUser={uid:'changed'};};
  assert.equal(await h.window.rbRefreshPMSForAutopilot(),null);
  const missing=dashboardHarness();missing.window.rbPMSData.portalSnapshotReady=false;
  assert.equal(await missing.window.rbRefreshPMSForAutopilot(),null);
});
test('shortcut reads fresh facts before opening exact section and never advances status',async()=>{
  const h=dashboardHarness();assert.equal(await h.window.openPMSAutopilotTask('today','documents'),true);
  assert.deepEqual(h.calls,['load',['today','documents']]);assert.equal(base.status,'arrival');
  h.window.currentBookingsData=[{...base,guestRegistration:{documentsReceived:2,authorityStatus:'submitted'}}];
  h.calls.length=0;assert.equal(await h.window.openPMSAutopilotTask('today','documents'),false);
  assert.deepEqual(h.calls,['load']);assert.equal(h.alerts.length,1);
});
test('shortcut respects discarded navigation and rejects unsupported task codes',async()=>{
  const h=dashboardHarness();assert.equal(await h.window.openPMSAutopilotTask('today','delete'),false);
  assert.equal(h.calls.length,0);h.window.openPMSDailyChecklist=async()=>false;
  assert.equal(await h.window.openPMSAutopilotTask('today','documents'),false);assert.equal(h.calls.length,0);
});

test('context action buttons use safe labels and the new read-only bridge',async()=>{
  const ui=source('js/chatbot/ui/chatbot-ui.js');
  const makeNode=()=>({children:[],className:'',appendChild(node){this.children.push(node);}});
  const messages=makeNode(),calls=[];let closed=0;
  const ctx={document:{createElement:makeNode},messages,windowEl:{classList:{remove:()=>closed++}},
    window:{openPMSAutopilotTask:async(id,section)=>{calls.push([id,section]);return true;},openPMSDailyChecklist:async()=>{calls.push('checklist');}},reportRuntimeError:()=>{},addMessage:()=>{},t:it=>it};
  vm.createContext(ctx);vm.runInContext(ui.slice(ui.indexOf('  function addResponseActions('),ui.indexOf('// ⌨ SEND MESSAGE')),ctx);
  ctx.addResponseActions([{type:'open_pms_task',bookingId:'today',section:'documents',labelIT:'<img onerror=attack>'},
    {type:'open_pms_checklist',labelIT:'Checklist'},{type:'delete_booking',bookingId:'today'}]);
  const buttons=messages.children[0].children;assert.equal(buttons.length,2);
  assert.equal(buttons[0].textContent,'<img onerror=attack>');assert.equal(buttons[0].innerHTML,undefined);
  await buttons[0].onclick();await buttons[1].onclick();assert.deepEqual(calls,[['today','documents'],'checklist']);
  assert.equal(closed,2);assert.equal(buttons[0].disabled,false);
});

test('fresh checklist navigation uses server reads and preserves the ordinary reader by default',async()=>{
  const calls=[];
  const window={currentUser:{uid:'owner'}};
  const ctx={window,isDemo:()=>false,canUseFirestorePMS:()=>true,db:{},
    getDocs:async()=>{calls.push('default');return {};},getDocsFromServer:async()=>{calls.push('server');return {};},
    query:()=>({}),collection:()=>({}),where:()=>({})};
  vm.createContext(ctx);
  const start=dashboard.indexOf('window.openCurrentBookings = async function(');
  const end=dashboard.indexOf('  if(propertiesSnap.empty)',start);
  vm.runInContext(dashboard.slice(start,end)+'return true;};',ctx);
  await window.openCurrentBookings({fresh:true});assert.deepEqual(calls,['server','server']);
  calls.length=0;await window.openCurrentBookings();assert.deepEqual(calls,['default','default']);
  calls.length=0;window.closeBookingForm=()=>false;
  assert.equal(await window.openCurrentBookings({fresh:true}),false);assert.deepEqual(calls,[]);
});

test('host centre uses the complete portal list even after viewing a single property',()=>{
  const container={innerHTML:''};
  const ctx={window:{t:(it)=>it},document:{getElementById:()=>container},renderPMSEmailVerification:()=>{},
    buildPMSDailyPlan,checklistDay:()=>day,escapeDashboardHTML:value=>String(value),alert:()=>{},dashboardError:()=>{}};
  vm.createContext(ctx);vm.runInContext(dashboard.slice(dashboard.indexOf('function renderPMSPortalAlerts'),dashboard.indexOf('window.openPMSAutopilotTask=')),ctx);
  const all=[base,{...base,id:'other',propertyName:'Casa Napoli'}];
  ctx.renderPMSPortalAlerts({bookingList:[base],portalBookingList:all});
  assert.match(container.innerHTML,/<span>Da gestire<\/span><strong>4<\/strong>/);
  assert.match(container.innerHTML,/Casa Napoli/);assert.match(container.innerHTML,/rbAskPMSAutopilot/);
});
