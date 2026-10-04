import crypto from 'node:crypto';
import {buildBrandedEmail,sendCheckedEmail} from './email-templates.js';
export function buildTaskEmail(booking,event,propertyName,lang){
  const en=lang==='en';
  const labels={documents:en?'Guest documents':'Documenti ospiti',authority:en?'Authority report':'Comunicazione autorità',tax:en?'Tourist tax':'Tassa di soggiorno',cleaning:en?'Cleaning':'Pulizia',issue:en?'Guest issue':'Segnalazione ospite'};
  const parsed=new Date(event.at);
  const recordedAt=Number.isFinite(parsed.getTime())?new Intl.DateTimeFormat(en?'en-GB':'it-IT',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Rome'}).format(parsed)+' · Europe/Rome':event.at;
  const title=event.status==='in_progress'?(en?'PMS task taken in charge':'Attività PMS presa in carico'):(en?'PMS task resolved':'Attività PMS risolta');
  return {title,...buildBrandedEmail({lang,title,eyebrow:'PMS · Autopilot',intro:en?'An operational update has been recorded in your booking.':'È stato registrato un aggiornamento operativo nella tua prenotazione.',rows:[[en?'Property':'Immobile',propertyName || '—'],[en?'Guest':'Ospite',booking.guestName || '—'],[en?'Task':'Attività',labels[event.code] || event.code],[en?'Recorded by':'Registrato da',event.actor?.name || event.actor?.email || '—'],[en?'Recorded at':'Registrato il',recordedAt],[en?'Stay':'Soggiorno',`${booking.checkin} → ${booking.checkout}`]],ctaLabel:en?'Open bookings':'Apri prenotazioni',ctaURL:'https://rendimentobb.it/dashboard/',note:event.status==='in_progress'?(en?'Taking charge records ongoing work. The task remains open until its booking data are resolved.':'La presa in carico registra la lavorazione. L’attività resta aperta fino alla risoluzione dei dati nella prenotazione.'):(en?'Resolution reflects the details saved in the booking; it does not independently verify external submissions or payments.':'La risoluzione deriva dai dati salvati nella prenotazione; non verifica autonomamente invii esterni o pagamenti.')})};
}
export async function sendTaskUpdates({db,resend,decoded,body,timestamp,now=Date.now()}){
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
    const hash=crypto.createHash('sha256').update(`${decoded.uid}:${event.id}`).digest('hex');
    const ref=db.collection('_pms_notifications').doc(hash);
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
