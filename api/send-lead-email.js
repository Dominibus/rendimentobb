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

function t(lang, it, en){
  return lang === "en" ? en : it;
}

// ================= TEMPLATE =================
function buildEmail({ roi, city, score, lang }){

  const ctaLink = "https://rendimentobb.it/dashboard";

  return `
  <div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

    <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:22px;padding:40px">

      <!-- LOGO -->
      <div style="text-align:center;margin-bottom:25px">
        <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">
      </div>

      <!-- TITLE -->
      <h2 style="text-align:center;color:#0f172a;margin-bottom:10px">
        ${t(lang,
          "Analisi del tuo investimento",
          "Your investment analysis")}
      </h2>

      <p style="text-align:center;color:#64748b;margin-bottom:25px">
        ${t(lang,
          "Ecco cosa abbiamo trovato",
          "Here’s what we found")}
      </p>

      <!-- ROI -->
      <div style="text-align:center;margin:30px 0">
        <div style="font-size:56px;font-weight:800;color:#10b981">
          ${roi}%
        </div>
        <div style="color:#64748b">
          ${t(lang,"ROI stimato","Estimated ROI")} – ${city}
        </div>
      </div>

      <!-- WARNING -->
      <div style="background:#fff7ed;padding:16px;border-radius:12px;color:#92400e;font-size:14px">
        ⚠️ ${t(lang,
          "Il ROI NON è il profitto reale. Mutuo, occupazione e costi possono ridurlo drasticamente.",
          "ROI is NOT real profit. Mortgage, occupancy and costs can drastically reduce it.")}
      </div>

      <!-- VALUE -->
      <div style="margin-top:20px;background:#f8fafc;padding:18px;border-radius:12px">
        <ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7">
          <li>${t(lang,"Profitto reale mensile e annuale","Real monthly and yearly profit")}</li>
          <li>${t(lang,"Break-even occupancy","Break-even occupancy")}</li>
          <li>${t(lang,"Scenario rischio investimento","Investment risk scenario")}</li>
          <li>${t(lang,"Impatto mutuo sul cashflow","Mortgage impact on cashflow")}</li>
        </ul>
      </div>

      <!-- PSYCHO -->
      <div style="margin-top:25px;font-size:14px;color:#334155">
        🔍 ${t(lang,
          `Il livello ${score} che hai visto è solo una stima. Senza analisi completa potresti prendere una decisione sbagliata.`,
          `The ${score} level you saw is only an estimate. Without full analysis you could make a wrong decision.`)}
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
        🔥 ${t(lang,"Sblocca analisi completa","Unlock full analysis")}
        </a>

        <p style="font-size:12px;color:#94a3b8;margin-top:10px">
          ${t(lang,
            "Analisi avanzata in meno di 30 secondi",
            "Advanced analysis in under 30 seconds")}
        </p>

      </div>

      <!-- FOOTER -->
      <p style="text-align:center;font-size:12px;color:#94a3b8">
        RendimentoBB – ${t(lang,
          "motore decisionale investimenti B&B",
          "decision engine for B&B investments")}
      </p>

    </div>

  </div>
  `;
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
      roiRounded > 15 ? t(lang,"ALTO","HIGH") :
      roiRounded > 10 ? t(lang,"BUONO","GOOD") :
      t(lang,"RISCHIOSO","RISKY");

    const subjects = {
      it: `💰 Il tuo investimento può rendere ${roiRounded}% (attenzione)` ,
      en: `💰 Your investment could return ${roiRounded}% (important)`
    };

    const html = buildEmail({
      roi: roiRounded,
      city,
      score,
      lang
    });

    let sent = false;

    try{

      await resend.emails.send({
        from: "RendimentoBB <analisi@rendimentobb.it>",
        to: [email],
        subject: subjects[lang] || subjects.it,
        html
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
      }catch(e){}
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
