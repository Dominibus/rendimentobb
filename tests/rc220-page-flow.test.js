import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {revealFlowTarget,installPageFlow} from '../js/page-flow.js';
const read = p => readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('deep links open every ancestor and request chart resize',()=>{
 const outer={tagName:'DETAILS',open:false,parentElement:null};
 const inner={tagName:'DETAILS',open:false,parentElement:outer};
 const target={tagName:'SECTION',parentElement:inner};const events=[];
 revealFlowTarget(target,{dispatchEvent:e=>events.push(e.type)});
 assert.equal(outer.open,true);assert.equal(inner.open,true);assert.deepEqual(events,['resize']);
 revealFlowTarget(inner,{dispatchEvent:()=>{}});assert.equal(inner.open,true);
});
test('missing deep-link targets are harmless',()=>assert.doesNotThrow(()=>revealFlowTarget(null,{})));
test('keyboard/click shortcuts reveal and focus their destination; malformed fragments are harmless',()=>{
 const events={},wevents={};let focused=false;
 const details={tagName:'DETAILS',parentElement:null,open:false};
 const target={tagName:'DIV',parentElement:details,setAttribute(k,v){this[k]=v},focus(opts){focused=opts.preventScroll}};
 const doc={getElementById:id=>id==='inputs'?target:null,addEventListener:(n,cb)=>events[n]=cb};
 const win={location:{hash:'#%broken'},dispatchEvent:()=>{},addEventListener:(n,cb)=>wevents[n]=cb};
 installPageFlow(doc,win);assert.equal(details.open,false);
 const link={getAttribute:()=>'#inputs',closest:()=>true};events.click({target:{closest:()=>link}});
 assert.equal(details.open,true);assert.equal(focused,true);assert.equal(target.tabindex,'-1');
 details.open=false;win.location.hash='#inputs';wevents.hashchange();assert.equal(details.open,true);
});
test('Home offers analysis and management before optional detail and quick calculator',()=>{
 const s=read('index.html');const hero=s.slice(s.indexOf('<section class="rb158-hero"'),s.indexOf('<section id="rb-home-experience"'));
 assert.match(hero,/Analizza un investimento/);assert.match(hero,/Gestisci una struttura/);assert.doesNotMatch(hero,/data-rb-trial-start/);
 assert.ok(s.indexOf('id="rb-quick-calculation"')<s.indexOf('id="rb158-paths"'));
 assert.match(s,/<details[^>]*id="rb-quick-calculation"[^>]*data-rb-home-panel="simulator"/);
 assert.match(s,/data-rb-home-entry data-rb-trial-start/);
});
test('Tool keeps inputs and result outside optional guidance; market source map has explicit scopes',()=>{
 const s=read('tool/index.html');assert.ok(s.indexOf('id="rb-analysis-inputs"')<s.indexOf('id="rb-analysis-help"'));
 for(const id of ['rb-analysis-inputs','rb-simulation-summary','rb-analysis-insights'])assert.match(s,new RegExp(`href="#${id}"`));
 assert.match(s,/<details[^>]*id="rb-analysis-insights"/);assert.match(s,/OMI per valori immobiliari/);assert.match(s,/ISTAT per flussi turistici/);
 assert.match(s,/<details id="rb-result-next"[^>]*hidden/);
 assert.doesNotMatch(read('js/app.js'),/Nessun benchmark locale disponibile\. La simulazione/);
});
test('PMS task list comes before optional assistant/report blocks, with original actions intact',()=>{
 const s=read('js/dashboard.js');const start=s.indexOf('container.innerHTML = `',s.indexOf('window.t("Tutto sotto controllo"')-500);
 const tasks=s.indexOf('${priorityTasksHtml}',start);const assistant=s.indexOf('<section class="pms-autopilot-access"',start);
 assert.ok(tasks>0 && assistant>tasks);
 assert.match(s,/data-autopilot-period/);assert.match(s,/onclick="openPropertyPerformance\(\)"/);
 assert.match(read('dashboard/index.html'),/id="dashboard-data-source"/);
});
test('all three pages share versioned accessible flow controls and reduced-motion CSS',()=>{
 for(const path of ['index.html','tool/index.html','dashboard/index.html']){
  const s=read(path);assert.match(s,/page-flow.css\?v=20261028-rc220/);assert.match(s,/type="module" src="\/js\/page-flow.js\?v=20261028-rc220/);
 }
 assert.match(read('css/page-flow.css'),/focus-visible/);assert.match(read('css/page-flow.css'),/prefers-reduced-motion/);
});
