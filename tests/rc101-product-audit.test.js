import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
function assistant(){
  const window={rbBuildPMSAutopilotResponse:()=>{throw Error('Limits must precede PMS');},rbGenerateResponse:()=>{throw Error('Limits must precede documents');},rbDocumentManager:{getLast:()=>({id:'active'})}};
  vm.runInNewContext(read('js/chatbot/core/chatbot-orchestrator.js'),{window,console});
  return window;
}
test('guarantee and external-action questions get explicit limits even with a loaded PDF',async()=>{
  for(const q of ['Il roy che vedo è garantito? Hai già inviato le schedine ad Alloggiati Web e sincronizzato Airbnb?','Is ROI guaranteed? Have you already synced Airbnb?','Hai inviato la comunicazione ISTAT?','Does the service automatically connect Booking.com?']){
    const result=await assistant().rbProcessAIMessage(q);
    assert.equal(result.response.type,'product_limits',q);
    assert.match(result.response.textIT,/non sono rendimenti garantiti/);
    assert.match(result.response.textIT,/non invia automaticamente/);
    assert.match(result.response.textEN,/not guaranteed returns/);
    assert.match(result.response.textEN,/does not automatically sync/);
    assert.equal(result.response.actions.length,0);
  }
});
test('ordinary OTA education, guest names and daily tasks keep their existing routes',()=>{
  const w=assistant();
  for(const q of ['Cosa sono Airbnb e Booking.com?','Quali attività devo fare oggi?','Roy arriva domani, cosa manca?','Come si calcola il ROI?'])assert.equal(w.rbBuildProductLimitsResponse(q),null,q);
});
const app=read('js/app.js');
const start=app.indexOf('function renderInvestmentVerdict(');
const verdict=app.slice(start,app.indexOf('// ================= SMART PAYWALL',start));
test('purchase verdicts are model assessments without market comparisons or buying commands',()=>{
  for(const lang of ['it','en'])for(const assessment of ['BUY','WAIT','AVOID']){
    const element={};
    const c={window:{lastAnalysisData:{equity:30000,roiAvailable:true}},document:{getElementById:()=>element},t:(it,en)=>lang==='en'?en:it};
    vm.runInNewContext(verdict,c);c.renderInvestmentVerdict(23.5,25,7053.58,70,assessment);
    assert.doesNotMatch(element.innerHTML,/ACQUISTA|Acquisto consigliato|>BUY|significantly above market average|best market opportunities/);
    assert.match(element.innerHTML,lang==='en'?/internal model threshold/:/soglia interna del modello/);
    assert.match(element.innerHTML,lang==='en'?/probability of loss/:/probabilità di perdita/);
  }
});
const api=read('api/send-lead.js');
const guard=api.slice(api.indexOf('async function authenticateRegistration('),api.indexOf('function escapeHTML('));
test('registration emails require an unrevoked token for the same account address',async()=>{
  const verified=[];
  const c={admin:{auth:()=>({verifyIdToken:async(token,check)=>{verified.push([token,check]);if(token==='revoked')throw Error('revoked');return {uid:'u1',email:'Owner@Example.com'};}})}};
  vm.runInNewContext(guard,c);
  assert.equal(await c.authenticateRegistration({headers:{}},'owner@example.com'),false);
  assert.equal(await c.authenticateRegistration({headers:{authorization:'Bearer revoked'}},'owner@example.com'),false);
  assert.equal(await c.authenticateRegistration({headers:{authorization:'Bearer valid'}},'other@example.com'),false);
  assert.equal(await c.authenticateRegistration({headers:{authorization:'Bearer valid'}},'owner@example.com'),true);
  assert.equal(verified.length,3);assert.ok(verified.every(([,check])=>check===true));
});
test('unauthenticated account-confirmation requests cannot access the database or send mail',async()=>{
  const source=api.replace(/^import .*;\s*$/gm,'').replace('export default async function handler','async function handler');
  const c={admin:{apps:[{}],firestore:()=>({collection(){throw Error('Unexpected database access');}})},Resend:class{},process:{env:{}},Buffer,console};
  vm.runInNewContext(source,c);
  const res={setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
  await c.handler({method:'POST',headers:{},body:{email:'owner@example.com',type:'auth'}},res);
  assert.equal(res.code,401);assert.equal(res.body.error,'authentication_required');
});
