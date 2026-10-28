import {loadTourismContext,tourismMunicipality,TOURISM_SOURCE} from './tourism-context.js?v=20261028-rc217';
import {REGIONAL_CAPITALS} from './regional-capitals.js?v=20261026-rc199';
export function mountTourismContext(root){
 let current=null,data=null,generation=0,state='idle';
 const t=(it,en)=>window.currentLang==='en'?en:it;
 const add=(parent,tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;parent.append(n);return n;};
 const number=v=>new Intl.NumberFormat(window.currentLang==='en'?'en-GB':'it-IT').format(v);
 root.className='rb-territorial rb-tourism-context';
 function render(){
  root.replaceChildren();root.hidden=!current;if(!current)return;
  root.setAttribute('aria-label',t('Contesto turistico ISTAT','ISTAT tourism context'));
  add(root,'h2',t('Turismo nel comune · ISTAT 2025','Municipal tourism · ISTAT 2025'));
  if(!REGIONAL_CAPITALS.some(c=>c.istat===current)){add(root,'p',t('Flussi turistici non disponibili in questa selezione: la serie caricata copre i 20 capoluoghi di regione. Nessun dato di un altro comune viene usato.','Tourism flows unavailable for this selection: the loaded series covers the 20 regional capitals. No other municipality is substituted.'));return;}
  if(state==='loading'){add(root,'p',t('Carico i flussi turistici documentati…','Loading documented tourism flows…'));return;}
  if(state==='error'){add(root,'p',t('Flussi turistici temporaneamente non disponibili.','Tourism flows temporarily unavailable.'));const button=add(root,'button',t('Riprova','Retry'));button.type='button';button.onclick=()=>select(current);return;}
  const row=data&&tourismMunicipality(data,current);if(!row)return;
  add(root,'p',row.name+' · '+t('gennaio–dicembre 2025 · tutte le strutture della rilevazione','January–December 2025 · all accommodation in the survey'));
  const stats=add(root,'dl');stats.className='rb-tourism-stats';
  for(const [label,value]of [[t('Arrivi registrati','Registered arrivals'),row.arrivals],[t('Presenze (pernottamenti di persone)','Person-nights'),row.personNights]]){const cell=add(stats,'div');add(cell,'dt',label);add(cell,'dd',number(value));}
  add(root,'p',t('Questi flussi descrivono il comune: aiutano a leggere la distribuzione mensile della domanda registrata, ma non misurano tariffe, camere occupate o rendimento del tuo immobile. Gli arrivi non sono persone uniche.','These flows describe the municipality: they help read the monthly distribution of recorded demand, but do not measure rates, occupied rooms or your property’s return. Arrivals are not unique people.'));
  const warning=add(root,'p',t('Discontinuità 2025: dal 2025 sono inclusi gli alloggi privati in affitto non gestiti in forma imprenditoriale. Totali ed extralberghiero non sono confrontabili con gli anni precedenti. Non mostriamo una crescita 2025/2024.','2025 break in series: from 2025 privately rented accommodation not managed as a business is included. Totals and non-hotel accommodation are not comparable with prior years. No 2025/2024 growth is shown.'));warning.className='rb-tourism-warning';
  const details=add(root,'details');add(details,'summary',t('Dettaglio mensile, fonte e limiti','Monthly detail, source and limitations'));
  const table=add(details,'table');table.className='rb-tourism-table';add(table,'caption',t('Flussi mensili · ','Monthly flows · ')+row.name+' · 2025');
  const tr=add(add(table,'thead'),'tr');for(const label of [t('Mese','Month'),t('Arrivi','Arrivals'),t('Presenze','Person-nights')]){const th=add(tr,'th',label);th.scope='col';}
  const body=add(table,'tbody');for(const m of row.months){const line=add(body,'tr');const th=add(line,'th',new Intl.DateTimeFormat(window.currentLang==='en'?'en-GB':'it-IT',{month:'short',timeZone:'UTC'}).format(new Date(Date.UTC(2025,m.month-1,1))));th.scope='row';add(line,'td',number(m.arrivals));add(line,'td',number(m.personNights));}
  add(details,'p',t('Le presenze sono pernottamenti di persone, non camere-notti. I valori mensili riconciliano con i totali annuali della fonte. Non costituiscono una previsione e non vengono applicati al simulatore.','Person-nights are overnight stays by people, not room-nights. Monthly values reconcile with the source’s annual totals. They are not a forecast and are not applied to the simulator.'));
  add(details,'p',t('Fonte: ISTAT · Movimento dei clienti negli esercizi ricettivi · CC BY 4.0. Acquisizione del file: ','Source: ISTAT · Occupancy in collective accommodation · CC BY 4.0. File acquired: ')+data.acquiredAt+t('. Il periodo osservato è il 2025; non sono dati in tempo reale. Gli aggiornamenti richiedono controllo e revisione.','. The observation period is 2025; these are not real-time data. Updates require checks and review.'));
  add(details,'p',t('Codice ISTAT della fonte: ','Source ISTAT code: ')+row.sourceIstat+(row.sourceIstat!==row.istat?t(' · codice attuale: ',' · current code: ')+row.istat:'')+t(' · righe annuale/mensile: ',' · annual/monthly source rows: ')+row.annualSourceRow+'/'+row.monthlySourceRow+'.');
  for(const [label,url]of [[t('Archivio originale ISTAT (ZIP)','Original ISTAT archive (ZIP)'),TOURISM_SOURCE],[t('Licenza e attribuzione ISTAT','ISTAT licence and attribution'),'https://www.istat.it/dati/open-data/'],[t('Dati e provenienza usati qui (JSON)','Data and provenance used here (JSON)'),'/data/tourism/istat-capitals-2025.json']]){const p=add(details,'p');const a=add(p,'a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';}
  if(row.sourceIstat!==row.istat){const a=add(details,'a',t('Raccordo ufficiale dei codici della Sardegna','Official Sardinia code crosswalk'));a.href=data.crosswalk.sourceURL;a.target='_blank';a.rel='noopener noreferrer';}
 }
 async function select(istat){
  const run=++generation;current=istat||null;state=data?'ready':'loading';render();
  if(!current||!REGIONAL_CAPITALS.some(c=>c.istat===current)||data)return;
  try{const result=await loadTourismContext();if(run!==generation)return;data=result;state='ready';}catch{if(run!==generation)return;state='error';}render();
 }
 render();
 return {select,render};
}
