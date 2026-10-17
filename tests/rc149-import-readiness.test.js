import test from 'node:test';
import assert from 'node:assert/strict';
import {bookingImportContext} from '../js/booking-import.js';
const fixture={userUid:'owner',authUid:'owner',allowed:true,snapshot:{ownerUid:'owner',isDemo:false,portalSnapshotReady:true,propertyList:[{id:'p1',name:'Example'}]}};
test('opening filtered bookings invalidates reports but does not block importing to owned properties',()=>{
  const before=bookingImportContext(fixture);
  const after=bookingImportContext({...fixture,snapshot:{...fixture.snapshot,portalSnapshotReady:false,bookingList:[{propertyId:'p1'}]}});
  assert.equal(before.ready,true);assert.equal(after.ready,true);assert.deepEqual(after.properties,before.properties);
});
test('report independence never bypasses identity, entitlement, demo or missing property ownership',()=>{
  for(const patch of [{userUid:null},{authUid:'other'},{allowed:false},{demo:true},{snapshot:{...fixture.snapshot,ownerUid:'other'}},{snapshot:{...fixture.snapshot,isDemo:true}},{snapshot:{ownerUid:'owner'}}]){
    const context=bookingImportContext({...fixture,...patch});assert.equal(context.ready,false);assert.deepEqual(context.properties,[]);
  }
});
