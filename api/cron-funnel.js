import { Resend } from "resend";
import admin from "firebase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

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

export default async function handler(req, res){

  try{

    const now = Date.now();

    const snapshot = await db.collection("email_funnel").get();

    for(const doc of snapshot.docs){

      const data = doc.data();
      const createdAt = data.createdAt?.toMillis?.() || now;

      const email = data.email;
      const roi   = data.roi;
      const city  = data.city;

      const steps = data.steps || [];
      const sentSteps = data.sentSteps || [];

      for(let i=0; i<steps.length; i++){

        const step = steps[i];

        // già inviato
        if(sentSteps.includes(i)) continue;

        const shouldSend = now >= (createdAt + step.delay);

        if(!shouldSend) continue;

        // ================= EMAIL =================
        let subject = "";
        let html = "";

        if(step.type === "reminder_1"){
          subject = "⏳ Hai controllato davvero questo investimento?";
          html = `<h2>Reminder: ${roi}% può essere fuorviante</h2>`;
        }

        if(step.type === "reminder_2"){
          subject = "⚠️ Ultima occasione per analizzare questo investimento";
          html = `<h2>Ultimo reminder: evita errori costosi</h2>`;
        }

        // skip instant (già inviato)
        if(step.type === "instant") continue;

        try{

          await resend.emails.send({
            from: "RendimentoBB <analisi@rendimentobb.it>",
            to: [email],
            subject,
            html
          });

          console.log("📩 SENT:", email, step.type);

          // aggiorna step inviato
          await db.collection("email_funnel").doc(doc.id).update({
            sentSteps: [...sentSteps, i]
          });

        }catch(e){
          console.error("Email error:", e.message);
        }

      }

    }

    return res.status(200).json({ success:true });

  }catch(err){

    console.error(err);

    return res.status(500).json({
      error:"cron error"
    });

  }
}
