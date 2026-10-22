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
  const counts={overdue:0,today:0,tomorrow:0};
  for(const item of items)counts[item.dueDate<day?'overdue':item.dueDate===day?'today':'tomorrow']++;
  const intro=en
    ? `${items.length} ${items.length===1?'task':'tasks'} to review in this email. Past due date: ${counts.overdue}; today: ${counts.today}; tomorrow: ${counts.tomorrow}. Data recorded on ${day} (Europe/Rome). These are activities, not booking counts.`
    : `${items.length} attività da verificare in questa email. Con data superata: ${counts.overdue}; oggi: ${counts.today}; domani: ${counts.tomorrow}. Dati rilevati il ${day} (Europe/Rome). Sono attività, non conteggi di prenotazioni.`;
  const rows=items.map(item=>[`${period(item)} · ${item.dueDate} · ${labels[item.code]}`,`${item.propertyName} · ${item.guestName} · ${item.status==='in_progress'?(en?'In progress':'In lavorazione'):(en?'To review':'Da verificare')}`]);
  return {title,...buildBrandedEmail({lang,title,intro,rows,
    note:en?'Snapshot of saved data: check the PMS before acting. This email includes up to 20 dated tasks; the full checklist is in the PMS. Guest issues use separate alerts; undated tasks remain in the checklist. This email does not register arrivals, submit documents, pay taxes or complete cleaning.':'Riepilogo dei dati salvati: verifica il PMS prima di intervenire. Questa email include al massimo 20 attività con data; la checklist completa è nel PMS. Le segnalazioni ospiti hanno avvisi separati; le attività senza data restano nella checklist. Questa email non registra arrivi, non invia documenti, non paga tasse e non completa le pulizie.',
    footer:en?'Summary based on the data saved in your account.':'Riepilogo basato sui dati salvati nel tuo account.',
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
