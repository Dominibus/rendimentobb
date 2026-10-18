import {calendarDay, stayNights} from './pms-calendar.js';
import {evaluateAvailability} from './pms-availability.js';
import {BOOKING_CSV_HEADERS,normalizeCSVHeader,isPerformanceCSV} from './csv-locales.js?v=20261018-rc151';

export const IMPORT_LIMITS = Object.freeze({bytes:512000, rows:50, columns:60});
export const IMPORT_FIELDS = ['reference','guestName','checkin','checkout','guests','totalAmount','status','currency'];
// A booking-list refresh invalidates report totals, not the owned property directory.
// Actual ownership and availability are rechecked by the booking API on every save.
export function bookingImportContext({userUid,authUid,allowed,demo=false,snapshot={}}={}){
  const canImport=!!userUid&&authUid===userUid&&allowed===true&&!demo;
  const ready=canImport&&snapshot.ownerUid===userUid&&!snapshot.isDemo&&Array.isArray(snapshot.propertyList);
  return {ownerUid:userUid,allowed:canImport,ready,properties:ready?snapshot.propertyList:[]};
}
const aliases = {
  reference:['reference','bookingid','reservationid','confirmationcode','codicediconferma','numerodiprenotazione','numeroprenotazione','reservationnumber','riferimento'],
  guestName:['guestname','guest','nomeospite','ospite','nome'],
  checkin:['checkin','arrival','arrivaldate','datadiarrivo','dataarrivo','startdate','startdateofstay'],
  checkout:['checkout','departure','departuredate','datadipartenza','datapartenza','enddate','enddateofstay'],
  guests:['guests','numberofguests','numerodiospiti','numeroospiti','ospiti'],
  totalAmount:['totalamount','bookingtotal','totalprice','importototale','totalestay','totalesoggiorno','totaleprezzo'],
  status:['status','bookingstatus','reservationstatus','stato'],currency:['currency','valuta']
};
const norm=normalizeCSVHeader;
for(const headers of Object.values(BOOKING_CSV_HEADERS))headers.forEach((header,i)=>{
  const names=aliases[IMPORT_FIELDS[i]],key=norm(header);if(!names.includes(key))names.push(key);
});
const error=code=>{throw Object.assign(new Error(code),{code});};
const clean=(s,max=160)=>String(s??'').replace(/[<>\u0000-\u001f\u007f]/g,'').trim().slice(0,max);

export function bookingCSVKind(headers=[]){
  return isPerformanceCSV(headers) ? 'performance_summary' : 'booking_rows';
}
export function isExampleBooking(row){
  return row?.reference==='DEMO-001' && ['Example guest','Ospite di esempio'].includes(row?.data?.guestName);
}

// Bounded CSV parser: quoted delimiters/newlines, doubled quotes and UTF-8 BOM.
export function parseBookingCSV(input){
  if(typeof input!=='string' || new TextEncoder().encode(input).length>IMPORT_LIMITS.bytes)error('file_too_large');
  if(/\u0000/.test(input))error('invalid_csv');
  const text=input.replace(/^\uFEFF/,'');
  function parse(delimiter){
    const rows=[];let row=[],field='',quoted=false,afterQuote=false;
    const push=()=>{row.push(field);field='';afterQuote=false;if(row.length>IMPORT_LIMITS.columns)error('too_many_columns');};
    const line=()=>{push();if(row.some(v=>v.trim()))rows.push(row);row=[];if(rows.length>IMPORT_LIMITS.rows+1)error('too_many_rows');};
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;afterQuote=true;}}else field+=c;continue;}
      if(c===delimiter){push();continue;}
      if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;line();continue;}
      if(afterQuote){if(c===' '||c==='\t')continue;error('invalid_csv');}
      if(c==='"'){if(field.length)error('invalid_csv');quoted=true;}else field+=c;
    }
    if(quoted)error('invalid_csv');
    if(field.length||row.length||afterQuote)line();
    return rows;
  }
  // Only the header participates in delimiter detection; quoted headers are respected.
  let candidate=null;
  for(const delimiter of [';',',','\t']){
    try{const rows=parse(delimiter);if(rows[0]?.length>1 && (!candidate||rows[0].length>candidate.rows[0].length))candidate={delimiter,rows};}catch(e){if(['file_too_large','too_many_rows','too_many_columns'].includes(e.code))throw e;}
  }
  if(!candidate||candidate.rows.length<2)error('invalid_csv');
  const [headers,...rows]=candidate.rows;
  if(headers.some(h=>!h.trim())||new Set(headers.map(norm)).size!==headers.length)error('invalid_headers');
  if(bookingCSVKind(headers)==='performance_summary')error('performance_summary');
  const mapping={};
  for(const field of IMPORT_FIELDS){const found=headers.map(norm).findIndex(h=>aliases[field].includes(h));mapping[field]=found>=0?found:null;}
  return {headers:headers.map(h=>h.trim()),rows,delimiter:candidate.delimiter,mapping};
}

