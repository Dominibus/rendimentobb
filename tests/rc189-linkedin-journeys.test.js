import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {installToolPresentation} from '../js/tool-presentation.js';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
function bot(access={isFree:true}){
 const window={currentLang:'it',location:{pathname:'/'},getUserAccess:()=>access,lastAnalysisData:{roi:999,cashflow:999,revpar:999}};
 const context=vm.createContext({window,console,Intl,Date});
 for(const path of ['js/chatbot/core/query-normalizer.js','js/chatbot/core/response-engine.js','js/chatbot/core/chatbot-orchestrator.js'])vm.runInContext(read(path),context);
 return window;
}
for(const question of ['non ho capito che vuol dire cashflou','Non ho capito il RevPAR','Che vuol dire cashflow?','Non mi è chiaro il DSCR','Non abbiamo capito la differenza tra ADR e RevPAR',"I don't understand cash flow","I didn’t understand RevPAR",'Non ho capito il ROI','Che vuol dire ROI?'])test('RC189: plain explanation without plan lock or cached values: '+question,async()=>{
 for(const access of [{isFree:true},{isInvestor:true},{isPro:true}]){
  const w=bot(access),result=await w.rbProcessAIMessage(question);
  assert.equal(result.response.type,'education');assert.ok(result.response.textIT.length>60);assert.ok(result.response.textEN.length>60);
  assert.doesNotMatch(result.response.textIT,/999|riservat[oa] ai piani/);assert.equal(result.response.actions.length,0);
 }
});
test('RC189: informal wording preserves personal, numeric and document routes',()=>{
 const w=bot();
 for(const question of ['Non ho capito il mio cashflow','Non ho capito il RevPAR nel PDF','Non ho capito il cashflow 500','I do not understand my ADR','Non mi è chiaro il DSCR nel documento'])assert.equal(w.rbBuildMetricEducationResponse(question),null,question);
 assert.equal(w.rbNormalizeAIQuery('Pisa 180.000,50 € e cashflou 1.200,40 €').text,'Pisa 180.000,50 € e cashflow 1.200,40 €');
 assert.equal(w.rbNormalizeAIQuery('Ospite Roy 123').text,'Ospite Roy 123');
});
function presentation(){
 const windowEvents=new Map(),documentEvents=new Map(),clicks=new Map(),moves=[];
 let state={status:'missing'},reduced=false;
 const target={setAttribute:(...args)=>moves.push(['attribute',...args]),focus:options=>moves.push(['focus',options]),scrollIntoView:options=>moves.push(['scroll',options])};
 const elements={'analyze-btn':{addEventListener:(event,fn)=>clicks.set(event,fn)},'rb-simulation-summary':target,'rb-result-next':{hidden:true}};
 const window={rbGetInvestmentAnalysisState:()=>state,getUserAccess:()=>({isFree:true}),matchMedia:()=>({matches:reduced}),addEventListener:(event,fn)=>windowEvents.set(event,fn)};
 const document={getElementById:id=>elements[id],addEventListener:(event,fn)=>documentEvents.set(event,fn)};
 installToolPresentation(window,document);
 return {moves,elements,click:()=>clicks.get('click')(),emit:(event='rb_investment_state_updated')=>windowEvents.get(event)?.(),setState:value=>state=value,setReduced:()=>reduced=true,language:()=>documentEvents.get('rb_language_changed')()};
}
test('RC189: result receives focus only when manual calculation publishes a new current snapshot',()=>{
 const h=presentation();h.setState({status:'current',calculatedAt:1});h.emit();assert.equal(h.moves.length,0);
 h.click();h.setState({status:'pending'});h.emit();assert.equal(h.moves.length,0);
 h.setState({status:'current',calculatedAt:2});h.emit();assert.equal(h.moves.filter(x=>x[0]==='scroll').length,1);assert.equal(h.moves.find(x=>x[0]==='scroll')[1].block,'start');
 h.emit();h.emit('rb_plan_ready');h.language();assert.equal(h.moves.filter(x=>x[0]==='scroll').length,1);
 h.click();h.emit();assert.equal(h.moves.filter(x=>x[0]==='scroll').length,1,'same snapshot after throttled click must not move focus');
});
test('RC189: failed/stale results do not steal focus; reduced motion is honoured on successful retry',()=>{
 const h=presentation();h.click();h.setState({status:'pending'});h.emit();h.setState({status:'missing'});h.emit();
 h.setState({status:'current',calculatedAt:2});h.emit();assert.equal(h.moves.length,0,'failure must clear the pending manual request');
 h.click();h.setState({status:'stale',calculatedAt:2});h.emit();assert.equal(h.moves.length,0);
 h.setReduced();h.click();h.setState({status:'pending'});h.emit();h.setState({status:'current',calculatedAt:3});h.emit();assert.equal(h.moves.find(x=>x[0]==='scroll')[1].behavior,'auto');
 assert.equal(h.moves.find(x=>x[0]==='focus')[1].preventScroll,true);
});
test('RC189: trial anchor has a local bilingual action without accepting or changing terms',()=>{
 const html=read('plans.html'),section=html.slice(html.indexOf('<section id="tester-programme"')).split('</section>')[0];
 assert.match(section,/href="\/login\/\?intent=investor-trial"/);assert.match(section,/Check eligibility and request the Investor trial/);assert.match(section,/La sola registrazione non attiva la prova/);assert.doesNotMatch(section,/onclick|checkout|stripe/);
 assert.match(read('tool/index.html'),/scroll-margin-top:100px/);
});
test('RC189: changed modules and loader entry points have matching cache versions',()=>{
 assert.match(read('js/header.js'),/chatbot-loader.js\?v=20261030-candidates/);
 assert.match(read('js/chatbot-loader.js'),/query-normalizer.js\?v=20261026-rc200/);assert.match(read('js/chatbot-loader.js'),/chatbot-orchestrator.js\?v=20261030-candidates/);
 assert.match(read('js/app.js'),/tool-presentation.js\?v=20261023-rc189/);
 for(const file of ['index.html','tool/index.html','dashboard/index.html','plans.html'])assert.match(read(file),/header.js\?v=20261029-rc221/);
 for(const file of ['index.html','tool/index.html'])assert.match(read(file),file==='tool/index.html'?/app.js\?v=20261030-candidates/:/app.js\?v=20261029-rc226/);
});
