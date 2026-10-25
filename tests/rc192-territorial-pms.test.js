import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {territorialCity,validateTerritorialData,exactTerritorialSegment,territorialSummary,SEGMENT_FIELDS,loadTerritorialCity,territorialCSV} from '../js/territorial-benchmarks.js';
import {createDemoBookings,updateDemoBooking} from '../js/pms-product-demo-model.js';
import {normalizeBookingInput} from '../lib/pms-booking-service.js';
import {evaluateAvailability} from '../js/pms-availability.js';
import {buildPMSOperationalReport} from '../js/pms-operational-report.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const catalog=JSON.parse(read('data/territorial/catalog.json'));
for(const info of catalog.cities)test('RC192 source-derived dataset validated: '+info.key,()=>{
 const data=validateTerritorialData(JSON.parse(read('data/territorial/'+info.key+'.json')),info.key);
 assert.equal(data.city.sha256,info.sha256);assert.equal(data.city.sourceRows,data.city.eligibleRows+Object.values(data.city.excluded).reduce((a,b)=>a+b,0));assert.equal(data.rows.length,data.city.segments);
 assert.equal(data.rows.filter(r=>r[6]!==null).length,data.city.publishedSegments);
 assert.ok(data.city.eligibleRows>1000);assert.ok(data.city.publishedSegments>50);
 for(const row of data.rows){
  const selection=Object.fromEntries(SEGMENT_FIELDS.map((f,i)=>[f,row[i]]));assert.equal(exactTerritorialSegment([row],selection),row);
  const s=territorialSummary(data,row,Date.parse('2026-10-23T12:00:00Z'));
  assert.equal(s.occupancy,null);assert.equal(s.adr,null);assert.equal(s.roi,null);assert.equal(s.verifiedBookings,false);
  if(row[6]===null){assert.equal(s.status,'insufficient_sample');assert.equal(s.median,null);}
  else{assert.equal(s.status,'available');assert.equal(s.median,row[8]);assert.equal(s.currency,'EUR');}
 }
 assert.doesNotMatch(read('data/territorial/'+info.key+'.json'),/host_name|listing_url|host_id|latitude|longitude|estimated_occupancy|estimated_revenue/);
});
test('RC192 filters are exact and never silently widen an absent segment',()=>{
 const data=JSON.parse(read('data/territorial/napoli.json')),row=data.rows.find(r=>r[6]!==null),selection=Object.fromEntries(SEGMENT_FIELDS.map((f,i)=>[f,row[i]]));
 for(const field of SEGMENT_FIELDS)assert.equal(exactTerritorialSegment([row],{...selection,[field]:'absent'}),null,field);
 assert.equal(territorialSummary(data,null).status,'no_match');
 assert.equal(territorialCity('Rome'),'roma');for(const value of ['Pisa','',null,'toString','../../secret'])assert.equal(territorialCity(value),null);
});
test('RC192 source cache failures are retryable and requests stay same origin without credentials',async()=>{
 let calls=0;const data=JSON.parse(read('data/territorial/roma.json'));
 const fetcher=async(url,options)=>{calls++;assert.equal(url,'/data/territorial/roma.json?v=20261023-rc192');assert.equal(options.credentials,'omit');if(calls===1)throw Error('network');return {ok:true,json:async()=>data};};
 await assert.rejects(loadTerritorialCity('roma',{fetcher}),/network/);
 assert.equal(await loadTerritorialCity('roma',{fetcher}),data);assert.equal(await loadTerritorialCity('Rome',{fetcher}),data);assert.equal(calls,2);
 await assert.rejects(loadTerritorialCity('unknown',{fetcher}),/CITY_NOT_COVERED/);assert.equal(calls,2);
});
test('RC192 malformed/sparse figures fail closed; old snapshots are marked historical',()=>{
 const original=JSON.parse(read('data/territorial/napoli.json'));
 for(const mutate of [d=>d.rows[0][6]=9,d=>d.rows[0][8]=Infinity,d=>d.city.url='javascript:alert(1)',d=>d.methodVersion='unknown',d=>d.rows[0][3]=2.5]){const d=structuredClone(original);mutate(d);assert.throws(()=>validateTerritorialData(d,'napoli'));}
 const row=original.rows.find(r=>r[6]!==null);assert.equal(territorialSummary(original,row,Date.parse('2028-01-01T12:00:00Z')).stale,true);
});
const demoValues=b=>({status:b.status,totalAmount:b.totalAmount,documentsReceived:b.guestRegistration.documentsReceived,authorityStatus:b.guestRegistration.authorityStatus,taxableGuests:b.touristTax.taxableGuests??b.guests,taxStatus:b.touristTax.status,cleaningStatus:b.cleaning.status,issueStatus:b.guestIssue.status??'open'});
test('RC192 demo matches production refusal to declare reporting submitted with missing documents',()=>{
 const booking=createDemoBookings()[1],before=JSON.stringify(booking);
 assert.throws(()=>updateDemoBooking(booking,{...demoValues(booking),authorityStatus:'submitted'}),/authority_requires_documents/);
 const real={propertyId:'p1',guestName:'Fixture',checkin:'2026-10-10',checkout:'2026-10-14',guests:2,totalAmount:480,status:'arrival',guestRegistration:{documentsReceived:2,authorityStatus:'submitted'},cleaning:{required:false},touristTax:{enabled:false},guestIssue:{active:false}};
 assert.equal(normalizeBookingInput(real).guestRegistration.completed,true);
 assert.throws(()=>normalizeBookingInput({...real,guestRegistration:{documentsReceived:1,authorityStatus:'submitted'}}),/invalid_payload/);
 const saved=updateDemoBooking(booking,{...demoValues(booking),documentsReceived:2,authorityStatus:'submitted'});
 assert.equal(saved.guestRegistration.completed,true);assert.equal(JSON.stringify(booking),before);
});
test('RC192 demo rejects zero accommodation totals consistently with production',()=>{
 const booking=createDemoBookings()[1];assert.throws(()=>updateDemoBooking(booking,{...demoValues(booking),totalAmount:0}),/invalid_booking_values/);assert.throws(()=>normalizeBookingInput({...booking,totalAmount:0}),/invalid_payload/);
});
test('RC192 PMS same-day turnover is available and never charges the departing night',()=>{
 const b={id:'old',propertyId:'p',checkin:'2026-10-24',checkout:'2026-10-26',totalAmount:200,status:'checkout'};
 assert.equal(evaluateAvailability({propertyId:'p',checkin:'2026-10-26',checkout:'2026-10-28',status:'arrival'},[b]).available,true);
 const snapshot={ownerUid:'u',portalSnapshotReady:true,propertyList:[{id:'p'}],portalBookingList:[b,{...b,id:'next',checkin:'2026-10-26',checkout:'2026-10-28',status:'arrival',totalAmount:300}]};
 const r=buildPMSOperationalReport({ownerUid:'u',snapshot,month:'2026-10'});assert.equal(r.totals.revenue,500);assert.equal(r.totals.nights,4);assert.equal(r.totals.occupiedNights,4);assert.equal(r.totals.adr,125);assert.equal(r.warnings.overlappingNights,0);
});
test('RC192 public pages and bilingual demos load correct resources',()=>{
 for(const page of ['market/index.html','market/napoli/index.html','market/roma/index.html','market/milano/index.html','market/firenze/index.html','tool/index.html']){
  const s=read(page);assert.equal((s.match(/data-territorial-benchmarks/g)||[]).length,1);assert.match(s,/territorial-benchmark-ui.js\?v=20261025-rc198/);assert.match(s,/territorial-benchmarks.css\?v=20261023-rc192/);
 }
 for(const lang of ['','en/'])assert.match(read(lang+'demo/hospitality-pms/index.html'),/pms-product-demo.js\?v=20261023-rc192/);
 assert.match(read('js/chatbot/core/market-evidence.js'),/\/market\/#territorial-benchmarks/);assert.match(read('js/pms-product-demo.js'),/authority_requires_documents/);
});
test('RC192 price CSV carries exact segment, source, dates and units without invented ADR/occupancy',()=>{
 const d=JSON.parse(read('data/territorial/napoli.json')),r=d.rows.find(r=>r[6]!==null);
 for(const lang of ['it','en']){
  const csv=territorialCSV(d,r,lang);assert.match(csv,/RendimentoBB Territorial Quote Reference v1/);assert.ok(csv.includes(d.city.url));assert.ok(csv.includes(r[0]));assert.ok(csv.includes(r[4]));assert.match(csv,/creativecommons.org\/licenses\/by\/4.0/);assert.ok(csv.endsWith(';"";"";""'));
  const lines=csv.slice(1).split('\r\n');assert.equal(lines.length,2);assert.equal(lines[0].split(';').length,24);assert.equal(lines[1].split(';').length,24);
 }
 assert.equal(territorialCSV(d,d.rows.find(r=>r[6]===null)),null);
 const injected=[...r];injected[0]='=SUM(A1)';assert.match(territorialCSV(d,injected),/"'=SUM\(A1\)"/);
});
