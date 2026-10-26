import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readPropertyScenario,installPropertyScenarioInputs} from '../js/property-scenario-inputs.js';
import search from '../api/property-search.js';
import {calculateCommercial,createCommercialModel} from '../js/commercial-property-engine.js';
import {createCommercialActivityPlan} from '../js/commercial-activity-plan.js';
import {calculateMortgage} from '../js/mortgage-engine.js';
import {controlSummary} from '../js/admin-control-model.js';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
test('RC201 main property page exposes crawlable city paths and no unsupported returns',()=>{
 const page=read('immobili/index.html');
 assert.doesNotMatch(page,/class="property-roi">\d|Cashflow stimato: \+|ROI di esempio|Example ROI|scenario\.roi/);
 for(const city of ['roma','napoli','milano','firenze'])assert.match(page,new RegExp('<a[^>]+class="property-card[^>]+href="/immobili/'+city+'/"'));
 assert.doesNotMatch(page,/<h2 style="display:none"/);
});
function form(search,{pending=false,imported=false,en=false,readyState='loading'}={}){
 const nodes=Object.fromEntries(['price','priceNight','occupancy','equity','expenses','loanAmount','market-city','custom-location','property-banner','property-scenario-status'].map(id=>[id,{value:'old',dataset:{},style:{},hidden:true,dispatchEvent(){}}]));
 let ready;
 const window={location:{search},currentLang:en?'en':'it',rbImportedMortgage:imported,sessionStorage:{getItem:()=>pending?'pending':null},Event:class {constructor(type,options){this.type=type;this.options=options;}}};
 const document={readyState,getElementById:id=>nodes[id],addEventListener:(name,fn)=>{assert.equal(name,'DOMContentLoaded');ready=fn;}};
 installPropertyScenarioInputs(window,document);
 return {nodes,window,run:()=>ready?.()};
}

for(const city of ['roma','napoli','milano','firenze'])test(`RC201 all published ${city} cards transfer exact declared inputs, with no invented financial outputs`,()=>{
 const page=read(`immobili/${city}/index.html`);
 assert.doesNotMatch(page,/ROI \d+(?:\.\d+)?%|\+[\d.]+€\/mese/);
 assert.equal((page.match(/alt=""/g)||[]).length,3);
 const links=[...page.matchAll(/href="(\/tool\/\?city=[^"]+&price=[^"]+)"/g)].map(m=>m[1]);
 assert.equal(links.length,3);
 for(const link of links){
  const query=link.slice(link.indexOf('?')),values=readPropertyScenario(query),f=form(query);
  assert.equal(values.status,'valid');assert.equal(values.city,city);
  // The last DOMContentLoaded pass must override older city/property defaults.
  f.nodes.price.value='999999';f.nodes.occupancy.value='76';f.run();
  assert.equal(Number(f.nodes.price.value),values.price);
  assert.equal(Number(f.nodes.priceNight.value),values.night);
  assert.equal(Number(f.nodes.occupancy.value),values.occ);
  assert.equal(f.nodes.equity.value,'');assert.equal(f.nodes.expenses.value,'');assert.equal(f.nodes.loanAmount.value,'');
  assert.equal(f.window.currentCity,city);assert.match(f.nodes['property-scenario-status'].textContent,/ipotesi da verificare/);
 }
});
for(const query of ['?price=1','?city=roma&price=&night=145&occ=70','?city=roma&price=380000&night=145&occ=101','?city=roma&price=380000&price=1&night=145&occ=70','?city=roma&city=napoli&price=380000&night=145&occ=70','?city=roma&price=Infinity&night=145&occ=70','?city=roma&price=380000&night=-1&occ=70','?city=roma&price=380000&night=145&occ=70&propertyMode=owned','?city=%3Cscript%3E&price=380000&night=145&occ=70'])test('RC201 malformed property query rejected atomically: '+query,()=>{
 assert.equal(readPropertyScenario(query).status,'invalid');const f=form(query);f.run();assert.equal(f.nodes.price.value,'old');assert.match(f.nodes['property-scenario-status'].textContent,/non validi/);
});
test('RC201 ordinary simulator and mortgage/owned routes are not changed',()=>{
 for(const q of ['','?city=roma','?municipality=001272','?propertyMode=owned']){assert.equal(readPropertyScenario(q).status,'absent');const f=form(q);f.run();assert.equal(f.nodes.price.value,'old');}
 for(const mode of [{pending:true},{imported:true}]){const f=form('?city=roma&price=380000&night=145&occ=70',mode);f.run();assert.equal(f.nodes.price.value,'old');assert.match(f.nodes['property-scenario-status'].textContent,/scenario mutuo/);}
 const f=form('?city=roma&price=380000&night=145&occ=0',{en:true});f.run();assert.equal(f.nodes.occupancy.value,'0');assert.match(f.nodes['property-scenario-status'].textContent,/assumptions to verify/);
});
test('RC201 deferred module waits through interactive state until legacy defaults finish',()=>{
 const f=form('?city=roma&price=380000&night=145&occ=70',{readyState:'interactive'});
 assert.equal(f.nodes.price.value,'old');f.nodes.price.value='999999';f.nodes.occupancy.value='76';f.run();assert.equal(f.nodes.price.value,'380000');assert.equal(f.nodes.occupancy.value,'70');
});

