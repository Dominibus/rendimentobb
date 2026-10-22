import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
function chat(){
  const window={currentLang:'it',lastAnalysisData:{net:3464.52,roi:99}};
  const c=vm.createContext({window,console,Intl,Date,document:{getElementById:()=>null}});
  for(const f of ['query-normalizer','semantic-router','entity-engine','intent-engine','chatbot-orchestrator'])vm.runInContext(read('js/chatbot/core/'+f+'.js'),c);
  // These routes must not turn a definition into cached financial/account data.
  for(const name of ['rbBuildPortalResponse','rbBuildPMSAutopilotResponse','rbBuildInvestmentAutopilotResponse'])window[name]=()=>{throw Error('Definition reached '+name);};
  return window;
}
for(const [q,terms] of [
  ['Che cosa sono i KPI?',['kpi']],
  ['KPI?',['kpi']],
  ['What are KPIs?',['kpi']],
  ['Cos’è il cashflow?',['cashflow']],
  ['Spiegami il cashflow',['cashflow']],
  ['Cosa significa cashfolw?',['cashflow']],
  ['What is cashfow and what are KPI? Explain simply, I am a beginner.',['kpi','cashflow']],
  ['Cosa sono ROI, ADR e RevPAR?',['roi','adr','revpar']],
  ['Come si calcola il RevPAR?',['revpar']],
  ['Explain DSCR and LTV',['dscr','ltv']],
  ['Che cos’è il NOI?',['noi']],
  ['What is NOI?',['noi']],
  ['Come si calcola il break-even?',['payback']]
])test('definition routes before cached values: '+q,async()=>{
  const w=chat(),before=JSON.stringify(w.lastAnalysisData),r=await w.rbProcessAIMessage(q);
  assert.equal(r.response.type,'education');
  assert.deepEqual(Array.from(r.response.metadata.terms),terms);
  assert.doesNotMatch(r.response.textIT+r.response.textEN,/3[.,]464|benchmark disponibile/);
  assert.equal(JSON.stringify(w.lastAnalysisData),before);
  assert.match(r.response.textIT,/non sono dati del tuo account/);
});
test('glossary does not swallow personal values, names, actions or numbers',()=>{
  const w=chat();
  for(const q of ['Quanto vale il mio cashflow?','What is my actual cashflow?','Come aggiungo una prenotazione?','Ospite Roy: che cosa significa il suo nome?','Spiegami questo cashflow di 1200 euro'])assert.equal(w.rbBuildMetricEducationResponse(q),null,q);
  assert.deepEqual(Array.from(w.rbBuildMetricEducationResponse('Che cosa sono i KPI per noi?').metadata.terms),['kpi']);
});
test('current PDF remains authoritative for focused definitions',async()=>{
  const w=chat();w.rbDocumentManager={getLast:()=>({id:'active'})};w.rbPDFConversationDocumentId='active';
  w.rbGenerateResponse=()=>({type:'document_grounded',textIT:'Current PDF'});
  assert.equal((await w.rbProcessAIMessage('Spiegami cashflow e ADR nel PDF')).response.type,'document_grounded');
  assert.equal((await w.rbProcessAIMessage('Spiegami il cashflow')).response.type,'document_grounded');
});
async function parse(text){
  const c=vm.createContext({window:{},console});vm.runInContext(read('js/chatbot/pdf-parser-engine.js'),c);
  const doc={extractedText:text};await c.window.rbParseExecutivePDF(doc);return doc.analysis;
}
for(const lang of ['it','en'])test('actual exported PDF retains financial evidence and assessment: '+lang,async()=>{
  const a=await parse(read('tests/fixtures/rc174-feasibility-'+lang+'.txt'));
  assert.equal(a.roi,28.1);assert.equal(a.equity,30000);assert.equal(a.propertyPrice,150000);
  assert.equal(a.cashflow,8444.77);assert.equal(a.risk,25);assert.equal(a.investmentScore,79);assert.equal(a.dscr,2.55);
  assert.equal(a.verdict,'BUY');assert.equal(a.roiBasis,'equity');assert.equal(a.cashflowBasis,'after_mortgage');
  assert.equal(a.debtService,8351);assert.equal(a.adr,120);
});
for(const text of ['Elementi da valutare. Attendi il caricamento.','Assessment points: to be reviewed by your advisor.','Una proposta favorevole è da valutare.'])test('narrative is not an outcome: '+text,async()=>assert.equal((await parse(text)).verdict,null));
for(const [text,outcome] of [
  ['Valutazione del modello Favorevole Elementi da valutare','BUY'],
  ['Model assessment Favourable Assessment points','BUY'],
  ['Valutazione del modello Da verificare Elementi da valutare','WAIT'],
  ['Model assessment Critical','AVOID'],
  ['Verdetto: NO BUY','AVOID'],
  ['Recommendation: WAIT','WAIT']
])test('explicit report outcome is preserved: '+text,async()=>assert.equal((await parse(text)).verdict,outcome));
for(const [text,adr] of [['Tariffa per notte 120 EUR',120],['Nightly rate: 120.50 EUR',120.5],['Tariffa notte da verificare: 22/10/2026',null],['Nightly rate: 100-200 EUR',null]])test('nightly rate remains explicitly grounded: '+text,async()=>assert.equal((await parse(text)).adr,adr));

