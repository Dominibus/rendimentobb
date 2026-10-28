import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
class Element{
 constructor(tag=''){this.tag=tag;this.children=[];this.dataset={};this.attributes={};this.listeners={};this.classList={add(){}};this.value='';this.textContent='';}
 before(){} removeAttribute(k){delete this.attributes[k];} append(...nodes){this.children.push(...nodes);} replaceChildren(...nodes){this.children=nodes;}
 addEventListener(k,f){this.listeners[k]=f;} setAttribute(k,v){this.attributes[k]=v;}
 querySelector(selector){const key=/data-field="([^"]+)"/.exec(selector)?.[1];return this.find(n=>n.dataset?.field===key);}
 find(fn){if(fn(this))return this;for(const c of this.children){const n=c.find?.(fn);if(n)return n;}return null;}
 focus(){} text(){return this.textContent+this.children.map(c=>c.text?c.text():c.textContent||'').join(' ');}
}
test('Trento public UI selects a valid segment and explains historical stay dates in IT/EN',async()=>{
 const root=new Element('section');root.dataset.city='trento';const events={},calls=[];
 const data=JSON.parse(fs.readFileSync(new URL('../data/territorial/trento.json',import.meta.url)));
 const previous={document:globalThis.document,window:globalThis.window,fetch:globalThis.fetch};
 try{
 globalThis.document={querySelectorAll:()=>[root],createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text}),addEventListener:(k,f)=>events[k]=f};
 globalThis.window={currentLang:'it'};globalThis.fetch=async(url,options)=>{calls.push({url,options});assert.match(url,/^\/data\/(territorial\/trento|tourism\/istat-capitals-2025).json/);return {ok:true,json:async()=>url.includes('/tourism/')?JSON.parse(fs.readFileSync(new URL('../data/tourism/istat-capitals-2025.json',import.meta.url))):data};};
 await import('../js/territorial-benchmark-ui.js?rc216-ui');await new Promise(setImmediate);
 const row=data.rows.find(r=>r[6]!==null);
 for(const [i,field]of ['zone','propertyType','roomType','capacity','stayMonth','stayLength'].entries()){
  const control=root.querySelector('[data-field="'+field+'"]');control.value=String(row[i]);control.listeners.change();
 }
 assert.match(root.text(),/Mediana del prezzo base/);assert.match(root.text(),/Trento, Trentino/);assert.match(root.text(),/date dei soggiorni quotati sono trascorse/);
 window.currentLang='en';events.rb_language_changed();assert.match(root.text(),/quoted stay dates have passed/);assert.match(root.text(),/not receipts or ADR/);
 assert.equal(calls.length,2);assert.equal(calls.filter(c=>c.url.includes('/territorial/')).length,1);assert.equal(calls[0].options.credentials,'omit');
 }finally{for(const [key,value]of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
