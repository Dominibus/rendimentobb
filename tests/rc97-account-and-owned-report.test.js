import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {firebaseConfig} from '../js/firebase-config.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
async function action(query,{operation='VERIFY_EMAIL',reject=false}={}){
 const elements=Object.fromEntries(['action-title','action-message','action-next','action-note','status-icon'].map(id=>[id,{hidden:true,textContent:''}]));
 const calls=[],redirects=[],history=[];
 const c={firebaseConfig,URL,URLSearchParams,location:{search:query,pathname:'/account-action/',replace:url=>redirects.push(url)},history:{replaceState:(_,__,url)=>history.push(url)},document:{documentElement:{},getElementById:id=>elements[id]},initializeApp:(config)=>{assert.equal(config,firebaseConfig);return {};},getAuth:()=>({}),ActionCodeOperation:{VERIFY_EMAIL:'VERIFY_EMAIL'},checkActionCode:async(_,code)=>{calls.push(['check',code]);assert.ok(!history.at(-1).includes('oobCode'));if(reject)throw Error('expired');return {operation};},applyActionCode:async(_,code)=>calls.push(['apply',code]),fetch:()=>{throw Error('verification must not activate subscription');}};
 const source=read('js/account-action.js').replace(/^import .*\n/gm,'').replace(/run\(\);\s*$/,'this.done=run();');
 vm.runInNewContext(source,c);await c.done;return {elements,calls,redirects,history};
}
test('verification validates action type then applies Firebase code; never starts a trial',async()=>{
 for(const lang of ['it','en']){
  const r=await action('?mode=verifyEmail&oobCode=one-use&lang='+lang);
  assert.deepEqual(r.calls,[['check','one-use'],['apply','one-use']]);assert.equal(r.elements['status-icon'].textContent,'✓');assert.equal(r.elements['action-next'].href,'/?investor_trial=1');
  assert.match(r.elements['action-note'].textContent,lang==='en'?/does not activate/:/non attiva la prova/);
 }
});
test('expired and wrong-operation codes fail without applying changes or showing success',async()=>{
 for(const opts of [{reject:true},{operation:'RECOVER_EMAIL'}]){
  const r=await action('?mode=verifyEmail&oobCode=bad',opts);assert.equal(r.calls.filter(x=>x[0]==='apply').length,0);assert.equal(r.elements['status-icon'].textContent,'!');
 }
});
test('password/recovery redirect stays on the fixed Firebase host and ignores injected API key and continue URL',async()=>{
 for(const mode of ['resetPassword','recoverEmail','verifyAndChangeEmail','revertSecondFactorAddition']){
  const r=await action('?mode='+mode+'&oobCode=code&lang=en&apiKey=attacker&continueUrl=https://evil.invalid');
  assert.equal(r.calls.length,0);const url=new URL(r.redirects[0]);assert.equal(url.origin,'https://rendimento-bb.firebaseapp.com');assert.equal(url.searchParams.get('apiKey'),firebaseConfig.apiKey);assert.equal(url.searchParams.has('continueUrl'),false);
 }
 assert.equal((await action('?mode=unknown&oobCode=code')).redirects.length,0);
});
test('account page hardening blocks third-party scripts, framing, caching and referrer leakage',()=>{
 const rule=JSON.parse(read('vercel.json')).headers.find(x=>x.source==='/account-action/:path*');const h=Object.fromEntries(rule.headers.map(x=>[x.key,x.value]));
 assert.equal(h['Cache-Control'],'no-store');assert.equal(h['Referrer-Policy'],'strict-origin');assert.match(h['Content-Security-Policy'],/frame-ancestors 'none'/);assert.match(h['Content-Security-Policy'],/object-src 'none'/);assert.doesNotMatch(read('js/account-action.js'),/AIza/);
});
const app=read('js/app.js');
function fn(start,end){return app.slice(app.indexOf(start),app.indexOf(end,app.indexOf(start)));}
const score=fn('function renderInvestmentScore(','// ================= INVESTMENT RANKING');
const risk=fn('function renderRiskMeter(','// ================= INVESTMENT VERDICT');
// Use only the complete function; the next section marker may differ across releases.
const verdictEnd=app.indexOf('\nfunction ',app.indexOf('function renderInvestmentVerdict(')+20);
const verdictCode=app.slice(app.indexOf('function renderInvestmentVerdict('),verdictEnd);
test('owned executive grade follows score and management wording follows the assessment in both languages',()=>{
 for(const lang of ['it','en'])for(const [value,grade] of [[78,'A'],[55,'B'],[10,'C']]){
  const els={'investment-score':{},'ai-circle':{style:{}}};
  const c={window:{lastAnalysisData:{propertyMode:'owned',equity:0,net:1000},rbGenerateInvestmentScore:()=>({score:value})},document:{getElementById:id=>els[id]},t:(it,en)=>lang==='en'?en:it};
  vm.runInNewContext(score,c);c.renderInvestmentScore(0,15);assert.match(els['investment-score'].innerHTML,new RegExp('>\\s*'+grade+'\\s*<'));assert.doesNotMatch(els['investment-score'].innerHTML,/Acquisto|Buy recommended/);
 }
});
test('owned zero-capital verdict never describes N/A as inferior ROI or recommends buying',()=>{
 for(const lang of ['it','en']){
  const els={'investment-verdict':{},'investment-risk-meter':{}};
  const c={window:{lastAnalysisData:{propertyMode:'owned',equity:0,roiAvailable:false}},document:{getElementById:id=>els[id]},t:(it,en)=>lang==='en'?en:it};
  vm.runInNewContext(risk+verdictCode,c);c.renderRiskMeter(15);c.renderInvestmentVerdict(0,15,1000,70,'BUY');
  assert.doesNotMatch(els['investment-verdict'].innerHTML,/ACQUISTA|>BUY|ROI inferiore|ROI below/);assert.match(els['investment-verdict'].innerHTML,/GESTIONE|MANAGEMENT/);assert.match(els['investment-risk-meter'].innerHTML,lang==='en'?/Unavailable ROI is excluded/:/ROI non applicabile è escluso/);
 }
});
test('main ROI donut disappears for unavailable ROI and can render the next valid scenario',()=>{
 const start=app.indexOf('function renderROIChart('),end=app.indexOf('\nfunction ',start+20);const code=app.slice(start,end);
 const frame={style:{}},canvas={closest:()=>frame,getContext:()=>({})};let created=0,destroyed=0;
 const c={window:{},document:{getElementById:()=>canvas},Chart:class{constructor(){created++;}destroy(){destroyed++;}},appDebugWarn(){}};
 vm.runInNewContext(code,c);c.renderROIChart(10,true);assert.equal(created,1);c.renderROIChart(0,false);assert.equal(frame.style.display,'none');assert.equal(destroyed,1);c.renderROIChart(8,true);assert.equal(created,2);assert.equal(frame.hidden,false);
});
