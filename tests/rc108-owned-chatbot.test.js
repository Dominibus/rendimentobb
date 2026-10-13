import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
function setup(){const c=vm.createContext({window:{lastInvestmentScore:{score:78,verdict:'BUY'}}});vm.runInContext(read('js/chatbot/core/executive-response-builder.js'),c);return c;}
function answer(data,intent='investment_executive'){return setup().window.rbBuildExecutiveResponse({executiveContext:{liveData:data},advisor:{verdict:'BUY'},executiveBrain:{summaryIT:'OLD GUARANTEE',summaryEN:'OLD GUARANTEE'},intent:{intent},message:'Analizza questo investimento'});}
test('owned executive and convenience assessment never advise buying or guarantee outcomes',()=>{
 for(const intent of ['investment_executive','executive_analysis','investment_strategy']){
 const a=answer({propertyMode:'owned',equity:0,roi:0,net:19099.2375,risk:15,investmentScore:78},intent);
 assert.match(a.textIT,/19.099,24/);assert.match(a.textIT,/ROI sul capitale di avvio: N\/A/);assert.match(a.textIT,/parziale/);assert.match(a.textEN,/partial/);
 assert.doesNotMatch(a.textIT,/BUY|VERDETTO AI|OLD GUARANTEE|garantisce|dimostra che/);assert.doesNotMatch(a.textEN,/BUY|OLD GUARANTEE/);
 }
});
test('owned positive startup capital, negative cashflow, zero and missing data retain their meaning',()=>{
 const data={assumptions:{source:'owned_property'},equity:10000,roi:-10,net:-1000,risk:70};const a=answer(data);assert.match(a.textIT,/Cashflow negativo/);assert.match(a.textIT,/capitale di avvio: -10%/);
 assert.match(answer({...data,net:0}).textIT,/Cashflow nullo/);
 const missing=answer({propertyMode:'owned'});assert.match(missing.textIT,/Dati insufficienti/);assert.match(missing.textIT,/stimato: Non disponibile/);assert.doesNotMatch(missing.textIT,/Cashflow positivo/);
});
test('purchase header uses an assessment under assumptions and unrecognized decisions stay unavailable',()=>{
 const c=setup();assert.match(c.rbExecutiveVerdictLabel('BUY','it'),/nelle ipotesi/);assert.match(c.rbExecutiveVerdictLabel('BUY','en'),/under assumptions/);assert.equal(c.rbExecutiveVerdictLabel('unknown','en'),'Assessment unavailable');
 const brain=read('js/chatbot/core/executive-brain-v2.js');assert.doesNotMatch(brain,/cashflow positivo garantisce|cashflow positivo dimostra/);
});
