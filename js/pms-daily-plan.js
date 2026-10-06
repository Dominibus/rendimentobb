import {dailyChecklist} from './pms-daily-checklist.js';
import {bookingOperations} from './pms-booking-operations.js';
import {calendarDay} from './pms-calendar.js';

// One factual plan for the host centre and the assistant. No mutations or forecasts.
export function buildPMSDailyPlan(bookings=[],today){
  const all=dailyChecklist(bookings,today,'all');
  const tasks=dailyChecklist(bookings,today);
  const operations=bookingOperations(bookings,today);
  const directory=new Map(bookings.map(booking=>[booking.id,booking]));
  const enrich=item=>{
    const booking=directory.get(item.bookingId) || {};
    return {...item,propertyName:booking.propertyName || '',
      missingDocuments:Math.max(0,Number(booking.guests || 0)-Number(booking.guestRegistration?.documentsReceived || 0)),
      cleaningAssignee:booking.cleaning?.assignee || ''};
  };
  const items=[...tasks,...operations].map(enrich).sort((a,b)=>
    (a.priority===0?0:1)-(b.priority===0?0:1) ||
    String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999')) || a.priority-b.priority ||
    a.bookingId.localeCompare(b.bookingId) || a.code.localeCompare(b.code));
  const nextDate=new Date(`${today}T12:00:00Z`);
  nextDate.setUTCDate(nextDate.getUTCDate()+1);
  const tomorrow=nextDate.toISOString().slice(0,10);
  const preparation=all.filter(item=>item.group==='upcoming' && item.dueDate===tomorrow).map(enrich);
  const invalidDates=bookings.filter(booking=>!['cancelled','pending'].includes(booking.status) &&
    (calendarDay(booking.checkin)===null || calendarDay(booking.checkout)===null || booking.checkout<=booking.checkin)).length;
  return {today,tomorrow,tasks,operations,items,preparation,invalidDates,
    counts:{total:items.length,urgent:items.filter(item=>item.code==='issue' && item.priority===0).length,
      overdue:items.filter(item=>item.dueDate && item.dueDate<today).length,
      inProgress:items.filter(item=>item.status==='in_progress').length,
      upcoming:all.filter(item=>item.group==='upcoming').length}};
}
