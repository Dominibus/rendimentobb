import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {createPMSApiClient} from '../js/pms-api-client.js';
import {calculateCommercial} from '../js/commercial-property-engine.js';
import {calculateROI} from '../js/roi-engine.js';
import {createCommercialActivityPlan} from '../js/commercial-activity-plan.js';
import {scenarioCashflow} from '../js/scenario-cashflow.js';
import {commercialFixture} from './fixtures/commercial-scenario.js';
const user={uid:'synthetic-a',getIdToken:async()=>'local-test-token'};
const reply=()=>({ok:true,json:async()=>({success:true})});
const storage=()=>{const m=new Map();return {m,getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}};
function api(fetchImpl,saved=storage(),getUser=()=>user){return createPMSApiClient({getUser,fetchImpl,storage:saved,cryptoImpl:webcrypto});}
test('uncertain A survives successful B, reload, and only its acknowledgement clears A',async()=>{
 const saved=storage(),calls=[];let lose=true;
 const fetch=async(u,o)=>{const b=JSON.parse(o.body);calls.push(b);if(lose){lose=false;throw Error('lost');}return reply();};
 let mutate=api(fetch,saved);
 await assert.rejects(mutate('save',{data:{guestName:'Synthetic A'}}));
 await mutate('save',{data:{guestName:'Synthetic B'}});
 assert.equal(saved.m.size,1);assert.ok(![...saved.m.values()].join('').includes('Synthetic A'));
 mutate=api(fetch,saved);await mutate('save',{data:{guestName:'Synthetic A'}});
 assert.equal(calls[0].requestId,calls[2].requestId);assert.notEqual(calls[0].requestId,calls[1].requestId);assert.equal(saved.m.size,0);
 await mutate('save',{data:{guestName:'Synthetic A'}});assert.notEqual(calls[2].requestId,calls[3].requestId,'new deliberate acknowledged creation stays distinct');
});
test('out-of-order response B cannot clear uncertain A',async()=>{
 const saved=storage(),calls=[],resolvers={};
 const mutate=api(async(u,o)=>{const b=JSON.parse(o.body);calls.push(b);if(calls.length<=2)return new Promise((resolve,reject)=>resolvers[b.data.code]={resolve,reject});return reply();},saved);
 const a=mutate('save',{data:{code:'A'}}),b=mutate('save',{data:{code:'B'}});
 while(calls.length<2)await new Promise(r=>setImmediate(r));
 const rejected=assert.rejects(a);resolvers.B.resolve(reply());await b;resolvers.A.reject(Error('lost'));await rejected;
 await mutate('save',{data:{code:'A'}});assert.equal(calls.find(x=>x.data.code==='A').requestId,calls[2].requestId);
});
test('same payload concurrently shares a single operation and acknowledgement',async()=>{
 let calls=0,release;const mutate=api(async()=>{calls++;return new Promise(r=>release=r)});
 const a=mutate('save',{data:{code:'A'}}),b=mutate('save',{data:{code:'A'}});
 while(!release)await new Promise(r=>setImmediate(r));await new Promise(r=>setImmediate(r));release(reply());await Promise.all([a,b]);assert.equal(calls,1);
});
test('legacy singleton migrates without losing its request ID',async()=>{
 const saved=storage(),bodies=[];const mutate=api(async(u,o)=>{bodies.push(JSON.parse(o.body));throw Error('lost');},saved);
 await assert.rejects(mutate('save',{data:{x:1}}));const key=`rb_pms_pending_${user.uid}`,state=JSON.parse(saved.getItem(key)),signature=Object.keys(state.requests)[0];
 saved.setItem(key,JSON.stringify({uid:user.uid,signature,requestId:state.requests[signature].requestId}));
 await api(async(u,o)=>{bodies.push(JSON.parse(o.body));return reply();},saved)('save',{data:{x:1}});assert.equal(bodies[0].requestId,bodies[1].requestId);assert.equal(saved.m.size,0);
});
test('token failure preserves request identity without a fetch',async()=>{
 const saved=storage();let bad=true,calls=0;
 const mutate=api(async()=>{calls++;return reply();},saved,()=>({...user,getIdToken:async()=>{if(bad)throw Error('token');return 'token';}}));
 await assert.rejects(mutate('save',{data:{x:1}}));const initial=[...saved.m.values()][0];bad=false;await mutate('save',{data:{x:1}});assert.equal(calls,1);assert.ok(initial.includes('requestId'));assert.equal(saved.m.size,0);
});
test('corrupt pending state fails closed without sending a potentially duplicate write',async()=>{
 const saved=storage();saved.setItem(`rb_pms_pending_${user.uid}`,'{broken');let calls=0;
 await assert.rejects(api(async()=>{calls++;return reply()},saved)('save',{}),e=>e.code==='booking/pending_state_invalid');assert.equal(calls,0);
});
test('switching account and back preserves both unresolved requests separately',async()=>{
 const saved=storage(),calls=[];let current=user;
 const mutate=api(async(u,o)=>{calls.push(JSON.parse(o.body).requestId);throw Error('lost');},saved,()=>current);
 await assert.rejects(mutate('save',{}));current={...user,uid:'synthetic-b'};await assert.rejects(mutate('save',{}));current=user;await assert.rejects(mutate('save',{}));assert.equal(calls[0],calls[2]);assert.notEqual(calls[0],calls[1]);
});
test('out of year unknown VAT contributes zero without hiding in-year known revenue',()=>{
 const m=commercialFixture();m.assignments[0].vat={status:'taxable',rate:22};
 m.assignments.push({...structuredClone(m.assignments[0]),id:'A2',roomId:'R2',code:'P02',start:'2028-01-01',end:'2028-12-31',vat:{status:'unknown',rate:null}});
 const r=calculateCommercial(m);assert.equal(r.expectedNet,3000);assert.equal(createCommercialActivityPlan(m).months.reduce((sum,row)=>sum+row.expectedNet,0),r.expectedNet);assert.equal(r.cashflow,600);assert.equal(r.assignments[1].contractualNet,0);assert.equal(r.assignments[1].expectedNet,0);
});
test('unknown VAT with relevant revenue remains unknown; zero realisation is zero, not a tax exemption',()=>{
 const m=commercialFixture();assert.equal(calculateCommercial(m).expectedNet,null);m.assignments[0].expectedPct=0;
 const r=calculateCommercial(m);assert.equal(r.expectedNet,0);assert.equal(r.contractualNet,null);assert.equal(r.assignments[0].vat.status,'unknown');assert.equal(r.cashflow,-2400);
});
test('per-use completely closed unknown VAT has no expected or contractual revenue',()=>{
 const m=commercialFixture('per_use');m.closures=[{roomId:'*',start:'2027-01-01',end:'2027-12-31'}];const r=calculateCommercial(m);assert.equal(r.expectedNet,0);assert.equal(r.contractualNet,0);
});
for(const input of [{priceNight:Infinity},{occupancy:NaN},{loanAmount:150000,loanYears:0},{loanAmount:150000,loanYears:Infinity}])test('invalid ROI inputs are rejected explicitly: '+JSON.stringify(input),()=>{
 assert.throws(()=>calculateROI({price:200000,equity:50000,...input}),e=>e.code==='roi/invalid_input');
});
test('valid zero-interest and no-debt cases preserve cashflow identities',()=>{
 for(const loanAmount of [0,150000]){const r=calculateROI({price:200000,equity:50000,loanAmount,interestRate:0,loanYears:20});assert.ok(Number.isFinite(r.netAfterMortgage));assert.ok(Math.abs(r.netAfterMortgage-(r.netOperatingIncome-r.taxCost-r.mortgageYearly))<1e-8);}
});
test('cashflow chart distinguishes missing, malformed, zero and negative values',()=>{
 for(const row of [{},{net:null},{net:''},{net:'n/a'},{net:Infinity},{net:false}])assert.equal(scenarioCashflow(row),null);
 assert.equal(scenarioCashflow({net:0}),0);assert.equal(scenarioCashflow({net:-120}),-120);assert.equal(scenarioCashflow({cashflow:'20.5'}),20.5);
});
test('actual cashflow chart receives null/zero/negative distinctly and a visible coverage note',async()=>{
 const {readFileSync}=await import('node:fs'),{runInNewContext}=await import('node:vm');
 const source=readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');
 const start=source.indexOf('let cashflowChartInstance = null;'),end=source.indexOf('// INVESTMENT INSIGHT ENGINE',start);
 const container={},coverage={},canvas={getContext:()=>({})};let config;
 const ctx={scenarioCashflow,window:{dashboardSimulations:[{}, {net:0},{net:-120}]},document:{getElementById:id=>({'cashflow-chart-container':container,'cashflowChart':canvas,'cashflow-chart-coverage':coverage}[id])},t:(it,en)=>en,formatCurrency:x=>String(x),Chart:class{constructor(context,c){config=c}destroy(){}}};
 runInNewContext(source.slice(start,end)+'\nrenderCashflowChart();',ctx);
 assert.deepEqual(Array.from(config.data.datasets[0].data),[null,0,-120]);assert.equal(coverage.hidden,false);assert.match(coverage.textContent,/1 scenarios/);assert.match(config.data.labels[0],/N\/A/);assert.match(config.data.datasets[0].label,/cashflow/);
 ctx.window.dashboardSimulations=[{net:0}];runInNewContext('renderCashflowChart()',ctx);assert.equal(coverage.hidden,true);assert.equal(coverage.textContent,'');
});
