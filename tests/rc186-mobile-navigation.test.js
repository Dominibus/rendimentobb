import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../js/mobile-shell.js',import.meta.url),'utf8');
function setup(path){const nodes=new Map(),events={},classes=new Set();let opens=0;function element(){const span={textContent:''};return {children:[],dataset:{},attributes:{},setAttribute(k,v){this.attributes[k]=v},querySelector(){return span},appendChild(el){this.children.push(el);if(el.id)nodes.set(el.id,el)},addEventListener(k,f){this[k]=f}}}const body=element();body.classList={add:v=>classes.add(v)};const c={window:{location:{pathname:path},currentLang:'it'},document:{getElementById:id=>id==='rb-header-ai-btn'?{click(){opens++}}:nodes.get(id),createElement:element,addEventListener:(k,f)=>events[k]=f,body}};vm.createContext(c);vm.runInContext(src.slice(src.indexOf('function initializeMobileTabs(){'),src.indexOf('window.rbMountMobileShell=')),c);return {c,body,nodes,events,classes,get opens(){return opens}}}
for(const [path,active]of [['/',0],['/tool/',1],['/dashboard/',2],['/dashboard-report/',2],['/immobili/',-1],['/gestione-commerciale/',2],['/en/gestione-commerciale/',2],['/demo/hospitality-pms/',2],['/en/demo/hospitality-pms/',2],['/immobili-commerciali/',1],['/en/demo/investment-analytics/',1]])test('mobile navigation destination and current page: '+path,()=>{const h=setup(path);h.c.initializeMobileTabs();const nav=h.nodes.get('rb-mobile-tabs');assert.equal(nav.children.length,4);assert.deepEqual(nav.children.slice(0,3).map(e=>e.href),['/','/tool/','/dashboard/']);nav.children.forEach((e,i)=>assert.equal(e.attributes['aria-current'],i===active?'page':undefined));assert.ok(h.classes.has('rb-mobile-app'));nav.children[3].click();assert.equal(h.opens,1);h.c.initializeMobileTabs();assert.equal(h.body.children.length,1)});
test('mobile labels follow language changes without altering routes',()=>{const h=setup('/tool/');h.c.initializeMobileTabs();h.c.window.currentLang='en';h.events.rb_language_changed();const n=h.nodes.get('rb-mobile-tabs');assert.equal(n.attributes['aria-label'],'Main mobile navigation');assert.deepEqual(n.children.map(e=>e.querySelector().textContent),['Home','Analyze','Dashboard','Assistant']);});
test('RC207 the Italian bottom bar says Dashboard and retains its destination',()=>{const h=setup('/dashboard/');h.c.initializeMobileTabs();const tab=h.nodes.get('rb-mobile-tabs').children[2];assert.equal(tab.querySelector().textContent,'Dashboard');assert.equal(tab.href,'/dashboard/');});
test('RC221 public demo Assistant opens local help without an account header',()=>{
 const h=setup('/demo/hospitality-pms/');let focused=false;
 const help={open:false,querySelector:()=>({focus(){focused=true;}})};
 const get=h.c.document.getElementById;
 h.c.document.getElementById=id=>id==='rb-header-ai-btn'?null:get(id);
 h.c.document.querySelector=selector=>selector==='.rb-public-assistant'?help:null;
 h.c.document.documentElement={lang:'en'};h.c.window.currentLang=undefined;
 h.c.initializeMobileTabs();h.nodes.get('rb-mobile-tabs').children[3].click();
 assert.equal(help.open,true);assert.equal(focused,true);
 assert.equal(h.nodes.get('rb-mobile-tabs').children[1].querySelector().textContent,'Analyze');
 assert.equal(h.opens,0);
});
