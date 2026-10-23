import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const current=()=>({status:'current',tier:'free',city:'Roma',calculatedAt:123,metrics:{roiBasis:'property',roiAvailable:true,roi:3.2,annualCashflow:5781.09,monthlyCashflow:481.76}});
function setup({state=current(),access={isFree:true},path='/tool/',lang='it'}={}){
 const window={location:{pathname:path},currentLang:lang,getUserAccess:()=>access,rbGetInvestmentAnalysisState:()=>state};
 // Legacy shared data must not be accessed by the Free presentation.
 for(const key of ['lastAnalysisData','rbChatMemory','rbGetConversationContext'])Object.defineProperty(window,key,{get(){throw Error('Must not read '+key)}});
 const c=vm.createContext({window,Intl});vm.runInContext(read('js/chatbot/ui/free-home-snapshot.js'),c);
 return {window,c,html:()=>window.rbBuildFreeChatHomeHTML()};
}
test('RC190: Free summary mirrors current public results and excludes risk/paid metrics',()=>{
 const html=setup().html();assert.match(html,/Risultati base · simulazione corrente/);assert.match(html,/3,2%/);assert.match(html,/5\.?781,09/);assert.match(html,/481,76/);assert.match(html,/Cashflow annuo stimato/);assert.match(html,/Cashflow mensile stimato/);assert.doesNotMatch(html,/Rischio|Risk|Investment Score|999|--/);
});
test('RC190: zero and negative cashflow stay visible',()=>{
 for(const annual of [0,-1200]){
  const state=current();state.metrics.annualCashflow=annual;state.metrics.monthlyCashflow=annual/12;
  const html=setup({state}).html();assert.match(html,/Risultati base/);assert.match(html,annual===0?/0,00/:/-1\.?200,00/);
 }
});
test('RC190: owned property with no value displays N/A instead of a false zero ROI',()=>{
 const state=current();state.metrics.roiAvailable=false;state.metrics.roi=0;const html=setup({state}).html();assert.match(html,/N\/A/);assert.match(html,/manca il valore dell’immobile/);assert.doesNotMatch(html,/0%/);
});
for(const status of ['missing','stale','pending','unavailable'])test('RC190: '+status+' never reuses old results',()=>{
 const state=current();state.status=status;const html=setup({state}).html();assert.doesNotMatch(html,/5\.?781|3,2%|481,76|>Roma</);assert.match(html,/data-rb-free-home/);
 if(status==='stale')assert.match(html,/Hai cambiato le ipotesi/);if(status==='pending')assert.match(html,/Attendi il risultato corrente/);
});
test('RC190: absent, malformed or paid snapshots cannot feed the Free card',()=>{
 for(const state of [{},{...current(),tier:'paid'},{...current(),metrics:{}},{...current(),metrics:{...current().metrics,annualCashflow:null}},{...current(),metrics:{...current().metrics,roi:'3.2'}},{...current(),metrics:{...current().metrics,annualCashflow:Infinity}},{...current(),metrics:{...current().metrics,roiBasis:'equity'}}])assert.doesNotMatch(setup({state}).html(),/Risultati base · simulazione corrente/);
});
test('RC190: account and loading transitions honour existing paid access',()=>{
 for(const access of [{isInvestor:true},{isPro:true},{isAdmin:true},{canSeeFullAnalysis:true}])assert.equal(setup({access}).html(),null);
 const html=setup({access:{isLoading:true,isPro:true}}).html();assert.match(html,/Attendi il risultato corrente/);assert.doesNotMatch(html,/5\.?781/);
});
test('RC190: other pages cannot display the tool summary even with a cached current state',()=>{
 for(const path of ['/','/dashboard/','/dashboard-report/']){const html=setup({path}).html();assert.match(html,/Inizia con una domanda semplice/);assert.doesNotMatch(html,/5\.?781|3,2%|>Roma</);}
});
test('RC190: English copy and formatting do not acquire legacy labels',()=>{
 const html=setup({lang:'en'}).html();assert.match(html,/Base results · current simulation/);assert.match(html,/Estimated annual cashflow/);assert.match(html,/5,781\.09/);assert.match(html,/3\.2%/);assert.match(html,/plans.html\?lang=en#tester-programme/);assert.doesNotMatch(html,/Cashflow annuo|Rischio/);
 const ui=read('js/chatbot/ui/chatbot-ui.js');assert.match(ui,/!el.closest\("\[data-rb-free-home\]"\)/);
});
test('RC190: a custom location is escaped and cannot inject markup',()=>{
 const state=current();state.city='<img src=x onerror="alert(1)">';const html=setup({state}).html();assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img|<script/);
});
test('RC190: Free UI refresh replaces a cached card before accessing legacy context',()=>{
 const {window,c}=setup(),ui=read('js/chatbot/ui/chatbot-ui.js'),start=ui.indexOf('function refreshFreeHomeActions(){'),end=ui.indexOf('// 📊 AUTO REFRESH AFTER NEW ANALYSIS',start);
 const card={outerHTML:''},title={textContent:''},context={textContent:''};
 c.document={querySelector:selector=>selector==='.rb-home-actions-title'?title:selector==='.rb-home-actions-context'?context:{querySelector:()=>card}};c.t=(it)=>it;
 vm.runInContext(ui.slice(start,end),c);vm.runInContext('refreshHomeSnapshot()',c);
 assert.match(card.outerHTML,/5\.?781,09/);assert.equal(title.textContent,'Chiedi una spiegazione');assert.match(context.textContent,/Definizioni senza account/);
 const expression=ui.slice(ui.indexOf('${window.rbBuildFreeChatHomeHTML?.() ?? (')+2,ui.indexOf('\n\n        </div>\n\n<div class="rb-home-actions-header">')).trim().slice(0,-1);
 assert.match(vm.runInContext(expression,c),/5\.?781,09/,'initial render must also avoid cached memory');
});
test('RC190: investment demo offers the full simulator and owned-property route in both languages',()=>{
 for(const [file,en]of [['demo/investment-analytics/index.html',false],['en/demo/investment-analytics/index.html',true]]){
  const html=read(file),main=html.split('<main')[1].split('</main>')[0];
  assert.match(main,en?/Continue in the full simulator/:/Continua nel simulatore completo/);assert.match(main,/href="\/tool\/\?(?:propertyMode=owned)/);assert.match(main,en?/Enter your assumptions again/:/Nel simulatore reinserisci le ipotesi/);
  assert.match(html,/public-shell.js/);assert.doesNotMatch(html,/firebase|chatbot-loader|header.js/);assert.doesNotMatch(html,/Racconta un’idea|Tell us your idea/);
 }
});
test('RC190: loader orders the Free presentation before UI with fresh versions',()=>{
 const loader=read('js/chatbot-loader.js');assert.ok(loader.indexOf('free-home-snapshot.js?v=20261023-rc190')<loader.indexOf('chatbot-ui.js?v=20261023-rc190'));assert.match(read('js/header.js'),/chatbot-loader.js\?v=20261023-rc192/);
});
test('RC190: switching to paid with no current analysis restores useful empty guidance',()=>{
 const ui=read('js/chatbot/ui/chatbot-ui.js'),start=ui.indexOf('function refreshFreeHomeActions(){'),end=ui.indexOf('// 📊 AUTO REFRESH AFTER NEW ANALYSIS',start);
 const card={outerHTML:''},header={querySelector:()=>card};
 const c={window:{rbBuildFreeChatHomeHTML:()=>null,lastAnalysisData:{},rbChatMemory:{}},document:{querySelector:()=>header,querySelectorAll:()=>[]},t:it=>it};
 vm.runInNewContext(ui.slice(start,end)+'\nrefreshHomeSnapshot();',c);assert.match(card.outerHTML,/Partiamo dai tuoi dati/);assert.match(card.outerHTML,/PDF con testo/);
});
