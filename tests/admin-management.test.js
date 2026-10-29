import test from 'node:test';
import assert from 'node:assert/strict';
import registry from '../js/source-registry-data.js';
import {managementPlan,sourceSteps} from '../js/admin-management-model.js';
import {renderManagement} from '../js/admin-management-view.js';
const now=Date.parse('2026-10-29T12:00:00Z');
const snapshot=()=>({observedAt:now,environment:'production',jobs:[{id:'task_notifications',available:true,check:{state:'recorded_success',lastRunAt:now,metrics:{checked:1,sent:0,errors:0,suppressed:1}}}],queues:{manual:{available:true,counts:{live:0,test:0,unknown:0},entries:[]},due:{available:true,counts:{live:0,test:0,unknown:0},entries:[]}},interests:{available:true,entries:[]},notifications:{enabled:true}});
test('clean recorded operations still expose the four documented source reviews',()=>{
 const p=managementPlan(snapshot(),registry,now);
 assert.equal(p.issues.length,0);assert.equal(p.gaps.length,0);assert.equal(p.stale,false);
 assert.deepEqual(p.reviews.map(x=>x.id),['omi-values','inside-airbnb','editorial-knowledge','platform-providers']);assert.equal(p.actionCount,4);
});
test('one job with stale and attention evidence counts once, unknown queues require investigation',()=>{
 const data=snapshot();data.jobs[0].check={state:'attention',lastRunAt:now-40*3600000,needsAttention:true,metrics:{errors:2}};
 data.queues.manual.available=false;data.queues.due.counts.unknown=1;
 const p=managementPlan(data,registry,now);assert.equal(p.issues.length,1);assert.equal(p.issues[0].reason,'attention');
 assert.equal(p.gaps.length,2);assert.equal(p.actionCount,7);
});
test('missing, future and expired snapshots do not imply a current clean check; deadline does not imply new releases',()=>{
 for(const observedAt of [undefined,now+600000,now-300001]){const data=snapshot();data.observedAt=observedAt;assert.equal(managementPlan(data,registry,now).stale,true);}
 const p=managementPlan(snapshot(),registry,Date.parse('2026-11-29T12:00:00Z'));
 assert.equal(p.reviews.length,14);assert.ok(p.reviews.every(x=>x.reviewDue));
});
test('source instructions distinguish official release checks, provider permissions and internal assumptions in both languages',()=>{
 for(const lang of ['it','en']){
  const steps=id=>sourceSteps(registry.datasets.find(x=>x.id===id),lang).join(' ');
  assert.match(steps('omi-values'),lang==='it'?/Non abbiamo rilevato automaticamente un nuovo semestre/:/No new semester has been detected automatically/);
  assert.match(steps('inside-airbnb'),lang==='it'?/acquisizione automatica è sospesa/:/Automatic acquisition is paused/);
  assert.match(steps('market-assumptions'),lang==='it'?/Non sono dati di mercato da scaricare/:/not market datasets to download/);
  assert.match(steps('editorial-knowledge'),lang==='it'?/Non cambiare automaticamente aliquote/:/Do not change tax rates/);
 }
});
class E{constructor(tag,doc){this.tag=tag;this.ownerDocument=doc;this.children=[];this.textContent='';}append(e){this.children.push(e);}get text(){return [this.textContent,...this.children.map(e=>e.text)].join(' ');}}
test('founder view uses real zero counters and separates recorded service outcomes from unconnected source alerts',()=>{
 for(const lang of ['it','en']){
  const doc={createElement:tag=>new E(tag,doc)},root=new E('div',doc);
  const out=renderManagement(root,snapshot(),lang,now),text=out.text;
  assert.match(text,lang==='it'?/Devi intervenire tu/:/Your action list/);
  assert.match(text,lang==='it'?/consegna non verificata\): 0/:/delivery unverified\): 0/);
  assert.match(text,lang==='it'?/non sono ancora incluse nelle email/:/not included in email alerts yet/);
  assert.match(text,lang==='it'?/non cronologia completa/:/not a full history/);
  assert.doesNotMatch(text,/undefined|NaN|ownerUid|recipient/);
 }
});

test('periodic redraw and language switch preserve open guidance, logout clears it',async()=>{
 const vm=await import('node:vm'),fs=await import('node:fs');
 const root={details:[],replaceChildren(){this.details=[];},querySelectorAll(){return this.details;}};
 const nodes={'operations-content':root,'operations-feedback':{textContent:''},'operations-refresh':{addEventListener(){}}};
 const listeners={};let onAuth,tick;
 const auth={currentUser:{uid:'admin',email:'rendimentobb@gmail.com',emailVerified:true,getIdToken:async()=>'synthetic'}};
 const ctx={auth,onAuthStateChanged:(a,cb)=>{onAuth=cb;},renderOperations:r=>{r.details=[{id:'ops-source-action-omi-values',open:false}];},
  document:{hidden:false,getElementById:id=>nodes[id],addEventListener:(name,cb)=>{listeners[name]=cb;}},window:{currentLang:'it'},
  Date,AbortController,setTimeout,clearTimeout,setInterval:cb=>{tick=cb;},fetch:async()=>({ok:true,json:async()=>({schemaVersion:1,observedAt:Date.now()})})};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL('../js/admin-operations.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,''),ctx);
 onAuth(auth.currentUser);await new Promise(setImmediate);
 root.details[0].open=true;tick();assert.equal(root.details[0].open,true);
 ctx.window.currentLang='en';listeners.rb_language_changed();assert.equal(root.details[0].open,true);
 auth.currentUser=null;onAuth(null);assert.equal(root.details.length,0);
});
