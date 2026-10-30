import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {installCandidateWorkspace} from '../js/candidate-workspace.js';
import {candidateTemplate,CANDIDATE_FIELDS,ECONOMIC_FIELDS} from '../js/candidate-screening.js';
const html=readFileSync(new URL('../immobili/candidati/index.html',import.meta.url),'utf8');
class Element{
 constructor(doc,tag='div'){this.doc=doc;this.tag=tag;this.children=[];this.dataset={};this.attributes={};this.handlers={};this.value='';this._text='';this.files=[];}
 set id(v){this._id=v;this.doc.nodes.set(v,this);}get id(){return this._id;}
 set textContent(v){this._text=String(v);this.children=[];}get textContent(){return this._text+this.children.map(e=>e.textContent).join(' ');}
 append(...nodes){for(const n of nodes){n.parentNode=this;this.children.push(n);}}appendChild(n){this.append(n);}
 replaceChildren(...nodes){this._text='';this.children=[];this.append(...nodes);}
 addEventListener(name,fn){(this.handlers[name]??=[]).push(fn);}async emit(name,extra={}){for(const fn of this.handlers[name]||[])await fn({type:name,target:this,preventDefault(){},...extra});}
 setAttribute(k,v){this.attributes[k]=v;}focus(){this.doc.focused=this;}click(){return this.emit('click');}
 all(){return this.children.flatMap(e=>[e,...e.all()]);}
 querySelectorAll(selector){if(selector==='[data-it][data-en]')return this.all().filter(e=>e.dataset.it&&e.dataset.en);if(selector==='input[data-preview-line]:checked')return this.all().filter(e=>e.tag==='input'&&e.dataset.previewLine&&e.checked);return [];}
 reset(){for(const el of this.all())if(el.tag==='input'){el.value='';el.checked=false;}}
}
function harness(){
 const doc={nodes:new Map(),handlers:{},createElement:tag=>new Element(doc,tag),getElementById:id=>doc.nodes.get(id),addEventListener:(n,f)=>{(doc.handlers[n]??=[]).push(f);},async emit(n){for(const f of doc.handlers[n]||[])await f();}};
 for(const id of [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1])){const e=new Element(doc,id.startsWith('criterion-')?'input':'div');e.id=id;}
 const root=doc.getElementById('candidate-workspace');for(const e of doc.nodes.values())if(e!==root)root.append(e);
 const put=(id,parent)=>{const e=doc.getElementById(id);e.parentNode.children=e.parentNode.children.filter(n=>n!==e);doc.getElementById(parent).append(e);};
 for(const id of ['candidate-manual-fields','candidate-manual-economic-fields'])put(id,'candidate-manual');put('candidate-common-fields','candidate-common');for(const id of doc.nodes.keys())if(id.startsWith('criterion-'))put(id,'candidate-criteria');
 const w={currentLang:'it',currentUser:null,location:{pathname:'/immobili/candidati/'},crypto:{randomUUID:()=> 'fixed-id'},handlers:{},addEventListener(n,f){(this.handlers[n]??=[]).push(f);},URL:{createObjectURL:()=> 'blob:synthetic',revokeObjectURL(){}},Blob:class{},setTimeout:fn=>fn(),fetch:()=>assert.fail('no network'),localStorage:{setItem:()=>assert.fail('no persistent storage')},sessionStorage:{setItem:()=>assert.fail('no session archive')}};
 const $=id=>doc.getElementById(id);$('candidate-number-format').value='it';$('candidate-filter').value='all';$('candidate-sort').value='entered';
 const api=installCandidateWorkspace(w,doc);return {w,doc,$,...api};
}
async function manual(h,values={}){for(const f of CANDIDATE_FIELDS)h.$('candidate-input-'+f).value=values[f]??'';await h.$('candidate-manual').emit('submit');}
const full={reference:'C-1',city:'Roma',zone:'Nord',price:'150.000',sqm:'70',works:'0',other:'0'};
test('manual -> criteria -> filter -> explanation -> new-tab simulator uses one stable candidate without account writes',async()=>{
 const h=harness();await manual(h,full);assert.equal(h.state.candidates.length,1);assert.equal(h.state.candidates[0].reference,'C-1');
 h.$('criterion-maxTotal').value='200.000';await h.$('candidate-criteria').emit('submit');assert.match(h.$('candidate-summary').textContent,/da approfondire: 1/);
 let action=h.$('candidate-rows').all().find(e=>e.tag==='button'&&e.textContent.startsWith('Spiega'));await action.click();assert.equal(h.w.rbCandidateWorkspace.getContext().active,'C-1');assert.match(h.$('candidate-explanation').textContent,/non è una raccomandazione/i);
 const link=h.$('candidate-rows').all().find(e=>e.tag==='a'&&e.href?.startsWith('/tool/'));assert.equal(link.target,'_blank');assert.match(link.href,/c_reference=C-1/);assert.match(link.href,/c_price=150000/);assert.doesNotMatch(link.href,/c_tax|c_priceNight/);
 h.$('candidate-sort').value='total:asc';await h.$('candidate-sort').emit('change');h.$('candidate-filter').value='compatible';await h.$('candidate-filter').emit('change');assert.equal(h.w.rbCandidateWorkspace.getContext().rows[0].reference,'C-1');
});
test('CSV preview is inert, preserves row selection on language change and commits chosen valid rows only',async()=>{
 const h=harness();h.$('candidate-file').files=[{size:1000,text:async()=>candidateTemplate()}];await h.$('candidate-preview-button').click();assert.equal(h.state.candidates.length,0);
 let checks=h.$('candidate-preview').all().filter(e=>e.tag==='input');checks[1].checked=false;await checks[1].emit('change');checks[2].checked=false;await checks[2].emit('change');
 h.w.currentLang='en';await h.doc.emit('rb_language_changed');checks=h.$('candidate-preview').all().filter(e=>e.tag==='input');assert.deepEqual(checks.map(e=>e.checked),[true,false,false]);
 await h.$('candidate-preview').all().find(e=>e.tag==='button').click();assert.equal(h.state.candidates.length,1);assert.equal(h.state.candidates[0].reference,'C-001');assert.match(h.$('candidate-status').textContent,/only to this page/);
});
test('common assumptions apply only to explicitly selected IDs and are visible in explanation',async()=>{
 const h=harness();await manual(h,full);await manual(h,{...full,reference:'C-2'});
 const check=h.$('candidate-rows').all().find(e=>e.tag==='input');check.checked=true;await check.emit('change');assert.match(h.$('candidate-selected-summary').textContent,/C-1/);
 for(const f of ECONOMIC_FIELDS)h.$('candidate-common-'+f).value='';h.$('candidate-common-priceNight').value='120';await h.$('candidate-common').emit('submit');
 assert.equal(h.state.candidates[0].priceNight,120);assert.equal(h.state.candidates[1].priceNight,null);assert.equal(h.w.rbCandidateWorkspace.getContext().rows[0].assumptions.find(a=>a.field==='priceNight').origin,'common');
});
test('logout and account change clear candidate state and discard an in-flight CSV read',async()=>{
 const h=harness();await manual(h,full);let finish;
 h.$('candidate-file').files=[{size:1000,text:()=>new Promise(r=>finish=r)}];const reading=h.$('candidate-preview-button').click();
 h.w.currentUser={uid:'other'};await h.doc.emit('rb_auth_ready');assert.equal(h.state.candidates.length,0);finish(candidateTemplate());await reading;assert.equal(h.state.preview.length,0);assert.equal(h.w.rbCandidateWorkspace.getContext().ownerUid,'other');
 await manual(h,full);h.w.currentUser=null;await h.doc.emit('rb_auth_ready');assert.equal(h.state.candidates.length,0);assert.equal(h.state.active,null);
});
test('HTML-like cells never render and file/number-format change invalidate pending previews',async()=>{
 const h=harness();h.$('candidate-file').files=[{size:1000,text:async()=> 'reference;city\nC-1;"<img src=x onerror=alert(1)>"'}];await h.$('candidate-preview-button').click();const check=h.$('candidate-preview').all().find(e=>e.tag==='input');assert.equal(check.disabled,true);assert.equal(h.state.candidates.length,0);
 h.$('candidate-number-format').value='en';await h.$('candidate-number-format').emit('change');assert.equal(h.state.preview.length,0);
});
test('reloading page has no workspace archive and pagehide removes the assistant provider',async()=>{
 const h=harness();await manual(h,full);assert.equal(harness().state.candidates.length,0);h.w.handlers.pagehide[0]();assert.equal(h.w.rbCandidateWorkspace,null);h.w.handlers.pageshow[0]();assert.equal(h.w.rbCandidateWorkspace.getContext().rows.length,1);
});
