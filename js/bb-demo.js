// No account SDK, network requests or persistent storage. Reset restores examples.
import {investmentExample,exampleBookings,exampleMetrics,exampleDayOccupied} from './bb-demo-model.js';
const en=document.documentElement.lang==='en';
const t=(it,english)=>en?english:it;
const money=value=>new Intl.NumberFormat(en?'en-GB':'it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value);
const decimal=value=>new Intl.NumberFormat(en?'en-GB':'it-IT',{maximumFractionDigits:1}).format(value);
const put=(id,value)=>{document.getElementById(id).textContent=value;};
const form=document.getElementById('bb-demo-investment');
if(form){
 const calculate=()=>{
  if(!form.reportValidity())return;
  const values=Object.fromEntries(['capital','rate','occupancy','costs'].map(k=>[k,form.elements[k].valueAsNumber]));
  try{
   const result=investmentExample(values);
   put('demo-revenue',money(result.gross));put('demo-operating-costs',money(result.expensesYearly));
   put('demo-cashflow',money(result.netAfterMortgage));put('demo-roi',decimal(result.roi)+'%');
   put('demo-explanation',t('Le ipotesi generano ','Your assumptions produce ')+decimal(365*values.occupancy/100)+t(' notti equivalenti all’anno. Ricavi meno costi operativi = risultato annuo prima di imposte e finanziamento.',' equivalent nights per year. Revenue minus operating costs = annual result before tax and financing.'));
  }catch{put('demo-explanation',t('Controlla i valori inseriti.','Check the values entered.'));}
 };
 form.addEventListener('submit',event=>{event.preventDefault();calculate();});
 document.getElementById('demo-reset').addEventListener('click',()=>{form.reset();calculate();});
 calculate();
}
const calendar=document.getElementById('demo-calendar');
if(calendar){
 let bookings=exampleBookings(),filter='all';
 const list=document.getElementById('demo-bookings');
 function render(){
  const metrics=exampleMetrics(bookings);
  put('demo-revenue',money(metrics.revenue));put('demo-occupancy',decimal(metrics.occupancy)+'%');put('demo-adr',money(metrics.adr));put('demo-tasks',String(metrics.tasks));
  calendar.replaceChildren();
  // October 1, 2026 is Thursday. Monday-first calendar, including placeholders.
  for(let i=0;i<3;i++){const blank=document.createElement('span');blank.setAttribute('aria-hidden','true');calendar.append(blank);}
  for(let day=1;day<=31;day++){
   const stamp='2026-10-'+String(day).padStart(2,'0'),occupied=exampleDayOccupied(bookings,stamp),cell=document.createElement('span');
   cell.className='bb-day'+(occupied?' occupied':'');cell.textContent=String(day);
   cell.setAttribute('aria-label',day+t(' ottobre: ',' October: ')+t(occupied?'occupato':'libero',occupied?'occupied':'available'));calendar.append(cell);
  }
  list.replaceChildren();
  const visible=bookings.filter(b=>filter==='all'||!b.cleaningDone);
  for(const booking of visible){
   const row=document.createElement('article');row.className='bb-booking';
   const title=document.createElement('h3');title.textContent=t('Ospite demo ','Demo guest ')+booking.guest;
   const dates=document.createElement('p');dates.textContent=booking.checkin+' → '+booking.checkout+' · '+money(booking.amount);
   const state=document.createElement('p');state.textContent=booking.cleaningDone?t('Pulizia completata nell’esempio','Cleaning completed in this example'):t('Pulizia da completare nell’esempio','Cleaning pending in this example');
   const button=document.createElement('button');button.type='button';button.className='bb-btn secondary';button.textContent=booking.cleaningDone?t('Riapri attività demo','Reopen demo task'):t('Completa attività demo','Complete demo task');
   button.setAttribute('aria-label',button.textContent+' · '+title.textContent);
   button.addEventListener('click',()=>{booking.cleaningDone=!booking.cleaningDone;render();const next=list.querySelector('button');if(next)next.focus();else document.querySelector('[data-demo-filter="pending"]').focus();put('demo-pms-status',t('Attività aggiornata solo in questa demo.','Task updated only in this demo.'));});
   row.append(title,dates,state,button);list.append(row);
  }
  if(!visible.length){const empty=document.createElement('p');empty.textContent=t('Tutte le attività di esempio sono completate.','All example tasks are complete.');list.append(empty);}
  document.querySelectorAll('[data-demo-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.demoFilter===filter)));
 }
 document.querySelectorAll('[data-demo-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.demoFilter;render();}));
 document.getElementById('demo-reset').addEventListener('click',()=>{bookings=exampleBookings();filter='all';render();put('demo-pms-status',t('Esempio ripristinato.','Example reset.'));});render();
}
