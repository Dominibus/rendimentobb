import crypto from 'node:crypto';
import {buildTaskEmail} from './pms-task-email-template.js';
import {getPlanForScope} from '../js/account-plan.js';

// Resend 3.x forwards RequestInit rather than interpreting idempotencyKey.
// Preserve its Authorization/Content-Type headers while adding provider deduplication.
export function taskSendOptions(client,key){
  const headers=new Headers(client.headers || {});
  headers.set('Idempotency-Key',key);
  return {idempotencyKey:key,headers};
}

const LEASE_MS=5*60*1000;
const SAFE_RETRY_MS=23*60*60*1000;
const MAX_ATTEMPTS=5;
export const urgentNotificationId=(bookingId,issue)=>crypto.createHash('sha256').update([bookingId,issue.category || 'other',issue.priority || 'urgent',issue.note || ''].join('|')).digest('hex');
export const taskNotificationId=(uid,eventId)=>crypto.createHash('sha256').update(`${uid}:${eventId}`).digest('hex');

// The immutable payload makes provider idempotency work even if the booking changes later.
// This function is used inside the SAME transaction that records the booking transition.
export function makeTaskNotification({uid,bookingId,booking,event,propertyName,recipient,lang,sandbox,now,timestamp}){
  const language=lang==='en'?'en':'it';
  const context={guestName:booking.guestName || '',checkin:booking.checkin || '',checkout:booking.checkout || ''};
  const email=buildTaskEmail(context,event,propertyName,language);
  return {queueVersion:1,uid,bookingId,propertyId:booking.propertyId,eventId:event.id,eventCode:event.code,
    eventStatus:event.status,recipient,lang:language,sandbox:sandbox===true,status:'pending',attempts:0,
    readyAt:now,createdAt:timestamp(),updatedAt:timestamp(),
    payload:{from:'RendimentoBB PMS <analisi@rendimentobb.it>',to:[recipient],subject:email.title,html:email.html,text:email.text}};
}

async function finish(db,ref,lease,patch,timestamp){
  return db.runTransaction(async tx=>{
    const snapshot=await tx.get(ref),data=snapshot.data();
    if(!snapshot.exists || data.lease!==lease || data.status!=='sending')return false;
    tx.set(ref,{...data,lease:null,...patch,updatedAt:timestamp()});return true;
  });
}

