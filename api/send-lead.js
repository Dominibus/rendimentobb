// ===============================
// 🚀 SEND LEAD – RENDIMENTOBB BANK READY (BILINGUE)
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
  if(roi >= 15 && price > 100000){
    return { score:"hot", value:100 };
  }
  if(roi >= 10){
    return { score:"warm", value:60 };
  }
  return { score:"cold", value:20 };
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
    const loan = price - equity;
    const dscr = loan > 0 ? (profit / (loan * 0.04)) : 0;

    const { score, value } = getScore({roi, price});

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
      roi,
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

    // ================= USER EMAIL =================
    if(score !== "cold"){
      await resend.emails.send({
        from: "RendimentoBB <analisi@rendimentobb.it>",
        to: [email],
        subject: t(
          detectedLang,
          `Analisi investimento (${roi}%)`,
          `Investment analysis (${roi}%)`
        ),
        html: `
        <div style="font-family:Inter;background:#0f172a;padding:40px">
          <div style="max-width:640px;margin:auto;background:white;border-radius:16px;padding:30px;text-align:center">

            <h2 style="color:#0f172a">
              ${t(detectedLang,"Analisi investimento","Investment analysis")}
            </h2>

            <div style="font-size:48px;font-weight:800;color:#10b981">
              ${roi}%
            </div>

            <p style="color:#64748b">${city}</p>

            <div style="margin-top:20px;font-size:14px;color:#334155">
              ${t(
                detectedLang,
                "Questa è una stima preliminare. L’analisi completa include profitto reale, rischio e impatto finanziario.",
                "This is a preliminary estimate. Full analysis includes real profit, risk and financing impact."
              )}
            </div>

            <a href="https://rendimentobb.it/dashboard"
            style="display:inline-block;margin-top:25px;background:#10b981;color:white;padding:12px 20px;border-radius:999px;text-decoration:none">
            ${t(detectedLang,"Sblocca analisi completa","Unlock full analysis")}
            </a>

          </div>
        </div>
        `
      });
    }

    // ================= ADMIN =================
    await resend.emails.send({
      from: "RendimentoBB Lead <lead@rendimentobb.it>",
      to: ["rendimentobb@gmail.com"],

      subject: `[${type.toUpperCase()}] ${score.toUpperCase()} – €${value}`,

      text: `
NEW LEAD

Email: ${email}
City: ${city}

ROI: ${roi}%
Price: €${price}
Equity: €${equity}
Loan: €${loan}

Annual Profit: €${profit}
DSCR: ${dscr.toFixed(2)}

Type: ${type}
Estimated Value: €${value}

Status: NEW
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
