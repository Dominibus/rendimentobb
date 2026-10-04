import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {financialNumber,summarizeInvestments,interpretPortfolio} from '../js/portfolio-kpi.js';
const source=await readFile(new URL('../js/dashboard.js',import.meta.url),'utf8');
const html=await readFile(new URL('../dashboard/index.html',import.meta.url),'utf8');
const loss=[{roi:-8.4,equity:159000,net:-13313.64,risk:78}];
const profit=[{roi:18.7,equity:30000,net:5601,risk:33}];
test('portfolio interpretation is negative despite other profitable scenarios',()=>assert.equal(interpretPortfolio(loss).status,'loss'));
test('positive ROI cannot override a negative cashflow',()=>assert.equal(interpretPortfolio([{roi:20,equity:30000,net:-100}]).status,'loss'));
test('empty, incomplete, zero and positive have distinct statuses',()=>{
 assert.equal(interpretPortfolio([]).status,'empty');assert.equal(interpretPortfolio([{roi:20}]).status,'incomplete');assert.equal(interpretPortfolio([{roi:0,equity:30000,net:0}]).status,'balanced');assert.equal(interpretPortfolio(profit).status,'positive');
});
test('positive aggregate flags an individual loss or high risk',()=>{
 assert.equal(interpretPortfolio([...profit,{roi:-1,equity:10000,net:-100,risk:10}]).status,'attention');assert.equal(interpretPortfolio([{...profit[0],risk:80}]).status,'attention');
});
test('risk availability includes zero without inventing missing indices',()=>{
 const a=interpretPortfolio([{risk:0},{risk:100},{}]);assert.equal(a.averageRisk,50);assert.equal(a.riskCount,2);assert.equal(interpretPortfolio([{}]).averageRisk,null);
});
function harness({paid=true,lang='it'}={}){
 const elements=new Map();const c={financialNumber,summarizeInvestments,interpretPortfolio,Intl,window:{currentLang:lang},document:{getElementById:id=>{if(!elements.has(id))elements.set(id,{style:{},innerHTML:'',textContent:''});return elements.get(id);}},t:(it,en)=>lang==='en'?en:it,isPro:()=>paid,isInvestor:()=>false};
 vm.createContext(c);
 const utilities=source.slice(source.indexOf('function formatCurrency('),source.indexOf('// Calendar days'));
 const narrative=source.slice(source.indexOf('function portfolioNarrative('),source.indexOf('// ===============================\n// ROI OPTIMIZER ENGINE'));
 const upgrade=source.slice(source.indexOf('function renderUpgradeTrigger('),source.indexOf('// ================= ROI MARKET COMPARISON'));
 const comparison=source.slice(source.indexOf('function renderROIMarketComparison('),source.indexOf('function lockInvestorPreview('));
 vm.runInContext(utilities+narrative+upgrade+comparison,c);return {c,elements};
}
test('Performance Live insight and comparison both use confirmed loss portfolio',()=>{
 const {c,elements}=harness();c.window.dashboardSimulations=[...profit,...profit];c.renderInsight(loss);c.renderROIMarketComparison(loss);
 assert.match(elements.get('investment-insight').innerHTML,/rendimento negativo/);assert.match(elements.get('roi-market-comparison').innerHTML,/-16,8 punti percentuali/);assert.doesNotMatch(elements.get('roi-market-comparison').innerHTML,/sopra il benchmark nazionale/);
});
test('Investment Intelligence renders grounded confirmed values',()=>{
 const {c,elements}=harness();c.renderInvestmentIntelligence(loss);const out=elements.get('investment-intelligence-content').innerHTML;
 assert.match(out,/-8,4%/);assert.match(out,/-13\.313,64/);assert.match(out,/78\/100/);assert.match(out,/disponibili 1\/1/);assert.match(out,/non probabilità/);
});
test('incomplete data does not create a positive recommendation or zero totals',()=>{
 const {c,elements}=harness();c.renderInvestmentIntelligence([{}]);c.renderROIMarketComparison([{}]);assert.match(elements.get('investment-intelligence-content').innerHTML,/incompleti/);assert.match(elements.get('investment-intelligence-content').innerHTML,/>--</);assert.doesNotMatch(elements.get('investment-intelligence-content').innerHTML,/NaN|null|0\/100/);assert.match(elements.get('roi-market-comparison').innerHTML,/>--</);
});
test('English uses same facts and percentage points',()=>{
 const {c,elements}=harness({lang:'en'});c.renderInvestmentIntelligence(profit);c.renderROIMarketComparison(profit);assert.match(elements.get('investment-intelligence-content').innerHTML,/estimated positive margin/);assert.match(elements.get('roi-market-comparison').innerHTML,/\+10.3 percentage points/);
});
test('Free demo offers Investor and Pro without premium intelligence or earnings promises',()=>{
 const {c,elements}=harness({paid:false});c.renderInvestmentIntelligence(loss);c.renderUpgradeTrigger({roi:40,net:999999});assert.match(elements.get('investment-intelligence-content').innerHTML,/demo/);assert.doesNotMatch(elements.get('investment-intelligence-content').innerHTML,/-13\.313|78\/100/);const out=elements.get('upgrade-trigger').innerHTML;assert.match(out,/Confronta Investor e Pro/);assert.match(out,/non promesse di guadagno/);assert.doesNotMatch(out,/999|perdere questo profitto|guadagni reali/);
});
test('paid upgrade hides stale Free content',()=>{
 const {c,elements}=harness();const el=c.document.getElementById('upgrade-trigger');el.innerHTML='old';el.style.display='block';c.renderUpgradeTrigger({});assert.equal(el.style.display,'none');assert.equal(el.innerHTML,'');
});
test('Investor has intelligence without a redundant Pro upgrade',()=>{
 const {c,elements}=harness({paid:false});c.isInvestor=()=>true;c.renderInvestmentIntelligence(profit);c.renderUpgradeTrigger({});assert.match(elements.get('investment-intelligence-content').innerHTML,/18,7%/);assert.equal(elements.get('upgrade-trigger').style.display,'none');
});
test('dashboard wires confirmed portfolio into all narrative sections with unique containers',()=>{
 assert.match(source,/renderInsight\(portfolioAnalyses\)/);assert.match(source,/renderInvestmentIntelligence\(portfolioAnalyses\)/);assert.match(source,/renderROIMarketComparison\(portfolioAnalyses\)/);
 for(const id of ['investment-intelligence-content','investment-intelligence-status'])assert.equal(html.split(`id="${id}"`).length-1,1);
});
