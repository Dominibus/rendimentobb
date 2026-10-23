import {createDemoBookings,demoDayState,demoMetrics,demoTasks,demoTax,demoPrice,updateDemoBooking} from './pms-product-demo-model.js?v=20261023-rc188';

const en=document.documentElement.lang==='en';
const t=(it,english)=>en?english:it;
const $=id=>document.getElementById(id);
const money=value=>new Intl.NumberFormat(en?'en-GB':'it-IT',{style:'currency',currency:'EUR'}).format(value);
const date=value=>new Intl.DateTimeFormat(en?'en-GB':'it-IT',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
const guest=b=>t(b.guestName,b.guestName.replace('Ospite','Guest'));
const labels={arrival:t('In arrivo','Arriving'),checkin:'Check-in',checkout:'Check-out',completed:t('Completato','Completed'),cancelled:t('Annullato','Cancelled'),documents:t('Documenti mancanti','Missing documents'),authority:t('Comunicazione autorità','Authority reporting'),tax:t('Tassa da riscuotere','Tax to collect'),cleaning:t('Pulizia da completare','Cleaning to complete'),issue:t('Segnalazione ospite','Guest issue')};
const dayLabels={arrival:t('Arrivo','Arrival'),stay:t('Soggiorno','Stay'),departure:t('Partenza','Departure'),available:t('Libero','Available')};
const groups={issues:t('Segnalazione','Issue'),overdue:t('Arretrata','Overdue'),today:t('Oggi','Today'),undated:t('Senza data','Undated'),upcoming:t('Prossimamente','Upcoming')};
let bookings=createDemoBookings(),selectedId='demo-2';
const selected=()=>bookings.find(b=>b.id===selectedId);
function node(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
function notify(message){$('demo-pms-status').textContent=message;}
function choose(id,code){
 selectedId=id;populate();render();
 if(code){const section=$(code==='authority'||code==='documents'?'demo-documents':`demo-${code}`);if(section)section.open=true;}
 $('demo-editor-title').focus();
 $('demo-editor').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 notify(t('Scheda aperta. Salva le modifiche prima di cambiare prenotazione.','Booking opened. Save changes before selecting another booking.'));
}
function render(){
 const m=demoMetrics(bookings);
 $('demo-revenue').textContent=money(m.revenue);
 $('demo-occupancy').textContent=new Intl.NumberFormat(en?'en-GB':'it-IT',{maximumFractionDigits:1}).format(m.occupancy)+'%';
 $('demo-adr').textContent=money(m.adr);$('demo-revpar').textContent=money(m.revpar);$('demo-tasks').textContent=String(m.tasks);
 const calendar=$('demo-calendar');calendar.replaceChildren();
 for(let i=0;i<3;i++)calendar.append(node('span'));
 for(let day=1;day<=31;day++){
  const iso=`2026-10-${String(day).padStart(2,'0')}`,state=demoDayState(bookings,iso);
  const cell=node(state.bookings.length?'button':'span',String(day),`bb-day ${state.state}`);
  cell.setAttribute('aria-label',`${date(iso)}: ${dayLabels[state.state]}${state.bookings.length?' · '+state.bookings.map(guest).join(', '):''}`);
  if(state.bookings.length){cell.type='button';cell.addEventListener('click',()=>choose(state.bookings[0].id));}
  calendar.append(cell);
 }
 const list=$('demo-bookings');list.replaceChildren();
 for(const booking of bookings){
  const button=node('button',undefined,'rb188-booking');button.type='button';button.setAttribute('aria-pressed',String(booking.id===selectedId));
  button.append(node('strong',guest(booking)),node('span',`${date(booking.checkin)} → ${date(booking.checkout)} · ${labels[booking.status]}`),node('span',money(booking.totalAmount)));
  button.addEventListener('click',()=>choose(booking.id));list.append(button);
 }
 const tasks=demoTasks(bookings,$('demo-task-filter').value);
 $('demo-task-count').textContent=t(`${tasks.length} attività nel filtro selezionato.`,`${tasks.length} tasks in this filter.`);
 const taskList=$('demo-task-list');taskList.replaceChildren();
 if(!tasks.length)taskList.append(node('p',t('Nessuna attività aperta in questo filtro.','No open tasks in this filter.')));
 for(const task of tasks){
  const booking=bookings.find(b=>b.id===task.bookingId),button=node('button',undefined,'rb188-task');button.type='button';
  button.append(node('strong',labels[task.code]),node('span',guest(booking)),node('small',`${groups[task.group]}${task.dueDate?' · '+date(task.dueDate):''}${task.code==='issue'?' · '+t('Priorità alta','High priority'):''}`));
  button.addEventListener('click',()=>choose(task.bookingId,task.code));taskList.append(button);
 }
}
function taxPreview(){
 const input=$('demo-taxable');input.setCustomValidity('');
 try{$('demo-tax-amount').textContent=t('Importo fittizio: ','Fictional amount: ')+money(demoTax(selected(),Number(input.value)));}
 catch{input.setCustomValidity(t('Indica un intero tra zero e il numero di ospiti.','Enter an integer between zero and the guest count.'));$('demo-tax-amount').textContent=input.validationMessage;}
}
function pricePreview(){
 const price=demoPrice(selected(),$('demo-season').value);
 const levels={high:t('alta','high'),medium:t('media','medium'),low:t('bassa','low')};
 $('demo-price-result').textContent=`${t('Stagione','Season')} ${levels[price.level]} · ${money(price.adr)} / ${t('notte','night')} · ${price.nights} ${t('notti','nights')} · ${t('Totale suggerito','Suggested total')}: ${money(price.total)}. ${t('Stagione','Season')} ×${price.seasonFactor.toFixed(2)}; ${t('weekend','weekend')} ×${price.weekendFactor.toFixed(2)}; ${t('durata','length')} ×${price.lengthFactor.toFixed(2)}; ${t('anticipo','lead time')} ×${price.leadFactor.toFixed(2)}.`;
}
function populate(){
 const b=selected();
 $('demo-editor-title').textContent=guest(b);
 $('demo-stay-summary').textContent=`${date(b.checkin)} → ${date(b.checkout)} · ${b.guests} ${t('ospiti','guests')} · ${labels[b.status]}`;
 $('demo-booking-status').value=b.status;$('demo-total').value=String(b.totalAmount);
 $('demo-documents-received').max=String(b.guests);$('demo-documents-received').value=String(b.guestRegistration.documentsReceived);
 $('demo-authority').value=b.guestRegistration.authorityStatus;
 $('demo-taxable').max=String(b.guests);$('demo-taxable').value=String(b.touristTax.taxableGuests??b.guests);
 $('demo-tax-status').value=b.touristTax.status;
 $('demo-cleaning-date').textContent=t('Turnover previsto: ','Scheduled turnover: ')+date(b.cleaning.scheduledDate);
 $('demo-cleaning-status').value=b.cleaning.status;
 $('demo-issue-note').textContent=b.guestIssue.active?t('Manutenzione · priorità alta · controllo climatizzatore.','Maintenance · high priority · check air conditioning.'):t('Nessuna segnalazione associata a questo esempio. Seleziona Ospite demo 2 per provarla.','No issue for this example. Select Guest demo 2 to try it.');
 $('demo-issue-status').disabled=!b.guestIssue.active;$('demo-issue-status').value=b.guestIssue.status??'open';
 $('demo-season').value='auto';taxPreview();pricePreview();
}
$('demo-task-filter').addEventListener('change',render);
$('demo-taxable').addEventListener('input',taxPreview);
$('demo-season').addEventListener('change',pricePreview);
$('demo-price-apply').addEventListener('click',()=>{
 $('demo-total').value=String(demoPrice(selected(),$('demo-season').value).total);
 notify(t('Suggerimento copiato nel modulo. Premi Salva modifiche demo per aggiornare importo e KPI.','Suggestion copied to the form. Save demo changes to update the amount and KPIs.'));
});
$('demo-booking-form').noValidate=true;
$('demo-booking-form').addEventListener('submit',event=>{
 event.preventDefault();
 for(const input of $('demo-booking-form').querySelectorAll('input'))if(!input.checkValidity()){const details=input.closest('details');if(details)details.open=true;}
 if(!$('demo-booking-form').reportValidity())return;
 try{
  const values={status:$('demo-booking-status').value,totalAmount:$('demo-total').value,documentsReceived:$('demo-documents-received').value,authorityStatus:$('demo-authority').value,taxableGuests:$('demo-taxable').value,taxStatus:$('demo-tax-status').value,cleaningStatus:$('demo-cleaning-status').value,issueStatus:$('demo-issue-status').value};
  const updated=updateDemoBooking(selected(),values);bookings=bookings.map(b=>b.id===selectedId?updated:b);render();
  $('demo-stay-summary').textContent=`${date(updated.checkin)} → ${date(updated.checkout)} · ${updated.guests} ${t('ospiti','guests')} · ${labels[updated.status]}`;
  notify(t('Salvato nella demo. Calendario, KPI e attività aggiornati. Nessun dato inviato o salvato sul tuo account.','Saved in the demo. Calendar, KPIs and tasks updated. No data sent or saved to your account.'));
 }catch(error){notify(error.message==='exemption_requires_zero'?t('Per esenzione indica zero ospiti tassabili. Nessuna modifica salvata.','Exemption requires zero taxable guests. No changes saved.'):t('Controlla importi e numero di documenti/ospiti. Nessuna modifica salvata.','Check amounts and document/guest counts. No changes saved.'));}
});
$('demo-reset').addEventListener('click',()=>{bookings=createDemoBookings();selectedId='demo-2';$('demo-task-filter').value='all';populate();render();notify(t('Esempi ripristinati. Tutte le modifiche demo sono state azzerate.','Examples restored. All demo changes have been reset.'));});
populate();render();
