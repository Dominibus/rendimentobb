import {bookingNights as calendarBookingNights,nightsInMonth} from '../../js/pms-calendar.js';
import {investmentAssumptionsHTML} from '../../js/investment-assumptions.js';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../../js/dashboard.js', import.meta.url), 'utf8');
const escapeStart = source.indexOf('const escapeDashboardHTML = value =>');
const escapeSource = source.slice(escapeStart, source.indexOf('// =====================================', escapeStart));
const analysisTemplate = source.match(/card\.innerHTML = (`[\s\S]*?`);\s*list\.appendChild\(card\)/)?.[1];
const propertiesStart = source.indexOf('async function loadProperties(){');
const propertiesEnd = source.indexOf('\n  container.innerHTML = html;\n\n}', propertiesStart);
const propertiesSource = source.slice(propertiesStart, propertiesEnd + '\n  container.innerHTML = html;\n\n}'.length);
const headerStart = source.indexOf('function renderHeader(){');
const headerSource = source.slice(headerStart, source.indexOf('// ================= REAL PORTFOLIO MANAGER', headerStart));

if (!analysisTemplate || propertiesStart < 0 || propertiesEnd < 0 || headerStart < 0) {
  throw new Error('Dashboard render boundaries not found');
}

const base = overrides => ({
  investmentAssumptionsHTML,
  window: { currentUser: { uid: 'test-owner', email: 'test@example.com' }, currentPlan: 'pro' },
  t: (it, en) => it,
  formatCurrency: value => `${Number(value) || 0} €`,
  formatPercent: value => `${Number(value) || 0}%`,
  formatDate: () => '07/10/2026',
  financialNumber: value => Number.isFinite(Number(value)) ? Number(value) : null,
  canViewProfit: () => true,
  canDelete: () => true,
  canUseFirestorePMS: () => true,
  db: {},
  collection: (...args) => args,
  where: (...args) => args,
  query: (...args) => args,
  ...overrides
});

export function renderAnalysis(data) {
  return vm.runInNewContext(`${escapeSource}\n${analysisTemplate}`, base({
    data, badge: '', price: 150000, equity: 30000, roi: -0.9, roiClass: 'negative',
    revenueNeeded: 20000, yearlyProfit: -270
  }));
}

export async function renderProperties(data, id = 'property-1', bookings = []) {
  const container = { innerHTML: '' };
  let reads = 0;
  const context = base({
    document: { getElementById: () => container },
    getDocs: async () => ++reads === 1
      ? { empty: false, docs: [{ id, data: () => data }] }
      : { empty: !bookings.length, docs: bookings.map(b=>({data:()=>b})) },
    calendarBookingNights,
    getBookingNightsInMonth:(checkin,checkout)=>nightsInMonth(checkin,checkout,new Date()),
    getBookingRevenueInMonth:booking=>{const n=calendarBookingNights(booking);return n?Number(booking.totalAmount||0)*nightsInMonth(booking.checkin,booking.checkout,new Date())/n:0;},
    isConfirmedBooking: booking => !['pending','cancelled'].includes(booking.status)
  });
  await vm.runInNewContext(`${escapeSource}\n${propertiesSource}\nloadProperties()`, context);
  return container.innerHTML;
}

export function renderHeader(email, demo = false) {
  const header = { innerHTML: '' };
  vm.runInNewContext(`${escapeSource}\n${headerSource}\nrenderHeader()`, base({
    window: { currentUser: { email }, isDemoDashboard: demo },
    document: { querySelector: () => header }
  }));
  return header.innerHTML;
}
