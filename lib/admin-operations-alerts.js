import {controlSummary} from '../js/admin-control-model.js';
import {readOperations} from './admin-operations.js';
import {buildBrandedEmail,sendCheckedEmail} from './email-templates.js';
// One attempt per UTC day, serialized by a server-side transaction. No recipients from requests.
export async function notifyAdminOperations({db,resend,now=Date.now(),env=process.env,read=readOperations}){
 if(env.ADMIN_OPS_ALERTS_ENABLED!=='true'||env.VERCEL_ENV!=='production')return {state:'disabled'};
 const data=await read({db,now,environment:'production'}),summary=controlSummary(data,now);
 if(!summary.issues.length&&!summary.gaps.length)return {state:'quiet'};
 const day=new Date(now).toISOString().slice(0,10),ref=db.collection('_pms_jobs').doc('admin_operations_alert');
 const claimed=await db.runTransaction(async tx=>{
  const snap=await tx.get(ref);
  if(snap.data()?.day===day)return false;
  tx.set(ref,{day,state:'attempting',attemptedAt:now,issues:summary.issues.length,gaps:summary.gaps.length});return true;
 });
 if(!claimed)return {state:'already_attempted'};
 const rows=[['Segnalazioni operative',summary.issues.length],['Controlli senza evidenza completa',summary.gaps.length],['Lettura UTC',new Date(now).toISOString()]];
 const message=buildBrandedEmail({title:'Controlla il centro operativo RendimentoBB',intro:'Sono presenti segnalazioni o controlli da verificare. Gli esiti dei job possono includere test; non certificano un disservizio per utenti reali.',rows,note:'Riepilogo massimo una volta al giorno, dopo il cron. Non rileva il fermo del cron stesso. I conteggi delle code sono campioni limitati. Nessuna correzione automatica è stata eseguita.',ctaLabel:'Apri il centro operativo',ctaURL:'https://www.rendimentobb.it/dashboard-leads/'});
 try{
  await sendCheckedEmail(resend,{from:'RendimentoBB <analisi@rendimentobb.it>',to:['rendimentobb@gmail.com'],subject:'RendimentoBB · Centro operativo da verificare',...message},{idempotencyKey:`rb-admin-operations-${day}`});
  await ref.set({state:'accepted',acceptedAt:now},{merge:true});return {state:'accepted'};
 }catch{
  // An uncertain send is never automatically replayed that day.
  await ref.set({state:'review_required'},{merge:true});return {state:'review_required'};
 }
}
