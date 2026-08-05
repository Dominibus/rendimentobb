import Stripe from "stripe";
import admin from "firebase-admin";
import { buffer } from "micro";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
  });
}

const db = admin.firestore();

export const config = {
  api: {
    bodyParser: false
  }
};

const PLAN_BY_PRICE_ID = {
  price_1TASiWCHMfsTxRqQTQqRzkg0: "investor",
  price_1TCcaCCHMfsTxRqQBVjFHVRo: "pro",
  price_1TCccSCHMfsTxRqQie5FtqqC: "pro_yearly"
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).json({
      error: "Missing Stripe signature"
    });
  }

  let event;

  try {
    const rawBody = await buffer(req);

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed");

    return res.status(400).json({
      error: "Invalid webhook signature"
    });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = await stripe.checkout.sessions.retrieve(
        event.data.object.id,
        {
          expand: ["line_items"]
        }
      );

      const uid = session.client_reference_id;
      const priceId = session.line_items?.data?.[0]?.price?.id;
      const plan = PLAN_BY_PRICE_ID[priceId];

      if (!uid) {
        console.error("Stripe webhook missing client_reference_id");

        return res.status(400).json({
          error: "Missing user reference"
        });
      }

      if (!plan) {
        console.error("Stripe webhook received unknown price");

        return res.status(400).json({
          error: "Unknown Stripe price"
        });
      }

      await db.collection("users").doc(uid).set(
        {
          plan,
          stripeSessionId: session.id,
          stripeCustomerId:
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id || null,
          subscriptionId:
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id || null,
          subscriptionStatus: "active",
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          merge: true
        }
      );

      console.log("Stripe subscription activated", {
        uid,
        plan,
        eventId: event.id
      });
    }

    return res.status(200).json({
      received: true
    });
  } catch (error) {
    console.error("Stripe webhook processing failed", {
      eventId: event?.id,
      eventType: event?.type
    });

    return res.status(500).json({
      error: "Webhook processing failed"
    });
  }
}
