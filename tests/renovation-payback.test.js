import test from 'node:test';
import assert from 'node:assert/strict';
import {renovationRecovery,renovationRecoveryHTML} from '../js/renovation-payback.js';
const property={name:'Test',renovationPlan:{items:[{actualCost:6000,estimatedCost:20000},{actualCost:4000}],metrics:{actualSpent:99999}},investmentSnapshot:{annualCashflow:5000}};
test('actual items override cached totals and forecasts exclude estimated costs',()=>{
 const r=renovationRecovery([property]);assert.equal(r.totalSpent,10000);assert.equal(r.rows[0].paybackYears,2);
 assert.deepEqual(r.rows[0].projections.map(p=>p.balance),[-5000,5000,15000]);
 assert.equal(property.renovationPlan.metrics.actualSpent,99999);
});
test('missing cashflow and invalid actual costs do not invent recovery',()=>{
 const p={...property,investmentSnapshot:{}};let r=renovationRecovery([p]).rows[0];assert.equal(r.paybackYears,null);assert.equal(r.projections[0].balance,null);
 r=renovationRecovery([{...property,renovationPlan:{items:[{actualCost:-1}]}}]);assert.equal(r.totalSpent,null);
 assert.equal(renovationRecovery([{...property,investmentSnapshot:{annualCashflow:0}}]).rows[0].paybackYears,null);
 assert.equal(renovationRecovery([{...property,investmentSnapshot:{annualCashflow:-1000}}]).rows[0].projections[0].balance,-11000);
});
test('both languages distinguish recorded costs from model forecasts and escape property names',()=>{
 for(const lang of ['it','en']){
  const h=renovationRecoveryHTML([{...property,name:'<img src=x onerror=alert(1)>'}],lang);
  assert.doesNotMatch(h,/<img/);assert.match(h,/&lt;img/);assert.match(h,/1 \/ 3 \/ 5/);
  assert.match(h,lang==='it'?/Non indica incassi reali/:/does not show actual receipts/);
 }
});
