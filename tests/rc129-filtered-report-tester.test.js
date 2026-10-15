import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const dashboard=read('js/dashboard.js');
const functionStart=dashboard.indexOf('async function getOwnedReportPMS(');
const reportCode=dashboard.slice(functionStart,dashboard.indexOf('// ================= REPORT CLICK HANDLER',functionStart));
const updateEnd=dashboard.indexOf('\n};',dashboard.indexOf('bookings:\n    activeBookingsCount,'))+3;
const updateStart=dashboard.lastIndexOf('window.rbPMSData = {',updateEnd);
const updateCode=dashboard.slice(updateStart,updateEnd);
for(const all of [false,true])test(`report rebuilds account totals after booking view; all=${all}`,async()=>{
 let loaded=0;
 const c={window:{currentUser:{uid:'owner'},rbPMSData:{ownerUid:'owner',portalSnapshotReady:true,properties:4,bookings:13,totalRevenue:8710,guests:29}},auth:{currentUser:{uid:'owner'}},activeBookingsCount:all?13:3,normalizedBookings:[{id:'b',propertyId:'castle'}],showAllProperties:all,propertyId:'castle',attentionBookings:[{id:'b'}],Date};
 c.loadPMSStats=async()=>{loaded++;c.window.rbPMSData={ownerUid:'owner',portalSnapshotReady:true,properties:4,bookings:13,totalRevenue:8710,guests:29,attentionCount:6};};
 vm.createContext(c);vm.runInContext(updateCode,c);
 assert.equal(c.window.rbPMSData.bookings,all?13:3);
 vm.runInContext(reportCode,c);const report=await c.getOwnedReportPMS('owner');
 assert.equal(loaded,1);assert.equal(report.bookings,13);assert.equal(report.properties,4);assert.equal(report.totalRevenue,8710);assert.equal(report.attentionCount,6);
});
const app=read('js/app.js');
const promoStart=app.indexOf('  const testerMode = window.rbLiveSalesPaused?.() === true;');
const promoCode=app.slice(promoStart,app.indexOf('  const lang = window.currentLang',promoStart));
for(const paused of [true,false])test(`upgrade prompt respects tester availability; paused=${paused}`,()=>{
 let opened=0;const originalAction=()=>{};const config={cta_it:'Old purchase',cta_en:'Old purchase',action:originalAction};
 const c={config,window:{rbLiveSalesPaused:()=>paused,rbOpenSubscription:()=>opened++}};
 vm.runInNewContext(promoCode,c);
 if(paused){
  assert.match(config.cta_it,/30 giorni/);assert.match(config.cta_en,/30 free days/);
  assert.match(config.features_it.join(' '),/PDF esclusi/);assert.match(config.features_en.join(' '),/PDFs excluded/);
  assert.doesNotMatch(config.cta_it+config.cta_en,/19|29|month|mese/);config.action();assert.equal(opened,1);
 }else{assert.equal(config.action,originalAction);assert.equal(config.cta_it,'Old purchase');}
});
