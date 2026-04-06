import { Resend } from "resend";
import admin from "firebase-admin";

// ================= RESEND =================
const resend = new Resend(process.env.RESEND_API_KEY);

// ================= FIREBASE INIT =================
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
          : undefined
      })
    });
  } catch (e) {
    console.error("Firebase init error:", e.message);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

// ================= HANDLER =================
export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  try{

    let { type="simulatore", email, city, budget, roi, plan } = req.body || {};

    email = String(email || "").trim();
    city = String(city || "").toLowerCase();
    roi = Number(roi || 0);

    if(!email){
      return res.status(400).json({ error:"Email richiesta" });
    }

    const roiRounded = Number(roi.toFixed(1));

    let score = "cold";
    if(roiRounded > 12) score = "hot";
    else if(roiRounded > 8) score = "warm";

    let value = 30;
    if(roiRounded > 20) value = 140;
    else if(roiRounded > 16) value = 110;
    else if(roiRounded > 12) value = 70;

    if(plan === "pro") value *= 1.5;

    value = Math.round(value);
    const priority = roiRounded > 15 ? "URGENT" : "HIGH";

    // ================= SAVE =================
    if(db){
      await db.collection("leads").add({
        email, city, roi: roiRounded, value, score, priority,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // ================= EMAIL =================
    await resend.emails.send({
      from: "RendimentoBB <info@rendimentobb.it>",
      to: ["rendimentobb@gmail.com"],
      reply_to: email,
      subject: `💰 ${priority} Lead – €${value}`,
      html: `<h2>Nuovo lead</h2>
      <p>Email: ${email}</p>
      <p>ROI: ${roiRounded}%</p>
      <p>Città: ${city}</p>`
    });

    return res.status(200).json({ success:true });

  }catch(err){
    console.error("💥 ERROR:", err);
    return res.status(500).json({ error:"Errore server" });
  }
}
