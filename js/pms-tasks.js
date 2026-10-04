// Task state follows booking facts; taking charge never resolves the underlying obligation.
import {calendarDay} from './pms-calendar.js';
export function derivePMSTasks(booking = {}){
  if(['cancelled','pending'].includes(String(booking.status || 'arrival').toLowerCase())) return [];
  const tasks=[];
  const add=(code,dueDate,priority,facts)=>tasks.push({code,dueDate:calendarDay(dueDate)!==null?dueDate:'',priority,fingerprint:JSON.stringify(facts)});
  const registration=booking.guestRegistration || {};
  const missing=Math.max(0,Number(booking.guests || 0)-Number(registration.documentsReceived || 0));
  if(missing) add('documents',booking.checkin,1,[booking.checkin,missing]);
  if(!['submitted','not_required'].includes(registration.authorityStatus)) add('authority',booking.checkin,2,[booking.checkin,registration.authorityStatus || 'pending']);
  const tax=booking.touristTax || {};
  if(tax.enabled===true && (tax.status || 'pending')==='pending' && Number(tax.amount)>0) add('tax',tax.collectionTime==='checkout'?booking.checkout:booking.checkin,3,[booking.checkin,booking.checkout,tax.amount,tax.currency,tax.collectionTime]);
  const cleaning=booking.cleaning || {};
  if(cleaning.required!==false && cleaning.status!=='completed') add('cleaning',cleaning.scheduledDate || booking.checkout,4,[booking.checkout,cleaning.scheduledDate || booking.checkout,cleaning.status || 'pending',cleaning.assignee || '']);
  const issue=booking.guestIssue || {};
  if(issue.active===true && issue.status!=='resolved') add('issue',String(issue.reportedAt || '').slice(0,10) || booking.checkin,issue.priority==='urgent'?0:1,[issue.category,issue.priority,issue.status || 'open',issue.note,issue.reportedAt || '']);
  return tasks;
}
export function reconcilePMSTasks(booking,previous={},timestamp){
  const current=derivePMSTasks(booking),next={};
  for(const task of current){
    const old=previous[task.code];
    const same=old?.fingerprint===task.fingerprint && old.status!=='resolved';
    next[task.code]={...(same?old:{}),...task,status:same && old.status==='in_progress'?'in_progress':'open',createdAt:same?old.createdAt ?? timestamp:timestamp,updatedAt:timestamp};
    if(same && old.takenAt) next[task.code].takenAt=old.takenAt;
  }
  for(const [code,old] of Object.entries(previous)){
    if(['documents','authority','tax','cleaning','issue'].includes(code) && !next[code]) next[code]={...old,status:'resolved',updatedAt:old.status==='resolved'?old.updatedAt:timestamp};
  }
  return next;
}
export function visiblePMSTasks(booking){
  return derivePMSTasks(booking).map(task=>{
    const saved=booking.autopilotTasks?.[task.code];
    return {...task,status:saved?.fingerprint===task.fingerprint && saved.status==='in_progress'?'in_progress':'open',bookingId:booking.id,guestName:booking.guestName || ''};
  });
}

export function recordPMSTaskTransitions(previous,next,actor,at,prefix,history=[]){
  const tasks=structuredClone(next),events=[];
  for(const [code,task] of Object.entries(tasks)){
    const old=previous[code];
    if(old?.status===task.status && old.fingerprint===task.fingerprint) continue;
    if(task.status==='resolved' && (!old || old.status==='resolved')) continue;
    if(task.status==='in_progress'){task.takenBy=actor;task.takenAt=at;}
    if(task.status==='open'){delete task.takenBy;delete task.takenAt;delete task.resolvedBy;delete task.resolvedAt;}
    if(task.status==='resolved'){task.resolvedBy=actor;task.resolvedAt=at;}
    events.push({id:`${prefix}.${code}.${task.status}`,code,status:task.status,actor,at,reason:task.status==='resolved'?'booking_updated':task.status==='open' && old?'condition_reopened':'host_action'});
  }
  return {tasks,events,history:[...history,...events].slice(-30)};
}
