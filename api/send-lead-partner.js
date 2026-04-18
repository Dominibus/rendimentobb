// ===============================
// 🤝 SEND LEAD PARTNER – ULTRA SAAS PRO
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
const safe = n => isNaN(Number(n)) ? 0 : Number(n);
const clean = v => String(v || "").trim();

function detectLang(req, bodyLang){
  if(bodyLang) return bodyLang;
  const lang = req.headers["accept-language"] || "";
  return lang.toLowerCase().startsWith("en") ? "en" : "it";
}

// ================= SCORE =================
function getScore(roi){

  if(roi >= 20) return { score:"extreme", value:150, priority:"🔥 EXTREME" };
  if(roi >= 15) return { score:"hot", value:110, priority:"🚀 HOT" };
  if(roi >= 10) return { score:"good", value:70, priority:"⚡ GOOD" };

  return { score:"low", value:20, priority:"NORMAL" };
}

// ================= PARTNER ROUTING (SMART) =================
function getPartners(type, score){

  if(score === "low") return [];

  const map = {
    immobili: ["agenzia@rendimentobb.it"],
    mutui: ["broker@rendimentobb.it"],
    simulatore: ["investor@rendimentobb.it"]
  };

  return map[type] || ["rendimentobb@gmail.com"];
}

// ================= EMAIL TEMPLATE =================
function buildPartnerEmail({ email, city, roi, type, priority, lang }){

  const t = (it,en)=> lang==="en"?en:it;

  return `
  <div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

    <div style="max-width:680px;margin:auto;background:#ffffff;border-radius:20px;padding:40px">

      <div style="text-align:center;margin-bottom:25px">
        <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">
      </div>

      <h2 style="text-align:center;color:#0f172a">
        ${t("Nuovo lead ad alto potenziale","High-value lead detected")}
      </h2>

      <p style="text-align:center;color:#64748b;margin-bottom:20px">
        ${t("Utente con analisi completata e interesse reale",
             "User completed full analysis with real intent")}
      </p>

      <div style="text-align:center;margin:30px 0">
        <div style="font-size:56px;font-weight:800;color:#10b981">
          ${roi}%
        </div>
        <div style="color:#64748b">${city || "-"}</div>
      </div>

      <div style="text-align:center;margin-bottom:20px;font-weight:700">
        ${priority}
      </div>

      <div style="background:#f8fafc;padding:20px;border-radius:14px;font-size:14px">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>${t("Città","City")}:</strong> ${city || "-"}</p>
        <p><strong>${t("Tipo","Type")}:</strong> ${type}</p>
      </div>

      <div style="text-align:center;margin:35px 0">
        <a href="mailto:${email}"
        style="background:#10b981;color:white;padding:16px 30px;border-radius:999px;text-decoration:none;font-weight:700">
        ${t("Contatta subito","Contact now")}
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

  try{

    let { email, city, roi, type, plan, lang } = req.body || {};

    email = clean(email);
    city  = clean(city);
    type  = clean(type || "simulatore");
    roi   = safe(roi);

    if(!email){
      return res.status(400).json({ error:"Missing email" });
    }

    const detectedLang = detectLang(req, lang);
    const roiRounded = Number(roi.toFixed(1));

    const { score, value, priority } = getScore(roiRounded);

    // ================= ANTI-SPAM (CRITICO) =================
    if(db){
      const recent = await db.collection("partner_leads")
        .where("email","==",email)
        .orderBy("createdAt","desc")
        .limit(1)
        .get();

      if(!recent.empty){
        const last = recent.docs[0].data();
        const lastTime = last.createdAt?.toMillis?.() || 0;

        if(Date.now() - lastTime < 20 * 60 * 1000){
          return res.status(200).json({ success:true, spam:true });
        }
      }
    }

    // ================= FILTRO QUALITÀ =================
    if(score === "low"){
      return res.status(200).json({ skipped:true });
    }

    // ================= ROUTING =================
    const recipients = getPartners(type, score);

    // ================= EMAIL =================
    let sent = false;

    if(recipients.length){
      try{
        await resend.emails.send({
          from: "RendimentoBB Partner <lead@rendimentobb.it>",
          to: recipients,

          subject: `🔥 Lead ${priority} (${roiRounded}%)`,

          text: `
Nuovo lead qualificato

Email: ${email}
City: ${city}
ROI: ${roiRounded}%
Type: ${type}
Plan: ${plan || "free"}
Priority: ${priority}
Value: €${value}
          `,

          html: buildPartnerEmail({
            email,
            city,
            roi: roiRounded,
            type,
            priority,
            lang: detectedLang
          })
        });

        sent = true;

      }catch(e){
        console.error("❌ Partner email error:", e.message);
      }
    }

    // ================= SAVE DB =================
    if(db){
      await db.collection("partner_leads").add({
        email,
        city,
        roi: roiRounded,
        type,
        plan: plan || "free",
        score,
        value,
        priority,
        recipients,
        sent,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log("🤝 PARTNER LEAD:", email, roiRounded, recipients);

    return res.status(200).json({
      success:true,
      sent,
      recipients,
      score,
      value
    });

  }catch(err){

    console.error("💥 Partner API error:", err);

    return res.status(500).json({
      error:"server error"
    });

  }
}
