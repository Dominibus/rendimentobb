import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../js/chatbot/ui/chatbot-ui.js',import.meta.url),'utf8');
const translation=source.slice(source.indexOf('  const t = (it,en)=>'),source.indexOf('// 🔐 EXECUTIVE SNAPSHOT ACCESS'));
const refresh=source.slice(source.indexOf('  function refreshChatbotLanguage(){'),source.indexOf('  debugLog("Chatbot UI ready");'));
function setup(lang='it',recognition={}){
 const node=()=>({textContent:'old',attrs:{},setAttribute(k,v){this.attrs[k]=v;}});
 const groups={'.rb-home-title':Array.from({length:6},node),'.rb-home-desc':Array.from({length:6},node),'.rb-ai-metric-label':Array.from({length:4},node),'.rb-ai-status':[{childNodes:[{nodeType:1,icon:'preserved'},{nodeType:3,textContent:'Pronto'}]}]};
 const single=Object.fromEntries(['.rb-chat-subtitle','.rb-ai-home-subtitle','.rb-empty-title','.rb-empty-text','.rb-home-actions-title','.rb-home-actions-context','#rb-chat-attach','#rb-chat-voice','#rb-chat-new','#rb-chat-close','#rb-chat-send'].map(k=>[k,node()]));
 const input={...node(),value:'unsent draft'};let snapshot=0,quick=0;const listeners={};
 const c={window:{currentLang:lang},wrapper:{querySelectorAll:q=>groups[q]||(single[q]?[single[q]]:[]),querySelector:q=>single[q]},input,recognition,refreshHomeSnapshot(){snapshot++;},refreshQuickActions(){quick++;},document:{addEventListener:(name,cb)=>listeners[name]=cb}};
 vm.createContext(c);vm.runInContext(translation+refresh,c);
 return {c,single,groups,input,listeners,counts:()=>({snapshot,quick}),change:lang=>{c.window.currentLang=lang;listeners.rb_language_changed();}};
}
test('English startup translates all six cards and their descriptions',()=>{const h=setup('en');assert.equal(h.groups['.rb-home-title'][0].textContent,'Analyze investment');assert.equal(h.groups['.rb-home-title'][1].textContent,'Analyze PDF');assert.equal(h.groups['.rb-home-title'][3].textContent,'Mortgage');assert.equal(h.groups['.rb-home-desc'][4].textContent,'City benchmarks');});
test('IT EN IT language changes update the existing interface immediately',()=>{const h=setup();h.change('en');assert.equal(h.groups['.rb-home-title'][4].textContent,'Market');h.change('it');assert.equal(h.groups['.rb-home-title'][4].textContent,'Mercato');assert.equal(h.counts().snapshot,3);assert.equal(h.counts().quick,3);});
test('active city and snapshot labels change language without changing the city',()=>{const h=setup();h.c.window.lastAnalysisData={realCity:'Napoli'};h.change('en');assert.equal(h.single['.rb-home-actions-context'].textContent,'Active context: NAPOLI');assert.equal(h.groups['.rb-ai-metric-label'][0].textContent,'📍 Market');assert.equal(h.groups['.rb-ai-metric-label'][3].textContent,'⚠️ Risk');assert.equal(h.c.window.lastAnalysisData.realCity,'Napoli');});
test('placeholder accessible labels and speech language follow EN',()=>{const h=setup();h.change('en');assert.equal(h.input.attrs.placeholder,'Write or speak...');assert.equal(h.single['#rb-chat-attach'].attrs.title,'Attach file');assert.equal(h.single['#rb-chat-new'].attrs['aria-label'],'New chat');assert.equal(h.c.recognition.lang,'en-US');});
test('refresh preserves draft and status icon and works without speech support',()=>{const h=setup('en',null);assert.equal(h.input.value,'unsent draft');assert.equal(h.groups['.rb-ai-status'][0].childNodes[0].icon,'preserved');assert.equal(h.groups['.rb-ai-status'][0].childNodes[1].textContent,' Ready');});
test('language engine state is respected when currentLang is not set',()=>{const h=setup(undefined);h.c.window.currentLang=undefined;h.c.window.RB_LANG={current:'en'};h.listeners.rb_language_changed();assert.equal(h.groups['.rb-home-title'][0].textContent,'Analyze investment');});
test('home card prompt is evaluated at click time after changing language',()=>{
 const start=source.indexOf('const getHomePrompts = ()=> [');const end=source.indexOf('// 📄 DOCUMENT UPLOADED EVENT',start);let sent;
 const c={homeCards:[{}],input:{value:''},lang:'it',sendMessage(){sent=c.input.value;}};vm.createContext(c);vm.runInContext('const t=(it,en)=>lang==="en"?en:it;\n'+source.slice(start,end),c);c.lang='en';c.homeCards[0].onclick();assert.equal(sent,'Analyze this investment');c.lang='it';c.homeCards[0].onclick();assert.equal(sent,'Analizza questo investimento');
});
test('language refresh never resends messages recalculates or reinitializes UI',()=>{assert.ok(!refresh.includes('sendMessage('));assert.ok(!refresh.includes('calculate('));assert.ok(!refresh.includes('initRBChatbotUI'));assert.ok(!source.includes('window.currentLanguage'));assert.match(source,/if\(recognition\)\{\s*recognition\.onstart/);});
