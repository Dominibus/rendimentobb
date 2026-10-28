import {REGIONAL_CAPITALS} from './regional-capitals.js?v=20261026-rc199';
export const OMI_SOURCE='https://www.agenziaentrate.gov.it/portale/schede/fabbricatiterreni/omi/forniture-dati-omi-cittadini';
export const OMI_IDENTITIES=Object.freeze({ancona:['11042002','A271'],aosta:['2007003','A326'],bari:['16072006','A662'],bologna:['8037006','A944'],cagliari:['20092009','B354'],campobasso:['14070006','B519'],catanzaro:['18079023','C352'],firenze:['9048017','D612'],genova:['7010025','D969'],'l-aquila':['13066049','A345'],milano:['3015146','F205'],napoli:['15063049','F839'],palermo:['19082053','G273'],perugia:['10054039','G478'],potenza:['17076063','G942'],roma:['12058091','H501'],torino:['1001272','L219'],trento:['4022205','L378'],trieste:['6032006','L424'],venezia:['5027042','L736']});
export const OMI_FIELDS=['zone','type','typeLabel','state','prevalent','saleMin','saleMax','saleSurface','rentMin','rentMax','rentSurface','sourceRow'];
export const omiCapital=istat=>REGIONAL_CAPITALS.find(c=>c.istat===istat)||null;
export function validateOMI(data,istat){
 const fail=()=>{throw new Error('Invalid OMI context');},c=omiCapital(istat),m=data?.municipality,s=data?.source;
 if(!c||data?.schemaVersion!==1||data.period!=='2026/1'||m?.istat!==istat||m.key!==c.key||m.name!==c.name||m.province!==c.province||m.sourceIstat!==OMI_IDENTITIES[c.key][0]||m.cadastral!==OMI_IDENTITIES[c.key][1])fail();
 if(s?.provider!=='Agenzia Entrate - OMI'||s.url!==OMI_SOURCE||s.license!=='CC BY 4.0'||s.elaboratedAt!=='2026-10-15'||!/^\d{4}-\d{2}-\d{2}$/.test(s.acquiredAt||'')||['archiveSHA256','valuesSHA256','zonesSHA256'].some(k=>!/^[a-f0-9]{64}$/.test(s[k]||''))||JSON.stringify(data.fields)!==JSON.stringify(OMI_FIELDS))fail();
 const acquired=new Date(s.acquiredAt+'T00:00:00Z');if(!Number.isFinite(acquired.getTime())||acquired.toISOString().slice(0,10)!==s.acquiredAt||s.acquiredAt<s.elaboratedAt)fail();
 if(!Array.isArray(data.zones)||!data.zones.length||!Array.isArray(data.rows)||!data.rows.length)fail();
 const zones=new Set(),seen=new Set();
 for(const z of data.zones){if(typeof z.id!=='string'||zones.has(z.id)||!/^(?:[BCDE]\d+[A-Z]?|R\d*[A-Z]?)$/.test(z.code)||typeof z.section!=='string'||typeof z.description!=='string'||!z.description||!Number.isSafeInteger(z.sourceRow)||z.sourceRow<3||z.id!==[m.cadastral,z.section,z.code,z.linkZone].join('|'))fail();zones.add(z.id);}
 for(const r of data.rows){
  if(!Array.isArray(r)||r.length!==12||!zones.has(r[0])||!/^\d+$/.test(r[1])||typeof r[2]!=='string'||!r[2]||!['NORMALE','OTTIMO','SCADENTE'].includes(r[3])||typeof r[4]!=='boolean'||!Number.isSafeInteger(r[11])||r[11]<3)fail();
  const key=JSON.stringify(r.slice(0,2).concat(r[3]));if(seen.has(key))fail();seen.add(key);
  for(const i of [5,8]){const [low,high,surface]=r.slice(i,i+3);if(low===null&&high===null){if(![null,'L','N'].includes(surface))fail();}else if(!Number.isFinite(low)||!Number.isFinite(high)||low<=0||high<low||!['L','N'].includes(surface))fail();}
 }
 return data;
}
export function exactOMIRow(data,zone,type,state){return data.rows.find(r=>r[0]===zone&&r[1]===type&&r[3]===state)||null;}
export async function loadOMI(istat){
 const city=omiCapital(istat);if(!city)throw new Error('OMI coverage unavailable');
 const response=await fetch('/data/omi/'+city.key+'.json',{credentials:'omit',cache:'no-cache'});if(!response.ok)throw new Error('OMI source unavailable');return validateOMI(await response.json(),istat);
}
