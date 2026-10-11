import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../dashboard-report/index.html',import.meta.url),'utf8');
const code=source.slice(source.indexOf('function populateSimulations(){'),source.indexOf('// ================= INIT =================',source.indexOf('function populateSimulations(){')));
for (const lang of ['it','en']) test(`report selector shows applicable ROI only (${lang})`,()=>{
 const options=[];
 const select={appendChild:o=>options.push(o)};
 const samples=[{equity:0,roi:0},{equity:'0',roi:12},{equity:30000,roi:0},{equity:30000,roi:-4.2},{equity:30000,roi:null},{roi:20},{equity:30000,roi:4,visualROI:5.5}];
 vm.runInNewContext(code+';populateSimulations();',{lang,window:{dashboardSimulations:samples},document:{getElementById:()=>select,createElement:()=>({})}});
 const labels=['N/A','N/A','0.0%','-4.2%','N/A','N/A','5.5%'];
 options.forEach((o,i)=>assert.equal(o.innerText,`City – ${lang==='en'?'Equity ROI':'ROI equity'} ${labels[i]}`));
 assert.equal(select.value,'0');
});
