import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {requiredAnnualRevenue,buildInvestmentAssumptions} from '../js/investment-assumptions.js';
import search from '../api/property-search.js';
globalThis.window={};
const {calculateROI}=await import('../js/roi-engine.js');
const source=readFileSync(new URL('../js/chatbot/core/confirmed-portfolio-engine.js',import.meta.url),'utf8');
function portfolio(overrides={}){
 const window={currentUser:{uid:'owner'},getUserAccess:()=>({isPro:true}),rbConfirmedPortfolio:{ownerUid:'owner',loadedAt:'2026-10-08',rows:[{city:'Napoli',net:-11417.64,roi:-10,equity:50000}]},lastAnalysisData:{net:-674595},...overrides};
 vm.runInNewContext(source,{window,Intl});return window.rbBuildConfirmedPortfolioResponse;
}
test('confirmed portfolio uses saved rows, annual/monthly units, never latest simulation',()=>{
 const r=portfolio()('Analizza il mio patrimonio confermato: quali immobili hanno cashflow negativo e quale passo devo fare?');
 assert.equal(r.type,'confirmed_portfolio_grounded');assert.match(r.textIT,/951,47.*mese/);assert.match(r.textIT,/11.417,64.*anno/);assert.doesNotMatch(r.textIT,/674/);assert.match(r.textIT,/Napoli/);assert.match(r.textEN,/month/);
});
test('portfolio blocks foreign snapshots, missing accounts and free accounts',()=>{
 assert.equal(portfolio({rbConfirmedPortfolio:{ownerUid:'other',rows:[{net:999}]}})('Analizza patrimonio cashflow').metadata.answerMode,'unavailable');
 assert.equal(portfolio({currentUser:null})('Analyze confirmed portfolio').metadata.answerMode,'access');
 assert.equal(portfolio({getUserAccess:()=>({isFree:true})})('Analizza patrimonio cashflow').metadata.answerMode,'access');
});
test('incomplete confirmed cashflow is not reported as a complete total or as zero',()=>{
 const r=portfolio({rbConfirmedPortfolio:{ownerUid:'owner',rows:[{net:null},{net:1200}]}})('Analyze portfolio cashflow');
 assert.match(r.textEN,/1\/2/);assert.doesNotMatch(r.textEN,/total cash flow/);assert.match(r.textEN,/missing records/);
});
test('portfolio preserves PDF, payments and unrelated simulation routing',()=>{
 for(const q of ['analizza il PDF del patrimonio','cashflow simulazione','pagamenti portfolio cashflow','elimina patrimonio confermato'])assert.equal(portfolio()(q),null);
});
const input={price:150000,equity:30000,loanAmount:120000,priceNight:150,occupancy:70,expenses:500,expensesUnit:'monthly_eur',commission:15,tax:21,interestRate:0,loanYears:20};
test('required gross revenue solves the same saved financial engine, fixed and percentage costs',()=>{
 for(const i of [input,{...input,interestRate:4.1},{...input,expenses:35,expensesUnit:'percentage'},{...input,commission:0,tax:0,expenses:0}]){
  const a=buildInvestmentAssumptions(calculateROI(i),i,'simulator');const required=requiredAnnualRevenue(a);assert.ok(Number.isFinite(required));
  const net=calculateROI({...i,priceNight:required/365,occupancy:100}).netAfterMortgage;
  assert.ok(Math.abs(net)<1e-7,`threshold reproduces cashflow ${net}`);
  if(required>0)assert.ok(calculateROI({...i,priceNight:required*.99/365,occupancy:100}).netAfterMortgage<0);
 }
});
test('legacy and unsolvable required revenue never get invented defaults',()=>{
 assert.equal(requiredAnnualRevenue(null),null);assert.equal(requiredAnnualRevenue({}),null);
 for(const i of [{...input,tax:100},{...input,commission:100},{...input,expensesUnit:'percentage',expenses:90}])assert.equal(requiredAnnualRevenue(buildInvestmentAssumptions(calculateROI(i),i,'simulator')),null);
});
async function find(query){let body,status;const res={setHeader(){},status(n){status=n;return this;},json(data){body=data;}};await search({method:'GET',query},res);return {status,body};}
test('illustrative search respects all filters and returns empty rather than substitute cities',async()=>{
 const none=await find({city:'roma',budget:'100',sqm:'60',goal:'roi'});assert.equal(none.status,200);assert.equal(none.body.results.length,0);
 for(const goal of ['roi','cashflow','safe']){
  const {body}=await find({city:'napoli',budget:'210000',sqm:'60',goal});assert.ok(body.results.length);
  assert.ok(body.results.every(p=>p.city==='napoli'&&p.price<=210000&&p.sqm>=60&&p.url===''));
  const values=body.results.map(p=>goal==='roi'?p.roi:goal==='cashflow'?p.sqm:-p.price);
  assert.deepEqual(values,[...values].sort((a,b)=>b-a));
 }
});

import {renderProperties} from './helpers/dashboard-html-harness.js';
test('property cards separate lifetime revenue, monthly actual ADR and base tariff',async()=>{
 const now=new Date(),y=now.getFullYear(),m=now.getMonth();const date=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const booking={checkin:date(new Date(y,m,2)),checkout:date(new Date(y,m,4)),totalAmount:400,status:'confirmed'};
 const legacy={checkin:'2020-01-01',checkout:'2020-01-11',totalAmount:5000,status:'checkout'};
 const html=await renderProperties({name:'Casa',priceNight:999},'p',[booking,legacy]);
 assert.match(html,/Ricavi registrati · tutti i periodi/);assert.match(html,/5400 €/);assert.match(html,/ADR · mese corrente<\/strong>\s*<span>200 €/);assert.match(html,/Tariffa base/);assert.match(html,/€999/);
 const monthDays=new Date(y,m+1,0).getDate();assert.ok(html.includes(`${400/monthDays} €`));
 const excluded=await renderProperties({name:'Casa',priceNight:999},'p',[{...booking,status:'pending'},{...booking,status:'cancelled'}]);assert.doesNotMatch(excluded,/ADR · mese corrente<\/strong>\s*<span>200 €/);
});

test('capital recovery displays actual equity recovery and preserves sub-year results',()=>{
 const app=readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
 const fn=app.slice(app.indexOf('function renderUniversalKPI(data = {}){'),app.indexOf('// ================= ROI MESSAGE (HOME)'));
 const nodes=new Map();const context={window:{currentPlan:'pro',getUserAccess:()=>({isPro:true,canSeeFullAnalysis:true})},document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,{innerText:'',dataset:{},style:{},classList:{remove(){}}});return nodes.get(id);},querySelectorAll:()=>[]},formatCurrency:String,t:it=>it,appDebugWarn(){}};
 vm.runInNewContext(fn,context);
 context.renderUniversalKPI({net:7550,revenue:35587.5,investment:30000});assert.equal(nodes.get('break-even').innerText,'4.0 anni');
 context.renderUniversalKPI({net:60000,investment:30000});assert.equal(nodes.get('break-even').innerText,'0.5 anni');
 context.renderUniversalKPI({net:-10,investment:30000});assert.equal(nodes.get('break-even').innerText,'-');
});
