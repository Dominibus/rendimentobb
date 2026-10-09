import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('report language event redraws saved results and preserves selected simulation',()=>{
 const s=read('dashboard-report/index.html');const start=s.indexOf('document.addEventListener("rb_language_changed", () => {',s.indexOf('// ================= START ================='));
 const end=s.indexOf('\n});',start)+4;let refresh;const selector={value:'2'};const calls=[];
 const c={lang:'it',reportOwnerUid:'annual',price:150000,isPro:true,window:{currentUser:{uid:'annual'},currentLang:'en',applyTranslations:()=>calls.push('static')},document:{addEventListener:(name,fn)=>refresh=fn,getElementById:()=>selector}};
 for(const name of ['renderData','renderVerdict','renderOperationalReport','renderChart','renderAdvanced']) c[name]=()=>calls.push(name);
 c.populateSimulations=()=>{selector.value='0';};vm.createContext(c);vm.runInContext(s.slice(start,end),c);
 refresh();assert.equal(c.lang,'en');assert.equal(selector.value,'2');assert.equal(calls.length,6);
 c.window.currentLang='it';refresh();assert.equal(c.lang,'it');assert.equal(selector.value,'2');
 c.window.currentUser={uid:'other'};calls.length=0;refresh();assert.equal(calls.length,0);
});
test('PMS language refresh preserves monthly chart amounts and owner isolation',()=>{
 const s=read('js/dashboard.js');const start=s.indexOf('function refreshPMSLanguage(){');const end=s.indexOf('\ndocument.addEventListener',start);
 const amounts=[0,0,0,0,0,0,0,0,2000,4600,2110,0];const chart={data:{labels:[],datasets:[{data:amounts}]},update(mode){assert.equal(mode,'none');}};
 const nodes={'pms-performance-chart':{},'pms-total-revenue':{},'pms-adr':{},'pms-revpar':{},'pms-occupancy':{}};
 const window={currentLang:'en',currentUser:{uid:'annual'},rbPMSData:{ownerUid:'annual',revenue:4600,adr:219.05,revpar:37.10,occupancy:17}};
 const c={window,document:{getElementById:id=>nodes[id]},Chart:{getChart:()=>chart},formatCurrency:v=>new Intl.NumberFormat(window.currentLang==='en'?'en-US':'it-IT',{style:'currency',currency:'EUR'}).format(v),formatPercent:v=>v+'%',t:(it,en)=>window.currentLang==='en'?en:it};
 vm.createContext(c);vm.runInContext(s.slice(start,end),c);c.refreshPMSLanguage();assert.equal(chart.data.labels[9],'Oct');assert.match(nodes['pms-total-revenue'].innerText,/4,600/);assert.equal(chart.data.datasets[0].data,amounts);
 window.currentLang='it';c.refreshPMSLanguage();assert.equal(chart.data.labels[9],'Ott');assert.match(nodes['pms-total-revenue'].innerText,/4\.?600,00/);assert.equal(chart.data.datasets[0].label,'Ricavi');assert.equal(chart.data.datasets[0].data,amounts);
 window.currentUser={uid:'other'};window.currentLang='en';c.refreshPMSLanguage();assert.equal(chart.data.labels[9],'Ott');
});
test('report describes saved assumptions in both languages and pages fetch the updated header',()=>{
 assert.match(read('dashboard-report/index.html'),/data-en="SAVED ASSUMPTIONS"/);
 assert.doesNotMatch(read('dashboard-report/index.html'),/data-en="LIVE DATA"/);
 for(const path of ['dashboard/index.html','dashboard-report/index.html','tool/index.html'])assert.match(read(path),/header\.js\?v=20261009-rc85/);
});
