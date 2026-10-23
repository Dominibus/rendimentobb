import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createDemoBookings,demoDayState,demoMetrics,demoTasks,demoTax,demoPrice,updateDemoBooking} from '../js/pms-product-demo-model.js';
import {calendarDayDifference,stayNights,weekendStayNights} from '../js/pms-calendar.js';
const values=b=>({status:b.status,totalAmount:b.totalAmount,documentsReceived:b.guestRegistration.documentsReceived,authorityStatus:b.guestRegistration.authorityStatus,taxableGuests:b.touristTax.taxableGuests??b.guests,taxStatus:b.touristTax.status,cleaningStatus:b.cleaning.status,issueStatus:b.guestIssue.status??'open'});
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('RC188: fictional fixtures produce transparent month KPI and real checklist',()=>{
 const bookings=createDemoBookings(),m=demoMetrics(bookings);
 assert.equal(m.revenue,1170);assert.equal(m.nights,10);assert.equal(m.adr,117);assert.equal(m.revpar,1170/31);assert.equal(m.occupancy,10/31*100);assert.equal(m.tasks,9);
 assert.deepEqual(demoTasks(bookings,'documents').map(x=>x.bookingId),['demo-2','demo-3']);
 assert.equal(demoTasks(bookings,'daily').length,4);
});
test('RC188: arrival/stay/departure use checkout marker without charging extra night',()=>{
 const b=createDemoBookings();assert.equal(demoDayState(b,'2026-10-10').state,'arrival');assert.equal(demoDayState(b,'2026-10-11').state,'stay');assert.equal(demoDayState(b,'2026-10-14').state,'departure');assert.equal(demoDayState(b,'2026-10-15').state,'available');
 const cancelled=updateDemoBooking(b[1],{...values(b[1]),status:'cancelled'});
 assert.equal(demoDayState([cancelled],'2026-10-10').state,'available');assert.equal(demoMetrics([cancelled]).revenue,0);assert.equal(demoTasks([cancelled]).length,0);
});
test('RC188: completing documents does not mark authorities sent or alter revenue',()=>{
 const b=createDemoBookings()[1],updated=updateDemoBooking(b,{...values(b),documentsReceived:2});
 assert.equal(updated.guestRegistration.completed,false);assert.equal(demoTasks([updated],'documents').length,0);assert.equal(demoTasks([updated],'authority').length,1);assert.equal(updated.totalAmount,b.totalAmount);
 assert.equal(updateDemoBooking(updated,{...values(updated),authorityStatus:'submitted'}).guestRegistration.completed,true);
 assert.equal(b.guestRegistration.documentsReceived,1);
});
test('RC188: fictional tourist tax caps nights and respects taxable guest count',()=>{
 const b=createDemoBookings()[1];assert.equal(demoTax(b,2),16);assert.equal(demoTax({...b,checkout:'2026-10-25'},2),20);assert.equal(demoTax(b,0),0);
 assert.throws(()=>demoTax(b,3));assert.throws(()=>demoTax(b,1.5));
 assert.throws(()=>updateDemoBooking(b,{...values(b),taxStatus:'exempt'}),/exemption_requires_zero/);
 const exempt=updateDemoBooking(b,{...values(b),taxStatus:'exempt',taxableGuests:0});assert.equal(exempt.touristTax.amount,0);assert.equal(demoTasks([exempt],'tax').length,0);assert.equal(exempt.totalAmount,480);
});
test('RC188: cleaning and issue actions resolve only their actual tasks',()=>{
 const b=createDemoBookings()[1],updated=updateDemoBooking(b,{...values(b),cleaningStatus:'completed',issueStatus:'resolved'});
 assert.equal(demoTasks([updated],'cleaning').length,0);assert.equal(demoTasks([updated],'issue').length,0);assert.equal(demoTasks([updated],'documents').length,1);assert.equal(demoMetrics([updated]).revenue,480);
 const reopened=updateDemoBooking(updated,{...values(updated),issueStatus:'in_progress',cleaningStatus:'scheduled'});assert.equal(demoTasks([reopened],'issue').length,1);assert.equal(demoTasks([reopened],'cleaning').length,1);
});
test('RC188: invalid input never mutates fixture',()=>{
 const b=createDemoBookings()[1],before=JSON.stringify(b);
 for(const patch of [{documentsReceived:3},{documentsReceived:-1},{documentsReceived:1.5},{documentsReceived:''},{taxableGuests:''},{totalAmount:''},{totalAmount:Infinity},{totalAmount:-1},{status:'garbage'},{authorityStatus:'fake'},{cleaningStatus:'fake'},{taxStatus:'fake'},{issueStatus:'fake'}])assert.throws(()=>updateDemoBooking(b,{...values(b),...patch}));
 assert.equal(JSON.stringify(b),before);
});
test('RC188: seasonal suggestion matches production pricing factors across stay lengths and lead times',()=>{
 // Execute the production arithmetic verbatim, freezing only its clock and baseline inputs.
 const source=read('js/dashboard.js');const start=source.indexOf('  const month = metrics.start.getMonth() + 1;',source.indexOf('window.updateBookingPricingSuggestion = function()'));
 const end=source.indexOf('  const comparisonTotal =',start);assert.ok(start>0&&end>start);
 const code=source.slice(start,end)+'\nresult={adr:suggestedADR,total:suggestedTotal};';
 for(const checkin of ['2026-10-10','2026-10-19','2026-12-20','2026-07-01'])for(const length of [1,4,8,15])for(const season of ['auto','high','medium','low']){
  const checkout=new Date(Date.parse(checkin+'T12:00:00Z')+length*86400000).toISOString().slice(0,10),booking={checkin,checkout};
  class FixedDate extends Date{constructor(...args){super(...(args.length?args:['2026-10-10T12:00:00']));}}
  const context={Date:FixedDate,metrics:{start:new Date(checkin+'T12:00:00'),checkin,nights:stayNights(checkin,checkout),weekendNights:weekendStayNights(checkin,checkout)},document:{getElementById:()=>({value:season})},calendarDayDifference,getLocalISODate:()=> '2026-10-10',baseADR:120,referenceADR:120};
  vm.runInNewContext(code,context);const actual=demoPrice(booking,season);assert.equal(actual.adr,context.result.adr);assert.equal(actual.total,context.result.total);
 }
});
test('RC188: IT/EN demo keeps isolation and supplies matching accessible controls',()=>{
 const script=read('js/pms-product-demo.js'),ids=[...script.matchAll(/\$\('([^']+)'\)/g)].map(x=>x[1]);
 for(const file of ['demo/hospitality-pms/index.html','en/demo/hospitality-pms/index.html']){
  const html=read(file);for(const id of ids)assert.ok(html.includes(`id="${id}"`),`${file}: ${id}`);
  assert.match(html,/pms-product-demo.js\?v=20261023-rc192/);assert.match(html,/pms-product-demo.css\?v=20261023-rc188/);assert.match(html,/public-shell.js/);assert.doesNotMatch(html,/bb-demo.js|firebase|chatbot.js|header.js/);
  const allIds=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(allIds).size,allIds.length);
 }
 assert.doesNotMatch(script,/fetch\(|localStorage|sessionStorage|indexedDB|XMLHttpRequest|https:\/\//);
 assert.match(script,/preventDefault\(\)/);assert.match(script,/noValidate=true/);assert.match(script,/textContent/);assert.doesNotMatch(script,/innerHTML/);
});
test('RC188: interactive buttons select bookings, complete tasks, apply price on save and reset',()=>{
 class Element{
  constructor(id=''){this.id=id;this.value='';this.children=[];this.listeners={};this.attributes={};this.textContent='';}
  addEventListener(event,fn){this.listeners[event]=fn;}
  setAttribute(name,value){this.attributes[name]=value;}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  setCustomValidity(value){this.validationMessage=value;}
  reportValidity(){return true;}
  checkValidity(){return !this.validationMessage;}
  querySelectorAll(){return [];}
  focus(){this.focused=true;}
  scrollIntoView(){}
  trigger(event){this.listeners[event]?.({preventDefault(){}});}
 }
 const elements=new Map();for(const id of [...read('demo/hospitality-pms/index.html').matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]))elements.set(id,new Element(id));
 const el=id=>elements.get(id);el('demo-task-filter').value='all';
 const context={document:{documentElement:{lang:'it'},getElementById:el,createElement:()=>new Element()},window:{matchMedia:()=>({matches:true})},Intl,Date,createDemoBookings,demoDayState,demoMetrics,demoTasks,demoTax,demoPrice,updateDemoBooking};
 vm.runInNewContext(read('js/pms-product-demo.js').replace(/^import[^\n]+\n/,''),context);
 assert.equal(el('demo-calendar').children.length,34);assert.equal(el('demo-task-list').children.length,9);assert.equal(el('demo-tasks').textContent,'9');
 el('demo-calendar').children[5].trigger('click');assert.equal(el('demo-editor-title').textContent,'Ospite demo 1');
 el('demo-bookings').children[1].trigger('click');assert.equal(el('demo-editor-title').textContent,'Ospite demo 2');
 el('demo-task-filter').value='cleaning';el('demo-task-filter').trigger('change');assert.equal(el('demo-task-list').children.length,2);
 el('demo-task-list').children[0].trigger('click');assert.equal(el('demo-cleaning').open,true);
 for(const [id,value]of [['demo-documents-received','2'],['demo-authority','submitted'],['demo-tax-status','paid'],['demo-cleaning-status','completed'],['demo-issue-status','resolved']])el(id).value=value;
 const revenue=el('demo-revenue').textContent;
 el('demo-booking-form').trigger('submit');assert.equal(el('demo-tasks').textContent,'4');assert.equal(el('demo-revenue').textContent,revenue);
 el('demo-season').value='high';el('demo-season').trigger('change');el('demo-price-apply').trigger('click');assert.equal(el('demo-revenue').textContent,revenue);assert.notEqual(el('demo-total').value,'480');
 el('demo-booking-form').trigger('submit');assert.notEqual(el('demo-revenue').textContent,revenue);
 el('demo-reset').trigger('click');assert.equal(el('demo-tasks').textContent,'9');assert.equal(el('demo-revenue').textContent,revenue);assert.equal(el('demo-tax-status').value,'pending');assert.equal(el('demo-total').value,'480');
});
