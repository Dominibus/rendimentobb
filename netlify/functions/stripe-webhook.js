const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const admin = require("firebase-admin");

if (!admin.apps.length) {

admin.initializeApp({
credential: admin.credential.cert({
projectId: process.env.FIREBASE_PROJECT_ID,
clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g,"\n")
})
});

}

const db = admin.firestore();

exports.handler = async (event) => {

const sig = event.headers["stripe-signature"];

let stripeEvent;

try{

stripeEvent = stripe.webhooks.constructEvent(
event.body,
sig,
process.env.STRIPE_WEBHOOK_SECRET
);

}catch(err){

return {
statusCode:400,
body:`Webhook error: ${err.message}`
};

}

if(stripeEvent.type === "checkout.session.completed"){

const session = stripeEvent.data.object;

const uid = session.client_reference_id;

if(uid){

try{

// 🔥 PRENDI IMPORTO
const amount = session.amount_total;

// 🔥 LOGICA PIANI
let plan = "free";

if(amount === 1900){
plan = "investor"; // 19€
}

if(amount === 2900){
plan = "pro"; // 29€
}

if(amount === 19900){
plan = "pro_yearly"; // 199€
}

// 🔥 SALVA
await db.collection("users").doc(uid).set({
plan: plan,
updatedAt: new Date()
},{ merge:true });

console.log("User plan updated:",uid,plan);

}catch(e){

console.log("Firestore update error",e);

}

}

}

return {
statusCode:200,
body:JSON.stringify({received:true})
};

};
