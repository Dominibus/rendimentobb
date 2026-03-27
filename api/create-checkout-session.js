import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { plan, uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "Missing uid" });
    }

    // 🔥 PREZZI STRIPE (USA I TUOI price_xxx)
    const prices = {
      investor: "price_INVESTOR_ID",
      pro: "price_PRO_ID",
      pro_yearly: "price_YEARLY_ID"
    };

    const priceId = prices[plan];

    if (!priceId) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url: `https://rendimentobb.it/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://rendimentobb.it/`,

      client_reference_id: uid
    });

    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }

}
