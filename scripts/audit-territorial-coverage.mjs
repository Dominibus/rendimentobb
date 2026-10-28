// Local consistency and coverage report; no provider requests or production writes.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {REGIONAL_CAPITALS} from '../js/regional-capitals.js';
import {TERRITORIAL_COVERAGE} from '../js/territorial-coverage.js';
import {validateTerritorialData} from '../js/territorial-benchmarks.js';
const root=fileURLToPath(new URL('../',import.meta.url));
export function auditCoverage({directory=root,now=new Date()}={}){
 const read=p=>JSON.parse(fs.readFileSync(path.join(directory,p),'utf8'));
 const config=read('scripts/territorial-sources.json'),catalog=read('data/territorial/catalog.json');
 const keys=rows=>rows.map(c=>c.key).sort().join('|');
 if(keys(config.cities)!==keys(catalog.cities)||keys(config.cities)!==keys(TERRITORIAL_COVERAGE))throw Error('Coverage/config/catalog mismatch');
 const rows=REGIONAL_CAPITALS.map(capital=>{
  const source=config.cities.find(c=>c.key===capital.key);
  const base={city:capital.name,istat:capital.istat,key:capital.key,purchasePrices:'not_imported',longTermRents:'not_imported',tourism:'not_imported',realADR:null,realOccupancy:null,territorialROI:null};
  if(!source)return {...base,nightlyQuotes:'not_validated',reason:'No compatible municipal series validated; no nearest-city replacement'};
  const data=validateTerritorialData(read('data/territorial/'+capital.key+'.json'),capital.key);
  const entry=catalog.cities.find(c=>c.key===capital.key);
  for(const [key,value] of Object.entries(source))if(JSON.stringify(data.city[key])!==JSON.stringify(value))throw Error('Source mismatch: '+capital.key+' '+key);
  if(JSON.stringify(entry)!==JSON.stringify(data.city))throw Error('Catalog/data mismatch: '+capital.key);
  const published=data.rows.filter(r=>r[6]!==null);
  if(published.length!==entry.publishedSegments || !published.length)throw Error('Published segment count mismatch: '+capital.key);
  const ageDays=Math.floor((now-Date.parse(entry.observationEnd+'T00:00:00Z'))/86400000);
  if(ageDays<0)throw Error('Future observation: '+capital.key);
  const today=now.toISOString().slice(0,10);
  return {...base,nightlyQuotes:'documented_public_quotes',classification:'B',source:entry.url,sourceSHA256:entry.sha256,snapshot:entry.snapshot,observationStart:entry.observationStart,observationEnd:entry.observationEnd,ageDays,historical:ageDays>180,eligibleQuotes:entry.eligibleRows,publishedSegments:published.length,segmentsWithStayEnded:published.filter(r=>r[13]<=today).length,geographyFilter:entry.geographyFilter||null,unit:'EUR/base night, before separately quoted fees and taxes',minimumSample:10};
 });
 return {schemaVersion:1,checkedAt:now.toISOString(),verificationScope:'Local schema, administrative coverage and config/catalog/data consistency; not remote raw-file checksum verification or achieved income validation',capitals:rows.length,covered:rows.filter(r=>r.nightlyQuotes==='documented_public_quotes').length,sourceCadence:'Quarterly free provider snapshots; monthly review workflow; no automatic publication',rows};
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=auditCoverage(),output=process.argv[2];
 if(output){fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');}
 console.log(JSON.stringify({capitals:result.capitals,covered:result.covered,notValidated:result.capitals-result.covered}));
}
