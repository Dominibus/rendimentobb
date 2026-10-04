import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const read=f=>readFile(new URL('../'+f,import.meta.url),'utf8');
for(const route of ['immobili','immobili/napoli','immobili/roma','immobili/milano','immobili/firenze']){
 test(`${route} loads the shared chatbot exactly once with a root-relative URL`,async()=>{
  const html=await read(route+'/index.html');const tags=html.match(/<script\b[^>]*src="[^"]*chatbot-loader\.js[^\"]*"[^>]*>/g)||[];
  assert.equal(tags.length,1);assert.match(tags[0],/src="\/js\/chatbot-loader\.js/);assert.ok(html.includes('/js/header.js'));assert.ok(html.includes('/js/firebase-init.js'));
 });
}
async function headerHarness(){
 const source=await read('js/header.js');const start=source.indexOf('if(aiBtn){',source.indexOf('// 🤖 HEADER AI BUTTON'));const end=source.indexOf('\n}\n\n}  ',start)+2;
 const listeners=new Set(),timers=new Map();let next=0,chatbot=null;const classes=new Set();
 const c={aiBtn:{},document:{getElementById:()=>chatbot,addEventListener:(event,cb)=>{assert.equal(event,'rb_chatbot_ready');listeners.add(cb);},removeEventListener:(event,cb)=>listeners.delete(cb)},setTimeout:cb=>{timers.set(++next,cb);return next;},clearTimeout:id=>timers.delete(id)};
 vm.createContext(c);vm.runInContext(source.slice(start,end),c);
 return {click:()=>c.aiBtn.onclick(),mount:()=>{chatbot={classList:{add:k=>classes.add(k),toggle:k=>classes.has(k)?classes.delete(k):classes.add(k)}};},ready:()=>{for(const cb of [...listeners])cb();},expire:()=>{for(const cb of [...timers.values()])cb();},classes,listeners,timers};
}
test('Assistant toggles an already initialized window',async()=>{const h=await headerHarness();h.mount();h.click();assert.ok(h.classes.has('open'));h.click();assert.ok(!h.classes.has('open'));assert.equal(h.listeners.size,0);});
test('Assistant click before initialization opens when the loader becomes ready',async()=>{const h=await headerHarness();h.click();h.click();assert.equal(h.listeners.size,1);h.mount();h.ready();assert.ok(h.classes.has('open'));assert.equal(h.listeners.size,0);assert.equal(h.timers.size,0);});
test('initialization timeout clears pending listener and allows retry',async()=>{const h=await headerHarness();h.click();h.expire();assert.equal(h.listeners.size,0);h.click();assert.equal(h.listeners.size,1);h.mount();h.ready();assert.ok(h.classes.has('open'));});
