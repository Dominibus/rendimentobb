import {buildPropertyPerformance,reportPeriod,performanceNotice} from './property-performance.js?v=20261015-rc131';
import {renderPMSOperationalPDF} from './pms-operational-report.js?v=20261015-rc131';
// Native DOM text nodes only. Data never enters HTML or inline handlers.
export function showPropertyPerformance({snapshot,analyses,ownerUid,propertyId='',allowed,lang='it',jsPDF,onEdit,subscribeAuth}){
 if(!allowed())throw Error('REPORT_ACCESS_CHANGED');
 const en=lang==='en',t=(it,eng)=>en?eng:it;
 const num=(v,d=1)=>v===null||v===undefined?t('N/D','N/A'):new Intl.NumberFormat(en?'en-GB':'it-IT',{maximumFractionDigits:d}).format(v);
 const money=v=>v===null||v===undefined?t('N/D','N/A'):num(v,2)+' EUR';
 document.getElementById('property-performance-dialog')?.close();
 const modal=document.createElement('dialog');modal.id='property-performance-dialog';modal.setAttribute('aria-labelledby','property-performance-title');
 modal.style.cssText='border:1px solid #dbe5e1;border-radius:18px;padding:24px;width:min(1080px,94vw);max-height:90vh;overflow:auto;box-sizing:border-box;color:#0f172a;background:#fff;';
 const node=(parent,tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;parent.appendChild(e);return e;};
 const title=node(modal,'h2',t('Andamento immobili e portfolio','Property and portfolio performance'));title.id='property-performance-title';
 const snapshotAt=new Date().toISOString();
 node(modal,'p',t('Prenotazioni registrate e ipotesi della simulazione collegata. Non certifica incassi o utile.','Recorded bookings and linked simulation assumptions. Does not certify receipts or profit.'));
 const controls=node(modal,'div');controls.style.cssText='display:flex;flex-wrap:wrap;gap:12px;align-items:end;margin:18px 0;';
 const field=(label,tag,id)=>{const wrap=node(controls,'div');wrap.style.flex='1 1 145px';const l=node(wrap,'label',label);l.htmlFor=id;const input=node(wrap,tag);input.id=id;input.style.cssText='display:block;width:100%;padding:10px;box-sizing:border-box;margin-top:6px;';return input;};
 const option=(select,value,label)=>{const o=node(select,'option',label);o.value=value;};
 const scope=field(t('Immobile','Property'),'select','performance-scope');option(scope,'',t('Tutto il portfolio','Whole portfolio'));
 for(const p of snapshot.propertyList)option(scope,p.id,p.name+(p.city?' - '+p.city:''));scope.value=propertyId;
 const mode=field(t('Periodo','Period'),'select','performance-mode');
 for(const [v,it,eng] of [['month','Mensile','Monthly'],['quarter','Trimestrale','Quarterly'],['year','Annuale','Annual'],['custom','Personalizzato','Custom']])option(mode,v,t(it,eng));mode.value='month';
 const month=field(t('Mese di riferimento','Reference month'),'input','performance-month');month.type='month';
 const now=new Date(),prior=new Date(now.getFullYear(),now.getMonth()-1,1);month.value=prior.getFullYear()+'-'+String(prior.getMonth()+1).padStart(2,'0');
 const start=field(t('Dal, incluso','From, inclusive'),'input','performance-start');start.type='date';
 const end=field(t('Al, incluso','To, inclusive'),'input','performance-end');end.type='date';
 const run=node(controls,'button',t('Aggiorna analisi','Update analysis'));run.type='button';run.className='btn-dashboard';
 const edit=node(controls,'button',t('Collega / modifica immobile','Link / edit property'));edit.type='button';edit.className='btn-dashboard';
 const pdf=node(controls,'button',t('Scarica PDF','Download PDF'));pdf.type='button';pdf.className='btn-dashboard';
 const csv=node(controls,'button',t('Esporta CSV','Export CSV'));csv.type='button';csv.className='btn-dashboard';
 const close=node(controls,'button',t('Chiudi','Close'));close.type='button';
 const status=node(modal,'p');status.setAttribute('role','status');
 const output=node(modal,'div');let report=null,unsubscribe=()=>{};
 const cleanup=()=>{unsubscribe();document.removeEventListener('rb_auth_ready',onAuth);document.removeEventListener('rb_language_changed',onLanguage);modal.remove();};
 const onAuth=()=>{if(!allowed())modal.close();};const onLanguage=()=>modal.close();
 close.onclick=()=>modal.close();modal.addEventListener('close',cleanup,{once:true});
 document.addEventListener('rb_auth_ready',onAuth);document.addEventListener('rb_language_changed',onLanguage);
 const sync=()=>{const custom=mode.value==='custom';month.parentElement.hidden=custom;start.parentElement.hidden=!custom;end.parentElement.hidden=!custom;};mode.onchange=sync;sync();
 const currentPeriod=()=>{const [year,m]=month.value.split('-').map(Number);return reportPeriod({mode:mode.value,month:month.value,year,quarter:Math.ceil(m/3),start:start.value,end:end.value});};
 function render(){
  report=null;pdf.disabled=true;csv.disabled=true;output.replaceChildren();edit.disabled=!scope.value;
  try{
   if(!allowed())throw Error('REPORT_ACCESS_CHANGED');
   report=buildPropertyPerformance({snapshot,analyses,ownerUid,propertyId:scope.value,period:currentPeriod(),generatedAt:snapshotAt});
   report.performance.noticeTexts=report.performance.rows.flatMap(r=>r.notices.map(n=>r.name+': '+performanceNotice(n,lang)));
   const p=report.performance;status.textContent=t('Snapshot: ','Snapshot: ')+new Date(snapshotAt).toLocaleString(en?'en-GB':'it-IT')+' | '+report.periodLabel;
   if(p.includesCurrentOrFuture)node(output,'p',t('Il periodo comprende oggi o date future: include ricavi prenotati, non un consuntivo chiuso.','This period includes today or future dates: it includes booked revenue, not a closed-period actual.')).style.color='#991b1b';
   node(output,'h3',t('Risultati registrati','Recorded results'));
   const summary=node(output,'p');summary.style.cssText='background:#f0fdf4;padding:16px;border-radius:12px;line-height:1.8;';
   summary.textContent=t('Ricavi da prenotazioni: ','Booking revenue: ')+money(report.totals.revenue)+' | '+t('Occupazione: ','Occupancy: ')+num(report.totals.occupancy)+'% | ADR: '+money(report.totals.adr)+' | RevPAR: '+money(report.totals.revpar);
   node(output,'p',t('Una unità disponibile per immobile, senza sottrarre chiusure non registrate. Ricavi ripartiti sulle notti; cancellazioni e richieste in attesa escluse.','One available unit per property, without subtracting unrecorded closures. Revenue allocated across nights; cancelled and pending bookings excluded.'));
   node(output,'p',t('Incassi, cashflow, ROI e DSCR effettivi: non disponibili senza registrazioni economiche complete. I lavori restano separati dai costi operativi.','Actual receipts, cash flow, ROI and DSCR: unavailable without complete financial records. Renovations remain separate from operating costs.'));
   node(output,'h3',t('Confronto tra proprietà e scenario','Property and scenario comparison'));
   node(output,'p',t('Scostamento ricavi calcolato solo sulle stesse proprietà confrontabili: ','Revenue variance calculated only for the same comparable properties: ')+p.summary.comparable+' / '+p.summary.properties+' | '+(p.summary.deltaPercent===null?t('N/D','N/A'):num(p.summary.deltaPercent)+'%'));
   node(output,'p',t('Quota prevista = ricavo lordo annuo salvato × quota di giorni del periodo. Ipotesi uniforme, senza stagionalità. I ricavi registrati dipendono dalla completezza del calendario.','Expected allocation = saved annual gross revenue × share of period days. Uniform assumption, without seasonality. Recorded revenue depends on calendar completeness.'));
   const wrap=node(output,'div');wrap.style.overflowX='auto';const table=node(wrap,'table');table.style.cssText='width:100%;border-collapse:collapse;font-size:13px;';
   const head=node(node(table,'thead'),'tr');for(const s of [t('Immobile','Property'),t('Ricavi registrati','Recorded revenue'),t('Quota prevista','Expected allocation'),t('Scostamento','Variance'),t('Occupazione registrata / prevista','Recorded / expected occupancy'),t('ADR registrato / previsto','Recorded / expected ADR')]){const th=node(head,'th',s);th.scope='col';th.style.cssText='padding:10px;text-align:left;border-bottom:2px solid #cbd5e1;';}
   const body=node(table,'tbody');
   for(const r of p.rows){const tr=node(body,'tr');for(const v of [r.name,money(r.revenue),money(r.expectedRevenue),r.revenueDeltaPercent===null?t('N/D','N/A'):num(r.revenueDeltaPercent)+'%',num(r.occupancy)+'% / '+(r.expectedOccupancy===null?t('N/D','N/A'):num(r.expectedOccupancy)+'%'),money(r.adr)+' / '+money(r.expectedADR)])node(tr,'td',v).style.cssText='padding:10px;border-bottom:1px solid #e2e8f0;';}
   for(const r of p.rows){node(output,'h4',r.name);if(r.linkState==='linked'){
    node(output,'p',t('Simulazione collegata: ','Linked simulation: ')+r.analysisId);
    node(output,'p',t('Solo stima annua — costi operativi: ','Annual forecast only — operating costs: ')+money(r.forecast.annualCosts)+t('; cashflow: ','; cash flow: ')+money(r.forecast.annualCashflow)+'; ROI: '+(r.forecast.roi===null?t('N/D','N/A'):num(r.forecast.roi)+'%')+'; DSCR: '+num(r.forecast.dscr,2));
    if(r.previousRevenue!==null)node(output,'p',t('Periodo precedente di pari durata: ','Preceding period of equal length: ')+money(r.previousRevenue)+t(' | variazione: ',' | change: ')+(r.previousDeltaPercent===null?t('N/D','N/A'):num(r.previousDeltaPercent)+'%'));
   }
   for(const n of r.notices)node(output,'p',performanceNotice(n,lang));}
   node(output,'h3',t('Andamento mensile dei ricavi registrati','Monthly recorded revenue trend'));
   const maximum=Math.max(1,...p.trend.map(m=>m.revenue));
   for(const m of p.trend){const line=node(output,'div');line.style.margin='10px 0';node(line,'span',m.month+' | '+money(m.revenue)+' | '+num(m.days,0)+t(' giorni',' days')+(m.incomplete?t(' | dati incompleti',' | incomplete data'):''));const bar=node(line,'div');bar.setAttribute('aria-hidden','true');bar.style.cssText='height:8px;background:#059669;border-radius:4px;max-width:100%;width:'+Math.max(0,m.revenue/maximum*100)+'%;';}
   node(output,'p',t('Mesi parziali o di durata diversa non sono confronti omogenei; verifica i giorni riportati.','Partial months or months of different length are not like-for-like comparisons; check reported days.'));
   if(Object.values(report.warnings).some(Boolean))node(output,'p',t('Sono presenti dati incompleti o anomalie: controlla prezzi, date, sovrapposizioni e prenotazioni senza immobile.','Incomplete records or anomalies exist: check prices, dates, overlaps and bookings without a property.')).style.color='#991b1b';
   pdf.disabled=!jsPDF;csv.disabled=false;
  }catch(error){report=null;status.textContent=t('Analisi non disponibile. Verifica il periodo (massimo 3 anni), i permessi e i dati.','Analysis unavailable. Check the period (maximum 3 years), access and records.');}
 }
 run.onclick=render;scope.onchange=render;month.onchange=render;start.onchange=render;end.onchange=render;mode.onchange=()=>{sync();render();};
 edit.onclick=()=>{if(!allowed()||!scope.value)return;const id=scope.value;modal.close();onEdit?.(id);};
 pdf.onclick=()=>{if(!allowed()||!report)return;const result=renderPMSOperationalPDF(report,{jsPDF,lang});if(!allowed())return;result.save('RendimentoBB-Andamento-'+(report.scope==='property'?'Immobile':'Portfolio')+'-'+report.period.start+'.pdf');};
 csv.onclick=()=>{
  if(!allowed()||!report)return;
  const safe=v=>{let s=String(v??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
  const data=[['property_id','property','period_start_inclusive','period_end_exclusive','recorded_booking_revenue_eur','expected_revenue_eur','revenue_delta_percent','booked_nights','occupancy_percent','adr_eur','link_status','missing_amounts','overlap_nights'],...report.performance.rows.map(r=>[r.id,r.name,report.period.start,report.period.end,r.revenue,r.expectedRevenue,r.revenueDeltaPercent,r.nights,r.occupancy,r.adr,r.linkState,r.missingPeriodAmounts,r.overlapNights])];
  const blob=new Blob(['\uFEFF'+data.map(r=>r.map(safe).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='RendimentoBB-Andamento-'+report.period.start+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 document.body.appendChild(modal);modal.showModal();
 if(subscribeAuth)unsubscribe=subscribeAuth(onAuth);render();return modal;
}
