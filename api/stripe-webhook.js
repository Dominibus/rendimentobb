import Stripe from "stripe";
import admin from "firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLAN_BY_PRICE_ID = {
  price_1TASiWCHMfsTxRqQTQqRzkg0: "investor",
  price_1TCcaCCHMfsTxRqQBVjFHVRo: "pro",
  price_1TCccSCHMfsTxRqQie5FtqqC: "pro_yearly"
};

// Stripe richiede il body grezzo per verificare la firma.
export const config = {
  api: {
    bodyParser: false
  }
};

function getFirestore() {
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !privateKey
    ) {
      throw new Error("Firebase Admin configuration missing");
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey.replace(/\\n/g, "\n")
      })
    });
  }

  return admin.firestore();
}

async function readRawBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(
      Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(chunk)
    );
  }

  return Buffer.concat(chunks);
}

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
    const rawBody = await readRawBody(req);

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
      const priceId =
        session.line_items?.data?.[0]?.price?.id;

      if (!uid) {
        console.error("Stripe webhook missing user reference", {
          eventId: event.id
        });

        return res.status(400).json({
          error: "Missing user reference"
        });
      }

      const plan = PLAN_BY_PRICE_ID[priceId];

      if (!plan) {
        console.error("Stripe webhook unknown price", {
          eventId: event.id,
          priceId: priceId || null
        });

        return res.status(400).json({
          error: "Unknown Stripe price"
        });
      }

      const db = getFirestore();

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
          updatedAt:
            admin.firestore.FieldValue.serverTimestamp()
        },
        {
          merge: true
        }
      );

      console.log("Stripe subscription activated", {
        eventId: event.id,
        uid,
        plan
      });
    }

    return res.status(200).json({
      received: true
    });
  } catch (error) {
    console.error("Stripe webhook processing failed", {
      eventId: event?.id,
      eventType: event?.type,
      message: error?.message
    });

    return res.status(500).json({
      error: "Webhook processing failed"
    });
  }
}
