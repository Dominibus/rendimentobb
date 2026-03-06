const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {

  try {

    const data = JSON.parse(event.body);

    if (data.type === "checkout.session.completed") {

      const session = data.data.object;

      const uid = session.client_reference_id;

      console.log("Pagamento completato per UID:", uid);

      // qui aggiorneremo Firebase
      // (step successivo)

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
