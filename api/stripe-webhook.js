import { stripeFieldName, buildStripeEntitlementUpdate } from "../lib/stripe-entitlements.js";
import { canApplyStripeBinding, checkoutIdentityMatches } from "../lib/stripe-subscription-binding.js";
import Stripe from "stripe"; 
import admin from "firebase-admin";
import { getStripePrices, assertStripeEventMode } from "../lib/stripe-plan-config.js";

const stripe =
  new Stripe(
    process.env.STRIPE_SECRET_KEY
  );

const IS_LIVE_STRIPE = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_");

const PLAN_BY_PRICE_ID = Object.freeze(
  Object.fromEntries(
    Object.entries(getStripePrices()).map(([plan, price]) => [price, plan])
  )
);

// Stripe richiede il body grezzo
// per verificare la firma.
export const config = {
  api: {
    bodyParser: false
  }
};

function getFirestore(){

  if(!admin.apps.length){

    const {
      FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY
    } = process.env;

    if(
      !FIREBASE_PROJECT_ID ||
      !FIREBASE_CLIENT_EMAIL ||
      !FIREBASE_PRIVATE_KEY
    ){

      throw new Error(
        "Firebase Admin configuration missing"
      );

    }

    admin.initializeApp({

      credential:
        admin.credential.cert({

          projectId:
            FIREBASE_PROJECT_ID,

          clientEmail:
            FIREBASE_CLIENT_EMAIL,

          privateKey:
            FIREBASE_PRIVATE_KEY.replace(
              /\\n/g,
              "\n"
            )

        })

    });

  }

  return admin.firestore();

}

async function readRawBody(req){

  const chunks = [];

  for await(const chunk of req){

    chunks.push(
      Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(chunk)
    );

  }

  return Buffer.concat(chunks);

}

function getStripeId(value){

  if(typeof value === "string"){
    return value;
  }

  if(
    value &&
    typeof value.id === "string"
  ){
    return value.id;
  }

  return null;

}

function getSubscriptionPriceId(
  subscription
){

  return (
    subscription
      ?.items
      ?.data
      ?.[0]
      ?.price
      ?.id ||
    null
  );

}

function getSubscriptionPlan(
  subscription
){

  const priceId =
    getSubscriptionPriceId(
      subscription
    );

  return (
    PLAN_BY_PRICE_ID[priceId] ||
    null
  );

}

async function findUserId(
  db,
  {
    metadataUid,
    customerId,
    subscriptionId
  } = {}
){

  if(
    typeof metadataUid === "string" &&
    metadataUid.trim()
  ){

    return metadataUid.trim();

  }

  if(customerId){

    const customerQuery =
      await db
        .collection("users")
        .where(
          stripeFieldName("stripeCustomerId", IS_LIVE_STRIPE),
          "==",
          customerId
        )
        .limit(1)
        .get();

    if(!customerQuery.empty){

      return (
        customerQuery.docs[0].id
      );

    }

  }

  if(subscriptionId){

    const subscriptionQuery =
      await db
        .collection("users")
        .where(
          stripeFieldName("subscriptionId", IS_LIVE_STRIPE),
          "==",
          subscriptionId
        )
        .limit(1)
        .get();

    if(!subscriptionQuery.empty){

      return (
        subscriptionQuery.docs[0].id
      );

    }

  }

  return null;

}

async function updateUserPlan(
  db,
  uid,
  data,
  event,
  binding
){

  const userRef =
    db.collection("users").doc(uid);

  return db.runTransaction(
    async transaction => {

      const userSnapshot =
        await transaction.get(userRef);

      // Billing never creates profiles or trusts metadata without checking the binding.
      if(!userSnapshot.exists){
        console.warn("Stripe entitlement update skipped", {eventId: event.id, eventType: event.type, reason: "profile_missing"});
        return false;
      }
      const currentData = userSnapshot.data();
      if(!canApplyStripeBinding(currentData, event, binding)){
        console.warn("Stripe entitlement update skipped", {eventId: event.id, eventType: event.type, reason: "subscription_binding_mismatch_or_terminal"});
        return false;
      }

      const incomingEventCreated =
        Number(event?.created || 0);

      const lastEventCreated =
        Number(
          currentData[stripeFieldName("lastStripeEventCreated", event.livemode)] ||
          0
        );

      const lastEventId =
        currentData[stripeFieldName("lastStripeEventId", event.livemode)] ||
        null;

      if(
        event?.id === lastEventId ||
        incomingEventCreated <
          lastEventCreated
      ){
        return false;
      }

      transaction.set(
        userRef,
        {
          ...buildStripeEntitlementUpdate(data, event),
          [stripeFieldName("updatedAt", event.livemode)]: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          merge: true
        }
      );

      return true;

    }
  );

}

