import test from 'node:test';
import assert from 'node:assert/strict';
import {parseBookingCSV,buildBookingImport,importAmount,importDate,BOOKING_IMPORT_TEMPLATE} from '../js/booking-import.js';
const options={propertyId:'p1',source:'airbnb',dateFormat:'dmy',numberFormat:'it'};
const csv=(...rows)=>'reference;guestName;checkin;checkout;guests;totalAmount;status;currency\n'+rows.join('\n');
const line=(ref='A',start='2026-10-01',end='2026-10-03',amount='300,00',status='confirmed')=>`${ref};Guest;${start};${end};2;${amount};${status};EUR`;
test('CSV template is usable with both number locales and maps all mandatory fields',()=>{
  for(const numberFormat of ['it','en']){const parsed=parseBookingCSV(BOOKING_IMPORT_TEMPLATE);const [row]=buildBookingImport(parsed,{...options,numberFormat});assert.deepEqual(row.errors,[]);assert.equal(row.data.totalAmount,300);assert.equal(row.data.nights,undefined);assert.equal(row.selected,true);}
});
test('CSV handles BOM, commas, quoted delimiters, quotes and embedded newlines',()=>{
  const input='\uFEFFreference,guestName,checkin,checkout,guests,totalAmount,status,currency\r\nA,"Guest, ""Example""\nName",2026-10-01,2026-10-03,2,"1,200.50",confirmed,EUR\r\n';
  const parsed=parseBookingCSV(input);assert.equal(parsed.delimiter,',');const [r]=buildBookingImport(parsed,{...options,numberFormat:'en'});assert.deepEqual(r.errors,[]);assert.equal(r.data.totalAmount,1200.5);assert.equal(r.data.guestName,'Guest, "Example"Name');
});
test('dates use explicit day/month choice, reject impossible days and preserve ISO',()=>{
  assert.equal(importDate('02/03/2026','dmy'),'2026-03-02');assert.equal(importDate('02/03/2026','mdy'),'2026-02-03');assert.equal(importDate('02/03/2026','iso'),null);assert.equal(importDate('31/02/2026','dmy'),null);assert.equal(importDate('2028-02-29'),'2028-02-29');assert.equal(importDate('2026-01-01T12:00:00Z'),null);
});
test('money distinguishes EUR totals, net payouts are not auto-mapped, and malformed values are refused',()=>{
  assert.equal(importAmount('€ 1.200,50','it'),1200.5);assert.equal(importAmount('1,200.50 EUR','en'),1200.5);
  for(const value of ['','-20','0','12.50','1.20,00','1e3','$300','=1+2','12,345'])assert.equal(importAmount(value,'it'),null,value);
  const p=parseBookingCSV('reference;guestName;checkin;checkout;guests;net payout\nA;Guest;2026-01-01;2026-01-02;2;250');assert.equal(p.mapping.totalAmount,null);assert.throws(()=>buildBookingImport(p,options),e=>e.code==='mapping_required');
});
test('invalid numeric guest counts, currency, amount and dates remain visible errors',()=>{
  const p=parseBookingCSV(csv('A;Guest;2026-02-30;2026-03-01;1.5;0;unknown;USD'));const [row]=buildBookingImport(p,options);for(const code of ['invalid_guests','invalid_currency','invalid_amount','invalid_dates','invalid_status'])assert.ok(row.errors.includes(code));assert.equal(row.selected,false);
});
test('guest count and stay status can only be filled from explicit fallbacks',()=>{
  const p=parseBookingCSV('reference;guestName;checkin;checkout;totalAmount\nA;Guest;2026-01-01;2026-01-02;100');assert.ok(buildBookingImport(p,options)[0].errors.includes('invalid_guests'));
  const [r]=buildBookingImport(p,{...options,defaultGuests:'3',defaultStatus:'completed'});assert.deepEqual(r.errors,[]);assert.equal(r.data.guests,3);assert.equal(r.data.status,'completed');
});
test('identical file rows skip duplicates and conflicting references invalidate both versions',()=>{
  let rows=buildBookingImport(parseBookingCSV(csv(line(),line())),options);assert.equal(rows[0].selected,true);assert.equal(rows[1].skip,'duplicate_file');
  rows=buildBookingImport(parseBookingCSV(csv(line(),line('A','2026-10-01','2026-10-04'))),options);assert.ok(rows.every(r=>r.errors.includes('reference_changed')&&!r.selected));
});
test('overlap is rejected, consecutive stays work, pending and cancellation are distinct',()=>{
  const rows=buildBookingImport(parseBookingCSV(csv(line('A'),line('B','2026-10-02','2026-10-05'),line('C','2026-10-03','2026-10-05'),line('D','2026-10-01','2026-10-04','200','pending'),line('E','2026-10-01','2026-10-05','200','cancelled'))),options);
  assert.equal(rows[0].selected,true);assert.ok(rows[1].errors.includes('conflict'));assert.equal(rows[2].selected,true);assert.equal(rows[3].data.status,'pending');assert.equal(rows[3].selected,true);assert.equal(rows[4].skip,'cancelled');
});
test('existing imported references reach authoritative API check while unrelated overlaps are blocked',()=>{
  const existing=[{propertyId:'p1',checkin:'2026-10-01',checkout:'2026-10-03',status:'arrival',importReference:{source:'airbnb',reference:'A'}}];
  const rows=buildBookingImport(parseBookingCSV(csv(line('A'),line('B'))),{...options,existing});assert.equal(rows[0].selected,true);assert.ok(rows[1].errors.includes('conflict'));
});
test('unknown columns never enter the booking payload',()=>{
  const p=parseBookingCSV(csv(line()).replace(';currency',';currency;passport').replace(';EUR',';EUR;SECRET-DOCUMENT'));
  const [r]=buildBookingImport(p,options);assert.deepEqual(r.errors,[]);assert.doesNotMatch(JSON.stringify(r.data),/passport|SECRET/);
});
test('bounded parser refuses malformed quotes, binary files, duplicate headers and excess rows',()=>{
  for(const input of ['a;b\n"unterminated;x','a;b\na"bad;b','a;a\n1;2','a;b\n1;\u0000'])assert.throws(()=>parseBookingCSV(input));
  assert.throws(()=>parseBookingCSV(csv(...Array.from({length:51},(_,i)=>line(String(i))))),e=>e.code==='too_many_rows');assert.throws(()=>parseBookingCSV('x'.repeat(512001)),e=>e.code==='file_too_large');
});
test('uneven columns are errors and references, names and amounts are not guessed',()=>{
  const [row]=buildBookingImport(parseBookingCSV(csv(';;2026-01-01;2026-01-02;2;100;confirmed;EUR;extra')),options);for(const code of ['column_count','invalid_reference','invalid_guest'])assert.ok(row.errors.includes(code));
});
