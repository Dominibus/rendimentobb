import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
function setup({tool=true,executed=false}={}){
 const visited=[],focused=[],scrolled=[];const elements={};
 for(const id of ['price','equity','priceNight','expenses','occupancy','analyze-btn','rb-simulation-summary','rb-investment-status'])elements[id]={id,value:'100',textContent:'',scrollIntoView(){scrolled.push(id);},focus(){focused.push(id);},matches(){return ['price','equity','priceNight','expenses','occupancy','analyze-btn'].includes(id);},setAttribute(){},click(){throw Error('Shortcut must not execute calculations');}};
 const document={getElementById:id=>!tool&&id!=='rb-investment-status'?null:elements[id],querySelectorAll:()=>[]};
 const window={currentLang:'it',simulationExecuted:executed,matchMedia:()=>({matches:true}),location:{assign:path=>visited.push(path)}};
 vm.runInNewContext(read('js/investment-workspace.js'),{window,document});
 vm.runInNewContext(read('js/chatbot/core/investment-autopilot-engine.js'),{window,document});
 return {window,elements,visited,focused,scrolled};
}
test('Home shortcuts navigate only to fixed simulator and dashboard destinations',()=>{
 const s=setup({tool:false});const r=s.window.rbBuildInvestmentAutopilotResponse(s.window.rbInvestmentAutopilotQuestions.guide[0]);
 for(const action of r.actions)assert.equal(s.window.rbOpenInvestmentAction(action),true);
 assert.deepEqual(s.visited,['/tool/','/dashboard/']);
 assert.equal(s.window.rbOpenInvestmentAction({type:'open_investment_section',target:'https://untrusted.example'}),false);
});
test('input review focuses the first reported field without changing form values',()=>{
 const s=setup();s.elements.price.value='';s.elements.equity.value='-1';
 const r=s.window.rbBuildInvestmentAutopilotResponse(s.window.rbInvestmentAutopilotQuestions.inputs[0]);
 assert.equal(r.actions[0].field,'price');assert.equal(s.window.rbOpenInvestmentAction(r.actions[0]),true);assert.deepEqual(s.focused,['price']);assert.equal(s.elements.price.value,'');assert.equal(s.elements.equity.value,'-1');
});
test('analysis shortcut focuses the existing calculation button without clicking it',()=>{
 const s=setup();assert.equal(s.window.rbOpenInvestmentAction({type:'open_investment_section',target:'analysis'}),true);assert.deepEqual(s.focused,['analyze-btn']);assert.match(s.elements['rb-investment-status'].textContent,/Premi/);
});
test('results shortcut is absent before execution and guarded again at click time',()=>{
 const s=setup();const q=s.window.rbInvestmentAutopilotQuestions.next[0];
 assert.equal(s.window.rbBuildInvestmentAutopilotResponse(q).actions.some(a=>a.target==='results'),false);
 assert.equal(s.window.rbOpenInvestmentAction({type:'open_investment_section',target:'results'}),false);assert.deepEqual(s.focused,[]);
 s.window.simulationExecuted=true;s.window.rbGetInvestmentAnalysisState=()=>({status:'current',tier:'free',calculatedAt:Date.now(),metrics:{roi:0,roiBasis:'property',annualCashflow:0,monthlyCashflow:0}});const a=s.window.rbBuildInvestmentAutopilotResponse(q).actions.find(a=>a.target==='results');assert.ok(a);assert.equal(s.window.rbOpenInvestmentAction(a),true);assert.deepEqual(s.focused,['rb-simulation-summary']);
});
test('arbitrary field identifiers cannot focus unrelated portal controls',()=>{
 const s=setup();s.window.rbOpenInvestmentAction({type:'open_investment_section',target:'inputs',field:'delete-account'});assert.deepEqual(s.focused,['price']);
});
test('chat renders and dispatches investment actions, then closes after successful navigation',async()=>{
 const source=read('js/chatbot/ui/chatbot-ui.js');const a=source.indexOf('  function addResponseActions(');const b=source.indexOf('  async function sendMessage()',a);const nodes=[];let closed=0;let received;
 const document={createElement:()=>({children:[],appendChild(child){this.children.push(child);nodes.push(child);}})};
 const messages={appendChild(){},scrollHeight:0};
 vm.runInNewContext(source.slice(a,b)+'\naddResponseActions([{type:"open_investment_section",target:"inputs",labelIT:"Rivedi i dati",labelEN:"Review inputs"}],"it");',{document,messages,window:{rbOpenInvestmentAction:action=>{received=action;return true;}},windowEl:{classList:{remove(){closed++;}}},reportRuntimeError(){},addMessage(){},t:(it)=>it});
 const button=nodes.find(n=>n.textContent==='Rivedi i dati');assert.ok(button);await button.onclick();assert.equal(received.target,'inputs');assert.equal(closed,1);assert.equal(button.disabled,false);
});
test('blocked result shortcuts explain stale, pending and missing state in both languages',async()=>{
 const source=read('js/chatbot/ui/chatbot-ui.js');const a=source.indexOf('  function addResponseActions(');const b=source.indexOf('  async function sendMessage()',a);
 for(const state of ['stale','pending','missing'])for(const lang of ['it','en']){
  const nodes=[],replies=[];let closed=0;
  const document={createElement:()=>({children:[],appendChild(child){this.children.push(child);nodes.push(child);}})};
  vm.runInNewContext(source.slice(a,b)+'\naddResponseActions([{type:"open_investment_section",target:"results",labelIT:"Vai ai risultati",labelEN:"Go to results"}],"'+lang+'");',{
   document,messages:{appendChild(){},scrollHeight:0},window:{rbOpenInvestmentAction:()=>false,rbGetInvestmentAnalysisState:()=>({status:state})},
   windowEl:{classList:{remove(){closed++;}}},reportRuntimeError(){throw Error('Unexpected runtime failure');},addMessage:(role,message)=>replies.push(message),t:(it,en)=>lang==='en'?en:it
  });
  const button=nodes.find(n=>n.type==='button');await button.onclick();assert.equal(closed,0);assert.equal(button.disabled,false);assert.equal(replies.length,1);
  assert.doesNotMatch(replies[0],/Apri il simulatore|Open the simulator/);
  assert.match(replies[0],state==='pending'?/caricando|loading/:/Analizza investimento|Analyze investment/);
 }
});
