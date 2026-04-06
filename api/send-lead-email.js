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
function clean(val){
  return String(val || "").trim();
}

function safe(val){
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

// ================= HANDLER =================
export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  const startTime = Date.now();

  try{

    let { email, roi, city, lang = "it" } = req.body || {};

    email = clean(email);
    city  = clean(city);
    roi   = safe(roi);

    if(!email){
      return res.status(400).json({ error:"Email missing" });
    }

    const roiRounded = Number(roi.toFixed(1));

    const score =
      roiRounded > 15 ? "🔥 ALTO" :
      roiRounded > 10 ? "BUONO" :
      "RISCHIOSO";

    // ================= LINK =================
    const ctaLink = `https://rendimentobb.it/dashboard`;

    // ================= SUBJECT =================
    const subjects = {
      it: `💰 Il tuo investimento può rendere ${roiRounded}% (ma attenzione...)`,
      en: `💰 Your investment could return ${roiRounded}% (but read this)`
    };

    // ================= TEMPLATE =================
    const templateIT = `
<div style="font-family:Inter,Arial;background:#f1f5f9;padding:40px">

  <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:22px;padding:35px">

    <!-- LOGO -->
    <div style="text-align:center;margin-bottom:25px">
      <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">
    </div>

    <!-- TITLE -->
    <h2 style="text-align:center;color:#0f172a">
      Analisi del tuo investimento
    </h2>

    <!-- ROI -->
    <div style="text-align:center;margin:30px 0">
      <div style="font-size:52px;font-weight:800;color:#10b981">
        ${roiRounded}%
      </div>
      <div style="color:#64748b">
        ROI stimato – ${city}
      </div>
    </div>

    <!-- WARNING -->
    <div style="background:#fff7ed;padding:16px;border-radius:12px;color:#7c2d12;font-size:14px">
      ⚠️ Il ROI da solo NON rappresenta il profitto reale.
      Mutuo, occupazione e costi possono ridurre drasticamente il rendimento.
    </div>

    <!-- VALUE -->
    <ul style="margin-top:20px;color:#334155;font-size:14px;line-height:1.7">
      <li>Profitto reale mensile e annuale</li>
      <li>Break-even occupancy</li>
      <li>Scenario rischio investimento</li>
      <li>Impatto mutuo sul cashflow</li>
    </ul>

    <!-- PSYCHO TRIGGER -->
    <div style="margin-top:25px;font-size:14px;color:#334155">
      🔍 Il <strong>${score}</strong> che hai visto è solo una stima.
      Senza analisi completa potresti prendere una decisione sbagliata.
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin:35px 0">

      <a href="${ctaLink}"
      style="
      background:linear-gradient(135deg,#10b981,#059669);
      color:white;
      padding:16px 28px;
      border-radius:999px;
      text-decoration:none;
      font-weight:700;
      display:inline-block;
      box-shadow:0 10px 30px rgba(16,185,129,0.4);
      ">
      🔥 Sblocca analisi completa
      </a>

      <p style="font-size:12px;color:#94a3b8;margin-top:10px">
        Analisi avanzata in meno di 30 secondi
      </p>

    </div>

    <!-- FOOTER -->
    <p style="text-align:center;font-size:12px;color:#94a3b8">
      RendimentoBB – motore decisionale investimenti B&B
    </p>

  </div>

</div>
`;

    // ================= SEND =================
    let sent = false;

    try{

      await resend.emails.send({
        from: "RendimentoBB <analisi@rendimentobb.it>",
        to: [email],
        subject: subjects[lang] || subjects.it,
        html: templateIT
      });

      sent = true;

    }catch(e){
      console.error("❌ User email error:", e.message);
    }

    // ================= TRACK =================
    if(db){
      try{
        await db.collection("email_logs").add({
          email,
          roi: roiRounded,
          city,
          sent,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }catch(e){
        console.warn("⚠️ Email log skip:", e.message);
      }
    }

    console.log("📩 USER EMAIL:", {
      email,
      roi: roiRounded,
      sent,
      duration: Date.now() - startTime
    });

    return res.status(200).json({
      success:true,
      sent
    });

  }catch(err){

    console.error("💥 Email API error:", err);

    return res.status(500).json({
      error:"server error",
      details: err.message
    });

  }
}
