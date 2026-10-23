// Public source-derived asking prices. Never a substitute for booked ADR, occupancy or ROI.
export const TERRITORIAL_METHOD='quoted-nightly-subtotal-v1';
export const SEGMENT_FIELDS=['zone','propertyType','roomType','capacity','stayMonth','stayLength'];
const aliases={naples:'napoli',rome:'roma',milan:'milano',florence:'firenze'};
export function territorialCity(value){const key=String(value||'').trim().toLowerCase();return ['napoli','roma','milano','firenze'].includes(key)?key:Object.hasOwn(aliases,key)?aliases[key]:null;}
const validDate=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
export function validateTerritorialData(data,city){
 if(data?.schemaVersion!==1||data.methodVersion!==TERRITORIAL_METHOD||data.minimumSample!==10||data.city?.key!==city||!Array.isArray(data.rows)||!data.rows.length||data.rows.length>30000)throw Error('INVALID_TERRITORIAL_DATA');
 if(!/^https:\/\/data\.insideairbnb\.com\/italy\//.test(data.city.url||'')||!validDate(data.city.snapshot)||!validDate(data.city.observationStart)||!validDate(data.city.observationEnd)||!Number.isSafeInteger(data.city.eligibleRows))throw Error('INVALID_TERRITORIAL_SOURCE');
 for(const row of data.rows){
  if(!Array.isArray(row)||row.length!==14||![0,1,2,4,5].every(i=>typeof row[i]==='string'&&row[i].length>0&&row[i].length<=180)||!Number.isSafeInteger(row[3])||row[3]<1||row[3]>100||!/^\d{4}-\d{2}$/.test(row[4])||!['1','2-3','4-7','8-27'].includes(row[5]))throw Error('INVALID_TERRITORIAL_SEGMENT');
  if(row[6]===null){if(row.slice(7).some(v=>v!==null))throw Error('UNSAFE_SPARSE_SEGMENT');continue;}
  if(!Number.isSafeInteger(row[6])||row[6]<10||row[6]>data.city.eligibleRows||!row.slice(7,10).every(v=>typeof v==='number'&&Number.isFinite(v)&&v>0)||row[7]>row[8]||row[8]>row[9]||!row.slice(10).every(validDate)||row[10]>row[11]||row[12]>=row[13]||row[12].slice(0,7)!==row[4])throw Error('INVALID_TERRITORIAL_VALUES');
 }
 return data;
}
export function exactTerritorialSegment(rows,selection){return rows.find(row=>SEGMENT_FIELDS.every((field,i)=>String(row[i])===String(selection[field])))||null;}
export function territorialSummary(data,row,now=Date.now()){
 if(!row)return {status:'no_match',median:null,occupancy:null,adr:null,roi:null};
 const age=Math.floor((Number(now)-Date.parse(data.city.observationEnd+'T00:00:00Z'))/86400000);
 return {status:row[6]===null?'insufficient_sample':'available',city:data.city.key,source:data.city.url,snapshot:data.city.snapshot,observationStart:row[10],observationEnd:row[11],stayStart:row[12],stayEnd:row[13],ageDays:age,stale:age>180,minimumSample:10,
  n:row[6],p25:row[7],median:row[8],p75:row[9],currency:'EUR',measure:'advertised_base_nightly_rate',classification:'B',inputClassification:'D_documented_public_quote',verifiedBookings:false,occupancy:null,adr:null,roi:null};
}
const pending=new Map();
export async function loadTerritorialCity(value,{fetcher=globalThis.fetch}={}){
 const city=territorialCity(value);if(!city)throw Error('CITY_NOT_COVERED');
 if(!pending.has(city))pending.set(city,(async()=>{const res=await fetcher('/data/territorial/'+city+'.json?v=20261023-rc192',{credentials:'omit'});if(!res.ok)throw Error('TERRITORIAL_FETCH_FAILED');return validateTerritorialData(await res.json(),city);})().catch(error=>{pending.delete(city);throw error;}));
 return pending.get(city);
}
export function territorialCSV(data,row,lang='it'){
 const summary=territorialSummary(data,row);if(summary.status!=='available')return null;
 const en=lang==='en';
 const headers=en?['Report type','City','Source area','Reported property type','Room type','Reported capacity','Quoted check-in month','Quoted stay length nights','Listings in segment','Base nightly price P25 EUR','Median base nightly price EUR','Base nightly price P75 EUR','Observation start','Observation end','Quoted stay start','Quoted stay end exclusive','Source snapshot','Source URL','License','Measure','Method version','Booked ADR','Actual occupancy','Territorial ROI']
 :['Tipo report','Città','Zona della fonte','Tipologia dichiarata','Uso alloggio','Capienza dichiarata','Mese arrivo quotato','Durata quotata notti','Annunci nel segmento','Prezzo base notte P25 EUR','Mediana prezzo base notte EUR','Prezzo base notte P75 EUR','Inizio osservazioni','Fine osservazioni','Inizio soggiorni quotati','Fine soggiorni quotati esclusa','Snapshot fonte','URL fonte','Licenza','Misura','Versione metodo','ADR incassato','Occupazione reale','ROI territoriale'];
 const values=['RendimentoBB Territorial Quote Reference v1',data.city.name,...row.slice(0,6),row[6],row[7],row[8],row[9],row[10],row[11],row[12],row[13],data.city.snapshot,data.city.url,'https://creativecommons.org/licenses/by/4.0/','advertised_base_nightly_rate_before_separate_fees_taxes_discounts',TERRITORIAL_METHOD,null,null,null];
 const cell=value=>{let s=value==null?'':typeof value==='number'&&Number.isFinite(value)?String(value).replace('.',en?'.':','):String(value);if(typeof value!=='number'&&/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
 return '\uFEFF'+[headers,values].map(line=>line.map(cell).join(';')).join('\r\n');
}
