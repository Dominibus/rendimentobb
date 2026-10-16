import {renderPerformanceSections} from './property-performance-pdf.js?v=20261015-rc131';
import {calendarDay} from './pms-calendar.js';

export function canExportPMSReport(user, access={}){
  return Boolean(user?.uid && user.uid !== "demo-user" && (access.isPro === true || access.isAdmin === true));
}
const finite = value => ['number','string'].includes(typeof value) && String(value).trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : null;

// Read-only operational model. No simulation, ROI, guest names or tax estimates.
export function buildPMSOperationalReport({snapshot,ownerUid,propertyId='',month,period=null,generatedAt=new Date().toISOString()}){
  if(!ownerUid || snapshot?.ownerUid !== ownerUid || snapshot?.isDemo || snapshot?.portalSnapshotReady !== true) throw Error('PMS_REPORT_UNAVAILABLE');
  let first,next,periodLabel;
  if(period){
    first=calendarDay(period.start);next=calendarDay(period.end);
    if(first===null || next===null || next<=first || next-first>1096)throw Error('INVALID_REPORT_PERIOD');
    periodLabel=period.start+' / '+new Date((next-1)*86400000).toISOString().slice(0,10);
  }else{
    if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(month)) || Number(month.slice(0,4)) < 1000) throw Error('INVALID_REPORT_MONTH');
    const [year,monthNumber]=month.split('-').map(Number);
    first=calendarDay(month+'-01');next=Date.UTC(year,monthNumber,1)/86400000;periodLabel=month;
  }
  const days=next-first;
  if(!Array.isArray(snapshot.propertyList) || !Array.isArray(snapshot.portalBookingList)) throw Error('PMS_REPORT_UNAVAILABLE');
  const directory=snapshot.propertyList;
  if(propertyId && !directory.some(p=>p.id===propertyId)) throw Error('REPORT_PROPERTY_NOT_FOUND');
  const properties=directory.filter(p=>!propertyId || p.id===propertyId);
  const warnings={invalidDates:0,missingAmounts:0,overlappingNights:0,unlinkedBookings:0,unknownStatuses:0};
  const active=b=>['arrival','checkin','checkout','completed','confirmed'].includes(String(b.status||'confirmed').toLowerCase());
  const propertyIds=new Set(directory.map(p=>p.id));
  warnings.unlinkedBookings=propertyId?0:snapshot.portalBookingList.filter(b=>!propertyIds.has(b.propertyId) && !['cancelled','pending'].includes(String(b.status).toLowerCase())).length;
  const rows=properties.map(property=>{
    const all=snapshot.portalBookingList.filter(b=>b.propertyId===property.id);
    const confirmed=all.filter(active);
    const unknownStatuses=all.filter(b=>!active(b)&&!['cancelled','pending'].includes(String(b.status).toLowerCase())).length;
    warnings.unknownStatuses+=unknownStatuses;
    let missingPeriodAmounts=0,overlapNights=0,pricedNights=0,invalidDates=0;
    const occupied=new Set();let revenue=0,nights=0,stays=0,allRevenue=0,guests=0,attention=0;
    for(const booking of confirmed){
      const amount=booking.amountRecognized===false?null:finite(booking.totalAmount);
      if(amount===null || amount<0) warnings.missingAmounts++;
      else allRevenue+=amount;
      guests+=Math.max(0,finite(booking.guests)??0);
      if(booking.requiresAttention===true) attention++;
      const start=calendarDay(booking.checkin),end=calendarDay(booking.checkout);
      if(start===null || end===null || end<=start){warnings.invalidDates++;invalidDates++;continue;}
      const from=Math.max(first,start),to=Math.min(next,end),inMonth=Math.max(0,to-from);
      if(!inMonth)continue;
      stays++;nights+=inMonth;
      if(amount===null || amount<0)missingPeriodAmounts++;else pricedNights+=inMonth;
      if(amount!==null && amount>=0) revenue+=amount*inMonth/(end-start);
      for(let day=from;day<to;day++){
        if(occupied.has(day)){warnings.overlappingNights++;overlapNights++;}
        occupied.add(day);
      }
    }
    return {id:property.id,name:String(property.name||'-'),city:String(property.city||''),bookings:confirmed.length,pending:all.filter(b=>String(b.status).toLowerCase()==='pending').length,
      unknownStatuses,missingPeriodAmounts,overlapNights,pricedNights,invalidDates,guests,allRevenue,revenue,nights,occupiedNights:occupied.size,stays,occupancy:occupied.size/days*100,adr:nights&&!missingPeriodAmounts?revenue/nights:null,revpar:missingPeriodAmounts?null:revenue/days,attention};
  });
  const sum=key=>rows.reduce((n,p)=>n+p[key],0),availableNights=properties.length*days;
  const totals={properties:rows.length,bookings:sum('bookings'),pending:sum('pending'),guests:sum('guests'),allRevenue:sum('allRevenue'),revenue:sum('revenue'),nights:sum('nights'),stays:sum('stays'),occupiedNights:sum('occupiedNights'),attention:sum('attention')};
  totals.occupancy=availableNights?totals.occupiedNights/availableNights*100:null;
  const partialAmounts=rows.some(r=>r.missingPeriodAmounts>0);
  totals.adr=totals.nights&&!partialAmounts?totals.revenue/totals.nights:null;
  totals.revpar=availableNights&&!partialAmounts?totals.revenue/availableNights:null;
  const ids=new Set(rows.map(p=>p.id));
  const renovations=(snapshot.renovationList||[]).filter(p=>ids.has(p.propertyId)).map(p=>({propertyName:String(p.propertyName||'-'),status:String(p.status||''),plannedTotal:finite(p.plannedTotal),actualSpent:finite(p.actualSpent),progressPercent:finite(p.progressPercent)}));
  return {month:month||period.start.slice(0,7),periodLabel,period:{start:new Date(first*86400000).toISOString().slice(0,10),end:new Date(next*86400000).toISOString().slice(0,10)},days,generatedAt,scope:propertyId?'property':'portfolio',scopeName:propertyId?rows[0].name:null,rows,totals,renovations,warnings};
}

