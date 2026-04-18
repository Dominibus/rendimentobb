// ===============================
// 🤝 PARTNER LEADS – ULTRA SAAS FINAL (UNIFIED)
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
const clean = v => String(v || "").trim();
const safe = n => isNaN(Number(n)) ? 0 : Number(n);

function detectLang(req, bodyLang){
  if(bodyLang) return bodyLang;
  const lang = req.headers["accept-language"] || "";
  return lang.toLowerCase().startsWith("en") ? "en" : "it";
}

// ================= SCORE ENGINE =================
function getScore(roi){

  if(roi >= 20) return { level:"EXTREME", value:140 };
  if(roi >= 15) return { level:"URGENT", value:100 };
  if(roi >= 10) return { level:"HIGH", value:60 };

  return { level:"LOW", value:20 };
}

// ================= ROUTING =================
function getPartners({ type, roi }){

  const partners = [];

  // 🔥 investitori solo lead forti
  if(roi >= 15){
    partners.push("investor@rendimentobb.it");
  }

  if(type === "mutui"){
    partners.push("broker@rendimentobb.it");
  }

  if(type === "immobili"){
    partners.push("agenzia@rendimentobb.it");
  }

  // fallback
  if(partners.length === 0){
    partners.push("rendimentobb@gmail.com");
  }

  return partners;
}

// ================= TEMPLATE =================
function buildPartnerEmail({ email, city, roi, type, score, lang }){

  const t = (it,en)=> lang==="en"?en:it;

  return `
  <div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

    <div style="max-width:680px;margin:auto;background:#ffffff;border-radius:22px;padding:40px">

      <div style="text-align:center;margin-bottom:25px">
        <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">
      </div>

      <h2 style="text-align:center;color:#0f172a">
        ${t("Nuovo lead qualificato","New qualified lead")}
      </h2>

      <p style="text-align:center;color:#64748b;margin-bottom:20px">
        ${t(
          "Utente con analisi completata",
          "User completed full analysis"
        )}
      </p>

      <div style="text-align:center;margin:30px 0">
        <div style="font-size:58px;font-weight:800;color:#10b981">
          ${roi}%
        </div>
        <div style="color:#64748b">${city || "-"}</div>
        <div style="margin-top:8px;font-weight:600">${score.level}</div>
      </div>

      <div style="background:#f8fafc;padding:20px;border-radius:14px;font-size:14px;color:#334155">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>${t("Città","City")}:</strong> ${city || "-"}</p>
        <p><strong>${t("Tipo","Type")}:</strong> ${type}</p>
      </div>

      <div style="text-align:center;margin:35px 0">
        <a href="mailto:${email}"
        style="background:#10b981;color:white;padding:16px 30px;border-radius:999px;text-decoration:none;font-weight:700">
        ${t("Contatta utente","Contact user")}
        </a>
      </div>

      <div style="text-align:center;color:#94a3b8;font-size:12px">
        RendimentoBB • Lead Engine
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

  const startTime = Date.now();

  try{

    let { email, city, roi, type, lang } = req.body || {};

    email = clean(email);
    city  = clean(city);
    type  = clean(type || "simulatore");
    roi   = safe(roi);

    if(!email){
      return res.status(400).json({ error:"Missing email" });
    }

    const detectedLang = detectLang(req, lang);
    const roiRounded = Number(roi.toFixed(1));

    const score = getScore(roiRounded);

    // ================= QUALITÀ =================
    if(score.level === "LOW"){
      return res.status(200).json({ skipped:true });
    }

    // ================= ANTI DUPLICATE =================
    const sessionKey = `${email}_${Math.floor(Date.now() / (1000 * 60 * 20))}`;

    if(db){
      const existing = await db.collection("partner_leads")
        .where("sessionKey","==",sessionKey)
        .limit(1)
        .get();

      if(!existing.empty){
        return res.status(200).json({ skipped:true, duplicate:true });
      }
    }

    // ================= ROUTING =================
    const recipients = getPartners({
      type,
      roi: roiRounded
    });

    let sent = false;

    try{

      await resend.emails.send({
        from: "RendimentoBB Lead <lead@rendimentobb.it>",
        to: recipients,

        subject: `🔥 ${score.level} Lead – ${roiRounded}%`,

        text: `
Lead qualificato

Email: ${email}
City: ${city}
ROI: ${roiRounded}%
Type: ${type}
Score: ${score.level}
        `,

        html: buildPartnerEmail({
          email,
          city,
          roi: roiRounded,
          type,
          score,
          lang: detectedLang
        })
      });

      sent = true;

    }catch(e){
      console.error("❌ Partner email error:", e.message);
    }

    // ================= TRACK =================
    if(db){
      await db.collection("partner_leads").add({
        email,
        city,
        roi: roiRounded,
        type,
        score: score.level,
        recipients,
        sessionKey,
        sent,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

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
      error:"server error"
    });

  }
}
