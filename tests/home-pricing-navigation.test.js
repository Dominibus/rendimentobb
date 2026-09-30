import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../js/home-2026.js',import.meta.url),'utf8');
function setup(hash){
 const handlers={};const tabs=['simulator','demo','pricing'].map(name=>({dataset:{rbPanelTarget:name},classList:{toggle(){}},setAttribute(){},addEventListener(){}}));
 const panels=['simulator','demo','pricing'].map(name=>({dataset:{rbHomePanel:name},hidden:true}));
 const ctx={window:{location:{hash},currentPlan:'free',addEventListener(type,fn){handlers[type]=fn;}},
 document:{addEventListener(type,fn){handlers[type]=fn;},querySelector(){return null;},getElementById(){return {scrollIntoView(){}};},querySelectorAll(selector){if(selector==='[data-rb-panel-target]')return tabs;if(selector==='[data-rb-home-panel]')return panels;return [];}}};
 vm.createContext(ctx);vm.runInContext(source,ctx);handlers.DOMContentLoaded();return {ctx,panels,handlers};
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
