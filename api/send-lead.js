// ===============================
// 🚀 SEND LEAD – RENDIMENTOBB CORE SYSTEM (SILICON FINAL)
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

// ================= SCORE INTELLIGENTE =================
function getScore({roi, type}){

  if(type === "partner" || type === "work"){
    return { score:"lead", value:20, label:"🤝 LEAD" };
  }

  if(type === "immobili"){
    return { score:"deal", value:50, label:"🏠 DEAL" };
  }

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
      funnel,

      phone,
      bank,
      rate,
      name,
      role,
      message
    } = req.body || {};

    // ================= CLEAN =================
    email = clean(email);
    city  = clean(city || type);
    roi   = safe(roi);
    price = safe(price);
    equity = safe(equity);
    profit = safe(profit);
    type  = clean(type || "generic");
    source = clean(source || `${type}_page`);
    funnel = clean(funnel || "unknown");

    if(!email){
      return res.status(400).json({ error:"Missing email" });
    }

    const detectedLang = detectLang(req, lang);

    // ================= CALCOLI =================
    const roiRounded = Number(roi.toFixed(1));
    const loan = price - equity;
    const dscr = loan > 0 ? (profit / (loan * 0.04)) : 0;

    const { score, value, label } = getScore({
      roi: roiRounded,
      type
    });

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
      funnel,

      status: "new",
      lang: detectedLang,

      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // ================= USER EMAIL =================

    let cta = "https://rendimentobb.it/dashboard";

    if(type === "mutui") cta = "https://rendimentobb.it/mutui/";
    if(type === "immobili") cta = "https://rendimentobb.it/immobili/";

    let subject = t(
      detectedLang,
      `Il tuo investimento (${roiRounded}%)`,
      `Your investment (${roiRounded}%)`
    );

    if(type === "mutui"){
      subject = t(detectedLang,"Richiesta mutuo ricevuta","Mortgage request received");
    }

    if(type === "immobili"){
      subject = t(detectedLang,"Opportunità immobili ricevute","Property opportunities received");
    }

    const userHtml = `
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

        <a href="${cta}"
        style="margin-top:20px;display:inline-block;background:#10b981;color:white;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700">
        ${t(detectedLang,"Vai all'analisi completa","View full analysis")}
        </a>

      </div>
    </div>
    `;

    const userHtml = `
<div style="font-family:Arial;padding:20px;color:#111">

  <p>${t(detectedLang,"Ciao,","Hi,")}</p>

  <p>
    ${t(
      detectedLang,
      "Abbiamo ricevuto la tua richiesta su RendimentoBB.",
      "We received your request on RendimentoBB."
    )}
  </p>

  ${
    (type === "simulatore" || type === "generic")
    ? `
      <p>
        ${t(detectedLang,"ROI stimato:","Estimated ROI:")}
        <strong>${roiRounded}%</strong>
      </p>
    `
    : ""
  }

  <p>
    ${t(
      detectedLang,
      "Puoi continuare da qui:",
      "You can continue here:"
    )}
  </p>

  <p>
    <a href="https://rendimentobb.it/dashboard">
      https://rendimentobb.it/dashboard
    </a>
  </p>

  <br>

  <p style="font-size:12px;color:#666">
    RendimentoBB<br>
    https://rendimentobb.it
  </p>

</div>
`;

subject = t(
  detectedLang,
  "Abbiamo ricevuto la tua richiesta",
  "We received your request"
);

 if(type === "mutui"){
  subject = t(
    detectedLang,
    "Richiesta mutuo ricevuta",
    "Mortgage request received"
  );
}

if(type === "immobili"){
  subject = t(
    detectedLang,
    "Richiesta immobili ricevuta",
    "Property request received"
  );
}

if(type === "partner"){
  subject = t(
    detectedLang,
    "Richiesta partnership ricevuta",
    "Partnership request received"
  );
}

if(type === "work"){
  subject = t(
    detectedLang,
    "Candidatura ricevuta",
    "Application received"
  );
}   

await resend.emails.send({
  from: "RendimentoBB <analisi@rendimentobb.it>",
  to: [email],
  subject,
  html: userHtml,
  text: `
${t(detectedLang,
"Abbiamo ricevuto la tua richiesta su RendimentoBB.",
"We received your request on RendimentoBB."
)}

https://rendimentobb.it/dashboard
`
});

    // ================= ADMIN EMAIL =================
    await resend.emails.send({
      from: "RendimentoBB Lead <lead@rendimentobb.it>",
      to: ["rendimentobb@gmail.com"],

      subject: `${label} | ${type.toUpperCase()} | ${city} | ROI ${roiRounded}% | €${value} | ${source}`,

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
            <p><strong>Funnel:</strong> ${funnel}</p>

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
