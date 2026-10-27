import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
import {calculateROI} from '../js/roi-engine.js';
import {buildInvestmentAssumptions} from '../js/investment-assumptions.js';
import {financialReview,financialScenarios,financialReviewHTML,financialScenariosHTML} from '../js/financial-review.js';
import {buildPDFScenarioCommentary} from '../js/pdf-scenario-commentary.js';
import {buildRevenueScenarios} from '../js/revenue-scenarios.js';
const a={schemaVersion:1,calculationVersion:'roi-monthly-v1',source:'simulator',expensesUnit:'monthly_eur',propertyPrice:150000,equity:30000,loanAmount:120000,priceNight:120,occupancy:70,expenses:1200,commission:15,tax:21,interestRate:3.5,loanYears:20};
const near=(x,y)=>assert.ok(Math.abs(x-y)<1e-7,`${x} != ${y}`);
test('Gualerzi cashflow reconciles with independent principal and interest amortisation',()=>{
 const r=financialReview(a).result,i=.035/12,payment=120000*i/(1-(1+i)**-240);let balance=120000,interest=0,principal=0;
 for(let m=0;m<12;m++){const j=balance*i,p=payment-j;interest+=j;principal+=p;balance-=p;}
 near(principal+interest,payment*12);near(r.gross,30660);near(r.fees,4599);near(r.expensesYearly,14400);near(r.noi,11661);near(r.taxCost,2448.81);near(r.annualDebtService,principal+interest);
 near(r.netAfterMortgage,11661-2448.81-payment*12);assert.equal(r.netAfterMortgage.toFixed(2),'860.77');assert.equal(r.monthlyProfit.toFixed(2),'71.73');near(r.capRate,7.774);near(r.roi,2.869233536811504);near(r.realROI,.5738467073623008);near(r.dscr,11661/(payment*12));
});
test('NOI yield is independent of financing while cashflow/value is not',()=>{
 const r=financialReview(a).result,s=financialReview({...a,equity:150000,loanAmount:0}).result;near(r.capRate,s.capRate);near(r.noi,s.noi);assert.notEqual(r.realROI,s.realROI);
});
test('financial bridge separates simulated tax and debt service',()=>{
 const x=financialReview(a);near(x.cashflowBeforeModelTax-x.result.taxCost,x.result.netAfterMortgage);near(x.cashAfterModelTaxBeforeDebt-x.result.annualDebtService,x.result.netAfterMortgage);
});
test('sensitivity scenarios recalculate fees, tax, CF and DSCR without mutating inputs',()=>{
 const original=JSON.stringify(a),s=financialScenarios(a);assert.deepEqual(s.map(x=>x.inputs.occupancy),[60,70,80]);near(s[0].inputs.priceNight,108);near(s[2].inputs.priceNight,132);assert.equal(JSON.stringify(a),original);assert.deepEqual(s[1].result,financialReview(a).result);
 for(const x of s){near(x.result.fees,x.result.gross*.15);near(x.result.expensesYearly,14400);near(x.result.taxCost,Math.max(0,x.result.noi)*.21);near(x.result.annualDebtService,s[1].result.annualDebtService);}
 assert.ok(s[0].result.netAfterMortgage<0);assert.ok(s[2].result.netAfterMortgage>s[1].result.netAfterMortgage);assert.notEqual(s[0].result.netAfterMortgage,s[1].result.netAfterMortgage*.8);
});
test('declared percentage costs follow revenue while fixed costs remain fixed',()=>{for(const x of financialScenarios({...a,expensesUnit:'percentage',expenses:30}))near(x.result.expensesYearly,x.result.gross*.3);});
test('occupancy limits are respected in all scenarios',()=>{assert.deepEqual(financialScenarios({...a,occupancy:0}).map(x=>x.result.occupancy),[0,0,10]);assert.deepEqual(financialScenarios({...a,occupancy:100}).map(x=>x.result.occupancy),[90,100,100]);});
test('theoretical break-even independently reproduces zero model cashflow',()=>{
 const x=financialReview(a);near(calculateROI({...x.inputs,occupancy:x.breakEvenOccupancy}).netAfterMortgage,0);assert.ok(x.breakEvenOccupancy<70);assert.ok(financialReview({...a,priceNight:1}).breakEvenOccupancy>100);assert.equal(financialReview({...a,priceNight:0}).breakEvenOccupancy,null);
});
test('zero equity, owned property, losses and missing inputs are not fabricated',()=>{
 const x=financialReview({...a,source:'owned_property',propertyPrice:0,equity:0,loanAmount:0});assert.equal(x.result.roiAvailable,false);assert.equal(x.result.propertyROIAvailable,false);assert.equal(financialReview({...a,occupancy:0}).result.taxCost,0);
 for(const v of [undefined,null,{}, {...a,tax:null},{...a,equity:Infinity},{...a,calculationVersion:'unknown'}]){assert.equal(financialReview(v),null);assert.deepEqual(financialScenarios(v),[]);}
});
for(const lang of ['it','en'])test('IT/EN details disclose assumptions, risk factors and methodological limits: '+lang,()=>{
 const html=financialReviewHTML(a,lang),s=financialScenariosHTML(a,lang);assert.match(html,/NOI/);assert.match(html,lang==='it'?/7,77%/:/7\.77%/);assert.match(html,lang==='it'?/non netto fiscale definitivo/:/not a definitive after-tax/);assert.match(html,lang==='it'?/Non è una probabilità/:/not a loss probability/);assert.match(s,/DSCR/);assert.match(s,lang==='it'?/Prudente/:/Conservative/);assert.doesNotMatch(html+s,/NaN|Infinity|undefined/);
});
const app=readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
test('generic tool startup has no Roma fallback and preserves an explicit city',()=>{
 const start=app.indexOf('const params = new URLSearchParams(window.location.search);',app.indexOf('function getCityFromPath')),end=app.indexOf('// ================= LOCK HARD',start),code=app.slice(start,end)+'\nwindow.testCity=selectedCity;';
 for(const [stored,search,expected]of [[null,'',''],['napoli','','napoli'],[null,'?city=milano','milano']]){const c={window:{location:{search,pathname:'/tool/'}},URLSearchParams,sessionStorage:{getItem:()=>stored},localStorage:{getItem:()=>null},getCityFromPath:()=>null};vm.runInNewContext(code,c);assert.equal(c.window.testCity,expected);}
});
test('pending/stale calculation and shared-cache updates cannot expose the wrong financial detail',()=>{
 const start=app.indexOf('let currentFinancialAssumptions = null;'),end=app.indexOf('document.addEventListener("rb_auth_ready",renderFinancialReview)',start),nodes=new Map([['occupancy-sensitivity',{innerHTML:''}],['financial-model-review',{innerHTML:''}]]);let status='pending';
 const w={currentLang:'it',lastAnalysisData:{assumptions:{...a,priceNight:99999}},getUserAccess:()=>({isInvestor:true})},c={window:w,document:{getElementById:id=>nodes.get(id)},investmentAnalysisState:{getState:()=>({status})},buildInvestmentAssumptions,financialReviewHTML,financialScenariosHTML};
 vm.runInNewContext(app.slice(start,end),c);const review=financialReview(a);c.renderOccupancySensitivity(review.result,review.inputs);assert.equal(nodes.get('occupancy-sensitivity').innerHTML,'');status='current';c.renderOccupancySensitivity();c.renderFinancialReview();assert.match(nodes.get('financial-model-review').innerHTML,/860,77/);assert.doesNotMatch(nodes.get('financial-model-review').innerHTML,/99\.999/);status='stale';c.renderOccupancySensitivity();c.renderFinancialReview();assert.equal(nodes.get('financial-model-review').innerHTML,'');
});
test('Free access clears paid financial details',()=>{
 const start=app.indexOf('function renderFinancialReview(){'),end=app.indexOf('document.addEventListener("rb_auth_ready",renderFinancialReview)',start),node={innerHTML:'old'},w={currentLang:'it',getUserAccess:()=>({isFree:true})};
 const c={window:w,document:{getElementById:()=>node},financialReviewHTML,currentFinancialAssumptions:a,investmentAnalysisState:{getState:()=>({status:'current'})}};vm.runInNewContext(app.slice(start,end),c);c.renderFinancialReview();assert.equal(node.innerHTML,'');w.getUserAccess=()=>({isInvestor:true});c.renderFinancialReview();assert.match(node.innerHTML,/NOI/);w.getUserAccess=()=>({isFree:true});c.renderFinancialReview();assert.equal(node.innerHTML,'');
});
test('real PDF keeps eight pages, complete assumptions and its captured city, not the edited form',async()=>{
 const bundle={exports:{}};vm.runInNewContext(readFileSync(new URL('../js/vendor/jspdf-4.2.1.umd.min.js',import.meta.url),'utf8'),{module:bundle,exports:bundle.exports,console,atob,btoa,setTimeout,clearTimeout,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer});
 for(const lang of ['it','en']){let doc,bytes;const texts=[],r=financialReview(a).result;
  const window={currentLang:lang,getUserAccess:()=>({isPro:true,canDownloadPDF:true}),jspdf:{jsPDF:function(...args){doc=new bundle.exports.jsPDF(...args);const orig=doc.text;doc.text=function(v,x,y,...rest){texts.push({v:String(v),page:doc.getNumberOfPages(),y});return orig.call(this,v,x,y,...rest);};doc.save=()=>{bytes=doc.output('arraybuffer');};return doc;}},RB_MARKET_DATA:{},lastAnalysisData:{...r,assumptions:a,annualProfit:r.netAfterMortgage,revenueAnnual:r.gross,investmentScore:40,verdict:'WAIT',city:''}};
  const c={window,financialReview,financialScenarios,buildPDFScenarioCommentary,buildRevenueScenarios,document:{getElementById:id=>id==='custom-location'?{value:'EDITED ROME'}:null},calculateMortgage:()=>r.annualDebtService,showToast:()=>assert.fail(),openUpgradeModal:()=>assert.fail()};
  vm.runInNewContext(app.slice(app.indexOf('window.generateExecutivePDF ='),app.indexOf('// ================= AUTO CITY DETECTION')),c);await window.generateExecutivePDF();assert.equal(doc.getNumberOfPages(),8);const all=texts.map(x=>x.v).join('\n');assert.doesNotMatch(all,/EDITED ROME/);assert.match(all,lang==='it'?/Località non indicata/:/Location not specified/);assert.match(all,lang==='it'?/Prudente/:/Conservative/);for(const x of texts)assert.ok(x.y===undefined||x.y<=278);
  if(process.env.RB_AUDIT_PDF_DIR)writeFileSync(process.env.RB_AUDIT_PDF_DIR+'/RC211-fittizio-'+lang+'.pdf',Buffer.from(bytes));
 }
});
const autopilot=readFileSync(new URL('../js/chatbot/core/investment-autopilot-engine.js',import.meta.url),'utf8');
for(const cash of [-1000,0,860.77])test('Autopilot interprets the available cashflow, preserves scope and names specialist checks: '+cash,()=>{
 const w={rbGetInvestmentAnalysisState:()=>({status:'current',tier:'paid',city:'',calculatedAt:0,metrics:{roi:2.869,roiBasis:'equity',roiAvailable:true,equity:30000,propertyMode:'purchase',annualCashflow:cash,monthlyCashflow:cash/12,annualRevenue:30660,annualDebtService:8351.42,dscr:cash<0?.8:1.396,risk:61}})};
 const c={window:w,document:{getElementById:id=>['price','analyze-btn'].includes(id)?{value:'1'}:null},Intl,Date};vm.runInNewContext(autopilot,c);
 const r=w.rbBuildInvestmentAutopilotResponse('Autopilot investimento: leggi la mia analisi');assert.equal(r.type,'investment_autopilot');assert.match(r.textIT,cash<0?/disavanzo/:cash===0?/pareggio/:/positivo nelle ipotesi/);assert.match(r.textIT,/non un parere professionale/);assert.match(r.textEN,/not a professional opinion/);assert.match(r.textIT,/conformità/);assert.match(r.textIT,/non risultati operativi verificati/);if(cash<0)assert.match(r.textIT,/non copre le rate/);assert.ok(r.actions.some(x=>x.type==='open_investment_section'));
});