export function renderPMSOperationalPDF(report,{jsPDF,lang='it',doc:existingDoc=null,footer=true}){
  const en=lang==='en',t=(it,eng)=>en?eng:it,locale=en?'en-GB':'it-IT';
  const doc=existingDoc||new jsPDF({unit:'mm',format:'a4'});
  if(existingDoc)doc.addPage();
  const firstPage=doc.getNumberOfPages();
  const clean=value=>String(value??'').replace(/[\u0000-\u001f]/g,' ').replace(/[\u2010-\u2015]/g,'-').replace(/\u2022/g,' - ');
  const num=(v,d=0)=>v===null?t('N/D','N/A'):new Intl.NumberFormat(locale,{minimumFractionDigits:d,maximumFractionDigits:d}).format(v);
  const money=v=>num(v,2)+' EUR';
  let y=42;
  function header(){doc.setFillColor(15,23,42);doc.rect(0,0,210,30,'F');doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('RendimentoBB',16,13);doc.setFontSize(10);doc.text(report.performance?t('ANDAMENTO IMMOBILI E PORTFOLIO','PROPERTY AND PORTFOLIO PERFORMANCE'):t('REPORT OPERATIVO PMS','PMS OPERATIONS REPORT'),16,23);doc.setTextColor(15,23,42);}
  function ensure(height){if(y+height>274){doc.addPage();header();y=42;}}
  function text(value,{size=10,bold=false,color=[51,65,85],gap=4}={}){
    doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);
    const lines=doc.splitTextToSize(clean(value),178);
    for(const line of lines){ensure(5.2);doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);doc.text(line,16,y);y+=5.2;}
    y+=gap;
  }
  function section(label,reserve=18){ensure(reserve);y+=3;text(label,{size:13,bold:true,color:[5,122,91]});}
  function metric(label,value){ensure(10);doc.setFillColor(244,248,247);doc.roundedRect(16,y-4,178,9,1,1,'F');doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(51,65,85);doc.text(clean(label),19,y+1);doc.setFont('helvetica','bold');doc.text(clean(value),191,y+1,{align:'right'});y+=11;}
  header();text(t('Gestione e proprietà','Operations and properties'),{size:19,bold:true});
  text(t('Ambito: ','Scope: ')+(report.scope==='property'?report.scopeName:t('Tutte le proprietà','All properties')),{bold:true});
  text(t('Periodo di competenza: ','Reporting period: ')+(report.periodLabel||report.month)+' | '+t('Snapshot: ','Snapshot: ')+new Date(report.generatedAt).toLocaleString(locale),{size:9});
  text(report.performance?t('Dati PMS registrati e ipotesi della simulazione collegata, presentati separatamente. Ricavi prenotati e risultati finanziari sono misure diverse.','Recorded PMS data and linked simulation assumptions, presented separately. Booked revenue and financial results are different measures.'):t('Dati PMS registrati, senza simulazioni finanziarie. Ricavi delle prenotazioni: non certificano incassi, utile, cashflow o ROI.','Recorded PMS data, without financial simulations. Booking revenue does not certify payments received, profit, cashflow or ROI.'),{size:9});
  section(t('Risultati del periodo','Period results'));
  const a=report.totals;
  metric(t('Proprieta incluse','Properties included'),num(a.properties));
  metric(t('Soggiorni nel periodo','Stays in the period'),num(a.stays));
  metric(t('Ricavi attribuiti al periodo','Revenue allocated to the period'),money(a.revenue));
  metric(t('Notti prenotate nel periodo','Booked nights in the period'),num(a.nights));
  metric(t('Occupazione del periodo','Period occupancy'),num(a.occupancy,1)+'%');
  metric('ADR',a.adr===null?'N/A':money(a.adr));metric('RevPAR',a.revpar===null?'N/A':money(a.revpar));
  section(t('Registrazioni - tutti i periodi','Records - all periods'));
  metric(t('Prenotazioni confermate e soggiorni','Confirmed bookings and stays'),num(a.bookings));
  metric(t('Richieste in attesa - escluse dai ricavi','Pending requests - excluded from revenue'),num(a.pending));
  metric(t('Ricavi registrati - tutti i periodi','Recorded revenue - all periods'),money(a.allRevenue));
  metric(t('Ospiti registrati - somma per soggiorno','Recorded guests - summed per stay'),num(a.guests));
  metric(t('Prenotazioni da attenzionare - tutti i periodi','Bookings requiring attention - all periods'),num(a.attention));
  section(t('Proprieta - dettaglio del periodo','Properties - period detail'),60);
  if(!report.rows.length)text(t('Nessuna proprietà registrata.','No properties recorded.'));
  for(const p of report.rows){ensure(40);text(p.name+(p.city?' | '+p.city:''),{bold:true});
    text(t('Ricavi periodo: ','Period revenue: ')+money(p.revenue)+' | '+t('Occupazione: ','Occupancy: ')+num(p.occupancy,1)+'% | ADR: '+(p.adr===null?'N/A':money(p.adr))+' | RevPAR: '+(p.revpar===null?'N/A':money(p.revpar)),{size:9});
    text(t('Soggiorni nel periodo: ','Stays in period: ')+num(p.stays)+' | '+t('Notti: ','Nights: ')+num(p.nights)+' | '+t('Prenotazioni totali: ','All-period bookings: ')+num(p.bookings),{size:9});
  }
  section(t('Lavori e budget registrati','Recorded renovations and budgets'),60);
  if(!report.renovations.length)text(t('Nessun piano di lavori registrato per questo ambito.','No renovation plan recorded for this scope.'),{size:9});
  const statuses={planning:t('Pianificazione','Planning'),in_progress:t('In corso','In progress'),completed:t('Completato','Completed'),paused:t('In pausa','Paused')};
  for(const p of report.renovations){ensure(35);text(p.propertyName,{bold:true});text((statuses[p.status]||t('Stato non indicato','Status not specified'))+' | '+t('Avanzamento: ','Progress: ')+num(p.progressPercent,1)+'%',{size:9});
    text(t('Budget: ','Budget: ')+(p.plannedTotal===null?'N/A':money(p.plannedTotal))+' | '+t('Spese inserite: ','Entered spending: ')+(p.actualSpent===null?'N/A':money(p.actualSpent))+' | '+t('Residuo: ','Remaining: ')+(p.plannedTotal===null||p.actualSpent===null?'N/A':money(p.plannedTotal-p.actualSpent)),{size:9});
  }
  section(t('Metodo e limiti','Method and limitations'),60);
  text(t('I ricavi del periodo sono ripartiti uniformemente sulle notti del soggiorno; il giorno di partenza è escluso. Una unità disponibile per proprietà per ogni giorno del periodo. Occupazione = notti occupate uniche / notti disponibili. ADR = ricavi del periodo / notti prenotate. RevPAR = ricavi del periodo / notti disponibili.','Period revenue is allocated evenly over stay nights; checkout day is excluded. One available unit per property for every day of the period. Occupancy = unique occupied nights / available nights. ADR = period revenue / booked nights. RevPAR = period revenue / available nights.'),{size:9});
  text(t('Richieste in attesa e cancellazioni non concorrono ai ricavi e all\'occupazione. Date non valide sono escluse dalle metriche mensili; importi mancanti non sono stimati. Il report non sottrae costi, imposte, commissioni o mutui e non calcola il recupero delle spese dei lavori. Non è un rendiconto contabile o fiscale.','Pending requests and cancellations are excluded from revenue and occupancy. Invalid dates are excluded from monthly metrics; missing amounts are not estimated. This report does not deduct costs, taxes, commissions or debt and does not calculate renovation payback. It is not an accounting or tax statement.'),{size:9});
  const w=report.warnings;
  if(Object.values(w).some(Boolean))text(t('Controlli dati - date non valide: ','Data checks - invalid dates: ')+w.invalidDates+t('; importi mancanti/non validi: ','; missing/invalid amounts: ')+w.missingAmounts+t('; notti sovrapposte: ','; overlapping nights: ')+w.overlappingNights+t('; prenotazioni senza proprietà valida: ','; bookings without a valid property: ')+w.unlinkedBookings+t('; stati sconosciuti: ','; unknown statuses: ')+w.unknownStatuses+t('. Verifica i dati prima di usare i risultati.','. Check records before using these results.'),{size:9,color:[153,27,27]});
  if(report.performance)renderPerformanceSections(report.performance,{section,text,metric,ensure,doc,getY:()=>y,setY:value=>{y=value;},t,num,money});
  const count=doc.getNumberOfPages();for(let n=firstPage;footer&&n<=count;n++){doc.setPage(n);doc.setDrawColor(220,228,226);doc.line(16,281,194,281);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(100,116,139);doc.text('RendimentoBB | '+t('Dati operativi registrati','Recorded operational data'),16,287);doc.text(n+' / '+count,194,287,{align:'right'});}
  return doc;
}
