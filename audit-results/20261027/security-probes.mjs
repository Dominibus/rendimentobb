import {queueDailyReminders} from '/workspace/rendimentobb/lib/pms-reminders.js';
import {canExportPMSReport,buildPMSOperationalReport} from '/workspace/rendimentobb/js/pms-operational-report.js';
let cursorRecord={};const users=Array.from({length:21},(_,i)=>({id:'synthetic-'+String(i).padStart(2,'0'),data:()=>({plan:'investor',notificationPreferences:{pmsReminderEmail:true}})}));
const scans=[];
const db={collection(name){if(name==='_pms_jobs')return {doc:()=>({get:async()=>({data:()=>cursorRecord}),set:async x=>{cursorRecord=x;}})};if(name==='users'){let cursor='';const q={where:()=>q,orderBy:()=>q,limit:()=>q,startAfter:c=>{cursor=c;return q},get:async()=>({docs:users.filter(x=>x.id>cursor)})};return q;}if(name==='bookings'){const q={where:()=>q,limit:()=>q,get:async()=>({docs:[]})};return q;}throw Error(name);}};
for(let day=0;day<2;day++){const result=await queueDailyReminders({db,getAuthUser:async()=>({emailVerified:true,email:'synthetic@example.test'}),timestamp:()=>0,now:Date.UTC(2026,9,27+day),clock:()=>0});scans.push({day,checked:result.checked,hasMore:result.hasMore,cursor:cursorRecord.cursor});}
const fakePlanAccepted=canExportPMSReport({uid:'synthetic-investor'},{isPro:true});
const noPlanModel=buildPMSOperationalReport({ownerUid:'synthetic-investor',month:'2026-10',snapshot:{ownerUid:'synthetic-investor',portalSnapshotReady:true,propertyList:[],portalBookingList:[]}});
console.log(JSON.stringify({reminderScans:scans,clientSuppliedProAccepted:fakePlanAccepted,reportModelWithoutPlan:!!noPlanModel},null,2));
