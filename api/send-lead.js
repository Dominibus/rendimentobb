// ===============================
// 🚀 SEND LEAD – RENDIMENTOBB ULTRA (FINAL)
// ===============================

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

function detectLang(req, bodyLang){
  if(bodyLang) return bodyLang;
  const lang = req.headers["accept-language"] || "";
  return lang.toLowerCase().startsWith("en") ? "en" : "it";
}

// ================= SCORE ENGINE =================
function getScore(roi){

  if(roi > 20) return { score:"hot", value:140, priority:"EXTREME" };
  if(roi > 15) return { score:"high", value:100, priority:"URGENT" };
  if(roi > 10) return { score:"medium", value:60, priority:"HIGH" };

  return { score:"low", value:20, priority:"NORMAL" };
}

// ================= EMAIL TEMPLATE =================
function buildEmail({ roi, city, type, lang }){

  const t = (it, en) => lang === "en" ? en : it;

  const isMutui = type === "mutui";

  return `
  <div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

    <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:20px;padding:40px">

      <div style="text-align:center;margin-bottom:20px">
        <img src="https://rendimentobb.it/img/logo-main.png" style="width:110px">
      </div>

      <h2 style="text-align:center;color:#0f172a">
        ${isMutui
          ? t("Il tuo mutuo può distruggere il profitto",
              "Your mortgage can destroy your profit")
          : t("Analisi del tuo investimento",
              "Your investment analysis")}
      </h2>

      <p style="text-align:center;color:#64748b;margin-bottom:25px">
        ${t("Ecco cosa abbiamo trovato",
            "Here’s what we found")}
      </p>

      <div style="text-align:center;margin:30px 0">
        <div style="font-size:52px;font-weight:800;color:#10b981">
          ${roi}%
        </div>
        <div style="color:#64748b">${city || "-"}</div>
      </div>

      <div style="background:#fff7ed;padding:14px;border-radius:10px;color:#92400e">
        ⚠️ ${t(
          "Il ROI NON è il profitto reale",
          "ROI is NOT real profit"
        )}
      </div>

      <div style="margin-top:25px;background:#f8fafc;padding:16px;border-radius:10px">
        <ul style="padding-left:18px;margin:0;color:#334155">
          <li>${t("Profitto reale","Real profit")}</li>
          <li>${t("Break-even","Break-even")}</li>
          <li>${t("Rischio investimento","Investment risk")}</li>
          <li>${t("Impatto mutuo","Mortgage impact")}</li>
        </ul>
      </div>

      <div style="text-align:center;margin:30px 0">
        <a href="https://rendimentobb.it/dashboard"
        style="background:#10b981;color:white;padding:14px 24px;border-radius:999px;text-decoration:none;font-weight:700">
        🔥 ${t("Vedi analisi completa","Unlock full analysis")}
        </a>
      </div>

      <div style="text-align:center;color:#94a3b8;font-size:12px">
        RendimentoBB
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

    const detectedLang = detectLang(req, lang);
    const roiRounded = Number(roi.toFixed(1));

    const { score, value, priority } = getScore(roiRounded);

    // ================= SAVE DB =================
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
          lang: detectedLang,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }catch(e){
        console.warn("⚠️ Firestore skip");
      }
    }

    // ================= EMAIL USER =================
    // 🔥 invia solo se lead valido (no spam)
    if(score !== "low"){
      try{
        await resend.emails.send({
          from: "RendimentoBB <analisi@rendimentobb.it>",
          to: [email],
          subject:
            detectedLang === "en"
              ? `Investment result (${roiRounded}%)`
              : `Risultato investimento (${roiRounded}%)`,

          text: `
ROI: ${roiRounded}%
City: ${city}

https://rendimentobb.it/dashboard
          `,

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
    }

    // ================= ADMIN =================
    try{
      await resend.emails.send({
        from: "RendimentoBB Lead <lead@rendimentobb.it>",
        to: ["rendimentobb@gmail.com"],
        subject: `🔥 ${priority} Lead – €${value}`,
        text: `
Email: ${email}
ROI: ${roiRounded}%
City: ${city}
Type: ${type}
Plan: ${plan || "free"}
        `
      });
    }catch(e){
      console.error("❌ Admin email error:", e.message);
    }

    console.log("🚀 Lead OK:", email);

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
