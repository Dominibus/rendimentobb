import {commercialFixture as demo}from'./fixtures/commercial-scenario.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateCommercial as calc,createCommercialModel as blank,commercialSensitivity as sensitivity} from '../js/commercial-property-engine.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const noVAT=m=>{m.assignments.forEach(a=>a.vat={status:'no_vat',rate:null});return m;};
test('RC193 305 monthly reserves one weekly half-day: exactly 12 fees, not 48/52',()=>{
 const m=noVAT(demo()),r=calc(m);near(r.contractualGross,3660);assert.equal(r.assignments[0].units,12);assert.equal(r.reserved,52);assert.equal(r.capacity,1044);assert.equal(r.free,992);
});
test('RC193 305 per use counts actual Mondays; no invented four-week conversion',()=>{
 const r=calc(noVAT(demo('per_use')));assert.equal(r.assignments[0].units,52);near(r.contractualGross,15860);
});
test('RC193 VAT unknown hides all net returns and profit metrics',()=>{
 const r=calc(demo());assert.equal(r.contractualGross,3660);
 for(const key of ['expectedNet','operatingCosts','operatingMargin','cashflow','grossYieldPct','operatingYieldPct','newEquityReturnPct','breakEvenRealisationPct'])assert.equal(r[key],null,key);
 assert.equal(sensitivity(demo()).cashflow,null);
});
test('RC193 VAT is only split at explicit rate: 305 / 1.22 = 250',()=>{
 const m=demo();m.assignments[0].vat={status:'taxable',rate:22};const r=calc(m);
 near(r.contractualNet,3000);near(r.expectedVAT,660);near(r.operatingMargin,600);near(r.cashflow,600);
});
test('RC193 owner A: asset is denominator, not fresh investment',()=>{
 const m=noVAT(demo()),r=calc(m);assert.equal(r.initialOutlay,10000);assert.equal(r.newEquity,10000);near(r.grossYieldPct,3660/180000*100);near(r.operatingYieldPct,1260/180000*100);near(r.newEquityReturnPct,12.6);
});
test('RC193 investor B: price plus costs and works less new funding; independent annuity',()=>{
 const m=noVAT(demo());Object.assign(m.property,{ownership:'purchase',acquisitionCosts:12000,otherCapital:3000,newLoan:{amount:120000,rate:4,years:20}});
 const r=calc(m),monthlyRate=.04/12,n=240,annual=120000*monthlyRate*Math.pow(1+monthlyRate,n)/(Math.pow(1+monthlyRate,n)-1)*12;
 assert.equal(r.initialOutlay,205000);assert.equal(r.newEquity,85000);near(r.annualDebtService,annual);near(r.cashflow,1260-annual);assert.ok(r.cashflow<0);
});
test('RC193 residual debt does not provide fresh cash and is included in annual service',()=>{
 const m=noVAT(demo());m.property.existingLoan={amount:30000,annualService:3600};const r=calc(m);assert.equal(r.newEquity,10000);assert.equal(r.annualDebtService,3600);assert.equal(r.cashflow,-2340);
});
test('RC193 zero-rate new loan, zero equity and zero asset value remain finite/N/A',()=>{
 const m=noVAT(demo());m.property.value=0;m.property.newLoan={amount:10000,rate:0,years:10};const r=calc(m);assert.equal(r.annualDebtService,1000);assert.equal(r.newEquity,0);assert.equal(r.newEquityReturnPct,null);assert.equal(r.operatingYieldPct,null);
});
test('RC193 manager C: mixed rooms do not share capacity; closure reduces per-use but not fixed monthly fees',()=>{
 const m=noVAT(demo('per_use'));m.assignments.push({...structuredClone(m.assignments[0]),id:'A2',roomId:'R2',code:'P02',mode:'room_monthly',amount:1000});
 m.closures=[{roomId:'R1',start:'2027-01-04',end:'2027-01-04'}];let r=calc(m);assert.equal(r.assignments[0].units,51);assert.equal(r.rooms[0].capacity,520);assert.equal(r.rooms[1].capacity,522);assert.equal(r.rooms[1].reserved,522);near(r.rooms[1].expectedNet,12000);
 m.assignments[0].mode='weekly_monthly';r=calc(m);assert.equal(r.assignments[0].contractualGross,3660);
});
test('RC193 collisions are rejected including closed dates and full-room against recurring slots',()=>{
 const m=noVAT(demo());m.assignments.push({...structuredClone(m.assignments[0]),id:'A2',code:'P02',mode:'room_monthly'});
 assert.throws(()=>calc(m),/collision/);m.closures=[{roomId:'*',start:'2027-01-01',end:'2027-12-31'}];assert.throws(()=>calc(m),/collision/);
});
test('RC193 changing contracts on adjacent days is allowed, shared inclusive boundary is rejected',()=>{
 const m=noVAT(demo());m.assignments[0].end='2027-06-30';m.assignments.push({...structuredClone(m.assignments[0]),id:'A2',code:'P02',start:'2027-07-01',end:'2027-12-31'});near(calc(m).contractualGross,3660);
 m.assignments[0].end='2027-07-05';m.assignments[1].start='2027-07-05';assert.throws(()=>calc(m),/collision/);
});
test('RC193 partial months use actual contractual days, not slot count',()=>{
 const m=noVAT(demo());Object.assign(m.assignments[0],{start:'2027-01-16',end:'2027-02-14'});near(calc(m).contractualGross,305*(16/31+14/28));
});
test('RC193 leap calendar, contract clipping and inclusive date endpoints',()=>{
 const m=noVAT(demo('per_use'));m.year=2028;Object.assign(m.assignments[0],{start:'2027-12-01',end:'2028-02-29',weekdays:[2]});assert.equal(calc(m).assignments[0].units,9);
 Object.assign(m.assignments[0],{start:'2028-02-29',end:'2028-02-29'});assert.equal(calc(m).assignments[0].units,1);
 m.assignments[0].mode='weekly_monthly';near(calc(m).contractualGross,305/29);
});
test('RC193 advisor D: expected revenue, variable costs, debt break-even and stresses independent',()=>{
 const m=noVAT(demo());m.assignments[0].expectedPct=80;m.costs.variablePct=10;const r=calc(m);
 near(r.expectedNet,2928);near(r.operatingCosts,2692.8);near(r.cashflow,235.2);near(r.breakEvenRevenue,2400/.9);near(r.breakEvenRealisationPct,(2400/.9)/3660*100);
 const s=sensitivity(m,{revenueDropPct:20,costIncreasePct:10});near(s.cashflow,2342.4-(2400+234.24)*1.1);
});
test('RC193 same generic professional code is grouped for concentration',()=>{
 const m=noVAT(demo());m.assignments.push({...structuredClone(m.assignments[0]),id:'A2',roomId:'R2'});assert.equal(calc(m).largestContractSharePct,100);m.assignments[1].code='P02';assert.equal(calc(m).largestContractSharePct,50);
});
test('RC193 all closed means zero capacity, no per-use revenue; no NaN/Infinity',()=>{
 const m=noVAT(demo('per_use'));m.closures=[{roomId:'*',start:'2027-01-01',end:'2027-12-31'}];const r=calc(m);assert.equal(r.capacity,0);assert.equal(r.contractualGross,0);assert.equal(r.rooms[0].utilisationPct,null);assert.equal(r.breakEvenRealisationPct,null);assert.equal(r.cashflow,-2400);
});
test('RC193 zero revenue blank model is calculable; 100% variable costs have no finite break-even',()=>{
 assert.equal(calc(blank()).cashflow,0);const m=noVAT(demo());m.costs.variablePct=100;assert.equal(calc(m).breakEvenRevenue,null);assert.equal(calc(m).cashflow,-2400);
});
test('RC193 multi-day/monthly bundle price is not multiplied per selected weekday or slot',()=>{
 const m=noVAT(demo());m.assignments[0].weekdays=[1,3];m.assignments[0].slotIds=['AM','PM'];near(calc(m).contractualGross,3660);assert.equal(calc(m).reserved,208);
});
test('RC193 custom adjacent time slots allowed; overlapping time ranges rejected',()=>{
 const m=noVAT(demo());m.slots[0].end='14:00';calc(m);m.slots[0].end='14:01';assert.throws(()=>calc(m),/overlap/);
});
const invalid=[
 ['missing tariff',m=>m.assignments[0].mode='',/tariff/],
 ['missing VAT rate',m=>m.assignments[0].vat={status:'taxable',rate:''},/number/],
 ['impossible date',m=>m.assignments[0].start='2027-02-29',/date/],
 ['reversed dates',m=>m.assignments[0].start='2028-01-01',/range/],
 ['closed weekday',m=>m.assignments[0].weekdays=[7],/weekday/],
 ['unknown slot',m=>m.assignments[0].slotIds=['bad'],/slot/],
 ['NaN',m=>m.costs.fixedAnnual=NaN,/number/],
 ['negative costs',m=>m.costs.fixedAnnual=-1,/number/],
 ['too many rooms',m=>m.rooms=Array.from({length:31},(_,i)=>({id:'R'+i})),/list/],
 ['duplicate rooms',m=>m.rooms.push({id:'R1'}),/duplicate/],
 ['invalid generic code',m=>m.assignments[0].code='<img onerror=1>',/code/],
 ['excess funding',m=>m.property.newLoan.amount=10001,/funding/],
 ['owned purchase costs',m=>m.property.acquisitionCosts=1,/owned_cost/],
 ['missing residual service',m=>m.property.existingLoan.amount=100,/debt/],
 ['invalid schema',m=>m.schema='roi-monthly-v1',/schema/],
 ['unknown room',m=>m.assignments[0].roomId='R3',/room/],
 ['empty days',m=>m.openDays=[],/list/],
 ['zero loan term',m=>m.property.newLoan.years=0,/number/]
];
for(const [name,mutate,err] of invalid)test('RC193 rejects '+name,()=>{const m=demo();mutate(m);assert.throws(()=>calc(m),err);});
test('RC193 engine and sensitivity do not mutate supplied data',()=>{const m=noVAT(demo()),before=JSON.stringify(m);calc(m);sensitivity(m,{revenueDropPct:30});assert.equal(JSON.stringify(m),before);});
