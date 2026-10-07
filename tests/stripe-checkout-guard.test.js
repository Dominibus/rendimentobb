import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { guardedCheckout, CheckoutConflict } from '../lib/stripe-checkout-guard.js';

function harness(initial = { plan: 'free' }) {
  const records = new Map(initial === null ? [] : [['users/u1', structuredClone(initial)]]);
  const sessions = new Map(), keys = new Map();
  let queue = Promise.resolve(), creations = 0, failSave = false, failCreate = false, failExpire = false;
  const db = {
    collection: name => ({ doc: id => ({ key: `${name}/${id}` }) }),
    runTransaction(fn) {
      const run = queue.then(async () => {
        const staged = new Map(records);
        const tx = {
          get: async ref => ({ exists: staged.has(ref.key), data: () => structuredClone(staged.get(ref.key)) }),
          set: (ref, data) => staged.set(ref.key, structuredClone(data)),
          update(ref, data) { if (failSave) { failSave = false; throw Error('persistence'); } staged.set(ref.key, { ...staged.get(ref.key), ...data }); },
          delete: ref => staged.delete(ref.key)
        };
        const result = await fn(tx);
        records.clear(); for (const [key, value] of staged) records.set(key, value);
        return result;
      });
      queue = run.catch(() => {}); return run;
    }
  };
  const stripe = { checkout: { sessions: {
    async create(params, options) {
      if (failCreate) { failCreate = false; throw Error('network'); }
      const existing = keys.get(options.idempotencyKey);
      if (existing) { assert.deepEqual(params, existing.params); return structuredClone(sessions.get(existing.id)); }
      const id = `cs_${++creations}`;
      const session = { id, status: 'open', url: `https://checkout.stripe.com/${id}`, livemode: true, mode: 'subscription', client_reference_id: params.client_reference_id, subscription: 'sub_1' };
      sessions.set(id, session); keys.set(options.idempotencyKey, { id, params: structuredClone(params) });
      return structuredClone(session);
    },
    async retrieve(id) { return structuredClone(sessions.get(id)); },
    async expire(id) { if (failExpire || sessions.get(id).status !== 'open') throw Error('cannot expire'); sessions.get(id).status = 'expired'; return structuredClone(sessions.get(id)); }
  } } };
  const args = { db, stripe, uid: 'u1', plan: 'investor', priceId: 'price_i', email: 'test@example.test', baseUrl: 'https://example.test', liveMode: true };
  return { records, sessions, keys, args, stripe, get creations() { return creations; }, failSave() { failSave = true; }, failCreate() { failCreate = true; }, failExpire() { failExpire = true; }, run: extra => guardedCheckout({ ...args, ...extra }) };
}

