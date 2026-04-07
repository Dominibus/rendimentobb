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

  const urgency = t(
    lang,
    "⚠️ Questo risultato può essere fuorviante",
    "⚠️ This result may be misleading"
  );

  const fomo = t(
    lang,
    "Le migliori opportunità vengono prese entro poche ore",
    "Best opportunities get taken within hours"
  );

  return `
  <div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

    <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:22px;padding:40px">

      <!-- LOGO -->
      <div style="text-align:center;margin-bottom:25px">
        <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">
      </div>

      <!-- TITLE -->
      <h2 style="text-align:center;color:#0f172a;margin-bottom:10px">
        ${t(lang,"Analisi investimento completata","Investment analysis completed")}
      </h2>

      <!-- URGENCY -->
      <p style="text-align:center;color:#dc2626;font-weight:600;margin-bottom:20px">
        ${urgency}
      </p>

      <!-- ROI -->
      <div style="text-align:center;margin:30px 0">
        <div style="font-size:60px;font-weight:900;color:#10b981">
          ${roi}%
        </div>
        <div style="color:#64748b">
          ${t(lang,"ROI stimato","Estimated ROI")} – ${city || "-"}
        </div>
      </div>

      <!-- CRITICAL WARNING -->
      <div style="background:#fee2e2;padding:16px;border-radius:12px;color:#991b1b;font-size:14px;font-weight:600">
        ${t(lang,
          "Molti investimenti con ROI simile finiscono sotto il 5% reale.",
          "Many investments with similar ROI end up below 5% real return."
        )}
      </div>

      <!-- VALUE -->
      <div style="margin-top:20px;background:#f8fafc;padding:18px;border-radius:12px">
        <ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7">
          <li>${t(lang,"Profitto reale mensile","Real monthly profit")}</li>
          <li>${t(lang,"Break-even reale","Real break-even point")}</li>
          <li>${t(lang,"Scenario rischio","Risk scenario")}</li>
          <li>${t(lang,"Impatto mutuo","Mortgage impact")}</li>
        </ul>
      </div>

      <!-- PSYCHO -->
      <div style="margin-top:25px;font-size:14px;color:#334155">
        🔍 ${t(lang,
          `Il livello ${score} è solo una stima. Senza analisi completa stai rischiando soldi reali.`,
          `The ${score} level is only an estimate. Without full analysis you are risking real money.`
        )}
      </div>

      <!-- FOMO -->
      <div style="margin-top:15px;font-size:13px;color:#dc2626;text-align:center;font-weight:600">
        ${fomo}
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin:35px 0">

        <a href="${ctaLink}"
        style="
        background:linear-gradient(135deg,#10b981,#059669);
        color:white;
        padding:18px 32px;
        border-radius:999px;
        text-decoration:none;
        font-weight:800;
        display:inline-block;
        box-shadow:0 10px 30px rgba(16,185,129,0.4);
        font-size:16px;
        ">
        🔥 ${t(lang,"Sblocca analisi completa","Unlock full analysis")}
        </a>

        <p style="font-size:12px;color:#94a3b8;margin-top:10px">
          ${t(lang,
            "Analisi avanzata in meno di 30 secondi",
            "Advanced analysis in under 30 seconds"
          )}
        </p>

      </div>

      <!-- FOOTER -->
      <p style="text-align:center;font-size:12px;color:#94a3b8">
        RendimentoBB – ${t(lang,
          "motore decisionale per investimenti B&B",
          "decision engine for B&B investments"
        )}
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
      it: `⚠️ ${roiRounded}% può essere fuorviante`,
      en: `⚠️ ${roiRounded}% may be misleading`
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
