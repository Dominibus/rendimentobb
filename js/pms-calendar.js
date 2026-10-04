// PMS stays use civil calendar days, never elapsed 24-hour periods.
const DAY_MS = 86400000;
export function calendarDay(value) {
  if(typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  if(year < 1000 || year > 9999) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const date = new Date(stamp);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? stamp / DAY_MS : null;
}
export function calendarDayDifference(start, end) {
  const a = calendarDay(start), b = calendarDay(end);
  return a === null || b === null ? null : b - a;
}
export function stayNights(checkin, checkout) {
  const count = calendarDayDifference(checkin, checkout);
  return count !== null && count > 0 ? count : 0;
}
export function bookingNights(booking) {
  if(booking?.checkin || booking?.checkout) return stayNights(booking.checkin, booking.checkout);
  if(typeof booking?.nights !== "number" && typeof booking?.nights !== "string") return 0;
  const count = Number(booking?.nights);
  return Number.isSafeInteger(count) && count > 0 ? count : 0;
}
export function nightsInMonth(checkin, checkout, referenceDate = new Date()) {
  const start = calendarDay(checkin), end = calendarDay(checkout);
  if(start === null || end === null || end <= start || !(referenceDate instanceof Date) || !Number.isFinite(referenceDate.getTime())) return 0;
  const year = referenceDate.getFullYear(), month = referenceDate.getMonth();
  const first = Date.UTC(year, month, 1) / DAY_MS;
  const next = Date.UTC(year, month + 1, 1) / DAY_MS;
  return Math.max(0, Math.min(end, next) - Math.max(start, first));
}
export function weekendStayNights(checkin, checkout) {
  const start = calendarDay(checkin), count = stayNights(checkin, checkout);
  if(start === null || !count) return 0;
  // Complete weeks contain exactly Friday and Saturday; inspect only the remainder.
  let weekend = Math.floor(count / 7) * 2;
  for(let i = 0; i < count % 7; i++) {
    const weekday = new Date((start + i) * DAY_MS).getUTCDay();
    if(weekday === 5 || weekday === 6) weekend++;
  }
  return weekend;
}
