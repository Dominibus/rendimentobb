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
    city = clean(city || "N/A");
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

    // ================= LEAD DUPLICATE CHECK =================

const existingLeadQuery = await db
.collection("leads")
.where("email","==",email)
.limit(1)
.get();

let leadId = null;
let isExistingLead = false;

if(!existingLeadQuery.empty){

  const existingDoc = existingLeadQuery.docs[0];
  const existingData = existingDoc.data();

  leadId = existingDoc.id;

  // 🔥 stessa email entro 1h = update
  const createdAt =
existingData.updatedAt?.toDate?.() ||
existingData.createdAt?.toDate?.();

  if(createdAt){

    const diffMinutes =
      (Date.now() - createdAt.getTime()) / 1000 / 60;

    if(diffMinutes <= 60){
      isExistingLead = true;
    }

  }

}

    // ================= SAVE / UPDATE LEAD =================

const leadPayload = {

  phone: clean(phone || ""),
bank: clean(bank || ""),
rate: clean(rate || ""),
name: clean(name || ""),
role: clean(role || ""),
message: clean(message || ""),
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
  lastType:type,

  lastSource:source,
  lastFunnel:funnel,

  typesVisited:
  admin.firestore.FieldValue.arrayUnion(type),

  status:"new",

  lang: detectedLang,

  lastActivity:
  admin.firestore.FieldValue.serverTimestamp(),

  updatedAt:
  admin.firestore.FieldValue.serverTimestamp(),

  visitedSources:
  admin.firestore.FieldValue.arrayUnion(source),

  visitedFunnels:
  admin.firestore.FieldValue.arrayUnion(funnel)

};

if(isExistingLead){

  await db
  .collection("leads")
  .doc(leadId)
  .update(leadPayload);

}else{

  await db.collection("leads").add({

    ...leadPayload,

    createdAt:
    admin.firestore.FieldValue.serverTimestamp()

  });

}

    // ================= USER EMAIL =================

    let cta = "https://rendimentobb.it/dashboard";

    if(type === "mutui") cta = "https://rendimentobb.it/mutui/";
    if(type === "immobili") cta = "https://rendimentobb.it/immobili/";

    const userHtml = `
<div style="font-family:Arial;padding:20px;color:#111">

  <p>${t(detectedLang,"Ciao,","Hi,")}</p>

  <div style="
background:#f8fafc;
padding:18px;
border-radius:14px;
margin:20px 0;
border:1px solid #e2e8f0;
">

  <div style="
  font-size:18px;
  font-weight:700;
  color:#10b981;
  margin-bottom:10px;
  ">
    ${
      type === "mutui"
      ? "🏦 " + t(detectedLang,"Richiesta mutuo analizzata","Mortgage request analyzed")
      : type === "immobili"
      ? "🏠 " + t(detectedLang,"Opportunità immobili trovate","Property opportunities found")
      : "📊 " + t(detectedLang,"Analisi investimento completata","Investment analysis completed")
    }
  </div>

  <div style="font-size:14px;color:#334155;line-height:1.6;">
    ${
      t(
        detectedLang,
        "Il nostro sistema sta elaborando i dati migliori per il tuo investimento B&B.",
        "Our system is processing the best data for your B&B investment."
      )
    }
  </div>

</div>

  ${
    roiRounded > 0
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
    <a href="${cta}">
  ${cta}
</a>
  </p>

  <br>

  <p style="font-size:12px;color:#666">
    RendimentoBB<br>
    https://rendimentobb.it
  </p>

</div>
`;

let subject = t(
  detectedLang,
  "Abbiamo ricevuto la tua richiesta",
  "We received your request"
);

 if(type === "mutui"){
  let subject = t(
    detectedLang,
    "Richiesta mutuo ricevuta",
    "Mortgage request received"
  );
}

if(type === "immobili"){
  let subject = t(
    detectedLang,
    "Richiesta immobili ricevuta",
    "Property request received"
  );
}

if(type === "partner"){
  let subject = t(
    detectedLang,
    "Richiesta partnership ricevuta",
    "Partnership request received"
  );
}

if(type === "work"){
  let subject = t(
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

    if(!isExistingLead){

    await resend.emails.send({
      from: "RendimentoBB Lead <lead@rendimentobb.it>",
      to: ["rendimentobb@gmail.com"],

      subject:
type === "immobili"
? `${label} | ${type.toUpperCase()} | ${city} | €${value} | ${source}`

: type === "mutui"
? `${label} | MUTUI | ROI ${roiRounded}% | €${value} | ${source}`

: `${label} | ${type.toUpperCase()} | ${city} | ROI ${roiRounded}% | €${value} | ${source}`,

      html: `
      <div style="font-family:Inter;background:#f8fafc;padding:30px">

        <div style="max-width:720px;margin:auto;background:white;border-radius:20px;padding:35px">

          <h2>🚀 Nuovo Lead (${type})</h2>

          <div style="font-size:20px;font-weight:800;color:#10b981;margin-bottom:20px">
            ${label} – ROI ${roiRounded}%
          </div>

          <div style="font-size:14px">

            <p><strong>Email:</strong> ${email}</p>
            ${city ? `<p><strong>Città:</strong> ${city}</p>` : ""}
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

      }

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
