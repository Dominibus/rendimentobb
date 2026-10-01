import {auth,db} from './firebase-init.js';
import {onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import {collection,getDocs,query,orderBy,limit} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
import {leadType,operationalLead,leadTime,selectLeads,leadCSV} from './admin-lead-model.js';
const $=id=>document.getElementById(id);
const t=(it,en)=>window.currentLang==='en'?en:it;
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=value=>new Intl.NumberFormat(window.currentLang==='en'?'en-GB':'it-IT',{style:'currency',currency:'EUR',useGrouping:true}).format(Number(value)||0);
const isAdmin=user=>!!user&&(String(user.email||'').toLowerCase()==='rendimentobb@gmail.com'||window.getUserAccess?.().isAdmin);
const statuses={new:['Nuovo','New'],contacted:['Contattato','Contacted'],qualified:['Qualificato','Qualified'],won:['Convertito','Converted'],lost:['Non interessato','Not interested'],archived:['Archiviato','Archived']};
let leads=[],category='all',page=1,pageSize=20,loading=false,selectedId=null,refreshTimer=null;
const selection=()=>selectLeads(leads,{category,search:$('lead-search').value,status:$('lead-status-filter').value,sort:$('lead-sort').value});
function message(value){$('lead-feedback').textContent=value;}
function reset(){leads=[];selectedId=null;clearInterval(refreshTimer);refreshTimer=null;$('lead-details').close();$('leadList').replaceChildren();renderKPI();message(t('Accesso riservato all’amministratore.','Administrator access required.'));}
async function load(){
 if(loading||!isAdmin(auth.currentUser))return;
 loading=true;$('lead-refresh').disabled=true;const owner=auth.currentUser.uid;
 try{
  const snap=await getDocs(query(collection(db,'leads'),orderBy('createdAt','desc'),limit(150)));
  if(auth.currentUser?.uid!==owner||!isAdmin(auth.currentUser))return;
  leads=snap.docs.map(item=>({...item.data(),id:item.id}));render();
  message(t(`Aggiornato alle ${new Date().toLocaleTimeString('it-IT')} · ultimi ${leads.length} record caricati (massimo 150).`,`Updated at ${new Date().toLocaleTimeString('en-GB')} · latest ${leads.length} loaded records (maximum 150).`));
 }catch{message(t('Impossibile caricare i lead. Premi Aggiorna per riprovare.','Unable to load leads. Select Refresh to retry.'));}
 finally{loading=false;$('lead-refresh').disabled=false;}
}
function renderKPI(){
 const financial=leads.filter(l=>!operationalLead(l));const sum=financial.reduce((n,l)=>n+(Number(l.value)||0),0);
 $('totalLeads').textContent=leads.length;$('totalValue').textContent=money(sum);$('avgValue').textContent=money(financial.length?sum/financial.length:0);$('hotLeads').textContent=financial.filter(l=>['extreme','hot'].includes(l.score)).length;
 const cities=new Map();financial.forEach(l=>{const city=String(l.city||'—');cities.set(city,(cities.get(city)||0)+1);});$('topCity').textContent=[...cities].sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';
}
function render(){
 renderKPI();const filtered=selection();const pages=Math.max(1,Math.ceil(filtered.length/pageSize));page=Math.min(page,pages);
 const visible=filtered.slice((page-1)*pageSize,page*pageSize);
 $('leadList').innerHTML=visible.map(l=>{
  const type=leadType(l),status=l.status||'new',email=String(l.email||'');
  const badge=operationalLead(l)?type:String(l.score||'cold');
  return `<article class="lead-row"><div class="lead-main"><button type="button" class="lead-detail-link" data-detail="${escape(l.id)}">${escape(email||t('Email assente','Missing email'))}</button><p>${escape(l.name||l.city||'—')} · ${escape(type)} · ${escape(l.lastSource||l.source||'—')}</p><p>${leadTime(l)?escape(new Date(leadTime(l)).toLocaleString(window.currentLang==='en'?'en-GB':'it-IT')):'—'}</p></div><div class="lead-side"><span class="lead-badge">${escape(badge.toUpperCase())}</span><span class="lead-status">${escape(t(...(statuses[status]||[status,status])))}</span>${!operationalLead(l)?`<strong>${money(l.value)}</strong>`:''}<div class="lead-actions"><button type="button" data-copy="${escape(email)}" aria-label="${t('Copia email','Copy email')}">📋</button><a href="mailto:${encodeURIComponent(email)}" aria-label="${t('Contatta lead','Contact lead')}">✉</a><button type="button" data-detail="${escape(l.id)}">${t('Dettagli','Details')}</button></div></div></article>`;
 }).join('')||`<p class="lead-empty">${t('Nessun lead corrisponde ai filtri.','No leads match the filters.')}</p>`;
 $('lead-page-label').textContent=t(`Pagina ${page}/${pages} · ${filtered.length} risultati nei record caricati`,`Page ${page}/${pages} · ${filtered.length} matches in loaded records`);
 $('lead-prev').disabled=page<=1;$('lead-next').disabled=page>=pages;$('lead-export').disabled=!filtered.length;
 document.querySelectorAll('[data-filter]').forEach(button=>{const active=button.dataset.filter===category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
}
function detail(id){
 const lead=leads.find(l=>l.id===id);if(!lead)return;selectedId=id;
 $('lead-detail-title').textContent=lead.email||t('Dettaglio lead','Lead details');
 const rows=[['Nome / azienda',lead.name],['Tipo',leadType(lead)],['Città',operationalLead(lead)&&['partner','career','work','auth'].includes(String(lead.city||'').toLowerCase())?null:lead.city],['Telefono',lead.phone],['Ruolo',lead.role],['Messaggio',lead.message],['Fonte',lead.lastSource||lead.source],['Funnel',(lead.lastFunnel||lead.funnel)==='unknown'?null:(lead.lastFunnel||lead.funnel)],['Lingua',lead.lang],['ROI simulato',lead.roi!=null?`${lead.roi}%`:null],['Prezzo',lead.price!=null?money(lead.price):null],['Capitale proprio',lead.equity!=null?money(lead.equity):null],['Cashflow simulato',lead.profit!=null?money(lead.profit):null],['DSCR',lead.dscr],['Email utente',lead.emailDelivery?.user?.status],['Email admin',lead.emailDelivery?.admin?.status]];
 $('lead-detail-content').innerHTML=`<dl>${rows.filter(([label])=>!operationalLead(lead)||!['ROI simulato','Prezzo','Capitale proprio','Cashflow simulato','DSCR'].includes(label)).map(([label,value])=>`<div><dt>${escape(label)}</dt><dd>${escape(value===null||value===undefined||value===''?'—':value)}</dd></div>`).join('')}</dl><p class="lead-source-note">${t('Importi e ROI sono dati della richiesta o simulazione. Il valore lead è un indice convenzionale interno. “Accepted” indica accettazione del servizio email, non consegna nella casella.','Amounts and ROI belong to the request or simulation. Lead value is an internal index. “Accepted” means the email service accepted the message, not inbox delivery.')}</p>`;
 $('lead-edit-status').value=lead.status||'new';$('lead-edit-notes').value=lead.adminNotes||'';$('lead-detail-feedback').textContent='';$('lead-details').showModal();
}
async function updateLead(method){
 const lead=leads.find(l=>l.id===selectedId),user=auth.currentUser;if(!lead||!isAdmin(user))return;
 if(method==='DELETE'&&!window.confirm(t(`Eliminare definitivamente ${lead.email}?`,`Permanently delete ${lead.email}?`)))return;
 const owner=user.uid;$('lead-save').disabled=true;$('lead-delete').disabled=true;
 try{
  const token=await user.getIdToken();const payload={leadId:lead.id};
  if(method==='PATCH')Object.assign(payload,{status:$('lead-edit-status').value,adminNotes:$('lead-edit-notes').value});
  const response=await fetch('/api/delete-lead',{method,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(payload)});
  if(!response.ok)throw new Error('failed');if(auth.currentUser?.uid!==owner)return;
  if(method==='DELETE'){leads=leads.filter(l=>l.id!==lead.id);$('lead-details').close();}else{Object.assign(lead,payload);$('lead-detail-feedback').textContent=t('Stato e note salvati.','Status and notes saved.');}
  render();
 }catch{$('lead-detail-feedback').textContent=t('Operazione non riuscita. I dati non sono stati aggiornati in questa schermata.','Operation failed. Screen data have not been updated.');}
 finally{$('lead-save').disabled=false;$('lead-delete').disabled=false;}
}
$('leadList').addEventListener('click',async event=>{
 const target=event.target.closest('button');if(!target)return;
 if(target.dataset.detail)detail(target.dataset.detail);
 else if(target.dataset.copy){try{await navigator.clipboard.writeText(target.dataset.copy);message(t('Email copiata.','Email copied.'));}catch{message(t('Copia non riuscita.','Copy failed.'));}}
});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;page=1;render();}));
['lead-search','lead-status-filter','lead-sort'].forEach(id=>$(id).addEventListener(id==='lead-search'?'input':'change',()=>{page=1;render();}));
$('lead-prev').addEventListener('click',()=>{page--;render();});$('lead-next').addEventListener('click',()=>{page++;render();});$('lead-refresh').addEventListener('click',load);
$('lead-close').addEventListener('click',()=>$('lead-details').close());$('lead-save').addEventListener('click',()=>updateLead('PATCH'));$('lead-delete').addEventListener('click',()=>updateLead('DELETE'));
$('lead-export').addEventListener('click',()=>{
 if(!isAdmin(auth.currentUser))return;
 const url=URL.createObjectURL(new Blob([leadCSV(selection())],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='RendimentoBB-leads.csv';link.click();URL.revokeObjectURL(url);
});
function start(user){if(!isAdmin(user)){reset();return;}load();if(!refreshTimer)refreshTimer=setInterval(()=>{if(!document.hidden&&!$('lead-details').open)load();},60000);}
onAuthStateChanged(auth,user=>{if(!user)reset();else if(isAdmin(user))start(user);});
document.addEventListener('rb_auth_ready',event=>start(event.detail?.user));
document.addEventListener('rb_language_changed',()=>{render();if($('lead-details').open) {const id=selectedId,status=$('lead-edit-status').value,notes=$('lead-edit-notes').value;$('lead-details').close();detail(id);$('lead-edit-status').value=status;$('lead-edit-notes').value=notes;}});
