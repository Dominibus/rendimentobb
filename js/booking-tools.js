import {bookingExportCSV,selectBookingRows,bookingIdentityHTML} from './booking-export.js?v=20261019-rc152';

// Read-only tools over an account-bound list. No booking write API is called here.
export function installBookingTools({getContext,getSelected,t,download=downloadCSV,copy=text=>navigator.clipboard.writeText(text)}){
 const list=document.getElementById('bookings-list'),search=document.getElementById('booking-search'),exportButton=document.getElementById('booking-export-open'),summary=document.getElementById('booking-export-summary'),feedback=document.getElementById('booking-tools-feedback'),panel=document.getElementById('booking-identity-panel');
 let sequence=0,state={ready:false,ownerUid:null,scope:null,rows:[]},status='all';
 const say=text=>{if(feedback)feedback.textContent=text;};
 const permitted=()=>{const c=getContext();return c.allowed&&c.ready&&c.ownerUid===state.ownerUid&&c.scope===state.scope;};
 const owned=(b,c)=>!!b&&b.uid===c.ownerUid&&c.properties.some(p=>p.id===b.propertyId);
 const selectedRows=()=>selectBookingRows(state.rows,{status,search:search?.value||''});
 function refresh(){
  const ready=state.ready&&permitted(),rows=ready?selectedRows():[],ids=new Set(rows.map(b=>b.id));
  if(exportButton)exportButton.disabled=!rows.length;
  if(summary)summary.textContent=ready?`${rows.length} / ${state.rows.length} ${t('prenotazioni · il CSV segue ricerca e filtro stato, incluse eventuali cancellate.','bookings · CSV follows search and status filter, including any cancellations.')}`:t('Carica le prenotazioni per cercare ed esportare.','Load bookings to search and export.');
  if(search)search.disabled=!ready;
  for(const card of list?.querySelectorAll('.pms-booking-card')||[])card.style.display=ready&&ids.has(card.dataset.bookingId)?'block':'none';
 }
 function renderIdentity(booking=getSelected()){
  if(!panel)return;panel.replaceChildren();panel.hidden=true;
  const c=getContext();if(!c.allowed||!c.ready||!owned(booking,c))return;
  panel.hidden=false;panel.innerHTML=bookingIdentityHTML(booking.id,t);
  if(booking.importReference){const ref=document.createElement('p');ref.className='rb-booking-ref';ref.textContent=t('Riferimento esterno: ','External reference: ')+booking.importReference.reference;panel.append(ref);}
  const note=document.createElement('p');note.textContent=t('Questo ID identifica il soggiorno salvato. Il riferimento del portale, se presente, resta separato. Il CSV contiene i dati salvati, anche se hai modifiche ancora da salvare nel modulo.','This ID identifies the saved stay. Any channel reference stays separate. CSV contains saved data, even when the form has unsaved changes.');panel.append(note);
  const button=document.createElement('button');button.type='button';button.className='rb-import-open';button.dataset.exportBooking='true';button.textContent=t('Scarica CSV di questa prenotazione','Download this booking CSV');panel.append(button);
  const result=document.createElement('p');result.dataset.identityFeedback='true';result.setAttribute('role','status');panel.append(result);
 }
 function exportRows(rows){
  const c=getContext();if(!c.allowed||!c.ready)throw Error('EXPORT_NOT_READY');
  const lang=window.currentLang==='en'?'en':'it';
  const csv=bookingExportCSV(rows,{ownerUid:c.ownerUid,properties:c.properties,lang});
  download(csv,`RendimentoBB-${lang==='it'?'Prenotazioni':'Bookings'}-${rows.length===1?rows[0].id:new Date().toISOString().slice(0,10)}-${lang.toUpperCase()}.csv`);
 }
 const fail=()=>t('Esportazione non disponibile. Attendi il caricamento o riapri le prenotazioni del tuo account.','Export unavailable. Wait for loading or reopen bookings for your account.');
 if(search)search.addEventListener('input',()=>{say('');refresh();});
 if(exportButton)exportButton.addEventListener('click',()=>{
  try{if(!state.ready||!permitted())throw Error();exportRows(selectedRows());say(t('CSV scaricato: una riga per prenotazione salvata.','CSV downloaded: one row per saved booking.'));}catch{say(fail());refresh();}
 });
 async function onClick(event){
  const button=event.target.closest('button[data-copy-booking-id],button[data-export-booking]');if(!button)return;
  event.stopPropagation();const c=getContext(),current=getSelected(),feedbackNode=panel?.querySelector('[data-identity-feedback]');
  const report=text=>{if(panel?.contains(button)&&feedbackNode)feedbackNode.textContent=text;else say(text);};
  const booking=button.dataset.copyBookingId?(state.ready&&permitted()?state.rows.find(b=>b.id===button.dataset.copyBookingId):null)||current:current;
  if(!c.allowed||!c.ready||!owned(booking,c)||(button.dataset.copyBookingId&&booking.id!==button.dataset.copyBookingId)){report(fail());return;}
  if(button.dataset.exportBooking){try{exportRows([booking]);report(t('CSV della prenotazione scaricato.','Booking CSV downloaded.'));}catch{report(fail());}return;}
  const owner=c.ownerUid;
  try{await copy(booking.id);if(getContext().ownerUid===owner)report(t('ID copiato.','ID copied.'));}
  catch{if(getContext().ownerUid!==owner)return;report(t('Copia automatica non disponibile: seleziona il codice ID e copialo manualmente.','Automatic copy unavailable: select the ID code and copy it manually.'));}
 }
 list?.addEventListener('click',onClick);panel?.addEventListener('click',onClick);
 const reset=()=>{sequence++;state={ready:false,ownerUid:null,scope:null,rows:[]};status='all';if(search)search.value='';say('');renderIdentity(null);refresh();};
 document.addEventListener('rb_auth_ready',reset);
 document.addEventListener('rb_language_changed',()=>{say('');renderIdentity();refresh();});
 window.addEventListener('rb_pms_data_updated',()=>{renderIdentity();refresh();});
 refresh();
 return {
  beginLoad(scope){reset();state.scope=scope;state.ownerUid=getContext().ownerUid;for(const b of document.querySelectorAll('.booking-filter'))b.classList.toggle('active',b.dataset.filter==='all');return {sequence,scope,ownerUid:state.ownerUid};},
  isCurrentLoad(token){return token.sequence===sequence&&token.ownerUid===getContext().ownerUid&&token.scope===getContext().scope;},
  endLoad(token,rows){if(!this.isCurrentLoad(token))return false;state={ready:true,ownerUid:token.ownerUid,scope:token.scope,rows};refresh();return true;},
  filter(value){status=value;refresh();},renderIdentity,reset
 };
}
function downloadCSV(csv,name){
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
