import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createInvestmentAnalysisState} from '../js/investment-analysis-state.js';
const engine=readFileSync(new URL('../js/chatbot/core/investment-autopilot-engine.js',import.meta.url),'utf8');
function setup(paid=true){
 const elements={};
 for(const [id,value] of Object.entries({price:'200000',equity:'45000',priceNight:'200',occupancy:'70',expenses:'800',commission:'15',tax:'21',interestRate:'3.5',loanYears:'20',loanAmount:'155000','market-city':'roma','custom-location':'Roma'}))elements[id]={id,value};
 elements['analyze-btn']={};elements['tool-result-state']={dataset:{}};
 const listeners={};const document={getElementById:id=>elements[id],addEventListener:(event,fn)=>listeners[event]=fn};
 const window={currentCity:'roma',currentUser:paid?{uid:'user-a'}:null,simulationExecuted:true,isCalculating:false,
   getUserAccess:()=>paid?{isPro:true}:{isFree:true}};
 const state=createInvestmentAnalysisState(window,document);
 vm.runInNewContext(engine,{window,document});
 const result={roi:31.2142,realROI:7.0232,netAfterMortgage:14046.4,gross:51100,risk:23,dscr:2.91,mortgageYearly:10787};
 const publish=(data=result)=>state.publish(data,{equity:45000},state.capture());
 const answer=()=>window.rbBuildInvestmentAutopilotResponse(window.rbInvestmentAutopilotQuestions.results[0]);
 return {elements,listeners,window,state,result,publish,answer};
}
test('no completed snapshot cannot fall back to stale shared analysis or a PDF',()=>{
 const s=setup();s.window.lastAnalysisData={roi:987654};s.window.rbPDFConversationDocumentId='old-pdf';
 assert.equal(s.state.getState().status,'missing');assert.doesNotMatch(s.answer().textIT,/987654/);assert.match(s.answer().textIT,/Avvia prima/);
});
test('Pro current snapshot explains canonical ROI and cashflow without calculations or form changes',()=>{
 const s=setup();const before=JSON.stringify(s.elements);assert.equal(s.publish(),true);
 const a=s.answer();assert.match(a.textIT,/31,2%/);assert.match(a.textIT,/14\.046,40/);assert.match(a.textIT,/1\.170,53/);assert.match(a.textIT,/2,91/);assert.match(a.textIT,/45\.000/);
 assert.equal(JSON.stringify(s.elements),before);assert.ok(a.actions.some(a=>a.target==='results'));
});
test('Investor sees its analysis with the same permitted indicators',()=>{
 const s=setup();s.window.getUserAccess=()=>({isInvestor:true});s.publish();assert.match(s.answer().textIT,/ROI sul capitale proprio/);assert.match(s.answer().textIT,/Indice rischio del modello/);
});
test('Free exposes property ROI and its visible cashflow, never premium metrics',()=>{
 const s=setup(false);s.result.roi=99999;s.result.risk=77777;s.result.dscr=88888;s.publish();const a=s.answer();
 assert.match(a.textIT,/ROI immobile: 7,0%/);assert.match(a.textIT,/14\.046,40/);assert.doesNotMatch(a.textIT,/99999|77777|88888|DSCR|Indice rischio|Ricavi annui simulati|Capitale proprio usato/);
 assert.equal(Object.hasOwn(s.state.getState().metrics,'risk'),false);
});
test('every financial field and location change makes results stale without leaking old metrics',()=>{
 for(const id of ['price','equity','priceNight','occupancy','expenses','commission','tax','loanAmount','interestRate','loanYears','market-city','custom-location']){
   const s=setup();s.publish();s.elements[id].value+='1';
   assert.equal(s.state.getState().status,'stale',id);const a=s.answer();assert.match(a.textIT,/Ricalcola/);assert.doesNotMatch(a.textIT,/31,2%|14\.046,40/);assert.equal(a.actions.some(a=>a.target==='results'),false);
 }
 const s=setup();s.publish();s.window.currentCity='napoli';assert.equal(s.state.getState().status,'stale');
});
test('account switch, logout and plan downgrade invalidate the snapshot',()=>{
 for(const change of [s=>s.window.currentUser={uid:'user-b'},s=>s.window.currentUser=null,s=>s.window.getUserAccess=()=>({isFree:true})]){
   const s=setup();s.publish();change(s);assert.equal(s.state.getState().status,'stale');assert.doesNotMatch(s.answer().textIT,/31,2%|DSCR/);
 }
});
test('pending analysis cannot expose the previous snapshot; failed analysis stays missing',()=>{
 const s=setup();s.publish();s.window.isCalculating=true;assert.equal(s.state.getState().status,'pending');assert.doesNotMatch(s.answer().textIT,/31,2%/);
 s.state.invalidate();s.window.isCalculating=false;assert.equal(s.state.getState().status,'missing');
});
test('publish rejects invalid essential metrics and signatures changed during a calculation',()=>{
 const s=setup();const captured=s.state.capture();s.elements.price.value='1';assert.equal(s.state.publish(s.result,{equity:45000},captured),false);
 for(const v of [null,undefined,NaN,Infinity]){assert.equal(s.publish({...s.result,netAfterMortgage:v}),false);assert.equal(s.state.getState().status,'missing');}
});
test('negative and zero cashflow remain valid and DSCR below one is reported',()=>{
 const s=setup();s.publish({...s.result,netAfterMortgage:-1000,roi:-2.2,dscr:.94,risk:0});const a=s.answer();
 assert.match(a.textIT,/disavanzo/);assert.match(a.textIT,/non copre le rate/);assert.match(a.textIT,/0\/100/);
 s.publish({...s.result,netAfterMortgage:0,roi:0,mortgageYearly:0});assert.match(s.answer().textIT,/pareggio/);assert.doesNotMatch(s.answer().textIT,/DSCR/);
});
test('input events update the visible freshness badge and reanalysis restores current results',()=>{
 const s=setup();s.publish();s.elements.occupancy.value='60';s.listeners.input({target:s.elements.occupancy});assert.match(s.elements['tool-result-state'].textContent,/ricalcola/);
 s.publish();assert.equal(s.state.getState().status,'current');
});
test('click-time guard blocks a shortcut from a response created before inputs changed',()=>{
 const s=setup();s.publish();const action=s.answer().actions.find(a=>a.target==='results');s.elements.price.value='300000';
 s.document={getElementById:id=>s.elements[id],querySelectorAll:()=>[]};
 vm.runInNewContext(readFileSync(new URL('../js/investment-workspace.js',import.meta.url),'utf8'),{window:s.window,document:s.document});
 assert.equal(s.window.rbOpenInvestmentAction(action),false);
});
test('app captures at calculation time and publishes only after the result-rendering path',()=>{
 const app=readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
 assert.ok(app.indexOf('const investmentInputSignature =')<app.indexOf('const result = calculateROI({'));
 assert.ok(app.indexOf('investmentAnalysisState.publish(')>app.indexOf('renderFreeSimulationPreview(result, {access'));
});
