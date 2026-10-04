import {visiblePMSTasks} from './pms-tasks.js';
const escape=value=>String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function taskTrackingHTML(booking,t,lang='it'){
  const labels={documents:t('Documenti ospiti','Guest documents'),authority:t('Comunicazione autorità','Authority report'),tax:t('Tassa di soggiorno','Tourist tax'),cleaning:t('Pulizia','Cleaning'),issue:t('Segnalazione ospite','Guest issue')};
  const live=visiblePMSTasks(booking),resolved=Object.entries(booking.autopilotTasks || {}).filter(([code,state])=>labels[code] && state.status==='resolved' && !live.some(task=>task.code===code)).map(([code,state])=>({...state,code}));
  const tasks=[...live,...resolved];
  const date=value=>{const d=new Date(value);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat(lang==='en'?'en-GB':'it-IT',{dateStyle:'short',timeStyle:'short'}).format(d):'';};
  const lines=tasks.map(task=>{
    const saved=booking.autopilotTasks?.[task.code] || {},isProgress=task.status==='in_progress',isResolved=task.status==='resolved';
    const actor=isResolved?saved.resolvedBy:saved.takenBy,time=isResolved?saved.resolvedAt:saved.takenAt;
    const state=isProgress?t('In lavorazione','In progress'):isResolved?(booking.status==='cancelled'?t('Chiusa per cancellazione','Closed by cancellation'):t('Risolta nei dati salvati','Resolved in saved data')):t('Da gestire','To manage');
    return `<div style="padding:9px 0;border-bottom:1px solid #dce6df;font-size:12px;line-height:1.6;overflow-wrap:anywhere;"><strong>${escape(labels[task.code])}</strong> · <span style="color:${isProgress?'#0369a1':isResolved?'#047857':'#92400e'};font-weight:800;">${escape(state)}</span>${actor?`<br>${escape(t('Registrato da','Recorded by'))}: ${escape(actor.name || actor.email || actor.uid)} · ${escape(date(time))}`:''}</div>`;
  }).join('');
  const history=(booking.autopilotEvents || []).slice(-5).reverse().map(event=>`<div style="font-size:11px;color:#64748b;line-height:1.6;overflow-wrap:anywhere;">${escape(date(event.at))} · ${escape(labels[event.code] || event.code)} · ${escape(event.status==='in_progress'?t('Presa in carico','Taken in charge'):event.status==='resolved'?t('Risolta','Resolved'):t('Da gestire','To manage'))} · ${escape(event.actor?.name || event.actor?.email || event.actor?.uid || '')}</div>`).join('');
  return `<div style="padding:14px;border:1px solid #cddcd2;border-radius:14px;background:#f0f7f3;"><strong style="font-size:14px;color:#142b25;">${escape(t('Gestione attività · Autopilot','Task management · Autopilot'))}</strong><p style="font-size:11px;color:#536960;line-height:1.5;">${escape(t('La presa in carico resta visibile fino alla risoluzione dei dati della prenotazione.','Taking charge remains visible until the booking details are resolved.'))}</p>${lines || `<p>${escape(t('Nessuna attività da gestire','No tasks to manage'))}</p>`}${history?`<div style="margin-top:10px;"><strong style="font-size:11px;">${escape(t('Ultimi aggiornamenti','Recent updates'))}</strong>${history}</div>`:''}</div>`;
}
export function taskProgressBadge(booking,t){
  const live=visiblePMSTasks(booking),count=live.filter(task=>task.status==='in_progress').length;
  const resolved=booking.status==='cancelled'?0:Object.entries(booking.autopilotTasks || {}).filter(([code,state])=>state.status==='resolved' && state.resolvedAt && !live.some(task=>task.code===code)).length;
  if(!count && !resolved)return '';
  const label=count?t(`${count} attività in lavorazione`,`${count} tasks in progress`):t(`${resolved} attività risolte nei dati salvati`,`${resolved} tasks resolved in saved data`);
  return `<div style="margin:10px 0;padding:8px 10px;border:1px solid #bfdbfe;border-radius:10px;background:#eff6ff;color:#0369a1;font-size:12px;font-weight:800;">${escape(label)}</div>`;
}
