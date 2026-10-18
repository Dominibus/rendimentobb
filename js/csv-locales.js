// Shared column definitions keep localized downloads readable and import detection exact.
export const BOOKING_CSV_HEADERS={
 it:['Riferimento prenotazione','Nome ospite','Data arrivo','Data partenza','Numero ospiti','Totale soggiorno EUR','Stato','Valuta'],
 en:['Booking reference','Guest name','Check-in','Check-out','Guest count','Stay total EUR','Status','Currency']
};
export const PERFORMANCE_CSV_HEADERS={
 legacy:['property_id','property','period_start_inclusive','period_end_exclusive','recorded_booking_revenue_eur','expected_revenue_eur','revenue_delta_percent','booked_nights','occupancy_percent','adr_eur','link_status','missing_amounts','overlap_nights','revpar_eur','expected_occupancy_percent','expected_adr_eur','snapshot_at','revenue_basis','period_status'],
 it:['ID immobile','Immobile','Inizio periodo incluso','Fine periodo esclusa','Ricavi prenotati EUR','Ricavi previsti EUR','Scostamento ricavi percentuale','Notti prenotate','Occupazione percentuale','ADR EUR','Collegamento analisi','Prenotazioni senza importo','Notti sovrapposte','RevPAR EUR','Occupazione prevista percentuale','ADR previsto EUR','Dati aggiornati al','Tipo ricavi','Stato periodo'],
 en:['Property ID','Property','Period start inclusive','Period end exclusive','Booked revenue EUR','Expected revenue EUR','Revenue variance percent','Booked nights','Occupancy percent','ADR EUR','Analysis link','Bookings without amount','Overlapping nights','RevPAR EUR','Expected occupancy percent','Expected ADR EUR','Snapshot at','Revenue basis','Period status']
};
export const normalizeCSVHeader=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function isPerformanceCSV(headers=[]){
 const keys=new Set(headers.map(normalizeCSVHeader));
 return Object.values(PERFORMANCE_CSV_HEADERS).some(schema=>[0,2,3,4,7].every(i=>keys.has(normalizeCSVHeader(schema[i]))));
}
