import { Resend } from "resend";
import admin from "firebase-admin";

// ================= RESEND =================
const resend = new Resend(process.env.RESEND_API_KEY);

// ================= FIREBASE INIT =================
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : undefined
    })
  });
}

const db = admin.firestore();

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
    let value = 15;

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

    // ================= ANTI DUPLICATE =================
    try{
      const existing = await db.collection("leads")
        .where("email","==",email)
        .orderBy("createdAt","desc")
        .limit(1)
        .get();

      if(!existing.empty){
        const last = existing.docs[0].data();

        if(last?.createdAt?.toMillis){
          const diff = Date.now() - last.createdAt.toMillis();

          if(diff < 20 * 60 * 1000){
            console.log("⛔ Lead duplicato bloccato");
            return res.status(200).json({ skipped:true });
          }
        }
      }
    }catch(e){
      console.warn("⚠️ Index non pronto → skip controllo duplicati");
    }

    // ================= SAVE FIRESTORE =================
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

    await db.collection("revenue").add({
      email,
      value,
      type,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // ================= EMAIL ADMIN =================
    try{

      const result = await resend.emails.send({
        // 🔥 USA QUESTO PER SICUREZZA
        from: "RendimentoBB <onboarding@resend.dev>",
        to: ["rendimentobb@gmail.com"],
        reply_to: email,
        subject: `🔥 Lead ${priority} - €${value}`,
        html: `
<div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:30px">
  <div style="max-width:620px;margin:auto;background:white;padding:30px;border-radius:18px">

    <h2 style="text-align:center">💰 Nuovo lead</h2>

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

      console.log("📨 ADMIN EMAIL SENT:", result);

    }catch(e){
      console.error("❌ EMAIL ADMIN ERROR:", e);
    }

    // ================= PARTNER =================
    const partners = ["rendimentobb@gmail.com"];

    await Promise.all(
      partners.map(async (p) => {

        try{
          const result = await resend.emails.send({
            // 🔥 STESSO MITTENTE (IMPORTANTISSIMO)
            from: "RendimentoBB <onboarding@resend.dev>",
            to: [p],
            subject: `Lead ${priority} ${city.toUpperCase()} ${roiRounded}%`,
            html: `
<div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:30px">
  <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:18px">

    <h2>🔥 Investment Lead (${priority})</h2>

    <h1 style="color:#10b981">${roiRounded}%</h1>

    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Città:</strong> ${city}</p>

  </div>
</div>
`
          });

          console.log("📨 PARTNER EMAIL SENT:", result);

        }catch(e){
          console.error("❌ PARTNER EMAIL ERROR:", e);
        }

      })
    );

    console.log("💰 LEAD COMPLETATO:", value, priority);

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
