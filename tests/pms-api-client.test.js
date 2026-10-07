import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {createPMSApiClient} from '../js/pms-api-client.js';
const user={uid:'u1',getIdToken:async()=> 'id-token'};
function storage(){const map=new Map();return {map,getItem:key=>map.get(key),setItem:(key,value)=>map.set(key,value),removeItem:key=>map.delete(key)};}
const reply=(body,status=200)=>({ok:status>=200 && status<300,status,json:async()=>body});
test('client sends authenticated host action to the existing endpoint',async()=>{
  let sent;
  const mutate=createPMSApiClient({getUser:()=>user,cryptoImpl:webcrypto,fetchImpl:async(url,request)=>{sent={url,...request};return reply({success:true,bookingId:'b1'});}});
  assert.equal((await mutate('save',{data:{propertyId:'p1'}})).bookingId,'b1');
  assert.equal(sent.url,'/api/guest-report');assert.equal(sent.headers.Authorization,'Bearer id-token');assert.equal(JSON.parse(sent.body).action,'host_booking');
});
test('uncertain result and retry keep request ID even after client recreation',async()=>{
  const saved=storage(),ids=[];
  const first=createPMSApiClient({getUser:()=>user,cryptoImpl:webcrypto,storage:saved,fetchImpl:async(url,req)=>{ids.push(JSON.parse(req.body).requestId);throw Error('lost-response');}});
  await assert.rejects(first('save',{data:{propertyId:'p1',guestName:'Private Guest'}}),error=>error.code==='booking/write_uncertain');
  assert.equal([...saved.map.values()][0].includes('Private Guest'),false);
  const second=createPMSApiClient({getUser:()=>user,cryptoImpl:webcrypto,storage:saved,fetchImpl:async(url,req)=>{ids.push(JSON.parse(req.body).requestId);return reply({success:true,bookingId:'b1',duplicate:true});}});
  await second('save',{data:{propertyId:'p1',guestName:'Private Guest'}});assert.equal(ids[0],ids[1]);assert.equal(saved.map.size,0);
});
test('changed form produces another request ID instead of reusing old payload identity',async()=>{
  const ids=[];const mutate=createPMSApiClient({getUser:()=>user,cryptoImpl:webcrypto,fetchImpl:async(url,req)=>{ids.push(JSON.parse(req.body).requestId);throw Error('offline');}});
  await assert.rejects(mutate('save',{data:{totalAmount:300}}));await assert.rejects(mutate('save',{data:{totalAmount:350}}));assert.notEqual(ids[0],ids[1]);
});
test('unauthenticated client never sends a request',async()=>{
  let calls=0;const mutate=createPMSApiClient({getUser:()=>null,cryptoImpl:webcrypto,fetchImpl:async()=>calls++});
  await assert.rejects(mutate('save',{}),error=>error.code==='booking/unauthorized');assert.equal(calls,0);
});
test('server errors remain actionable, without claiming success',async()=>{
  const mutate=createPMSApiClient({getUser:()=>user,cryptoImpl:webcrypto,fetchImpl:async()=>reply({success:false,error:'conflict'},409)});
  await assert.rejects(mutate('save',{}),error=>error.code==='booking/conflict');
});
test('blocked storage does not prevent an authenticated mutation',async()=>{
  const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');},removeItem(){throw Error('blocked');}};
  const mutate=createPMSApiClient({getUser:()=>user,cryptoImpl:webcrypto,storage:blocked,fetchImpl:async()=>reply({success:true})});assert.equal((await mutate('cancel',{bookingId:'b1'})).success,true);
});
test('user change cannot reuse previous account request identity',async()=>{
  let current=user;const ids=[];
  const mutate=createPMSApiClient({getUser:()=>current,cryptoImpl:webcrypto,fetchImpl:async(url,req)=>{ids.push(JSON.parse(req.body).requestId);throw Error('offline');}});
  await assert.rejects(mutate('save',{}));current={...user,uid:'u2'};await assert.rejects(mutate('save',{}));assert.notEqual(ids[0],ids[1]);
});
