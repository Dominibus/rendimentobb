import {reportCatalogue,provenanceLabel,integratedReport,reportPeriod} from './report-provenance.js?v=20261016-rc139';
import {renderPMSOperationalPDF} from './pms-operational-report.js?v=20261016-rc139';

export function mountReportIntegration({context,ownerUid,analysisId,allowed,onChoicesChanged}){
 const catalogue=reportCatalogue(context,ownerUid),entry=catalogue.find(e=>e.id===analysisId);
 const host=document.createElement('section');host.id='report-provenance';host.style.cssText='margin:20px 0;padding:22px;border:1px solid #bbded2;border-radius:16px;background:#f0fdf8;color:#0f172a;';
 const root=document.querySelector('.report');if(!root||!allowed())throw Error('REPORT_ACCESS_CHANGED');root.prepend(host);
 const make=(parent,tag,value)=>{const e=document.createElement(tag);if(value!==undefined)e.textContent=value;parent.appendChild(e);return e;};
 const title=make(host,'h2'),origin=make(host,'p'),explain=make(host,'p');
 const controls=make(host,'div');controls.style.cssText='display:flex;flex-wrap:wrap;gap:14px;margin:16px 0;';
 const labels=[];
 const field=(id,it,en,tag='select',type)=>{const wrap=make(controls,'div'),label=make(wrap,'label');label.htmlFor=id;labels.push([label,it,en]);const input=make(wrap,tag);input.id=id;if(type)input.type=type;input.style.cssText='display:block;padding:10px;margin-top:5px;max-width:100%;';return input;};
 const choice=(s,v,it,en)=>{const o=make(s,'option',it);o.value=v;labels.push([o,it,en]);};
 const filter=field('report-analysis-filter','Mostra analisi','Show analyses');
 choice(filter,'all','Tutte le analisi','All analyses');choice(filter,'portfolio','Nel portfolio','In portfolio');choice(filter,'linked','Collegate al PMS','Linked to PMS');choice(filter,'scenario','Solo simulazioni','Simulations only');
 const mode=field('report-period-mode','Periodo dei dati PMS','PMS reporting period');
 choice(mode,'month','Mensile','Monthly');choice(mode,'quarter','Trimestrale','Quarterly');choice(mode,'year','Annuale','Annual');choice(mode,'custom','Personalizzato','Custom');
 const month=field('report-period-month','Mese di riferimento','Reference month','input','month');
 const now=new Date(context?.generatedAt||Date.now()),previous=new Date(now.getFullYear(),now.getMonth()-1,1);month.value=previous.getFullYear()+'-'+String(previous.getMonth()+1).padStart(2,'0');
 const from=field('report-period-from','Dal, incluso','From, inclusive','input','date'),to=field('report-period-to','Al, incluso','To, inclusive','input','date');
 const checkLabel=make(host,'label');checkLabel.style.cssText='display:flex;align-items:center;gap:10px;margin:16px 0;cursor:pointer;';const includeAll=make(checkLabel,'input');includeAll.type='checkbox';includeAll.id='report-include-account';includeAll.style.cssText='width:18px!important;height:18px!important;min-width:18px;max-width:18px;flex:0 0 18px;display:inline-block!important;margin:0!important;padding:0!important;accent-color:#059669;';const checkText=make(checkLabel,'span');labels.push([checkText,' Includi tutte le proprietà PMS, non solo l’immobile selezionato',' Include all PMS properties, not only the selected property']);
 const selector=document.getElementById('simulationSelector');
 if(selector){
  const selectorLabel=make(host,'label');selectorLabel.htmlFor='simulationSelector';labels.push([selectorLabel,'Scegli l’analisi da aprire','Choose the analysis to open']);
  host.appendChild(selector);selector.style.cssText='display:block;width:100%;box-sizing:border-box;max-width:100%;padding:12px;margin:6px 0 16px;border:1px solid #94a3b8;border-radius:10px;font:inherit;background:white;color:#0f172a;';
 }
 const actions=make(host,'div');actions.style.cssText='display:flex;flex-wrap:wrap;gap:12px;margin:16px 0;';
 const show=make(actions,'button');show.type='button';show.id='report-view-results';labels.push([show,'Visualizza risultati PMS ↓','View PMS results ↓']);
 const download=make(actions,'button');download.type='button';download.id='report-download-top';labels.push([download,'Scarica questo report PDF','Download this PDF report']);
 for(const button of [show,download])button.style.cssText='padding:12px 18px;border:0;border-radius:10px;background:#047857;color:white;font:inherit;font-weight:600;cursor:pointer;';
 const feedback=make(host,'p');feedback.id='report-scope-feedback';feedback.setAttribute?.('role','status');feedback.setAttribute?.('aria-live','polite');feedback.style.cssText='padding:12px;background:white;border-left:4px solid #059669;border-radius:6px;font-weight:600;';
 const selectionNote=make(host,'p');selectionNote.style.fontSize='13px';
 const prefs=context?.preferences||{};
 for(const [input,key] of [[filter,'filter'],[mode,'mode'],[month,'month'],[from,'from'],[to,'to']])if(typeof prefs[key]==='string')input.value=prefs[key];
 includeAll.checked=prefs.includeAll===true;
 const state={lang:'it'};
 const output=document.getElementById('operational-report');
 if(output)output.style.scrollMarginTop='120px';
 show.onclick=()=>{if(allowed())output?.scrollIntoView?.({behavior:'smooth',block:'start'});};
 download.onclick=()=>{if(allowed()&&(!selector||selector.value!==''))window.generatePDF?.();};
 const period=()=>{const [year,m]=month.value.split('-').map(Number);return reportPeriod({mode:mode.value,month:month.value,year,quarter:Math.ceil(m/3),start:from.value,end:to.value});};
 function reports(){
  if(!allowed())throw Error('REPORT_ACCESS_CHANGED');
  if(!entry)return [];
  const p=period(),all=[];
  const linked=integratedReport(context,{ownerUid,analysisId,period:p,lang:state.lang});
  // A single operating section: choosing the account overview replaces the
  // individual-property section, so the same bookings and works appear once.
  if(includeAll.checked&&(!linked||context.snapshot.propertyList.length>1))all.push(integratedReport(context,{ownerUid,analysisId,period:p,portfolio:true,lang:state.lang}));
  else if(linked)all.push(linked);
  return all;
 }
 const visible=sim=>{const e=catalogue.find(e=>e.id===sim.id);return filter.value==='all'||filter.value==='portfolio'&&e?.isPortfolio||filter.value==='linked'&&e?.linkState==='linked'||filter.value==='scenario'&&e&&!e.isPortfolio;};
 function render(lang=state.lang){
  state.lang=lang;const t=(it,en)=>lang==='en'?en:it;
  if(!allowed()){host.remove();if(output)output.replaceChildren();return;}
  const needsSelection=!!selector&&selector.value==='';download.disabled=needsSelection;show.disabled=needsSelection;
  feedback.textContent=needsSelection?t('Seleziona un’analisi nel menu qui sopra per aprire il documento desiderato.','Select an analysis in the menu above to open the required document.'):includeAll.checked?t('Ambito attivo: tutte le proprietà PMS. Il PDF include anche gli altri immobili.','Active scope: all PMS properties. The PDF also includes the other properties.'):entry?.linkState==='linked'?t('Ambito attivo: solo ','Active scope: only ')+entry.name:t('Solo simulazione: nessun dato PMS attribuito a un immobile.','Simulation only: no PMS data attributed to a property.');
  labels.forEach(([el,it,en])=>el.textContent=t(it,en));
  title.textContent=t('Quale analisi stai leggendo','Which analysis you are reading');origin.textContent=provenanceLabel(entry,lang);
  explain.textContent=entry?.linkState==='linked'?t('Le previsioni appartengono a questa analisi. Per impostazione iniziale i dati PMS riguardano solo l’immobile collegato; se scegli tutte le proprietà, l’ambito generale è indicato separatamente.','Forecasts belong to this analysis. By default PMS data covers only the linked property; if you choose all properties, the general scope is labelled separately.'):t('Questa analisi non ha un collegamento PMS verificato. Non attribuiamo alla simulazione i dati dell’intero account. Per collegarla usa Modifica immobile nella dashboard.','This analysis has no verified PMS link. Account-wide data is not attributed to this simulation. Link it using Edit property in the dashboard.');
  selectionNote.textContent=t('Le modifiche al periodo e alla spunta aggiornano subito i risultati più sotto. Premi Visualizza risultati PMS per raggiungerli. Il filtro restringe il menu: scegli un’analisi per cambiare il documento. Le previsioni finanziarie rimangono annue.','Changes to the period and checkbox update the results below immediately. Press View PMS results to reach them. The filter narrows the menu: choose an analysis to change the document. Financial forecasts remain annual.');
  month.parentElement.hidden=mode.value==='custom';from.parentElement.hidden=to.parentElement.hidden=mode.value!=='custom';
  if(!output)return;output.replaceChildren();output.style.display='block';
  if(needsSelection){make(output,'p',t('Scegli prima l’analisi da aprire nei controlli iniziali.','First choose the analysis to open in the controls above.'));return;}
  if(!entry){make(output,'p',t('Origine non disponibile: riapri il report dalla dashboard aggiornata.','Origin unavailable: reopen the report from the updated dashboard.'));return;}
  const num=v=>v===null||v===undefined?t('N/D','N/A'):new Intl.NumberFormat(lang==='en'?'en-GB':'it-IT',{maximumFractionDigits:2}).format(v);
  try{
   const values=reports();
   if(!values.length)make(output,'p',t('Nessun dato PMS attribuito allo scenario. Puoi aggiungere separatamente il riepilogo delle proprietà PMS.','No PMS data is attributed to this scenario. You can separately add the PMS property overview.'));
   for(const r of values){
    make(output,'h2',r.scope==='property'?t('Andamento immobile collegato: ','Linked property performance: ')+r.scopeName:t('Riepilogo separato — tutte le proprietà PMS','Separate overview — all PMS properties'));
    make(output,'p',r.periodLabel+' | '+t('Snapshot: ','Snapshot: ')+new Date(context.generatedAt).toLocaleString(lang==='en'?'en-GB':'it-IT'));
    make(output,'p',t('Ricavi prenotati: ','Booked revenue: ')+num(r.totals.revenue)+' EUR | '+t('Notti: ','Nights: ')+num(r.totals.nights)+' | '+t('Occupazione: ','Occupancy: ')+num(r.totals.occupancy)+'% | ADR '+num(r.totals.adr)+' EUR | RevPAR '+num(r.totals.revpar)+' EUR');
    if(r.performance.includesCurrentOrFuture)make(output,'p',t('Periodo ancora aperto: include prenotazioni future, non è un consuntivo chiuso.','Open period: includes future bookings and is not a closed-period actual.'));
    const wrap=make(output,'div');wrap.style.overflowX='auto';const table=make(wrap,'table');table.style.cssText='width:100%;border-collapse:collapse;margin:16px 0;';
    const head=make(make(table,'thead'),'tr');for(const label of [t('Immobile','Property'),t('Ricavi prenotati','Booked revenue'),t('Quota prevista','Expected allocation'),t('Scostamento','Variance'),t('Analisi collegata','Linked analysis')])make(head,'th',label).style.textAlign='left';
    const body=make(table,'tbody');for(const row of r.performance.rows){const tr=make(body,'tr');for(const v of [row.name,num(row.revenue)+' EUR',num(row.expectedRevenue),row.revenueDeltaPercent===null?t('N/D','N/A'):num(row.revenueDeltaPercent)+'%',row.analysisId||t('Non verificata','Not verified')])make(tr,'td',v).style.cssText='padding:10px 4px;border-bottom:1px solid #dbe5e1;';}
    make(output,'p',t('Confronto su identiche proprietà e giorni. Quota prevista uniforme, senza stagionalità. Una unità disponibile per immobile al giorno; chiusure e completezza del calendario da verificare. Prenotazioni e incassi effettivi sono misure diverse.','Comparison uses the same properties and days. Uniform expected allocation, without seasonality. One available unit per property per day; closures and calendar completeness need verification. Bookings and actual receipts are different measures.'));
    for(const n of r.performance.noticeTexts)make(output,'p',n);
    make(output,'h3',t('Lavori dell’ambito selezionato','Renovations in the selected scope'));
    for(const p of r.renovations)make(output,'p',p.propertyName+' | '+t('Budget: ','Budget: ')+num(p.plannedTotal)+' EUR | '+t('Spese inserite: ','Entered spending: ')+num(p.actualSpent)+' EUR');
    if(!r.renovations.length)make(output,'p',t('Nessun piano registrato per questo ambito.','No plan recorded for this scope.'));
   }
  }catch{make(output,'p',t('Periodo non valido o accesso cambiato. Correggi le date (massimo tre anni) e riprova.','Invalid period or access changed. Correct the dates (maximum three years) and retry.'));}
 }
 for(const input of [mode,month,from,to,includeAll])input.addEventListener('change',()=>render());
 filter.addEventListener('change',()=>{onChoicesChanged();render();});
 function coverLines(lang='it'){
  if(!allowed())throw Error('REPORT_ACCESS_CHANGED');state.lang=lang;
  const t=(it,en)=>lang==='en'?en:it,values=reports();
  return [provenanceLabel(entry,lang),
   t('Ipotesi finanziarie annuali della simulazione selezionata. Non sono il rendimento effettivo del portfolio.','Annual financial assumptions of the selected simulation. They are not the actual portfolio return.'),
   values.length?t('Ambito PMS: ','PMS scope: ')+(values[0].scope==='property'?values[0].scopeName:t('Tutte le proprietà PMS - sezione distinta','All PMS properties - separate section'))+' | '+values[0].periodLabel:t('Nessun dato PMS attribuito: collegamento non verificato.','No PMS data attributed: link not verified.'),
   t('Snapshot: ','Snapshot: ')+(context?.generatedAt||t('Non disponibile','Unavailable'))];
 }
 function appendPDF(doc,lang='it'){
  if(!allowed())throw Error('REPORT_ACCESS_CHANGED');state.lang=lang;
  for(const report of reports())renderPMSOperationalPDF(report,{lang,doc,footer:false});
 }
 render();return {render,visible,coverLines,settings:()=>({filter:filter.value,mode:mode.value,month:month.value,from:from.value,to:to.value,includeAll:includeAll.checked}),label:(sim,lang)=>provenanceLabel(catalogue.find(e=>e.id===sim.id),lang),appendPDF};
}
