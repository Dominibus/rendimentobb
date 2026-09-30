import test from "node:test";
import assert from "node:assert/strict";
import { getStripePrices } from "../lib/stripe-plan-config.js";

test("Stripe keys select matching live and sandbox price maps", () => {
  const live = getStripePrices({ STRIPE_SECRET_KEY: "sk_live_placeholder" });
  const sandbox = getStripePrices({ STRIPE_SECRET_KEY: "sk_test_placeholder" });
  assert.equal(live.investor, "price_1TASiWCHMfsTxRqQTQqRzkg0");
  assert.equal(sandbox.investor, "price_1UKvZKCSiGxuH6mMqyRJdpNI");
  assert.equal(sandbox.pro, "price_1UKvgACSiGxuH6mMfGsJTnZd");
  assert.equal(sandbox.pro_yearly, "price_1UKvgXCSiGxuH6mMGWWO0uvf");
  assert.equal(new Set(Object.values(sandbox)).size, 3);
  assert.deepEqual(
    Object.values(live).filter(price => Object.values(sandbox).includes(price)),
    []
  );
});

test("Stripe rejects unknown key modes", () => {
  assert.throws(() => getStripePrices({ STRIPE_SECRET_KEY: "" }), /Unrecognized/);
  assert.throws(() => getStripePrices({ STRIPE_SECRET_KEY: "rk_test_placeholder" }), /Unrecognized/);
});

import { assertStripeEventMode } from "../lib/stripe-plan-config.js";
test("webhooks reject cross-mode events and test keys in production",()=>{
  assert.doesNotThrow(()=>assertStripeEventMode({livemode:true},{STRIPE_SECRET_KEY:"sk_live_example",VERCEL_ENV:"production"}));
  assert.doesNotThrow(()=>assertStripeEventMode({livemode:false},{STRIPE_SECRET_KEY:"sk_test_example",VERCEL_ENV:"preview"}));
  assert.throws(()=>assertStripeEventMode({livemode:false},{STRIPE_SECRET_KEY:"sk_live_example"}));
  assert.throws(()=>assertStripeEventMode({livemode:true},{STRIPE_SECRET_KEY:"sk_test_example"}));
  assert.throws(()=>assertStripeEventMode({livemode:false},{STRIPE_SECRET_KEY:"sk_test_example",VERCEL_ENV:"production"}));
  assert.throws(()=>assertStripeEventMode({},{STRIPE_SECRET_KEY:"sk_live_example"}));
});

test("checkout price configuration refuses test keys on production",()=>{
 assert.throws(()=>getStripePrices({STRIPE_SECRET_KEY:"sk_test_example",VERCEL_ENV:"production"}));
});
