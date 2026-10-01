import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../js/chatbot/core/portal-facts-engine.js',import.meta.url),'utf8');
const now=new Date('2026-10-01T12:00:00');
function setup(overrides={}){
 const window={currentUser:{uid:'owner'},getUserAccess:()=>({isInvestor:true}),rbPMSData:{ownerUid:'owner',portalSnapshotReady:true,lastBookingsSync:'2026-10-01',propertyList:[{id:'a',name:'Casa Roma',city:'Roma',acquisitionPrice:150000},{id:'b',name:'Casa Napoli',city:'Napoli',acquisitionPrice:null}],portalBookingList:[{id:'1',propertyId:'a',propertyName:'Casa Roma',guestName:'Mario',checkin:'2026-09-30',checkout:'2026-10-03',totalAmount:300,status:'confirmed'},{id:'2',propertyId:'a',checkin:'2026-10-05',checkout:'2026-10-07',totalAmount:400,status:'pending'},{id:'3',propertyId:'b',checkin:'2026-10-05',checkout:'2026-10-07',totalAmount:800,status:'cancelled'},{id:'4',propertyId:'b',checkin:'2026-10-10',checkout:'2026-10-12',totalAmount:500,status:'confirmed'}],renovationList:[{propertyId:'a',propertyName:'Casa Roma',plannedTotal:10000,actualSpent:12000,targetValue:180000}]},...overrides};
 const c={window,Date,Intl};vm.createContext(c);vm.runInContext(source,c);return window;
}
test('monthly ledger prorates cross-month stays and excludes pending and cancelled',()=>{
 const w=setup();const r=w.rbBuildPortalResponse('Consuntivo questo mese',now);
 assert.match(r.textIT,/700,00/);assert.match(r.textIT,/4 notti/);assert.match(r.textIT,/Non certifica incassi/);assert.match(r.textIT,/1 richieste pending/);
});
test('named property accounting does not use the portfolio aggregate',()=>{
 const r=setup().rbBuildPortalResponse('Consuntivo di Casa Roma questo mese',now);
 assert.match(r.textIT,/200,00/);assert.doesNotMatch(r.textIT,/700,00/);
});
test('upcoming bookings include pending requests separately and omit cancellations',()=>{
 const r=setup().rbBuildPortalResponse('Prossime prenotazioni',now);
 assert.match(r.textIT,/2 prenotazioni; 1 richieste/);assert.doesNotMatch(r.textIT,/800,00/);assert.equal(r.metadata.period.start,'2026-10-01');
});
test('property acquisition price and renovation targets never become market appraisal',()=>{
 const r=setup().rbBuildPortalResponse('Qual è il valore degli immobili?',now);
 assert.match(r.textIT,/150.000,00/);assert.match(r.textIT,/180.000,00/);assert.match(r.textIT,/non disponibile/);assert.match(r.textIT,/non sono una perizia/);
});
test('upcoming costs disclose missing invoices and distinguish remaining budget from payable debt',()=>{
 const r=setup().rbBuildPortalResponse('Costi in arrivo',now);
 assert.match(r.textIT,/non registra un calendario/);assert.match(r.textIT,/superamento budget 2.000,00/);assert.match(r.textIT,/non un debito/);
});
test('Free, logged-out and wrong owner cannot get PMS facts',()=>{
 for(const override of [{getUserAccess:()=>({isFree:true})},{currentUser:null},{currentUser:{uid:'other'}}]){
  const r=setup(override).rbBuildPortalResponse('Consuntivo questo mese',now);assert.doesNotMatch(r.textIT,/700,00/);assert.ok(['access','unavailable'].includes(r.metadata.answerMode));
 }
});
test('Pro and annual access share saved PMS facts',()=>{
 for(const plan of ['pro','pro_yearly']){
  const r=setup({currentPlan:plan,getUserAccess:()=>({isPro:true})}).rbBuildPortalResponse('Consuntivo questo mese',now);assert.match(r.textIT,/700,00/);
 }
});
test('invalid dates and unknown property do not silently fall back to all properties',()=>{
 assert.equal(setup().rbBuildPortalResponse('Consuntivo 2026-02-30',now).metadata.answerMode,'invalid_period');
 assert.equal(setup().rbBuildPortalResponse('Consuntivo per immobile Sconosciuto',now).metadata.answerMode,'unknown_property');
});
test('PDF and detailed guest workflows remain in their existing engines',()=>{
 const w=setup();for(const q of ['ROI del PDF','Pulizie prossime prenotazioni','Modifica prenotazioni domani'])assert.equal(w.rbBuildPortalResponse(q,now),null);
});
