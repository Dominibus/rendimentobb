import test from 'node:test';import assert from 'node:assert/strict';
import {saveLinkedProperty,saveUnlinkedProperty} from '../js/property-analysis-link.js';
const ref=(kind,id)=>({id,key:kind+'/'+id});
function memory(seed){const rows=new Map(Object.entries(seed)),versions=new Map();return {rows,async runTransaction(callback){for(let attempt=0;attempt<10;attempt++){const reads=new Map(),writes=[];const result=await callback({get:async r=>{reads.set(r.key,versions.get(r.key)||0);const value=rows.get(r.key);return {exists:()=>value!==undefined,data:()=>structuredClone(value)};},set:(r,d,options)=>writes.push([r,d,options?.merge]),update:(r,d)=>writes.push([r,d,true])});if([...reads].some(([k,v])=>(versions.get(k)||0)!==v))continue;for(const [r,d,merge]of writes){rows.set(r.key,{...(merge?rows.get(r.key):{}),...d});versions.set(r.key,(versions.get(r.key)||0)+1);}return result;}throw Error('conflict');}};}
const save=(db,pid,aid='a1',uid='u1')=>saveLinkedProperty({runTransaction:fn=>db.runTransaction(fn),propertyRef:ref('properties',pid),analysisRef:ref('analyses',aid),analysisRefForId:id=>ref('analyses',id),uid,propertyData:{uid,name:pid,analysisId:aid},isNewProperty:!db.rows.has('properties/'+pid)});
test('simultaneous property creation claims one analysis once and leaves no orphan',async()=>{const db=memory({'analyses/a1':{uid:'u1',propertyId:null}});const outcomes=await Promise.allSettled([save(db,'p1'),save(db,'p2')]);assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1);assert.equal([...db.rows.keys()].filter(x=>x.startsWith('properties/')).length,1);const pid=db.rows.get('analyses/a1').propertyId;assert.equal(db.rows.get('properties/'+pid).analysisId,'a1');});
test('switching property analysis unlinks its previous owned analysis atomically',async()=>{const db=memory({'analyses/a1':{uid:'u1',propertyId:'p1'},'analyses/a2':{uid:'u1',propertyId:null},'properties/p1':{uid:'u1',analysisId:'a1'}});await save(db,'p1','a2');assert.equal(db.rows.get('analyses/a1').propertyId,null);assert.equal(db.rows.get('analyses/a2').propertyId,'p1');assert.equal(db.rows.get('properties/p1').analysisId,'a2');});
test('other account and nonexistent analyses do not create properties',async()=>{for(const seed of [{},{'analyses/a1':{uid:'u2'}}]){const db=memory(seed);await assert.rejects(save(db,'p1'));assert.equal(db.rows.has('properties/p1'),false);}});


test('concurrent unlink and replacement cannot leave an analysis pointing at an unlinked property',async()=>{
 const db=memory({'analyses/a1':{uid:'u1',propertyId:'p1',isPortfolio:true},'analyses/a2':{uid:'u1',propertyId:null},'properties/p1':{uid:'u1',analysisId:'a1'}});
 await Promise.all([save(db,'p1','a2'),saveUnlinkedProperty({runTransaction:fn=>db.runTransaction(fn),propertyRef:ref('properties','p1'),analysisRefForId:id=>ref('analyses',id),uid:'u1',propertyData:{uid:'u1',name:'p1',analysisId:null,investmentSnapshot:null}})]);
 assert.equal(db.rows.get('analyses/a1').propertyId,null);const aid=db.rows.get('properties/p1').analysisId;
 assert.equal(db.rows.get('analyses/a2').propertyId,aid==='a2'?'p1':null);
});
