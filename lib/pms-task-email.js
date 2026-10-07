import crypto from 'node:crypto';
import {buildBrandedEmail,sendCheckedEmail} from './email-templates.js';
import {buildTaskEmail} from './pms-task-email-template.js';
export {buildTaskEmail} from './pms-task-email-template.js';
import {dispatchTaskNotification,taskNotificationId} from './pms-notification-queue.js';
export async function sendTaskUpdates({db,resend,decoded,body,timestamp,getAuthUser,now=Date.now()}){
  if(!decoded.email_verified) return {success:false,error:'verified_email_required',httpStatus:403};
  if(!/^[A-Za-z0-9_-]{1,128}$/.test(body.bookingId || '') || !Array.isArray(body.eventIds) || body.eventIds.length<1 || body.eventIds.length>5 || body.eventIds.some(id=>typeof id!=='string' || !/^[a-f0-9]{64}\.(documents|authority|tax|cleaning|issue)\.(in_progress|resolved)$/.test(id))) return {success:false,error:'invalid_request',httpStatus:400};
  const snapshot=await db.collection('bookings').doc(body.bookingId).get();
  if(!snapshot.exists) return {success:false,error:'booking_not_found',httpStatus:404};
  const booking=snapshot.data();if(booking.uid!==decoded.uid) return {success:false,error:'forbidden',httpStatus:403};
  const user=await db.collection('users').doc(decoded.uid).get();
  if(user.data()?.notificationPreferences?.pmsTaskEmail!==true) return {success:true,skipped:true,reason:'preference_disabled'};
  const events=[...new Set(body.eventIds)].map(id=>(booking.autopilotEvents || []).find(event=>event.id===id));
  if(events.some(event=>!event)) return {success:false,error:'event_not_found',httpStatus:409};
  const recipient=String(decoded.email || '');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) return {success:false,error:'host_email_unavailable',httpStatus:400};
  const property=booking.propertyId?await db.collection('properties').doc(booking.propertyId).get():null;
  const propertyName=property?.exists && property.data().uid===decoded.uid?property.data().name:'';
  let sent=0,duplicates=0;
  for(const event of events){
    const hash=taskNotificationId(decoded.uid,event.id);
    const ref=db.collection('_pms_notifications').doc(hash);
    const queued=await ref.get();
    if(queued.data()?.queueVersion===1){
      if(typeof getAuthUser!=='function') return {success:false,error:'queue_unavailable',httpStatus:503,sent};
      const outcome=await dispatchTaskNotification({db,resend,getAuthUser,id:hash,timestamp,now});
      if(outcome.status==='sent') sent++;
      else if(outcome.status==='duplicate' || outcome.status==='busy') duplicates++;
      else return {success:true,sent,duplicates,queued:outcome.status==='retry',notificationStatus:outcome.status};
      continue;
    }
    const acquired=await db.runTransaction(async tx=>{
      const old=await tx.get(ref),data=old.exists?old.data():{};
      if(data.status==='sent' || (data.status==='sending' && now-Number(data.lockedAt || 0)<300000))return false;
      tx.set(ref,{uid:decoded.uid,bookingId:body.bookingId,eventId:event.id,status:'sending',lockedAt:now,updatedAt:timestamp()});return true;
    });
    if(!acquired){duplicates++;continue;}
    try{
      const email=buildTaskEmail(booking,event,propertyName,body.lang==='en'?'en':'it');
      const providerId=await sendCheckedEmail(resend,{from:'RendimentoBB PMS <analisi@rendimentobb.it>',to:[recipient],subject:email.title,html:email.html,text:email.text},{idempotencyKey:`rb-task-${hash}`});
      await db.runTransaction(async tx=>{tx.set(ref,{uid:decoded.uid,bookingId:body.bookingId,eventId:event.id,status:'sent',providerId,sentAt:timestamp()});});sent++;
    }catch{
      await db.runTransaction(async tx=>{tx.set(ref,{uid:decoded.uid,bookingId:body.bookingId,eventId:event.id,status:'failed',updatedAt:timestamp()});});
      return {success:false,error:'notification_failed',httpStatus:502,sent};
    }
  }
  return {success:true,sent,duplicates};
}
