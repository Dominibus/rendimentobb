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

priority: score,
leadLabel: label,

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

if(type === "mutui"){
  cta = "https://rendimentobb.it/mutui/";
}

if(type === "immobili"){
  cta = "https://rendimentobb.it/immobili/";
}

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

    <div style="
    font-size:14px;
    color:#334155;
    line-height:1.6;
    ">

${
t(
detectedLang,
"La tua simulazione è stata completata con successo. Di seguito trovi il primo riepilogo dei risultati ottenuti.",
"Your simulation has been successfully completed. Below is a summary of your investment analysis."
)
}

    </div>

  </div>

<div style="
display:flex;
gap:16px;
margin:24px 0;
flex-wrap:wrap;
">

<div style="
flex:1;
min-width:180px;
padding:20px;
background:#f8fafc;
border:1px solid #e2e8f0;
border-radius:14px;
text-align:center;
">

<div style="
font-size:13px;
color:#64748b;
margin-bottom:6px;
">

ROI Stimato

</div>

<div style="
font-size:28px;
font-weight:800;
color:#10b981;
">

${roiRounded}%

</div>

</div>

${
profit > 0
? `
<div style="
flex:1;
min-width:180px;
padding:20px;
background:#f8fafc;
border:1px solid #e2e8f0;
border-radius:14px;
text-align:center;
">

<div style="
font-size:13px;
color:#64748b;
margin-bottom:6px;
">

${t(
detectedLang,
"Profitto annuo",
"Annual Profit"
)}

</div>

<div style="
font-size:28px;
font-weight:800;
color:#0f172a;
">

€${profit.toLocaleString()}

</div>

</div>
`
: ""
}

</div>

  ${
profit > 0
? `
<p>
  ${t(
    detectedLang,
    "Profitto annuo stimato:",
    "Estimated yearly profit:"
  )}
  <strong>€${profit.toLocaleString()}</strong>
</p>
`
: ""
}

  <p>

    ${
      t(
        detectedLang,
        "Puoi continuare da qui:",
        "You can continue here:"
      )
    }

  </p>

  <p>

<a
href="${cta}"
style="
display:inline-block;
background:#10b981;
color:white;
padding:14px 22px;
border-radius:999px;
text-decoration:none;
font-weight:700;
">
🚀 ${
t(
detectedLang,
"Apri la Dashboard",
"Open Dashboard"
)}
</a>

  </p>

  <br>

  <p style="font-size:12px;color:#666">

    RendimentoBB<br>
    https://rendimentobb.it

  </p>

</div>
`;

// ================= SUBJECT =================

let subject = t(
  detectedLang,
  roiRounded > 0
    ? `📈 Analisi completata • ROI ${roiRounded}%`
    : "📊 La tua analisi è pronta",
  roiRounded > 0
    ? `📈 Analysis completed • ROI ${roiRounded}%`
    : "📊 Your analysis is ready"
);
if(type === "mutui"){

  subject = t(
    detectedLang,
    "🏦 Richiesta mutuo ricevuta",
    "🏦 Mortgage request received"
  );

}

else if(type === "immobili"){

  subject = t(
    detectedLang,
    "🏠 Opportunità immobili trovate",
    "🏠 Property opportunities found"
  );

}

else if(type === "partner"){

  subject = t(
    detectedLang,
    "🤝 Richiesta partnership ricevuta",
    "🤝 Partnership request received"
  );

}

else if(type === "work"){

  subject = t(
    detectedLang,
    "💼 Candidatura ricevuta",
    "💼 Application received"
  );

}

await resend.emails.send({

  from: "RendimentoBB <analisi@rendimentobb.it>",

  to: [email],

  subject,

  html: userHtml,

  text: `
${t(
  detectedLang,
  "Abbiamo ricevuto la tua richiesta su RendimentoBB.",
  "We received your request on RendimentoBB."
)}

${cta}
`

});

// ================= ADMIN EMAIL =================

if(!isExistingLead){

const leadColor =
score === "extreme"
? "#10b981"

: score === "hot"
? "#2563eb"

: score === "warm"
? "#f59e0b"

: "#ef4444";

const leadTitle =
score === "extreme"
? "🔥 EXTREME LEAD"

: score === "hot"
? "🚀 HOT LEAD"

: score === "warm"
? "⚡ WARM LEAD"

: "❄️ LOW PRIORITY";

await resend.emails.send({

from:"RendimentoBB Lead <lead@rendimentobb.it>",

to:["rendimentobb@gmail.com"],

subject:
`${leadTitle} | ${city} | ROI ${roiRounded}% | €${value} | ${type.toUpperCase()}`,

html:`

<div style="
font-family:Inter,Arial,sans-serif;
background:#f8fafc;
padding:35px;
">

