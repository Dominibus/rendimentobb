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

    // 🔥 FIX CREDIBILITÀ ROI
    const roiRounded = Number(roi.toFixed(1));

    // ================= LEAD VALUE ENGINE 💰 =================
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

    // 🔥 BOOST PRO USER
    if(plan === "pro") value *= 1.5;

    value = Math.round(value);

    // ================= SCORE =================
    let score = "cold";
    if(roiRounded > 12) score = "hot";
    else if(roiRounded > 8) score = "warm";

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
        roi: roiRounded,
        value,
        score,
        plan: plan || "unknown",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await db.collection("revenue").add({
        email,
        value,
        type,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    }

    // ================= EMAIL ADMIN (UPGRADE) =================
    try{

      await resend.emails.send({
        from: "RendimentoBB <info@rendimentobb.it>",
        to: ["rendimentobb@gmail.com"],
        subject: `💰 Lead ${score.toUpperCase()} – €${value}`,
        html: `
<div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:30px">

  <div style="max-width:620px;margin:auto;background:white;padding:30px;border-radius:18px;box-shadow:0 15px 40px rgba(0,0,0,0.08)">

    <div style="text-align:center;margin-bottom:20px">
      <img src="https://www.rendimentobb.it/img/logo-main.png" style="width:130px">
    </div>

    <h2 style="color:#0f172a;text-align:center">Nuovo lead monetizzato</h2>

    <div style="text-align:center;font-size:34px;color:#10b981;font-weight:800;margin:20px 0">
      €${value}
    </div>

    <div style="background:#f8fafc;padding:16px;border-radius:12px;font-size:14px">
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>ROI:</strong> ${roiRounded}%</p>
      <p><strong>Città:</strong> ${city}</p>
      <p><strong>Tipo:</strong> ${type}</p>
      <p><strong>Piano:</strong> ${plan || "free"}</p>
    </div>

  </div>

</div>
`
      });

    }catch(e){
      console.error("❌ Email admin error:", e.message);
    }

    // ================= PARTNER ROUTING =================
    const partnersMap = {
      mutui: ["broker@email.com"],
      immobili: ["agenzia@email.com"],
      simulatore: roiRounded > 12 ? ["investor@email.com"] : []
    };

    const targetPartners = partnersMap[type] || [];

    // ================= SEND PARTNERS =================
    await Promise.all(
      targetPartners.map(partnerEmail => {

        return resend.emails.send({
          from: "RendimentoBB <lead@rendimentobb.it>",
          to: [partnerEmail],
          subject: `🔥 Investment Lead – ${city.toUpperCase()} | ROI ${roiRounded}%`,
          html: `
<div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:40px 20px">

  <div style="max-width:640px;margin:auto;background:white;border-radius:18px;padding:35px;box-shadow:0 20px 50px rgba(0,0,0,0.08)">

    <div style="text-align:center;margin-bottom:25px">
      <img src="https://www.rendimentobb.it/img/logo-main.png" style="width:140px">
    </div>

    <h2 style="text-align:center;color:#0f172a;font-size:22px;margin-bottom:10px">
      🔥 High-value investment lead
    </h2>

    <div style="text-align:center;margin:30px 0">
      <div style="font-size:48px;font-weight:800;color:#10b981">
        ${roiRounded}%
      </div>
      <div style="color:#64748b;font-size:14px">
        ROI stimato – ${city}
      </div>
    </div>

    <div style="background:#f8fafc;padding:18px;border-radius:12px;font-size:14px">
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Città:</strong> ${city}</p>
      <p><strong>Budget:</strong> €${budget || "-"} </p>
    </div>

    <div style="background:#ecfdf5;padding:16px;border-radius:12px;margin-top:20px;font-size:14px;color:#065f46">
      💰 Alta probabilità di conversione
    </div>

    <div style="text-align:center;margin:35px 0">
      <a href="mailto:${email}"
      style="background:linear-gradient(135deg,#10b981,#059669);
      color:white;
      padding:16px 30px;
      border-radius:999px;
      text-decoration:none;
      font-weight:700;
      display:inline-block">
      Contatta il lead
      </a>
    </div>

    <p style="font-size:12px;color:#94a3b8;text-align:center">
      Lead generato automaticamente da RendimentoBB
    </p>

  </div>

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
