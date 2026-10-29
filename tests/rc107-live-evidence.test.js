import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ui=read('js/chatbot/ui/chatbot-ui.js');
const formatter=ui.slice(ui.indexOf('function rbFormatPropertySnapshotROI('),ui.indexOf('window.initRBChatbotUI'));
const context=vm.createContext({window:{}});vm.runInContext(formatter,context);
test('snapshot preserves unavailable property ROI and real zero/negative ROI',()=>{
 const f=context.rbFormatPropertySnapshotROI;
 assert.equal(f(0,{propertyMode:'owned',propertyPrice:0}),'N/A');
 assert.equal(f(0,{propertyROIAvailable:false}),'N/A');
 assert.equal(f(0,{propertyMode:'owned',propertyPrice:150000}),'0.0%');
 assert.equal(f(-2.35,{propertyPrice:150000}),'-2.4%');
 assert.equal(f(null,{}),'--');assert.equal(f('',{}),'--');assert.equal(f(Infinity,{}),'--');
 assert.equal(f(5.27,{propertyROIAvailable:true}),'5.3%');
});
test('web hero marks risk partial when ROI denominator is absent in both languages',()=>{
 const src=read('dashboard-report/index.html');
 const helpers=src.slice(src.indexOf('function reportNumber('),src.indexOf('const canonicalInvestmentScore'));
 const c={};vm.createContext(c);vm.runInContext(helpers,c);
 for(const [lang,expected] of [['it','PARZIALE'],['en','PARTIAL']]){
  const state=c.readReportFinancialState({price:150000,equity:0,roi:0,net:100,risk:15,investmentScore:78});
  assert.equal(c.reportFinancialLabels(state,lang).riskLabel,expected);
 }

});
test('purchase verdict is a scenario assessment rather than purchase advice',()=>{
 const src=read('tool/index.html');assert.doesNotMatch(src,/Acquisto consigliato|Buy recommended/);
 assert.match(src,/Scenario favorevole nelle ipotesi/);assert.match(src,/Favorable scenario under assumptions/);
});
