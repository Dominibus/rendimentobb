import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {financialNumber,summarizeInvestments} from '../js/portfolio-kpi.js';
const source=await readFile(new URL('../js/dashboard.js',import.meta.url),'utf8');
test('scores include zero: 0 and 86 average to 43',()=>assert.equal(summarizeInvestments([{investmentScore:0},{investmentScore:86}]).score,43));
test('zero alone stays zero; missing score stays missing without a heuristic',()=>{
 assert.equal(summarizeInvestments([{investmentScore:0}]).score,0);
 assert.equal(summarizeInvestments([{roi:-33.9,risk:80}]).score,null);
});
test('invalid score and missing values are excluded with coverage',()=>{
 const a=summarizeInvestments([{investmentScore:'0'},{investmentScore:100},{investmentScore:null},{investmentScore:101},{investmentScore:false}]);assert.equal(a.score,50);assert.equal(a.coverage.score,2);assert.equal(a.count,5);
});
test('financial numbers reject null, blank, boolean, infinity and objects',()=>{
 for(const value of [null,undefined,'',' ',false,true,NaN,Infinity,{},[]]) assert.equal(financialNumber(value),null);
 assert.equal(financialNumber('0'),0);assert.equal(financialNumber('-4.2'),-4.2);
});
test('scenario mean excludes absent values and retains negative and zero ROI',()=>{
 const a=summarizeInvestments([{roi:-4.2,net:-100},{roi:0,net:0},{}]);assert.equal(a.averageROI,-2.1);assert.equal(a.averageCashflow,-50);assert.equal(a.coverage.roi,2);assert.equal(a.cashflow,null);
});
test('confirmed ROI is equity weighted and cashflow is summed',()=>{
 const a=summarizeInvestments([{roi:10,equity:30000,net:3000,price:150000},{roi:20,equity:70000,net:14000,price:250000}]);assert.equal(a.weightedROI,17);assert.equal(a.cashflow,17000);assert.equal(a.equity,100000);assert.equal(a.price,400000);
});
test('incomplete portfolio does not report a partial total as complete',()=>{
 const a=summarizeInvestments([{roi:10,equity:30000,net:3000,price:150000},{roi:20}]);assert.equal(a.weightedROI,null);assert.equal(a.cashflow,null);assert.equal(a.equity,null);assert.equal(a.price,null);
});
test('empty portfolio is unknown; recorded zero cashflow remains zero',()=>{
 assert.equal(summarizeInvestments([]).cashflow,null);assert.equal(summarizeInvestments([{net:0}]).cashflow,0);
});
function render(rows,portfolio=rows,{paid=true,lang="it",email='test@example.invalid'}={}){
 const elements=new Map();const document={getElementById:id=>{if(!elements.has(id))elements.set(id,{style:{},querySelector:()=>null});return elements.get(id);},querySelectorAll:()=>[]};
 const c={financialNumber,summarizeInvestments,document,window:{dashboardSimulations:rows,currentLang:lang,currentPlan:'pro',currentUser:{email}},Intl,setTimeout:()=>{},t:(it,en)=>lang === "en" ? en : it,canViewDashboard:()=>paid,isPro:()=>paid,isInvestor:()=>false,updateDynamicTexts:()=>{}};
 vm.createContext(c);
 const utilities=source.slice(source.indexOf('function formatCurrency('),source.indexOf('// Calendar days'));
 const score=source.slice(source.indexOf('function calculateInvestmentScore('),source.indexOf('// ===============================\n// ROI CHART'));
 const stats=source.slice(source.indexOf('function renderStats('),source.indexOf('function updateDynamicTexts('));
 const escapeStart=source.indexOf('const escapeDashboardHTML = value =>');
 const escaping=source.slice(escapeStart,source.indexOf('// =====================================',escapeStart));
 vm.runInContext(escaping+utilities+score+stats,c);c.renderStats(rows.length,0,0,0,portfolio);return elements;
}
test('account statistics render email as text instead of HTML',()=>{
 const rows=[{investmentScore:0,roi:0,equity:30000,net:0,price:150000}];
 const elements=render(rows,rows,{email:'<img src=x onerror="window.__injected=1">& account'});
 const html=elements.get('dashboard-stats').innerHTML;
 assert.doesNotMatch(html,/<img\b/i);
 assert.match(html,/&lt;img src=x onerror=&quot;window.__injected=1&quot;&gt;&amp; account/);
});
test('dashboard render integrates score zero, negative ROI and weighted portfolio',()=>{
 const e=render([{investmentScore:0,roi:-4.2,equity:30000,net:-1260,price:150000},{investmentScore:86,roi:10,equity:30000,net:3000,price:150000}]);
 assert.match(e.get('dashboard-kpi').innerHTML,/43\/100/);assert.match(e.get('dashboard-kpi').innerHTML,/2\/2/);assert.match(e.get('portfolio-roi').textContent,/2,9%/);
 assert.match(render([{investmentScore:0,roi:-4.2,equity:30000,net:-1260,price:150000}]).get('db-roi').innerText,/-4,2%/);
});
test('dashboard render missing values never emits null, NaN or fabricated zero score',()=>{
 const e=render([{}]);assert.equal(e.get('kpi-roi').innerText,'--');assert.equal(e.get('kpi-cash').innerText,'--');assert.equal(e.get('kpi-break').innerText,'--');assert.equal(e.get('db-roi').innerText,'--');assert.doesNotMatch(e.get('dashboard-kpi').innerHTML,/null|NaN|0\/100/);
});
test('Firestore normalization preserves absence before aggregation',()=>{
 const start=source.indexOf('const analyses = querySnapshot.docs.map');const end=source.indexOf('\n});',start)+4;const mapping=source.slice(start,end);
 const c={querySnapshot:{docs:[{id:'a',data:()=>({roi:0,investmentScore:0,risk:0})},{id:'b',data:()=>({})}]},financialNumber,dashboardDebug:()=>{},Date,Number,Math};vm.createContext(c);const rows=vm.runInContext(mapping+'\nanalyses',c);
 assert.equal(rows[0].roi,0);assert.equal(rows[0].investmentScore,0);assert.equal(rows[1].roi,null);assert.equal(rows[1].investmentScore,null);assert.equal(rows[1].net,null);assert.equal(rows[1].equity,null);
});

