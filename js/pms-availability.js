import {calendarDay, stayNights} from './pms-calendar.js?v=20261004-rc11';
const statuses = new Set(['pending','arrival','checkin','checkout','completed','cancelled']);
export function bookingStatus(value) {
  return value == null || value === '' ? 'arrival' : String(value).trim().toLowerCase();
}
export function isKnownBookingStatus(value) { return statuses.has(bookingStatus(value)); }
export function canAdvanceBooking(current, next) {
  return ({pending:'arrival',arrival:'checkin',checkin:'checkout',checkout:'completed'})[bookingStatus(current)] === next;
}
export function evaluateAvailability(candidate, bookings, excludeId = null) {
  if(!candidate?.propertyId || !stayNights(candidate.checkin,candidate.checkout)) return {available:false,reason:'invalid_dates'};
  if(!isKnownBookingStatus(candidate.status)) return {available:false,reason:'invalid_status'};
  if(['pending','cancelled'].includes(bookingStatus(candidate.status))) return {available:true};
  const arrival = calendarDay(candidate.checkin), departure = calendarDay(candidate.checkout);
  for(const booking of bookings || []) {
    if(booking.id === excludeId || booking.propertyId !== candidate.propertyId) continue;
    if(['pending','cancelled'].includes(bookingStatus(booking.status))) continue;
    // An occupied stay with invalid dates cannot establish availability safely.
    if(!stayNights(booking.checkin,booking.checkout)) return {available:false,reason:'invalid_existing_dates',bookingId:booking.id};
    if(arrival < calendarDay(booking.checkout) && departure > calendarDay(booking.checkin)) return {available:false,reason:'conflict',bookingId:booking.id};
  }
  return {available:true};
}
export function createBookingOperationGuard() {
  const active = new Set();
  return async function(key, action) {
    if(active.has(key)) return false;
    active.add(key);
    try { return await action(); } finally { active.delete(key); }
  };
}
