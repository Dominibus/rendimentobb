import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc, getDoc, deleteDoc, writeBatch, collection, query, where, getDocs } from 'firebase/firestore';

const projectId = 'demo-rendimentobb-security';
const profiles = {
  free: { plan: 'free' }, investor: { plan: 'investor' },
  pro: { plan: 'pro' }, annual: { plan: 'pro_yearly' },
  legacyPaid: { plan: 'pro' }, normalized: { plan: ' Investor ' },
  nullSession: { plan: 'investor', stripeSessionId: null },
  sandboxOnly: { plan: 'free', sandboxPlan: 'pro' },
  testMode: { plan: 'pro', stripeLiveMode: false },
  legacyTest: { plan: 'pro', stripeSessionId: 'cs_test_legacy' },
  live: { plan: 'pro', stripeLiveMode: true, stripeSessionId: 'cs_live_current' },
  explicitLive: { plan: 'investor', stripeLiveMode: true, stripeSessionId: 'cs_test_legacy' },
  forgedRole: { plan: 'free', role: 'admin' }, unknown: { plan: 'enterprise' }
};
let env;
const dbFor = (uid, claims = {}) => env.authenticatedContext(uid, {
  email: `${uid}@example.invalid`, email_verified: true, ...claims
}).firestore();

before(async () => {
  // No production project or credentials: this suite requires the local emulator.
  assert.match(process.env.FIRESTORE_EMULATOR_HOST || '', /^(127\.0\.0\.1|localhost):8089$/);
  env = await initializeTestEnvironment({ projectId, firestore: {
    host: '127.0.0.1', port: 8089,
    rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8')
  }});
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    for (const [uid, profile] of Object.entries(profiles)) {
      await setDoc(doc(db, 'users', uid), { email: `${uid}@example.invalid`, role: 'user', ...profile });
      await setDoc(doc(db, 'analyses', uid), { uid, roi: -0.9, city: 'Roma', isPortfolio: false });
      await setDoc(doc(db, 'properties', uid), { uid, name: 'Casa test', city: 'Roma' });
      await setDoc(doc(db, 'bookings', uid), { uid, propertyId: uid, guestName: 'Test', guestPortal: { enabled: false } });
    }
    await setDoc(doc(db, 'leads', 'private'), { email: 'lead@example.invalid' });
  });
});
after(async () => { if (env) await env.cleanup(); });