<div style="
max-width:760px;
margin:auto;
background:white;
border-radius:22px;
overflow:hidden;
box-shadow:0 20px 60px rgba(15,23,42,.08);
">

<div style="
background:${leadColor};
padding:28px;
color:white;
">

<div style="
font-size:24px;
font-weight:800;
">

${leadTitle}

</div>

<div style="
margin-top:18px;
display:flex;
gap:14px;
flex-wrap:wrap;
">

<div style="
background:rgba(255,255,255,.18);
padding:10px 16px;
border-radius:999px;
font-weight:700;
">

ROI ${roiRounded}%

</div>

<div style="
background:rgba(255,255,255,.18);
padding:10px 16px;
border-radius:999px;
font-weight:700;
">

€${value} Lead

</div>

<div style="
background:rgba(255,255,255,.18);
padding:10px 16px;
border-radius:999px;
font-weight:700;
">

${type.toUpperCase()}

</div>

</div>

<div style="
margin-top:12px;
font-size:15px;
opacity:.92;
line-height:1.5;
">

${t(
  detectedLang,
  "Nuovo lead acquisito da RendimentoBB",
  "New lead generated from RendimentoBB"
)}

</div>

</div>

<div style="padding:32px;">

<table
width="100%"
cellpadding="10"
style="border-collapse:collapse;width:100%;">

<tr>
<td><strong>📧 Email</strong></td>
<td>${email}</td>
</tr>

${name ? `
<tr>
<td><strong>👤 Nome</strong></td>
<td>${name}</td>
</tr>
` : ""}

${phone ? `
<tr>
<td><strong>📱 Telefono</strong></td>
<td>${phone}</td>
</tr>
` : ""}

<tr>
<td><strong>🏙 Città</strong></td>
<td>${city}</td>
</tr>

<tr>
<td><strong>📈 ROI</strong></td>
<td><strong>${roiRounded}%</strong></td>
</tr>

<tr>
<td><strong>💰 Profitto</strong></td>
<td>€${profit.toLocaleString()}</td>
</tr>

<tr>
<td><strong>🏦 Capitale</strong></td>
<td>€${equity.toLocaleString()}</td>
</tr>

<tr>
<td><strong>🏠 Prezzo immobile</strong></td>
<td>€${price.toLocaleString()}</td>
</tr>

<tr>
<td><strong>💳 Mutuo</strong></td>
<td>€${loan.toLocaleString()}</td>
</tr>

<tr>
<td><strong>🏦 DSCR</strong></td>
<td>${dscr.toFixed(2)}</td>
</tr>

<tr>
<td><strong>🎯 Lead Score</strong></td>
<td>${label}</td>
</tr>

<tr>
<td><strong>🌍 Fonte</strong></td>
<td>${source}</td>
</tr>

<tr>
<td><strong>🧭 Funnel</strong></td>
<td>${funnel}</td>
</tr>

${bank ? `
<tr>
<td><strong>🏦 Banca</strong></td>
<td>${bank}</td>
</tr>
` : ""}

${rate ? `
<tr>
<td><strong>📉 Tasso</strong></td>
<td>${rate}%</td>
</tr>
` : ""}

${role ? `
<tr>
<td><strong>💼 Ruolo</strong></td>
<td>${role}</td>
</tr>
` : ""}

${message ? `
<tr>
<td><strong>💬 Messaggio</strong></td>
<td>${message}</td>
</tr>
` : ""}

</table>

<div style="
margin-top:30px;
display:flex;
gap:12px;
flex-wrap:wrap;
">

<a
href="mailto:${email}"
style="
background:#10b981;
color:white;
padding:14px 22px;
border-radius:999px;
text-decoration:none;
font-weight:700;
display:inline-block;
">

✉️ Contatta Lead

</a>

<a
href="https://rendimentobb.it/dashboard"
style="
background:#0f172a;
color:white;
padding:14px 22px;
border-radius:999px;
text-decoration:none;
font-weight:700;
display:inline-block;
">

📊 Apri Dashboard

</a>

</div>

<div style="
margin-top:28px;
padding:18px;
background:#ecfdf5;
border:1px solid #bbf7d0;
border-radius:14px;
font-size:14px;
line-height:1.7;
">

<strong>🧠 AI Suggerimento</strong><br><br>

${
score === "extreme"
? "🔥 Lead ad altissima priorità. Contattare entro 30 minuti. Probabilità di conversione molto elevata."

: score === "hot"
? "🚀 Lead molto interessante. Contattare entro oggi per massimizzare le possibilità di conversione."

: score === "warm"
? "⚡ Lead qualificato. Inviare una mail personalizzata e pianificare un follow-up entro 24 ore."

: "❄️ Lead a bassa priorità. Inserire nel funnel automatico e monitorare eventuali nuove interazioni."
}

</div>

</div>

</div>

</div>

`

});

}

return res.status(200).json({
  success: true,
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
