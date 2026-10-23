// Fictional fixture; uses the production calendar and task rules, with no account access.
import {stayNights,weekendStayNights,calendarDayDifference} from './pms-calendar.js';
import {dailyChecklist} from './pms-daily-checklist.js';
export const DEMO_TODAY='2026-10-10';
export function createDemoBookings(){return [
 {id:'demo-1',guestName:'Ospite demo 1',checkin:'2026-10-03',checkout:'2026-10-06',guests:2,totalAmount:330,status:'completed',guestRegistration:{documentsReceived:2,authorityStatus:'submitted'},touristTax:{enabled:true,amount:12,status:'paid',collectionTime:'checkin'},cleaning:{required:true,status:'completed',scheduledDate:'2026-10-06'},guestIssue:{active:false}},
 {id:'demo-2',guestName:'Ospite demo 2',checkin:'2026-10-10',checkout:'2026-10-14',guests:2,totalAmount:480,status:'arrival',guestRegistration:{documentsReceived:1,authorityStatus:'pending'},touristTax:{enabled:true,amount:16,status:'pending',collectionTime:'checkin'},cleaning:{required:true,status:'pending',scheduledDate:'2026-10-14'},guestIssue:{active:true,category:'maintenance',priority:'high',status:'open',note:'Esempio: controllo climatizzatore / Example: check air conditioning'}},
 {id:'demo-3',guestName:'Ospite demo 3',checkin:'2026-10-19',checkout:'2026-10-22',guests:3,totalAmount:360,status:'arrival',guestRegistration:{documentsReceived:0,authorityStatus:'pending'},touristTax:{enabled:true,amount:18,status:'pending',collectionTime:'checkin'},cleaning:{required:true,status:'pending',scheduledDate:'2026-10-22'},guestIssue:{active:false}}
].map(b=>({...b,propertyId:'demo-property',propertyName:'Residenza Esempio'}));}
export function demoDayState(bookings,date){
 const matches=bookings.filter(b=>!['cancelled','pending'].includes(b.status)&&b.checkin<=date&&date<=b.checkout);
 return {bookings:matches,state:matches.some(b=>b.checkout===date)?'departure':matches.some(b=>b.checkin===date)?'arrival':matches.length?'stay':'available'};
}
export function demoMetrics(bookings){
 const active=bookings.filter(b=>!['cancelled','pending'].includes(b.status));
 const nights=active.reduce((n,b)=>n+stayNights(b.checkin,b.checkout),0),revenue=active.reduce((n,b)=>n+b.totalAmount,0);
 return {revenue,nights,occupancy:nights/31*100,adr:nights?revenue/nights:0,revpar:revenue/31,tasks:dailyChecklist(bookings,DEMO_TODAY,'all').length};
}
export function demoTasks(bookings,filter='all'){return dailyChecklist(bookings,DEMO_TODAY,filter);}
export function demoTax(booking,taxableGuests){
 if(!Number.isInteger(taxableGuests)||taxableGuests<0||taxableGuests>booking.guests)throw new RangeError('invalid_taxable_guests');
 // Fictional EUR2 per guest/night, maximum5 nights; not any municipality's rule.
 return taxableGuests*Math.min(stayNights(booking.checkin,booking.checkout),5)*2;
}
export function demoPrice(booking,season='auto'){
 if(!['auto','high','medium','low'].includes(season))throw new RangeError('invalid_season');
 const nights=stayNights(booking.checkin,booking.checkout),baseADR=120;
 const month=Number(booking.checkin.slice(5,7));
 const level=season==='auto'?([6,7,8,9].includes(month)?'high':[3,4,5,10].includes(month)?'medium':'low'):season;
 const seasonFactor={high:1.15,medium:1.07,low:.92}[level];
 const weekendFactor=1+weekendStayNights(booking.checkin,booking.checkout)/nights*.12;
 const lengthFactor=nights>=14?.92:nights>=7?.95:nights===1?1.10:1;
 const lead=calendarDayDifference(DEMO_TODAY,booking.checkin),leadFactor=lead>=0&&lead<=3?.92:lead>=60?1.03:1;
 const adr=Math.round(Math.min(baseADR*1.45,Math.max(baseADR*.75,baseADR*seasonFactor*weekendFactor*lengthFactor*leadFactor)));
 return {adr,total:adr*nights,level,nights,seasonFactor,weekendFactor,lengthFactor,leadFactor};
}
export function updateDemoBooking(booking,values){
 for(const key of ['documentsReceived','taxableGuests','totalAmount'])if(values[key]===null||values[key]===undefined||String(values[key]).trim()==='')throw new RangeError('invalid_booking_values');
 const received=Number(values.documentsReceived),taxable=Number(values.taxableGuests),amount=Number(values.totalAmount);
 if(!Number.isInteger(received)||received<0||received>booking.guests||!Number.isFinite(amount)||amount<=0||amount>1000000)throw new RangeError('invalid_booking_values');
 const enums={status:['arrival','checkin','checkout','completed','cancelled'],authorityStatus:['pending','submitted','not_required'],taxStatus:['pending','paid','exempt'],cleaningStatus:['pending','scheduled','completed'],issueStatus:['open','in_progress','resolved']};
 for(const [key,allowed]of Object.entries(enums))if(!allowed.includes(values[key]))throw new RangeError('invalid_'+key);
 if(values.authorityStatus==='submitted'&&received<booking.guests)throw new RangeError('authority_requires_documents');
 const taxAmount=demoTax(booking,taxable);
 if(values.taxStatus==='exempt'&&taxable!==0)throw new RangeError('exemption_requires_zero');
 return {...booking,status:values.status,totalAmount:amount,guestRegistration:{documentsReceived:received,authorityStatus:values.authorityStatus,completed:received===booking.guests&&['submitted','not_required'].includes(values.authorityStatus)},touristTax:{...booking.touristTax,amount:taxAmount,taxableGuests:taxable,status:values.taxStatus},cleaning:{...booking.cleaning,status:values.cleaningStatus,completed:values.cleaningStatus==='completed'},guestIssue:{...booking.guestIssue,status:values.issueStatus,resolved:values.issueStatus==='resolved'}};
}
