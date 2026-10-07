import test from 'node:test';
import assert from 'node:assert/strict';
import '../js/account-report-cache.js';
const storage = () => { const values = new Map(); return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)}; };
const cache = globalThis.RBReportCache;
test('report belongs to its account and never carries over to another account',()=>{
  const session=storage(), local=storage();
  local.setItem('rb_simulations','old unowned data');
  cache.write('pro-A',[{roi:13}],{pms:{bookings:8}},session,local);
  assert.equal(cache.read('pro-A',session,local).context.pms.bookings,8);
  assert.equal(local.getItem('rb_simulations'),null);
  assert.equal(cache.read('free-B',session,local),null);
  assert.equal(cache.read('pro-A',session,local),null);
});
test('logout, malformed data and expired handoffs fail closed',()=>{
  const session=storage(),local=storage();
  cache.write('A',[{roi:26}],{},session,local);
  cache.sync(null,session,local);
  assert.equal(cache.read('A',session,local),null);
  session.setItem('rb_owned_report_v1','broken JSON');
  assert.equal(cache.read('A',session,local),null);
  session.setItem('rb_owned_report_v1',JSON.stringify({ownerUid:'A',createdAt:Date.now()-3600001,simulations:[]}));
  assert.equal(cache.read('A',session,local),null);
});