for (const uid of ['investor', 'pro', 'annual', 'legacyPaid', 'normalized', 'nullSession', 'live', 'explicitLive']) {
  test(`${uid}: own analysis/property creates and updates remain allowed`, async () => {
    const db = dbFor(uid);
    await assertSucceeds(setDoc(doc(db, 'analyses', `${uid}-new`), { uid, roi: -0.9, city: 'Roma' }));
    await assertSucceeds(updateDoc(doc(db, 'analyses', uid), { isPortfolio: true }));
    await assertSucceeds(setDoc(doc(db, 'properties', `${uid}-new`), { uid, name: 'Casa' }));
    await assertSucceeds(updateDoc(doc(db, 'properties', uid), { name: 'Casa aggiornata', renovationPlan: { notes: 'Test' } }));
  });
}
for (const uid of ['free', 'sandboxOnly', 'testMode', 'legacyTest', 'forgedRole', 'unknown', 'noProfile']) {
  test(`${uid}: client claims cannot grant paid writes`, async () => {
    const db = dbFor(uid, { plan: 'pro', role: 'admin' });
    await assertFails(setDoc(doc(db, 'analyses', `${uid}-blocked`), { uid, roi: 10 }));
    await assertFails(setDoc(doc(db, 'properties', `${uid}-blocked`), { uid, name: 'Casa' }));
    if (uid !== 'noProfile') {
      await assertFails(updateDoc(doc(db, 'analyses', uid), { roi: 25 }));
      await assertFails(updateDoc(doc(db, 'properties', uid), { name: 'Blocked' }));
      await assertSucceeds(getDoc(doc(db, 'analyses', uid)));
      await assertSucceeds(getDoc(doc(db, 'properties', uid)));
      await assertSucceeds(getDoc(doc(db, 'bookings', uid)));
    }
  });
}
test('anonymous cannot read or write any private account resources', async () => {
  const db = env.unauthenticatedContext().firestore();
  for (const name of ['users', 'analyses', 'properties', 'bookings']) {
    await assertFails(getDoc(doc(db, name, 'pro')));
    await assertFails(setDoc(doc(db, name, 'anonymous'), { uid: 'pro' }));
  }
});
test('paid account cannot read/write another account or reassign ownership', async () => {
  const db = dbFor('pro');
  for (const name of ['users', 'analyses', 'properties', 'bookings']) {
    await assertFails(getDoc(doc(db, name, 'investor')));
    await assertFails(updateDoc(doc(db, name, 'investor'), { name: 'Wrong owner' }));
  }
  for (const name of ['analyses', 'properties']) {
    await assertFails(setDoc(doc(db, name, 'cross-owner'), { uid: 'investor' }));
    await assertFails(updateDoc(doc(db, name, 'pro'), { uid: 'investor' }));
  }
  await assertFails(getDocs(collection(db, 'properties')));
  await assertSucceeds(getDocs(query(collection(db, 'properties'), where('uid', '==', 'pro'))));
});
test('Free cannot change protected entitlement fields, including sandbox fields', async () => {
  const db = dbFor('free');
  for (const patch of [{plan:'pro'}, {role:'admin'}, {isAdmin:true}, {sandboxPlan:'pro'}, {stripeLiveMode:true}]) {
    await assertFails(updateDoc(doc(db, 'users', 'free'), patch));
  }
  await assertSucceeds(updateDoc(doc(db, 'users', 'free'), { 'notificationPreferences.pmsReminderEmail': false }));
});
test('account creation accepts Free and rejects self-issued paid/admin accounts', async () => {
  const uid = 'signup'; const db = dbFor(uid);
  const base = { email: `${uid}@example.invalid`, role: 'user' };
  await assertFails(setDoc(doc(db, 'users', uid), { ...base, plan: 'pro' }));
  await assertFails(setDoc(doc(db, 'users', uid), { ...base, plan: 'free', role: 'admin' }));
  await assertSucceeds(setDoc(doc(db, 'users', uid), { ...base, plan: 'free' }));
});
test('analysis/property linked batch still works for a paid account', async () => {
  const uid = 'pro'; const db = dbFor(uid); const batch = writeBatch(db);
  batch.set(doc(db, 'properties', 'linked-pro'), { uid, name: 'Linked', analysisId: 'pro', investmentSnapshot: { roi: -0.9 } });
  batch.update(doc(db, 'analyses', 'pro'), { propertyId: 'linked-pro', isPortfolio: true });
  await assertSucceeds(batch.commit());
});
test('booking business mutations remain server-only for every plan', async () => {
  for (const uid of ['free', 'investor', 'pro', 'annual']) {
    const db = dbFor(uid);
    await assertFails(setDoc(doc(db, 'bookings', `${uid}-new`), { uid }));
    await assertFails(updateDoc(doc(db, 'bookings', uid), { status: 'checked_in' }));
    await assertFails(deleteDoc(doc(db, 'bookings', uid)));
    await assertFails(deleteDoc(doc(db, 'properties', uid)));
  }
});
test('paid owner can enable guest link; Free can only revoke their own link', async () => {
  const portal = { enabled: true, tokenHash: 'a'.repeat(64), expiresAt: '2026-10-15T00:00:00.000Z', createdAt: '2026-10-07T00:00:00.000Z' };
  await assertSucceeds(updateDoc(doc(dbFor('pro'), 'bookings', 'pro'), { guestPortal: portal }));
  await assertFails(updateDoc(doc(dbFor('free'), 'bookings', 'free'), { guestPortal: portal }));
  await assertSucceeds(updateDoc(doc(dbFor('free'), 'bookings', 'free'), { guestPortal: { enabled: false, tokenHash: '', expiresAt: '', revokedAt: '2026-10-07T00:00:00.000Z' } }));
  await assertFails(updateDoc(doc(dbFor('pro'), 'bookings', 'investor'), { guestPortal: portal }));
});
test('verified existing admin exception does not grant cross-account access', async () => {
  const db = dbFor('admin', { email: 'rendimentobb@gmail.com', email_verified: true });
  await assertSucceeds(setDoc(doc(db, 'analyses', 'admin-new'), { uid: 'admin' }));
  await assertSucceeds(getDoc(doc(db, 'leads', 'private')));
  await assertFails(getDoc(doc(db, 'properties', 'pro')));
  const unverified = dbFor('unverifiedAdmin', { email: 'rendimentobb@gmail.com', email_verified: false });
  await assertFails(setDoc(doc(unverified, 'analyses', 'unverified-new'), { uid: 'unverifiedAdmin' }));
});
test('downgraded owner can read and delete their own saved analysis', async () => {
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, 'users', 'downgraded'), { plan: 'free', role: 'user', email: 'downgraded@example.invalid' });
    await setDoc(doc(db, 'analyses', 'old-analysis'), { uid: 'downgraded', roi: -0.9 });
  });
  const db = dbFor('downgraded');
  await assertSucceeds(getDoc(doc(db, 'analyses', 'old-analysis')));
  await assertFails(updateDoc(doc(db, 'analyses', 'old-analysis'), { roi: 20 }));
  await assertSucceeds(deleteDoc(doc(db, 'analyses', 'old-analysis')));
});
