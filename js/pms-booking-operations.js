import {calendarDay} from './pms-calendar.js';
export function bookingOperations(bookings,today){
  return bookings.flatMap(booking=>{
    const status=String(booking.status || '').toLowerCase();
    const code=status==='arrival'?'arrival':status==='checkin'?'departure':null;
    if(!code)return [];
    const dueDate=code==='arrival'?booking.checkin:booking.checkout;
    if(calendarDay(dueDate)===null || dueDate>today)return [];
    return [{bookingId:booking.id,guestName:booking.guestName || '',code,dueDate,overdue:dueDate<today,status:'open',priority:2}];
  }).sort((a,b)=>a.dueDate.localeCompare(b.dueDate)||a.bookingId.localeCompare(b.bookingId));
}
export function operationSelection(bookings,today,filter='due'){
  if(filter==='in_house')return bookings.filter(b=>String(b.status || '').toLowerCase()==='checkin').map(b=>({bookingId:b.id,guestName:b.guestName || '',code:'in_house',dueDate:b.checkout,overdue:calendarDay(b.checkout)!==null && b.checkout<today}));
  return bookingOperations(bookings,today).filter(item=>filter==='due' || item.code===filter);
}
