import {REGIONAL_CAPITALS} from './regional-capitals.js?v=20261026-rc199';
export const TOURISM_SOURCE='https://esploradati.istat.it/databrowser/DWL/Servizi/DCSC_Occupancy_in_collective_accommodation.zip';
export function validateTourismContext(data){
 const fail=()=>{throw new Error('Invalid ISTAT tourism context');};
 const acquired=new Date(data?.acquiredAt+'T00:00:00Z');
 if(!Number.isFinite(acquired.getTime())||acquired.toISOString().slice(0,10)!==data?.acquiredAt)fail();
 if(data?.schemaVersion!==1||data.year!==2025||!/^\d{4}-\d{2}-\d{2}$/.test(data.acquiredAt||'')||data.source?.provider!=='ISTAT'||data.source.flow!=='IT1/DF_BULK_DCSC_OCCUPCOLLE/1.0'||data.source.annualSheet!=='Comunali annuali | Annual data'||data.source.monthlySheet!=='Comunali Mensili | Monthly data'||data.source.downloadURL!==TOURISM_SOURCE||data.source.workbook!=='2_dati_comunali.xlsx'||data.source.license!=='CC BY 4.0'||!/^[a-f0-9]{64}$/.test(data.source.workbookSHA256||'')||data.records?.length!==20)fail();
 if(data.crosswalk?.old!=='092009'||data.crosswalk.current!=='118006'||data.crosswalk.effectiveFrom!=='2026-01-01'||data.crosswalk.sourceURL!=='https://www.istat.it/wp-content/uploads/2024/09/Codici-statistici-e-denominazioni-delle-unita-amministrative-della-Sardegna.zip')fail();
 const seen=new Set(),integer=v=>Number.isSafeInteger(v)&&v>=0;
 for(const r of data.records){
  const identity=REGIONAL_CAPITALS.find(c=>c.istat===r.istat);
  if(!identity||seen.has(r.istat)||r.key!==identity.key||r.name!==identity.name||r.sourceIstat!==(r.key==='cagliari'?'092009':r.istat)||r.flag!=='f'||!integer(r.arrivals)||!integer(r.personNights)||!Number.isSafeInteger(r.annualSourceRow)||r.annualSourceRow<7||!Number.isSafeInteger(r.monthlySourceRow)||r.monthlySourceRow<5||r.months?.length!==12)fail();
  seen.add(r.istat);
  for(const [i,m]of r.months.entries())if(m.month!==i+1||!integer(m.arrivals)||!integer(m.personNights))fail();
  if(r.months.reduce((s,m)=>s+m.arrivals,0)!==r.arrivals||r.months.reduce((s,m)=>s+m.personNights,0)!==r.personNights)fail();
 }
 return data;
}
export function tourismMunicipality(data,istat){return typeof istat==='string'?data.records.find(r=>r.istat===istat)||null:null;}
export async function loadTourismContext(){
 const response=await fetch('/data/tourism/istat-capitals-2025.json',{credentials:'omit',cache:'no-cache'});
 if(!response.ok)throw new Error('ISTAT context unavailable');
 return validateTourismContext(await response.json());
}
