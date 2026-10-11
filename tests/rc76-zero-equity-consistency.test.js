import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {summarizeInvestments,highestScenarioROI,interpretPortfolio,financialNumber} from '../js/portfolio-kpi.js';
import {readInvestmentAssumptions} from '../js/investment-assumptions.js';
globalThis.window={};
const {calculateROI}=await import('../js/roi-engine.js');
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const input={price:150000,equity:0,loanAmount:150000,priceNight:110,occupancy:71,expenses:800,commission:15,tax:21,interestRate:3.5,loanYears:20};
function score(result){
 const c={window:{},console};vm.runInNewContext(read('js/chatbot/core/score-engine.js'),c);
 return c.window.rbGenerateInvestmentScore({roi:result.roi,roiAvailable:result.roiAvailable,risk:result.risk,occupancy:result.occupancy,mortgagePercent:result.ltv,cashflow:result.netAfterMortgage});
}
test('fully financed positive cashflow excludes unavailable ROI from risk and score',()=>{
 const r=calculateROI(input);assert.equal(r.roiAvailable,false);assert.equal(r.riskROIApplied,false);
 assert.equal(r.riskBreakdown.roi,0);assert.equal(r.risk,41);assert.ok(Math.abs(r.netAfterMortgage-1118.84)<.01);
 const s=score(r);assert.equal(s.score,39);assert.ok(s.signals.includes('roi_not_applicable'));assert.ok(s.signals.includes('extreme_leverage'));
 assert.ok(!s.signals.includes('negative_roi'));assert.match(s.insightsIT.join(' '),/componente è esclusa/);
});
test('fully financed loss retains cashflow and debt coverage risk',()=>{
 const r=calculateROI({...input,price:500000,loanAmount:500000,expenses:800});
 assert.ok(r.netAfterMortgage<0);assert.equal(r.riskBreakdown.roi,0);
 assert.equal(r.riskBreakdown.cashflow,10);assert.equal(r.riskBreakdown.debtCoverage,20);assert.equal(r.riskBreakdown.leverage,10);
 assert.ok(score(r).signals.includes('negative_cashflow'));
});
test('positive equity with genuinely zero ROI still applies profitability risk',()=>{
 const r=calculateROI({...input,equity:30000,loanAmount:0,priceNight:0,expenses:0});
 assert.equal(r.roiAvailable,true);assert.equal(r.roi,0);assert.equal(r.riskBreakdown.roi,20);
 assert.ok(!score(r).signals.includes('roi_not_applicable'));
});
test('mixed portfolio includes fully financed cashflow but excludes its ROI from averages and ranking',()=>{
 const rows=[{roi:10,equity:30000,net:3000,price:150000},{roi:0,equity:0,net:1200,price:150000}];
 const m=summarizeInvestments(rows);assert.equal(m.averageROI,10);assert.equal(m.coverage.roi,1);
 assert.equal(m.cashflow,4200);assert.equal(m.equity,30000);assert.ok(Math.abs(m.weightedROI-14)<1e-10);
 assert.equal(highestScenarioROI([{roi:-10,equity:10000},{roi:0,equity:0}]),-10);
 const zero=summarizeInvestments([rows[1]]);assert.equal(zero.averageROI,null);assert.equal(zero.weightedROI,null);assert.equal(zero.cashflow,1200);
 assert.equal(interpretPortfolio([rows[1]]).status,'financed');
});
test('legacy Firestore zero equity becomes N/A without rewriting stored values',()=>{
 const source=read('js/dashboard.js');const start=source.indexOf('const analyses = querySnapshot.docs.map');const end=source.indexOf('\n});',start)+4;
 const raw={equity:0,roi:0,net:1200,risk:61};
 const c={readInvestmentAssumptions,querySnapshot:{docs:[{id:'legacy',data:()=>raw}]},financialNumber,dashboardDebug:()=>{},Date,Number,Math};
 const rows=vm.runInNewContext(source.slice(start,end)+'\nanalyses',c);
 assert.equal(rows[0].roi,null);assert.equal(rows[0].roiAvailable,false);assert.equal(rows[0].risk,61);assert.equal(raw.roi,0);
});
test('complete fully financed property is not labelled missing and renders N/A',()=>{
 const source=read('js/dashboard.js');const el={innerHTML:''};
 const c={financialNumber,summarizeInvestments,document:{getElementById:()=>el},window:{currentLang:'it'},t:it=>it,escapeDashboardHTML:String,Intl};
 const util=source.slice(source.indexOf('function formatCurrency('),source.indexOf('// Calendar days'));
 const manager=source.slice(source.indexOf('function renderPortfolioManager('),source.indexOf('// ================= STATS ================='));
 vm.runInNewContext(util+manager,c);c.renderPortfolioManager([{price:150000,equity:0,roi:null,net:1200}]);
 assert.match(el.innerHTML,/Dati completi/);assert.match(el.innerHTML,/ROI<\/span><strong>N\/A/);assert.doesNotMatch(el.innerHTML,/Dati da completare/);
});
