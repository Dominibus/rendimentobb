import test from 'node:test';
import assert from 'node:assert/strict';
import {territorialSummary} from '../js/territorial-benchmarks.js';
import {readFileSync} from 'node:fs';
import {auditCoverage} from '../scripts/audit-territorial-coverage.mjs';
import {loadReminderBookings,queueDailyReminders} from '../lib/pms-reminders.js';
import {MemoryFirestore} from './helpers/pms-memory-firestore.js';
const now=Date.parse('2026-10-28T07:00:00Z');
test('all capitals disclose absent domains and only nine validated quote series',()=>{
 const report=auditCoverage({now:new Date(now)});
 assert.equal(report.capitals,20);assert.equal(report.covered,9);
 assert.equal(new Set(report.rows.map(r=>r.istat)).size,20);
 for(const r of report.rows){assert.equal(r.realADR,null);assert.equal(r.realOccupancy,null);assert.equal(r.territorialROI,null);assert.equal(r.purchasePrices,'not_imported');}
 const trento=report.rows.find(r=>r.key==='trento');assert.equal(trento.eligibleQuotes,515);assert.equal(trento.publishedSegments,11);assert.equal(trento.geographyFilter.equals,'Trento, Trentino');
 assert.equal(report.rows.find(r=>r.key==='torino').nightlyQuotes,'not_validated');
});
function setup(size){
 const seed={'users/u1':{plan:'pro',notificationPreferences:{pmsReminderEmail:true}},'properties/p1':{uid:'u1',name:'Casa'}};
 for(let i=0;i<size;i++)seed['bookings/b'+String(i).padStart(4,'0')]={uid:'u1',propertyId:'p1',status:i===size-1?'arrival':'cancelled',checkin:'2026-10-28',checkout:'2026-10-30',guestName:'Test',guests:1,guestRegistration:{documentsReceived:1,authorityStatus:'submitted'},cleaning:{required:false}};
 // A different account must never enter the history.
 seed['bookings/other']={uid:'other',status:'arrival'};
 return new MemoryFirestore(seed);
}
for(const count of [200,201,450])test('complete paginated history includes task beyond old cutoff: '+count,async()=>{
 const db=setup(count);const stats=await queueDailyReminders({db,getAuthUser:async()=>({email:'test@example.test',emailVerified:true}),timestamp:()=>now,now});
 assert.equal(stats.queued,1);assert.equal(stats.incompleteAccounts,0);
 const reminder=[...db.documents].find(([p])=>p.startsWith('_pms_notifications/'))[1];
 assert.equal(reminder.reminderItems[0].bookingId,'b'+String(count-1).padStart(4,'0'));
});
test('page or time exhaustion returns no partial summary',async()=>{
 assert.equal(await loadReminderBookings({db:setup(450),uid:'u1',maxPages:1}),null);
 let calls=0;assert.equal(await loadReminderBookings({db:setup(450),uid:'u1',hasTime:()=>++calls<2}),null);
 let ticks=0;const db=setup(450);const stats=await queueDailyReminders({db,getAuthUser:async()=>({email:'test@example.test',emailVerified:true}),timestamp:()=>now,now,clock:()=>ticks++<3?0:13000});
 assert.equal(stats.queued,0);assert.equal(stats.incompleteAccounts,1);assert.equal(stats.needsAttention,true);
});

test('past stay dates are distinguished from observation age, with exact boundary and sparse safety',()=>{
 const data=JSON.parse(readFileSync(new URL('../data/territorial/trento.json',import.meta.url)));
 const row=data.rows.find(r=>r[6]!==null),boundary=Date.parse(row[13]+'T00:00:00Z');
 assert.equal(territorialSummary(data,row,boundary).quotedStayEnded,true);
 assert.equal(territorialSummary(data,row,boundary-1).quotedStayEnded,false);
 const summary=territorialSummary(data,row,now);assert.equal(summary.stale,false);assert.equal(summary.quotedStayEnded,true);
 assert.equal(territorialSummary(data,data.rows.find(r=>r[6]===null),now).quotedStayEnded,false);
});
