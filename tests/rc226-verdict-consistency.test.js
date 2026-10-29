import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {financialNumber} from '../js/portfolio-kpi.js';
globalThis.window ??= {};
const {calculateROI}=await import('../js/roi-engine.js');
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('js/app.js'),dashboard=read('js/dashboard.js');
const engine={window:{}};vm.runInNewContext(read('js/chatbot/core/score-engine.js'),engine);
function score(roi,risk,occupancy,ltv,net){return engine.window.rbGenerateInvestmentScore({roi,risk,occupancy,mortgagePercent:ltv,cashflow:net}).score;}
const saveRatioStart=app.indexOf('    const mortgagePercent =',app.indexOf('function runPostAnalysis'));
const saveRatio=app.slice(saveRatioStart,app.indexOf('    const market =',saveRatioStart));
function savedLTV(result,price,loan){const c={result,propertyPrice:price,loanAmount:loan,mortgage:loan};vm.runInNewContext(saveRatio+'\nthis.actual=mortgagePercent;',c);return c.actual;}
for(const price of [150225,150000,149999.99])test('live/save score agrees at financing boundary for price '+price,()=>{
 const result=calculateROI({price,equity:price-120000,loanAmount:120000,priceNight:120,occupancy:70,expenses:800,commission:15,tax:21,interestRate:3.5,loanYears:20});
 const ratio=savedLTV(result,price,120000);assert.equal(ratio,result.ltv);
 const live=score(result.roi,result.risk,70,result.ltv,result.netAfterMortgage);
 const saved=score(result.roi,result.risk,70,ratio,result.netAfterMortgage);
 assert.equal(live,saved);assert.ok(Math.abs(result.netAfterMortgage-4652.77)<.01);
 assert.equal(saved,price>150000?78:71);
});
test('explicit financing is retained instead of inferred price less equity',()=>{
 assert.match(app,/mortgagePercent: Number\(price > 0 \? \(loanAmount \/ price\) \* 100 : 0\)/);
 const result=calculateROI({price:150225,equity:30225,loanAmount:60000,priceNight:120,occupancy:70,expenses:800,commission:15,tax:21,interestRate:3.5,loanYears:20});
 assert.equal(savedLTV(result,150225,60000),result.ltv);
});
function dashboardVerdict(row,lang){const c={financialNumber,t:(it,en)=>lang==='en'?en:it};vm.runInNewContext(dashboard.slice(dashboard.indexOf('function generateInvestmentVerdict('),dashboard.indexOf('// ================= VERDICT RENDER')),c);return c.generateInvestmentVerdict(row);}
for(const lang of ['it','en'])test('saved WAIT is not promoted by positive ROI in dashboard '+lang,()=>{
 const row={roi:15.393780847,net:4652.77,risk:36,equity:30225,verdict:'WAIT'};
 assert.equal(dashboardVerdict(row,lang).type,'good');
 assert.equal(dashboardVerdict({...row,verdict:'AVOID'},lang).type,'risk');
 assert.equal(dashboardVerdict({...row,verdict:'BUY'},lang).type,'excellent');
 // Older rows without a stored verdict retain the legacy explanatory fallback.
 assert.equal(dashboardVerdict({...row,verdict:null},lang).type,'excellent');
});
for(const lang of ['it','en'])test('final tool panel follows canonical snapshot after post-analysis '+lang,()=>{
 const box={innerHTML:''};const c={window:{lastAnalysisData:{equity:30225}},document:{getElementById:()=>box},t:(it,en)=>lang==='en'?en:it};
 vm.runInNewContext(app.slice(app.indexOf('function renderInvestmentVerdict('),app.indexOf('// ================= SMART PAYWALL')),c);
 c.renderInvestmentVerdict(15.4,36,4652.77,70,'WAIT');assert.match(box.innerHTML,lang==='it'?/IPOTESI DA VERIFICARE/:/ASSUMPTIONS TO REVIEW/);assert.doesNotMatch(box.innerHTML,/SCENARIO FAVOREVOLE|FAVORABLE SCENARIO/);
 const post=app.slice(app.indexOf('function runPostAnalysis'),app.indexOf('// 📄 EXECUTIVE DOCUMENT'));
 assert.match(post,/renderInvestmentVerdict\(finalROI, riskScore, Number\(net \?\? 0\), occupancyRate, canonicalSaveVerdict\)/);
});
