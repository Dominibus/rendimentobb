import {CONTRACT_TERMS} from '../js/contract-terms.js';
import {TERMS_VERSION} from '../js/subscription-offer.js';
import { randomUUID, createHash } from 'node:crypto';
import { getBillingPlanForScope } from '../js/account-plan.js';
import { stripeFieldName } from './stripe-entitlements.js';

const paidPlans = new Set(['investor', 'pro', 'pro_yearly']);
export class CheckoutConflict extends Error {
  constructor(code) { super(code); this.code = code; }
}

// One server-only record per account and billing environment, not per click.
// Stripe calls stay outside Firestore transactions (transactions can retry).
export async function guardedCheckout({ db, stripe, uid, plan, priceId, email, baseUrl, liveMode }) {
  const userRef = db.collection('users').doc(uid);
  const scope = liveMode ? 'live' : 'test';
  const key = createHash('sha256').update(`${scope}:${uid}`).digest('hex');
  const ref = db.collection('_stripe_checkouts').doc(key);
  for (let round = 0; round < 3; round++) {
    const attempt = await db.runTransaction(async tx => {
      const user = await tx.get(userRef);
      const lock = await tx.get(ref);
      if (!user.exists) throw new CheckoutConflict('PROFILE_REQUIRED');
      if (paidPlans.has(getBillingPlanForScope(user.data(), !liveMode))) {
        throw new CheckoutConflict('ACTIVE_SUBSCRIPTION');
      }
      if (lock.exists) return lock.data();
      const value = {
        attemptId: randomUUID(), plan, priceId, baseUrl,
        email: email || null, termsVersion: TERMS_VERSION, termsSnapshot: CONTRACT_TERMS, acceptedAt: new Date().toISOString(), expiresAt: Math.floor(Date.now() / 1000) + 3600
      };
      tx.set(ref, value);
      return value;
    });

    const params = {
      mode: 'subscription', payment_method_types: ['card'],
      line_items: [{ price: attempt.priceId, quantity: 1 }],
      success_url: `${attempt.baseUrl}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${attempt.baseUrl}/`, client_reference_id: uid,
      ...(attempt.email ? { customer_email: attempt.email } : {}),
      metadata: { uid, plan: attempt.plan, ...(attempt.termsVersion ? {termsVersion:attempt.termsVersion,acceptedAt:attempt.acceptedAt} : {}) },
      subscription_data: { metadata: { uid, plan: attempt.plan } },
      expires_at: attempt.expiresAt
    };
    // If a process died after Stripe accepted the request but before persistence,
    // replay the exact payload and key. Never discard an ambiguous attempt.
    let session = attempt.sessionId
      ? await stripe.checkout.sessions.retrieve(attempt.sessionId)
      : await stripe.checkout.sessions.create(params, { idempotencyKey: `rb-checkout-${attempt.attemptId}` });
    if (session.client_reference_id !== uid || session.livemode !== liveMode || session.mode !== 'subscription') {
      throw new Error('Checkout identity mismatch');
    }
    if (!attempt.sessionId) {
      await db.runTransaction(async tx => {
        const current = await tx.get(ref);
        if (current.data()?.attemptId === attempt.attemptId) tx.update(ref, { sessionId: session.id });
      });
    }

    // Changing plan first invalidates the previous payment link at Stripe.
    // If payment won the race, expiration fails and no replacement is created.
    if (session.status === 'open' && (attempt.plan !== plan || attempt.priceId !== priceId || attempt.termsVersion !== TERMS_VERSION)) {
      session = await stripe.checkout.sessions.expire(session.id);
      if (session.status !== 'expired') throw new CheckoutConflict('PAYMENT_PROCESSING');
    }
    if (session.status === 'expired' || session.status === 'complete') {
      const released = await db.runTransaction(async tx => {
        const user = await tx.get(userRef);
        const current = await tx.get(ref);
        const data = user.data() || {};
        const field = name => data[stripeFieldName(name, liveMode)];
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        const ended = subscriptionId && field('subscriptionId') === subscriptionId
          && ['canceled', 'incomplete_expired'].includes(field('subscriptionStatus'));
        if (session.status === 'complete' && !ended) throw new CheckoutConflict('PAYMENT_PROCESSING');
        if (current.data()?.attemptId !== attempt.attemptId) return false;
        tx.delete(ref);
        return true;
      });
      if (released || round < 2) continue;
    }
    if (session.status !== 'open' || typeof session.url !== 'string' || !session.url.startsWith('https://checkout.stripe.com/')) {
      throw new Error('Checkout session unavailable');
    }
    if (attempt.plan !== plan || attempt.priceId !== priceId) throw new CheckoutConflict('CHECKOUT_IN_PROGRESS');
    // A concurrent cancellation/replacement must not return an obsolete link.
    const valid = await db.runTransaction(async tx => {
      const user = await tx.get(userRef);
      const current = await tx.get(ref);
      if (!user.exists) throw new CheckoutConflict('PROFILE_REQUIRED');
      if (paidPlans.has(getBillingPlanForScope(user.data() || {}, !liveMode))) throw new CheckoutConflict('ACTIVE_SUBSCRIPTION');
      return current.data()?.attemptId === attempt.attemptId;
    });
    if (valid) return session;
  }
  throw new CheckoutConflict('CHECKOUT_IN_PROGRESS');
}
