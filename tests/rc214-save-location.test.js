import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
const start=source.indexOf('async function saveAnalysis(data){');
const body=source.slice(start,source.indexOf('// 🔒 LOCK OVERLAY',start));
async function save(data,{current='roma',session='milano',local='firenze',field=''}={}){
 let written;
 const c={window:{currentLang:'it',currentUser:{uid:'test'},firebaseReady:true,getUserAccess:()=>({isPaid:true}),dispatchEvent(){},currentCity:current},document:{getElementById:id=>id==='custom-location'?{value:field}:null,addEventListener(){}},sessionStorage:{getItem:()=>session},localStorage:{getItem:()=>local},readInvestmentAssumptions:()=>null,collection:()=>({}),db:{},addDoc:async(ref,value)=>{written=value;},serverTimestamp:()=>0,Event:class{},console:{error(){}}};
 vm.createContext(c);vm.runInContext(body,c);assert.equal(await c.saveAnalysis(data),true);return written;
}
test('explicit empty location is authoritative despite stale browser cities',async()=>{
 const r=await save({marketCity:'',realCity:'',propertyPrice:171300,net:3581.039125997697});
 assert.equal(r.marketCity,'');assert.equal(r.realCity,'');assert.equal(r.propertyPrice,171300);assert.equal(r.net,3581.039125997697);
});
test('explicit selected city is saved unchanged',async()=>{
 const r=await save({marketCity:'napoli',realCity:'Napoli (NA)'});assert.equal(r.marketCity,'napoli');assert.equal(r.realCity,'Napoli (NA)');
});
test('explicit blank real city does not inherit a previous market context',async()=>{
 const r=await save({marketCity:'',realCity:''},{field:'Previous city'});assert.equal(r.realCity,'');
});
test('legacy callers without location fields retain their documented fallback',async()=>{
 const r=await save({});assert.equal(r.marketCity,'roma');assert.equal(r.realCity,'roma');
});
