import test from 'node:test';import assert from 'node:assert/strict';
import {mountCommercialWorkspace,createCommercialDemoClient,exportCommercialRegister} from '../js/commercial-workspace-ui.js';
import {createCommercialWorkspaceDemo} from '../js/commercial-workspace-model.js';
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.listeners={};this.attributes={};this.value='';this.checked=false;this.hidden=false;this.disabled=false;this._text='';}
 set textContent(v){this._text=v;this.children=[];}get textContent(){return this._text+this.children.map(c=>c.textContent||'').join(' ');}
 append(...nodes){for(const n of nodes){n.parent=this;this.children.push(n);}}
 replaceChildren(...nodes){this._text='';this.children=[];this.append(...nodes);}
 remove(){this.parent.children=this.parent.children.filter(c=>c!==this);}
 addEventListener(n,f){(this.listeners[n]??=[]).push(f);}
 async fire(n){for(const f of this.listeners[n]||[])await f({preventDefault(){}});await new Promise(setImmediate);}
 setAttribute(n,v){this.attributes[n]=v;}
 reportValidity(){return true;}
 focus(){this.focused=true;}
 find(fn){if(fn(this))return this;for(const c of this.children){const r=c.find(fn);if(r)return r;}return null;}
 querySelector(selector){const key=/data-field="([^"]+)"/.exec(selector)?.[1];return this.find(n=>key&&n.dataset.field===key);}
}
function setup({english=false,client=createCommercialDemoClient(),confirm=()=>true}={}){
 const root=new Element('main');globalThis.document={createElement:tag=>new Element(tag)};globalThis.window={confirm};
 const downloads=[],app=mountCommercialWorkspace(root,{client,english,demo:true,today:'2027-01-10',confirm,download:(csv,name)=>downloads.push({csv,name})});
 const field=k=>root.find(n=>n.dataset.field===k),form=k=>root.find(n=>n.dataset.form===k),click=async pattern=>{const b=root.find(n=>n.tag==='button'&&pattern.test(n.textContent));assert.ok(b,String(pattern));await b.fire('click');};return {root,app,field,form,click,downloads};
}
for(const english of [false,true])test('RC196 actual workspace IT/EN: load, register, reconcile, task, Autopilot, calendar and CSV '+(english?'EN':'IT'),async()=>{
 const {root,app,field,form,click,downloads}=setup({english});await app.setOwner('demo');assert.ok(app.getWorkspace().operating);assert.match(root.textContent,/1200|1[,.]200/);
 await click(english?/^Movements$/:/^Movimenti$/);field('movementAmount').value='450';field('reference').value='REF-02';field('date').value='2027-01-10';field('movementPeriod').value='2027-01';field('kind').value='receipt';field('contractId').value='A2';await form('movement').fire('submit');assert.equal(app.getWorkspace().ledger.length,3);assert.equal(app.getWorkspace().ledger[2].cents,45000);
 await click(english?/^Tasks$/:/^Attività$/);field('taskRoom').value='R1';field('category').value='user_report';field('priority').value='urgent';field('dueDate').value='2027-01-10';field('taskNote').value='GENERIC-ACCESS';await form('task').fire('submit');assert.equal(app.getWorkspace().tasks.length,2);assert.match(root.textContent,/GENERIC-ACCESS/);
 await click(english?/^Today$/:/^Oggi$/);assert.match(root.textContent,/GENERIC-ACCESS/);
 await click(/^Autopilot$/);field('question').value=english?'How are receipts?':'Come vanno gli incasi?';await form('autopilot').fire('submit');assert.match(root.textContent,/1650|1[,.]650/);assert.match(root.textContent,/2027-01/);
 await click(english?/^Calendar$/:/^Calendario$/);assert.match(root.textContent,/2027-01-01/);assert.match(root.textContent,english?/Reserved/:/Riservato/);
 await click(english?/^Movements$/:/^Movimenti$/);await click(english?/Export monthly register CSV/:/Esporta registro del mese CSV/);assert.equal(downloads.length,1);assert.match(downloads[0].csv,/450.00/);assert.match(downloads[0].csv,/commercial-register-v1/);
 await app.setOwner(null);assert.equal(app.getWorkspace(),null);assert.doesNotMatch(root.textContent,/GENERIC-ACCESS|REF-02|1200/);
});
test('RC196 scenario editor is the real planner: create, save, confirm, edit hypothetical, keep operations separate',async()=>{
 const {root,app,field,click}=setup();await app.setOwner('demo');await click(/^Scenari$/);field('workspace').value='';await field('workspace').fire('change');
 await click(/Scenario misto modificabile/);field('spaceName').value='New generic space';
 const save=root.find(n=>n.tag==='button'&&/^Crea spazio e salva/.test(n.textContent));const saveForm=save.parent.parent;await saveForm.fire('submit');assert.equal(app.getWorkspace().scenario.assignments.length,3);assert.equal(app.getWorkspace().operating,null);
 await click(/Conferma contratti nella gestione/);assert.equal(app.getWorkspace().operating.assignments.length,3);
 await click(/^Modifica A1$/);field('amount').value='1800';await root.find(n=>n.dataset.form==='contract').fire('submit');
 const save2=root.find(n=>n.tag==='button'&&/^Salva scenario applicato/.test(n.textContent));await save2.parent.parent.fire('submit');assert.equal(app.getWorkspace().scenario.assignments.find(a=>a.id==='A1').amount,1800);assert.equal(app.getWorkspace().operating.assignments.find(a=>a.id==='A1').amount,1200);
});
test('RC196 errors never announce successful save or silently replace data with a demo',async()=>{
 const base=createCommercialDemoClient();const {root,app,field,form,click}=setup({client:async(op,v)=>{if(op==='add_movement')throw Error('version_conflict');return base(op,v);}});await app.setOwner('demo');const before=app.getWorkspace();await click(/^Movimenti$/);field('movementAmount').value='1';field('reference').value='REF';field('date').value='2027-01-10';field('movementPeriod').value='2027-01';field('kind').value='receipt';field('contractId').value='A1';await form('movement').fire('submit');assert.match(root.textContent,/altra sessione/);assert.deepEqual(app.getWorkspace(),before);assert.doesNotMatch(root.textContent,/Operazione salvata/);
});
test('RC196 logout while a read is pending cannot render previous owner data',async()=>{
 let resolveList;const {root,app}=setup({client:()=>new Promise(resolve=>resolveList=resolve)});const pending=app.setOwner('old-owner');await app.setOwner(null);resolveList({success:true,canWrite:true,workspaces:[{id:'private',name:'PRIVATE OLD OWNER'}]});await pending;assert.equal(app.getWorkspace(),null);assert.doesNotMatch(root.textContent,/PRIVATE OLD OWNER/);
});
test('RC196 CSV quotes delimiters and neutralises formula injection',()=>{
 const w=createCommercialWorkspaceDemo();w.name='=SUM(1;2)';w.ledger[0].reference='@formula';const csv=exportCommercialRegister(w);assert.match(csv,/"'=SUM\(1;2\)"/);assert.match(csv,/"'@formula"/);assert.match(csv,/1200.00/);assert.doesNotMatch(csv,/patient|guestName/);
});
test('RC196 CSV month scope matches the selected period while the full data copy keeps the archive',()=>{
 const w=createCommercialWorkspaceDemo();w.ledger.push({...w.ledger[0],id:'other-month',period:'2027-02',reference:'FEB-ONLY'});
 assert.doesNotMatch(exportCommercialRegister(w,{period:'2027-01'}),/FEB-ONLY/);assert.match(exportCommercialRegister(w),/FEB-ONLY/);
});
test('RC196 cloud save refuses un-applied contract drafts rather than reporting old values as saved',async()=>{
 const {root,app,field,click}=setup();await app.setOwner('demo');await click(/^Scenari$/);const before=app.getWorkspace();await click(/^Modifica A1$/);field('amount').value='999';await root.find(n=>n.dataset.form==='contract').fire('input');
 const save=root.find(n=>n.tag==='button'&&/^Salva scenario applicato/.test(n.textContent));await save.parent.parent.fire('submit');assert.deepEqual(app.getWorkspace(),before);assert.match(root.textContent,/prima di salvare/);
});
test('RC197 first workspace load opens Today; the editor preserves fictional provenance and does not claim the PMS is unavailable',async()=>{
 const {root,app,click}=setup();await app.setOwner('demo');assert.equal(app.getView(),'overview');assert.match(root.textContent,/Canoni contrattuali/);
 await click(/^Scenari$/);assert.match(root.textContent,/DATI DIMOSTRATIVI/);assert.match(root.textContent,/Scenario caricato nell’editor/);assert.doesNotMatch(root.textContent,/Non è ancora il PMS commerciale|Simulazione vuota pronta/);
 const planning=root.find(n=>n.id==='cm-operations');assert.equal(planning.hidden,true);
});
test('RC197 changing month preserves the calendar room instead of silently returning to R1',async()=>{
 const {root,app,field,click}=setup();await app.setOwner('demo');await click(/^Calendario$/);field('room').value='R2';await field('room').fire('change');assert.match(root.textContent,/P02/);
 field('period').value='3';await field('period').fire('change');assert.equal(field('room').value,'R2');assert.match(root.textContent,/2027-03/);assert.match(root.textContent,/P02/);assert.doesNotMatch(root.textContent,/Riservato · P01/);
});
