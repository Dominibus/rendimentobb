const LIVE_PRICES = Object.freeze({
  investor: "price_1TASiWCHMfsTxRqQTQqRzkg0",
  pro: "price_1TCcaCCHMfsTxRqQBVjFHVRo",
  pro_yearly: "price_1TCccSCHMfsTxRqQie5FtqqC"
});

const TEST_PRICES = Object.freeze({
  investor: "price_1UKvZKCSiGxuH6mMqyRJdpNI",
  pro: "price_1UKvgACSiGxuH6mMfGsJTnZd",
  pro_yearly: "price_1UKvgXCSiGxuH6mMGWWO0uvf"
});

export function getStripePrices(env = process.env) {
  const secretKey = env.STRIPE_SECRET_KEY || "";
  const testMode = secretKey.startsWith("sk_test_");
  const liveMode = secretKey.startsWith("sk_live_");
  if (!testMode && !liveMode) {
    throw new Error("Unrecognized Stripe key mode");
  }

  const prices = testMode ? TEST_PRICES : LIVE_PRICES;

  if (Object.values(prices).some(id => !/^price_[A-Za-z0-9]+$/.test(id || ""))) {
    throw new Error("Stripe prices are not configured for this environment");
  }
  if (new Set(Object.values(prices)).size !== 3) {
    throw new Error("Stripe plans must have distinct prices");
  }
  return Object.freeze(prices);
}
