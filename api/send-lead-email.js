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

      <div style="text-align:center;margin-bottom:25px">
        <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">
      </div>

      <h2 style="text-align:center;color:#0f172a;margin-bottom:10px">
        ${t(lang,"Analisi investimento","Investment analysis")}
      </h2>

      <p style="text-align:center;color:#64748b;margin-bottom:20px">
        ${t(lang,
          "Ecco il risultato stimato",
          "Here is your estimated result"
        )}
      </p>

      <div style="text-align:center;margin:30px 0">
        <div style="font-size:60px;font-weight:900;color:#10b981">
          ${roi}%
        </div>
        <div style="color:#64748b">
          ${t(lang,"ROI stimato","Estimated ROI")} – ${city || "-"}
        </div>
      </div>

      <div style="background:#fff7ed;padding:16px;border-radius:12px;color:#92400e;font-size:14px">
        ${t(lang,
          "Il ROI non rappresenta il profitto reale.",
          "ROI does not represent real profit."
        )}
      </div>

      <div style="margin-top:20px;background:#f8fafc;padding:18px;border-radius:12px">
        <ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7">
          <li>${t(lang,"Profitto reale","Real profit")}</li>
          <li>${t(lang,"Break-even","Break-even point")}</li>
          <li>${t(lang,"Rischio","Risk analysis")}</li>
          <li>${t(lang,"Impatto mutuo","Mortgage impact")}</li>
        </ul>
      </div>

      <div style="text-align:center;margin:35px 0">

        <a href="${ctaLink}"
        style="
        background:#10b981;
        color:white;
        padding:16px 28px;
        border-radius:999px;
        text-decoration:none;
        font-weight:700;
        display:inline-block;
        ">
        ${t(lang,"Vedi analisi completa","View full analysis")}
        </a>

        <p style="font-size:12px;color:#94a3b8;margin-top:10px">
          ${t(lang,
            "Disponibile in pochi secondi",
            "Available in seconds"
          )}
        </p>

      </div>

      <p style="text-align:center;font-size:12px;color:#94a3b8">
        RendimentoBB
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

    // ✅ SUBJECT ANTI-SPAM
    const subject =
      lang === "en"
        ? `Investment analysis (${roiRounded}%)`
        : `Analisi investimento (${roiRounded}%)`;

    const html = buildEmail({
      roi: roiRounded,
      city,
      score,
      lang
    });

    let sent = false;

    try{

      await resend.emails.send({
        from: "RendimentoBB Analisi <analisi@rendimentobb.it>",
        to: [email],
        subject,

        // ✅ TEXT VERSION (FONDAMENTALE)
        text: `
Analisi investimento

ROI: ${roiRounded}%
Città: ${city}

Il ROI non rappresenta il profitto reale.

Apri:
https://rendimentobb.it/dashboard
`,

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
