// Local integrity and age report only. Provider's newest semester requires a fresh official export.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {validateOMI,OMI_IDENTITIES} from '../js/omi-context.js';
const root=fileURLToPath(new URL('../',import.meta.url));const now=new Date();const cities=[];
for(const key of Object.keys(OMI_IDENTITIES)){
 const d=JSON.parse(fs.readFileSync(path.join(root,'data/omi',key+'.json'),'utf8'));validateOMI(d,d.municipality.istat);
 const days=Math.floor((now-new Date(d.source.acquiredAt+'T00:00:00Z'))/86400000);
 cities.push({istat:d.municipality.istat,key,period:d.period,zones:d.zones.length,quotations:d.rows.length,acquiredAt:d.source.acquiredAt,daysSinceAcquisition:days,manualReviewDue:days>=180||days<0});
}
const report={checkedAt:now.toISOString(),verificationScope:'Checked-in dataset integrity and elapsed acquisition time only; newest provider semester not checked',latestProviderPeriodChecked:false,reviewCadenceDays:180,published:false,cities};
if(process.argv[2]){const target=path.resolve(process.argv[2]);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');}else console.log(JSON.stringify(report,null,2));
