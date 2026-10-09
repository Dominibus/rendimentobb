import test from 'node:test';
import assert from 'node:assert/strict';
import {scanFunnelDocuments} from '../lib/funnel-scan.js';

function database(ids) {
  const calls=[];
  const make=(after='',limit=Infinity)=>({
    orderBy:key=>{assert.equal(key,'__name__');return make(after,limit);},
    limit:n=>make(after,n),
    startAfter:id=>make(id,limit),
    get:async()=>{calls.push({after,limit});return {docs:ids.filter(id=>id>after).sort().slice(0,limit).map(id=>({id}))};}
  });
  return {calls,collection:name=>{assert.equal(name,'email_funnel');return make();}};
}
async function collect(options){const ids=[];for await(const doc of scanFunnelDocuments(options))ids.push(doc.id);return ids;}

test('funnel scan bounds reads, resumes the next batch and wraps only at collection end',async()=>{
  const db=database(['e','a','d','b','c']),state={cursor:''};
  assert.deepEqual(await collect({db,state,deadline:100,clock:()=>0,pageSize:2,maxPages:1}),['a','b']);
  assert.equal(state.cursor,'b');assert.equal(state.hasMore,true);
  assert.deepEqual(await collect({db,state,deadline:100,clock:()=>0,pageSize:2,maxPages:1}),['c','d']);
  assert.equal(state.cursor,'d');
  assert.deepEqual(await collect({db,state,deadline:100,clock:()=>0,pageSize:2,maxPages:1}),['e']);
  assert.equal(state.cursor,'');assert.equal(state.hasMore,false);
  assert.ok(db.calls.every(call=>call.limit===3));
});
test('interruption during a record preserves the prior cursor so the unfinished record is revisited',async()=>{
  const db=database(['a','b','c']),state={cursor:''};
  for await(const doc of scanFunnelDocuments({db,state,deadline:100,clock:()=>0,pageSize:2}))if(doc.id==='b')break;
  assert.equal(state.cursor,'a');assert.equal(state.hasMore,true);
  assert.deepEqual(await collect({db,state,deadline:100,clock:()=>0,pageSize:2}),['b','c']);
});
test('budget expiry between records preserves acknowledged progress and performs no further query',async()=>{
  const db=database(['a','b','c']),state={cursor:''};let now=0;
  for await(const doc of scanFunnelDocuments({db,state,deadline:100,clock:()=>now,pageSize:2})){
    assert.equal(doc.id,'a');now=100;
  }
  assert.equal(state.cursor,'a');assert.equal(state.budgetExhausted,true);assert.equal(db.calls.length,1);
});
test('already expired budget does not read collection or reset an existing cursor',async()=>{
  const db=database(['a','b']),state={cursor:'a'};
  assert.deepEqual(await collect({db,state,deadline:100,clock:()=>100}),[]);
  assert.equal(state.cursor,'a');assert.equal(state.hasMore,true);assert.equal(db.calls.length,0);
});
test('deleted cursor document still resumes lexically; an empty tail resets for the next cycle',async()=>{
  const db=database(['a','c']),state={cursor:'b'};
  assert.deepEqual(await collect({db,state,deadline:100,clock:()=>0}),['c']);
  state.cursor='z';assert.deepEqual(await collect({db,state,deadline:100,clock:()=>0}),[]);
  assert.equal(state.cursor,'');assert.equal(state.hasMore,false);
});
