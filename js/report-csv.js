// Text is formula-safe; finite numbers retain their numeric meaning, including negatives.
export function csvCell(value){
 let text=typeof value==='number'?(Number.isFinite(value)?String(value):''):String(value??'');
 if(typeof value!=='number'&&/^[\s]*[=+@-]/.test(text))text="'"+text;
 return '"'+text.replace(/"/g,'""')+'"';
}
const round=(value,decimals)=>typeof value==='number'&&Number.isFinite(value)?Number(value.toFixed(decimals)):null;
export function performanceCSV(report){
 const headers=['property_id','property','period_start_inclusive','period_end_exclusive','recorded_booking_revenue_eur','expected_revenue_eur','revenue_delta_percent','booked_nights','occupancy_percent','adr_eur','link_status','missing_amounts','overlap_nights'];
 const rows=report.performance.rows.map(r=>[r.id,r.name,report.period.start,report.period.end,round(r.revenue,2),round(r.expectedRevenue,2),round(r.revenueDeltaPercent,4),r.nights,round(r.occupancy,4),round(r.adr,2),r.linkState,r.missingPeriodAmounts,r.overlapNights]);
 return '\uFEFF'+[headers,...rows].map(row=>row.map(csvCell).join(';')).join('\r\n');
}
