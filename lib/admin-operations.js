// RC176: bounded, read-only projections. Never return raw provider/user payloads.
import {LIVE_SALES_PAUSED} from '../js/sales-policy.js';
import {TRIAL_DAYS} from '../js/subscription-offer.js';

export const OPS_JOBS = ['task_notifications','analysis_reminders','withdrawal_receipts','subscription_confirmations','plan_interest_cleanup','solution_request_cleanup'];
const STALE_MS=36*60*60*1000;
const LIMIT=20;
const metrics=['checked','sent','errors','retry','manualReview','pending','queued','suppressed','deleted','expiredReminders','oldestDueAgeMs'];
export function millis(value){
 const n=typeof value?.toMillis==='function'?value.toMillis():value instanceof Date?value.getTime():typeof value==='number'?value:typeof value?.seconds==='number'?value.seconds*1000:NaN;
 return Number.isFinite(n)&&n>0?n:null;
}
const count=n=>Number.isSafeInteger(n)&&n>=0?n:null;
export function projectJob(id,data,now){
 if(!data)return {id,state:'unverified',lastRunAt:null,metrics:{}};
 const lastRunAt=millis(data.lastRunAt);
 const values={};
 for(const key of metrics){const n=count(data[key]);if(n!==null)values[key]=n;}
 const flagged=data.success===false||data.needsAttention===true||data.budgetExhausted===true||data.hasDueBacklog===true||
 ['errors','retry','manualReview','pending','expiredReminders'].some(k=>(values[k]||0)>0);
 const stale=lastRunAt!==null&&now-lastRunAt>STALE_MS;
 const invalidTime=lastRunAt===null||lastRunAt>now+300000;
 return {id,state:flagged?'attention':invalidTime?'unverified':stale?'stale':data.success===true?'recorded_success':'recorded',
 lastRunAt,metrics:values,stale,needsAttention:flagged};
}
async function section(read){
 try{return {available:true,...await read()};}catch{return {available:false,error:'read_unavailable'};}
}
function bounded(docs){return {rows:docs.slice(0,LIMIT),more:docs.length>LIMIT};}
function scope(data){return data.sandbox===true?'test':data.sandbox===false?'live':'unknown';}
function queueProjection(snapshot,now,kind){
 const {rows,more}=bounded(snapshot.docs);
 const counts={live:0,test:0,unknown:0};
 const entries=rows.map(doc=>{
 const d=doc.data();const environment=scope(d);counts[environment]++;
 const readyAt=millis(d.readyAt);
 return {environment,attempts:count(d.attempts),readyAt,
 ageMs:kind==='due'&&readyAt!==null?Math.max(0,now-readyAt):null};
 });
 return {sampleSize:entries.length,more,counts,entries};
}
export async function readOperations({db,now=Date.now(),environment='unknown'}){
 const jobs=await Promise.all(OPS_JOBS.map(async id=>({id,...await section(async()=>{
 const snap=await db.collection('_pms_jobs').doc(id).get();
 return {check:projectJob(id,snap.exists?snap.data():null,now)};
 })})));
 const [due,manual,interests]=await Promise.all([
 section(async()=>queueProjection(await db.collection('_pms_notifications').where('readyAt','<=',now).orderBy('readyAt').limit(LIMIT+1).select('sandbox','attempts','readyAt').get(),now,'due')),
 section(async()=>queueProjection(await db.collection('_pms_notifications').where('status','==','manual_review').limit(LIMIT+1).select('sandbox','attempts','readyAt').get(),now,'manual')),
 section(async()=>{
 const snapshot=await db.collection('_plan_interest').orderBy('createdAt','desc').limit(LIMIT+1).select('plan','scope','lang','createdAt','expiresAt').get();
 const {rows,more}=bounded(snapshot.docs);
 return {sampleSize:rows.length,more,entries:rows.map(doc=>{
 const d=doc.data(),expiresAt=millis(d.expiresAt);
 return {plan:['investor','pro','pro_yearly'].includes(d.plan)?d.plan:'unknown',
 environment:['live','test'].includes(d.scope)?d.scope:'unknown',
 language:d.lang==='en'?'en':'it',createdAt:millis(d.createdAt),expiresAt,
 state:expiresAt===null?'unverified':expiresAt<=now?'expired':'recorded'};
 })};
 })
 ]);
 return {schemaVersion:1,observedAt:now,environment:['production','preview','development'].includes(environment)?environment:'unknown',
 policy:{newLiveSalesPaused:LIVE_SALES_PAUSED,trialDays:TRIAL_DAYS,existingRenewalsVerified:false},
 jobs,queues:{due,manual},interests};
}

