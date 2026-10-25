// ISTAT administrative identity is independent of the availability of market evidence.
export const MUNICIPALITY_SOURCE='https://www.istat.it/classificazione/codici-dei-comuni-delle-province-e-delle-regioni/';
export const COVERED_MUNICIPALITIES={'058091':'roma','063049':'napoli','015146':'milano','048017':'firenze'};
export const normalizeMunicipalityText=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it').replace(/[^a-z0-9]+/g,' ').trim();
export const municipalityLabel=row=>`${row.name} (${row.province}) · ${row.region}`;
export const municipalityLocation=row=>`${row.name} (${row.province})`;
export const municipalityCoverage=row=>COVERED_MUNICIPALITIES[row?.istat]||null;
export function parseMunicipalities(data){
 if(data?.schemaVersion!==1||data.source!=='ISTAT'||!Array.isArray(data.municipalities)||data.municipalities.length<7800||data.municipalities.length>8500)throw Error('INVALID_MUNICIPALITIES');
 const ids=new Set();return data.municipalities.map(r=>{
  if(!Array.isArray(r)||r.length!==5||!/^\d{6}$/.test(r[0])||ids.has(r[0])||!r.slice(1).every(v=>typeof v==='string'&&v.length<180)||!r[1]||!r[3]||!/^[A-Z]{2}$/.test(r[2]))throw Error('INVALID_MUNICIPALITY');
  ids.add(r[0]);return Object.freeze({istat:r[0],name:r[1],province:r[2],region:r[3],officialName:r[4]});
 });
}
export function searchMunicipalities(rows,query,limit=8){
 const q=normalizeMunicipalityText(query);if(q.length<2)return [];
 const aliases={rome:'roma',naples:'napoli',milan:'milano',florence:'firenze'};const canonical=aliases[q]||q;const terms=canonical.split(' ');
 return rows.map(row=>{const name=normalizeMunicipalityText(row.name),all=normalizeMunicipalityText(municipalityLabel(row)+' '+row.officialName+' '+row.istat);return{row,rank:name===canonical?0:name.startsWith(canonical)?1:2,match:terms.every(t=>all.split(' ').some(word=>word.startsWith(t)))};}).filter(x=>x.match).sort((a,b)=>a.rank-b.rank||a.row.name.localeCompare(b.row.name,'it')||a.row.province.localeCompare(b.row.province)).slice(0,Math.max(1,Math.min(20,limit))).map(x=>x.row);
}
let cached;
export function loadMunicipalities({fetcher=globalThis.fetch}={}){
 if(!cached)cached=(async()=>{const response=await fetcher('/data/geography/municipalities-it.json?v=20261025-rc198',{credentials:'omit'});if(!response.ok)throw Error('MUNICIPALITIES_UNAVAILABLE');return parseMunicipalities(await response.json());})().catch(error=>{cached=null;throw error;});return cached;
}
export function municipalityToolURL(row){return '/tool/?municipality='+encodeURIComponent(row.istat);}
