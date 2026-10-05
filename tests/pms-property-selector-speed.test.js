import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');
const a=source.indexOf('window.loadBookingPropertyOptions =');const code=source.slice(a,source.indexOf('window.changeBookingProperty',a));
function harness(){let reads=0;const select={style:{}};const field={style:{}};const w={currentUser:{uid:'host'},currentPropertyId:'p1',currentPropertyData:{name:'Residenza',city:'Roma'},t:x=>x};const ctx={window:w,document:{getElementById:id=>id==='booking-property'?select:field},escapeDashboardHTML:x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),db:{},collection:()=>{},where:()=>{},query:()=>{},getDocs:async()=>{reads++;return {empty:false,docs:[{id:'p1',data:()=>w.currentPropertyData},{id:'p2',data:()=>({name:'Castello'})}]};},dashboardError:()=>{}};vm.createContext(ctx);vm.runInContext(code,ctx);return {w,select,reads:()=>reads};}
test('locked booking property reuses the property loaded for tax without another network query',async()=>{const h=harness();await h.w.loadBookingPropertyOptions('p1',false);assert.equal(h.reads(),0);assert.equal(h.select.disabled,true);assert.equal(h.select.value,'p1');assert.match(h.select.innerHTML,/Residenza · Roma/);});
test('editable new booking still loads all available properties',async()=>{const h=harness();await h.w.loadBookingPropertyOptions('p1',true);assert.equal(h.reads(),1);assert.equal(h.select.disabled,false);assert.match(h.select.innerHTML,/Castello/);});
test('different property cannot reuse previous structure data',async()=>{const h=harness();await h.w.loadBookingPropertyOptions('p2',false);assert.equal(h.reads(),1);assert.equal(h.select.value,'p2');});
test('property labels and identifiers remain escaped in the fast path',async()=>{const h=harness();h.w.currentPropertyData={name:'<Casa>',city:'Roma'};await h.w.loadBookingPropertyOptions('p1',false);assert.match(h.select.innerHTML,/&lt;Casa>/);});
