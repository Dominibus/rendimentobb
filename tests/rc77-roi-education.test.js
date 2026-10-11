import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source = file => readFileSync(new URL('../js/chatbot/core/' + file, import.meta.url), 'utf8');
function setup(){
  const window = {};
  const c = {window, console, Intl, Date};
  vm.createContext(c);
  for(const file of ['query-normalizer.js','chatbot-orchestrator.js']) vm.runInContext(source(file), c);
  return window;
}
test('ROI meaning and zero equity questions are answered without a simulation', async()=>{
  const w = setup();
  for(const query of ['Che cosa significa roy e come lo valuto se il capitale proprio è zero?', 'What is ROI with zero equity?', 'Il mio ROI con capitale proprio 0?', 'Come valuto il ROI senza capitale proprio?', 'Definizione ROI']){
    const result = await w.rbProcessAIMessage(query);
    assert.equal(result.response.type, 'education', query);
    assert.match(result.response.textIT, /N\/A, non 0%/);
    assert.match(result.response.textEN, /does not assess your investment/);
    assert.doesNotMatch(result.response.textIT, /dati parziali/);
  }
});
test('explicit PDF and focused PDF follow-ups retain document priority', async()=>{
  const w = setup();
  w.rbDocumentManager = {getLast:()=>({id:'current'})};
  w.rbPDFConversationDocumentId = 'current';
  w.rbGenerateResponse = ()=>({type:'document_grounded',textIT:'Dati del PDF corrente'});
  for(const query of ['Che cosa significa ROI nel PDF con equity zero?', 'Il ROI con equity zero?']){
    const result = await w.rbProcessAIMessage(query);
    assert.equal(result.response.type, 'document_grounded');
  }
});
test('guest names are not corrected into financial meanings', async()=>{
  const w = setup();
  w.rbBuildPortalResponse = ()=>({type:'portal_grounded'});
  const result = await w.rbProcessAIMessage('Ospite Roy: che cosa significa il suo nome?');
  assert.equal(result.response.type, 'portal_grounded');
});
