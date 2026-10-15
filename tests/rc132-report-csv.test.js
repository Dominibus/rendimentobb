import test from 'node:test';import assert from 'node:assert/strict';
import {csvCell,performanceCSV} from '../js/report-csv.js';
test('typed negative numbers stay numeric while text formulas remain protected',()=>{
 assert.equal(csvCell(-36.19),'"-36.19"');
 for(const text of ['=SUM(A1:A2)','+1+1','-1+2','@SUM(A1)','\t=HYPERLINK("x")'])assert.ok(csvCell(text).startsWith('"\''));
 assert.equal(csvCell('Casa "A"'),'"Casa ""A"""');assert.equal(csvCell(null),'""');
 for(const n of [NaN,Infinity,-Infinity])assert.equal(csvCell(n),'""');
});
test('performance CSV rounds currencies and percentages without floating tails or guest data',()=>{
 const r={period:{start:'2026-09-01',end:'2026-10-01'},performance:{rows:[{id:'a',name:'Casa',revenue:2010,expectedRevenue:3149.999999999999,revenueDeltaPercent:-36.190476190476176,nights:18,occupancy:60,adr:111.66666666666667,linkState:'linked',missingPeriodAmounts:0,overlapNights:0,guestName:'PRIVATE GUEST'},{id:'b',name:'=FORMULA',revenue:0,expectedRevenue:null,revenueDeltaPercent:null,nights:0,occupancy:0,adr:null,linkState:'unlinked',missingPeriodAmounts:0,overlapNights:0}]}};
 const s=performanceCSV(r);assert.match(s,/"2010";"3150";"-36\.1905";"18";"60";"111\.67"/);assert.match(s,/"'=FORMULA"/);assert.doesNotMatch(s,/9999999|PRIVATE GUEST|guestName/);
});