// Used by both the immediate authenticated email endpoint and the scheduled worker.
export async function dispatchTaskNotification({db,resend,getAuthUser,id,timestamp,now=Date.now(),timeoutMs=10000,scopeSandbox}){
  const ref=db.collection('_pms_notifications').doc(id);
  const lease=crypto.randomUUID();
  const claim=await db.runTransaction(async tx=>{
    const snapshot=await tx.get(ref),data=snapshot.data();
    if(!snapshot.exists || data.queueVersion!==1)return {status:'missing'};
    if(data.status==='sent')return {status:'duplicate'};
    if(typeof scopeSandbox==='boolean' && data.sandbox!==scopeSandbox){
      if(data.readyAt!=null && data.readyAt<=now)tx.set(ref,{...data,readyAt:now+24*60*60*1000,updatedAt:timestamp()});
      return {status:'scope_skipped'};
    }
    if(data.readyAt==null || data.readyAt>now)return {status:data.status==='sending'?'busy':'deferred'};
    // A killed process may have sent the email. Never retry it beyond Resend's safe window.
    if((data.status==='sending' || data.uncertain===true) && Number.isFinite(data.firstAttemptAt) && now-data.firstAttemptAt>=SAFE_RETRY_MS){
      tx.set(ref,{...data,status:'manual_review',readyAt:null,reason:'delivery_uncertain',updatedAt:timestamp()});
      return {status:'manual_review'};
    }
    if((data.attempts || 0)>=MAX_ATTEMPTS){
      tx.set(ref,{...data,status:'manual_review',readyAt:null,reason:'retry_limit',updatedAt:timestamp()});return {status:'manual_review'};
    }
    const next={...data,status:'sending',lease,uncertain:data.uncertain===true || (data.status==='sending' && Number.isFinite(data.firstAttemptAt)),readyAt:now+LEASE_MS,updatedAt:timestamp()};
    tx.set(ref,next);return {status:'claimed',data:next};
  });
  if(claim.status!=='claimed')return claim;
  const data=claim.data;
  const stop=async(reason)=>{await finish(db,ref,lease,{status:'suppressed',readyAt:null,reason},timestamp);return {status:'suppressed',reason};};
  let account,user,booking,property;
  try{
    [account,user,booking,property]=await Promise.all([
      getAuthUser(data.uid),db.collection('users').doc(data.uid).get(),
      db.collection('bookings').doc(data.bookingId).get(),db.collection('properties').doc(data.propertyId).get()
    ]);
  }catch(error){
    if(error?.code==='auth/user-not-found')return stop('account_removed');
    await finish(db,ref,lease,{status:'retry',readyAt:now+15*60*1000,reason:'validation_unavailable'},timestamp);
    return {status:'retry'};
  }
  if(account.disabled || !account.emailVerified || account.email!==data.recipient)return stop('recipient_unavailable');
  const urgent=data.type==='guest_issue_urgent';
  if(!user.exists || (urgent ? user.data()?.notificationPreferences?.pmsUrgentEmail===false : user.data()?.notificationPreferences?.pmsTaskEmail!==true))return stop('preference_disabled');
  const isAdmin=account.emailVerified===true && account.email==='rendimentobb@gmail.com';
  if(!isAdmin && !['investor','pro','pro_yearly'].includes(getPlanForScope(user.data(),data.sandbox)))return stop('plan_required');
  if(!booking.exists || booking.data().uid!==data.uid || !property.exists || property.data().uid!==data.uid || booking.data().propertyId!==data.propertyId)return stop('context_unavailable');
  if(booking.data().status==='cancelled')return stop('booking_cancelled');
  if(urgent){
    const issue=booking.data().guestIssue || {};
    if(issue.active!==true || issue.priority!=='urgent' || issue.status==='resolved' || urgentNotificationId(data.bookingId,issue)!==id)return stop('issue_no_longer_current');
  }
  const expectedId=urgent ? urgentNotificationId(data.bookingId,data.urgentIssue || {}) : taskNotificationId(data.uid,data.eventId);
  if(!data.payload || data.payload.to?.length!==1 || data.payload.to[0]!==data.recipient || expectedId!==id)return stop('invalid_queue_entry');

  const firstAttemptAt=data.firstAttemptAt ?? now;
  const attempts=(data.attempts || 0)+1;
  // Persist attempt metadata before crossing the external provider boundary.
  const stillOwned=await finish(db,ref,lease,{status:'sending',lease,attempts,firstAttemptAt,readyAt:now+LEASE_MS},timestamp);
  if(!stillOwned)return {status:'busy'};
  let timer,result;
  try{
    result=await Promise.race([
      resend.emails.send(data.payload,taskSendOptions(resend,data.type==='guest_issue_urgent'?`rb-pms-${id}`:`rb-task-${id}`)),
      new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('provider_timeout')),timeoutMs);})
    ]);
  }catch{
    await finish(db,ref,lease,{status:'retry',uncertain:true,readyAt:now+LEASE_MS,reason:'delivery_uncertain'},timestamp);
    return {status:'retry',uncertain:true};
  }finally{clearTimeout(timer);}
  if(result?.error){
    const concurrent=['concurrent_idempotent_requests','application_error','internal_server_error'].includes(result.error.name);
    const terminal=attempts>=MAX_ATTEMPTS;
    await finish(db,ref,lease,{status:terminal?'manual_review':'retry',uncertain:data.uncertain===true || concurrent,readyAt:terminal?null:now+15*60*1000,reason:'provider_rejected'},timestamp);
    return {status:terminal?'manual_review':'retry'};
  }
  if(!result?.data?.id){
    await finish(db,ref,lease,{status:'retry',uncertain:true,readyAt:now+LEASE_MS,reason:'delivery_uncertain'},timestamp);
    return {status:'retry',uncertain:true};
  }
  // If this write fails, the sending lease will expire; the same immutable payload/key is used.
  const recorded=await finish(db,ref,lease,{status:'sent',providerId:result.data.id,sentAt:timestamp(),readyAt:null,uncertain:false,reason:null},timestamp);
  return {status:recorded?'sent':'busy'};
}

export async function drainTaskNotifications({db,resend,getAuthUser,timestamp,now=Date.now(),limit=10,clock=Date.now,budgetMs=20000,pause=ms=>new Promise(resolve=>setTimeout(resolve,ms))}){
  const started=clock();
  const snapshot=await db.collection('_pms_notifications').where('readyAt','<=',now).orderBy('readyAt').limit(Math.min(Math.max(limit,1),20)).get();
  const stats={checked:0,sent:0,retry:0,manualReview:0,suppressed:0,errors:0};
  for(const row of snapshot.docs){
    if(clock()-started>=budgetMs)break;
    try{
      const result=await dispatchTaskNotification({db,resend,getAuthUser,id:row.id,timestamp,now,scopeSandbox:false,timeoutMs:Math.min(10000,Math.max(100,budgetMs-(clock()-started)))});
      stats.checked++;
      if(result.status==='sent')stats.sent++;
      if(result.status==='retry')stats.retry++;
      if(result.status==='manual_review')stats.manualReview++;
      if(result.status==='suppressed')stats.suppressed++;
    }catch{stats.errors++;}
    // Keep scheduled sends below the provider's default per-second burst limit.
    if(clock()-started<budgetMs)await pause(600);
  }
  return stats;
}
