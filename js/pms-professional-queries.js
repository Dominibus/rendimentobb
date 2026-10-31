// Read-only views of the existing PMS model. No new availability or financial rules.
import {calendarDay, stayNights} from './pms-calendar.js';
import {bookingStatus, isKnownBookingStatus, evaluateAvailability} from './pms-availability.js';

export function inspectProfessionalBookings(bookings, today) {
  if(calendarDay(today)===null)return null;
  // Bound a conversational scan; never describe an unscanned directory as conflict-free.
  if(bookings.length>2000)return {state:'too_large',today};
  const active=bookings.filter(b=>!['pending','cancelled'].includes(bookingStatus(b.status)));
  const counts=new Map();
  for(const b of bookings)counts.set(b.id,(counts.get(b.id)||0)+1);
  const invalid=new Set(active.filter(b=>!isKnownBookingStatus(b.status)||!stayNights(b.checkin,b.checkout)||
    typeof b.id!=='string'||!b.id||counts.get(b.id)!==1));
  const valid=active.filter(b=>!invalid.has(b)),inConflict=new Set(),groups=new Map();
  for(const b of valid){
    if(!groups.has(b.propertyId))groups.set(b.propertyId,[]);
    groups.get(b.propertyId).push(b);
  }
  // In each date-ordered group the furthest checkout covers every earlier active
  // interval. Use the canonical decision for that pair, without an O(n²) UI scan.
  for(const rows of groups.values()){
    rows.sort((a,b)=>a.checkin.localeCompare(b.checkin)||a.checkout.localeCompare(b.checkout));
    let cover=null;
    for(const row of rows){
      if(cover&&evaluateAvailability(row,[cover]).reason==='conflict'){
        inConflict.add(row);inConflict.add(cover);
      }
      if(!cover||row.checkout>cover.checkout)cover=row;
    }
  }
  const conflicts=valid.filter(b=>inConflict.has(b));
  return {state:'ready',today,invalidCount:invalid.size,
    arrivals:valid.filter(b=>b.checkin===today),conflicts};
}
