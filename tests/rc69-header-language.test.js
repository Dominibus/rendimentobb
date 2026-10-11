import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../js/header.js',import.meta.url),'utf8');
const start=source.indexOf('  document.querySelectorAll(\n  ".rb-lang button, .rb-mobile-lang button"');
const end=source.indexOf('  // 🔥 HEADER SCROLL UX',start);
const code=source.slice(start,end);
for(const stage of ['unavailable','pending','ready'])test(`language and plan refresh preserve annual account with auth ${stage}`,()=>{
 const button={dataset:{lang:'en'}},events={},renders=[],changes=[];
 const annual={uid:'annual'};
 const context={auth:stage==='unavailable'?undefined:stage==='pending'?{currentUser:null}:{currentUser:annual},window:{currentUser:annual,setLang:l=>changes.push(l),addEventListener:(event,fn)=>events[event]=fn},document:{querySelectorAll:()=>[button]},localStorage:{setItem(){},getItem:()=> 'it'},renderUser:u=>renders.push(u),updateLangButtons(){}};
 vm.runInNewContext(code,context);button.onclick();events.rb_plan_ready();
 assert.equal(changes[0],'en');assert.equal(renders.length,2);assert.ok(renders.every(u=>u===annual));
});
test('guest language switch works without Firebase',()=>{
 const button={dataset:{lang:'it'}},renders=[];
 vm.runInNewContext(code,{auth:undefined,window:{addEventListener(){}},document:{querySelectorAll:()=>[button]},localStorage:{setItem(){},getItem:()=> 'it'},renderUser:u=>renders.push(u),updateLangButtons(){}});
 button.onclick();assert.deepEqual(renders,[null]);
});
