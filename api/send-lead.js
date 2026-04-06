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

    let {
      type = "simulatore",
      email,
      phone,
      city,
      budget,
      roi,
      plan
    } = req.body || {};

    // ================= SANITIZE =================
    email = String(email || "").trim();
    city = String(city || "").toLowerCase();
    type = String(type || "simulatore").toLowerCase();
    roi = Number(roi || 0);
    budget = Number(budget || 0);

    if(!email){
      return res.status(400).json({ error:"Email richiesta" });
    }

    const roiRounded = Number(roi.toFixed(1));

    // ================= SCORE =================
    let score = "cold";
    if(roiRounded > 12) score = "hot";
    else if(roiRounded > 8) score = "warm";

    // ================= VALUE =================
    let value = 30;

    if(type === "mutui") value = 40;
    if(type === "immobili") value = 80;

    if(type === "simulatore"){
      if(roiRounded > 20) value = 140;
      else if(roiRounded > 16) value = 110;
      else if(roiRounded > 12) value = 70;
      else value = 30;
    }

    if(type === "partner") value = 120;
    if(plan === "pro") value *= 1.5;

    value = Math.round(value);

    // ================= PRIORITY =================
    const priority = roiRounded > 15 ? "URGENT" : "HIGH";

    // ================= SAVE FIRESTORE =================
    if(db){
      try{
        await db.collection("leads").add({
          type,
          email,
          phone: phone || null,
          city,
          budget,
          roi: roiRounded,
          value,
          score,
          priority,
          plan: plan || "free",
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }catch(e){
        console.warn("⚠️ Firestore save error (non blocca email):", e.message);
      }
    }

    // ================= EMAIL ADMIN =================
    try{

      const result = await resend.emails.send({
        from: "RendimentoBB <info@rendimentobb.it>",
        to: ["rendimentobb@gmail.com"],
        reply_to: email,
        subject: `💰 ${priority} Lead – €${value}`,
        html: `
<div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:30px">

  <div style="max-width:620px;margin:auto;background:white;padding:30px;border-radius:18px">

    <h2 style="text-align:center">Nuovo lead monetizzato</h2>

    <div style="text-align:center;font-size:34px;color:#10b981;font-weight:800;margin:20px 0">
      €${value}
    </div>

    <p><strong>Email:</strong> ${email}</p>
    <p><strong>ROI:</strong> ${roiRounded}%</p>
    <p><strong>Città:</strong> ${city}</p>
    <p><strong>Tipo:</strong> ${type}</p>
    <p><strong>Priority:</strong> ${priority}</p>

  </div>

</div>
`
      });

      console.log("📨 EMAIL SENT:", result);

    }catch(e){
      console.error("❌ EMAIL ERROR:", e.message);
    }

    // ================= RESPONSE =================
    return res.status(200).json({
      success:true,
      value,
      score,
      priority
    });

  }catch(err){

    console.error("💥 LEAD ENGINE ERROR:", err);

    return res.status(500).json({
      error:"Errore server",
      details: err.message
    });

  }
}
