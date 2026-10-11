import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {initPropertyMode} from '../js/property-mode.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('home owned link selects zero-capital mode without retaining purchase financing or running a calculation',()=>{
 const els=Object.fromEntries(['property-mode','price','equity','owned-loan-group','owned-property-help','purchase-equity-help','purchase-loan-help','mortgage-transfer-summary','property-price-label','property-equity-label'].map(id=>[id,{value:id==='property-mode'?'purchase':id==='price'?'150000':id==='equity'?'30000':'',dataset:{},style:{},addEventListener(){},setCustomValidity(){}}]));
 const window={location:{search:'?propertyMode=owned'},currentLang:'it',rbImportedMortgage:{data:{amount:120000}},RBInvestmentJourney:{clear(){}},calculateROI(){throw Error('Must not calculate from navigation');}};
 const document={getElementById:id=>els[id],addEventListener(){},dispatchEvent(){}};
 initPropertyMode(window,document);
 assert.equal(els['property-mode'].value,'owned');assert.equal(els.price.value,'0');assert.equal(els.equity.value,'0');assert.equal(els.price.required,false);assert.equal(window.rbImportedMortgage,null);
 els.equity.value='12000';window.rbSetPropertyMode('purchase');assert.equal(els.price.value,'150000');window.rbSetPropertyMode('owned');assert.equal(els.equity.value,'12000');
});
test('owned natural-language questions give usable startup instructions outside the simulator in both languages',()=>{
 const window={};vm.runInNewContext(read('js/chatbot/core/investment-autopilot-engine.js'),{window,document:{getElementById:()=>null}});
 for(const q of ['Ho già una casa, come analizzo il rendimento?','Possiedo un immobile e voglio capire i costi','I already own a home, how can I analyze it?']){
  const answer=window.rbBuildInvestmentAutopilotResponse(q);assert.ok(answer,q);assert.match(answer.textIT,/possono essere zero/);assert.match(answer.textEN,/may be zero/);
 }
});
test('owned paid analysis uses startup capital rather than acquisition equity in the assistant',()=>{
 const els={price:{value:'0'},'analyze-btn':{},'property-mode':{value:'owned'}};
 const window={rbGetInvestmentAnalysisState:()=>({status:'current',tier:'paid',calculatedAt:Date.now(),metrics:{propertyMode:'owned',roiBasis:'equity',equity:12000,roi:80,roiAvailable:true,annualCashflow:9600,monthlyCashflow:800,annualDebtService:0}})};
 vm.runInNewContext(read('js/chatbot/core/investment-autopilot-engine.js'),{window,document:{getElementById:id=>els[id]}});
 const answer=window.rbBuildInvestmentAutopilotResponse('Autopilot investimento: leggi la mia analisi');
 assert.match(answer.textIT,/ROI sul capitale di avvio: 80/);assert.match(answer.textEN,/Return on startup capital: 80/);assert.doesNotMatch(answer.textIT,/Capitale proprio usato/);
});
test('owned comparison shows unavailable ROI at zero capital and excludes purchase comparison even at positive capital',()=>{
 const app=read('js/app.js'),start=app.indexOf('function renderROIMarketComparison('),end=app.indexOf('// ================= REVENUE FORECAST',start);
 for(const equity of [0,12000])for(const lang of ['it','en']){
  const el={};const c={window:{lastAnalysisData:{propertyMode:'owned',equity},currentLang:lang,RB_MARKET_DATA:{roma:{roi:9.8}}},document:{getElementById:()=>el},t:(it,en)=>lang==='en'?en:it,Intl};
  vm.runInNewContext(app.slice(start,end),c);c.renderROIMarketComparison(80,'roma');
  assert.match(el.innerHTML,lang==='en'?/Return on startup capital/:/ROI sul capitale di avvio/);assert.match(el.innerHTML,lang==='en'?/excludes the house value/:/esclude il valore della casa/);
  if(equity===0)assert.match(el.innerHTML,/<strong>N\/A<\/strong>/);
 }
});