function marketHarness(){
  const nodes=new Map(),events={};
  const get=id=>{if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',innerText:'',innerHTML:''});return nodes.get(id);};
  const w={currentLang:'it',RB_LANG:{current:'it'},currentCity:'roma',getUserAccess:()=>({isPro:true}),simulationExecuted:true,lastAnalysisData:{gross:30660},RB_MARKET_DATA:{roma:{annualRevenue:40200,occupancy:.76,price:145}}};
  const c=vm.createContext({window:w,document:{getElementById:get,addEventListener:(name,fn)=>events[name]=fn}});
  vm.runInContext(read('js/market-engine.js').replace(/^import .*;\n/,'').replace('export function','function'),c);
  return {w,c,get,events};
}
test('market language event reads the completed snapshot and accepts zero',()=>{
  const h=marketHarness();
  for(const lang of ['it','en','it']){
    h.w.currentLang=lang;h.w.RB_LANG.current=lang;h.events.rb_language_changed();
    assert.match(h.get('market-comparison').innerHTML,/-23.7%/);
    assert.doesNotMatch(h.get('market-comparison').textContent,/Run a simulation/);
  }
  h.w.lastAnalysisData.gross=0;h.events.rb_language_changed();assert.match(h.get('market-comparison').innerHTML,/-100.0%/);
  h.w.simulationExecuted=false;h.w.currentRevenue=undefined;h.events.rb_language_changed();assert.match(h.get('market-comparison').textContent,/Completa una simulazione/);
});
test('market language event never reveals paid references to Free',()=>{
  const h=marketHarness();h.w.getUserAccess=()=>({isFree:true});h.events.rb_language_changed();
  assert.match(h.get('market-comparison').textContent,/disponibile con Investor/);
  assert.equal(h.get('benchmark-price').textContent,'Investor / Pro');
});
test('tool language listener keeps the snapshot, city and paid comparison without writes',()=>{
  const source=read('js/app.js'),start=source.indexOf('if(!window.__rbToolLanguageRefreshBound)'),end=source.indexOf('\nfor(const id of ["price", "equity"])',start);
  const data={city:'roma',gross:30660,equity:30000,net:8444.77,roi:28.149,risk:25,investmentScore:79,occupancy:70};
  const calls=[],nodes=new Map();let refresh;
  const get=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',attrs:{},setAttribute(k,v){this.attrs[k]=v;}});return nodes.get(id);};
  const w={currentLang:'en',lastAnalysisData:data,simulationExecuted:true,getUserAccess:()=>({isPro:true})};
  const c={window:w,document:{addEventListener:(_,fn)=>refresh=fn,getElementById:get},formatCurrency:String,t:(it,en)=>w.currentLang==='en'?en:it,getInvestmentBadge:()=>'',getInvestmentBadgeClass:()=>''};
  for(const name of ['renderInvestmentScore','renderRiskMeter','renderInvestmentVerdict','renderInvestmentRanking','renderUniversalKPI','renderRevenueForecast','renderMarketBenchmark','renderMarketComparison','renderROIMarketComparison','renderCashflowProjection','updateROIMessage','renderFreeSimulationPreview','renderPropertyModeResults'])c[name]=(...args)=>calls.push([name,...args]);
  w.calculate=()=>assert.fail('language must not calculate');w.saveAnalysis=()=>assert.fail('language must not save');
  vm.runInNewContext(source.slice(start,end),c);refresh();
  assert.deepEqual(calls.find(r=>r[0]==='renderMarketComparison'),['renderMarketComparison',30660,'roma']);
  const city=get('tool-result-city');assert.equal(city.textContent,'Rome · Base scenario');assert.equal(city.attrs['data-it'],'Roma · Scenario base');assert.equal(city.attrs['data-en'],'Rome · Base scenario');
  assert.equal(w.lastAnalysisData,data);
  calls.length=0;w.getUserAccess=()=>({isFree:true});refresh();assert.ok(!calls.some(r=>r[0]==='renderMarketComparison'));
});
test('entry points and nested modules invalidate cached versions of changed assets',()=>{
  for(const file of ['tool/index.html','dashboard/index.html','immobili/index.html','mutui/index.html']){
    const source=read(file);
    for(const name of ['header','chatbot-loader','app']){
      const refs=[...source.matchAll(new RegExp('/js/'+name+'\\.js\\?v=([^"\\s]+)','g'))];
      for(const ref of refs)assert.equal(ref[1],name==='app'?'20261022-rc175':'20261022-rc174',file+' '+name);
    }
  }
  assert.match(read('js/header.js'),/chatbot-loader\.js\?v=20261022-rc174/);
  assert.match(read('js/app.js'),/market-engine\.js\?v=20261022-rc174/);
  for(const name of ['chatbot-orchestrator','pdf-parser-engine'])assert.match(read('js/chatbot-loader.js'),new RegExp(name+'\\.js\\?v=20261022-rc174'));
});
test('new English result city survives a delayed static translation pass',()=>{
  const source=read('js/app.js'),start=source.indexOf('const resultCity =\n  document.getElementById("tool-result-city")');
  const end=source.indexOf('// ===============================================\n// 🧠 CHATBOT LIVE DATA',start);
  const node={attrs:{},setAttribute(k,v){this.attrs[k]=v;}};
  const c={window:{currentLang:'en'},document:{getElementById:()=>node},marketCity:'roma',customLocation:'',t:(_it,en)=>en};
  vm.runInNewContext(source.slice(start,end),c);
  assert.equal(node.innerText,'Rome · Base scenario');assert.equal(node.attrs['data-en'],node.innerText);
  assert.equal(node.attrs['data-it'],'Roma · Scenario base');
});
