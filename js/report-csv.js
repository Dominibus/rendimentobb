import {PERFORMANCE_CSV_HEADERS} from './csv-locales.js?v=20261023-rc191';
// Text is formula-safe; finite numbers retain their numeric meaning, including negatives.
export function csvCell(value,lang='en'){
 let text=typeof value==='number'?(Number.isFinite(value)?String(value):''):String(value??'');
 if(typeof value==='number'&&lang==='it')text=text.replace('.',',');
 if(typeof value!=='number'&&/^[\s]*[=+@-]/.test(text))text="'"+text;
 return '"'+text.replace(/"/g,'""')+'"';
}
const round=(value,decimals)=>typeof value==='number'&&Number.isFinite(value)?Number(value.toFixed(decimals)):null;
export function performanceCSV(report,lang){
 // Calls without language retain the legacy machine schema for existing integrations.
 const locale=lang==='it'?'it':lang==='en'?'en':'legacy',headers=PERFORMANCE_CSV_HEADERS[locale];
 const label=(value,it,en)=>locale==='legacy'?value:locale==='it'?it:en;
 const links={linked:label('linked','Collegata','Linked'),unlinked:label('unlinked','Non collegata','Not linked'),unavailable:label('unavailable','Analisi non disponibile','Analysis unavailable'),inconsistent:label('inconsistent','Collegamento incoerente','Inconsistent link')};
 const period=report.performance.includesCurrentOrFuture===true?label('open_or_future','In corso o futuro','Current or future'):report.performance.includesCurrentOrFuture===false?label('closed','Chiuso','Closed'):label('unknown','Non disponibile','Unavailable');
 const rows=report.performance.rows.map(r=>[r.id,r.name,report.period.start,report.period.end,round(r.revenue,2),round(r.expectedRevenue,2),round(r.revenueDeltaPercent,4),r.nights,round(r.occupancy,4),round(r.adr,2),links[r.linkState]??(locale==='legacy'?r.linkState:label('unknown','Non disponibile','Unavailable')),r.missingPeriodAmounts,r.overlapNights,round(r.revpar,2),round(r.expectedOccupancy,4),round(r.expectedADR,2),report.generatedAt||'',
 label('booked_revenue','Ricavi prenotati','Booked revenue'),period,
 ...(locale==='legacy'?[]:[
 label('', 'Una unità per immobile tutti i giorni; chiusure e camere multiple non modellate','One unit per property every day; closures and multiple rooms not modelled'),
 label('', 'Uniforme sulle notti del soggiorno; checkout escluso','Evenly over stay nights; checkout excluded'),
 label('', 'Ipotesi della simulazione collegata; ricavi annui ripartiti senza stagionalità','Linked simulation assumptions; annual revenue allocated without seasonality')])]);
 return '\uFEFF'+[headers,...rows].map(row=>row.map(value=>csvCell(value,locale)).join(';')).join('\r\n');
}
