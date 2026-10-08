import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { renderAnalysis, renderProperties, renderHeader } from './helpers/dashboard-html-harness.js';

const payload = `"><img src=x onerror="window.__injected=1"><svg onload="window.__injected=2">O'Brien & Casa</svg>`;

test('saved analysis city is text, not an injected HTML element', () => {
  const html = renderAnalysis({ city: payload, id: 'analysis-1', risk: 41 });
  assert.ok(html.includes('&lt;img src=x onerror=&quot;window.__injected=1&quot;&gt;'));
  assert.ok(html.includes('O&#039;Brien &amp; Casa'));
  assert.doesNotMatch(html, /<(?:img|svg)\b/i);
  assert.match(html, /-0\.9%/);
});

test('analysis IDs cannot create attributes or elements', () => {
  const html = renderAnalysis({ city: 'Roma', id: `a" autofocus onfocus="window.__injected=1"><img src=x>`, risk: 41 });
  const ids = [...html.matchAll(/data-id="([^"]*)"/g)].map(match => match[1]);
  assert.equal(ids.length, 2);
  assert.ok(ids.every(id => id.startsWith('a&quot; autofocus onfocus=&quot;')));
  assert.doesNotMatch(html, /<(?:img|svg)\b/i);
});

test('missing or non-string legacy cities do not crash the card', () => {
  for (const city of [null, undefined, 123, { legacy: true }]) {
    assert.doesNotThrow(() => renderAnalysis({ city, id: 'legacy', risk: 0 }));
  }
});

test('property name, city, address and legacy nightly price cannot inject markup', async () => {
  const html = await renderProperties({ name: payload, city: payload, address: payload, priceNight: payload });
  assert.doesNotMatch(html, /<img\b|<svg\s+onload=/i);
  assert.equal(html.split('&lt;img src=x').length - 1, 4);
  assert.ok(html.includes('O&#039;Brien &amp; Casa'));
});

test('property IDs stay in data attributes and never enter inline JavaScript', async () => {
  const id = `p');window.__injected=1;//" autofocus onfocus="window.__injected=2`;
  const html = await renderProperties({ name: 'Casa', city: 'Roma', priceNight: 120 }, id);
  const attributes = [...html.matchAll(/data-property-id="([^"]*)"/g)];
  assert.equal(attributes.length, 4);
  assert.ok(attributes.every(([, value]) => value.includes('&#039;') && value.includes('&quot;')));
  const calls = [];
  const methods = ['openBookings', 'openRenovationPlanner', 'openPropertyEditor', 'deleteProperty'];
  for (const method of methods) {
    const handler = html.match(new RegExp(`onclick="(${method}\\([^\"]*\\))"`))?.[1];
    assert.equal(handler, `${method}(this.dataset.propertyId)`);
    const context = { target: { dataset: { propertyId: id } }, [method]: value => calls.push([method, value]) };
    vm.runInNewContext(`(function(){${handler}}).call(target)`, context);
  }
  assert.deepEqual(calls, methods.map(method => [method, id]));
});

test('account email is escaped both as visible text and as title', () => {
  const html = renderHeader(payload, true);
  assert.doesNotMatch(html, /<(?:img|svg)\b/i);
  assert.match(html, /title="&quot;&gt;&lt;img/);
  assert.equal(html.split('O&#039;Brien &amp; Casa').length - 1, 2);
  assert.match(html, /href="\/tool\/"/);
});

test('ordinary names, Unicode and fallback values keep their display and actions', async () => {
  const html = await renderProperties({ name: 'Residenza De Luca 🏠', city: 'Napoli', address: 'Via Roma 12', priceNight: 120 });
  assert.ok(html.includes('Residenza De Luca 🏠'));
  assert.ok(html.includes('📍 Napoli'));
  assert.ok(html.includes('Via Roma 12'));
  assert.ok(html.includes('€120'));
  assert.equal((html.match(/data-property-id="property-1"/g) || []).length, 4);
  const empty = await renderProperties({});
  assert.ok(empty.includes('📍 -'));
  assert.ok(empty.includes('€0'));
});
