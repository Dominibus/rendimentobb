// ===============================
// 🚀 SEND LEAD – RENDIMENTOBB ULTRA SAAS (PRO)
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

// ================= SCORE ENGINE (UPGRADE) =================
function getScore(roi){

  if(roi >= 20) return { score:"extreme", value:150, priority:"🔥 EXTREME" };
  if(roi >= 15) return { score:"hot", value:110, priority:"🚀 HOT" };
  if(roi >= 10) return { score:"good", value:70, priority:"⚡ GOOD" };

  return { score:"low", value:20, priority:"NORMAL" };
}

// ================= PARTNER ROUTING =================
function getPartnerEmails(type, score){

  const partners = {
    immobili: ["investor@rendimentobb.it"],
    mutui: ["broker@rendimentobb.it"],
    simulatore: ["investor@rendimentobb.it"]
  };

  // 🔥 solo lead buoni vanno ai partner
  if(score === "low") return [];

  return partners[type] || ["rendimentobb@gmail.com"];
}

// ================= EMAIL TEMPLATE (UPGRADE STRIPE STYLE) =================
function buildEmail({ roi, city, lang }){

  const t = (it,en)=> lang==="en"?en:it;

  return `
  <div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

    <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:20px;padding:40px">

      <div style="text-align:center;margin-bottom:20px">
        <img src="https://rendimentobb.it/img/logo-main.png" style="width:110px">
      </div>

      <h2 style="text-align:center;color:#0f172a">
        ${t("Il tuo investimento ha potenziale","Your investment has potential")}
      </h2>

      <p style="text-align:center;color:#64748b;margin-bottom:25px">
        ${t("Ma stai vedendo solo il 30% dei dati","You’re only seeing 30% of the data")}
      </p>

      <div style="text-align:center;margin:30px 0">
        <div style="font-size:52px;font-weight:800;color:#10b981">
          ${roi}%
        </div>
        <div style="color:#64748b">${city || "-"}</div>
      </div>

      <div style="background:#fff7ed;padding:14px;border-radius:10px;color:#92400e">
        ⚠️ ${t("Il ROI NON è il profitto reale","ROI is NOT real profit")}
      </div>

      <div style="margin-top:25px;background:#f8fafc;padding:16px;border-radius:10px">
        <ul style="padding-left:18px;margin:0;color:#334155">
          <li>${t("Profitto reale","Real profit")}</li>
          <li>${t("Break-even","Break-even")}</li>
          <li>${t("Rischio","Risk")}</li>
          <li>${t("Impatto mutuo","Mortgage impact")}</li>
        </ul>
      </div>

      <div style="text-align:center;margin:30px 0">
        <a href="https://rendimentobb.it/dashboard"
        style="background:#10b981;color:white;padding:14px 24px;border-radius:999px;text-decoration:none;font-weight:700">
        🔓 ${t("Sblocca analisi completa","Unlock full analysis")}
        </a>
      </div>

      <div style="text-align:center;color:#94a3b8;font-size:12px">
        RendimentoBB • Strategic Engine
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

    // ================= ANTI SPAM =================
    if(db){
      const recent = await db.collection("leads")
        .where("email","==",email)
        .orderBy("createdAt","desc")
        .limit(1)
        .get();

      if(!recent.empty){
        const last = recent.docs[0].data();
        const lastTime = last.createdAt?.toMillis?.() || 0;

        if(Date.now() - lastTime < 10 * 60 * 1000){
          return res.status(200).json({ success:true, spam:true });
        }
      }
    }

    // ================= SAVE DB =================
    if(db){
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
    }

    // ================= EMAIL USER =================
    if(score !== "low"){
      await resend.emails.send({
        from: "RendimentoBB <analisi@rendimentobb.it>",
        to: [email],
        subject:
          detectedLang === "en"
            ? `Your investment (${roiRounded}%)`
            : `Il tuo investimento (${roiRounded}%)`,

        html: buildEmail({
          roi: roiRounded,
          city,
          lang: detectedLang
        })
      });
    }

    // ================= ADMIN =================
    await resend.emails.send({
      from: "RendimentoBB Lead <lead@rendimentobb.it>",
      to: ["rendimentobb@gmail.com"],
      subject: `${priority} Lead – €${value}`,
      text: `
Email: ${email}
ROI: ${roiRounded}%
City: ${city}
Type: ${type}
Plan: ${plan || "free"}
      `
    });

    // ================= PARTNER =================
    const partners = getPartnerEmails(type, score);

    if(partners.length){
      await resend.emails.send({
        from: "RendimentoBB Partner <lead@rendimentobb.it>",
        to: partners,
        subject: `🏦 Lead qualificato (${roiRounded}%)`,
        text: `
Nuovo lead:

Email: ${email}
Città: ${city}
ROI: ${roiRounded}%
Tipo: ${type}

Dashboard:
https://rendimentobb.it/dashboard
        `
      });
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