test('Free gating remains locked and English formatting stays coherent',()=>{
 const rows=[{investmentScore:0,roi:0,equity:30000,net:0,price:150000}];
 const free=render(rows,rows,{paid:false});assert.equal(free.get('kpi-cash').innerText,'🔒');assert.match(free.get('dashboard-kpi').innerHTML,/🔒/);
 const en=render(rows,rows,{lang:'en'});assert.match(en.get('dashboard-kpi').innerHTML,/Average scenario equity ROI/);assert.equal(en.get('kpi-roi').innerText,'0%');assert.match(en.get('dashboard-kpi').innerHTML,/0\/100/);
});
test('portfolio cards flag missing values rather than showing measured zeros',()=>{
 const elements={innerHTML:''};const c={financialNumber,summarizeInvestments,document:{getElementById:()=>elements},window:{currentLang:'it'},t:(it)=>it,escapeDashboardHTML:String,Intl};vm.createContext(c);
 const utilities=source.slice(source.indexOf('function formatCurrency('),source.indexOf('// Calendar days'));
 const manager=source.slice(source.indexOf('function renderPortfolioManager('),source.indexOf('// ================= STATS ================='));
 vm.runInContext(utilities+manager,c);c.renderPortfolioManager([{price:150000,equity:30000}]);assert.match(elements.innerHTML,/Dati da completare/);assert.match(elements.innerHTML,/ROI<\/span><strong>--/);assert.match(elements.innerHTML,/ROI 0\/1/);assert.doesNotMatch(elements.innerHTML,/null|NaN/);
});
