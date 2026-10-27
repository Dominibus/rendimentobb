import {financialReview,financialScenarios} from '../js/financial-review.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {buildPDFScenarioCommentary} from '../js/pdf-scenario-commentary.js';
import {buildRevenueScenarios} from '../js/revenue-scenarios.js';
const source=readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
const code=source.slice(source.indexOf('window.generateExecutivePDF ='),source.indexOf('// ================= AUTO CITY DETECTION'));
const snapshot={schemaVersion:1,calculationVersion:'roi-monthly-v1',source:'simulator',expensesUnit:'monthly_eur',propertyPrice:150000,equity:30000,loanAmount:120000,priceNight:150.25,occupancy:70,expenses:800.5,commission:0,tax:0,interestRate:0,loanYears:25};
async function render(lang,assumptions){
 let page=1,saved=false;const calls=[];
 const doc=new Proxy({getNumberOfPages:()=>page,addPage:()=>page++,text:(v,x,y)=>calls.push({text:String(v),page,y}),splitTextToSize:v=>[v],save:()=>{saved=true;}},{get:(o,k)=>o[k]||(()=>{})});
 const window={currentLang:lang,getUserAccess:()=>({isPro:true,canDownloadPDF:true}),jspdf:{jsPDF:function(){return doc;}},RB_MARKET_DATA:{},lastAnalysisData:{assumptions,propertyMode:'owned',price:0,equity:0,loan:0,annualProfit:18151.2375,revenueAnnual:38325,netOperatingIncome:22976.25,roi:0,risk:15,investmentScore:78,city:'roma',priceNight:999,occupancy:99,expenses:9999}};
 const ctx={window,sessionStorage:{getItem:()=>null},localStorage:{getItem:()=>null},document:{getElementById:()=>null},financialReview,financialScenarios,buildPDFScenarioCommentary,buildRevenueScenarios,calculateMortgage:()=>0,showToast:()=>assert.fail('unexpected toast'),openUpgradeModal:()=>assert.fail('unexpected upgrade')};
 vm.runInNewContext(code,ctx);await window.generateExecutivePDF();
 return {calls,page,saved,last:calls.filter(x=>x.page===8).map(x=>x.text).join('\n')};
}
for(const lang of ['it','en'])test(`PDF audit trail uses captured assumptions and preserves zero values (${lang})`,async()=>{
 const r=await render(lang,{...snapshot,source:'owned_property',propertyPrice:0,equity:0,loanAmount:0});
 assert.equal(r.page,8);assert.equal(r.saved,true);
 for(const label of lang==='it'?['Versione calcolo','Commissioni','Aliquota del modello','Importo mutuo','Tasso annuo','Durata mutuo']:['Calculation version','Commissions','Model tax rate','Loan amount','Annual interest rate','Loan term']) assert.ok(r.last.includes(label));
 assert.match(r.last,/roi-monthly-v1/);assert.match(r.last,/0%/);assert.match(r.last,lang==='it'?/150,25 EUR/:/150\.25 EUR/);assert.match(r.last,/25 (anni|years)/);assert.doesNotMatch(r.last,/9999|999 EUR|99%|NaN|Infinity/);
 assert.ok(r.calls.every(x=>x.y===undefined||x.y<=278));
});
test('legacy PDF explicitly marks missing rates, version and term without inventing defaults',async()=>{
 const r=await render('it',{});assert.match(r.last,/Versione calcolo\nNon disponibile/);assert.match(r.last,/Commissioni\nNon disponibile/);assert.match(r.last,/Tasso annuo\nNon disponibile/);assert.match(r.last,/Durata mutuo\nNon disponibile/);assert.doesNotMatch(r.last,/3[.,]5%|21%|20 anni/);
});
test('percentage operating costs retain their unit in the audit trail',async()=>{
 const r=await render('en',{...snapshot,expensesUnit:'percentage',expenses:12.5});assert.match(r.last,/Costs \(% of revenue\)\n12\.5%/);assert.doesNotMatch(r.last,/Monthly costs/);
});
