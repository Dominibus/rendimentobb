import test from 'node:test';
import assert from 'node:assert/strict';
import {derivePMSTasks,reconcilePMSTasks,recordPMSTaskTransitions} from '../js/pms-tasks.js';
import {taskTrackingHTML,taskProgressBadge} from '../js/pms-task-tracking.js';
const b={id:'b1',status:'arrival',guests:1,checkin:'2026-10-10',checkout:'2026-10-12',cleaning:{required:false},guestRegistration:{documentsReceived:0,authorityStatus:'not_required'}};
const at='2026-10-04T16:00:00Z',actor={uid:'u1',email:'host@example.test',name:'Host <admin>'};
test('claim records actor date and transition; no unrelated edit duplicates history',()=>{
 const first=reconcilePMSTasks(b,{},at),next=reconcilePMSTasks(b,first,at);next.documents.status='in_progress';
 const r=recordPMSTaskTransitions(first,next,actor,at,'x');assert.equal(r.tasks.documents.takenBy.uid,'u1');assert.equal(r.tasks.documents.takenAt,at);assert.equal(r.events.length,1);
 const same=reconcilePMSTasks(b,r.tasks,'later');const again=recordPMSTaskTransitions(r.tasks,same,actor,'later','y',r.history);assert.equal(again.events.length,0);assert.equal(again.tasks.documents.takenBy.email,actor.email);
});
test('source resolution records resolving actor and date',()=>{
 const old=reconcilePMSTasks(b,{},at);old.documents.status='in_progress';old.documents.takenBy=actor;
 const next=reconcilePMSTasks({...b,guestRegistration:{documentsReceived:1,authorityStatus:'not_required'}},old,at);const r=recordPMSTaskTransitions(old,next,actor,at,'x');assert.equal(r.tasks.documents.resolvedBy.uid,'u1');assert.equal(r.tasks.documents.resolvedAt,at);assert.equal(r.events[0].reason,'booking_updated');
});
test('reopen clears old claim and resolution metadata',()=>{
 const old=reconcilePMSTasks(b,{},at);old.documents={...old.documents,status:'in_progress',takenBy:actor,takenAt:at};const next=reconcilePMSTasks(b,old,at);next.documents.status='open';const r=recordPMSTaskTransitions(old,next,actor,at,'x');assert.equal(r.tasks.documents.takenBy,undefined);assert.equal(r.tasks.documents.takenAt,undefined);
});
test('history is bounded at thirty events',()=>{
 const r=recordPMSTaskTransitions({},reconcilePMSTasks(b,{},at),actor,at,'x',Array.from({length:35},(_,i)=>({id:String(i)})));assert.equal(r.history.length,30);
});
test('booking detail shows in-progress actor and localized states without HTML injection',()=>{
 const old=reconcilePMSTasks(b,{},at);old.documents={...old.documents,status:'in_progress',takenBy:actor,takenAt:at};
 for(const lang of ['it','en']){const t=(it,en)=>lang==='en'?en:it;const html=taskTrackingHTML({...b,autopilotTasks:old},t,lang);assert.match(html,lang==='en'?/In progress/:/In lavorazione/);assert.match(html,/Host &lt;admin&gt;/);assert.ok(!html.includes('Host <admin>'));assert.match(taskProgressBadge({...b,autopilotTasks:old},t),lang==='en'?/tasks in progress/:/attività in lavorazione/);}
});
test('resolved tasks remain visible as saved resolution in detail, absent from work badge',()=>{
 const first=reconcilePMSTasks(b,{},at),done={...b,guestRegistration:{documentsReceived:1,authorityStatus:'not_required'}};const r=recordPMSTaskTransitions(first,reconcilePMSTasks(done,first,at),actor,at,'x');const data={...done,autopilotTasks:r.tasks,autopilotEvents:r.history};assert.match(taskTrackingHTML(data,(it,en)=>it),/Risolta nei dati salvati/);assert.match(taskTrackingHTML(data,(it,en)=>it),/Ultimi aggiornamenti/);assert.match(taskProgressBadge(data,(it,en)=>it),/attività risolte nei dati salvati/);
assert.equal(taskProgressBadge({...data,status:'cancelled'},(it,en)=>it),'');
});
