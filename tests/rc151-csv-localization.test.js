import test from 'node:test';
import assert from 'node:assert/strict';
import {bookingImportTemplate,parseBookingCSV,buildBookingImport,isExampleBooking,IMPORT_FIELDS} from '../js/booking-import.js';
import {performanceCSV,csvCell} from '../js/report-csv.js';
const fixture={generatedAt:'2026-10-18T13:00:00Z',period:{start:'2026-09-01',end:'2026-10-01'},performance:{includesCurrentOrFuture:false,rows:[{id:'stable-id',name:'Villa Test',revenue:2010.5,expectedRevenue:3150,revenueDeltaPercent:-36.1746,nights:18,occupancy:60,adr:111.69,revpar:67.02,expectedOccupancy:70,expectedADR:150,linkState:'linked',missingPeriodAmounts:0,overlapNights:0}]}};
for(const lang of ['it','en'])test('localized booking template maps every column and preserves the booking: '+lang,()=>{
 const parsed=parseBookingCSV('\uFEFF'+bookingImportTemplate(lang));
 assert.deepEqual(IMPORT_FIELDS.map(f=>parsed.mapping[f]),[0,1,2,3,4,5,6,7]);
 for(const numberFormat of ['it','en']){
  const [row]=buildBookingImport(parsed,{propertyId:'test-property',source:'direct',numberFormat});
  assert.deepEqual(row.errors,[]);assert.equal(row.data.totalAmount,300);assert.equal(row.data.checkin,'2027-01-10');assert.equal(row.data.checkout,'2027-01-12');assert.equal(row.data.status,'arrival');assert.equal(isExampleBooking(row),true);
 }
 assert.match(bookingImportTemplate(lang),lang==='it'?/Nome ospite.*Data arrivo/:/Guest name.*Check-in/);
 assert.match(bookingImportTemplate(lang),lang==='it'?/Ospite di esempio.*confermata/:/Example guest.*confirmed/);
});
test('existing Italian external headers and legacy English exports remain supported',()=>{
 const csv='riferimento;nome ospite;data arrivo;data partenza;numero ospiti;totale soggiorno;stato;valuta\nREAL-1;Nome Reale;18/10/2026;20/10/2026;2;1.200,50;completata;EUR';
 const [row]=buildBookingImport(parseBookingCSV(csv),{propertyId:'p1',dateFormat:'dmy',numberFormat:'it'});assert.deepEqual(row.errors,[]);assert.equal(row.data.totalAmount,1200.5);assert.equal(row.data.guestName,'Nome Reale');assert.equal(row.data.status,'completed');
});
test('performance CSV localizes columns, decimals and meaning without changing identity or dates',()=>{
 const it=performanceCSV(fixture,'it'),en=performanceCSV(fixture,'en');
 assert.match(it,/"ID immobile";"Immobile";"Inizio periodo incluso"/);assert.match(it,/"2010,5";"3150";"-36,1746"/);assert.match(it,/"Collegata"/);assert.match(it,/"Ricavi prenotati";"Chiuso"/);
 assert.match(en,/"Property ID";"Property";"Period start inclusive"/);assert.match(en,/"2010.5";"3150";"-36.1746"/);assert.match(en,/"Linked"/);assert.match(en,/"Booked revenue";"Closed"/);
 for(const csv of [it,en])assert.match(csv,/"stable-id";"Villa Test";"2026-09-01";"2026-10-01"/);
 assert.equal(csvCell(-36.1746,'it'),'"-36,1746"');assert.equal(csvCell('=SUM(A1:A2)','it'),'"\'=SUM(A1:A2)"');
});
test('all localized and historical performance exports are refused by booking import',()=>{
 for(const lang of [undefined,'it','en'])assert.throws(()=>parseBookingCSV(performanceCSV(fixture,lang)),e=>e.code==='performance_summary');
});
test('every real link state and open period has an explicit localized label',()=>{
 const report=structuredClone(fixture);report.performance.includesCurrentOrFuture=true;
 for(const [state,it,en] of [['unlinked','Non collegata','Not linked'],['unavailable','Analisi non disponibile','Analysis unavailable'],['inconsistent','Collegamento incoerente','Inconsistent link']]){
  report.performance.rows[0].linkState=state;assert.ok(performanceCSV(report,'it').includes('"'+it+'"'));assert.ok(performanceCSV(report,'en').includes('"'+en+'"'));
 }
 assert.match(performanceCSV(report,'it'),/"In corso o futuro"/);assert.match(performanceCSV(report,'en'),/"Current or future"/);
});
