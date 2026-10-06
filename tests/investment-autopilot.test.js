import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../js/chatbot/core/investment-autopilot-engine.js',import.meta.url),'utf8');
function setup(values,tool=true){
 const window={};const document={getElementById(id){if(id==='analyze-btn')return tool?{}:null;if(!tool)return null;return Object.hasOwn(values,id)?{value:values[id]}:null;}};
 vm.runInNewContext(source,{window,document});
 return window;
}
const valid={price:'150000',equity:'30000',priceNight:'120',expenses:'900',occupancy:'65'};
test('home provides navigation without inventing a current financial analysis',()=>{
 const w=setup({},false);w.lastAnalysisData={roi:123456};
 const r=w.rbBuildInvestmentAutopilotResponse(w.rbInvestmentAutopilotQuestions.guide[0]);
 assert.match(r.textIT,/Apri il simulatore/);assert.doesNotMatch(r.textIT,/123456/);
});
test('unrelated financial, PMS and PDF requests retain their original routing',()=>{
 const w=setup(valid);
 for(const q of ['ROI','Cosa devo fare oggi nel PMS?','Analizza il PDF','Autopilot investimento: controlla i dati nel PDF'])assert.equal(w.rbBuildInvestmentAutopilotResponse(q),null);
});
test('blank, invalid and zero fields receive specific checks without changing inputs',()=>{
 const data={price:'',equity:'-1',priceNight:'abc',expenses:'0',occupancy:'101'};const before=JSON.stringify(data);const w=setup(data);
 const r=w.rbBuildInvestmentAutopilotResponse(w.rbInvestmentAutopilotQuestions.inputs[0]);
 assert.match(r.textIT,/prezzo immobile maggiore/);assert.match(r.textIT,/capitale proprio/);assert.match(r.textIT,/tariffa notte/);assert.match(r.textIT,/Costi mensili a zero/);assert.match(r.textIT,/tra 0 e 100/);assert.equal(JSON.stringify(data),before);
});
test('equity above purchase price prompts review rather than silently changing the model',()=>{
 const w=setup({...valid,equity:'200000'});
 assert.match(w.rbBuildInvestmentAutopilotResponse(w.rbInvestmentAutopilotQuestions.inputs[0]).textIT,/capitale supera/);
});
test('valid input checks do not certify profitability or reveal plan-restricted results',()=>{
 const w=setup(valid);w.lastAnalysisData={roi:99999,net:77777};
 const r=w.rbBuildInvestmentAutopilotResponse(w.rbInvestmentAutopilotQuestions.inputs[0]);
 assert.match(r.textIT,/non convalida/);assert.match(r.textIT,/nuovamente/);assert.doesNotMatch(r.textIT,/99999|77777/);
});
test('each Italian and English shortcut resolves to the investment guide',()=>{
 const w=setup(valid);
 for(const pair of Object.values(w.rbInvestmentAutopilotQuestions))for(const q of pair){const r=w.rbBuildInvestmentAutopilotResponse(q);assert.equal(r.type,'investment_autopilot');assert.ok(r.textIT&&r.textEN);}
});
test('assumption guidance distinguishes benchmark estimates and explicit reruns',()=>{
 const w=setup(valid);const r=w.rbBuildInvestmentAutopilotResponse(w.rbInvestmentAutopilotQuestions.assumptions[1]);
 assert.match(r.textEN,/indicative/);assert.match(r.textEN,/separate simulation/);assert.match(r.textEN,/Avoid counting costs twice/);
});
test('home and tool retain calculation anchors and include cache-versioned workspace resources',()=>{
 for(const file of ['index.html','tool/index.html']){const html=readFileSync(new URL('../'+file,import.meta.url),'utf8');assert.equal((html.match(/class="rb-investment-hub"/g)||[]).length,1);assert.match(html,/investment-workspace.css\?v=20261006-rc41/);assert.match(html,/investment-workspace.js\?v=20261006-rc43/);assert.match(html,/chatbot-loader.js\?v=20261006-rc43/);assert.equal((html.match(/data-rb-investment-question=/g)||[]).length,3);}
 const html=readFileSync(new URL('../tool/index.html',import.meta.url),'utf8');for(const id of ['price','equity','priceNight','occupancy','expenses','analyze-btn','results'])assert.match(html,new RegExp('id="'+id+'"'));
});

test('PMS routing excludes every investment shortcut, including the Home start question',()=>{
 const w=setup(valid);vm.runInNewContext(readFileSync(new URL('../js/chatbot/core/pms-autopilot-engine.js',import.meta.url),'utf8'),{window:w});
 for(const pair of Object.values(w.rbInvestmentAutopilotQuestions))for(const q of pair)assert.equal(w.rbIsPMSAutopilotQuestion(q),false);
 assert.equal(w.rbIsPMSAutopilotQuestion('Da dove inizio nel PMS?'),true);
});
test('Home assumptions shortcut answers the assumptions question rather than repeating onboarding',()=>{
 const w=setup({},false);const r=w.rbBuildInvestmentAutopilotResponse(w.rbInvestmentAutopilotQuestions.assumptions[0]);assert.match(r.textIT,/benchmark di mercato/);assert.doesNotMatch(r.textIT,/Apri il simulatore/);
});
test('orchestrator handles the Home investment question before consulting PMS booking data',async()=>{
 const w=setup({},false);let pmsCalls=0;w.rbBuildPMSAutopilotResponse=async()=>{pmsCalls++;return {type:'incorrect_pms_response'};};
 vm.runInNewContext(readFileSync(new URL('../js/chatbot/core/chatbot-orchestrator.js',import.meta.url),'utf8'),{window:w});
 const r=await w.rbProcessAIMessage(w.rbInvestmentAutopilotQuestions.guide[0]);assert.equal(r.response.type,'investment_autopilot');assert.equal(pmsCalls,0);
});
test('ordinary PMS questions continue to use the PMS orchestrator route',async()=>{
 const w=setup({},false);w.rbBuildPMSAutopilotResponse=async()=>({type:'pms_autopilot_daily'});
 vm.runInNewContext(readFileSync(new URL('../js/chatbot/core/chatbot-orchestrator.js',import.meta.url),'utf8'),{window:w});
 const r=await w.rbProcessAIMessage('Cosa devo fare oggi nel PMS?');assert.equal(r.response.type,'pms_autopilot_daily');
});