export default async function handler(
  req,
  res
){

  res.setHeader(
    "Cache-Control",
    "no-store"
  );

  if(req.method !== "POST"){

    res.setHeader(
      "Allow",
      "POST"
    );

    return res
      .status(405)
      .json({
        error:
          "Method not allowed"
      });

  }

  const signature =
    req.headers[
      "stripe-signature"
    ];

  if(!signature){

    return res
      .status(400)
      .json({
        error:
          "Missing Stripe signature"
      });

  }

  let event;

  try{

    const rawBody =
      await readRawBody(req);

    event =
      stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env
          .STRIPE_WEBHOOK_SECRET
      );

  }
  catch(error){

    console.error(
      "Stripe webhook signature verification failed"
    );

    return res
      .status(400)
      .json({
        error:
          "Invalid webhook signature"
      });

  }

  try{
    assertStripeEventMode(event);
  }catch(error){
    console.error("Stripe event environment mismatch");
    return res.status(400).json({error: "Stripe event environment mismatch"});
  }

  try{

    const db =
      getFirestore();

    // ==================================
    // PAGAMENTO CHECKOUT COMPLETATO
    // ==================================

    if(
      event.type ===
      "checkout.session.completed"
    ){

      const session =
        await stripe
          .checkout
          .sessions
          .retrieve(
            event.data.object.id,
            {
              expand: [
                "line_items"
              ]
            }
          );

      const uid =
        session
          .client_reference_id;

      const priceId =
        session
          .line_items
          ?.data
          ?.[0]
          ?.price
          ?.id;

      const subscriptionId = getStripeId(session.subscription);
      const subscription = subscriptionId
        ? await stripe.subscriptions.retrieve(subscriptionId)
        : null;
      const subscriptionPriceId = getSubscriptionPriceId(subscription);
      const plan = PLAN_BY_PRICE_ID[priceId];

      if(!uid){

        return res
          .status(400)
          .json({
            error:
              "Missing user reference"
          });

      }

      if(!plan){

        return res
          .status(400)
          .json({
            error:
              "Unknown Stripe price"
          });

      }

      if (
        session.mode !== "subscription" ||
        !subscription ||
        subscriptionPriceId !== priceId ||
        !checkoutIdentityMatches(session, subscription)
      ) {
        return res.status(400).json({ error: "Subscription does not match checkout" });
      }

      const status = String(subscription.status || "");
      const hasAccess = ["active", "trialing"].includes(status) &&
        ["paid", "no_payment_required"].includes(session.payment_status);

      await updateUserPlan(
        db,
        uid,
        {
          plan: hasAccess ? plan : "free",

          stripeSessionId:
            session.id,

          stripeCustomerId:
            getStripeId(
              session.customer
            ),

          subscriptionId,

          subscriptionStatus: status,

          cancelAtPeriodEnd:
            subscription.cancel_at_period_end === true
        },
        event,
        { source: "checkout", customerId: getStripeId(session.customer), subscriptionId }
      );

    }

    // ==================================
    // ABBONAMENTO AGGIORNATO
    // ==================================

    if(
      event.type ===
      "customer.subscription.updated"
    ){

      // Read the current resource: a delayed snapshot must not restore obsolete status.
      const subscription = await stripe.subscriptions.retrieve(event.data.object.id);

      const customerId =
        getStripeId(
          subscription.customer
        );

      const subscriptionId =
        getStripeId(
          subscription
        );

      const uid =
        await findUserId(
          db,
          {
            metadataUid:
              subscription
                .metadata
                ?.uid,

            customerId,

            subscriptionId
          }
        );

      if(uid){

        const status =
          String(
            subscription.status ||
            ""
          );

        const plan =
          getSubscriptionPlan(
            subscription
          );

        const accessStatuses = [
          "active",
          "trialing",
          "past_due"
        ];

        const hasAccess =
          accessStatuses.includes(
            status
          );

        await updateUserPlan(
          db,
          uid,
          {
            plan:
              hasAccess && plan
                ? plan
                : "free",

            stripeCustomerId:
              customerId,

            subscriptionId,

            subscriptionStatus:
              status,

            cancelAtPeriodEnd:
              subscription
                .cancel_at_period_end ===
              true,

            currentPeriodEnd:
              Number(
                subscription
                  .current_period_end ||
                0
              )
          },
          event,
          { source: "subscription", customerId, subscriptionId }
        );

      }

    }

    // ==================================
    // ABBONAMENTO CANCELLATO/SCADUTO
    // ==================================

    if(
      event.type ===
      "customer.subscription.deleted"
    ){

      const subscription =
        event.data.object;

      const customerId =
        getStripeId(
          subscription.customer
        );

      const subscriptionId =
        getStripeId(
          subscription
        );

      const uid =
        await findUserId(
          db,
          {
            metadataUid:
              subscription
                .metadata
                ?.uid,

            customerId,

            subscriptionId
          }
        );

      if(uid){

        await updateUserPlan(
          db,
          uid,
          {
            plan:
              "free",

            subscriptionStatus:
              "canceled",

            cancelAtPeriodEnd:
              false,

            // Retain the canceled ID as a tombstone against delayed updates.
            subscriptionId
          },
          event,
          { source: "subscription", customerId, subscriptionId }
        );

      }

    }

    // ==================================
    // PAGAMENTO RINNOVO FALLITO
    // Mantiene temporaneamente il piano
    // durante il periodo di recupero.
    // ==================================

    if(
      event.type ===
      "invoice.payment_failed"
    ){

      const invoice =
        event.data.object;

      const customerId =
        getStripeId(
          invoice.customer
        );

      const subscriptionId =
        getStripeId(
          invoice.subscription
        );

      const uid =
        await findUserId(
          db,
          {
            customerId,
            subscriptionId
          }
        );

      if(uid){

        await updateUserPlan(
          db,
          uid,
          {
            subscriptionStatus:
              "past_due"
          },
          event,
          { source: "invoice", customerId, subscriptionId }
        );

      }

    }

    return res
      .status(200)
      .json({
        received: true
      });

  }
  catch(error){

    console.error(
      "Stripe webhook processing failed",
      {
        eventId:
          event?.id,

        eventType:
          event?.type,

        code:
          error?.code ||
          "unknown"
      }
    );

    return res
      .status(500)
      .json({
        error:
          "Webhook processing failed"
      });

  }

}
