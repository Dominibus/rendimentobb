import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {propertyFinancialGuidanceHTML} from '../js/property-financial-guidance.js';
import {renovationRecoveryHTML} from '../js/renovation-payback.js';
import {performPMSOperation} from '../lib/pms-booking-service.js';
import {MemoryFirestore} from './helpers/pms-memory-firestore.js';

test('unlinked property guides both languages through owned simulation and existing-property linking', () => {
  for (const lang of ['it','en']) {
    const html = propertyFinancialGuidanceHTML('p1', lang);
    assert.match(html, /href="\/tool\/\?propertyMode=owned"/);
    assert.match(html, /data-property-id="p1"/);
    assert.match(html, /openPropertyEditor\(this.dataset.propertyId\)/);
    assert.match(html, lang === 'it' ? /senza crearne una seconda/ : /without creating a second/);
    assert.match(html, lang === 'it' ? /capitale di avvio zero/ : /zero startup capital/);
    assert.doesNotMatch(html, /openPropertyModal|addDoc|fetch\(/);
  }
});

test('property identifier cannot inject attributes into the linking action', () => {
  const html = propertyFinancialGuidanceHTML('p1" onclick="alert(1)<script>');
  assert.match(html, /p1&quot;/);
  assert.doesNotMatch(html, /<script>|onclick="alert/);
});

test('missing forecast explains source without substituting recorded booking revenue', () => {
  const property = {id:'p1',name:'House',renovationPlan:{items:[{actualCost:500}]},revenue:9000};
  for (const lang of ['it','en']) {
    const html = renovationRecoveryHTML([property], lang);
    assert.match(html, lang === 'it' ? /Collega una simulazione salvata/ : /Link a saved simulation/);
    assert.match(html, lang === 'it' ? /non equivalgono al cashflow netto/ : /is not net cash flow/);
    assert.doesNotMatch(html, /9[.,]000/);
    const linked = renovationRecoveryHTML([{...property,investmentSnapshot:{annualCashflow:2000}}], lang);
    assert.doesNotMatch(linked, lang === 'it' ? /Cashflow non disponibile\?/ : /Cash flow unavailable\?/);
  }
});

test('server refuses another paid account deleting an empty property and preserves all records', async () => {
  const db = new MemoryFirestore({'users/b':{plan:'pro'},'properties/p1':{uid:'a',name:'Test'},'analyses/a1':{uid:'a'}});
  const before = structuredClone([...db.documents]);
  await assert.rejects(performPMSOperation(db, {uid:'b',email:'b@example.invalid',email_verified:true}, {
    action:'host_booking',operation:'delete_property',propertyId:'p1',requestId:randomUUID()
  }, {now:100000,timestamp:()=>'test'}), error => error.code === 'forbidden');
  assert.deepEqual([...db.documents], before);
});

test('server refuses another paid account deleting a booking and preserves its owner and property', async () => {
  const db = new MemoryFirestore({'users/b':{plan:'pro'},'properties/p1':{uid:'a'},'bookings/booking1':{uid:'a',propertyId:'p1',_pmsVersion:1}});
  const before = structuredClone([...db.documents]);
  await assert.rejects(performPMSOperation(db, {uid:'b',email:'b@example.invalid',email_verified:true}, {
    action:'host_booking',operation:'delete',bookingId:'booking1',expectedVersion:1,requestId:randomUUID()
  }, {now:100000,timestamp:()=>'test'}), error => error.code === 'forbidden');
  assert.deepEqual([...db.documents], before);
});
