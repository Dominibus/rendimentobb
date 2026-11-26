import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../js/home-2026.js',import.meta.url),'utf8');
function setup(hash){
 const handlers={};const tabs=['simulator','demo','pricing'].map(name=>({dataset:{rbPanelTarget:name},classList:{toggle(){}},attributes:{},events:{},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){this.events[k]=fn;},click(){this.events.click();},focus(){tabs.forEach(tab=>tab.focused=false);this.focused=true;}}));
 const panels=['simulator','demo','pricing'].map(name=>({dataset:{rbHomePanel:name},hidden:true}));
 const ctx={window:{location:{hash},currentPlan:'free',addEventListener(type,fn){handlers[type]=fn;}},
 document:{addEventListener(type,fn){handlers[type]=fn;},querySelector(){return null;},getElementById(){return {scrollIntoView(){}};},querySelectorAll(selector){if(selector==='[data-rb-panel-target]')return tabs;if(selector==='[data-rb-home-panel]')return panels;return [];}}};
 vm.createContext(ctx);vm.runInContext(source,ctx);handlers.DOMContentLoaded();return {ctx,panels,handlers,tabs};
}
test('pricing deep link opens the otherwise hidden comparison panel',()=>{
 const {panels}=setup('#pricing');assert.equal(panels.find(x=>x.dataset.rbHomePanel==='pricing').hidden,false);assert.equal(panels.find(x=>x.dataset.rbHomePanel==='simulator').hidden,true);
});
test('home retains simulator as initial panel without a pricing deep link',()=>{
 const {panels}=setup('');assert.equal(panels.find(x=>x.dataset.rbHomePanel==='simulator').hidden,false);
});
test('same-page pricing hash navigation opens the comparison panel',()=>{
 const {ctx,panels,handlers}=setup('');ctx.window.location.hash='#pricing';handlers.hashchange();assert.equal(panels.find(x=>x.dataset.rbHomePanel==='pricing').hidden,false);
});
test('home tabs support arrow wrapping, Home/End and a single keyboard stop',()=>{
 const {tabs,panels}=setup('');
 const press=(index,key)=>{let prevented=false;tabs[index].events.keydown({key,preventDefault(){prevented=true;}});return prevented;};
 assert.deepEqual(tabs.map(t=>t.tabIndex),[0,-1,-1]);
 assert.equal(press(0,'ArrowLeft'),true);
 assert.equal(tabs[2].focused,true);assert.equal(panels[2].hidden,false);
 assert.deepEqual(tabs.map(t=>t.tabIndex),[-1,-1,0]);
 assert.equal(tabs[2].attributes['aria-selected'],'true');
 press(2,'ArrowRight');assert.equal(tabs[0].focused,true);
 press(0,'End');assert.equal(tabs[2].focused,true);
 press(2,'Home');assert.equal(tabs[0].focused,true);
 assert.equal(press(0,'Tab'),false);
});
