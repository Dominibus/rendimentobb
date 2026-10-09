import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');
const code=source.slice(source.indexOf('function getDayBookingState('),source.indexOf('function renderPMSCalendar('));
const carlo={id:'a',uid:'owner',propertyId:'one',guestName:'Carlo',checkin:'2026-10-05',checkout:'2026-10-11',status:'checked-in'};
const francesca={id:'b',uid:'owner',propertyId:'two',guestName:'Francesca',checkin:'2026-10-07',checkout:'2026-10-11',status:'checked-in'};
function harness(){const c={isConfirmedBooking:b=>!['cancelled','pending'].includes(b.status),window:{currentUser:{uid:'owner'}}};vm.createContext(c);vm.runInContext(code,c);return c;}
test('all-properties day retains both overlapping stays and both departures',()=>{
 const c=harness();for(const date of ['2026-10-09','2026-10-11']){
  const state=c.getDayBookingState(date,[carlo,francesca],false);
  assert.equal(state.bookings.length,2);assert.equal(state.bookingInfo,null);
  assert.match(state.tooltip,/Carlo/);assert.match(state.tooltip,/Francesca/);
  assert.equal(state.isCheckout,date==='2026-10-11');
 }
});
test('single-property view and empty dates retain exact selection; cancelled and pending are excluded',()=>{
 const c=harness();const state=c.getDayBookingState('2026-10-09',[carlo,{...francesca,status:'cancelled'},{...francesca,status:'pending'}],true);
 assert.equal(state.bookings.length,1);assert.equal(state.bookingInfo,carlo);assert.match(state.tooltip,/Stay: Carlo/);
 assert.equal(c.getDayBookingState('2026-10-12',[carlo,francesca],true).bookings.length,0);
});
test('same-day departure and arrival retain both bookings independently of order',()=>{
 const c=harness(),arrival={...francesca,checkin:'2026-10-11',checkout:'2026-10-14'};
 for(const rows of [[carlo,arrival],[arrival,carlo]]){
  const state=c.getDayBookingState('2026-10-11',rows,true);
  assert.equal(state.bookings.length,2);assert.equal(state.isCheckin,true);assert.equal(state.isCheckout,true);
  assert.match(state.tooltip,/Arrival: Francesca/);assert.match(state.tooltip,/Departure: Carlo/);
 }
});
test('picker opens the chosen booking and refuses a switched account',()=>{
 for(const switched of [false,true]){
  const c=harness(),nodes=[];let opened=null;
  c.window.showBookingDetails=b=>opened=b;
  c.document={getElementById:()=>null,body:{append:n=>nodes.push(n)},createElement:tag=>({tag,style:{},children:[],append(n){this.children.push(n);},setAttribute(){},addEventListener(){},showModal(){},close(){},remove(){}})};
  c.openCalendarDayBookings([carlo,francesca],true);
  const dialog=nodes[0],buttons=dialog.children.filter(n=>n.tag==='button');
  assert.equal(buttons.length,3);assert.match(buttons[1].textContent,/Francesca/);
  if(switched)c.window.currentUser={uid:'another'};
  buttons[1].onclick();assert.equal(opened,switched?null:francesca);
 }
});
