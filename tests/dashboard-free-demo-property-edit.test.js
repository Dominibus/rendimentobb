import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { renderProperties } from './helpers/dashboard-html-harness.js';
const source = await readFile(new URL('../js/dashboard.js', import.meta.url), 'utf8');
const accessStart = source.indexOf('function getDashboardAccess(){');
const access = source.slice(accessStart, source.indexOf('function isPro(){', accessStart));
const eventStart = source.indexOf('document.addEventListener("rb_plan_ready", ()=>{');
const event = source.slice(eventStart, source.indexOf('window.addEventListener(\n  "analysisSaved"', eventStart));
const functions = ['canUsePMS', 'canExportPDF', 'canUseFirestorePMS'].map(name =>
  source.match(new RegExp(`function ${name}\\(\\)\\{[\\s\\S]*?\\n}`))?.[0]).join('\n');

test('plan-ready repeated events preserve demo for logged-in Free and anonymous demo', () => {
  for (const plan of ['free', 'demo', 'investor', 'pro', 'pro_yearly']) {
    const nodes = new Map(); let handler;
    const c = { window: { currentPlan: plan, currentUser: plan === 'demo' ? null : { uid: 'owner' } },
      document: { addEventListener: (name, fn) => handler = fn, querySelectorAll: selector => {
        if (!nodes.has(selector)) nodes.set(selector, [{ style: {} }]); return nodes.get(selector);
      } } };
    c.window.getUserAccess = () => ({ isFree: plan === 'free', isInvestor: plan === 'investor', isPro: ['pro', 'pro_yearly'].includes(plan), isAdmin: false });
    vm.createContext(c); vm.runInContext(access + functions + event, c);
    handler(); handler();
    const demo = plan === 'free' || plan === 'demo';
    assert.equal(c.window.isDemoDashboard, demo, plan);
    assert.equal(c.window.isDemoData, demo, plan);
    assert.equal(c.canUsePMS(), true, plan);
    assert.equal(!!c.canUseFirestorePMS(), !demo, 'demo never grants database writes');
  }
});

test('property card offers explicit edit action even without a linked analysis', async () => {
  const html = await renderProperties({ name: 'Casa', city: 'Roma' });
  assert.match(html, /onclick="openPropertyEditor\(this.dataset.propertyId\)">\s*✏️ Modifica immobile/);
});

test('paid editor opens existing property with saved fields and editing ID', async () => {
  const start = source.indexOf('window.openPropertyEditor = async function(id){');
  const editor = source.slice(start, source.indexOf('function populatePropertyAnalysisSelect()', start));
  for (const plan of ['investor', 'pro']) {
    const nodes = new Map();
    const c = { window: { currentUser: { uid: 'owner' }, currentPlan: plan },
      canUseFirestorePMS: () => true, db: {}, doc: (db, collection, id) => id,
      getDoc: async () => ({ exists: () => true, data: () => ({ name: "Casa D'Angelo", city: 'Napoli', address: 'Via Roma', priceNight: 120, analysisId: 'a1' }) }),
      populatePropertyAnalysisSelect: () => {}, updatePropertyTouristTaxVisibility: () => {}, t: it => it,
      document: { getElementById: id => { if (!nodes.has(id)) nodes.set(id, { style: {} }); return nodes.get(id); } } };
    vm.createContext(c); vm.runInContext(editor, c);
    await c.window.openPropertyEditor('property-1');
    assert.equal(c.window.editingPropertyId, 'property-1');
    assert.equal(nodes.get('property-name').value, "Casa D'Angelo");
    assert.equal(nodes.get('property-price').value, 120);
    assert.equal(nodes.get('property-analysis').value, 'a1');
    assert.equal(nodes.get('property-modal').style.display, 'flex');
    c.canUseFirestorePMS = () => false;
    nodes.get('property-modal').style.display = 'none';
    await c.window.openPropertyEditor('property-1');
    assert.equal(nodes.get('property-modal').style.display, 'none');
  }
});
