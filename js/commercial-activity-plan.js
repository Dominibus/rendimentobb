// RC195: economic planning only. No receipts, storage, bookings or account access.
import {calculateCommercial} from './commercial-property-engine.js';

export function createCommercialActivityPlan(model){
 const result=calculateCommercial(model);
 const sum=rows=>rows.reduce((n,r)=>n+r,0);
 const months=Array.from({length:12},(_,i)=>{
  const month=i+1,prefix=`${model.year}-${String(month).padStart(2,'0')}`;
  const first=prefix+'-01',days=new Date(Date.UTC(model.year,month,0)).getUTCDate(),last=prefix+'-'+days;
  const calendar=result.calendar.filter(r=>r.date.startsWith(prefix));
  const uses=new Map();for(const row of calendar)if(!row.closed&&row.assignmentId)uses.set(row.assignmentId,(uses.get(row.assignmentId)||0)+1);
  const contracts=model.assignments.filter(a=>a.start<=last&&a.end>=first).map(a=>{
   const start=a.start>first?a.start:first,end=a.end<last?a.end:last;
   const units=a.mode==='per_use'?(uses.get(a.id)||0):((Date.parse(end+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/86400000+1)/days;
   const contractualGross=a.amount*units,expectedGross=contractualGross*a.expectedPct/100;
   const expectedNet=a.vat.status==='unknown'?null:expectedGross/(a.vat.status==='taxable'?1+a.vat.rate/100:1);
   return {id:a.id,roomId:a.roomId,code:a.code,mode:a.mode,units,contractualGross,expectedGross,expectedNet,start:a.start,end:a.end};
  });
  const capacity=calendar.filter(r=>!r.closed).length,reserved=calendar.filter(r=>!r.closed&&r.assignmentId).length;
  return {month,contracts,capacity,reserved,free:capacity-reserved,contractualGross:sum(contracts.map(a=>a.contractualGross)),expectedGross:sum(contracts.map(a=>a.expectedGross)),expectedNet:contracts.every(a=>a.expectedNet!==null)?sum(contracts.map(a=>a.expectedNet)):null,starts:contracts.filter(a=>a.start>=first&&a.start<=last),ends:contracts.filter(a=>a.end>=first&&a.end<=last)};
 });
 return {schema:'commercial-activity-plan-v1',year:model.year,status:'planning_only',receipts:null,months};
}
