import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const helpers = source.slice(
  source.indexOf('// ================= PROPERTY LISTING SECURITY ================='),
  source.indexOf('// ================= AUTO LOAD PROPERTY FROM TOOL (NUOVO) =================')
);
const entry = source.slice(
  source.indexOf('// ================= AUTO LOAD PROPERTY FROM TOOL (NUOVO) ================='),
  source.indexOf('// ================= ANALYZE BUTTON FIX (CRITICO) =================')
);
const loader = source.slice(
  source.indexOf('async function loadPropertyFromLink(){'),
  source.indexOf('// ================= MORTGAGE RATE AUTO UPDATE =================')
);

function setup(search = ''){
  const storage = new Map();
  const handlers = {};
  const timers = [];
  const sourceBox = { children: [], replaceChildren(...children){ this.children = children; } };
  Object.defineProperty(sourceBox, 'innerHTML', { set(){ throw new Error('Untrusted listing must never use innerHTML'); } });
  const input = { value: '' };
  const context = {
    URL, URLSearchParams,
    window: { location: { search }, currentCity: 'roma' },
    t: it => it,
    appDebugWarn(){},
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: key => storage.delete(key)
    },
    setTimeout(fn){ timers.push(fn); },
    document: {
      getElementById: id => id === 'property-source' ? sourceBox : id === 'listing_url' ? input : null,
      querySelector: () => null,
      createElement: tag => ({ tag, style: {}, textContent: '' }),
      addEventListener: (name, fn) => { handlers[name] = fn; }
    }
  };
  vm.createContext(context);
  vm.runInContext(helpers, context);
  return { context, storage, handlers, timers, sourceBox, input };
}

test('listing URL validation preserves legitimate property links and canonicalizes whitespace', () => {
  const { context } = setup();
  for(const url of ['https://www.idealista.it/immobile/123456/', 'https://www.immobiliare.it/annunci/123456/?utm_source=test', 'http://example.com/roma']){
    assert.equal(context.getSafePropertyListingURL(`  ${url}  `), url);
  }
});

test('listing URL validation refuses executable schemes, credentials and embedded control characters', () => {
  const { context } = setup();
  for(const url of ['javascript:alert(1)', 'data:text/html,<script>1</script>', 'file:///tmp/test', '//example.com/roma', '/roma', 'https:example.com', 'https://user:password@example.com/roma', 'https://exam\nple.com', 'not a URL', '']){
    assert.equal(context.getSafePropertyListingURL(url), '', url);
  }
});

test('listing markup and quotes become inert link text, with a protected external target', () => {
  const { context, sourceBox } = setup();
  const payload = 'https://example.com/" data-rc-probe="injected"><img src=x onerror=alert(1)>';
  context.renderPropertyListingSource(payload);
  const anchor = sourceBox.children.find(node => node.tag === 'a');
  assert.ok(anchor);
  assert.equal(anchor.href, new URL(payload).href);
  assert.equal(anchor.textContent, anchor.href);
  assert.equal(anchor.target, '_blank');
  assert.equal(anchor.rel, 'noopener noreferrer');
  assert.deepEqual(sourceBox.children.map(node => node.tag), ['strong', 'br', 'a', 'div']);
  assert.equal(anchor['data-rc-probe'], undefined);
});

test('invalid listing source has an actionable message and no clickable link', () => {
  const { context, sourceBox } = setup();
  context.renderPropertyListingSource('javascript:alert(1)');
  assert.equal(sourceBox.children.length, 1);
  assert.match(sourceBox.children[0].textContent, /Link annuncio non valido/);
  assert.match(sourceBox.children[0].textContent, /manualmente/);
});

test('query listing is validated before storage and delayed analysis', () => {
  const url = 'https://www.idealista.it/immobile/123456/';
  const { context, handlers, timers, storage, input } = setup(`?listing=${encodeURIComponent(url)}`);
  let analyzed;
  context.analyzePropertyFromTool = value => { analyzed = value; };
  vm.runInContext(entry, context);
  handlers.DOMContentLoaded();
  assert.equal(storage.get('property_link'), url);
  assert.equal(input.value, url);
  timers.forEach(fn => fn());
  assert.equal(analyzed, url);
});

test('invalid query clears stale listing links and never triggers analysis', () => {
  const { context, handlers, timers, storage, sourceBox } = setup('?listing=javascript%3Aalert(1)');
  storage.set('property_link', 'https://example.com/old-roma');
  storage.set('listing_url', 'https://example.com/old-napoli');
  vm.runInContext(entry, context);
  handlers.DOMContentLoaded();
  assert.equal(storage.has('property_link'), false);
  assert.equal(storage.has('listing_url'), false);
  assert.equal(timers.length, 0);
  assert.equal(sourceBox.children.some(node => node.tag === 'a'), false);
});

test('legacy unsafe stored link is rejected before scraper or city detection', async () => {
  const { context, storage, sourceBox } = setup();
  storage.set('property_link', 'javascript:alert("napoli")');
  context.scrapePropertyFromBrowser = () => { throw new Error('Scraper must not run'); };
  vm.runInContext(loader, context);
  await context.loadPropertyFromLink();
  assert.equal(storage.has('property_link'), false);
  assert.equal(context.window.currentCity, 'roma');
  assert.equal(sourceBox.children.some(node => node.tag === 'a'), false);
});

test('legitimate stored property link retains source display and city detection', async () => {
  const { context, storage, sourceBox } = setup();
  const url = 'https://example.com/napoli/annuncio-123';
  storage.set('property_link', url);
  vm.runInContext(loader, context);
  await context.loadPropertyFromLink();
  assert.equal(sourceBox.children.find(node => node.tag === 'a').href, url);
  assert.equal(context.window.currentCity, 'napoli');
});
