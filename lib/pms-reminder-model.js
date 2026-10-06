import {buildPMSDailyPlan} from '../js/pms-daily-plan.js';
import {buildBrandedEmail} from './email-templates.js';
export function reminderDays(now){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now));
  const value=type=>parts.find(part=>part.type===type).value;
  const today=`${value('year')}-${value('month')}-${value('day')}`;
  const next=new Date(`${today}T12:00:00Z`);next.setUTCDate(next.getUTCDate()+1);
  return {today,tomorrow:next.toISOString().slice(0,10)};
}
export function selectReminderTasks(bookings,now){
  const {today}=reminderDays(now),plan=buildPMSDailyPlan(bookings,today);
  const directory=new Map(bookings.map(booking=>[booking.id,booking]));
  // Reuse the same saved-data plan as the checklist and chatbot. Guest issues
  // retain their dedicated alerts; undated tasks cannot be a dated reminder.
  return [...plan.items,...plan.preparation].filter(task=>task.code!=='issue' && task.dueDate).map(task=>{
    const booking=directory.get(task.bookingId);
    return {bookingId:task.bookingId,propertyId:booking.propertyId || '',guestName:booking.guestName || '',
      code:task.code,dueDate:task.dueDate,status:task.status,
      fingerprint:task.fingerprint || JSON.stringify([task.code,task.dueDate]),
      period:task.dueDate<today?'overdue':task.dueDate===today?'today':'tomorrow'};
  });
}
export function buildReminderEmail(items,day,lang='it'){
  const en=lang==='en',labels=en?{arrival:'Arrival to register',departure:'Check-out to register',documents:'Guest documents',authority:'Authority communication',tax:'Tourist tax',cleaning:'Cleaning'}:{arrival:'Arrivo da registrare',departure:'Check-out da registrare',documents:'Documenti ospiti',authority:'Comunicazione autorità',tax:'Tassa di soggiorno',cleaning:'Pulizia'};
  const title=en?'PMS reminders · Overdue, today and tomorrow':'Promemoria PMS · Arretrati, oggi e domani';
  const period=item=>item.dueDate<day?(en?'Past due date':'Con data superata'):item.dueDate===day?(en?'Today':'Oggi'):(en?'Tomorrow':'Domani');
  const rows=items.map(item=>[`${period(item)} · ${item.dueDate} · ${labels[item.code]}`,`${item.propertyName} · ${item.guestName} · ${item.status==='in_progress'?(en?'In progress':'In lavorazione'):(en?'To review':'Da verificare')}`]);
  return {title,...buildBrandedEmail({lang,title,intro:en?`Up to 20 open tasks and operations with a date, recorded on ${day} (Europe/Rome). Overdue and today first; tomorrow follows. These are activities, not booking counts.`:`Fino a 20 attività e operazioni aperte con una data, rilevate il ${day} (Europe/Rome). Prima gli arretrati e oggi, poi domani. Sono attività, non conteggi di prenotazioni.`,rows,
    note:en?'Snapshot of saved data: check the PMS before acting. Guest issues use separate alerts; undated tasks remain in the checklist. This email does not register arrivals, submit documents, pay taxes or complete cleaning.':'Riepilogo dei dati salvati: verifica il PMS prima di intervenire. Le segnalazioni ospiti hanno avvisi separati; le attività senza data restano nella checklist. Questa email non registra arrivi, non invia documenti, non paga tasse e non completa le pulizie.',
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
    if(!selectReminderTasks([row],now).some(task=>task.code===item.code && task.fingerprint===item.fingerprint && task.dueDate===item.dueDate && task.status===item.status))return 'reminder_changed';
  }
  return null;
}
