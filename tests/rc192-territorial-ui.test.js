import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync}from 'node:fs';
test('RC192 actual UI renders real aggregates, changes exact filters and language without external calls',async()=>{
 class Element{
  constructor(tag=''){this.tag=tag;this.children=[];this.dataset={};this.attributes={};this.listeners={};this.classList={add:()=>{}};this.value='';this.textContent='';}
  before(){}
  removeAttribute(name){delete this.attributes[name];}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  addEventListener(name,fn){this.listeners[name]=fn;}
  setAttribute(name,value){this.attributes[name]=value;}
  querySelector(selector){const key=/data-field="([^"]+)"/.exec(selector)?.[1];return this.find(n=>n.dataset?.field===key);}
  find(fn){if(fn(this))return this;for(const c of this.children){const r=c.find?.(fn);if(r)return r;}return null;}
  focus(){this.focused=true;}
  text(){return this.textContent+this.children.map(c=>c.text?c.text():c.textContent||'').join(' ');}
 }
 const root=new Element('section');root.dataset.city='napoli';const events={},calls=[];
 globalThis.document={querySelectorAll:()=>[root],createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text}),addEventListener:(n,f)=>events[n]=f};globalThis.window={currentLang:'it'};
 globalThis.fetch=async(url,opts)=>{calls.push([url,opts]);return {ok:true,json:async()=>JSON.parse(readFileSync(new URL(url.includes('/omi/')?'../data/omi/napoli.json':url.includes('/tourism/')?'../data/tourism/istat-capitals-2025.json':'../data/territorial/napoli.json',import.meta.url),'utf8'))};};
 await import('../js/territorial-benchmark-ui.js?rc192-unit');await new Promise(setImmediate);
 assert.match(root.text(),/Mediana del prezzo base/);assert.match(root.text(),/Inside Airbnb/);assert.match(root.text(),/Osservazioni:/);assert.match(root.text(),/Fonte:/);assert.match(root.text(),/non ricavi incassati/);
 const zone=root.querySelector('[data-field="zone"]');assert.ok(zone.children.length>1);zone.value=zone.children[zone.children.length-1].value;zone.listeners.change();assert.equal(root.querySelector('[data-field="zone"]').value,zone.value);
 window.currentLang='en';events.rb_language_changed();assert.match(root.text(),/DOCUMENTED SOURCE/);assert.match(root.text(),/Method, coverage and limitations/);assert.match(root.text(),/One observation per listing/);
 assert.equal(calls.length,3);assert.equal(calls.filter(c=>c[0].includes('/tourism/')).length,1);const quoteCall=calls.find(c=>c[0].includes('/territorial/'));assert.match(quoteCall[0],/^\/data\/territorial\/napoli.json/);assert.equal(quoteCall[1].credentials,'omit');assert.equal(root.attributes['aria-busy'],'false');
 delete globalThis.document;delete globalThis.window;
});
