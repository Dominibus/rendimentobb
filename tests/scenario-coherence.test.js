import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {financialNumber,highestScenarioROI,targetEquity,scenarioCreatedTime} from '../js/portfolio-kpi.js';
const source=await readFile(new URL('../js/dashboard.js',import.meta.url),'utf8');
test('highest ROI uses all saved rows, not the first row or visible page',()=>assert.equal(highestScenarioROI([{roi:-7.8},{roi:35.1},{roi:35.8},{roi:92.6},{}]),92.6));
test('highest ROI handles zero, all negative, missing and numeric strings',()=>{
 assert.equal(highestScenarioROI([{roi:-10},{roi:-5}]),-5);assert.equal(highestScenarioROI([{roi:0},{roi:-1}]),0);assert.equal(highestScenarioROI([{}]),null);assert.equal(highestScenarioROI([{roi:'35.8'}]),35.8);
});
test('badge is attached to global maximum, including ties',()=>{
 const start=source.indexOf('if(highestSavedROI !== null');const end=source.indexOf('\nif(isNew)',start);const code=source.slice(start,end);
 for(const [roi,expected] of [[35.1,false],[35.8,true],[null,false]]){const c={highestSavedROI:35.8,data:{roi},financialNumber,t:(it)=>it,badge:''};vm.createContext(c);vm.runInContext(code,c);assert.equal(c.badge.includes('ROI più alto'),expected);}
});
test('target equity uses recorded cashflow rather than rounded ROI',()=>assert.equal(targetEquity({equity:30000,roi:35.1,net:10535.11}).equity,105351.1));
test('loss and zero cannot produce negative or zero theoretical equity',()=>{
 assert.equal(targetEquity({equity:159000,net:-12365.692}).status,'nonpositive');assert.equal(targetEquity({equity:159000,net:0}).equity,null);
});
test('missing inputs and invalid target do not fabricate an equity',()=>{
 for(const [row,target] of [[{},10],[{equity:0,net:100},10],[{equity:30000},10],[{equity:30000,net:100},0]])assert.equal(targetEquity(row,target).status,'missing');
});
test('latest analysis supports Firestore, ISO, Date and missing timestamps',()=>{
 const time=Date.parse('2026-10-02T00:00:00Z');assert.equal(scenarioCreatedTime({seconds:time/1000}),time);assert.equal(scenarioCreatedTime('2026-10-02T00:00:00Z'),time);assert.equal(scenarioCreatedTime(new Date(time)),time);assert.equal(scenarioCreatedTime(null),0);assert.equal(scenarioCreatedTime(false),0);
 const rows=[{createdAt:'2026-05-15'},{createdAt:'2026-08-08'}];rows.sort((a,b)=>scenarioCreatedTime(b.createdAt)-scenarioCreatedTime(a.createdAt));assert.equal(rows[0].createdAt,'2026-08-08');
});
function context(lang='it',paid=true){
 const elements=new Map();const c={financialNumber,targetEquity,Intl,window:{currentLang:lang},document:{getElementById:id=>{if(!elements.has(id))elements.set(id,{innerHTML:''});return elements.get(id);}},t:(it,en)=>lang==='en'?en:it,isPro:()=>paid,isInvestor:()=>false,formatDate:()=> '02/10/2026',escapeDashboardHTML:value=>String(value).replaceAll('<','&lt;').replaceAll('>','&gt;')};vm.createContext(c);
 const utilities=source.slice(source.indexOf('function formatCurrency('),source.indexOf('// Calendar days'));
 const target=source.slice(source.indexOf('function scenarioContext('),source.indexOf('// ===============================\n// REVENUE SIMULATOR'));
 const verdict=source.slice(source.indexOf('function generateInvestmentVerdict('),source.indexOf('// =================',source.indexOf('function renderInvestmentVerdict(')+40));
 // The render function contains no subsequent section marker until its end.
 const renderStart=source.indexOf('function renderInvestmentVerdict(');const renderEnd=source.indexOf('\nfunction ',renderStart+20);
 vm.runInContext(utilities+target+source.slice(source.indexOf('function generateInvestmentVerdict('),renderStart)+source.slice(renderStart,renderEnd),c);return {c,elements};
}
test('verdict keeps risk zero and prioritizes losses over positive ROI',()=>{
 const {c}=context();assert.equal(c.generateInvestmentVerdict({roi:12,net:100,risk:0}).type,'excellent');assert.equal(c.generateInvestmentVerdict({roi:12,net:-100,risk:0}).type,'risk');assert.equal(c.generateInvestmentVerdict({roi:12,net:100,risk:80}).type,'risk');
});
test('missing risk is incomplete and zero cashflow does not trigger favourable verdict',()=>{
 const {c}=context();assert.equal(c.generateInvestmentVerdict({roi:20,net:100}).type,'incomplete');assert.equal(c.generateInvestmentVerdict({roi:20,net:0,risk:20}).type,'good');
});
test('rendered verdict names latest scenario and excludes portfolio claim',()=>{
 const {c,elements}=context();c.renderInvestmentVerdict({roi:35.1,net:10535.11,risk:25,city:'Milano'});const out=elements.get('investment-verdict').innerHTML;assert.match(out,/Milano/);assert.match(out,/35,1%/);assert.match(out,/non del patrimonio/);assert.doesNotMatch(out,/ROI sopra la media|Ottimo investimento/);
});
test('target render explains unachievable positive ROI in Italian and English',()=>{
 for(const lang of ['it','en']){const {c,elements}=context(lang);c.renderROITargetCalculator([{equity:159000,roi:-7.8,net:-12365.692,city:'Napoli'}]);const out=elements.get('roi-target-calculator').innerHTML;assert.match(out,/>--</);assert.doesNotMatch(out,/-123\.656/);assert.match(out,lang==='it'?/non è ottenibile/:/cannot be achieved/);}
});
test('Free verdict offers plans without a real-profit promise and clears stale data',()=>{
 const {c,elements}=context('it',false);c.renderInvestmentVerdict({roi:20,net:100,risk:20,city:'Roma'});assert.match(elements.get('investment-verdict').innerHTML,/Confronta Investor e Pro/);assert.doesNotMatch(elements.get('investment-verdict').innerHTML,/trasformarlo in profitto reale|ROI reale/);c.renderInvestmentVerdict(null);assert.equal(elements.get('investment-verdict').innerHTML,'');
});
