import test from 'node:test';
import assert from 'node:assert/strict';
import {readInvestmentAssumptions,buildInvestmentAssumptions,investmentAssumptionsHTML} from '../js/investment-assumptions.js';
globalThis.window={};
const {calculateROI}=await import('../js/roi-engine.js');
const inputs={price:150000,equity:30000,priceNight:150,occupancy:70,expenses:2500,expensesUnit:'monthly_eur',commission:15,tax:21,loanAmount:90000,interestRate:4.1,loanYears:25};
test('saved assumptions reproduce engine outputs including custom loan and negative cashflow',()=>{
 const result=calculateROI(inputs);const snapshot=buildInvestmentAssumptions(result,inputs,'simulator');assert.ok(snapshot);assert.equal(snapshot.loanAmount,90000);
 const reload=JSON.parse(JSON.stringify(snapshot));const again=calculateROI({...reload,price:reload.propertyPrice});
 for(const key of ['roi','realROI','netAfterMortgage','noi','dscr','risk','gross','mortgageYearly'])assert.equal(again[key],result[key],key);
 assert.ok(again.roi<0);assert.equal(snapshot.interestRate,4.1);assert.equal(snapshot.loanYears,25);
});
test('home snapshot preserves explicit percentage units and reproduces costs',()=>{
 const i={...inputs,expenses:35,expensesUnit:'percentage'};const result=calculateROI(i);const a=buildInvestmentAssumptions(result,i,'home_preview');
 assert.equal(a.expenses,35);assert.equal(a.expensesUnit,'percentage');assert.equal(calculateROI({...a,price:a.propertyPrice}).expensesYearly,result.expensesYearly);
});
test('zero assumptions remain zero and missing legacy snapshots stay missing',()=>{
 const i={...inputs,loanAmount:0,expenses:0,commission:0,tax:0,interestRate:0};const a=buildInvestmentAssumptions(calculateROI(i),i,'simulator');
 for(const key of ['expenses','commission','tax','interestRate','loanAmount'])assert.equal(a[key],0);
 assert.equal(readInvestmentAssumptions(undefined),null);assert.match(investmentAssumptionsHTML(null),/non disponibili/);
});
test('malformed, partial, nonfinite or unknown-version snapshots cannot be displayed as complete',()=>{
 const a=buildInvestmentAssumptions(calculateROI(inputs),inputs,'simulator');
 for(const patch of [{schemaVersion:2},{calculationVersion:'unknown'},{extra:'x'},{occupancy:101},{commission:NaN},{loanAmount:Infinity},{loanYears:0},{source:'<img src=x onerror=alert(1)>'},{expensesUnit:'yearly'}]){
  assert.equal(readInvestmentAssumptions({...a,...patch}),null);assert.doesNotMatch(investmentAssumptionsHTML({...a,...patch}),/<img|onerror/);
 }
 const partial={...a};delete partial.tax;assert.equal(readInvestmentAssumptions(partial),null);
});
test('details display stored costs and financing in Italian and English without estimating defaults',()=>{
 const a=buildInvestmentAssumptions(calculateROI(inputs),inputs,'simulator');const it=investmentAssumptionsHTML(a);const en=investmentAssumptionsHTML(a,'en');
 assert.match(it,/2\.?500,00/);assert.match(it,/4,1%/);assert.match(it,/25 anni/);assert.match(en,/25 years/);assert.match(it,/<details/);
});
