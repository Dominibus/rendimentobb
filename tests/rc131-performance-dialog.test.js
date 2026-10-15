import test from 'node:test';import assert from 'node:assert/strict';
import {showPropertyPerformance} from '../js/property-performance-dialog.js';
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.style={};this.value='';this.listeners={};this.attributes={};}
 appendChild(n){n.parentElement=this;this.children.push(n);if(this.tag==='select'&&this.children.length===1)this.value=n.value;return n;}
 setAttribute(k,v){this.attributes[k]=v;}replaceChildren(){this.children=[];}addEventListener(k,v){this.listeners[k]=v;}removeEventListener(k){delete this.listeners[k];}
 showModal(){this.open=true;}close(){this.open=false;this.listeners.close?.();}remove(){this.removed=true;}
 set innerHTML(v){throw Error('Unsafe HTML write');}
 get text(){return [this.textContent||'',...this.children.map(n=>n.text)].join(' ');}
 click(){this.onclick?.();}
}
function dom(){const body=new Element('body');const walk=n=>[n,...n.children.flatMap(walk)];const d={body,createElement:tag=>new Element(tag),getElementById:id=>walk(body).find(n=>n.id===id&&!n.removed),listeners:{},addEventListener(k,v){this.listeners[k]=v;},removeEventListener(k){delete this.listeners[k];}};return {d,walk:()=>walk(body)};}
const snapshot={ownerUid:'owner',portalSnapshotReady:true,isDemo:false,propertyList:[{id:'a',name:'=Casa <img src=x onerror=alert(1)>',analysisId:'aa'},{id:'b',name:'Villa B'}],portalBookingList:[{propertyId:'a',guestName:'PRIVATE GUEST',checkin:'2026-09-01',checkout:'2026-09-11',totalAmount:1200,status:'completed'},{propertyId:'b',checkin:'2026-09-15',checkout:'2026-09-20',totalAmount:800,status:'completed'}]};
const analyses=[{id:'aa',uid:'owner',propertyId:'a',gross:36500}];
test('dialog uses safe text, switches scope/period and exports private-data-free formula-safe CSV',async()=>{
 const old=globalThis.document,oldURL=URL.createObjectURL,oldRevoke=URL.revokeObjectURL;const {d,walk}=dom();globalThis.document=d;let blob,permit=true,edited=null,unsubscribed=0;
 URL.createObjectURL=b=>{blob=b;return 'blob:test';};URL.revokeObjectURL=()=>{};
 try{
  const modal=showPropertyPerformance({snapshot,analyses,ownerUid:'owner',allowed:()=>permit,jsPDF:null,lang:'it',onEdit:id=>edited=id,subscribeAuth:()=>()=>unsubscribed++});
  const get=id=>d.getElementById(id),button=text=>walk().find(n=>n.tag==='button'&&n.textContent===text);
  get('performance-month').value='2026-09';get('performance-month').onchange();
  assert.match(modal.text,/(?:2\.000|2000) EUR/);assert.ok(modal.text.includes('<img src=x'));assert.ok(!modal.text.includes('PRIVATE GUEST'));assert.equal(button('Scarica PDF').disabled,true);
  get('performance-mode').value='quarter';get('performance-mode').onchange();assert.ok(modal.text.includes('2026-07-01 / 2026-09-30'));
  get('performance-mode').value='custom';get('performance-mode').onchange();assert.equal(button('Esporta CSV').disabled,true);
  get('performance-start').value='2026-09-01';get('performance-end').value='2026-09-30';get('performance-end').onchange();assert.equal(button('Esporta CSV').disabled,false);
  button('Esporta CSV').click();const text=await blob.text();assert.ok(text.includes("'"+'=Casa'));assert.ok(!text.includes('PRIVATE GUEST'));assert.ok(text.includes('expected_revenue_eur'));
  get('performance-scope').value='a';get('performance-scope').onchange();assert.match(modal.text,/(?:1\.200|1200) EUR/);assert.ok(!modal.children.at(-1).text.includes('Villa B'));
  permit=false;blob=null;button('Esporta CSV').click();assert.equal(blob,null);d.listeners.rb_auth_ready();assert.equal(modal.removed,true);assert.equal(unsubscribed,1);assert.equal(edited,null);
 }finally{globalThis.document=old;URL.createObjectURL=oldURL;URL.revokeObjectURL=oldRevoke;}
});
test('English labels and edit use the exact selected property ID',()=>{
 const old=globalThis.document;const {d,walk}=dom();globalThis.document=d;let edited;
 try{showPropertyPerformance({snapshot,analyses,ownerUid:'owner',propertyId:'a',allowed:()=>true,lang:'en',onEdit:id=>edited=id});assert.ok(d.body.text.includes('Property and portfolio performance'));walk().find(n=>n.tag==='button'&&n.textContent==='Link / edit property').click();assert.equal(edited,'a');}finally{globalThis.document=old;}
});
