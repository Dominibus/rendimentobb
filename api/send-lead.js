// ===============================
// 🚀 SEND LEAD – RENDIMENTOBB BANK ELITE FINAL
// ===============================

import { Resend } from "resend";
import admin from "firebase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

// ================= FIREBASE =================
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
  });
}

const db = admin.firestore();

// ================= HELPERS =================
const safe = n => isNaN(Number(n)) ? 0 : Number(n);
const clean = v => String(v || "").trim();

function detectLang(req, bodyLang){
  if(bodyLang) return bodyLang;
  const lang = req.headers["accept-language"] || "";
  return lang.toLowerCase().includes("en") ? "en" : "it";
}

function t(lang, it, en){
  return lang === "en" ? en : it;
}

// ================= SCORE =================
function getScore({roi, price}){

  if(roi >= 20){
    return { score:"extreme", value:150, label:"🔥 EXTREME" };
  }

  if(roi >= 15){
    return { score:"hot", value:100, label:"🚀 HOT" };
  }

  if(roi >= 10){
    return { score:"warm", value:60, label:"⚡ WARM" };
  }

  return { score:"cold", value:20, label:"❄️ LOW" };
}

// ================= HANDLER =================
export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  try{

    let {
      email,
      city,
      roi,
      price,
      equity,
      profit,
      type,
      lang
    } = req.body || {};

    email = clean(email);
    city  = clean(city);
    roi   = safe(roi);
    price = safe(price);
    equity = safe(equity);
    profit = safe(profit);
    type  = clean(type || "simulatore");

    if(!email){
      return res.status(400).json({ error:"Missing email" });
    }

    const detectedLang = detectLang(req, lang);

    // ================= CALCOLI =================
    const roiRounded = Number(roi.toFixed(1));
    const loan = price - equity;
    const dscr = loan > 0 ? (profit / (loan * 0.04)) : 0;

    const { score, value, label } = getScore({roi: roiRounded, price});

    // ================= ANTI DUPLICATO =================
    const key = `${email}_${Math.floor(Date.now()/600000)}`;

    const existing = await db.collection("leads")
      .where("key","==",key)
      .limit(1)
      .get();

    if(!existing.empty){
      return res.status(200).json({ success:true, duplicate:true });
    }

    // ================= DB =================
    await db.collection("leads").add({
      key,
      email,
      city,
      roi: roiRounded,
      price,
      equity,
      loan,
      profit,
      dscr: Number(dscr.toFixed(2)),
      score,
      value,
      type,
      status: "new",
      lang: detectedLang,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // ================= USER EMAIL (🔥 CONVERSION) =================
    if(score !== "cold"){
      await resend.emails.send({
        from: "RendimentoBB <analisi@rendimentobb.it>",
        to: [email],
        subject: t(
          detectedLang,
          `Il tuo investimento (${roiRounded}%)`,
          `Your investment (${roiRounded}%)`
        ),
        html: `
        <div style="font-family:Inter;background:#0f172a;padding:40px">
          <div style="max-width:640px;margin:auto;background:white;border-radius:20px;padding:35px;text-align:center">

            <h2 style="color:#0f172a;margin-bottom:10px">
              ${t(detectedLang,"Sintesi investimento","Investment summary")}
            </h2>

            <div style="font-size:56px;font-weight:800;color:#10b981">
              ${roiRounded}%
            </div>

            <div style="color:#64748b;margin-bottom:20px">${city}</div>

            <p style="font-size:14px;color:#334155;line-height:1.6">
              ${t(
                detectedLang,
                "Hai trovato un'opportunità interessante. Ma questa è solo una stima iniziale.",
                "You found an interesting opportunity. But this is only a preliminary estimate."
              )}
            </p>

            <div style="background:#fff7ed;padding:15px;border-radius:10px;margin-top:15px;font-size:13px">
              ⚠️ ${t(
                detectedLang,
                "Il ROI NON rappresenta il profitto reale",
                "ROI does NOT represent real profit"
              )}
            </div>

            <a href="https://rendimentobb.it/dashboard"
            style="display:inline-block;margin-top:25px;background:#10b981;color:white;padding:14px 26px;border-radius:999px;text-decoration:none;font-weight:700">
            ${t(detectedLang,"Analisi completa","Full analysis")}
            </a>

          </div>
        </div>
        `
      });
    }

    // ================= ADMIN EMAIL (🔥 SALES READY) =================
    await resend.emails.send({
      from: "RendimentoBB Lead <lead@rendimentobb.it>",
      to: ["rendimentobb@gmail.com"],

      subject: `${label} | ${city} | ROI ${roiRounded}% | €${value}`,

      html: `
      <div style="font-family:Inter;background:#f8fafc;padding:30px">

        <div style="max-width:720px;margin:auto;background:white;border-radius:20px;padding:35px">

          <h2 style="margin-bottom:5px">🚀 Nuovo Lead</h2>

          <div style="font-size:22px;font-weight:800;color:#10b981;margin-bottom:20px">
            ${label} – ROI ${roiRounded}%
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;font-size:14px">

            <div><strong>Email</strong><br>${email}</div>
            <div><strong>Città</strong><br>${city}</div>

            <div><strong>Prezzo</strong><br>€${price}</div>
            <div><strong>Equity</strong><br>€${equity}</div>

            <div><strong>Mutuo</strong><br>€${loan}</div>
            <div><strong>Profitto</strong><br>€${profit}</div>

            <div><strong>DSCR</strong><br>${dscr.toFixed(2)}</div>
            <div><strong>Tipo</strong><br>${type}</div>

          </div>

          <div style="margin-top:25px;padding:18px;background:#ecfdf5;border-radius:12px">

            <strong>💰 Valore lead stimato:</strong> €${value}

          </div>

          <div style="margin-top:25px;text-align:center">

            <a href="mailto:${email}"
            style="background:#10b981;color:white;padding:14px 24px;border-radius:999px;text-decoration:none;font-weight:700">
            Contatta subito
            </a>

          </div>

        </div>

      </div>
      `
    });

    return res.status(200).json({
      success:true,
      value,
      score
    });

  }catch(err){

    console.error("💥 ERROR:", err);

    return res.status(500).json({
      error:"internal"
    });
  }
}
