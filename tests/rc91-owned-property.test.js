import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {buildInvestmentAssumptions,readInvestmentAssumptions,investmentAssumptionsHTML} from '../js/investment-assumptions.js';
import {renderFreeSimulationPreview} from '../js/free-preview.js';
import {initPropertyMode} from '../js/property-mode.js';
import {createInvestmentAnalysisState} from '../js/investment-analysis-state.js';
import {financialNumber} from '../js/portfolio-kpi.js';
globalThis.window={};
const {calculateROI}=await import('../js/roi-engine.js');
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const base={propertyMode:'owned',price:0,equity:0,priceNight:100,occupancy:50,expenses:300,expensesUnit:'monthly_eur',commission:15,tax:21,interestRate:3.5,loanYears:20};
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('owned home at zero value and zero capital has operating cashflow without invented mortgage or ROI',()=>{
 const r=calculateROI(base);
 assert.equal(r.gross,18250);assert.equal(r.loan,0);assert.equal(r.mortgageYearly,0);
 close(r.netAfterMortgage,(18250-18250*.15-3600)*.79);
 assert.equal(r.roiAvailable,false);assert.equal(r.propertyROIAvailable,false);assert.equal(r.ltvAvailable,false);
 assert.equal(r.riskBreakdown.roi,0);assert.equal(r.riskBreakdown.leverage,0);
 for(const value of Object.values(r))if(typeof value==='number')assert.ok(Number.isFinite(value));
});
test('optional property value never generates a loan; startup capital has its own ROI denominator',()=>{
 const r=calculateROI({...base,price:250000,equity:20000});
 assert.equal(r.loan,0);assert.equal(r.roiAvailable,true);assert.equal(r.propertyROIAvailable,true);
 close(r.roi,r.netAfterMortgage/20000*100);close(r.realROI,r.netAfterMortgage/250000*100);
 const withoutValue=calculateROI({...base,equity:20000});assert.equal(withoutValue.equity,20000);assert.equal(withoutValue.loan,0);close(withoutValue.roi,r.roi);
});
test('explicit remaining loan affects cashflow while unknown LTV is unavailable and risk remains conservative',()=>{
 const r=calculateROI({...base,loanAmount:50000,interestRate:4,loanYears:10});
 const rate=.04/12;const annual=50000*rate/(1-(1+rate)**(-120))*12;
 close(r.mortgageYearly,annual);close(r.netAfterMortgage,calculateROI(base).netAfterMortgage-annual);
 assert.equal(r.ltvAvailable,false);assert.equal(r.riskBreakdown.leverage,10);
});
test('negative and zero cashflow for an owned house are retained, not converted to a positive return',()=>{
 const loss=calculateROI({...base,expenses:3000});assert.ok(loss.netAfterMortgage<0);assert.equal(loss.taxCost,0);
 const zero=calculateROI({...base,priceNight:0,expenses:0});assert.equal(zero.netAfterMortgage,0);assert.equal(zero.roiAvailable,false);
});
test('purchase financing remains price minus equity and zero equity still means full financing',()=>{
 assert.equal(calculateROI({...base,propertyMode:'purchase',price:150000,equity:30000}).loan,120000);
 assert.equal(calculateROI({...base,propertyMode:'purchase',price:150000}).loan,150000);
});
test('owned assumptions survive JSON save/reload and reproduce financing and output without losing mode',()=>{
 const input={...base,price:250000,equity:10000,loanAmount:40000};const result=calculateROI(input);
 const a=buildInvestmentAssumptions(result,input,'owned_property');assert.ok(a);assert.equal(a.source,'owned_property');
 const again=calculateROI({...JSON.parse(JSON.stringify(a)),price:a.propertyPrice});
 assert.equal(again.propertyMode,'owned');for(const key of ['loan','roi','realROI','netAfterMortgage','risk','mortgageYearly'])close(again[key],result[key]);
 assert.match(investmentAssumptionsHTML(a),/Immobile già di proprietà|Capitale per avvio/);
});
function form(mode,extra={}){
 const values={price:'0',equity:'0',priceNight:'100',occupancy:'50',expenses:'300',commission:'15',tax:'21',interestRate:'3.5',loanYears:'20','owned-loan-amount':'0','property-mode':mode,...extra};
 const elements=Object.fromEntries(Object.entries(values).map(([id,value])=>[id,{id,value,min:id==='price' && mode!=='owned'?'.01':'0',required:['price','equity'].includes(id)?mode!=='owned':false,setCustomValidity(message){this.invalid=message;},reportValidity(){return !this.invalid && (!this.required || this.value!=='') && (this.value==='' || Number(this.value)>=Number(this.min));},focus(){},closest(){return null;}}]));
 const context={window:{__MANUAL_ANALYSIS__:true},document:{getElementById:id=>elements[id]},t:it=>it,Number,Math,calculateROI,investmentAnalysisState:{capture:()=>''}};
 const source=read('js/app.js');const helpers=source.slice(source.indexOf('function getValue(id)'),source.indexOf('window.__LAST_CALCULATION__'));
 const start=source.indexOf('    const isTool = !!document.getElementById("price");');const end=source.indexOf('\n});',source.indexOf('const result = calculateROI({',start))+4;
 vm.runInNewContext(helpers+'\nfunction run(){'+source.slice(start,end)+'\nreturn result;}\nthis.run=run;',context);
 return {context,elements,run:()=>context.run()};
}
test('actual simulator input path accepts owned zero/blank inputs and startup costs above property value',()=>{
 for(const extra of [{},{price:'',equity:''},{equity:'20000'}]){
  const h=form('owned',extra);const r=h.run();assert.ok(r);assert.equal(r.price,0);assert.equal(r.loan,0);assert.equal(r.equity,Number(extra.equity||0));
 }
 const r=form('owned',{price:'250000'}).run();assert.equal(r.loan,0);
 assert.equal(form('purchase').run(),undefined);
 assert.equal(form('purchase',{price:'150000',equity:'200000'}).run(),undefined);
 assert.equal(form('purchase',{price:'150000',equity:'30000','owned-loan-amount':'-1'}).run().loan,120000);
});
test('actual simulator path uses explicit residual principal and rejects negative owned inputs',()=>{
 assert.equal(form('owned',{'owned-loan-amount':'50000'}).run().loan,50000);
 for(const extra of [{price:'-1'},{equity:'-1'},{'owned-loan-amount':'-1'}])assert.equal(form('owned',extra).run(),undefined);
});
test('Free and Investor owned previews show unavailable percentages without treating it as full financing',()=>{
 for(const access of [{isFree:true},{isInvestor:true}])for(const lang of ['it','en']){
  const ids=['roi-live','roi-preview-live','roi-card-live','profit-live','cashflow-month-preview','roi-badge','roi-verdict'];const elements=Object.fromEntries(ids.map(id=>[id,{textContent:'',className:''}]));
  renderFreeSimulationPreview(calculateROI(base),{access,lang,document:{getElementById:id=>elements[id]}});
  for(const id of ['roi-live','roi-preview-live','roi-card-live'])assert.equal(elements[id].textContent,'N/A');
  assert.doesNotMatch(elements['roi-verdict'].textContent,/100%/);
  if(access.isFree)assert.match(elements['profit-live'].textContent,/9[.,]410/);
 }
});
test('mode switching preserves purchase draft, clears inherited financing and changes validation',()=>{
 const h=form('purchase',{price:'150000',equity:'30000'});const listeners={};
 for(const el of Object.values(h.elements)){el.dataset={};el.addEventListener=(event,fn)=>{el[event]=fn;};}
 for(const id of ['property-price-label','property-equity-label','owned-property-help','owned-loan-group','purchase-equity-help','purchase-loan-help','mortgage-transfer-summary'])h.elements[id]={dataset:{},hidden:false};
 const document={getElementById:id=>h.elements[id],addEventListener:(e,f)=>listeners[e]=f,dispatchEvent(){}};
 const window={currentLang:'it',rbImportedMortgage:{linkedPrincipal:true},RBInvestmentJourney:{clear(){}}};
 initPropertyMode(window,document);window.rbSetPropertyMode('owned');
 assert.equal(h.elements.price.value,'0');assert.equal(h.elements.price.required,false);assert.equal(window.rbImportedMortgage,null);assert.equal(h.elements['owned-loan-group'].hidden,false);
 h.elements.equity.value='15000';window.rbSetPropertyMode('purchase');assert.equal(h.elements.price.value,'150000');assert.equal(h.elements.equity.value,'30000');assert.equal(h.elements.price.required,true);
 window.rbSetPropertyMode('owned');assert.equal(h.elements.equity.value,'15000');window.currentLang='en';listeners.rb_language_changed();assert.match(h.elements['property-equity-label'].textContent,/startup/);
});
test('changing property mode or remaining principal makes completed analysis stale',()=>{
 const h=form('owned');h.elements['analyze-btn']={};const window={simulationExecuted:true,getUserAccess:()=>({isInvestor:true})};const document={getElementById:id=>h.elements[id],addEventListener(){}};
 const state=createInvestmentAnalysisState(window,document);state.publish(calculateROI(base),{equity:0},state.capture());assert.equal(state.getState().status,'current');assert.equal(state.getState().metrics.roiAvailable,false);
 h.elements['property-mode'].value='purchase';assert.equal(state.getState().status,'stale');h.elements['property-mode'].value='owned';h.elements['owned-loan-amount'].value='40000';assert.equal(state.getState().status,'stale');
});
test('dashboard normalizes owned zero-value analysis and recovers the saved loan from assumptions',()=>{
 const result=calculateROI({...base,loanAmount:40000});const assumptions=buildInvestmentAssumptions(result,base,'owned_property');
 const raw={propertyPrice:0,equity:0,roi:0,net:result.netAfterMortgage,assumptions};
 const source=read('js/dashboard.js');const start=source.indexOf('const analyses = querySnapshot.docs.map');const end=source.indexOf('\n});',start)+4;
 const c={readInvestmentAssumptions,querySnapshot:{docs:[{id:'owned',data:()=>raw}]},financialNumber,dashboardDebug(){},Date,Number,Math};
 const rows=vm.runInNewContext(source.slice(start,end)+'\nanalyses',c);assert.equal(rows[0].propertyMode,'owned');assert.equal(rows[0].loan,40000);assert.equal(rows[0].roi,null);assert.equal(rows[0].price,0);
});
test('Autopilot no longer requires a purchase price or caps startup capital for an owned home',()=>{
 const h=form('owned',{equity:'15000',expenses:'300'});h.elements['analyze-btn']={};const window={};
 vm.runInNewContext(read('js/chatbot/core/investment-autopilot-engine.js'),{window,document:{getElementById:id=>h.elements[id]},Intl,Date});
 const answer=window.rbBuildInvestmentAutopilotResponse('Autopilot investimento: controlla i dati');
 assert.doesNotMatch(answer.textIT,/prezzo immobile maggiore|capitale supera/);
});

