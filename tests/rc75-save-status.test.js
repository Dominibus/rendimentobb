import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const start = source.indexOf('async function saveAnalysis(data){');
const body = source.slice(start, source.indexOf('// 🔒 LOCK OVERLAY', start));
function setup(){
  let writer = async()=>{};
  const status = {dataset:{}, textContent:''};
  const events = {};
  const logs = [];
  const window = {currentLang:'it', currentUser:{uid:'annual'}, firebaseReady:true,
    getUserAccess:()=>({isPaid:true}), dispatchEvent:()=>{}};
  const c = {window, document:{getElementById:id=>id==='rb-analysis-save-status'?status:null,
    addEventListener:(name, fn)=>events[name]=fn},
    console:{error:(...args)=>logs.push(args)},
    readInvestmentAssumptions:()=>null, db:{}, collection:()=>({}),
    addDoc:()=>writer(), serverTimestamp:()=>0, Event:class{},
    sessionStorage:{getItem:()=>null}, localStorage:{getItem:()=>null}};
  vm.createContext(c); vm.runInContext(body,c);
  return {c,window,status,events,logs,setWriter:fn=>writer=fn};
}
test('save status waits for database acknowledgement and language changes do not write', async()=>{
  const s=setup();let resolve,writes=0;
  s.setWriter(()=>{writes++;return new Promise(r=>resolve=r)});
  const pending=s.c.saveAnalysis({});
  assert.equal(s.status.dataset.state,'pending');
  assert.match(s.status.textContent,/attendo la conferma/);
  s.window.currentLang='en';s.events.rb_language_changed();
  assert.match(s.status.textContent,/waiting for database confirmation/);
  assert.equal(writes,1);
  resolve();assert.equal(await pending,true);
  assert.equal(s.status.dataset.state,'saved');
  assert.match(s.status.textContent,/Analysis saved/);
});
test('failed save is visible, logs exclude payload and retry can succeed', async()=>{
  const s=setup();s.setWriter(async()=>{throw Object.assign(Error('private@example.com'),{code:'permission-denied'})});
  assert.equal(await s.c.saveAnalysis({}),false);
  assert.equal(s.status.dataset.state,'failed');
  assert.match(s.status.textContent,/premi di nuovo Analizza/);
  assert.doesNotMatch(JSON.stringify(s.logs),/private@example.com/);
  s.setWriter(async()=>{});assert.equal(await s.c.saveAnalysis({}),true);
  assert.equal(s.status.dataset.state,'saved');
});
test('previous save acknowledgement does not claim newer unsaved scenario is saved', async()=>{
  const s=setup();let resolve;
  s.setWriter(()=>new Promise(r=>resolve=r));
  const first=s.c.saveAnalysis({equity:0});
  assert.equal(await s.c.saveAnalysis({equity:30000}),false);
  assert.equal(s.status.dataset.state,'busy');
  resolve();await first;
  assert.equal(s.status.dataset.state,'busy');
  assert.match(s.status.textContent,/nuova analisi non è stata salvata/);
  s.setWriter(async()=>{});await s.c.saveAnalysis({equity:30000});
  assert.equal(s.status.dataset.state,'saved');
});
test('Free stays local and unavailable paid session does not claim a save', async()=>{
  const s=setup();let writes=0;s.setWriter(async()=>writes++);
  s.window.getUserAccess=()=>({isPaid:false});
  assert.equal(await s.c.saveAnalysis({}),false);
  assert.equal(s.status.dataset.state,'local');assert.equal(writes,0);
  s.window.getUserAccess=()=>({isPaid:true});s.window.firebaseReady=false;
  assert.equal(await s.c.saveAnalysis({}),false);
  assert.equal(s.status.dataset.state,'notReady');assert.equal(writes,0);
});
