import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCommercialModel,createCommercialDemo,calculateCommercial} from '../js/commercial-property-engine.js';
import {createCommercialActivityPlan} from '../js/commercial-activity-plan.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const total=(p,k)=>p.months.reduce((n,m)=>n+m[k],0);
for(const mode of ['room_monthly','weekly_monthly','per_use','mixed'])test('RC195 month/annual reconciliation '+mode,()=>{
 const m=createCommercialDemo(mode);for(const a of m.assignments)a.vat={status:'taxable',rate:22};
 const before=structuredClone(m),p=createCommercialActivityPlan(m),r=calculateCommercial(m);
 for(const key of ['contractualGross','expectedGross','expectedNet','capacity','reserved','free'])near(total(p,key),r[key]);
 assert.deepEqual(m,before);assert.equal(p.receipts,null);assert.equal(p.status,'planning_only');
});
test('RC195 mixed has no fabricated revenue from free rooms or rates multiplied by weeks',()=>{
 const m=createCommercialDemo('mixed'),p=createCommercialActivityPlan(m);assert.equal(total(p,'contractualGross'),14400+5400+3380);
 assert.equal(p.months[0].contracts[1].contractualGross,450);assert.equal(p.months[0].expectedNet,null);
 assert.equal(new Set(m.assignments.map(a=>a.mode)).size,3);
});
test('RC195 closed slots reduce only per-use; fixed monthly contract continues',()=>{
 const m=createCommercialDemo('mixed');m.closures=[{roomId:'*',start:'2027-01-01',end:'2027-01-31'}];
 const jan=createCommercialActivityPlan(m).months[0];assert.equal(jan.capacity,0);assert.equal(jan.free,0);assert.equal(jan.contractualGross,1650);assert.equal(jan.contracts[2].units,0);
});
test('RC195 one-off use must match its actual date, weekday, slot and closures',()=>{
 const m=createCommercialDemo('per_use');Object.assign(m.assignments[0],{start:'2027-03-10',end:'2027-03-10',weekdays:[3],slotIds:['PM']});
 let p=createCommercialActivityPlan(m);assert.equal(total(p,'contractualGross'),75);assert.equal(p.months[2].contracts[0].units,1);
 m.closures=[{roomId:'R1',start:'2027-03-10',end:'2027-03-10'}];p=createCommercialActivityPlan(m);assert.equal(total(p,'contractualGross'),0);
});
test('RC195 consecutive seasonal rates and leap-year prorata reconcile without overlaps',()=>{
 const m=createCommercialDemo('room_monthly');m.year=2028;const a=m.assignments[0];Object.assign(a,{start:'2028-02-15',end:'2028-02-29',vat:{status:'no_vat',rate:null}});
 m.assignments.push({...structuredClone(a),id:'A2',start:'2028-03-01',end:'2028-03-31',amount:1600});
 const p=createCommercialActivityPlan(m);near(p.months[1].contractualGross,1200*15/29);assert.equal(p.months[2].contractualGross,1600);near(total(p,'expectedNet'),calculateCommercial(m).expectedNet);
 assert.equal(p.months[1].starts[0].start,'2028-02-15');assert.equal(p.months[1].ends[0].end,'2028-02-29');
});
test('RC195 dates outside selected year do not invent starts or ends; active VAT remains unknown',()=>{
 const m=createCommercialDemo('room_monthly');Object.assign(m.assignments[0],{start:'2026-11-01',end:'2028-02-29'});const p=createCommercialActivityPlan(m);
 assert.equal(p.months.flatMap(m=>m.starts).length,0);assert.equal(p.months.flatMap(m=>m.ends).length,0);assert.ok(p.months.every(m=>m.expectedNet===null));
});
test('RC195 collision rejected before producing any planning output',()=>{
 const m=createCommercialDemo('mixed');m.assignments.push({...structuredClone(m.assignments[1]),id:'A4'});assert.throws(()=>createCommercialActivityPlan(m),e=>e.code==='collision');
});
test('RC195 empty model has twelve zero months and no fabricated cash receipts',()=>{
 const p=createCommercialActivityPlan(createCommercialModel());assert.equal(p.months.length,12);assert.equal(total(p,'expectedGross'),0);assert.equal(p.receipts,null);assert.ok(p.months.every(m=>m.contracts.length===0));
});
test('RC195 public paths and modules preserve commercial/account boundary',()=>{
 const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
 for(const f of ['js/commercial-activity-plan.js','js/commercial-property-ui.js'])assert.doesNotMatch(read(f),/\b(fetch|localStorage|sessionStorage|addDoc|setDoc)\s*[.(]/);
 for(const lang of ['','en/']){const html=read(lang+'immobili-commerciali/index.html');assert.match(html,/href="#cm-operations"/);assert.match(html,/commercial-property-ui.js\?v=20261028-rc213/);}
 assert.match(read('dashboard/index.html'),/Attività · locali e studi/);assert.match(read('dashboard/index.html'),/href="\/gestione-commerciale\/"/);
});
