// ===============================
// 🚀 SEND LEAD – RENDIMENTOBB CORE SYSTEM (FINAL)
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
function getScore({roi}){

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
      lang,
      source,
      phone,
      bank,
      rate,
      name,
      message,
      role
    } = req.body || {};

    // ================= CLEAN =================
    email = clean(email);
    city  = clean(city);
    roi   = safe(roi);
    price = safe(price);
    equity = safe(equity);
    profit = safe(profit);
    type  = clean(type || "generic");
    source = clean(source || "unknown");

    if(!email){
      return res.status(400).json({ error:"Missing email" });
    }

    const detectedLang = detectLang(req, lang);

    // ================= CALCOLI =================
    const roiRounded = Number(roi.toFixed(1));
    const loan = price - equity;
    const dscr = loan > 0 ? (profit / (loan * 0.04)) : 0;

    const { score, value, label } = getScore({roi: roiRounded});

    // ================= ANTI DUPLICATO =================
    const existing = await db.collection("leads")
      .where("email","==",email)
      .where("type","==",type)
      .where("roi","==",roiRounded)
      .limit(1)
      .get();

    if(!existing.empty){
      return res.status(200).json({
        success:true,
        duplicate:true
      });
    }

    // ================= DB =================
    await db.collection("leads").add({
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
      source,
      phone: clean(phone),
      bank: clean(bank),
      rate: safe(rate),
      name: clean(name),
      message: clean(message),
      role: clean(role),
      status: "new",
      lang: detectedLang,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // ================= USER EMAIL =================
    if(score !== "cold"){

      let subject = t(
        detectedLang,
        `Il tuo investimento (${roiRounded}%)`,
        `Your investment (${roiRounded}%)`
      );

      let content = `
      <div style="font-family:Inter;background:#0f172a;padding:40px">
        <div style="max-width:640px;margin:auto;background:white;border-radius:20px;padding:35px;text-align:center">

          <h2>${t(detectedLang,"Analisi iniziale","Initial analysis")}</h2>

          <div style="font-size:50px;font-weight:800;color:#10b981">
            ${roiRounded}%
          </div>

          <p style="color:#64748b">${city}</p>

          <p style="font-size:14px;color:#334155">
            ${t(
              detectedLang,
              "Questa è una stima iniziale. I dati reali possono cambiare completamente il risultato.",
              "This is a preliminary estimate. Real data can completely change the outcome."
            )}
          </p>

          <a href="https://rendimentobb.it/dashboard"
          style="margin-top:20px;display:inline-block;background:#10b981;color:white;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700">
          ${t(detectedLang,"Analisi completa","Full analysis")}
          </a>

        </div>
      </div>
      `;

      // 🔥 PERSONALIZZAZIONE PER TIPO
      if(type === "mutui"){
        subject = t(detectedLang,"Richiesta mutuo ricevuta","Mortgage request received");
      }

      if(type === "immobili"){
        subject = t(detectedLang,"Opportunità immobili ricevute","Property opportunities received");
      }

      await resend.emails.send({
        from: "RendimentoBB <analisi@rendimentobb.it>",
        to: [email],
        subject,
        html: content
      });
    }

    // ================= ADMIN EMAIL =================
    await resend.emails.send({
      from: "RendimentoBB Lead <lead@rendimentobb.it>",
      to: ["rendimentobb@gmail.com"],

      subject: `${label} | ${type.toUpperCase()} | ${city} | ROI ${roiRounded}% | €${value}`,

      html: `
      <div style="font-family:Inter;background:#f8fafc;padding:30px">

        <div style="max-width:720px;margin:auto;background:white;border-radius:20px;padding:35px">

          <h2>🚀 Nuovo Lead (${type})</h2>

          <div style="font-size:20px;font-weight:800;color:#10b981;margin-bottom:20px">
            ${label} – ROI ${roiRounded}%
          </div>

          <div style="font-size:14px">

            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Città:</strong> ${city}</p>
            <p><strong>Fonte:</strong> ${source}</p>
            <p><strong>Piano:</strong> ${req.body.plan || "unknown"}</p>

            ${phone ? `<p><strong>Telefono:</strong> ${phone}</p>` : ""}
            ${bank ? `<p><strong>Banca:</strong> ${bank}</p>` : ""}
            ${rate ? `<p><strong>Tasso:</strong> ${rate}%</p>` : ""}
            ${name ? `<p><strong>Nome:</strong> ${name}</p>` : ""}
            ${role ? `<p><strong>Ruolo:</strong> ${role}</p>` : ""}
            ${message ? `<p><strong>Messaggio:</strong> ${message}</p>` : ""}

          </div>

          <div style="margin-top:20px;padding:15px;background:#ecfdf5;border-radius:10px">
            💰 Valore lead stimato: €${value}
          </div>

          <div style="margin-top:20px;text-align:center">
            <a href="mailto:${email}"
            style="background:#10b981;color:white;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700">
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
