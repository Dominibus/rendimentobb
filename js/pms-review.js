import {buildPMSOperationalReport} from './pms-operational-report.js?v=20261023-rc191';
export function ownedPMSReport({snapshot,ownerUid,month,period,propertyIds}){
 if(!ownerUid||snapshot?.ownerUid!==ownerUid||snapshot?.isDemo||snapshot?.portalSnapshotReady!==true)throw Error('PMS_REPORT_UNAVAILABLE');
 let scoped=snapshot;
 if(propertyIds!==undefined){
  if(!Array.isArray(propertyIds)||propertyIds.some(id=>!snapshot.propertyList.some(p=>p.id===id)))throw Error('REPORT_PROPERTY_NOT_FOUND');
  const ids=new Set(propertyIds);scoped={...snapshot,propertyList:snapshot.propertyList.filter(p=>ids.has(p.id)),portalBookingList:snapshot.portalBookingList.filter(b=>ids.has(b.propertyId)),renovationList:(snapshot.renovationList||[]).filter(r=>ids.has(r.propertyId))};
 }
 return buildPMSOperationalReport({snapshot:scoped,ownerUid,month,period});
}
export function pmsReviewHTML(report,lang='it'){
 const en=lang==='en',t=(it,eng)=>en?eng:it,esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const n=(v,d=1)=>v===null?t('N/D','N/A'):new Intl.NumberFormat(en?'en-GB':'it-IT',{maximumFractionDigits:d}).format(v);
 const money=v=>v===null?t('N/D','N/A'):new Intl.NumberFormat(en?'en-GB':'it-IT',{style:'currency',currency:'EUR'}).format(v);
 const a=report.totals;
 const issues=Object.values(report.warnings).some(Boolean),priced=report.rows.reduce((s,r)=>s+r.stays-r.missingPeriodAmounts,0);
 const lines=[t('Mese in corso: include soggiorni già avvenuti e prenotazioni future. Non è un consuntivo chiuso.','Current month: includes past stays and future bookings. This is not a closed-period actual.'),t('Disponibilità ipotizzata: una unità per immobile ogni giorno. Chiusure, stagionalità e completezza del calendario non sono verificate.','Assumed availability: one unit per property every day. Closures, seasonality and calendar completeness are not verified.')];
 if(issues)lines.push(t('Sono presenti anomalie: controlla importi, date, sovrapposizioni e collegamenti prima di interpretare i risultati.','Anomalies exist: check amounts, dates, overlaps and links before interpreting results.'));
 if(!a.stays)lines.push(t('Nessuna attività economica registrata nel periodo corrente. Questo non dimostra scarso rendimento o assenza di domanda.','No economic activity recorded in the current period. This does not prove poor performance or lack of demand.'));
 const metrics=[[t('Ricavi prenotati del mese','Monthly booking revenue'),money(a.revenue)],[t('Occupazione registrata','Recorded occupancy'),a.occupancy===null?t('N/D','N/A'):n(a.occupancy)+'%'],['ADR',money(a.adr)],['RevPAR',money(a.revpar)]];
 return `<section style="background:#fff;border:1px solid #dbe5e1;border-radius:22px;padding:26px;color:#0f172a"><p style="font-size:12px;letter-spacing:.08em;color:#047857;font-weight:700">${t('RIEPILOGO OPERATIVO PMS','PMS OPERATIONS SUMMARY')}</p><h2 style="margin:8px 0">${t('Performance operativa PMS','PMS Operating Performance')}</h2><p>${t('Periodo','Period')}: ${esc(report.periodLabel)} | ${t('Ambito: tutte le proprietà caricate','Scope: all loaded properties')}</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px">${metrics.map(([label,value])=>`<div style="padding:16px;background:#f0fdf4;border-radius:12px"><div>${label}</div><strong style="display:block;font-size:23px;margin-top:8px">${value}</strong></div>`).join('')}</div><p>${n(a.stays,0)} ${t('soggiorni nel mese','stays in month')} | ${n(a.nights,0)} ${t('notti prenotate','booked nights')} | ${n(priced,0)}/${n(a.stays,0)} ${t('soggiorni con importo valido','stays with a valid amount')}</p>${lines.map(s=>`<p style="font-size:13px;line-height:1.6">${s}</p>`).join('')}<p style="font-size:13px;line-height:1.6">${t('Per capire lo scostamento scegli immobile e periodo nel report. Incassi, costi e margine effettivi richiedono registrazioni economiche complete.','To understand a variance, choose property and period in the report. Actual receipts, costs and margin require complete financial records.')}</p><div style="display:flex;flex-wrap:wrap;gap:10px"><button type="button" class="btn-dashboard" onclick="openPropertyPerformance()">${t('Analizza immobili e periodo','Analyze properties and period')}</button><button type="button" class="btn-dashboard" onclick="openPMSReportDialog()">${t('PDF operativo - Pro','Operations PDF - Pro')}</button></div></section>`;
}

// Demo metrics never enter ownedPMSReport or the PDF/export pipeline.
export function demoPMSReviewHTML(snapshot,lang='it'){
 if(snapshot?.isDemo!==true)throw Error('DEMO_SNAPSHOT_REQUIRED');
 const en=lang==='en',t=(it,enText)=>en?enText:it;
 const number=(value,options={})=>typeof value==='number'&&Number.isFinite(value)?new Intl.NumberFormat(en?'en-GB':'it-IT',options).format(value):t('N/D','N/A');
 const currency=value=>number(value,{style:'currency',currency:'EUR'});
 const metrics=[[t('Ricavi prenotati del mese','Monthly booking revenue'),currency(snapshot.revenue)],[t('Occupazione registrata','Recorded occupancy'),number(snapshot.occupancy,{maximumFractionDigits:1})+'%'],['ADR',currency(snapshot.adr)],['RevPAR',currency(snapshot.revpar)]];
 return `<section style="padding:26px;background:#fff;border:1px solid #dbe5e1;border-radius:22px"><p><strong>${t('ESEMPIO DIMOSTRATIVO · NON SONO DATI DEL TUO ACCOUNT','ILLUSTRATIVE EXAMPLE · NOT YOUR ACCOUNT DATA')}</strong></p><h2>${t('Performance operativa PMS','PMS Operating Performance')}</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px">${metrics.map(([label,value])=>`<div><span>${label}</span><strong style="display:block;font-size:23px">${value}</strong></div>`).join('')}</div><p>${t('Questi numeri mostrano come leggere prenotazioni e occupazione. I ricavi prenotati non sono incassi o utile.','These figures show how to read bookings and occupancy. Booked revenue is not receipts or profit.')}</p><p>${t('Con Investor puoi organizzare i tuoi immobili e le prenotazioni. Pro aggiunge il confronto con le ipotesi, il PDF e la guida alla lettura.','Investor lets you organize your properties and bookings. Pro adds comparison with assumptions, PDF exports and guided reading.')}</p></section>`;
}
