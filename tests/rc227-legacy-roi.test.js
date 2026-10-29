import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {financialNumber} from '../js/portfolio-kpi.js';
import {readInvestmentAssumptions} from '../js/investment-assumptions.js';
const source=readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');
const start=source.indexOf('const analyses = querySnapshot.docs.map');
const mapping=source.slice(start,source.indexOf('\n});',start)+4);
test('legacy ROI survives dashboard handoff without fabricating visual ROI or changing historical verdict',()=>{
 const fixtures=[{equity:30225,roi:15.393780847,verdict:'WAIT'}, {equity:30225,roi:-4.2,visualROI:0,verdict:'AVOID'}, {equity:30225,roi:0}, {equity:30225,roi:null}];
 const before=JSON.stringify(fixtures);
 const rows=vm.runInNewContext(mapping+'\nanalyses',{readInvestmentAssumptions,financialNumber,dashboardDebug(){},querySnapshot:{docs:fixtures.map((data,i)=>({id:String(i),data:()=>data}))}});
 assert.equal(rows[0].visualROI,null);
 // The professional report uses this exact nullish fallback.
 assert.equal(rows[0].visualROI??rows[0].roi,15.393780847);
 assert.equal(rows[0].verdict,'WAIT');
 assert.equal(rows[1].visualROI??rows[1].roi,0);
 assert.equal(rows[2].visualROI??rows[2].roi,0);
 assert.equal(rows[3].visualROI??rows[3].roi,null);
 assert.equal(JSON.stringify(fixtures),before);
});
