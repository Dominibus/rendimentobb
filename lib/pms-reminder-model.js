import {visiblePMSTasks} from '../js/pms-tasks.js';
import {buildBrandedEmail} from './email-templates.js';
export function reminderDays(now){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now));
  const value=type=>parts.find(part=>part.type===type).value;
  const today=`${value('year')}-${value('month')}-${value('day')}`;
  const next=new Date(`${today}T12:00:00Z`);next.setUTCDate(next.getUTCDate()+1);
  return {today,tomorrow:next.toISOString().slice(0,10)};
}
export function selectReminderTasks(bookings,now){
  const {today,tomorrow}=reminderDays(now),rows=[];
  for(const booking of bookings){
    if(['completed','cancelled','pending'].includes(String(booking.status || 'arrival').toLowerCase()))continue;
    for(const task of visiblePMSTasks(booking)){
      if(task.code==='issue' || !task.dueDate || task.dueDate<today || task.dueDate>tomorrow)continue;
      rows.push({bookingId:booking.id,propertyId:booking.propertyId || '',guestName:booking.guestName || '',
        code:task.code,dueDate:task.dueDate,status:task.status,fingerprint:task.fingerprint});
    }
  }
  return rows.sort((a,b)=>a.dueDate.localeCompare(b.dueDate)||a.bookingId.localeCompare(b.bookingId)||a.code.localeCompare(b.code));
}
export function buildReminderEmail(items,day,lang='it'){
  const en=lang==='en',labels=en?{documents:'Guest documents',authority:'Authority communication',tax:'Tourist tax',cleaning:'Cleaning'}:{documents:'Documenti ospiti',authority:'Comunicazione autorità',tax:'Tassa di soggiorno',cleaning:'Pulizia'};
  const title=en?'PMS reminders · Today and tomorrow':'Promemoria PMS · Oggi e domani';
  const rows=items.map(item=>[`${item.dueDate} · ${labels[item.code]}`,`${item.propertyName} · ${item.guestName} · ${item.status==='in_progress'?(en?'In progress':'In lavorazione'):(en?'To complete':'Da completare')}`]);
  return {title,...buildBrandedEmail({lang,title,intro:en?`Up to 20 upcoming open tasks, recorded on ${day} (Europe/Rome).`:`Fino a 20 attività aperte in scadenza, rilevate il ${day} (Europe/Rome).`,rows,
    note:en?'This is a snapshot of saved booking data. Review the PMS before acting; this email does not submit documents, pay taxes or complete cleaning.':'Riepilogo dei dati salvati: verifica il PMS prima di intervenire. Questa email non invia documenti, non paga tasse e non completa le pulizie.',
    ctaLabel:en?'Open PMS tasks':'Apri attività PMS',ctaURL:'https://rendimentobb.it/dashboard/',eyebrow:'PMS · Autopilot'} )};
}
export async function validateReminderContext(db,data,now){
  if(data.reminderDay!==reminderDays(now).today)return 'reminder_expired';
  if(!Array.isArray(data.reminderItems) || !data.reminderItems.length || data.reminderItems.length>20)return 'invalid_reminder';
  const bookings=new Map(),properties=new Map();
  for(const item of data.reminderItems){
    if(!bookings.has(item.bookingId))bookings.set(item.bookingId,await db.collection('bookings').doc(item.bookingId).get());
    if(!properties.has(item.propertyId))properties.set(item.propertyId,await db.collection('properties').doc(item.propertyId).get());
    const booking=bookings.get(item.bookingId),property=properties.get(item.propertyId);
    if(!booking.exists || booking.data().uid!==data.uid || booking.data().propertyId!==item.propertyId || !property.exists || property.data().uid!==data.uid)return 'context_unavailable';
    const row={...booking.data(),id:item.bookingId};
    if(!selectReminderTasks([row],now).some(task=>task.code===item.code && task.fingerprint===item.fingerprint && task.dueDate===item.dueDate))return 'reminder_changed';
  }
  return null;
}
