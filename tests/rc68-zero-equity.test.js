import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
globalThis.window = {};
const {calculateROI} = await import('../js/roi-engine.js');
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('100% financing is accepted but a loan above price is rejected by the purchase model',()=>{
 const c={};vm.createContext(c);vm.runInContext(read('js/investment-journey.js'),c);
 const raw={amount:300000,propertyPrice:300000,rate:3.7,years:25,income:30000};
 assert.equal(c.RBInvestmentJourney.validate(raw).valid,true);
 assert.equal(c.RBInvestmentJourney.validate({...raw,propertyPrice:299999}).valid,false);
});
test('Analyze preserves explicit zero equity rather than inventing a 30% down payment',()=>{
 const src=read('js/app.js');const start=src.indexOf('    let equity = isTool');const end=src.indexOf('// 🔥 EQUITY CANNOT',start);const c={isTool:true,equityInput:0,price:300000};
 vm.runInNewContext(src.slice(start,end)+'\nglobalThis.actualEquity=equity;',c);assert.equal(c.actualEquity,0);
 assert.match(read('tool/index.html'),/id="equity" min="0"/);
 const r=calculateROI({price:300000,equity:0,loanAmount:300000,priceNight:30000/(365*.7),occupancy:70,expenses:800,commission:15,tax:21,interestRate:3.7,loanYears:25});
 assert.equal(r.equity,0);assert.ok(Number.isFinite(r.netAfterMortgage));assert.ok(Number.isFinite(r.realROI));
});
