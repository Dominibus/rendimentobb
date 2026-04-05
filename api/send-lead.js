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
    console.log("🔥 Firebase Admin initialized");
  } catch (e) {
    console.error("❌ Firebase init error:", e.message);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

// ================= HANDLER =================
export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  try{

    // ================= BODY =================
    const body = req.body || {};

    let {
      type = "simulatore",
      email,
      phone,
      city,
      budget,
      amount,
      years,
      name,
      message,
      roi,
      plan
    } = body;

    // ================= SANITIZE =================
    email = String(email || "").trim();
    city = String(city || "").toLowerCase();
    type = String(type || "simulatore").toLowerCase();
    roi = Number(roi || 0);
    budget = Number(budget || 0);

    if(!email){
      return res.status(400).json({ error:"Email richiesta" });
    }

    // ================= LEAD VALUE ENGINE 💰 =================
    let value = 10;

    if(type === "mutui") value = 30;
    if(type === "immobili") value = 60;
    if(type === "simulatore") value = roi > 18 ? 120 : roi > 15 ? 90 : roi > 12 ? 60 : 25;
    if(type === "partner") value = 100;

    // 🔥 BOOST PRO USER
    if(plan === "pro") value *= 1.5;

    // ================= SCORE =================
    let score = "cold";
    if(roi > 12) score = "hot";
    else if(roi > 8) score = "warm";

    // ================= SAVE FIRESTORE =================
    if(db){

      await db.collection("leads").add({
        type,
        email,
        phone: phone || null,
        city,
        budget,
        amount: amount || null,
        years: years || null,
        name: name || null,
        message: message || null,
        roi,
        value,
        score,
        plan: plan || "unknown",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 🔥 TRACK GUADAGNI
      await db.collection("revenue").add({
        email,
        value,
        type,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    }

    // ================= EMAIL ADMIN PRO =================
    try{

      await resend.emails.send({
        from: "RendimentoBB <info@rendimentobb.it>",
        to: ["rendimentobb@gmail.com"],
        subject: `💰 Nuovo lead (${value}€)`,
        html: `
        <div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:30px">

          <div style="max-width:600px;margin:auto;background:white;padding:25px;border-radius:14px">

            <h2 style="color:#0f172a">Nuovo lead monetizzato</h2>

            <div style="font-size:28px;color:#10b981;font-weight:bold;margin:15px 0">
              €${value}
            </div>

            <p><strong>Email:</strong> ${email}</p>
            <p><strong>ROI:</strong> ${roi}%</p>
            <p><strong>Città:</strong> ${city}</p>
            <p><strong>Tipo:</strong> ${type}</p>
            <p><strong>Piano:</strong> ${plan || "free"}</p>

          </div>

        </div>
        `
      });

    }catch(e){
      console.error("❌ Email admin error:", e.message);
    }

    // ================= PARTNER ROUTING 💸 =================
    const partnersMap = {
      mutui: ["broker@email.com"],
      immobili: ["agenzia@email.com"],
      simulatore: roi > 12 ? ["investor@email.com"] : []
    };

    const targetPartners = partnersMap[type] || [];

    await Promise.all(
      targetPartners.map(partnerEmail => {

        return resend.emails.send({
          from: "RendimentoBB <lead@rendimentobb.it>",
          to: [partnerEmail],
          subject: `🔥 Lead ${city.toUpperCase()} – ROI ${roi}%`,
          html: `
          <div style="font-family:Arial;padding:20px">

            <h2>Lead pronto</h2>

            <p><strong>Email:</strong> ${email}</p>
            <p><strong>ROI:</strong> ${roi}%</p>
            <p><strong>Città:</strong> ${city}</p>
            <p><strong>Budget:</strong> €${budget || "-"}</p>

          </div>
          `
        }).catch(err=>{
          console.error("❌ Partner send error:", err.message);
        });

      })
    );

    console.log("💰 Lead monetizzato:", value, type);

    return res.status(200).json({
      success:true,
      value,
      score
    });

  }catch(err){

    console.error("💥 LEAD ENGINE ERROR:", err);

    return res.status(500).json({
      error:"Errore server",
      details: err.message
    });

  }
}
