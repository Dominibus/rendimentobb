import test from 'node:test';import assert from 'node:assert/strict';
import {calculateROI} from '../js/roi-engine.js';
const input={price:150225,equity:30225,loanAmount:120000,priceNight:120,occupancy:70,expenses:800,commission:15,tax:21,interestRate:3.5,loanYears:20};
for(const field of Object.keys(input))test(`explicit missing ${field} is rejected instead of becoming zero`,()=>{
 for(const value of [null,'',' ',false,true,[],{},NaN,Infinity])assert.throws(()=>calculateROI({...input,[field]:value}),e=>e.code==='roi/invalid_input');
});
test('omitted/undefined optional inputs retain documented defaults; numeric strings and explicit zero remain valid',()=>{
 const a=calculateROI(),b=calculateROI({expenses:undefined,interestRate:undefined});assert.deepEqual(a,b);assert.equal(a.expenses,0);assert.equal(a.occupancy,65);
 assert.deepEqual(calculateROI(Object.fromEntries(Object.entries(input).map(([k,v])=>[k,String(v)]))),calculateROI(input));
 assert.equal(calculateROI({...input,interestRate:0}).annualDebtService,6000);assert.equal(calculateROI({...input,loanAmount:0,loanYears:0}).annualDebtService,0);assert.equal(calculateROI({...input,equity:0}).roiAvailable,false);assert.equal(calculateROI({...input,expenses:0}).expenses,0);
});
test('invalid input containers fail explicitly and a complete regression remains unchanged',()=>{
 for(const input of [null,false,[],0,''])assert.throws(()=>calculateROI(input),e=>e.code==='roi/invalid_input');
 const r=calculateROI(input);assert.ok(Math.abs(r.netAfterMortgage-4652.770061043464)<1e-7);assert.equal(r.risk,36);assert.ok(Math.abs(r.ltv-79.8801797304044)<1e-10);
});
