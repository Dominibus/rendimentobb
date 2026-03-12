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

await db.collection("users").doc(uid).update({
plan:"pro",
proActivatedAt:new Date()
});

console.log("User upgraded to PRO:",uid);

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
