import { Resend } from "resend";
import admin from "firebase-admin";

// ================= RESEND =================
const resend = new Resend(process.env.RESEND_API_KEY);

// ================= FIREBASE =================
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      })
    });
  } catch (e) {
    console.error("Firebase init error:", e.message);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

// ================= HELPERS =================
function safe(val){
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function clean(val){
  return String(val || "").trim();
}

// ================= PARTNER ROUTING =================
function getPartners({ type, roi }){

  const partners = [];

  // 🔥 HIGH ROI → INVESTOR
  if(roi > 15){
    partners.push("investor@rendimentobb.it");
  }

  // 🏦 MUTUI
  if(type === "mutui"){
    partners.push("broker@rendimentobb.it");
  }

  // 🏠 IMMOBILI
  if(type === "immobili"){
    partners.push("agenzia@rendimentobb.it");
  }

  // fallback
  if(partners.length === 0){
    partners.push("rendimentobb@gmail.com");
  }

  return partners;
}

// ================= HANDLER =================
export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  const startTime = Date.now();

  try{

    let { email, city, roi, type, score } = req.body || {};

    email = clean(email);
    city  = clean(city);
    type  = clean(type || "simulatore");

    roi = safe(roi);
    const roiRounded = Number(roi.toFixed(1));

    if(!email){
      return res.status(400).json({ error:"Missing email" });
    }

    // ================= FILTRO QUALITÀ =================
    // 👉 mandiamo solo lead validi
    if(score !== "hot" && roiRounded < 10){
      return res.status(200).json({ skipped:true });
    }

    // ================= PRIORITY =================
    const priority =
      roiRounded > 18 ? "🔥 EXTREME" :
      roiRounded > 15 ? "URGENT" :
      roiRounded > 10 ? "HIGH" : "NORMAL";

    // ================= ROUTING =================
    const recipients = getPartners({ type, roi: roiRounded });

    // ================= ANTI DUPLICATE SAFE =================
    const sessionKey = `${email}_${Math.floor(Date.now() / (1000 * 60 * 20))}`;

    // ================= EMAIL TEMPLATE =================
    const html = `
<div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

  <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:22px;padding:35px">

    <!-- LOGO -->
    <div style="text-align:center;margin-bottom:25px">
      <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">
    </div>

    <!-- TITLE -->
    <h2 style="text-align:center;color:#0f172a">
      🔥 Investment Opportunity
    </h2>

    <p style="text-align:center;color:#64748b;font-size:14px">
      Lead ad alta conversione
    </p>

    <!-- ROI -->
    <div style="text-align:center;margin:30px 0">
      <div style="font-size:48px;font-weight:800;color:#10b981">
        ${roiRounded}%
      </div>
      <div style="color:#64748b">ROI stimato</div>
    </div>

    <!-- INFO -->
    <div style="background:#f8fafc;padding:18px;border-radius:14px;font-size:14px">

      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Città:</strong> ${city}</p>
      <p><strong>Tipo:</strong> ${type}</p>
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
      ">
      🚀 Contatta subito
      </a>
    </div>

  </div>

</div>
`;

    // ================= SEND =================
    let sent = false;

    try{

      await resend.emails.send({
        from: "RendimentoBB Leads <lead@rendimentobb.it>",
        to: recipients,
        subject: `🔥 ${priority} Lead – ${city.toUpperCase()} (${roiRounded}%)`,
        html
      });

      sent = true;

    }catch(e){
      console.error("❌ Partner email error:", e.message);
    }

    // ================= TRACK =================
    if(db){
      try{
        await db.collection("partner_leads").add({
          email,
          city,
          roi: roiRounded,
          type,
          priority,
          recipients,
          sessionKey,
          sent,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }catch(e){
        console.warn("⚠️ Firestore skip partner:", e.message);
      }
    }

    // ================= LOG =================
    console.log("🤝 PARTNER LEAD:", {
      email,
      roi: roiRounded,
      recipients,
      sent,
      duration: Date.now() - startTime
    });

    return res.status(200).json({
      success:true,
      sent,
      recipients
    });

  }catch(err){

    console.error("💥 Partner API error:", err);

    return res.status(500).json({
      error:"server error",
      details: err.message
    });

  }
}
