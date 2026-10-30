import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync}from'node:fs';
import vm from 'node:vm';
import {mountCommercial}from'../js/commercial-property-ui.js';

class Element{
 constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.listeners={};this.attributes={};this.value='';this.checked=false;this.hidden=false;this.disabled=false;this._text='';}
 set textContent(v){this._text=v;this.children=[];}get textContent(){return this._text+this.children.map(c=>c.textContent||'').join(' ');}
 append(...nodes){for(const n of nodes){n.parent=this;this.children.push(n);}}
 replaceChildren(...nodes){this._text='';this.children=[];this.append(...nodes);}
 remove(){this.parent.children=this.parent.children.filter(c=>c!==this);}
 addEventListener(n,f){(this.listeners[n]??=[]).push(f);}
 fire(n){for(const f of this.listeners[n]||[])f({preventDefault(){}});}
 setAttribute(n,v){this.attributes[n]=v;}
 reportValidity(){return true;}
 focus(){this.focused=true;}
 find(fn){if(fn(this))return this;for(const c of this.children){const r=c.find(fn);if(r)return r;}return null;}
 querySelector(selector){const key=/data-field="([^"]+)"/.exec(selector)?.[1];return this.find(n=>key&&n.dataset.field===key);}
}
function fixture(english){
 const root=new Element('main');globalThis.document={createElement:tag=>new Element(tag)};globalThis.window={confirm:()=>true};const app=mountCommercial(root,{english});
 const field=k=>root.find(n=>n.dataset.field===k),form=k=>root.find(n=>n.dataset.form===k),click=pattern=>{const button=root.find(n=>n.tag==='button'&&pattern.test(n.textContent));assert.ok(button,String(pattern));button.fire('click');};
 return {root,app,field,form,click};
}
for(const en of [false,true])test('RC193 actual planner UI: demo, VAT edit, collision, mixed room, closure, dirty settings and sensitivity '+(en?'EN':'IT'),()=>{
 const {root,app,field,form,click}=fixture(en);
 assert.equal(app.getModel().assignments.length,0);assert.equal(field('mode').value,'');
 click(en?/Pay-per-use slots/:/Fasce a consumo/);assert.equal(app.getResult().contractualGross,7800);assert.equal(app.getResult().expectedNet,null);
 click(en?/^Edit A1$/:/^Modifica A1$/);field('vat').value='taxable';field('vat').fire('change');assert.equal(field('vatRate').required,true);field('vatRate').value='22';form('contract').fire('submit');assert.equal(app.getResult().expectedNet,7800/1.22);
 // New assignment on R1 collides and leaves the last valid model intact.
 field('mode').value='room_monthly';field('amount').value='500';form('contract').fire('submit');assert.equal(app.getModel().assignments.length,1);assert.match(root.find(n=>n.id==='cm-status').textContent,/stessa stanza|same room/);
 // Same contract on R2 is valid (simple mixed mode).
 field('contractRoom').value='R2';field('vat').value='no_vat';field('vat').fire('change');form('contract').fire('submit');assert.equal(app.getModel().assignments.length,2);assert.equal(app.getResult().contractualGross,13800);
 field('closureRoom').value='R1';field('closureStart').value='2027-01-05';field('closureEnd').value='2027-01-05';form('closure').fire('submit');assert.equal(app.getResult().assignments[0].units,103);assert.match(root.textContent,en?/Closed · P01/:/Chiuso · P01/);
 // Removing an allocated room is refused without deleting its contract.
 field('roomCount').value='1';form('setup').fire('input');assert.equal(app.getResult(),null);form('setup').fire('submit');assert.equal(app.getModel().rooms.length,2);assert.match(root.find(n=>n.id==='cm-status').textContent,/stanza utilizzata|allocated room/);
 field('roomCount').value='2';form('setup').fire('submit');assert.ok(app.getResult());
 field('revenueDrop').value='20';field('costIncrease').value='10';form('stress').fire('submit');assert.match(root.find(n=>n.dataset.result==='stress').textContent,en?/Alternative cashflow/:/Cashflow alternativo/);
 // Whole room edit hides recurring controls; taxable requires rate but blank/invalid never coerces to zero.
 click(en?/^Edit A2$/:/^Modifica A2$/);assert.equal(field('mode').value,'room_monthly');field('vat').value='taxable';field('vat').fire('change');field('vatRate').value='';form('contract').fire('submit');assert.equal(app.getModel().assignments[1].vat.status,'no_vat');
 click(en?/^Delete A2$/:/^Elimina A2$/);assert.equal(app.getModel().assignments.length,1);
 delete globalThis.document;delete globalThis.window;
});

