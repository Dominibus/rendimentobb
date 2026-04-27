// ===============================
// 📩 SEND LEAD EMAIL – ULTRA SAAS PRO (STABLE)
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
    console.error("🔥 Firebase init error:", e);
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

// ================= SCORE =================
function getScore(roi){
  if(roi >= 20) return { label:"🔥 EXTREME", urgency:"high" };
  if(roi >= 15) return { label:"🚀 HIGH", urgency:"high" };
  if(roi >= 10) return { label:"⚡ GOOD", urgency:"medium" };
  return { label:"⚠️ RISKY", urgency:"low" };
}

// ================= TEMPLATE =================
function buildEmail({ roi, city, score, lang }){

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
        ${t("Ma stai vedendo solo una parte dei dati","But you're only seeing part of the data")}
      </p>

      <div style="text-align:center;margin:30px 0">
        <div style="font-size:56px;font-weight:800;color:#10b981">
          ${roi}%
        </div>
        <div style="color:#64748b">${city || "-"}</div>
        <div style="margin-top:8px;font-weight:600">${score.label}</div>
      </div>

      <div style="background:#fff7ed;padding:14px;border-radius:10px;color:#92400e">
        ⚠️ ${t("Il ROI NON è il profitto reale","ROI is NOT real profit")}
      </div>

      <div style="margin-top:25px;background:#f8fafc;padding:16px;border-radius:10px">
        <ul style="padding-left:18px;margin:0;color:#334155">
          <li>${t("Profitto reale","Real profit")}</li>
          <li>${t("Break-even","Break-even")}</li>
          <li>${t("Rischio","Risk analysis")}</li>
          <li>${t("Impatto mutuo","Mortgage impact")}</li>
        </ul>
      </div>

      <div style="text-align:center;margin:35px 0">
        <a href="https://rendimentobb.it/dashboard"
        style="background:#10b981;color:white;padding:16px 30px;border-radius:999px;text-decoration:none;font-weight:700;display:inline-block">
        🔓 ${t("Sblocca analisi completa","Unlock full analysis")}
        </a>

        <p style="font-size:12px;color:#94a3b8;margin-top:10px">
          ${t("Il 72% degli investitori sbaglia senza questi dati","72% of investors fail without this data")}
        </p>
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

    let { email, roi, city, lang } = req.body || {};

    email = clean(email);
    city  = clean(city);
    roi   = safe(roi);

    if(!email){
      return res.status(400).json({ error:"Email missing" });
    }

    const detectedLang = detectLang(req, lang);
    const roiRounded = Number(roi.toFixed(1));
    const score = getScore(roiRounded);

    // ================= ANTI-SPAM =================
    if(db){
      try{
        const recent = await db.collection("email_logs")
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
      }catch(e){
        console.error("❌ SPAM CHECK ERROR:", e);
      }
    }

    const subject =
      detectedLang === "en"
        ? `Your investment (${roiRounded}%)`
        : `Il tuo investimento (${roiRounded}%)`;

    let sent = false;

    try{

      const response = await resend.emails.send({
        from: "RendimentoBB <analisi@rendimentobb.it>",
        to: [email],
        subject,
        text: `
ROI: ${roiRounded}%
City: ${city}

⚠️ ROI is not real profit

https://rendimentobb.it/dashboard
        `,
        html: buildEmail({
          roi: roiRounded,
          city,
          score,
          lang: detectedLang
        })
      });

      console.log("📩 EMAIL OK:", response);

      sent = true;

    }catch(e){

      console.error("❌ EMAIL FULL ERROR:", e);

      sent = false;
    }

    // ================= TRACK =================
    if(db){
      try{
        await db.collection("email_logs").add({
          email,
          roi: roiRounded,
          city,
          score: score.label,
          sent,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }catch(e){
        console.error("❌ DB LOG ERROR:", e);
      }
    }

    console.log("📩 EMAIL FLOW:", email, roiRounded, sent);

    return res.status(200).json({
      success:true,
      sent
    });

  }catch(err){

    console.error("💥 EMAIL API CRASH:", err);

    // 🔥 NON ROMPERE FRONTEND
    return res.status(200).json({
      success:false,
      error:"handled"
    });
  }
}