test('simultaneous clicks and retries share a single checkout', async () => {
  const h = harness(); const result = await Promise.all(Array.from({ length: 12 }, () => h.run()));
  assert.equal(h.creations, 1); assert.equal(new Set(result.map(s => s.id)).size, 1);
  assert.equal((await h.run()).id, result[0].id);
});
test('replay after Stripe acceptance and failed persistence preserves exact parameters and key', async () => {
  const h = harness(); h.failSave(); await assert.rejects(h.run(), /persistence/);
  const session = await h.run({ email: 'changed@example.test', baseUrl: 'https://changed.test' });
  assert.equal(session.id, 'cs_1'); assert.equal(h.creations, 1);
});
test('network failure does not release an ambiguous attempt', async () => {
  const h = harness(); h.failCreate(); await assert.rejects(h.run(), /network/);
  const first = [...h.records.values()].find(a => a.attemptId).attemptId;
  await h.run(); assert.equal([...h.records.values()].find(a => a.attemptId).attemptId, first);
});
test('completed payment blocks another checkout while webhook is delayed', async () => {
  const h = harness(); await h.run(); h.sessions.get('cs_1').status = 'complete';
  await assert.rejects(h.run(), e => e.code === 'PAYMENT_PROCESSING'); assert.equal(h.creations, 1);
});
test('a completed session is checked even after its original expiry time', async () => {
  const h = harness(); await h.run(); h.sessions.get('cs_1').status = 'complete';
  const lock = [...h.records.values()].find(a => a.attemptId); lock.expiresAt = 1;
  await assert.rejects(h.run(), e => e.code === 'PAYMENT_PROCESSING'); assert.equal(h.creations, 1);
});
test('only provider-confirmed expiration permits a new checkout', async () => {
  const h = harness(); await h.run(); h.sessions.get('cs_1').status = 'expired';
  assert.equal((await h.run()).id, 'cs_2'); assert.equal(h.creations, 2);
});
test('changing plans expires the previous link before creating the replacement', async () => {
  const h = harness(); await h.run(); await h.run({ plan: 'pro', priceId: 'price_p' });
  assert.equal(h.sessions.get('cs_1').status, 'expired'); assert.equal(h.creations, 2);
  assert.equal([...h.keys.values()][1].params.metadata.plan, 'pro');
});
test('failed expiration does not create a second checkout', async () => {
  const h = harness(); await h.run(); h.failExpire();
  await assert.rejects(h.run({ plan: 'pro', priceId: 'price_p' }), /cannot expire/); assert.equal(h.creations, 1);
});
test('paid accounts and missing profiles cannot create sessions', async () => {
  for (const initial of [{ plan: 'investor' }, { plan: 'pro' }, { plan: 'pro_yearly' }, null]) {
    const h = harness(initial); await assert.rejects(h.run(), e => e instanceof CheckoutConflict); assert.equal(h.creations, 0);
  }
});
test('a paid plan becoming active between requests blocks reuse', async () => {
  const h = harness(); await h.run(); h.records.set('users/u1', { plan: 'pro' });
  await assert.rejects(h.run(), e => e.code === 'ACTIVE_SUBSCRIPTION'); assert.equal(h.creations, 1);
});
test('completed checkout can be replaced only after its matching subscription ended', async () => {
  const h = harness(); await h.run(); h.sessions.get('cs_1').status = 'complete';
  h.records.set('users/u1', { plan: 'free', subscriptionId: 'sub_other', subscriptionStatus: 'canceled' });
  await assert.rejects(h.run(), e => e.code === 'PAYMENT_PROCESSING');
  h.records.set('users/u1', { plan: 'free', subscriptionId: 'sub_1', subscriptionStatus: 'canceled' });
  assert.equal((await h.run()).id, 'cs_2');
});
test('user and environment reservations are isolated', async () => {
  const h = harness(); h.records.set('users/u2', { plan: 'free' });
  await h.run(); await h.run({ uid: 'u2' });
  const create = h.stripe.checkout.sessions.create;
  h.stripe.checkout.sessions.create = async (...args) => { const s = await create(...args); s.livemode = false; h.sessions.set(s.id, s); return s; };
  await h.run({ liveMode: false });
  assert.equal(h.creations, 3); assert.equal([...h.records.keys()].filter(k => k.startsWith('_stripe_checkouts/')).length, 3);
  assert.equal(h.records.get('users/u1').plan, 'free');
});
test('sandbox paid plan blocks test checkout without blocking a free live account', async () => {
  const h = harness({ plan: 'free', sandboxPlan: 'investor' });
  await assert.rejects(h.run({ liveMode: false }), e => e.code === 'ACTIVE_SUBSCRIPTION'); await h.run();
});
test('foreign session identity cannot be returned to the user', async () => {
  const h = harness(); await h.run(); h.sessions.get('cs_1').client_reference_id = 'other';
  await assert.rejects(h.run(), /identity mismatch/);
});
test('unknown provider status cannot release a reservation', async () => {
  const h = harness(); await h.run(); h.sessions.get('cs_1').status = 'unknown';
  await assert.rejects(h.run(), /unavailable/); assert.equal(h.creations, 1);
});

test('real API maps checkout conflicts, authenticates first and returns only a URL', async () => {
  const h = harness(); let verified = 0;
  const context = { process: { env: { STRIPE_SECRET_KEY: 'sk_live_mock', BASE_URL: 'https://example.test' } }, console: { error() {} }, Stripe: function () { return h.stripe; }, getStripePrices: () => ({ investor: 'price_i' }), guardedCheckout, CheckoutConflict,
    admin: { apps: [{}], auth: () => ({ verifyIdToken: async () => { verified++; return { uid: 'u1' }; } }), firestore: () => h.args.db } };
  const source = fs.readFileSync(new URL('../api/create-checkout-session.js', import.meta.url), 'utf8').replace(/^import .*;\s*$/gm, '').replace('export default async function handler', 'async function handler');
  vm.createContext(context); vm.runInContext(source + '\nglobalThis.handler=handler', context);
  const send = async (headers = { authorization: 'Bearer token' }, plan = 'investor') => {
    const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await context.handler({ method: 'POST', headers, body: { plan } }, res); return res;
  };
  assert.equal((await send({})).code, 401); assert.equal(verified, 0);
  assert.equal((await send(undefined, 'unknown')).code, 400);
  const ok = await send(); assert.equal(ok.code, 200); assert.deepEqual(Object.keys(ok.body), ['url']);
  h.records.set('users/u1', { plan: 'pro' }); const blocked = await send();
  assert.equal(blocked.code, 409); assert.equal(blocked.body.code, 'ACTIVE_SUBSCRIPTION');
});
