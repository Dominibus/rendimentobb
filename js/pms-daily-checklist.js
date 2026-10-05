import {visiblePMSTasks} from './pms-tasks.js';
export function checklistDay(now=Date.now()){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now));
  return ['year','month','day'].map(key=>parts.find(part=>part.type===key).value).join('-');
}
export function checklistGroup(task,today){
  if(task.code==='issue')return 'issues';
  if(!task.dueDate)return 'undated';
  if(task.dueDate<today)return 'overdue';
  if(task.dueDate===today)return 'today';
  return 'upcoming';
}
export function dailyChecklist(bookings,today,filter='daily',search=''){
  const query=search.trim().toLocaleLowerCase();
  return bookings.flatMap(booking=>visiblePMSTasks(booking).map(task=>({...task,propertyName:booking.propertyName || '',group:checklistGroup(task,today)})))
    .filter(task=>(!query || `${task.guestName} ${task.propertyName}`.toLocaleLowerCase().includes(query)) &&
      (filter==='all' || filter==='daily' && ['issues','overdue','today','undated'].includes(task.group) || filter===task.code || filter==='in_progress' && task.status==='in_progress'))
    .sort((a,b)=>(a.priority===0?0:1)-(b.priority===0?0:1) || ['issues','overdue','today','undated','upcoming'].indexOf(a.group)-['issues','overdue','today','undated','upcoming'].indexOf(b.group) || String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999')) || a.priority-b.priority || a.bookingId.localeCompare(b.bookingId));
}
