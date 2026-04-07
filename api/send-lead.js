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

function isEN(req){
  return req.headers["accept-language"]?.includes("en");
}

// ================= EMAIL TEMPLATE =================
function buildEmail({ roi, city, type, lang }){

  const t = (it, en) => lang === "en" ? en : it;

  const title =
    type === "mutui"
      ? t("Il tuo mutuo può costarti migliaia di euro",
          "Your mortgage could cost you thousands")
      : t("Analisi del tuo investimento",
          "Your investment analysis");

  const subtitle =
    type === "mutui"
      ? t("Hai richiesto una simulazione mutuo",
          "You requested a mortgage simulation")
      : t("Ecco cosa abbiamo trovato",
          "Here’s what we found");

  const warning = t(
    "Il ROI NON è il profitto reale. Mutuo, occupazione e costi possono ridurlo drasticamente.",
    "ROI is NOT real profit. Mortgage, occupancy and costs can drastically reduce it."
  );

  const cta = t(
    "Sblocca analisi completa",
    "Unlock full analysis"
  );

  return `
  <div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

    <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:20px;padding:40px">

      <div style="text-align:center;margin-bottom:25px">
        <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">
      </div>

      <h2 style="text-align:center;color:#0f172a">
        ${title}
      </h2>

      <p style="text-align:center;color:#64748b;margin-bottom:25px">
        ${subtitle}
      </p>

      <div style="text-align:center;margin:30px 0">
        <div style="font-size:56px;font-weight:800;color:#10b981">
          ${roi}%
        </div>
        <div style="color:#64748b">${city || "-"}</div>
      </div>

      <div style="background:#fff7ed;padding:16px;border-radius:12px;color:#92400e">
        ⚠️ ${warning}
      </div>

      <div style="margin-top:25px;background:#f8fafc;padding:18px;border-radius:12px">
        <ul style="padding-left:18px;margin:0;color:#334155">
          <li>${t("Profitto reale mensile e annuale","Real monthly and yearly profit")}</li>
          <li>${t("Break-even occupancy","Break-even occupancy")}</li>
          <li>${t("Scenario rischio investimento","Investment risk scenario")}</li>
          <li>${t("Impatto mutuo sul cashflow","Mortgage impact on cashflow")}</li>
        </ul>
      </div>

      <div style="text-align:center;margin:35px 0">
        <a href="https://rendimentobb.it/dashboard"
        style="background:#10b981;color:white;padding:16px 28px;border-radius:999px;text-decoration:none;font-weight:700">
        🔥 ${cta}
        </a>
      </div>

      <div style="text-align:center;color:#94a3b8;font-size:13px">
        RendimentoBB – ${t("Motore decisionale per investimenti B&B","Decision engine for B&B investments")}
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

    let { email, city, roi, type, plan, lang } = req.body || {};

    email = clean(email);
    city  = clean(city);
    roi   = safe(roi);
    type  = clean(type || "simulatore");

    if(!email){
      return res.status(400).json({ error:"Email richiesta" });
    }

    const detectedLang = lang || (isEN(req) ? "en" : "it");

    const roiRounded = Number(roi.toFixed(1));

    // ================= SCORE =================
    const score =
      roiRounded > 15 ? "hot" :
      roiRounded > 8 ? "warm" : "cold";

    const value =
      roiRounded > 20 ? 140 :
      roiRounded > 16 ? 110 :
      roiRounded > 12 ? 70 : 30;

    const priority =
      roiRounded > 18 ? "EXTREME" :
      roiRounded > 15 ? "URGENT" :
      roiRounded > 10 ? "HIGH" : "NORMAL";

    // ================= SAVE =================
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
          plan: plan || "free",
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }catch(e){
        console.warn("⚠️ Firestore skip");
      }
    }

    // ================= EMAIL USER =================
    try{
      await resend.emails.send({
        from: "RendimentoBB <analisi@rendimentobb.it>",
        to: [email],
        subject:
          type === "mutui"
            ? (detectedLang === "en"
                ? "Your mortgage impact analysis"
                : "Analisi impatto mutuo")
            : (detectedLang === "en"
                ? `Your investment ROI ${roiRounded}%`
                : `Il tuo investimento può rendere ${roiRounded}%`),
        html: buildEmail({
          roi: roiRounded,
          city,
          type,
          lang: detectedLang
        })
      });
    }catch(e){
      console.error("❌ User email error:", e.message);
    }

    // ================= ADMIN EMAIL =================
    try{
      await resend.emails.send({
        from: "RendimentoBB <lead@rendimentobb.it>",
        to: ["rendimentobb@gmail.com"],
        subject: `🔥 ${priority} Lead – €${value} (${type})`,
        html: `
          <h2>Nuovo Lead</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>ROI:</strong> ${roiRounded}%</p>
          <p><strong>City:</strong> ${city}</p>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Plan:</strong> ${plan || "free"}</p>
        `
      });
    }catch(e){
      console.error("❌ Admin email error:", e.message);
    }

    console.log("🚀 Lead + Email OK:", email, type);

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
