const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();

exports.handler = async (event, context) => {

  try {

    const data = JSON.parse(event.body);

    if (data.type === "checkout.session.completed") {

      const session = data.data.object;

      const uid = session.client_reference_id;

      console.log("Pagamento completato per UID:", uid);

      if (uid) {

        await db.collection("users")
          .doc(uid)
          .set(
            {
              plan: "pro",
              proActivatedAt: new Date()
            },
            { merge: true }
          );

        console.log("Utente aggiornato a PRO");

      }

    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (err) {

    console.error(err);

    return {
      statusCode: 500,
      body: "Webhook error"
    };

  }

};
