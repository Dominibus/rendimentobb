import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {calendarDay, calendarDayDifference, stayNights, bookingNights, nightsInMonth, weekendStayNights} from '../js/pms-calendar.js';
const source = readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');

test('strict calendar dates reject impossible days, malformed strings and missing values',()=>{
  for(const value of ['2026-02-29','2026-04-31','2026-13-01','2026-00-01','2026-01-00','2026-1-01','2026-01-01T00:00:00',null,undefined,0]) assert.equal(calendarDay(value),null);
  assert.notEqual(calendarDay('2028-02-29'),null);
});
test('same-day, reverse and invalid stays have no invented night',()=>{
  for(const [a,b] of [['2026-10-25','2026-10-25'],['2026-10-26','2026-10-25'],['2026-02-30','2026-03-02'],['','2026-10-25']]) assert.equal(stayNights(a,b),0);
});
test('nights count calendar dates over autumn and spring clock changes',()=>{
  assert.equal(stayNights('2026-10-24','2026-10-26'),2);
  assert.equal(stayNights('2026-03-28','2026-03-30'),2);
  assert.equal(stayNights('2028-02-28','2028-03-01'),2);
  assert.equal(stayNights('2026-12-31','2027-01-01'),1);
});
test('calendar counts are identical in Rome, UTC and New York',()=>{
  for(const TZ of ['Europe/Rome','UTC','America/New_York']) {
    const code=`import {stayNights,weekendStayNights} from './js/pms-calendar.js'; console.log(JSON.stringify([stayNights('2026-10-24','2026-10-26'),stayNights('2026-03-28','2026-03-30'),weekendStayNights('2026-10-23','2026-10-26')]));`;
    assert.deepEqual(JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',code],{cwd:new URL('..',import.meta.url),env:{...process.env,TZ},encoding:'utf8'})),[2,2,2]);
  }
});
test('saved erroneous nights cannot override valid check-in and check-out',()=>{
  assert.equal(bookingNights({checkin:'2026-10-24',checkout:'2026-10-26',nights:3}),2);
  assert.equal(bookingNights({checkin:'2026-10-25',checkout:'2026-10-25',nights:3}),0);
  assert.equal(bookingNights({checkin:'2026-10-24',nights:3}),0);
});
test('legacy nights-only records accept positive whole nights only',()=>{
  assert.equal(bookingNights({nights:'3'}),3);
  for(const nights of [-1,0,1.5,Infinity,'bad',true,{},null]) assert.equal(bookingNights({nights}),0);
});
test('monthly allocation excludes checkout and partitions stays across month and year',()=>{
  assert.equal(nightsInMonth('2026-10-30','2026-11-02',new Date(2026,9,15)),2);
  assert.equal(nightsInMonth('2026-10-30','2026-11-02',new Date(2026,10,15)),1);
  assert.equal(nightsInMonth('2026-10-30','2026-11-02',new Date(2026,11,15)),0);
  assert.equal(nightsInMonth('2026-12-31','2027-01-02',new Date(2027,0,15)),1);
  assert.equal(nightsInMonth('2026-01-01','2026-02-01',new Date(2026,1,1)),0);
});
test('weekend nights count Friday and Saturday, including long stays',()=>{
  assert.equal(weekendStayNights('2026-10-23','2026-10-26'),2);
  assert.equal(weekendStayNights('2026-10-25','2026-10-26'),0);
  assert.equal(weekendStayNights('2026-10-23','2026-11-06'),4);
});
test('lead time counts signed calendar days over clock changes',()=>{
  assert.equal(calendarDayDifference('2026-10-24','2026-10-26'),2);
  assert.equal(calendarDayDifference('2026-10-26','2026-10-24'),-2);
});
function context() {
  const fields=new Map();
  const ctx={Date,Number,Math,stayNights,calendarBookingNights:bookingNights,nightsInMonth,weekendStayNights,
    window:{currentLang:'it'},document:{getElementById:id=>fields.get(id)},t:(it,en)=>it};
  vm.createContext(ctx);return {ctx,fields};
}
test('live pricing metrics use two nights and one weekend night over autumn transition',()=>{
  const {ctx,fields}=context();fields.set('booking-checkin',{value:'2026-10-24'});fields.set('booking-checkout',{value:'2026-10-26'});
  vm.runInContext(source.slice(source.indexOf('window.getBookingStayMetrics ='),source.indexOf('window.updateBookingPricingSuggestion =')),ctx);
  assert.equal(ctx.window.getBookingStayMetrics().nights,2);assert.equal(ctx.window.getBookingStayMetrics().weekendNights,1);
  fields.get('booking-checkout').value='2026-10-24';assert.equal(ctx.window.getBookingStayMetrics(),null);
});
test('monthly revenue keeps total intact while allocating by actual nights',()=>{
  const {ctx}=context();
  vm.runInContext(source.slice(source.indexOf('function getBookingNightsInMonth'),source.indexOf('function isCancelledBooking')),ctx);
  const row={checkin:'2026-10-30',checkout:'2026-11-02',nights:4,totalAmount:300};
  assert.equal(ctx.getBookingRevenueInMonth(row,new Date(2026,9,1)),200);
  assert.equal(ctx.getBookingRevenueInMonth(row,new Date(2026,10,1)),100);
});
test('tourist tax live calculation uses calendar nights and retains taxable-night cap',()=>{
  const {ctx,fields}=context();
  ctx.window.currentPropertyTouristTaxConfig={enabled:true,ratePerGuestNight:3,maxTaxableNights:0,currency:'EUR'};
  ctx.window.t=(it,en)=>it;ctx.window.getTouristTaxCurrencySymbol=()=> '€';
  for(const [id,value] of Object.entries({'booking-checkin':'2026-10-24','booking-checkout':'2026-10-26','booking-guests':'2','booking-taxable-guests':'2'}))fields.set(id,{value,dataset:{}});
  for(const id of ['booking-tourist-tax-box','booking-tourist-tax-amount','booking-tourist-tax-rule'])fields.set(id,{dataset:{},style:{}});
  vm.runInContext(source.slice(source.indexOf('window.updateBookingTouristTax ='),source.indexOf('window.updateBookingGuestRegistration =')),ctx);
  ctx.window.updateBookingTouristTax();assert.equal(fields.get('booking-tourist-tax-box').dataset.taxableNights,'2');assert.equal(fields.get('booking-tourist-tax-box').dataset.amount,'12');
  ctx.window.currentPropertyTouristTaxConfig.maxTaxableNights=1;ctx.window.updateBookingTouristTax();assert.equal(fields.get('booking-tourist-tax-box').dataset.amount,'6');
});
