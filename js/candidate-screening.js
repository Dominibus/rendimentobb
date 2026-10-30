// Candidate inputs and explainable filters only. No financial engine, network or account writes.
import {safeListingURL} from './property-comparison.js?v=20261020-rc167';
import {parseBookingCSV,importAmount} from './booking-import.js';
import {csvCell} from './report-csv.js?v=20261023-rc191';
export const CANDIDATE_LIMIT=50;
export const ECONOMIC_FIELDS=['equity','priceNight','occupancy','expenses','commission','tax','interestRate','loanYears'];
export const CANDIDATE_FIELDS=['reference','city','zone','price','sqm','works','other',...ECONOMIC_FIELDS,'url','date'];
export const CANDIDATE_HEADERS=['reference','city','zone','price_eur','area_sqm','works_eur','other_upfront_eur','equity_eur','nightly_eur','occupancy_pct','monthly_costs_eur','commission_pct','model_tax_pct','interest_pct','loan_years','listing_url','checked_on'];
const fieldHeaders=Object.fromEntries(CANDIDATE_FIELDS.map((f,i)=>[CANDIDATE_HEADERS[i],f]));
const numeric=['price','sqm','works','other',...ECONOMIC_FIELDS];
const limits={price:1e8,sqm:10000,works:1e8,other:1e8,equity:1e8,priceNight:1e6,occupancy:100,expenses:1e8,commission:100,tax:100,interestRate:100,loanYears:100};
const text=(raw,max=80)=>{const s=String(raw??'').trim();return s.length<=max&&!/[<>\u0000-\u001f\u007f]/.test(s)&&!/^\s*[=+@-]/.test(s)?s:null;};
export const normalizeCandidateText=v=>String(v??'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function candidateNumber(raw,format='it'){
 if(raw===null||raw===undefined||String(raw).trim()==='')return null;
 if(typeof raw==='number')return Number.isFinite(raw)&&raw>=0?raw:NaN;
 if(typeof raw!=='string'||!['it','en'].includes(format))return NaN;
 const s=raw.trim().replace(/^EUR\s*|\s*EUR$/gi,'').replace(/^€\s*|\s*€$/g,'').trim();
 // Existing importAmount accepts positives only; preserve intentional zero separately.
 if((format==='it'?/^0+(?:\.000)*(?:,0{1,2})?$/:/^0+(?:,000)*(?:\.0{1,2})?$/).test(s))return 0;
 return importAmount(raw,format)??NaN;
}
export function validateCandidate(raw,{format='it',origin='manual'}={}){
 const errors=[],candidate={};
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {valid:false,errors:['record'],candidate:null};
 if(Object.keys(raw).some(k=>!CANDIDATE_FIELDS.includes(k)))errors.push('unexpected_fields');
 const reference=String(raw.reference??'').trim();
 if(!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(reference))errors.push('reference');
 candidate.reference=reference;
 for(const f of ['city','zone']){candidate[f]=text(raw[f]);if(candidate[f]===null)errors.push(f);}
 for(const f of numeric){const n=candidateNumber(raw[f],format);candidate[f]=n;
  if(n!==null&&(!Number.isFinite(n)||n>limits[f]||n<0||(['price','sqm','loanYears'].includes(f)&&n===0)||(f==='loanYears'&&!Number.isInteger(n))))errors.push(f);
 }
 if(candidate.price!==null&&candidate.equity!==null&&candidate.equity>candidate.price)errors.push('equity');
 candidate.url=safeListingURL(raw.url);if(candidate.url===null)errors.push('url');
 const date=String(raw.date??'').trim(),d=new Date(date+'T00:00:00Z');
 candidate.date=date;
 if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==date))errors.push('date');
 candidate.origins=Object.fromEntries(CANDIDATE_FIELDS.filter(f=>raw[f]!==undefined&&String(raw[f]).trim()!=='').map(f=>[f,origin]));
 return {valid:!errors.length,errors,candidate};
}
export function candidateCSVPreview(input,{existing=[],format='it'}={}){
 const parsed=parseBookingCSV(input),headers=parsed.headers;
 if(headers.some(h=>!Object.hasOwn(fieldHeaders,h))||!headers.includes('reference'))throw Object.assign(Error('candidate_headers'),{code:'candidate_headers'});
 const refs=new Map();
 const rows=parsed.rows.map((row,i)=>{
  const raw=Object.fromEntries(headers.map((h,index)=>[fieldHeaders[h],row[index]??'']));
  const checked=validateCandidate(raw,{format,origin:'csv'});
  if(row.length!==headers.length)checked.errors.push('column_count');
  const c=checked.candidate;if(c){refs.set(normalizeCandidateText(c.reference),(refs.get(normalizeCandidateText(c.reference))||0)+1);}
  return {line:i+2,...checked};
 });
 for(const r of rows){const c=r.candidate;
  if(c&&(refs.get(normalizeCandidateText(c.reference))>1||existing.some(e=>normalizeCandidateText(e.reference)===normalizeCandidateText(c.reference))))r.errors.push('duplicate_reference');
  if(c?.url&&(existing.some(e=>e.url===c.url)||rows.filter(x=>x.candidate?.url===c.url).length>1))r.errors.push('duplicate_url');
  r.valid=!r.errors.length;
 }
 return rows;
}
export function commitCandidatePreview(existing,preview,selected){
 const rows=preview.filter(r=>selected.includes(r.line));
 if(!rows.length||rows.length!==selected.length||new Set(selected).size!==selected.length||rows.some(r=>!r.valid)||existing.length+rows.length>CANDIDATE_LIMIT)throw Error('selection');
 const ids=new Set(existing.map(c=>normalizeCandidateText(c.reference))),urls=new Set(existing.filter(c=>c.url).map(c=>c.url));
 for(const r of rows){if(ids.has(normalizeCandidateText(r.candidate.reference))||(r.candidate.url&&urls.has(r.candidate.url)))throw Error('duplicate');ids.add(normalizeCandidateText(r.candidate.reference));if(r.candidate.url)urls.add(r.candidate.url);}
 return [...existing,...rows.map(r=>r.candidate)];
}
export function validateCandidateCriteria(raw={},format='it'){
 const values={},errors=[];
 for(const f of ['maxTotal','minArea','availableCapital']){const n=candidateNumber(raw[f],format);values[f]=n;if(n!==null&&(!Number.isFinite(n)||n>1e8))errors.push(f);}
 for(const f of ['city','zone','preferredZone']){values[f]=text(raw[f]);if(values[f]===null)errors.push(f);}
 return {values,errors,valid:!errors.length};
}
export function evaluateCandidate(c,criteria){
 const missing=['city','price','sqm','works','other'].filter(f=>c[f]===null||c[f]===''),reasons=[];
 const total=['price','works','other'].every(f=>c[f]!==null)?c.price+c.works+c.other:null;
 const required=[criteria.maxTotal,criteria.minArea,criteria.availableCapital,criteria.city||null,criteria.zone||null].some(v=>v!==null&&v!==undefined);
 if(!required)missing.push('criteria');
 for(const [criterion,field,actual,match]of [
  ['maxTotal','total',total,n=>n<=criteria.maxTotal],['minArea','sqm',c.sqm,n=>n>=criteria.minArea],['availableCapital','equity',c.equity,n=>n<=criteria.availableCapital]
 ])if(criteria[criterion]!==null&&criteria[criterion]!==undefined){if(actual===null)missing.push(field);else if(!match(actual))reasons.push({code:criterion,field,actual,expected:criteria[criterion]});}
 for(const f of ['city','zone'])if(criteria[f]){
  if(!c[f])missing.push(f);else if(normalizeCandidateText(c[f])!==normalizeCandidateText(criteria[f]))reasons.push({code:f,field:f,actual:c[f],expected:criteria[f]});
 }
 return {candidate:c,total,status:reasons.length?'outside':missing.length?'insufficient':'compatible',missing:[...new Set(missing)],reasons,
  preference:criteria.preferredZone?{field:'zone',requested:criteria.preferredZone,matches:c.zone?normalizeCandidateText(c.zone)===normalizeCandidateText(criteria.preferredZone):null}:null};
}
export function orderCandidateRows(rows,sort='entered'){
 if(sort==='entered')return [...rows];
 const [field,direction]=sort.split(':');if(!['price','total','sqm'].includes(field)||!['asc','desc'].includes(direction))return [...rows];
 const value=r=>field==='total'?r.total:r.candidate[field];
 return rows.map((r,i)=>({r,i})).sort((a,b)=>{const incomplete=Number(a.r.missing.length>0)-Number(b.r.missing.length>0);if(incomplete)return incomplete;const x=value(a.r),y=value(b.r);if(x===null||y===null)return x===y?a.i-b.i:x===null?1:-1;return (direction==='asc'?x-y:y-x)||a.i-b.i;}).map(x=>x.r);
}
export function applyCandidateAssumptions(candidates,selected,raw,format='it'){
 if(!selected.length||selected.some(id=>!candidates.some(c=>c.reference===id))||Object.keys(raw).some(f=>!ECONOMIC_FIELDS.includes(f)))throw Error('assumptions');
 const checked=validateCandidate({reference:'COMMON',...raw},{format,origin:'common'});if(!checked.valid)throw Error(checked.errors.join(', '));
 const fields=ECONOMIC_FIELDS.filter(f=>checked.candidate[f]!==null);if(!fields.length)throw Error('assumptions');
 const result=candidates.map(c=>selected.includes(c.reference)?{...c,...Object.fromEntries(fields.map(f=>[f,checked.candidate[f]])),origins:{...c.origins,...Object.fromEntries(fields.map(f=>[f,'common']))}}:c);
 if(result.some(c=>!validateCandidate(Object.fromEntries(CANDIDATE_FIELDS.map(f=>[f,c[f]]))).valid))throw Error('assumptions');
 return result;
}
const transferFields=['city','price','sqm',...ECONOMIC_FIELDS];
export function candidateToolURL(c){
 const p=new URLSearchParams({c_reference:c.reference});
 for(const f of transferFields)if(c[f]!==null&&c[f]!==undefined&&c[f]!=='')p.set('c_'+f,String(c[f]));
 return '/tool/?from=candidate#'+p;
}
export function readCandidateTransfer(search,hash=''){
 const parts=String(search).split('#');
 const p=new URLSearchParams(parts[0]);
 if(p.get('from')!=='candidate')return {status:'absent'};
 const fragment=new URLSearchParams((hash||parts[1]||'').replace(/^#/,''));
 for(const [k,v] of fragment)p.append(k,v);if(p.get('from')!=='candidate')return {status:'absent'};
 if(p.getAll('from').length!==1||[...p.keys()].some(k=>k.startsWith('c_')&&!['c_reference',...transferFields.map(f=>'c_'+f)].includes(k)))return {status:'invalid'};
 const raw={};for(const f of ['reference',...transferFields]){const k='c_'+f;if(p.getAll(k).length>1)return {status:'invalid'};if(p.has(k))raw[f]=p.get(k);}
 const checked=validateCandidate(raw,{format:'en',origin:'candidate'});
 return checked.valid?{status:'valid',candidate:checked.candidate}:{status:'invalid'};
}
export function candidateTemplate(){
 const rows=[CANDIDATE_HEADERS,
 ['C-001','Roma','Nord',150000,70,10000,5000,30000,120,60,300,15,21,3.5,20,'','2026-10-30'],
 ['C-002','Roma','Sud',260000,50,0,10000,'','','','','','','','','',''],
 ['C-003','Roma','Nord',170000,'','','','','','','','','','','','','']];
 return '\uFEFF'+rows.map(r=>r.map(v=>csvCell(v,'it')).join(';')).join('\r\n');
}
