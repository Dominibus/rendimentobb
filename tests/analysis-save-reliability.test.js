import {readInvestmentAssumptions,buildInvestmentAssumptions} from '../js/investment-assumptions.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
globalThis.window={};
const {calculateROI}=await import('../js/roi-engine.js');
const source=readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
const saveStart=source.indexOf('async function saveAnalysis(data){');
const save=source.slice(saveStart,source.indexOf('// 🔒 LOCK OVERLAY',saveStart));
const postStart=source.indexOf('function runPostAnalysis(result, context){');
const post=source.slice(postStart,source.indexOf('    // 🤖 CHATBOT LIVE ANALYSIS',postStart))+'\n}catch(e){throw e;} }';
function setup(){
 const writes=[];let writer=async data=>{writes.push(data)};
 const window={getUserAccess:()=>({isPaid:true}),currentUser:{uid:'investor'},firebaseReady:true,currentCity:'roma',__MANUAL_ANALYSIS__:true,dispatchEvent:()=>{}};
 const c={readInvestmentAssumptions,window,console:{error:()=>{}},db:{},collection:()=>({}),addDoc:(_ref,data)=>writer(data),
  document:{getElementById:()=>null},sessionStorage:{getItem:()=>null},localStorage:{getItem:()=>null},serverTimestamp:()=> 'timestamp',Event:class {},appDebugWarn:()=>{}};
 vm.createContext(c);vm.runInContext(save+'\n'+post,c);
 return {c,window,writes,setWriter:fn=>writer=fn};
}
const input={price:150000,equity:30000,priceNight:150,occupancy:70,expenses:800,expensesUnit:'monthly_eur',commission:15,tax:21,loanAmount:120000,interestRate:3.5,loanYears:20};
function run(s,i=input){const result=calculateROI(i);s.c.runPostAnalysis(result,{...i,gross:result.gross,net:result.netAfterMortgage,assumptions:buildInvestmentAssumptions(result,i,'simulator')});return result;}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('Firebase readiness and missing account cannot strand the save lock',async()=>{
 for(const mode of ['firebase','account']){
  const s=setup();if(mode==='firebase')s.window.firebaseReady=false;else s.window.currentUser=null;
  assert.equal(await s.c.saveAnalysis({}),false);assert.equal(s.window.__savingAnalysis,undefined);
  s.window.firebaseReady=true;s.window.currentUser={uid:'investor'};
  assert.equal(await s.c.saveAnalysis({roi:-4.2}),true);assert.equal(s.writes.length,1);assert.equal(s.window.__savingAnalysis,false);
 }
});
test('rejected Firestore write unlocks and permits immediate retry',async()=>{
 const s=setup();s.setWriter(async()=>{throw Error('offline')});
 assert.equal(await s.c.saveAnalysis({expenses:800}),false);assert.equal(s.window.__savingAnalysis,false);
 s.setWriter(async d=>s.writes.push(d));assert.equal(await s.c.saveAnalysis({expenses:800}),true);assert.equal(s.writes[0].expenses,800);
});
test('concurrent saves retain one write until the pending write completes',async()=>{
 const s=setup();let release;s.setWriter(data=>new Promise(resolve=>{s.writes.push(data);release=resolve}));
 const pending=s.c.saveAnalysis({expenses:0});assert.equal(await s.c.saveAnalysis({expenses:1}),false);assert.equal(s.writes.length,1);
 release();assert.equal(await pending,true);assert.equal(s.window.__savingAnalysis,false);
});
test('completed tool scenario persists actual monthly costs and canonical negative metrics',async()=>{
 const s=setup();const result=run(s,{...input,expenses:2500});await flush();const d=s.writes[0];
 assert.equal(d.expenses,2500);assert.equal(d.assumptions.expenses,2500);assert.equal(d.assumptions.loanAmount,input.loanAmount);assert.ok(d.roi<0);assert.equal(d.roi,result.roi);assert.equal(d.net,result.netAfterMortgage);
 for(const field of ['realROI','gross','dscr','noi','netOperatingIncome','annualDebtService','risk','occupancy'])assert.equal(d[field],result[field],field);
 assert.equal(d.propertyPrice,result.price);assert.equal(d.equity,result.equity);
 // Reloaded persisted JSON keeps the same cost/cashflow/ROI values.
 const reloaded=JSON.parse(JSON.stringify(d));assert.equal(reloaded.expenses,2500);assert.equal(reloaded.net,result.netAfterMortgage);
});
test('percentage preview saves engine-converted EUR/month rather than the percentage',async()=>{
 const s=setup();const result=run(s,{...input,expenses:35,expensesUnit:'percentage'});await flush();
 assert.equal(s.writes[0].expenses,result.expensesYearly/12);assert.notEqual(s.writes[0].expenses,35);
});
test('zero costs remain zero and different inputs with identical ROI are not suppressed',async()=>{
 const s=setup();run(s,{...input,expenses:0});await flush();assert.equal(s.writes[0].expenses,0);
 const result=calculateROI(input);const context={...input,gross:result.gross,net:result.netAfterMortgage};
 s.c.runPostAnalysis(result,context);await flush();const before=s.writes.length;
 s.c.runPostAnalysis(result,context);await flush();assert.equal(s.writes.length,before);
 s.c.runPostAnalysis(result,{...context,priceNight:160});await flush();assert.equal(s.writes.length,before+1);
});
test('failed post-analysis write does not mark scenario saved and immediate retry works',async()=>{
 const s=setup();s.setWriter(async()=>{throw Error('unavailable')});run(s);await flush();assert.equal(s.window.__LAST_SAVED_ANALYSIS__,undefined);
 s.setWriter(async d=>s.writes.push(d));run(s);await flush();assert.equal(s.writes.length,1);assert.ok(s.window.__LAST_SAVED_ANALYSIS__);
});
