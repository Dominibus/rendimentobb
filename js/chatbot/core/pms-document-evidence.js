// Content-based PMS evidence. Operational values never become investment metrics.
(function(){
 'use strict';
 const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
 const heading=/REPORT OPERATIVO PMS|PMS OPERATIONS REPORT|ANDAMENTO IMMOBILI E PORTFOLIO|PROPERTY AND PORTFOLIO PERFORMANCE/i;
 const financial=/REPORT INVESTIMENTO E GESTIONE|INVESTMENT\s*&\s*OPERATIONS REPORT/i;
 function amount(raw){
  if(raw===null||raw===undefined)return null;
  let s=String(raw).replace(/\s/g,'');
  if(s.includes(',')&&s.includes('.'))s=s.lastIndexOf(',')>s.lastIndexOf('.')?s.replace(/\./g,'').replace(',','.'):s.replace(/,/g,'');
  else if(s.includes(','))s=s.replace(',','.');
  const n=Number(s);return s!==''&&Number.isFinite(n)?n:null;
 }
 window.rbReadPMSDocument=function(doc){
  const raw=clean(doc?.extractedText),start=raw.search(heading);if(start<0)return null;
  const text=raw.slice(start),mixed=financial.test(raw.slice(0,start));
  const end=text.search(/Registrazioni - tutti i periodi|Records - all periods|Proprieta - dettaglio del periodo|Properties - period detail/i);
  const main=end<0?text:text.slice(0,end);
  const number='(-?\\d[\\d.,]*)';
  const metric=(labels,suffix='',source=main)=>amount(new RegExp('(?:'+labels+')\\s*:?\\s*'+number+suffix,'i').exec(source)?.[1]??null);
  const scope=/\b(?:Ambito|Scope)\s*:\s*(.+?)(?=\s+(?:Periodo di competenza|Reporting period|Snapshot)\s*:|$)/i.exec(main)?.[1]||null;
  const period=/(?:Periodo di competenza|Reporting period)\s*:\s*(\d{4}-\d{2}(?:-\d{2})?(?:\s*\/\s*\d{4}-\d{2}-\d{2})?)/i.exec(main)?.[1]||null;
  const snapshot=/Snapshot:\s*(\d{2})\/(\d{2})\/(\d{4})/i.exec(main);
  const asOf=snapshot?`${snapshot[3]}-${snapshot[2]}-${snapshot[1]}`:null;
  let periodEnd=period?.split(/\s*\/\s*/).at(-1)||null;
  if(periodEnd&&/^\d{4}-\d{2}$/.test(periodEnd)){const [y,m]=periodEnd.split('-').map(Number);periodEnd=new Date(Date.UTC(y,m,0)).toISOString().slice(0,10);}
  const compared=/(?:Proprieta con collegamento verificato|Properties with a verified link)/i.test(text);
  return {kind:mixed?'integrated':/REPORT OPERATIVO PMS|PMS OPERATIONS REPORT/i.test(text)?'pms_operational':'property_performance',scope,period,
   properties:metric('Proprieta incluse|Properties included'),stays:metric('Soggiorni nel periodo|Stays in the period'),
   revenue:metric('Ricavi attribuiti al periodo|Revenue allocated to the period','\\s*(?:EUR|€)'),nights:metric('Notti prenotate nel periodo|Booked nights in the period'),
   occupancy:metric('Occupazione del periodo|Period occupancy','\\s*%'),adr:metric('\\bADR','\\s*(?:EUR|€)'),revpar:metric('\\bRevPAR','\\s*(?:EUR|€)'),
   comparedRevenue:compared?metric('Ricavi registrati del sottoinsieme|Recorded revenue of compared subset','\\s*(?:EUR|€)',text):null,
   expected:compared?metric('Quota prevista dello stesso sottoinsieme|Expected allocation for the same subset','\\s*(?:EUR|€)',text):null,
   variance:compared?metric('Scostamento dello stesso sottoinsieme|Variance for the same subset','\\s*%',text):null,
   currentOrFuture:/Il periodo include oggi o date future|The period includes today or future dates/i.test(text)||!!(asOf&&periodEnd&&periodEnd>=asOf),
   hasScenario:compared,source:'extracted_pdf_text'};
 };
 window.rbBuildPMSDocumentResponse=function(message,doc){
  if(doc?.status!=='ready')return null;
  const d=window.rbReadPMSDocument(doc);if(!d)return null;
  const q=String(message||'').toLowerCase().replace(/\broy\b/g,'roi');
  if(!/pdf|document|report|roi|cashflow|cash flow|dscr|adr|revpar|occup|scostament|variance|riassumilo|leggilo|interpretalo|summarize it|read it|miglior|prossim|da dove|cosa (?:fare|faccio|controll)|next step|what should i|where do i/.test(q))return null;
  if(/\b(free|investor|pro|piano|plan|subscription|abbonamento)\b/.test(q))return null;
  // The financial part of a mixed report retains its separate, bounded reader.
  if(d.kind==='integrated'&&/\broi\b|cashflow|cash flow|dscr|mutuo|mortgage|equity|capitale|prezzo|price|finanziamento|punteggio|score|rischio|risk/.test(q)&&!/effettiv|actual|operativ|prenot|booked/.test(q))return null;
  const access=window.getUserAccess?.()||{};
  if(!window.currentUser||!(access.isPro===true||access.isAdmin===true))return {type:'document_grounded',confidence:1,textIT:'La lettura guidata dei report PMS e andamento richiede Pro. Investor mantiene analisi salvate e gestione PMS. I nuovi acquisti sono sospesi: puoi lasciare interesse senza impegno su /plan-interest.html?plan=pro. Non ho attivato una prova o un piano.',textEN:'Guided PMS and performance report reading requires Pro. Investor keeps saved analyses and PMS management. New purchases are paused: express non-binding interest at /plan-interest.html?plan=pro. I have not activated a trial or plan.',actions:[],metadata:{source:'product_plans',answerMode:'access'}};
  const nextStep=/miglior|prossim|da dove|cosa (?:fare|faccio|controll)|priorit|improv|next step|what should i|where do i/.test(q);
  const occupancyQuestion=/occupazion|occupancy/.test(q),adrQuestion=/\badr\b/.test(q),varianceQuestion=/scostament|variance/.test(q);
  const missing=/manc|missing|complet|sufficient/.test(q),finance=/\broi\b|cashflow|cash flow|dscr|prezzo|price|profit|utile|margine|margin/.test(q);
  const render=en=>{
   const t=(a,b)=>en?b:a,locale=en?'en-GB':'it-IT';
   const n=v=>v===null?t('N/D','N/A'):new Intl.NumberFormat(locale,{maximumFractionDigits:2}).format(v);
   const money=v=>v===null?t('N/D','N/A'):new Intl.NumberFormat(locale,{style:'currency',currency:'EUR'}).format(v);
   const lines=[t(d.kind==='pms_operational'?'Report operativo PMS — dati del PDF':d.kind==='integrated'?'Sezione PMS del report integrato — dati del PDF':'Andamento immobili e portfolio — dati del PDF',d.kind==='pms_operational'?'PMS operations report — PDF evidence':d.kind==='integrated'?'PMS section of the integrated report — PDF evidence':'Property and portfolio performance — PDF evidence'),t('Ambito: ','Scope: ')+(/^(?:All properties|Tutte le proprietà)$/i.test(d.scope||'')?t('Tutte le proprietà','All properties'):(d.scope||t('non riconosciuto','not recognized'))),t('Periodo: ','Period: ')+(d.period||t('non riconosciuto','not recognized'))];
   if(!finance&&!missing){
    if(occupancyQuestion){
     lines.push(t('Occupazione registrata: ','Recorded occupancy: ')+n(d.occupancy)+(d.occupancy===null?'':'%')+'.');
     lines.push(t('Misura le notti occupate rispetto alle notti disponibili nell’ambito e nel periodo scelti. Il report ipotizza una unità per immobile ogni giorno: verifica chiusure e completezza del calendario prima di leggere il dato come domanda effettiva.','This measures occupied nights against available nights for the selected scope and period. The report assumes one unit per property every day: check closures and calendar completeness before interpreting this as actual demand.'));
    }else if(adrQuestion){
     lines.push('ADR: '+money(d.adr)+'.');
     lines.push(t('È il ricavo prenotato medio per notte prenotata, non l’incasso netto. Confrontalo con l’occupazione dello stesso periodo; una tariffa più alta non garantisce ricavi maggiori.','This is average booked revenue per booked night, not net receipts. Compare it with occupancy for the same period; a higher rate does not guarantee higher revenue.'));
    }else if(!varianceQuestion){
     lines.push(t('Ricavi prenotati attribuiti al periodo: ','Booked revenue allocated to the period: ')+money(d.revenue)+'.');
     lines.push(t('Soggiorni: ','Stays: ')+n(d.stays)+t(' · Notti prenotate: ',' · Booked nights: ')+n(d.nights)+'.');
     lines.push(t('Occupazione: ','Occupancy: ')+n(d.occupancy)+(d.occupancy===null?'':'%')+' · ADR: '+money(d.adr)+' · RevPAR: '+money(d.revpar)+'.');
    }
    if(d.expected!==null && !occupancyQuestion && !adrQuestion)lines.push(t('Confronto sullo stesso sottoinsieme: ricavi registrati ','Same-subset comparison: recorded revenue ')+money(d.comparedRevenue)+t(', quota prevista ',', expected allocation ')+money(d.expected)+t(', scostamento ',', variance ')+n(d.variance)+(d.variance===null?'':'%')+'.');
    else if(varianceQuestion)lines.push(t('Il PDF non riporta un confronto omogeneo riconosciuto: non calcolo uno scostamento usando altre proprietà o dati della dashboard.','No recognized like-for-like comparison is reported in this PDF: I do not calculate a variance using other properties or dashboard data.'));
   }
   if(finance||missing)lines.push(t('Questo report non calcola ROI, cashflow, DSCR o margine effettivi. Il budget lavori non è il prezzo dell’immobile e i conteggi di proprietà o pagine non sono indicatori finanziari.','This report does not calculate actual ROI, cash flow, DSCR or profit. A renovation budget is not a property price, and property or page counts are not financial indicators.'));
   if(d.hasScenario)lines.push(t('Le eventuali stime annue appartengono alle singole simulazioni collegate: non sono risultati effettivi e non costituiscono un ROI unico del portfolio. Il confronto ricavi usa una quota uniforme, senza stagionalità.','Any annual forecasts belong to individual linked simulations: they are not actual results or a single portfolio ROI. Revenue comparisons use a uniform allocation without seasonality.'));
   if(d.kind==='integrated'&&!finance&&!missing&&!occupancyQuestion&&!adrQuestion&&!varianceQuestion){
    const a=doc.analysis||{},valid=k=>a[k]!==null&&a[k]!==undefined&&a[k]!==''&&Number.isFinite(Number(a[k]));
    lines.push(t('Scenario finanziario annuo selezionato — distinto dal PMS: ','Selected annual financial scenario — separate from PMS: ')+(valid('roi')?'ROI '+n(Number(a.roi))+'%; ':'')+(valid('cashflow')?t('cashflow stimato ','estimated cashflow ')+money(Number(a.cashflow)):t('cashflow non riconosciuto','cashflow not recognized'))+'.');
   }
   if(d.kind==='integrated')lines.push(t('Le prime pagine finanziarie riguardano lo scenario annuale selezionato, distinto da questo periodo PMS.','The opening financial pages describe the selected annual scenario, separately from this PMS period.'));
   if(missing)lines.push(t('Per valutare il margine effettivo servono incassi verificati, costi consuntivi, commissioni, imposte e rate pagate con periodo coerente. Questi dati non si ricavano dalle prenotazioni.','Actual profit requires verified receipts, actual costs, commissions, taxes and debt payments for the same period. These cannot be inferred from bookings.'));
   if(nextStep || (!finance&&!missing&&!occupancyQuestion&&!adrQuestion&&!varianceQuestion)){
    lines.push(t('Prossimo controllo: verifica prima ambito, date, chiusure e prenotazioni mancanti.','Next check: first verify scope, dates, closures and missing bookings.'));
    if(d.variance!==null&&d.variance<0)lines.push(t('Poi esamina lo scostamento negativo distinguendo notti prenotate e tariffa media; la quota prevista è uniforme e non considera la stagionalità.','Then examine the negative variance by separating booked nights and average rate; the expected allocation is uniform and does not account for seasonality.'));
    else lines.push(t('Poi confronta occupazione e ADR con un periodo omogeneo prima di valutare variazioni di tariffa.','Then compare occupancy and ADR with a like-for-like period before considering rate changes.'));
    lines.push(t('Per misurare il margine, raccogli incassi e costi dello stesso periodo. Non ho modificato tariffe, calendario o prenotazioni.','To measure profit, collect receipts and costs for the same period. I have not changed rates, calendars or bookings.'));
   }
   if(d.currentOrFuture)lines.push(t('Il periodo include oggi o date future: non è un consuntivo chiuso.','The period includes today or future dates: it is not a closed-period actual.'));
   lines.push(t('Sono ricavi prenotati, non incassi o utile. Verifica completezza del calendario e stagionalità prima di intervenire. Dati non riconosciuti restano N/D. Uso solo il PDF corrente, senza sostituirlo con dati della dashboard.','These are booked revenues, not receipts or profit. Review calendar completeness and seasonality before acting. Unrecognized data remains N/A. I use only the current PDF without replacing it with dashboard data.'));
   lines.push(t('Fonte: ','Source: ')+String(doc.fileName||'PDF'));return lines.join('\n');
  };
  return {type:missing?'document_data_quality':'document_grounded',confidence:1,textIT:render(false),textEN:render(true),actions:[],suggestionsIT:occupancyQuestion?['Spiegami l’ADR del PDF','Qual è il prossimo controllo sul PDF?']:['Spiegami l’occupazione del PDF','Qual è il prossimo controllo sul PDF?','Quali dati mancano nel PDF?'],suggestionsEN:occupancyQuestion?['Explain ADR in this PDF','What should I check next in this PDF?']:['Explain occupancy in this PDF','What should I check next in this PDF?','Which data are missing in the PDF?'],signals:['current_pdf_only','operational_pdf'],metadata:{source:'extracted_pdf_text',documentId:doc.id,fileName:doc.fileName,reportKind:d.kind,answerMode:missing?'data_quality':'operational'}};
 };
})();
