import Stripe from "stripe";
import admin from "firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 🔥 INIT FIREBASE
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

// 🔥 DISABILITA PARSING (OBBLIGATORIO)
export const config = {
api: {
bodyParser: false,
},
};

export default async function handler(req, res){

if(req.method !== "POST"){
return res.status(405).send("Method not allowed");
}

const sig = req.headers["stripe-signature"];

let event;

try{

const buf = await buffer(req);

event = stripe.webhooks.constructEvent(
buf,
sig,
process.env.STRIPE_WEBHOOK_SECRET
);

}catch(err){

console.error("Webhook error:", err.message);

return res.status(400).send(`Webhook Error: ${err.message}`);
}

// ================= EVENT =================

if(event.type === "checkout.session.completed"){

if(event.type === "checkout.session.completed"){

  const session = await stripe.checkout.sessions.retrieve(
    event.data.object.id,
    {
      expand: ["line_items"]
    }
  );

  const uid = session.client_reference_id;

  if(uid){

    try{

      const priceId = session.line_items.data[0].price.id;

      let plan = "free";

      if(priceId === "price_1TASiWCHMfsTxRqQTQqRzkg0") plan = "investor";
      if(priceId === "price_1TCcaCCHMfsTxRqQBVjFHVRo") plan = "pro";
      if(priceId === "price_1TCccSCHMfsTxRqQie5FtqqC") plan = "pro_yearly";

      await db.collection("users").doc(uid).set({
        plan: plan,
        updatedAt: new Date()
      },{ merge:true });

      console.log("✅ User updated:", uid, plan);

    }catch(e){
      console.error("Firestore error:", e);
    }

  }

}

const uid = session.client_reference_id;

if(uid){

try{

const priceId = session.line_items?.data?.[0]?.price?.id;

let plan = "free";

if(priceId === "price_1TASiWCHMfsTxRqQTQqRzkg0") plan = "investor";
if(priceId === "price_1TCcaCCHMfsTxRqQBVjFHVRo") plan = "pro";
if(priceId === "price_1TCccSCHMfsTxRqQie5FtqqC") plan = "pro_yearly";

// 🔥 SALVA
await db.collection("users").doc(uid).set({
plan: plan,
updatedAt: new Date()
},{ merge:true });

console.log("✅ User updated:", uid, plan);

}catch(e){

console.error("Firestore error:", e);

}

}

}

return res.status(200).json({ received: true });

}

// 🔥 BUFFER (OBBLIGATORIO PER STRIPE)
import { buffer } from "micro";