export function importDate(value,format='iso'){
  const text=String(value??'').trim();let result=text;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(text)){
    const match=text.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
    if(!match||!['dmy','mdy'].includes(format))return null;
    const [,a,b,y]=match;result=`${y}-${(format==='dmy'?b:a).padStart(2,'0')}-${(format==='dmy'?a:b).padStart(2,'0')}`;
  }
  return calendarDay(result)===null?null:result;
}
export function importAmount(value,format='it'){
  let text=String(value??'').trim().replace(/^EUR\s*|\s*EUR$/gi,'').replace(/^€\s*|\s*€$/g,'').trim();
  if(!text)return null;
  const decimal=format==='it'?',':'.',group=format==='it'?'.':',';
  const parts=text.split(decimal);
  if(parts.length>2||(parts[1]!==undefined&&!/^\d{1,2}$/.test(parts[1])))return null;
  const whole=parts[0];
  if(!/^\d+$/.test(whole) && !(whole.includes(group)&&whole.split(group).every((p,i)=>i===0?/^\d{1,3}$/.test(p):/^\d{3}$/.test(p))))return null;
  const number=Number(whole.split(group).join('')+(parts[1]===undefined?'':'.'+parts[1]));
  return Number.isFinite(number)&&number>0&&number<=1e9?number:null;
}
export function importStatus(value){
  const s=norm(value);
  const groups={arrival:['arrival','confirmed','confirmedreservation','confermata','confermato','reserved','booked','ok'],pending:['pending','inattesa','richiesta','request'],checkin:['checkin','checkedin'],checkout:['checkout','checkedout'],completed:['completed','complete','completata','completato'],cancelled:['cancelled','canceled','cancellata','cancellato','annullata','annullato']};
  return Object.keys(groups).find(key=>groups[key].includes(s))||null;
}
export function buildBookingImport(parsed,{mapping=parsed.mapping,propertyId,source='direct',dateFormat='iso',numberFormat='it',defaultGuests='',defaultStatus='arrival',existing=[]}={}){
  if(!/^[A-Za-z0-9_-]{1,128}$/.test(propertyId||''))error('property_required');
  if(!['direct','airbnb','booking','vrbo','other'].includes(source))error('invalid_source');
  if(!['reference','guestName','checkin','checkout','totalAmount'].every(key=>Number.isInteger(mapping[key])&&mapping[key]>=0&&mapping[key]<parsed.headers.length))error('mapping_required');
  const rows=parsed.rows.map((cells,index)=>{
    const row={line:index+2,errors:[],skip:null,data:null,reference:'',selected:false};
    const get=key=>mapping[key]===null||mapping[key]===undefined?'':cells[mapping[key]]??'';
    if(cells.length!==parsed.headers.length)row.errors.push('column_count');
    const reference=String(get('reference')).trim(),guest=String(get('guestName')).trim();row.reference=reference;
    if(!reference||reference.length>128||/[\u0000-\u001f\u007f]/.test(reference))row.errors.push('invalid_reference');
    if(!clean(guest)||guest.length>160)row.errors.push('invalid_guest');
    const checkin=importDate(get('checkin'),dateFormat),checkout=importDate(get('checkout'),dateFormat);
    if(!checkin||!checkout||!stayNights(checkin,checkout))row.errors.push('invalid_dates');
    const guestsRaw=String(mapping.guests==null?defaultGuests:get('guests')).trim();
    const guests=/^\d+$/.test(guestsRaw)?Number(guestsRaw):null;
    if(!Number.isInteger(guests)||guests<1||guests>1000)row.errors.push('invalid_guests');
    const totalAmount=importAmount(get('totalAmount'),numberFormat);if(totalAmount===null)row.errors.push('invalid_amount');
    if(mapping.currency!=null&&String(get('currency')).trim().toUpperCase()!=='EUR')row.errors.push('invalid_currency');
    const status=importStatus(mapping.status==null?defaultStatus:get('status'));if(!status)row.errors.push('invalid_status');
    if(status==='cancelled')row.skip='cancelled';
    row.data={propertyId,guestName:clean(guest),checkin,checkout,guests,totalAmount,status,source};
    return row;
  });
  const groups=new Map();
  for(const row of rows){const list=groups.get(row.reference)||[];list.push(row);groups.set(row.reference,list);}
  for(const list of groups.values())if(list.length>1){
    if(new Set(list.map(r=>JSON.stringify(r.data))).size>1)for(const row of list)row.errors.push('reference_changed');
    else for(const row of list.slice(1))row.skip='duplicate_file';
  }
  const accepted=[];
  for(const row of rows){
    if(row.errors.length||row.skip)continue;
    const known=existing.find(b=>b.propertyId===propertyId&&b.importReference?.source===source&&b.importReference?.reference===row.reference);
    // The API rechecks reference contents; do not silently hide changed exports here.
    if(!known){const decision=evaluateAvailability(row.data,[...existing,...accepted]);if(!decision.available)row.errors.push(decision.reason);}
    if(!row.errors.length){row.selected=true;accepted.push({...row.data,id:`preview-${row.line}`});}
  }
  return rows;
}

export const BOOKING_IMPORT_TEMPLATE='reference;guestName;checkin;checkout;guests;totalAmount;status;currency\r\nDEMO-001;Example guest;2027-01-10;2027-01-12;2;300;confirmed;EUR\r\n';
export function bookingImportTemplate(lang='en'){
  const it=lang==='it',headers=BOOKING_CSV_HEADERS[it?'it':'en'];
  return headers.join(';')+'\r\n'+['DEMO-001',it?'Ospite di esempio':'Example guest','2027-01-10','2027-01-12','2','300',it?'confermata':'confirmed','EUR'].join(';')+'\r\n';
}
