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
    console.error("🔥 Firebase init error:", e.message);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

// ================= HELPERS =================
function safe(n){
  const v = Number(n);
  return isNaN(v) ? 0 : v;
}

function clean(v){
  return String(v || "").trim();
}

// ================= EMAIL TEMPLATE =================
function buildUserEmail({ roi, city }){

  return `
<div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

  <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:22px;padding:35px">

    <div style="text-align:center;margin-bottom:25px">
      <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">
    </div>

    <h2 style="text-align:center">Il tuo investimento sembra ottimo…</h2>

    <div style="text-align:center;margin:30px 0">
      <div style="font-size:54px;color:#10b981;font-weight:800">
        ${roi}%
      </div>
      <div style="color:#64748b">${city}</div>
    </div>

    <div style="background:#fff7ed;padding:16px;border-radius:12px">
      ⚠️ Il ROI non è il profitto reale. Molti investimenti falliscono qui.
    </div>

    <div style="text-align:center;margin:30px">
      <a href="https://rendimentobb.it/dashboard"
      style="background:#10b981;color:white;padding:16px 28px;border-radius:999px;text-decoration:none;font-weight:700">
      🔥 Sblocca analisi completa
      </a>
    </div>

  </div>

</div>
`;
}

// ================= HANDLER =================
export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  try{

    let { email, city, roi, type } = req.body || {};

    email = clean(email);
    city  = clean(city);
    roi   = safe(roi);

    if(!email){
      return res.status(400).json({ error:"Email richiesta" });
    }

    const roiRounded = Number(roi.toFixed(1));

    // ================= SCORE =================
    const score =
      roiRounded > 15 ? "hot" :
      roiRounded > 8 ? "warm" : "cold";

    // ================= VALUE =================
    const value =
      roiRounded > 20 ? 140 :
      roiRounded > 16 ? 110 :
      roiRounded > 12 ? 70 : 30;

    const priority =
      roiRounded > 18 ? "EXTREME" :
      roiRounded > 15 ? "URGENT" :
      roiRounded > 10 ? "HIGH" : "NORMAL";

    const now = Date.now();

    // ================= SAVE LEAD =================
    if(db){
      try{
        await db.collection("leads").add({
          email,
          city,
          roi: roiRounded,
          score,
          value,
          priority,
          type,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }catch(e){
        console.warn("Firestore skip");
      }
    }

    // ================= FUNNEL =================
    // 👉 step automatici

    const funnelSteps = [
      { delay: 0, type: "instant" },
      { delay: 24 * 60 * 60 * 1000, type: "reminder_1" },
      { delay: 3 * 24 * 60 * 60 * 1000, type: "reminder_2" }
    ];

    if(db){
      try{
        await db.collection("email_funnel").add({
          email,
          city,
          roi: roiRounded,
          steps: funnelSteps,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }catch(e){}
    }

    // ================= EMAIL IMMEDIATA =================
    await resend.emails.send({
      from: "RendimentoBB <analisi@rendimentobb.it>",
      to: [email],
      subject: `💰 Il tuo investimento può rendere ${roiRounded}%`,
      html: buildUserEmail({ roi: roiRounded, city })
    });

    // ================= ADMIN EMAIL =================
    await resend.emails.send({
      from: "RendimentoBB <info@rendimentobb.it>",
      to: ["rendimentobb@gmail.com"],
      subject: `🔥 ${priority} Lead – €${value}`,
      html: `
        <h2>Nuovo Lead</h2>
        <p>${email}</p>
        <p>${roiRounded}%</p>
        <p>${city}</p>
      `
    });

    console.log("🚀 FUNNEL STARTED:", email);

    return res.status(200).json({
      success:true,
      value,
      score,
      priority
    });

  }catch(err){

    console.error("💥 ERROR:", err);

    return res.status(500).json({
      error:"server error"
    });

  }
}
