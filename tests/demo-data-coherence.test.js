import {bookingNights as calendarBookingNights, nightsInMonth} from '../js/pms-calendar.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const demo = readFileSync(new URL('../js/demo/demo-investments.js',import.meta.url),'utf8');
const dashboard = readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');
function context(date='2026-09-30T12:00:00') {
  class FixedDate extends Date { constructor(...args){super(...(args.length?args:[date]));} }
  const elements=new Map();
  const ctx={Date:FixedDate,Intl,console,calendarBookingNights,nightsInMonth,document:{getElementById(id){if(!elements.has(id))elements.set(id,{getContext(){return {};}});return elements.get(id);}},
    window:{currentLang:'it',isDemoDashboard:true,devicePixelRatio:1,dispatchEvent(){}},CustomEvent:class {},
    Chart:class {static getChart(){return null;} constructor(canvas,config){ctx.chart=config;}},
    t:(it)=>it,formatCurrency:n=>String(n),formatPercent:n=>String(n)};
  vm.createContext(ctx);vm.runInContext(demo,ctx);
  const helpers=dashboard.slice(dashboard.indexOf('function getBookingNightsInMonth'),dashboard.indexOf('// Every availability decision reads the server'));
  const chart=dashboard.slice(dashboard.indexOf('function renderPMSPerformanceChart('),dashboard.indexOf('function getDayBookingState'));
  const stats=dashboard.slice(dashboard.indexOf('async function loadPMSStats('),dashboard.indexOf('  if(!window.currentUser) return;',dashboard.indexOf('async function loadPMSStats(')))+'}';
  vm.runInContext(helpers+'\n'+chart+'\n'+stats,ctx);
  return {ctx,elements};
}
test('all illustrative investment cashflows agree with equity and ROI',()=>{
  const {ctx}=context();
  for(const item of ctx.window.demoAnalyses){
    assert.equal(item.gross-item.expenses,item.net);
    assert.ok(Math.abs(item.net/item.equity*100-item.roi)<1e-10);
    assert.ok(Math.abs(item.net/item.price*100-item.realROI)<1e-10);
  }
  const equity=ctx.window.demoAnalyses.reduce((n,x)=>n+x.equity,0);
  const net=ctx.window.demoAnalyses.reduce((n,x)=>n+x.net,0);
  const roi=ctx.window.demoAnalyses.reduce((n,x)=>n+x.roi*x.equity,0)/equity;
  assert.ok(Math.abs(net/equity*100-roi)<1e-10);
});
for(const date of ['2026-09-30T12:00:00','2028-02-15T12:00:00','2030-01-01T12:00:00']){
  test(`PMS demo metrics and chart share complete, nonoverlapping bookings at ${date}`,async()=>{
    const {ctx,elements}=context(date);await ctx.loadPMSStats();
    const fixture=ctx.window.rbBuildDemoPMS();
    assert.equal(fixture.currentBookings.length,11);
    assert.equal(fixture.bookings.length,132);
    for(const month of Array.from({length:12},(_,i)=>i)){
      const list=fixture.bookings.filter(x=>Number(x.checkin.slice(5,7))-1===month);
      assert.equal(list.reduce((sum,x)=>sum+x.nights,0),24);
      list.forEach((x,i)=>{assert.ok(x.checkout>x.checkin);if(i)assert.ok(x.checkin>=list[i-1].checkout);});
    }
    const sum=fixture.currentBookings.reduce((n,x)=>n+x.totalAmount,0);
    assert.equal(Number(elements.get('pms-total-revenue').innerText),sum);
    assert.equal(Number(elements.get('pms-total-bookings').innerText),11);
    assert.equal(ctx.window.rbPMSData.revenue,sum);
    assert.ok(ctx.chart.data.datasets[0].data.every(x=>x>0));
    assert.equal(ctx.chart.data.datasets[0].data[new Date(date).getMonth()],sum);
    assert.equal(ctx.chart.data.datasets[0].data.reduce((n,x)=>n+x,0),fixture.bookings.reduce((n,x)=>n+x.totalAmount,0));
  });
}
