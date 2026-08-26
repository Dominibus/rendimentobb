import Stripe from "stripe";
import admin from "firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_BY_PLAN = Object.freeze({
  investor: "price_1TASiWCHMfsTxRqQTQqRzkg0",
  pro: "price_1TCcaCCHMfsTxRqQBVjFHVRo",
  pro_yearly: "price_1TCccSCHMfsTxRqQie5FtqqC"
});

function getFirebaseAdmin() {
  if (!admin.apps.length) {
    const {
      FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY
    } = process.env;

    if (
      !FIREBASE_PROJECT_ID ||
      !FIREBASE_CLIENT_EMAIL ||
      !FIREBASE_PRIVATE_KEY
    ) {
      throw new Error("Firebase Admin configuration missing");
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      })
    });
  }

  return admin;
}

function getBearerToken(req) {
  const authorization = req.headers.authorization;

  if (
    typeof authorization !== "string" ||
    !authorization.startsWith("Bearer ")
  ) {
    return null;
  }

  return authorization.slice(7).trim() || null;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const idToken = getBearerToken(req);

  if (!idToken) {
    return res.status(401).json({
      error: "Authentication required"
    });
  }

  const plan =
    typeof req.body?.plan === "string"
      ? req.body.plan.trim().toLowerCase()
      : "";

  const priceId = PRICE_BY_PLAN[plan];

  if (!priceId) {
    return res.status(400).json({
      error: "Invalid plan"
    });
  }

  try {
    const firebaseAdmin = getFirebaseAdmin();

    const decodedToken = await firebaseAdmin
      .auth()
      .verifyIdToken(idToken);

        const uid = decodedToken.uid;

    const email =
      typeof decodedToken.email === "string"
        ? decodedToken.email
        : undefined;

    // ==========================================
    // PROTEZIONE ABBONAMENTI DUPLICATI
    // ==========================================

    const userSnapshot =
      await firebaseAdmin
        .firestore()
        .collection("users")
        .doc(uid)
        .get();

    const currentPlan =
      String(
        userSnapshot.data()?.plan || "free"
      )
        .toLowerCase()
        .trim();

    const paidPlans = [
      "investor",
      "pro",
      "pro_yearly"
    ];

    if(paidPlans.includes(currentPlan)){

      return res.status(409).json({
        error: "Subscription already active",
        code: "ACTIVE_SUBSCRIPTION",
        currentPlan
      });

    }

    const baseUrl = (
      process.env.BASE_URL || "https://rendimentobb.it"
    ).replace(/\/+$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      payment_method_types: ["card"],

      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],

      success_url:
        `${baseUrl}/?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url:
        `${baseUrl}/`,

      client_reference_id: uid,

      customer_email: email,

      metadata: {
        uid,
        plan
      },

      subscription_data: {
        metadata: {
          uid,
          plan
        }
      }
    });

    return res.status(200).json({
      url: session.url
    });
  } catch (error) {
    if (
      error?.code === "auth/id-token-expired" ||
      error?.code === "auth/argument-error" ||
      error?.code === "auth/id-token-revoked"
    ) {
      return res.status(401).json({
        error: "Invalid authentication"
      });
    }

    console.error("Checkout session creation failed", {
      code: error?.code || "unknown"
    });

    return res.status(500).json({
      error: "Unable to create checkout session"
    });
  }
}