async function query(q){let body;const res={setHeader(){},status(){return this;},json(v){body=v;}};await search({method:'GET',query:q},res);return body;}
test('RC201 search retains filters and area/price ordering without fabricated ROI or scores',async()=>{
 for(const goal of ['roi','cashflow','safe']){
  const r=await query({city:'napoli',budget:'220000',sqm:'60',goal});assert.ok(r.results.length);
  for(const p of r.results){assert.equal(p.city,'napoli');assert.ok(p.price<=220000&&p.sqm>=60);assert.equal(p.roi,null);assert.equal(p.score,null);assert.doesNotMatch(p.aiReason,/Highest ROI|Best value|Balanced investment/);}
  const values=r.results.map(p=>goal==='safe'?p.price:p.sqm);
  if(goal==='safe')assert.deepEqual(values,[...values].sort((a,b)=>a-b));
  if(goal==='cashflow')assert.deepEqual(values,[...values].sort((a,b)=>b-a));
 }
});

function commercial(mode,vat={status:'taxable',rate:22}){
 const m=createCommercialModel(2027);m.assignments=[{id:'A1',roomId:'R1',code:'P01',mode,weekdays:[1],slotIds:['AM'],start:'2027-01-01',end:'2027-12-31',amount:305,vat,expectedPct:100}];return m;
}
test('RC201 305 EUR requires a billing unit: monthly package differs from each weekly use',()=>{
 assert.throws(()=>calculateCommercial(commercial('')),{code:'tariff'});
 const monthly=calculateCommercial(commercial('weekly_monthly'));near(monthly.contractualGross,3660);near(monthly.expectedNet,3000);near(monthly.expectedVAT,660);assert.equal(monthly.newEquityReturnPct,null);
 const perUse=calculateCommercial(commercial('per_use'));assert.equal(perUse.assignments[0].units,52);near(perUse.contractualGross,15860);near(perUse.expectedNet,13000);
 const unknown=calculateCommercial(commercial('weekly_monthly',{status:'unknown',rate:null}));assert.equal(unknown.expectedNet,null);assert.equal(unknown.cashflow,null);
 const m=commercial('room_monthly');m.assignments[0].expectedPct=50;const r=calculateCommercial(m);near(r.expectedNet,1500);near(createCommercialActivityPlan(m).months.reduce((n,x)=>n+x.expectedNet,0),1500);
});
test('RC201 purchased commercial space: setup capital, zero-rate financing and two room rents reconcile independently',()=>{
 const m=commercial('room_monthly',{status:'no_vat',rate:null});m.rooms.push({id:'R2'});m.assignments.push({...m.assignments[0],id:'A2',roomId:'R2',code:'P02',amount:500});
 Object.assign(m.property,{ownership:'purchase',value:100000,acquisitionCosts:5000,works:10000,newLoan:{amount:80000,rate:0,years:20}});m.costs={fixedAnnual:1200,variablePct:10};
 const r=calculateCommercial(m);near(r.expectedNet,9660);near(r.operatingCosts,2166);near(r.annualDebtService,4000);near(r.cashflow,3494);near(r.newEquity,35000);near(r.newEquityReturnPct,3494/35000*100);
});

// Independent payment solver: find the monthly payment that amortises via
// repeated balance updates, instead of reusing the engine's annuity formula.
for(const [principal,rate,years]of [[120000,0,20],[120000,3.5,20],[200000,1,30],[40000,8,10],[100000,0.00001,20]])test(`RC201 independent amortisation ${principal}/${rate}/${years}`,()=>{
 const months=years*12,r=rate/1200;let lo=0,hi=principal*(1+r);
 for(let k=0;k<120;k++){const payment=(lo+hi)/2;let balance=principal;for(let month=0;month<months;month++)balance=balance*(1+r)-payment;if(balance>0)lo=payment;else hi=payment;}
 near(calculateMortgage(principal,rate,years),(lo+hi)/2*12);
});
test('RC201 three, seven and fourteen days without a recorded job are flagged as stale when admin reads',()=>{
 const now=Date.parse('2026-10-26T12:00:00Z');
 for(const days of [3,7,14]){const summary=controlSummary({observedAt:now,jobs:[{id:'task_notifications',available:true,check:{state:'recorded_success',lastRunAt:now-days*86400000}}],queues:{due:{available:true,entries:[],counts:{}},manual:{available:true,counts:{}}},interests:{available:true,entries:[]}},now);assert.ok(summary.issues.some(i=>i.reason==='stale'));}
});
