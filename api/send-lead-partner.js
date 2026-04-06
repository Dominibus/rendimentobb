import { Resend } from "resend";
import admin from "firebase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

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

export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  try{

    const { email, city, roi } = req.body || {};

    const cleanEmail = String(email || "").trim();
    const roiRounded = Number(Number(roi || 0).toFixed(1));
    const cleanCity = String(city || "");

    if(!cleanEmail){
      return res.status(400).json({ error:"Missing email" });
    }

    const priority = roiRounded > 15 ? "URGENT" : "HIGH";

    // ================= EMAIL =================
    await resend.emails.send({
      from: "RendimentoBB Leads <lead@rendimentobb.it>",
      to: ["rendimentobb@gmail.com"],
      subject: `🔥 ${priority} Lead – ${cleanCity} (${roiRounded}%)`,
      html: `
        <h2>🔥 Lead Partner</h2>
        <p>Email: ${cleanEmail}</p>
        <p>ROI: ${roiRounded}%</p>
        <p>Città: ${cleanCity}</p>
      `
    });

    // ================= SAVE =================
    if(db){
      try{
        await db.collection("partner_leads").add({
          email: cleanEmail,
          city: cleanCity,
          roi: roiRounded,
          priority,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }catch(e){
        console.warn("⚠️ save skip");
      }
    }

    return res.status(200).json({ success:true });

  }catch(err){

    console.error("💥 Partner error:", err);

    return res.status(500).json({
      success:false
    });

  }
}
