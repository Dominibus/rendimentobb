import vm from 'node:vm';
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const langSource = await readFile(
  new URL("../js/lang.js", import.meta.url),
  "utf8"
);

const appSource = await readFile(
  new URL("../js/app.js", import.meta.url),
  "utf8"
);

const toolHTML = await readFile(
  new URL("../tool/index.html", import.meta.url),
  "utf8"
);

test("global language engine never triggers calculations or saves", () => {
  const rerenderBody = langSource.match(
    /function rerenderDynamic\(\)\{([\s\S]*?)\n  \}/
  )?.[1] || "";

  assert.doesNotMatch(rerenderBody, /runRealCalculation\s*\(/);
  assert.doesNotMatch(rerenderBody, /compareMortgages\s*\(/);
  assert.doesNotMatch(rerenderBody, /(?:window\.)?calculate\s*\(/);
  assert.doesNotMatch(rerenderBody, /saveAnalysis\s*\(/);
});

test("tool language refresh only rebuilds presentation", () => {
  const marker = "// LANGUAGE-ONLY REFRESH";
  const refreshSource = appSource.slice(appSource.indexOf(marker));
  const executableSource = refreshSource.replace(/\/\/.*$/gm, "");

  assert.ok(refreshSource.includes("rb_language_changed"));
  assert.doesNotMatch(executableSource, /window\.calculate\s*\(/);
  assert.doesNotMatch(executableSource, /saveAnalysis\s*\(/);
});

test("tool language refresh reformats cached KPI values locally", () => {
  const marker = "// LANGUAGE-ONLY REFRESH";
  const refreshSource = appSource.slice(appSource.indexOf(marker));

  assert.match(refreshSource, /renderUniversalKPI\s*\(/);
  assert.match(refreshSource, /profit-live/);
  assert.match(refreshSource, /revenue-live/);
  assert.match(refreshSource, /formatCurrency\s*\(/);
});

test("break-even unit follows the selected language", () => {
  const start=appSource.indexOf('function renderUniversalKPI(data = {}){');
  const end=appSource.indexOf('// ================= ROI MESSAGE (HOME)',start);
  assert.ok(start>=0&&end>start);
  for(const lang of ['it','en']){
    const nodes=new Map();
    const window={currentLang:lang,currentPlan:'pro',getUserAccess:()=>({isPro:true,canSeeFullAnalysis:true})};
    const document={getElementById:id=>{if(!nodes.has(id))nodes.set(id,{innerText:'',dataset:{},style:{},classList:{remove(){}}});return nodes.get(id);},querySelectorAll:()=>[]};
    const c={window,document,Intl,formatCurrency:String,t:(it,en)=>lang==='en'?en:it,appDebugWarn(){}};
    vm.runInNewContext(appSource.slice(start,end),c);
    c.renderUniversalKPI({net:60000,revenue:100000,investment:30000});
    assert.equal(nodes.get('break-even').innerText,lang==='en'?'0.5 years':'0,5 anni');
    c.renderUniversalKPI({net:7500,revenue:100000,investment:30000});
    assert.equal(nodes.get('break-even').innerText,lang==='en'?'4.0 years':'4,0 anni');
    c.renderUniversalKPI({net:-10,revenue:0,investment:30000});
    assert.equal(nodes.get('break-even').innerText,'-');
  }
});

test("new simulations render every executive panel before any language switch", () => {
  const scoreMarker = "// Lo Score deve leggere esclusivamente lo snapshot della simulazione corrente.";
  const memoryMarker = "// 🧠 CITY MEMORY ENGINE";
  const start = appSource.indexOf(scoreMarker);
  const end = appSource.indexOf(memoryMarker, start);
  const initialRenderSource = appSource.slice(start, end);

  assert.match(initialRenderSource, /renderInvestmentScore\s*\(/);
  assert.match(initialRenderSource, /renderRiskMeter\s*\(/);
  assert.match(initialRenderSource, /renderInvestmentVerdict\s*\(/);
  assert.match(initialRenderSource, /renderInvestmentRanking\s*\(/);
  assert.match(initialRenderSource, /renderROIMarketComparison\s*\(/);
});

test("every static Tool translation has both Italian and English", () => {
  const translatedTags = toolHTML.match(/<[^>]+data-(?:it|en)=[^>]*>/gs) || [];
  const incompleteTags = translatedTags.filter(tag =>
    !(/\bdata-it=/.test(tag) && /\bdata-en=/.test(tag))
  );

  assert.deepEqual(incompleteTags, []);
});

test("dynamic score renderer uses the canonical language state", () => {
  assert.match(toolHTML, /window\.currentLang === "en"/);
  assert.doesNotMatch(toolHTML, /localStorage\.getItem\("lang"\)/);
});
test('RC200 commercial destinations follow IT/EN and retain the demo query',()=>{
 const paths=['/gestione-commerciale/?demo=1','/immobili-commerciali/#sources','/en/gestione-commerciale/','https://external.example/gestione-commerciale/'];
 const links=paths.map(href=>({href,getAttribute(k){return k==='href'?this.href:null;},setAttribute(k,v){if(k==='href')this.href=v;}}));
 const w={RB_LANG:{current:'en'}};const c=vm.createContext({window:w,document:{querySelectorAll:s=>s==='a[href]'?links:[],querySelector:()=>null},setTimeout:()=>{}});
 const start=langSource.indexOf('  function applyTranslations()'),end=langSource.indexOf('// ===============================\n  // UPDATE UI',start);
 vm.runInContext(langSource.slice(start,end)+';applyTranslations();',c);
 assert.equal(links[0].href,'/en/gestione-commerciale/?demo=1');assert.equal(links[1].href,'/en/immobili-commerciali/#sources');assert.equal(links[2].href,'/en/gestione-commerciale/');assert.equal(links[3].href,paths[3]);
 w.RB_LANG.current='it';vm.runInContext('applyTranslations()',c);assert.equal(links[0].href,'/gestione-commerciale/?demo=1');assert.equal(links[2].href,'/gestione-commerciale/');
});
