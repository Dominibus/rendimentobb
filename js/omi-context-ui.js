import {loadOMI,omiCapital,exactOMIRow,OMI_SOURCE} from './omi-context.js?v=20261028-rc218';
export function mountOMIContext(root){
 let current=null,data=null,state='idle',generation=0,zone='',type='',condition='';const cache=new Map();
 const t=(it,en)=>window.currentLang==='en'?en:it;
 const add=(parent,tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;parent.append(n);return n;};
 const money=n=>new Intl.NumberFormat(window.currentLang==='en'?'en-GB':'it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(n);
 const stateLabel=v=>({'NORMALE':t('Normale','Normal'),'OTTIMO':t('Ottimo','Excellent'),'SCADENTE':t('Scadente','Poor')})[v]||v;
 const typeLabel=(code,value)=>window.currentLang!=='en'?value:({'20':'Ordinary dwellings','21':'Economy dwellings','19':'High-end dwellings','22':'Local traditional dwellings','1':'Villas','5':'Shops','6':'Offices','18':'Structured offices','9':'Warehouses','10':'Workshops','7':'Typical warehouses','8':'Industrial warehouses','13':'Garages (boxes)','14':'Covered parking spaces','15':'Open parking spaces','16':'Garages','17':'Shopping centres'})[code]||value;
 root.className='rb-territorial rb-omi-context';
 function control(parent,label,choices,value,change){const wrap=add(parent,'label',label),select=add(wrap,'select');const empty=add(select,'option',t('Seleziona…','Select…'));empty.value='';for(const [key,text]of choices){const option=add(select,'option',text);option.value=key;}select.value=value;select.disabled=choices.length===0;select.addEventListener('change',()=>change(select.value));return select;}
 function render(focus){
  root.replaceChildren();root.hidden=!current;if(!current)return;root.setAttribute('aria-label',t('Quotazioni immobiliari OMI','OMI property quotations'));add(root,'h2',t('Valori immobiliari di zona · OMI','Area property values · OMI'));
  if(!omiCapital(current)){add(root,'p',t('Quotazioni OMI non ancora integrate per questo comune. La prima copertura verificata comprende i 20 capoluoghi di regione; non sostituiamo altri comuni.','OMI quotations are not integrated for this municipality yet. The first verified coverage includes the 20 regional capitals; no other municipality is substituted.'));return;}
  if(state==='loading'){add(root,'p',t('Carico le quotazioni OMI documentate…','Loading documented OMI quotations…'));return;}
  if(state==='error'){add(root,'p',t('Quotazioni OMI temporaneamente non disponibili.','OMI quotations temporarily unavailable.'));const retry=add(root,'button',t('Riprova','Retry'));retry.type='button';retry.onclick=()=>select(current);return;}
  if(!data)return;
  add(root,'p',data.municipality.name+' · '+t('1° semestre 2026 (gennaio–giugno)','1st half of 2026 (January–June)'));
  add(root,'p',t('Scegli la zona dell’immobile, la tipologia e lo stato. Gli intervalli OMI sono riferimenti di larga massima: per valutare il singolo immobile occorre una stima professionale.','Choose the property’s area, type and condition. OMI ranges are broad references: valuing an individual property requires a professional appraisal.'));
  const details=add(root,'details');details.open=Boolean(zone);add(details,'summary',t('Consulta le quotazioni per zona','Browse quotations by area'));
  const filters=add(details,'div');filters.className='rb-territorial-filters';
  const zoneSelect=control(filters,t('Zona OMI (da verificare)','OMI area (verify for your property)'),data.zones.map(z=>[z.id,z.code+(z.section?' ['+z.section+']':'')+' · '+z.description]),zone,v=>{zone=v;type='';condition='';render('zone');});zoneSelect.dataset.omiField='zone';
  const candidates=data.rows.filter(r=>r[0]===zone),types=[...new Map(candidates.map(r=>[r[1],typeLabel(r[1],r[2])])).entries()];
  const typeSelect=control(filters,t('Tipologia OMI','OMI property type'),types,type,v=>{type=v;condition='';render('type');});typeSelect.dataset.omiField='type';
  const states=[...new Set(candidates.filter(r=>r[1]===type).map(r=>r[3]))];
  const stateSelect=control(filters,t('Stato / posizione commerciale','Condition / commercial location'),states.map(v=>[v,stateLabel(v)]),condition,v=>{condition=v;render('state');});stateSelect.dataset.omiField='state';
  const row=exactOMIRow(data,zone,type,condition);
  if(row){
   const selectedZone=data.zones.find(z=>z.id===row[0]);add(details,'h3',selectedZone.code+' · '+typeLabel(row[1],row[2])+' · '+stateLabel(row[3]));
   add(details,'p',selectedZone.description);
   const figures=add(details,'div');figures.className='rb-omi-ranges';
   for(const [i,label,unit]of [[5,t('Compravendita','Sale'),t('€/m²','€/m²')],[8,t('Locazione','Rent'),t('€/m² al mese','€/m² per month')]]){
    const box=add(figures,'div');add(box,'h4',label);add(box,'strong',row[i]===null?t('Non disponibile','Unavailable'):money(row[i])+' – '+money(row[i+1]));add(box,'p',unit+(row[i+2]?t(' · superficie ',' · ')+(row[i+2]==='L'?t('lorda (L)','gross floor area (L)'):t('netta (N)','net floor area (N)')):''));
   }
   add(details,'p',t('La locazione OMI non è una tariffa turistica per notte. Verifica la superficie di riferimento: compravendita e locazione possono usare basi diverse. Non calcoliamo medie, prezzi totali o rendimenti da questi intervalli.','OMI rent is not a nightly tourist rate. Check the floor-area basis: sale and rent may use different bases. No averages, total property values or returns are calculated from these ranges.'));
   add(details,'p',row[4]?t('Stato prevalente per questa tipologia nella zona.','Prevailing condition for this property type in the area.'):t('Questo stato non è indicato come prevalente nella zona.','This condition is not marked as prevailing in the area.'));
   if(['5','17'].includes(row[1]))add(details,'p',t('Per negozi e centri commerciali, il giudizio descrive la posizione commerciale, non lo stato conservativo.','For shops and shopping centres, the rating describes commercial location, not property condition.'));
   if(['13','14','15','16'].includes(row[1]))add(details,'p',t('Per box, posti auto e autorimesse lo stato conservativo non distingue significativamente le quotazioni.','For garages and parking spaces, condition does not meaningfully distinguish quotations.'));
   add(details,'p',t('Riga originale VALORI: ','Original VALORI row: ')+row[11]+t(' · riga ZONE: ',' · ZONE row: ')+selectedZone.sourceRow+'.');
  }else add(details,'p',zone&&types.length===0?t('Nessuna quotazione valorizzata per questa zona nella serie.','No valued quotations for this area in this series.'):t('Seleziona tutti e tre i campi per mostrare un intervallo esatto.','Select all three fields to show an exact range.'));
  const method=add(details,'details');add(method,'summary',t('Fonte, periodo e limiti','Source, period and limitations'));
  add(method,'p',t('Fonte: Agenzia Entrate - OMI · CC BY 4.0. Elaborazione del file: 15 ottobre 2026; acquisizione: ','Source: Agenzia Entrate - OMI · CC BY 4.0. File elaborated: 15 October 2026; acquired: ')+data.source.acquiredAt+t('. Il semestre osservato è 2026/1: non sono quotazioni in tempo reale.','. The reference period is 2026/1: these are not real-time quotations.'));
  add(method,'p',t('Gli intervalli rappresentano immobili ordinari. Posizione puntuale, qualità, regolarità urbanistica e catastale, lavori e caratteristiche particolari richiedono verifiche sul caso concreto. La zona OMI va confermata sulla cartografia ufficiale. Nessuna attribuzione automatica della zona dall’indirizzo.','Ranges represent ordinary properties. Exact location, quality, planning and cadastral compliance, works and unusual characteristics require case-specific checks. Confirm the OMI area on official mapping. No area is automatically assigned from an address.'));
  add(method,'p',t('Codici nella fonte: ','Source codes: ')+data.municipality.sourceIstat+' / '+data.municipality.cadastral+t(' · identità ISTAT attuale: ',' · current ISTAT identity: ')+data.municipality.istat+t('. Nessuna modifica alle tue ipotesi o analisi salvate.','. Your assumptions and saved analyses are not modified.'));
  for(const [label,url]of [[t('Forniture dati OMI','OMI data supplies'),OMI_SOURCE],[t('Guida ufficiale OMI','Official OMI guide'),'https://telematici.agenziaentrate.gov.it/pdf/guidaFornitureOMI.pdf'],[t('Cartografia ufficiale GEOPOI','Official GEOPOI mapping'),'https://www1.agenziaentrate.gov.it/servizi/geopoi_omi/index.php'],[t('Scarica dati e provenienza (JSON)','Download data and provenance (JSON)'),'/data/omi/'+data.municipality.key+'.json']]){const p=add(method,'p'),a=add(p,'a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';}
  if(focus)root.querySelector?.('[data-omi-field="'+focus+'"]')?.focus({preventScroll:true});
 }
 async function select(istat){const run=++generation;current=istat||null;zone='';type='';condition='';data=cache.get(current)||null;state=data?'ready':'loading';render();if(!current||!omiCapital(current)||data)return;try{const result=await loadOMI(current);if(run!==generation)return;data=result;cache.set(current,data);state='ready';}catch{if(run!==generation)return;state='error';}render();}
 render();return {select,render};
}
