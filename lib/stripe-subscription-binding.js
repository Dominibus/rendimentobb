import { stripeFieldName } from './stripe-entitlements.js';

const terminalStatuses = new Set(['canceled', 'incomplete_expired']);
const paidPlans = new Set(['investor', 'pro', 'pro_yearly']);
const id = value => typeof value === 'string' ? value : value?.id;

// Checkout is the only path allowed to establish or replace a binding.
// Lifecycle events can only update the exact customer/subscription already stored.
export function canApplyStripeBinding(account, event, binding){
  if(typeof event?.livemode !== 'boolean' || !binding?.customerId || !binding?.subscriptionId) return false;
  const field = name => account[stripeFieldName(name, event.livemode)];
  const subscriptionId = field('subscriptionId');
  const customerId = field('stripeCustomerId');
  const terminal = terminalStatuses.has(field('subscriptionStatus'));
  const sameSubscription = subscriptionId === binding.subscriptionId;
  if(binding.source === 'checkout'){
    if(sameSubscription) return customerId === binding.customerId && !terminal;
    if(subscriptionId) return terminal;
    // Do not overwrite a paid legacy account whose binding needs reconciliation.
    return !paidPlans.has(field('plan'));
  }
  return ['subscription', 'invoice'].includes(binding.source) &&
    sameSubscription && customerId === binding.customerId && !terminal;
}

export function checkoutIdentityMatches(session, subscription){
  const uid = session?.client_reference_id;
  return typeof uid === 'string' && uid.trim().length > 0 &&
    session.metadata?.uid === uid && subscription?.metadata?.uid === uid &&
    Boolean(id(session.customer)) && id(session.customer) === id(subscription.customer) &&
    id(session.subscription) === id(subscription);
}
