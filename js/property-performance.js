import {calendarDay} from './pms-calendar.js';
import {buildPMSOperationalReport} from './pms-operational-report.js?v=20261023-rc191';
import {readInvestmentAssumptions} from './investment-assumptions.js?v=20261009-rc91';
const number=v=>['number','string'].includes(typeof v)&&String(v).trim()!==''&&Number.isFinite(Number(v))?Number(v):null;
const nonnegative=v=>{const n=number(v);return n!==null&&n>=0?n:null;};
const iso=n=>new Date(n*86400000).toISOString().slice(0,10);
const diff=(observed,expected)=>observed===null||expected===null?null:observed-expected;
const percent=(observed,expected)=>observed===null||!(expected>0)?null:(observed-expected)/expected*100;
export function reportPeriod({mode='month',month,year,quarter=1,start,end}={}){
 let first,last;
 const y=Number(year);
 if(mode==='custom'){first=calendarDay(start);const d=calendarDay(end);last=d===null?null:d+1;}
 else if(mode==='month'){
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(month)))throw Error('INVALID_REPORT_PERIOD');
  const [yy,mm]=month.split('-').map(Number);first=calendarDay(month+'-01');last=Date.UTC(yy,mm,1)/86400000;
 }else if(['quarter','year'].includes(mode)&&Number.isInteger(y)&&y>=1000&&y<=9998){
  const q=Number(quarter);if(mode==='quarter'&&(!Number.isInteger(q)||q<1||q>4))throw Error('INVALID_REPORT_PERIOD');
  const m=mode==='year'?0:(q-1)*3;first=Date.UTC(y,m,1)/86400000;last=Date.UTC(y,m+(mode==='year'?12:3),1)/86400000;
 }else throw Error('INVALID_REPORT_PERIOD');
 if(first===null||last===null||!Number.isFinite(last)||last<=first||last-first>1096)throw Error('INVALID_REPORT_PERIOD');
 return {start:iso(first),end:iso(last)};
}
export function annualPeriodFactor(period){
 const first=calendarDay(period.start),end=calendarDay(period.end);
 if(first===null||end===null||end<=first||end-first>1096)throw Error('INVALID_REPORT_PERIOD');
 let n=first,factor=0;
 while(n<end){const year=new Date(n*86400000).getUTCFullYear(),begin=Date.UTC(year,0,1)/86400000,next=Date.UTC(year+1,0,1)/86400000,to=Math.min(end,next);factor+=(to-n)/(next-begin);n=to;}
 return factor;
}
// Read only; linked analyses must be owned and bidirectionally linked by immutable IDs.
export function buildPropertyPerformance({snapshot,analyses=[],ownerUid,propertyId='',period,generatedAt=new Date().toISOString()}){
 const report=buildPMSOperationalReport({snapshot,ownerUid,propertyId,period,generatedAt});
 const factor=annualPeriodFactor(period),start=calendarDay(period.start),end=calendarDay(period.end);
 const snapshotTime=Date.parse(generatedAt);
 const snapshotDay=Number.isFinite(snapshotTime)?new Date(snapshotTime).toLocaleDateString('en-CA',{timeZone:'Europe/Rome'}):null;
 const today=snapshotDay?calendarDay(snapshotDay):null;
 const periodOpen=today===null||end>today;
 const previousPeriod={start:iso(start-report.days),end:period.start};
 const previous=buildPMSOperationalReport({snapshot,ownerUid,propertyId,period:previousPeriod,generatedAt});
 const counts=new Map();for(const p of snapshot.propertyList)if(p.analysisId)counts.set(p.analysisId,(counts.get(p.analysisId)||0)+1);
 const performanceRows=report.rows.map(row=>{
  const property=snapshot.propertyList.find(p=>p.id===row.id);
  const candidates=analyses.filter(a=>a?.id===property.analysisId&&a.uid===ownerUid);
  const analysis=candidates.length===1?candidates[0]:null;
  const linkState=!property.analysisId?'unlinked':!analysis?'unavailable':analysis.propertyId!==row.id||counts.get(property.analysisId)!==1?'inconsistent':'linked';
  const a=linkState==='linked'?analysis:null,inputs=readInvestmentAssumptions(a?.assumptions);
  const annualGross=nonnegative(a?.gross);
  const expectedRevenue=annualGross===null?null:annualGross*factor;
  const expectedOccupancy=inputs?inputs.occupancy:(nonnegative(a?.occupancy)<=100?nonnegative(a?.occupancy):null);
  const expectedADR=inputs?inputs.priceNight:null;
  const incomplete=row.missingPeriodAmounts>0||row.overlapNights>0||row.invalidDates>0||row.unknownStatuses>0;
  const comparable=linkState==='linked'&&!incomplete&&row.stays>0;
  const before=previous.rows.find(p=>p.id===row.id);
  const priorComparable=before?.stays>0&&!before.missingPeriodAmounts&&!before.overlapNights&&!before.invalidDates&&!before.unknownStatuses&&!incomplete&&row.stays>0;
  const equity=inputs?.equity??nonnegative(a?.equity);
  const notices=[];
  if(linkState!=='linked')notices.push({code:linkState==='unlinked'?'link_analysis':'check_link'});
  if(!row.stays)notices.push({code:'no_records'});
  if(row.missingPeriodAmounts)notices.push({code:'missing_prices',value:row.missingPeriodAmounts});
  if(row.unknownStatuses)notices.push({code:'unknown_statuses',value:row.unknownStatuses});
  if(row.invalidDates)notices.push({code:'invalid_dates',value:row.invalidDates});
  if(row.overlapNights)notices.push({code:'overlaps',value:row.overlapNights});
  if(comparable&&!periodOpen&&expectedRevenue>0&&row.revenue<expectedRevenue)notices.push({code:'revenue_gap',value:expectedRevenue-row.revenue});
  if(comparable&&!periodOpen&&expectedOccupancy!==null&&row.occupancy<expectedOccupancy)notices.push({code:'occupancy_gap',value:expectedOccupancy-row.occupancy});
  if(comparable&&!periodOpen&&expectedADR>0&&row.adr!==null&&row.adr<expectedADR)notices.push({code:'adr_gap',value:expectedADR-row.adr});
  return {...row,linkState,analysisId:a?.id||null,expectedRevenue,expectedOccupancy,expectedADR,
   revenueDelta:comparable?diff(row.revenue,expectedRevenue):null,revenueDeltaPercent:comparable?percent(row.revenue,expectedRevenue):null,
   occupancyDelta:comparable?diff(row.occupancy,expectedOccupancy):null,adrDelta:comparable?diff(row.adr,expectedADR):null,
   forecast:{annualGross,annualCosts:inputs?(inputs.expensesUnit==='monthly_eur'?inputs.expenses*12:(annualGross===null?null:annualGross*inputs.expenses/100)):null,annualCashflow:number(a?.net),equity,
    roi:equity>0?number(a?.roi):null,dscr:(inputs?.loanAmount>0||nonnegative(a?.annualDebtService)>0)?nonnegative(a?.dscr):null},
   previousRevenue:priorComparable?before.revenue:null,previousDeltaPercent:priorComparable?percent(row.revenue,before.revenue):null,
   notices};
 });
 const comparable=performanceRows.filter(r=>r.revenueDelta!==null&&r.expectedRevenue!==null);
 const matchedObserved=comparable.reduce((s,r)=>s+r.revenue,0),matchedExpected=comparable.reduce((s,r)=>s+r.expectedRevenue,0);
 const trend=[];let cursor=start;
 while(cursor<end){const d=new Date(cursor*86400000),next=Math.min(end,Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1)/86400000);
  const r=buildPMSOperationalReport({snapshot,ownerUid,propertyId,period:{start:iso(cursor),end:iso(next)},generatedAt});
  trend.push({month:iso(cursor).slice(0,7),days:next-cursor,revenue:r.totals.revenue,stays:r.totals.stays,occupancy:r.totals.occupancy,incomplete:r.rows.some(p=>p.missingPeriodAmounts>0||p.overlapNights>0)});cursor=next;
 }
 const performance={period,previousPeriod,factor,rows:performanceRows,trend,
  summary:{linked:performanceRows.filter(r=>r.linkState==='linked').length,comparable:comparable.length,properties:performanceRows.length,
   observed:matchedObserved,expected:matchedExpected,deltaPercent:comparable.length?percent(matchedObserved,matchedExpected):null},
  includesCurrentOrFuture:periodOpen,actualCashflow:null,actualROI:null,actualDSCR:null,actualPayments:null};
 return {...report,performance};
}
export function performanceNotice(notice,lang='it'){
 const en=lang==='en',n=new Intl.NumberFormat(en?'en-GB':'it-IT',{maximumFractionDigits:2}).format(notice.value??0);
 const map={
  link_analysis:['Collega una simulazione salvata da Modifica immobile per confrontare le ipotesi.','Link a saved simulation from Edit property to compare assumptions.'],
  check_link:['Collegamento non verificato: riapri Modifica immobile, seleziona l’analisi e salva.','Link not verified: reopen Edit property, select the analysis and save.'],
  no_records:['Nessun soggiorno registrato nel periodo: verifica la completezza del calendario prima di valutare la domanda.','No stays recorded in this period: check calendar completeness before assessing demand.'],
  unknown_statuses:[`${n} prenotazioni con stato sconosciuto: verifica lo stato prima del confronto.`,`${n} bookings have an unknown status: check them before comparing.`],
  invalid_dates:[`${n} soggiorni con date non valide: correggili prima del confronto.`,`${n} stays have invalid dates: correct them before comparing.`],
  missing_prices:[`${n} soggiorni senza importo valido: completa i prezzi prima di confrontare i ricavi.`,`${n} stays have no valid amount: complete prices before comparing revenue.`],
  overlaps:[`${n} notti sovrapposte: controlla le prenotazioni; il confronto economico è sospeso.`,`${n} overlapping nights: review bookings; financial comparison is suspended.`],
  revenue_gap:[`Ricavi registrati inferiori di ${n} EUR alla quota uniforme dello scenario. Verifica calendario, prezzi e completezza dei dati.`,`Recorded revenue is ${n} EUR below the uniform scenario allocation. Review calendar, pricing and data completeness.`],
  occupancy_gap:[`Occupazione inferiore di ${n} punti percentuali allo scenario. Controlla disponibilità e stagionalità prima di intervenire.`,`Occupancy is ${n} percentage points below the scenario. Review availability and seasonality before taking action.`],
  adr_gap:[`ADR inferiore di ${n} EUR all’ipotesi. Esamina tariffe, durata dei soggiorni e composizione delle prenotazioni.`,`ADR is ${n} EUR below the assumption. Review rates, stay length and booking mix.`]
 };return (map[notice.code]||['Dati da verificare.','Review data.'])[en?1:0];
}
