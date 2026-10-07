import {readInvestmentAssumptions} from '../js/investment-assumptions.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../js/app.js', import.meta.url), 'utf8');
const start = source.indexOf('async function saveAnalysis(data){');
const fn = source.slice(start, source.indexOf('// 🔒 LOCK OVERLAY', start)).replace(/\/\/ =+\s*$/, '');

test('Free analysis does not write Firestore or leave a saving lock', async () => {
  let writes = 0;
  const c = { readInvestmentAssumptions, window: { getUserAccess: () => ({ isPaid: false }), firebaseReady: true, currentUser: { uid: 'free' } },
    addDoc: async () => writes++, console };
  vm.createContext(c); vm.runInContext(fn, c);
  await c.saveAnalysis({ roi: -0.9 });
  assert.equal(writes, 0); assert.equal(c.window.__savingAnalysis, undefined);
});
test('paid analysis still persists and clears the saving lock', async () => {
  const writes = [];
  const c = { readInvestmentAssumptions, window: { getUserAccess: () => ({ isPaid: true }), firebaseReady: true, currentUser: { uid: 'investor' } },
    addDoc: async (ref, data) => writes.push(data), collection: () => ({}), db: {},
    sessionStorage: { getItem: () => null }, localStorage: { getItem: () => null },
    document: { getElementById: () => null }, serverTimestamp: () => 'test-time',
    Event: class { constructor(type) { this.type = type; } }, console };
  c.window.dispatchEvent = () => {};
  vm.createContext(c); vm.runInContext(fn, c);
  await c.saveAnalysis({ roi: -0.9, equity: 30000, realCity: 'Roma' });
  assert.equal(writes.length, 1); assert.equal(writes[0].uid, 'investor');
  assert.equal(writes[0].roi, -0.9); assert.equal(c.window.__savingAnalysis, false);
});
