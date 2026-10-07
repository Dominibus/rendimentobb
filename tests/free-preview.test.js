import {buildInvestmentAssumptions} from '../js/investment-assumptions.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {renderFreeSimulationPreview} from '../js/free-preview.js';
globalThis.window={};
const {calculateROI}=await import('../js/roi-engine.js');
function harness(access={isFree:true},lang='it'){
 const ids=['roi-live','roi-preview-live','roi-card-live','profit-live','cashflow-month-preview','roi-badge','roi-verdict'];
 const elements=Object.fromEntries(ids.map(id=>[id,{textContent:'previous',className:'badge'}]));
 const document={getElementById:id=>elements[id]};
 return {elements,render:data=>renderFreeSimulationPreview(data,{access,document,lang})};
}
test('Free preview preserves negative ROI and cashflow and explains the basis',()=>{
 const h=harness();h.render({realROI:-5.1,roi:-33.9,netAfterMortgage:-76228});
 for(const id of ['roi-live','roi-preview-live','roi-card-live'])assert.equal(h.elements[id].textContent,'-5,1%');
 assert.ok(h.elements['profit-live'].textContent.includes('-76.228'));assert.ok(h.elements['cashflow-month-preview'].textContent.includes('-6.352,33'));assert.ok(h.elements['roi-verdict'].textContent.includes('negativo'));assert.ok(h.elements['roi-badge'].textContent.includes('prezzo'));
});
test('zero is a valid result, not a missing value',()=>{const h=harness();h.render({realROI:0,netAfterMortgage:0});assert.equal(h.elements['roi-live'].textContent,'0,0%');assert.ok(h.elements['profit-live'].textContent.includes('0,00'));assert.ok(h.elements['roi-verdict'].textContent.includes('pareggio'));});
test('missing property ROI is not replaced by equity ROI',()=>{const h=harness();h.render({roi:25,realROI:null,netAfterMortgage:null});assert.equal(h.elements['roi-live'].textContent,'—');assert.equal(h.elements['cashflow-month-preview'].textContent,'—');assert.ok(!h.elements['roi-badge'].textContent.includes('25'));});
test('a subsequent calculation replaces the previous negative scenario',()=>{const h=harness();h.render({realROI:-5,netAfterMortgage:-6000});h.render({realROI:3,netAfterMortgage:12000});assert.equal(h.elements['roi-live'].textContent,'3,0%');assert.ok(h.elements['roi-verdict'].textContent.includes('positivo'));assert.ok(h.elements['cashflow-month-preview'].textContent.includes('1.000'));});
test('English preview uses English messages and number formatting',()=>{const h=harness({isFree:true},'en');h.render({realROI:6.5,netAfterMortgage:9799.82});assert.equal(h.elements['roi-live'].textContent,'6.5%');assert.ok(h.elements['profit-live'].textContent.includes('9,799.82'));assert.ok(h.elements['roi-verdict'].textContent.includes('positive cashflow'));});
for(const plan of ['isInvestor','isPro','isAdmin'])test(`ROI presentation uses the paid metric without changing ${plan} cashflow panels`,()=>{const h=harness({isFree:true,[plan]:true});h.render({roi:32.7,realROI:6.5,netAfterMortgage:9799.82});assert.equal(h.elements['roi-live'].textContent,'32,7%');assert.equal(h.elements['roi-preview-live'].textContent,'6,5%');assert.equal(h.elements['profit-live'].textContent,'previous');});
test('standard financed scenario preview reads the real engine result, without modifying it',()=>{
 const result=calculateROI({price:150000,equity:30000,loanAmount:120000,priceNight:150,occupancy:70,expenses:800,commission:15,tax:21,interestRate:3.5,loanYears:20});const before=structuredClone(result);const h=harness();h.render(result);assert.equal(h.elements['roi-live'].textContent,'6,5%');assert.ok(h.elements['profit-live'].textContent.includes('9.799,82'));assert.ok(h.elements['cashflow-month-preview'].textContent.includes('816,65'));assert.deepEqual(result,before);assert.ok(result.roi>32);
});
test('Free benchmark placeholders are readable and never fabricate market data',async()=>{
 const source=(await readFile(new URL('../js/market-engine.js',import.meta.url),'utf8')).replace('import "./market-data.js";','').replace('export function renderMarketBenchmark','function renderMarketBenchmark');
 const elements=Object.fromEntries(['benchmark-price','benchmark-occupancy','benchmark-revenue','market-comparison'].map(id=>[id,{textContent:'old'}]));
 const c={window:{getUserAccess:()=>({isFree:true}),currentLang:'it'},document:{getElementById:id=>elements[id],addEventListener(){}},setTimeout(){throw new Error('Free should return before market rendering');}};
 vm.createContext(c);vm.runInContext(source,c);c.renderMarketBenchmark('unknown');
 for(const id of ['benchmark-price','benchmark-occupancy','benchmark-revenue'])assert.equal(elements[id].textContent,'Investor / Pro');
 assert.ok(elements['market-comparison'].textContent.includes('indicativi'));c.window.currentLang='en';c.renderMarketBenchmark('roma');assert.ok(elements['market-comparison'].textContent.includes('available'));
});
test('actual calculation UI sequence restores Free preview after legacy post-analysis locking',async()=>{
 const source=await readFile(new URL('../js/app.js',import.meta.url),'utf8');
 const start=source.indexOf('["roi-live","roi-preview-live","roi-card-live"].forEach');
 const end=source.indexOf('// ================= MARKET =================',start);
 assert.ok(start>0&&end>start);
 const h=harness();
 const context={buildInvestmentAssumptions,commission:15,tax:21,loanYears:20,loanAmount:120000,isTool:true,access:{isFree:true},document:{getElementById:id=>h.elements[id]},window:{currentLang:'it'},result:{loan:90000,realROI:6.5,netAfterMortgage:9799.82},renderFreeSimulationPreview,roiText:'6.5%',net:9799.82,gross:30000,price:150000,equity:30000,occupancy:70,priceNight:150,expenses:800,interestRate:3.5,formatCurrency:String,renderUniversalKPI(){},renderCashflowProjection(){},runPostAnalysis(_result, savedContext){assert.equal(savedContext.loanAmount,90000);assert.equal(savedContext.mortgage,90000);h.elements['roi-live'].textContent='—';}};
 vm.createContext(context);vm.runInContext(source.slice(start,end),context);
 assert.equal(h.elements['roi-live'].textContent,'6,5%');assert.equal(h.elements['roi-preview-live'].textContent,'6,5%');assert.ok(h.elements['cashflow-month-preview'].textContent.includes('816,65'));
});
test('paid loss scenario keeps negative equity ROI in the main KPI and property ROI in secondary cards',()=>{
 const result=calculateROI({price:150000,equity:30000,loanAmount:120000,priceNight:120,occupancy:50,expenses:700,commission:15,tax:21,interestRate:3.5,loanYears:20});const before=structuredClone(result);const h=harness({isPro:true});h.render(result);
 assert.equal(h.elements['roi-live'].textContent,'-0,9%');assert.equal(h.elements['roi-preview-live'].textContent,'-0,2%');assert.equal(h.elements['roi-card-live'].textContent,'-0,2%');assert.deepEqual(result,before);
});
test('paid zero ROI is rendered and missing equity ROI is never replaced by the property ROI',()=>{
 const h=harness({isInvestor:true});h.render({roi:0,realROI:0});assert.equal(h.elements['roi-live'].textContent,'0,0%');
 h.render({roi:null,realROI:10});assert.equal(h.elements['roi-live'].textContent,'—');assert.equal(h.elements['roi-preview-live'].textContent,'10,0%');
});
test('actual legacy rendering sequence cannot leave property ROI as the paid main KPI after a loss',async()=>{
 const source=await readFile(new URL('../js/app.js',import.meta.url),'utf8');const start=source.indexOf('["roi-live","roi-preview-live","roi-card-live"].forEach');const end=source.indexOf('// ================= MARKET =================',start);
 const h=harness({isPro:true});const context={buildInvestmentAssumptions,commission:15,tax:21,loanYears:20,loanAmount:120000,isTool:true,access:{isPro:true},document:{getElementById:id=>h.elements[id]},window:{currentLang:'it'},result:{roi:-.938566,realROI:-.187713,netAfterMortgage:-281.57},renderFreeSimulationPreview,roiText:'-0.2%',net:-281.57,gross:21900,price:150000,equity:30000,occupancy:50,priceNight:120,expenses:700,interestRate:3.5,formatCurrency:String,renderUniversalKPI(){},renderCashflowProjection(){},runPostAnalysis(){}};
 vm.runInNewContext(source.slice(start,end),context);assert.equal(h.elements['roi-live'].textContent,'-0,9%');assert.equal(h.elements['roi-preview-live'].textContent,'-0,2%');
});