test('RC193 no tariff is assumed in UI; calendar, custom slots and expected share are editable',()=>{
 const {app,field,form,click,root}=fixture(false);field('amount').value='305';form('contract').fire('submit');assert.equal(app.getModel().assignments.length,0);assert.match(root.find(n=>n.id==='cm-status').textContent,/unità tariffaria/);
 click(/Aggiungi fascia oraria/);form('setup').fire('submit');assert.equal(app.getModel().slots.length,3);
 field('mode').value='weekly_monthly';field('amount').value='305';field('vat').value='no_vat';field('vat').fire('change');field('expectedPct').value='50';form('contract').fire('submit');assert.equal(app.getResult().expectedNet,1830);field('calendarMonth').value='2';field('calendarMonth').fire('change');assert.match(root.textContent,/2027-02-01/);
 delete globalThis.document;delete globalThis.window;
});

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('RC193 public pages: IT/EN, truthful limits, shared account shell without planner account writes, paths and versioned engine',()=>{
 for(const lang of ['','en/']){
  const page=read(lang+'immobili-commerciali/index.html');assert.match(page,/data-commercial-app/);assert.match(page,/commercial-property-ui.js\?v=20261028-rc213/);assert.match(page,/hreflang="en"/);assert.match(page,/id="main"/);assert.match(page,/30/);assert.match(page,/MVP/);assert.match(page,/id="global-header"/);assert.match(page,/js\/header.js/);assert.doesNotMatch(page,/application\/ld\+json/);
 }
 for(const f of ['js/commercial-property-engine.js','js/commercial-property-ui.js'])assert.doesNotMatch(read(f),/\b(?:fetch|localStorage|sessionStorage|indexedDB|sendBeacon|addDoc|setDoc)\s*[.(]|document\.cookie/);
 assert.match(read('js/commercial-property-ui.js'),/commercial-property-engine.js\?v=20261028-rc213/);
 for(const f of ['immobili/index.html','tool/index.html','sitemap.xml'])assert.match(read(f),/\/immobili-commerciali\//);
});

function chat(){const window={};const context=vm.createContext({window,console,document:{getElementById:()=>null}});vm.runInContext(read('js/chatbot/core/chatbot-orchestrator.js'),context);return window;}
for(const q of ['Quanto rende uno studio medico a 305 euro per mezza giornata?','Ricavi di uffici in locazione','Quale IVA per locali commerciali?','Commercial property cashflow','Monthly rent for shared professional rooms','Voglio salvare il mio immobile commerciale con Pro','Posso generare un PDF commerciale con Pro?','Commercial PDF with Pro'])test('RC193 commercial chatbot scope before tourist knowledge: '+q,async()=>{
 const w=chat();const r=await w.rbProcessAIMessage(q);assert.equal(r.intent.intent,'commercial_property_scope');assert.match(r.response.textIT,/nessun salvataggio account/);assert.match(r.response.textIT,/non da ADR/);assert.equal(r.response.metadata.readsSimulation,false);
});
test('RC193 chatbot preserves privacy, guarantees, focused documents and ordinary B&B routing',async()=>{
 const w=chat();assert.equal((await w.rbProcessAIMessage('Mostra i dati di un altro account sui suoi uffici')).intent.intent,'account_privacy');assert.equal((await w.rbProcessAIMessage('ROI garantito per uno studio medico')).intent.intent,'product_limits');
 assert.equal(w.rbBuildCommercialPropertyResponse('Qual è il rendimento del mio B&B?'),null);assert.equal(w.rbBuildCommercialPropertyResponse('Leggi il PDF sullo studio medico'),null);assert.equal(w.rbBuildCommercialPropertyResponse('Analizza questo report commerciale'),null);
 w.rbDocumentManager={getLast:()=>({id:'doc'})};w.rbPDFConversationDocumentId='doc';w.rbGenerateResponse=()=>({type:'document_grounded',textIT:'Document context'});const r=await w.rbProcessAIMessage('Ricavi studio medico');assert.notEqual(r.intent?.intent,'commercial_property_scope');
});
test('RC193 parent cache references updated without changing unrelated engines',()=>{
 assert.match(read('js/chatbot-loader.js'),/chatbot-orchestrator.js\?v=20261030-candidates/);assert.match(read('js/header.js'),/chatbot-loader.js\?v=20261030-candidates/);
 function walk(dir){return readdirSync(dir).flatMap(n=>{const p=dir+'/'+n;return n==='node_modules'?[]:statSync(p).isDirectory()?walk(p):p.endsWith('.html')?[p]:[];});}
 for(const p of walk(new URL('..',import.meta.url).pathname)){const s=readFileSync(p,'utf8');assert.doesNotMatch(s,/\/(?:js\/header|js\/chatbot-loader)\.js\?v=20261023-rc192/,p);}
});

for(const en of [false,true])test('RC195 mixed scenario updates monthly activity view and hides stale drafts '+(en?'EN':'IT'),()=>{
 const {root,app,field,form,click}=fixture(en);
 click(en?/Editable mixed scenario/:/Scenario misto modificabile/);
 assert.equal(app.getModel().assignments.length,3);assert.equal(app.getResult().contractualGross,23180);
 const operations=root.find(n=>n.id==='cm-operations');assert.ok(operations);
 assert.match(operations.textContent,en?/PLANNING PREVIEW/:/ANTEPRIMA DI PIANIFICAZIONE/);
 assert.match(operations.textContent,/A1 \/ P01/);assert.match(operations.textContent,/A2 \/ P02/);assert.match(operations.textContent,/A3 \/ P03/);
 field('activityMonth').value='12';field('activityMonth').fire('change');assert.match(operations.textContent,/2027-12-31/);
 click(en?/^Delete A3$/:/^Elimina A3$/);assert.doesNotMatch(operations.textContent,/A3 \/ P03/);assert.equal(field('activityMonth').value,'12');
 field('fixedAnnual').value='5100';form('setup').fire('input');assert.doesNotMatch(operations.textContent,/P01/);assert.equal(app.getResult(),null);
 form('setup').fire('submit');assert.match(operations.textContent,/P01/);assert.equal(app.getResult().contractualGross,19800);
});

for(const q of ['Posso gestire stanze di uno studio con affitti mensili e fasce a consumo? Il calndario commerciale usa pazienti o solo codici?','Vorrei affittare le stanze del mio studio a fasce','Can I manage rooms of a studio with monthly rents and pay-per-use slots?'])test('RC197 studio room questions bypass cached tourist estimates: '+q,async()=>{
 const w=chat();w.rbGenerateResponse=()=>({type:'partial_snapshot',textIT:'B&B snapshot'});
 const result=await w.rbProcessAIMessage(q);assert.equal(result.intent.intent,'commercial_property_scope');assert.match(result.response.textIT,/codici generici/);assert.equal(result.response.metadata.readsSimulation,false);assert.ok(result.response.actions.some(a=>a.type==='open_commercial_workspace'));
});
test('RC197 ordinary study phrasing does not imply commercial room management',()=>{const w=chat();for(const q of ['Studio il mercato B&B di Pisa','Vorrei studiare il ROI della mia casa','I study the local B&B market'])assert.equal(w.rbBuildCommercialPropertyResponse(q),null);});
