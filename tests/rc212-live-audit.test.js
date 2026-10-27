import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
function chat(){const window={getUserAccess:()=>({isFree:true}),lastAnalysisData:{net:987654321},rbChatbotLive:{net:987654321}};const c={window,console,Intl,Date};vm.createContext(c);for(const f of ['query-normalizer','chatbot-orchestrator'])vm.runInContext(read('js/chatbot/core/'+f+'.js'),c);return window;}
for(const q of ['cos e il casflow?','cos e il cashflow?','che cos e il cashflow?','cos e il ROI?','cos e il DSCR?','cos e ADR?'])test('informal definition is public and never reads account values: '+q,async()=>{
 const w=chat(),r=await w.rbProcessAIMessage(q);assert.equal(r.response.type,'education');assert.doesNotMatch(r.response.textIT,/987654321|riservata ai piani/);assert.match(r.response.textIT,/modello|cashflow|Cashflow|ROI|DSCR|ADR/);
});
for(const q of ['cos e il mio cashflow?','cos e il cashflow del PDF?','cos e il cashflow 123?'])test('informal meaning does not bypass personal/document/numeric exclusions: '+q,()=>{assert.equal(chat().rbBuildMetricEducationResponse(q),null);});
for(const q of ['Che cos’è il cashflow?','what is cashflow?','Spiegami la differenza tra NOI e cashflow'])test('existing definitions remain educational: '+q,async()=>{assert.equal((await chat().rbProcessAIMessage(q)).response.type,'education');});
const html=read('dashboard-report/index.html');
function helpers(){const c={getFinancingMetrics:s=>({netOperatingIncome:s.noi??null})};vm.createContext(c);const start=html.indexOf('function reportPropertyYield('),end=html.indexOf('const realROI = reportPropertyYield');vm.runInContext(html.slice(start,end),c);return c;}
test('report operating yield ignores cashflow-based realROI',()=>{const c=helpers();assert.equal(c.reportPropertyYield({realROI:6.5,capRate:15.3,noi:22950},150000,30000),15.3);});
test('report derives operating yield from NOI and preserves missing/zero semantics',()=>{const c=helpers();assert.equal(c.reportPropertyYield({noi:15000},150000,30000),10);assert.equal(c.reportPropertyYield({realROI:6.5},150000,30000),null);assert.equal(c.reportPropertyYield({capRate:0},150000,30000),null);assert.equal(c.reportPropertyYield({capRate:0,reportFieldsVersion:1},150000,30000),0);});
test('separate cashflow/value never falls back to cap rate or NOI',()=>{const c=helpers();assert.ok(Math.abs(c.reportCashflowYield({net:9799.82,capRate:15.3},150000)-6.533213333333333)<1e-9);assert.equal(c.reportCashflowYield({capRate:15.3,noi:22950},150000),null);assert.equal(c.reportCashflowYield({net:0},150000),0);assert.equal(c.reportCashflowYield({net:100},0),null);});
test('IT/EN report names the operating yield and equity payback explicitly',()=>{assert.match(html,/data-it="RENDIMENTO OPERATIVO"/);assert.match(html,/data-en="OPERATING YIELD"/);assert.match(html,/Equity payback/);assert.match(html,/Recupero equity/);assert.doesNotMatch(html,/data-it="ROI IMMOBILE"/);});
test('report export metadata preserves distinct cashflow yield and cap rate',()=>{const block=html.slice(html.indexOf('window.lastExecutiveReport ='),html.indexOf('// ================= SAVE PDF'));assert.match(block,/realROI:\s*reportCashflowYield\(fallback,\s*price\)/);assert.match(block,/capRate:\s*capRate/);});
test('actual report metadata call registers cashflow/value and NOI/value separately',()=>{
 const h=helpers(),start=html.indexOf('window.lastExecutiveReport ='),end=html.indexOf('});',start)+3;
 const fallback={net:9799.82,noi:22976.25},window={buildExecutiveReport:v=>v};
 vm.runInNewContext(html.slice(start,end),{window,fallback,city:'Citta fittizia',price:150000,capRate:15.3175,risk:25,equity:30000,loan:120000,annualProfit:9799.82,score:86,canonicalVerdict:'BUY',reportCashflowYield:h.reportCashflowYield});
 assert.equal(window.lastExecutiveReport.capRate,15.3175);assert.ok(Math.abs(window.lastExecutiveReport.realROI-6.533213333333333)<1e-9);assert.equal(window.lastExecutiveReport.net,9799.82);
});
