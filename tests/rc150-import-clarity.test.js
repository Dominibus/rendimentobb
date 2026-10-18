import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {parseBookingCSV,bookingCSVKind,isExampleBooking,buildBookingImport,BOOKING_IMPORT_TEMPLATE} from '../js/booking-import.js';
const headers=['property_id','period_start_inclusive','period_end_exclusive','recorded_booking_revenue_eur','booked_nights'];
test('own performance totals cannot be reimported as individual bookings',()=>{
  assert.equal(bookingCSVKind(headers),'performance_summary');
  for(const separator of [',',';','\t']){
    const csv='\uFEFF'+headers.map(h=>'"'+h.toUpperCase()+'"').join(separator)+'\n'+['p1','2026-10-01','2026-11-01','300','2'].join(separator);
    assert.throws(()=>parseBookingCSV(csv),e=>e.code==='performance_summary');
  }
});
test('property id alone does not misclassify a real booking export',()=>{
  assert.equal(bookingCSVKind(['property_id','reference','checkin','checkout']),'booking_rows');
  assert.equal(bookingCSVKind([]),'booking_rows');
  assert.ok(parseBookingCSV(BOOKING_IMPORT_TEMPLATE).rows.length);
});
test('only unchanged demo reference and guest trigger the example warning',()=>{
  const [row]=buildBookingImport(parseBookingCSV(BOOKING_IMPORT_TEMPLATE),{propertyId:'p1',source:'direct',numberFormat:'en'});
  assert.equal(isExampleBooking(row),true);
  assert.equal(isExampleBooking({...row,reference:'REAL-001'}),false);
  assert.equal(isExampleBooking({...row,data:{...row.data,guestName:'Real guest'}}),false);
  assert.equal(isExampleBooking(null),false);
});
function guide(){const window={};vm.runInNewContext(readFileSync(new URL('../js/chatbot/core/pro-report-guide.js',import.meta.url),'utf8'),{window});return window.rbBuildBookingImportGuide;}
for(const question of ['Posso importare il CSV di Andamento immobile per creare le prenotazioni?','Can I import the property performance CSV as bookings?'])test('summary guidance explicitly refuses reconstruction: '+question,()=>{
  const r=guide()(question);assert.equal(r.metadata.mode,'booking_import_summary');assert.match(r.textIT,/non singole prenotazioni/);assert.match(r.textEN,/cannot reconstruct/);assert.equal(r.actions.length,0);
});
for(const question of ['Il modello CSV scaricato ha dati generici, perché?','Does the CSV template download my property data?'])test('template guidance explains the fictional booking: '+question,()=>{
  const r=guide()(question);assert.equal(r.metadata.mode,'booking_import_template');assert.match(r.textIT,/fittizia/);assert.match(r.textEN,/same for every property/);assert.equal(r.actions.length,0);
});
test('explicit PDF interpretation keeps priority over CSV guidance',()=>{
  assert.equal(guide()('Spiegami il PDF del report CSV importato'),null);
});