test('owned zero-value property with cashflow is complete in portfolio and the selected scenario renders safely',()=>{
 const source=read('js/dashboard.js');const el={innerHTML:''};
 const c={financialNumber,document:{getElementById:()=>el},window:{currentLang:'it'},t:it=>it,escapeDashboardHTML:String,Intl,isPro:()=>true,isInvestor:()=>true,
  scenarioContext:()=>'',formatCurrency:v=>String(v),formatPercent:v=>v==null?'N/A':v+'%',summarizeInvestments:()=>({coverage:{}})};
 const manager=source.slice(source.indexOf('function renderPortfolioManager('),source.indexOf('// ================= STATS ================='));
 const best=source.slice(source.indexOf('function renderBestInvestment('),source.indexOf('// ================= REAL PORTFOLIO MANAGER'));
 vm.runInNewContext(manager+best,c);const row={propertyMode:'owned',price:0,equity:0,roi:null,net:9410.875,city:'Roma'};
 c.renderPortfolioManager([row]);assert.match(el.innerHTML,/Dati completi/);assert.match(el.innerHTML,/Non indicato/);assert.doesNotMatch(el.innerHTML,/Dati da completare/);
 c.renderBestInvestment([row]);assert.match(el.innerHTML,/Capitale di avvio/);assert.match(el.innerHTML,/Non indicato/);
});
