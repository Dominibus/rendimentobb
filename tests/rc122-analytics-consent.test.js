import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ANALYTICS_ID, ANALYTICS_CONSENT_KEY, ANALYTICS_CONSENT_VERSION,
  consentExpiry, readAnalyticsChoice, createAnalyticsConsent} from '../js/analytics-consent.js';
import {TERMS_VERSION} from '../js/subscription-offer.js';
import {CONTRACT_TERMS} from '../js/contract-terms.js';
const now = Date.UTC(2026, 9, 14, 9);
function environment(pathname = '/') {
  const items = new Map(), scripts = [], events = [], removed = [], listeners = {};
  const storage = {getItem:key=>items.get(key)||null, setItem:(key,value)=>items.set(key,value), removeItem:key=>items.delete(key)};
  const window = {location:{origin:'https://www.rendimentobb.it', hostname:'www.rendimentobb.it', pathname},
    gtag(...args){events.push(args);}, addEventListener(name, callback){listeners[name]=callback;}};
  const document = {head:{appendChild:node=>scripts.push(node)}, createElement:()=>({}), referrer:'https://example.test/path?email=private#token'};
  Object.defineProperty(document, 'cookie', {get:()=> '_ga=123; _ga_749B8PW4ST=456; essential_session=keep', set:value=>removed.push(value)});
  return {window,document,storage,items,scripts,events,removed,listeners};
}
test('unknown, obsolete and expired preferences never load Analytics; current consent has an exact expiry',()=>{
  const e=environment(); e.items.set('rb_analytics_consent_v1','granted');
  assert.equal(readAnalyticsChoice(e.storage,now),null);
  const manager=createAnalyticsConsent({...e,clock:()=>now});
  assert.equal(e.scripts.length,0);assert.equal(e.window['ga-disable-'+ANALYTICS_ID],true);
  manager.setChoice('granted');const record=JSON.parse(e.items.get(ANALYTICS_CONSENT_KEY));
  assert.equal(record.version,ANALYTICS_CONSENT_VERSION);assert.equal(record.at,now);
  assert.equal(record.expiresAt,consentExpiry(now));assert.equal(e.items.has('rb_analytics_consent_v1'),false);
  assert.equal(readAnalyticsChoice(e.storage,record.expiresAt-1),'granted');
  assert.equal(readAnalyticsChoice(e.storage,record.expiresAt),null);
});
test('acceptance loads one tag with bounded cookies and no URL query secrets; revocation disables and removes analytics only',()=>{
  const e=environment(), manager=createAnalyticsConsent({...e,clock:()=>now});
  manager.setChoice('granted');manager.setChoice('granted');assert.equal(e.scripts.length,1);
  const config=e.events.find(row=>row[0]==='config')[2];
  assert.equal(config.page_location,'https://www.rendimentobb.it/');
  assert.equal(config.page_referrer,'https://example.test/path');
  assert.equal(config.cookie_expires,180*86400);assert.equal(config.cookie_update,false);
  assert.equal(config.allow_google_signals,false);
  manager.setChoice('denied');assert.equal(e.window['ga-disable-'+ANALYTICS_ID],true);
  assert.ok(e.removed.some(row=>row.includes('domain=rendimentobb.it;')));
  assert.equal(e.removed.some(row=>row.startsWith('essential_session=')),false);
  assert.equal(manager.getChoice(),'denied');
});
test('analytics consent cannot enable tracking on authenticated, guest or withdrawal pages',()=>{
  for(const path of ['/dashboard/','/dashboard-report/','/dashboard-leads/','/guest-report/','/login/','/account-action/','/pro-success/','/withdrawal.html']){
    const e=environment(path), manager=createAnalyticsConsent({...e,clock:()=>now});
    manager.setChoice('granted');assert.equal(e.scripts.length,0,path);
    assert.equal(e.window['ga-disable-'+ANALYTICS_ID],true,path);
  }
});
test('blocked browser storage respects current choice, while expired tabs and another-tab revocation disable tracking',()=>{
  let clock=now;const e=environment();e.storage.setItem=()=>{throw Error('blocked');};
  const manager=createAnalyticsConsent({...e,clock:()=>clock});manager.setChoice('granted');
  assert.equal(manager.getChoice(),'granted');manager.setChoice('denied');assert.equal(manager.getChoice(),'denied');
  const fresh=environment(), m=createAnalyticsConsent({...fresh,clock:()=>clock});m.setChoice('granted');
  clock=consentExpiry(now);fresh.listeners.focus();assert.equal(fresh.window['ga-disable-'+ANALYTICS_ID],true);
  clock=now;m.setChoice('granted');fresh.items.delete(ANALYTICS_CONSENT_KEY);
  fresh.listeners.storage({key:ANALYTICS_CONSENT_KEY});assert.equal(fresh.window['ga-disable-'+ANALYTICS_ID],true);
});
test('public terms and purchase snapshot share the new version and the same renewal and PMS limitations',()=>{
  const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
  assert.equal(CONTRACT_TERMS.version,TERMS_VERSION);assert.ok(read('plans.html').includes(TERMS_VERSION));
  for(const row of CONTRACT_TERMS.terms){
    assert.ok(read('terms.html').includes(row.it),row.it);
    assert.ok(read('terms.html').includes(row.en),row.en);
  }
  assert.ok(CONTRACT_TERMS.terms.some(row=>row.it.includes('Gestisci rinnovo e fatture su Stripe')));
  assert.ok(CONTRACT_TERMS.terms.some(row=>row.it.includes('non equivalgono a incassi verificati')));
  assert.ok(read('privacy.html').includes('id="cookies"'));
});
