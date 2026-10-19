import {BOOKING_EXPORT_HEADERS} from './csv-locales.js?v=20261019-rc152';
import {csvCell} from './report-csv.js?v=20261019-rc152';
import {stayNights} from './pms-calendar.js';

const id=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(value);
export function selectBookingRows(rows,{status='all',search=''}={}){
 const q=String(search).trim().toLocaleLowerCase();
 return rows.filter(b=>(status==='all'||b.status===status)&&(!q||[b.id,b.guestName,b.importReference?.reference].some(v=>String(v||'').toLocaleLowerCase().includes(q))));
}
export const bookingStatusLabel=(status,lang='it')=>({pending:['In attesa','Pending'],arrival:['Confermata · arrivo da registrare','Confirmed · arrival not recorded'],checkin:['Check-in registrato','Check-in recorded'],checkout:['Check-out registrato','Check-out recorded'],completed:['Completata','Completed'],cancelled:['Cancellata','Cancelled']}[status]?.[lang==='en'?1:0]||String(status||''));
const sourceLabel=(source,lang)=>({direct:['Diretta','Direct'],airbnb:['Airbnb','Airbnb'],booking:['Booking.com','Booking.com'],vrbo:['Vrbo','Vrbo'],other:['Altro','Other']}[source]?.[lang==='en'?1:0]||String(source||''));
export function bookingExportCSV(rows,{ownerUid,properties=[],lang='it',snapshotAt=new Date().toISOString()}={}){
 if(!ownerUid||!Array.isArray(rows)||!rows.length)throw Error('EXPORT_NOT_READY');
 const directory=new Map(properties.map(p=>[p.id,p]));
 if(rows.some(b=>b.uid!==ownerUid||!id(b.id)||!directory.has(b.propertyId)))throw Error('EXPORT_SCOPE_CHANGED');
 const locale=lang==='en'?'en':'it';
 const data=rows.map(b=>{
  const nights=stayNights(b.checkin,b.checkout),amount=typeof b.totalAmount==='number'&&Number.isFinite(b.totalAmount)?Math.round(b.totalAmount*100)/100:null;
  return ['RendimentoBB-Prenotazioni-v1',b.id,b.propertyId,directory.get(b.propertyId).name||b.propertyId,b.importReference?.reference||'',b.guestName||'',b.checkin||'',b.checkout||'',Number.isInteger(b.guests)?b.guests:null,nights>0?nights:null,amount,'EUR',bookingStatusLabel(b.status,locale),sourceLabel(b.source,locale),b.importReference?sourceLabel(b.importReference.source,locale):'',snapshotAt];
 });
 return '\uFEFF'+[BOOKING_EXPORT_HEADERS[locale],...data].map(row=>row.map(v=>csvCell(v,locale)).join(';')).join('\r\n');
}

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function bookingIdentityHTML(bookingId,t){
 if(!id(bookingId))return '';
 return `<div class="rb-booking-id"><span>${t('ID prenotazione','Booking ID')}</span><code>${esc(bookingId)}</code><button type="button" data-copy-booking-id="${esc(bookingId)}">${t('Copia ID','Copy ID')}</button></div>`;
}
