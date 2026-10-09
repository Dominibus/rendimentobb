import {startAccountTrial,createAccountPortal,getAccountContract,SubscriptionError} from '../lib/account-subscription-service.js';
import {TERMS_VERSION} from '../js/subscription-offer.js';
import { guardedCheckout, CheckoutConflict } from "../lib/stripe-checkout-guard.js";
import Stripe from "stripe";
import admin from "firebase-admin";
import { getStripePrices } from "../lib/stripe-plan-config.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_BY_PLAN = getStripePrices();

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

  const action = req.body?.action || "checkout";
  if (!["checkout","trial","portal","contract"].includes(action)) return res.status(400).json({code:"INVALID_ACTION"});
  if (action === "checkout" && !priceId) {
    return res.status(400).json({
      error: "Invalid plan"
    });
  }

  try {
    const firebaseAdmin = getFirebaseAdmin();

    const decodedToken = await firebaseAdmin
      .auth()
      .verifyIdToken(idToken, true);

    const uid = decodedToken.uid;

    const email =
      typeof decodedToken.email === "string"
        ? decodedToken.email
        : undefined;

    const baseUrl = (process.env.BASE_URL || "https://rendimentobb.it").replace(/\/+$/, "");
    const db=firebaseAdmin.firestore();
    const liveMode=!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_");
    if(action === "contract") return res.status(200).json(await getAccountContract({db,uid,liveMode}));
    if(action === "trial"){
      const testEmail=String(process.env.RB_TRIAL_TEST_EMAIL || "").trim().toLowerCase();
      const isDesignatedTest=!!testEmail && decodedToken.email_verified===true && String(email||"").trim().toLowerCase()===testEmail;
      if(process.env.RB_INVESTOR_TRIAL_ENABLED !== "true" && !isDesignatedTest) return res.status(503).json({code:"TRIAL_NOT_ENABLED"});
      const result=await startAccountTrial({db,uid,email,emailVerified:decodedToken.email_verified===true,liveMode,
        termsVersion:req.body?.termsVersion,acceptedTerms:req.body?.acceptedTerms,
        timestamp:ms=>firebaseAdmin.firestore.Timestamp.fromMillis(ms)});
      return res.status(200).json(result);
    }
    if(action === "portal"){
      return res.status(200).json(await createAccountPortal({db,stripe,uid,liveMode,baseUrl,locale:req.body?.locale}));
    }
    if(req.body?.acceptedTerms !== true || req.body?.termsVersion !== TERMS_VERSION){
      return res.status(400).json({code:"TERMS_REQUIRED"});
    }
    const session = await guardedCheckout({
      db: firebaseAdmin.firestore(), stripe, uid, plan, priceId, email, baseUrl,
      liveMode: !process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
    });

    return res.status(200).json({
      url: session.url
    });
  } catch (error) {
    if(error instanceof SubscriptionError) return res.status(error.status).json({code:error.code});
    if (error instanceof CheckoutConflict) {
      return res.status(409).json({ error: "Checkout unavailable", code: error.code });
    }

    if (
      error?.code === "auth/id-token-expired" ||
      error?.code === "auth/argument-error" ||
      error?.code === "auth/id-token-revoked" ||
      error?.code === "auth/user-disabled" || error?.code === "auth/invalid-id-token"
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
