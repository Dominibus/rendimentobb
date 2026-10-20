// RC156 public examples. Pure calculations and fictional data only.
import {calculateROI} from './roi-engine.js';
import {stayNights} from './pms-calendar.js';
export function investmentExample({capital,rate,occupancy,costs}){
  if(![capital,rate,occupancy,costs].every(Number.isFinite) || capital<=0 || capital>1e9 || rate<0 || rate>100000 || occupancy<0 || occupancy>100 || costs<0 || costs>100) throw new RangeError('invalid_demo_inputs');
  return calculateROI({price:capital,equity:capital,loanAmount:0,priceNight:rate,occupancy,expenses:costs,expensesUnit:'percentage',commission:0,tax:0,interestRate:0,loanYears:20});
}
export function exampleBookings(){return [
  {id:'example-1',guest:1,checkin:'2026-10-03',checkout:'2026-10-06',amount:330,cleaningDone:true},
  {id:'example-2',guest:2,checkin:'2026-10-10',checkout:'2026-10-14',amount:480,cleaningDone:false},
  {id:'example-3',guest:3,checkin:'2026-10-19',checkout:'2026-10-22',amount:360,cleaningDone:false}
];}
export function exampleMetrics(bookings){
  const nights=bookings.reduce((sum,b)=>sum+stayNights(b.checkin,b.checkout),0);
  const revenue=bookings.reduce((sum,b)=>sum+b.amount,0);
  return {nights,revenue,occupancy:nights/31*100,adr:nights?revenue/nights:0,revpar:revenue/31,tasks:bookings.filter(b=>!b.cleaningDone).length};
}
export function exampleDayOccupied(bookings,day){return bookings.some(b=>b.checkin<=day&&day<b.checkout);}
