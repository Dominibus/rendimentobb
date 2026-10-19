import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');
function harness(){
 const nodes=new Map(),events={},pending=[];let calls=0;
 const window={currentUser:{uid:'one'},currentPlan:null};
 const document={getElementById(id){if(!nodes.has(id))nodes.set(id,{dataset:{},textContent:''});return nodes.get(id)},addEventListener(n,f){events[n]=f}};
 const c=vm.createContext({window,document,t:(it,en)=>window.currentLang==='en'?en:it,loadProperties(){calls++;return new Promise((resolve,reject)=>pending.push({resolve,reject}))},loadPMSStats(){calls++;return Promise.resolve()}});
 vm.runInContext(source.slice(source.indexOf('let pmsUIReady='),source.indexOf('\ndocument.addEventListener(\n  "DOMContentLoaded"',source.indexOf('let pmsUIReady='))),c);
 return {c,window,nodes,pending,events,get calls(){return calls},ready(){vm.runInContext('pmsUIReady=true',c)}};
}
test('PMS waits for both UI and access, displays pending state and clears it on success',async()=>{
 const h=harness();h.window.currentPlan='pro';await h.events.rb_auth_ready();assert.equal(h.calls,0);
 h.ready();const load=h.c.refreshPMSAfterAccess();assert.equal(h.calls,2);assert.equal(h.nodes.get('pms-total-revenue').textContent,'—');assert.match(h.nodes.get('pms-load-state').textContent,/Caricamento/);
 h.pending[0].resolve();await load;assert.equal(h.nodes.get('pms-load-state').textContent,'');
 const other=harness();other.ready();await other.c.refreshPMSAfterAccess();assert.equal(other.calls,0);other.window.currentPlan='investor';const next=other.events.rb_auth_ready();other.pending[0].resolve();await next;assert.equal(other.calls,2);
});
test('PMS failure is unavailable rather than zero and old owner errors cannot overwrite a new load',async()=>{
 const h=harness();h.ready();h.window.currentPlan='pro';const old=h.c.refreshPMSAfterAccess();h.window.currentUser={uid:'two'};h.window.currentLang='en';const recent=h.c.refreshPMSAfterAccess();
 h.pending[0].reject(new Error('old account'));await old;assert.match(h.nodes.get('pms-load-state').textContent,/Loading/);
 h.pending[1].reject(new Error('offline'));await recent;assert.equal(h.nodes.get('pms-total-revenue').textContent,'N/A');assert.match(h.nodes.get('pms-load-state').textContent,/do not mean zero/);
});
test('chat distinguishes exported booking archive from external import in both languages',()=>{
 const window={};vm.runInNewContext(fs.readFileSync(new URL('../js/chatbot/core/pro-report-guide.js',import.meta.url),'utf8'),{window});
 for(const q of ['Come importo il CSV appena scaricato?','How can I import the CSV just downloaded?']){const r=window.rbBuildBookingImportGuide(q);assert.equal(r.metadata.mode,'booking_archive_help');assert.match(r.textIT,/doppioni/);assert.match(r.textEN,/one row per booking/);assert.equal(r.actions.length,0)}
 assert.equal(window.rbBuildBookingImportGuide('Explain this PDF CSV import'),null);
});
test('privacy distinguishes guest-bearing booking archive from anonymised aggregate reports',()=>{
 const privacy=fs.readFileSync(new URL('../privacy.html',import.meta.url),'utf8');
 assert.match(privacy,/id="booking-csv-data"/);assert.match(privacy,/contains guest name, booking ID/);assert.match(privacy,/Non include contatti/);assert.match(privacy,/Aggregated PMS and performance reports exclude guest names/);
});
