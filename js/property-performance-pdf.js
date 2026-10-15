// Shared renderer receives the existing paginated PDF layout primitives.
export function renderPerformanceSections(p,{section,text,metric,t,num,money}){
 section(t('Analisi collegata e scostamenti','Linked analysis and variances'),45);
 text(t('Fonte: simulazioni salvate collegate tramite ID; prenotazioni PMS dello stesso proprietario. Le stime sono ipotesi, non risultati effettivi.','Source: saved simulations linked by ID; PMS bookings owned by the same account. Forecasts are assumptions, not actual results.'),{size:9});
 text(t('Confronto ricavi: lordo annuo dello scenario ripartito sui giorni del periodo / giorni di ciascun anno. Distribuzione uniforme, senza stagionalita. L’assenza di prenotazioni non dimostra assenza di domanda.','Revenue comparison: annual scenario gross revenue allocated by period days / days in each year. Uniform allocation, without seasonality. No recorded bookings does not prove absence of demand.'),{size:9});
 if(p.includesCurrentOrFuture)text(t('Il periodo include oggi o date future: i ricavi sono prenotati, non un consuntivo chiuso.','The period includes today or future dates: revenue is booked, not a closed-period actual.'),{size:9,color:[153,27,27]});
 metric(t('Proprieta con collegamento verificato','Properties with a verified link'),p.summary.linked+' / '+p.summary.properties);
 metric(t('Proprieta nel confronto omogeneo','Properties in like-for-like comparison'),num(p.summary.comparable));
 if(p.summary.comparable){metric(t('Ricavi registrati del sottoinsieme','Recorded revenue of compared subset'),money(p.summary.observed));metric(t('Quota prevista dello stesso sottoinsieme','Expected allocation for the same subset'),money(p.summary.expected));metric(t('Scostamento dello stesso sottoinsieme','Variance for the same subset'),p.summary.deltaPercent===null?'N/A':num(p.summary.deltaPercent,1)+'%');}
 for(const row of p.rows){
  section(row.name,45);
  if(row.linkState!=='linked'){text(t('Nessuna simulazione con collegamento verificato. Usa Modifica immobile per collegarla.','No simulation with a verified link. Use Edit property to link one.'),{size:9});continue;}
  text(t('ID analisi: ','Analysis ID: ')+row.analysisId,{size:8});
  metric(t('Ricavi registrati nel periodo','Recorded period revenue'),money(row.revenue));
  metric(t('Quota di ricavi prevista nel periodo','Expected period revenue allocation'),row.expectedRevenue===null?'N/A':money(row.expectedRevenue));
  metric(t('Scostamento ricavi','Revenue variance'),row.revenueDeltaPercent===null?'N/A':num(row.revenueDeltaPercent,1)+'%');
  metric(t('Occupazione registrata / prevista','Recorded / expected occupancy'),num(row.occupancy,1)+'% / '+(row.expectedOccupancy===null?'N/A':num(row.expectedOccupancy,1)+'%'));
  metric(t('ADR registrato / previsto','Recorded / expected ADR'),(row.adr===null?'N/A':money(row.adr))+' / '+(row.expectedADR===null?'N/A':money(row.expectedADR)));
  const f=row.forecast;
  text(t('Solo scenario annuo - costi operativi: ','Annual scenario only - operating costs: ')+(f.annualCosts===null?'N/A':money(f.annualCosts))+t('; cashflow: ','; cash flow: ')+(f.annualCashflow===null?'N/A':money(f.annualCashflow))+'; ROI: '+(f.roi===null?'N/A':num(f.roi,1)+'%')+'; DSCR: '+num(f.dscr,2),{size:9});
  if(row.previousRevenue!==null)text(t('Ricavi nel periodo precedente di pari durata: ','Revenue in preceding period of equal length: ')+money(row.previousRevenue)+t('; variazione: ','; change: ')+(row.previousDeltaPercent===null?'N/A':num(row.previousDeltaPercent,1)+'%'),{size:9});
 }
 section(t('Andamento per mese','Monthly trend'),35);
 for(const m of p.trend)text(m.month+' | '+num(m.days)+t(' giorni | ricavi registrati: ',' days | recorded revenue: ')+money(m.revenue)+' | '+t('Occupazione: ','Occupancy: ')+num(m.occupancy,1)+'%'+(m.incomplete?t(' | dati incompleti',' | incomplete data'):''),{size:9});
 section(t('Dati ancora necessari','Data still required'),35);
 text(t('Incassi effettivi, spese operative consuntive, commissioni, imposte e rate pagate non sono ricavati dalle prenotazioni. Cashflow, ROI e DSCR effettivi non sono calcolati. Le spese dei lavori sono separate e non attribuite automaticamente al periodo.','Actual receipts, actual operating expenses, commissions, taxes and debt payments are not inferred from bookings. Actual cash flow, ROI and DSCR are not calculated. Renovation spending is separate and is not automatically allocated to the period.'),{size:9});
 // Notice text is already translated by the performance entrypoint.
 if(p.noticeTexts?.length){section(t('Punti di attenzione e verifiche','Attention points and checks'),35);for(const value of p.noticeTexts)text(value,{size:9});}
}
