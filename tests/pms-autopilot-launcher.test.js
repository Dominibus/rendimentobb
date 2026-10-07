import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../js/chatbot/ui/chatbot-ui.js',import.meta.url),'utf8');
const launcher=source.slice(source.indexOf('let autopilotRequestPending=false;'),source.indexOf('  sendBtn.onclick =',source.indexOf('let autopilotRequestPending=false;')));
function setup({draft='',english=false,send}={}){
  const sent=[],messages=[];
  const input={value:draft,focus(){this.focused=true;}};
  const window={rbInvestmentAutopilotQuestions:{guide:['Autopilot investimento: da dove inizio?','Investment Autopilot: where do I start?'],inputs:['Autopilot investimento: controlla i dati','Investment Autopilot: check inputs']}};
  vm.runInNewContext(launcher,{window,input,windowEl:{classList:{add(){}}},t:(it,en)=>english?en:it,addMessage:(_,text)=>messages.push(text),sendMessage:async()=>{sent.push(input.value);input.value='';if(send)await send();}});
  return {window,input,sent,messages};
}
test('booking launcher dispatches distinct daily, tomorrow and weekly questions',async()=>{
  const state=setup();
  for(const mode of ['daily','tomorrow','week'])await state.window.rbAskPMSAutopilot(mode);
  assert.deepEqual(state.sent,['Cosa devo fare oggi nel PMS?','Prepara gli arrivi di domani','Prossimi 7 giorni nel PMS']);
});
test('English tomorrow shortcut remains recognizable by the horizon engine',async()=>{
  const state=setup({english:true});
  await state.window.rbAskPMSAutopilot('tomorrow');
  const engineWindow={};
  vm.runInNewContext(readFileSync(new URL('../js/chatbot/core/pms-autopilot-engine.js',import.meta.url),'utf8'),{window:engineWindow});
  assert.match(state.sent[0],/tomorrow/i);
  assert.equal(engineWindow.rbIsPMSAutopilotQuestion(state.sent[0]),true);
});
test('period shortcuts preserve an unsent question and explain how to continue',async()=>{
  const state=setup({draft:'Domanda personale'});
  await state.window.rbAskPMSAutopilot('week');
  assert.equal(state.input.value,'Domanda personale');
  assert.equal(state.input.focused,true);
  assert.equal(state.sent.length,0);
  assert.equal(state.messages.length,1);
});
test('repeated clicks do not send a second request while the first is pending',async()=>{
  let resolve;
  const state=setup({send:()=>new Promise(r=>{resolve=r;})});
  const first=state.window.rbAskPMSAutopilot('tomorrow');
  await state.window.rbAskPMSAutopilot('week');
  assert.equal(state.sent.length,1);
  resolve();await first;
});

test('investment launcher preserves drafts and sends the English input-check question',async()=>{
 const draft=setup({draft:'Da inviare'});await draft.window.rbAskInvestmentAutopilot('inputs');assert.equal(draft.input.value,'Da inviare');assert.equal(draft.sent.length,0);
 const en=setup({english:true});await en.window.rbAskInvestmentAutopilot('inputs');assert.equal(en.sent[0],'Investment Autopilot: check inputs');
});
test('PMS and investment launchers share duplicate-request protection',async()=>{
 let resolve;const state=setup({send:()=>new Promise(r=>{resolve=r;})});const first=state.window.rbAskInvestmentAutopilot('inputs');await state.window.rbAskPMSAutopilot('week');assert.equal(state.sent.length,1);resolve();await first;
});
