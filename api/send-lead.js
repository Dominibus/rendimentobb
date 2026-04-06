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
    console.error("🔥 Firebase init error:", e.message);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

// ================= UTILS =================
function safeNumber(val){
  if(val === null || val === undefined) return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function normalizeString(val){
  return String(val || "").trim();
}

// ================= HANDLER =================
export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  const startTime = Date.now();

  try{

    // ================= INPUT =================
    let {
      type = "simulatore",
      email,
      phone,
      city,
      budget,
      roi,
      plan
    } = req.body || {};

    email = normalizeString(email);
    city  = normalizeString(city).toLowerCase();
    type  = normalizeString(type).toLowerCase();
    phone = normalizeString(phone);

    roi    = safeNumber(roi);
    budget = safeNumber(budget);

    if(!email){
      return res.status(400).json({ error:"Email richiesta" });
    }

    const roiRounded = Number(roi.toFixed(1));

    // ================= SCORE ENGINE =================
    let score = "cold";

    if(roiRounded > 15) score = "hot";
    else if(roiRounded > 8) score = "warm";

    // ================= VALUE ENGINE =================
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
    const priority =
      roiRounded > 18 ? "🔥 EXTREME" :
      roiRounded > 15 ? "URGENT" :
      roiRounded > 10 ? "HIGH" : "NORMAL";

    // ================= SESSION ANTI DUPLICATE (SAFE) =================
    // 🔥 niente query Firestore → niente index crash
    const sessionKey = `${email}_${Math.floor(Date.now() / (1000 * 60 * 10))}`;

    // ================= SAVE FIRESTORE =================
    let firestoreSaved = false;

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
          sessionKey,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        firestoreSaved = true;

      }catch(e){
        console.warn("⚠️ Firestore error:", e.message);
      }
    }

    // ================= EMAIL TEMPLATE =================
    const html = `
<div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

  <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:22px;padding:35px">

    <!-- LOGO -->
    <div style="text-align:center;margin-bottom:25px">
      <img src="https://rendimentobb.it/img/logo-main.png" style="width:130px">
    </div>

    <!-- TITLE -->
    <h2 style="text-align:center;color:#0f172a;margin-bottom:10px">
      💰 New Investment Lead
    </h2>

    <p style="text-align:center;color:#64748b;font-size:14px">
      High intent investor detected
    </p>

    <!-- VALUE -->
    <div style="text-align:center;margin:30px 0">
      <div style="font-size:50px;font-weight:800;color:#10b981">
        €${value}
      </div>
      <div style="color:#64748b">Lead Value</div>
    </div>

    <!-- DATA -->
    <div style="background:#f8fafc;padding:18px;border-radius:14px;font-size:14px">

      <p><strong>Email:</strong> ${email}</p>
      <p><strong>City:</strong> ${city}</p>
      <p><strong>ROI:</strong> ${roiRounded}%</p>
      <p><strong>Score:</strong> ${score}</p>
      <p><strong>Priority:</strong> ${priority}</p>

    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-top:30px">
      <a href="mailto:${email}" 
      style="
      background:linear-gradient(135deg,#10b981,#059669);
      color:white;
      padding:14px 26px;
      border-radius:999px;
      text-decoration:none;
      font-weight:700;
      display:inline-block;
      box-shadow:0 10px 30px rgba(16,185,129,0.4);
      ">
      🚀 Contatta Lead
      </a>
    </div>

  </div>

</div>
`;

    // ================= SEND EMAIL =================
    let emailSent = false;

    try{
      const result = await resend.emails.send({
        from: "RendimentoBB <info@rendimentobb.it>",
        to: ["rendimentobb@gmail.com"],
        reply_to: email,
        subject: `🔥 ${priority} Lead – €${value}`,
        html
      });

      emailSent = true;
      console.log("📨 EMAIL SENT:", result);

    }catch(e){
      console.error("❌ EMAIL ERROR:", e.message);
    }

    // ================= METRICS =================
    const duration = Date.now() - startTime;

    console.log("📊 LEAD PROCESSED:", {
      email,
      roi: roiRounded,
      value,
      score,
      priority,
      firestoreSaved,
      emailSent,
      duration
    });

    // ================= RESPONSE =================
    return res.status(200).json({
      success:true,
      value,
      score,
      priority,
      emailSent,
      firestoreSaved
    });

  }catch(err){

    console.error("💥 LEAD ENGINE ERROR:", err);

    return res.status(500).json({
      error:"Errore server",
      details: err.message
    });

  }
}
