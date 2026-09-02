// ===============================
// 🚀 SEND LEAD – RENDIMENTOBB CORE SYSTEM (SILICON FINAL)
// ===============================

import { Resend } from "resend";
import admin from "firebase-admin";
import crypto from "node:crypto";

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
const safe = n => {
  const value = Number(n);
  return Number.isFinite(value) ? value : 0;
};

const clean = (value, maxLength = 200) => String(value || "")
  .replace(/[\u0000-\u001F\u007F]/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, maxLength);

const clamp = (value, min, max) => Math.min(max, Math.max(min, safe(value)));

function isValidEmail(value){
  return value.length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function escapeHTML(value){
  return String(value ?? "").replace(/[&<>'"]/g, character => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    "'":"&#39;",
    '"':"&quot;"
  })[character]);
}

function detectLang(req, bodyLang){
  if(bodyLang) return bodyLang;
  const lang = req.headers["accept-language"] || "";
  return lang.toLowerCase().includes("en") ? "en" : "it";
}

function t(lang, it, en){
  return lang === "en" ? en : it;
}

function formatNumber(value, lang, maximumFractionDigits = 2){
  return new Intl.NumberFormat(lang === "en" ? "en-US" : "it-IT", {
    minimumFractionDigits: 0,
    maximumFractionDigits
  }).format(safe(value));
}

function formatMoney(value, lang){
  return new Intl.NumberFormat(lang === "en" ? "en-US" : "it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(safe(value));
}

function formatCity(value){
  return clean(value)
    .toLocaleLowerCase("it-IT")
    .replace(/(^|[\s'-])\p{L}/gu, letter => letter.toLocaleUpperCase("it-IT"));
}

const RATE_WINDOW_MS = 60 * 60 * 1000;

const RATE_LIMITS = {
  analysis: { ip:20, email:12 },
  mutui: { ip:8, email:4 },
  immobili: { ip:8, email:4 },
  partner: { ip:5, email:2 },
  work: { ip:5, email:2 },
  auth: { ip:10, email:2 },
  generic: { ip:5, email:3 }
};

function hashRateKey(value){
  return crypto
    .createHash("sha256")
    .update(String(value))
    .digest("hex");
}

function getClientIp(req){
  const forwarded = req.headers["x-forwarded-for"];
  const candidate = Array.isArray(forwarded)
    ? forwarded[0]
    : String(forwarded || "").split(",")[0];
  return clean(
    candidate || req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown",
    100
  );
}

class RateLimitError extends Error {
  constructor(retryAfter){
    super("Rate limit exceeded");
    this.code = "RATE_LIMITED";
    this.retryAfter = retryAfter;
  }
}

async function consumeRateLimit({ ip, email, type }){
  const limits = RATE_LIMITS[type] || RATE_LIMITS.generic;
  const now = Date.now();
  const collection = db.collection("_rate_limits");
  const entries = [
    {
      ref: collection.doc(hashRateKey(`ip:${type}:${ip}`)),
      limit: limits.ip,
      scope: "ip"
    },
    {
      ref: collection.doc(hashRateKey(`email:${type}:${email}`)),
      limit: limits.email,
      scope: "email"
    }
  ];

  await db.runTransaction(async transaction => {
    const snapshots = await transaction.getAll(...entries.map(entry => entry.ref));
    const states = entries.map((entry, index) => {
      const data = snapshots[index].exists ? snapshots[index].data() : {};
      const previousStart = Number(data.windowStartedAt || 0);
      const activeWindow = previousStart > 0 && now - previousStart < RATE_WINDOW_MS;
      return {
        ...entry,
        windowStartedAt: activeWindow ? previousStart : now,
        count: activeWindow ? Number(data.count || 0) : 0
      };
    });

    const blocked = states.find(state => state.count >= state.limit);
    if(blocked){
      const remaining = Math.max(
        1,
        Math.ceil((blocked.windowStartedAt + RATE_WINDOW_MS - now) / 1000)
      );
      throw new RateLimitError(remaining);
    }

    states.forEach(state => {
      transaction.set(state.ref, {
        scope: state.scope,
        type,
        count: state.count + 1,
        limit: state.limit,
        windowStartedAt: state.windowStartedAt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
  });
}

// ================= SCORE INTELLIGENTE =================
function getScore({roi, type}){

  if(type === "auth"){
    return { score:"lead", value:20, label:"✅ REGISTRATION" };
  }

  if(type === "partner" || type === "work"){
    return { score:"lead", value:20, label:"🤝 LEAD" };
  }

  if(type === "immobili"){
    return { score:"property_updates", value:0, label:"🏠 PROPERTY UPDATES" };
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

    const bodySize = Buffer.byteLength(JSON.stringify(req.body || {}), "utf8");
    if(bodySize > 20000){
      return res.status(413).json({ error:"Payload too large" });
    }

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
      message,
      requestId
    } = req.body || {};

    // ================= CLEAN =================
    email = clean(email, 254).toLowerCase();
    city = clean(city || "N/A", 100);
    roi = clamp(roi, -1000, 1000);
    price = clamp(price, 0, 100000000);
    equity = clamp(equity, 0, 100000000);
    profit = clamp(profit, -100000000, 100000000);
    type = clean(type || "generic", 50).toLowerCase();
    if(type === "career") type = "work";
    if(type === "mutuo") type = "mutui";
    if(type === "immobile") type = "immobili";
    if(!Object.hasOwn(RATE_LIMITS, type)) type = "generic";
    source = clean(source || `${type}_page`, 150);
    funnel = clean(funnel || "unknown", 100);
    phone = clean(phone, 40);
    bank = clean(bank, 100);
    rate = clean(rate, 20);
    name = clean(name, 100);
    role = clean(role, 100);
    message = clean(message, 2000);
    requestId = clean(requestId, 100);
    lang = clean(lang, 5).toLowerCase();

    if(!isValidEmail(email)){
      return res.status(400).json({ error:"Invalid email" });
    }

    if(requestId){
      const repeatedRequest = await db
        .collection("leads")
        .where("requestId", "==", requestId)
        .limit(1)
        .get();
      if(!repeatedRequest.empty){
        return res.status(200).json({ success:true, duplicate:true });
      }
    }

    await consumeRateLimit({
      ip: getClientIp(req),
      email,
      type
    });

    const detectedLang = detectLang(req, ["it", "en"].includes(lang) ? lang : "");
    const displayCity = formatCity(city);
    const htmlEmail = escapeHTML(email);
    const htmlCity = escapeHTML(displayCity);
    const htmlName = escapeHTML(name);
    const htmlPhone = escapeHTML(phone);
    const htmlBank = escapeHTML(bank);
    const htmlRate = escapeHTML(rate);
    const htmlRole = escapeHTML(role);
    const htmlMessage = escapeHTML(message);
    const htmlSource = escapeHTML(source);
    const htmlFunnel = escapeHTML(funnel);
    const htmlType = escapeHTML(type.toUpperCase());

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
.limit(10)
.get();

let leadId = null;
let isExistingLead = false;

if(!existingLeadQuery.empty){

  const existingDoc = existingLeadQuery.docs.find(doc => doc.data().lastType === type);
  if(existingDoc && !["partner", "work"].includes(type)){
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
  requestId,

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

// ================= EMAIL FUNNEL =================

// Property-update requests have their own confirmation email and must not enter
// the generic investment-analysis reminder sequence.
if(!["immobili", "partner", "work", "auth"].includes(type)){
const funnelQuery = await db
.collection("email_funnel")
.where("email","==",email)
.limit(1)
.get();

if(funnelQuery.empty){

  await db.collection("email_funnel").add({

    email,

    city,

    roi: roiRounded,

    lang: detectedLang,

    createdAt:
    admin.firestore.FieldValue.serverTimestamp(),

    sentSteps: [],

    steps:[

      {
        type:"instant",
        delay:0
      },

      {
        type:"reminder_1",
        delay:1000 * 60 * 60 * 24
      },

      {
        type:"reminder_2",
        delay:1000 * 60 * 60 * 72
      }

    ]

  });

}
}

    // ================= USER EMAIL =================

let cta = "https://rendimentobb.it/dashboard";
let ctaLabel = t(detectedLang, "Apri la Dashboard", "Open Dashboard");
let userHeading = t(detectedLang, "📊 Analisi investimento completata", "📊 Investment analysis completed");
let userDescription = t(
  detectedLang,
  "La tua simulazione è stata completata con successo. Di seguito trovi il primo riepilogo dei risultati ottenuti.",
  "Your simulation has been successfully completed. Below is a summary of your investment analysis."
);
const showInvestmentResults = !["immobili", "partner", "work", "auth"].includes(type);

if(type === "mutui"){
  cta = "https://rendimentobb.it/mutui/";
}

if(type === "immobili"){
  cta = "https://rendimentobb.it/immobili/";
  ctaLabel = t(detectedLang, "Esplora gli scenari", "Explore scenarios");
  userHeading = t(
    detectedLang,
    "🏠 Richiesta aggiornamenti ricevuta",
    "🏠 Property updates request received"
  );
  userDescription = t(
    detectedLang,
    `Abbiamo registrato la tua richiesta per ${htmlCity}. Riceverai aggiornamenti su scenari immobiliari e andamento del mercato. Le stime condivise hanno finalità informative e non rappresentano offerte immobiliari o garanzie di rendimento.`,
    `We received your request for ${htmlCity}. You will receive updates about property scenarios and market trends. Any estimates shared are for information only and are not property offers or guaranteed returns.`
  );
}

if(type === "partner"){
  cta = "https://rendimentobb.it/partner/";
  ctaLabel = t(detectedLang, "Visita l'area Partner", "Visit the Partner area");
  userHeading = t(detectedLang, "🤝 Richiesta partnership ricevuta", "🤝 Partnership request received");
  userDescription = t(
    detectedLang,
    "Grazie per averci presentato la tua proposta. Il team RendimentoBB la valuterà e ti ricontatterà usando l'indirizzo indicato.",
    "Thank you for sharing your proposal. The RendimentoBB team will review it and contact you at the address provided."
  );
}

if(type === "work"){
  cta = "https://rendimentobb.it/lavora-con-noi/";
  ctaLabel = t(detectedLang, "Scopri RendimentoBB", "Discover RendimentoBB");
  userHeading = t(detectedLang, "💼 Candidatura ricevuta", "💼 Application received");
  userDescription = t(
    detectedLang,
    "Grazie per la candidatura. Il team RendimentoBB esaminerà il tuo profilo e ti contatterà se in linea con le opportunità disponibili.",
    "Thank you for applying. The RendimentoBB team will review your profile and contact you if it matches an available opportunity."
  );
}

if(type === "auth"){
  cta = "https://rendimentobb.it/dashboard";
  ctaLabel = t(detectedLang, "Apri la Dashboard", "Open Dashboard");
  userHeading = t(detectedLang, "✅ Account creato", "✅ Account created");
  userDescription = t(
    detectedLang,
    "La registrazione a RendimentoBB è stata completata. Ora puoi accedere agli strumenti disponibili e iniziare una nuova analisi quando desideri.",
    "Your RendimentoBB registration is complete. You can now access the available tools and start a new analysis whenever you are ready."
  );
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

      ${type === "mutui"
        ? "🏦 " + t(detectedLang,"Richiesta mutuo analizzata","Mortgage request analyzed")
        : userHeading}

    </div>

    <div style="
    font-size:14px;
    color:#334155;
    line-height:1.6;
    ">

${userDescription}

    </div>

  </div>

${showInvestmentResults ? `<div style="
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

${t(detectedLang, "ROI stimato", "Estimated ROI")}

</div>

<div style="
font-size:28px;
font-weight:800;
color:#10b981;
">

${formatNumber(roiRounded, detectedLang, 1)}%

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

${formatMoney(profit, detectedLang)}

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
  <strong>${formatMoney(profit, detectedLang)}</strong>
</p>
`
: ""
}
` : ""}

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
🚀 ${ctaLabel}
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
    ? `📈 Analisi completata • ROI ${formatNumber(roiRounded, "it", 1)}%`
    : "📊 La tua analisi è pronta",
  roiRounded > 0
    ? `📈 Analysis completed • ROI ${formatNumber(roiRounded, "en", 1)}%`
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
    "🏠 Richiesta aggiornamenti immobiliari ricevuta",
    "🏠 Property updates request received"
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

else if(type === "auth"){

  subject = t(
    detectedLang,
    "✅ Account RendimentoBB creato",
    "✅ Your RendimentoBB account is ready"
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

const isPartnerLead = type === "partner";
const isWorkLead = type === "work";
const isAuthLead = type === "auth";
const isPropertyUpdatesLead = type === "immobili";
const isOperationalLead = isPartnerLead || isWorkLead || isAuthLead || isPropertyUpdatesLead;

const leadColor =
isPartnerLead
? "#0f766e"

: isWorkLead
? "#2563eb"

: isAuthLead
? "#7c3aed"

: isPropertyUpdatesLead
? "#059669"

: score === "extreme"
? "#10b981"

: score === "hot"
? "#2563eb"

: score === "warm"
? "#f59e0b"

: "#ef4444";

const leadTitle =
isPartnerLead
? "🤝 RICHIESTA PARTNERSHIP"

: isWorkLead
? "💼 NUOVA CANDIDATURA"

: isAuthLead
? "✅ NUOVA REGISTRAZIONE"

: isPropertyUpdatesLead
? "🏠 AGGIORNAMENTI IMMOBILIARI"

: score === "extreme"
? "🔥 EXTREME LEAD"

: score === "hot"
? "🚀 HOT LEAD"

: score === "warm"
? "⚡ WARM LEAD"

: "❄️ LOW PRIORITY";

const adminSubject = isPartnerLead
  ? `🤝 PARTNERSHIP | ${name || email}`
  : isWorkLead
    ? `💼 CANDIDATURA | ${name || email}${role ? ` | ${role}` : ""}`
    : isAuthLead
      ? `✅ REGISTRAZIONE | ${name || email}${role ? ` | ${role}` : ""}`
      : isPropertyUpdatesLead
        ? `🏠 RICHIESTA AGGIORNAMENTI IMMOBILIARI | ${displayCity}`
    : `${leadTitle} | ${displayCity} | ROI ${formatNumber(roiRounded, "it", 1)}% | €${value} | ${type.toUpperCase()}`;

const adminSuggestion = isPartnerLead
  ? "Valutare la proposta commerciale e ricontattare il referente entro un giorno lavorativo."
  : isWorkLead
    ? "Esaminare il profilo e l'esperienza indicata; ricontattare il candidato se coerente con le posizioni disponibili."
    : isAuthLead
      ? "Nuovo account creato. Monitorare l'attivazione del simulatore e le successive interazioni nel funnel."
    : isPropertyUpdatesLead
      ? "Richiesta informativa registrata. Inviare esclusivamente aggiornamenti pertinenti alla città indicata e mantenere chiaramente distinti dati indicativi e offerte reali."
    : score === "extreme"
      ? "🔥 Lead ad altissima priorità. Contattare entro 30 minuti. Probabilità di conversione molto elevata."
      : score === "hot"
        ? "🚀 Lead molto interessante. Contattare entro oggi per massimizzare le possibilità di conversione."
        : score === "warm"
          ? "⚡ Lead qualificato. Inviare una mail personalizzata e pianificare un follow-up entro 24 ore."
          : "❄️ Lead a bassa priorità. Inserire nel funnel automatico e monitorare eventuali nuove interazioni.";

await resend.emails.send({

from:"RendimentoBB Lead <lead@rendimentobb.it>",

to:["rendimentobb@gmail.com"],

subject: adminSubject,

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

${!isOperationalLead ? `<div style="
background:rgba(255,255,255,.18);
padding:10px 16px;
border-radius:999px;
font-weight:700;
">

ROI ${roiRounded}%

</div>` : ""}

${!isOperationalLead ? `<div style="
background:rgba(255,255,255,.18);
padding:10px 16px;
border-radius:999px;
font-weight:700;
">

€${value} Lead

</div>` : ""}

<div style="
background:rgba(255,255,255,.18);
padding:10px 16px;
border-radius:999px;
font-weight:700;
">

${htmlType}

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
<td>${htmlEmail}</td>
</tr>

${name ? `
<tr>
<td><strong>👤 Nome</strong></td>
<td>${htmlName}</td>
</tr>
` : ""}

${phone ? `
<tr>
<td><strong>📱 Telefono</strong></td>
<td>${htmlPhone}</td>
</tr>
` : ""}

${isPropertyUpdatesLead ? `<tr>
<td><strong>🏙 Città richiesta</strong></td>
<td>${htmlCity}</td>
</tr>` : ""}

${!isOperationalLead ? `<tr>
<td><strong>🏙 Città</strong></td>
<td>${htmlCity}</td>
</tr>

<tr>
<td><strong>📈 ROI</strong></td>
<td><strong>${formatNumber(roiRounded, "it", 1)}%</strong></td>
</tr>

<tr>
<td><strong>💰 Profitto</strong></td>
<td>${formatMoney(profit, "it")}</td>
</tr>

<tr>
<td><strong>🏦 Capitale</strong></td>
<td>${formatMoney(equity, "it")}</td>
</tr>

<tr>
<td><strong>🏠 Prezzo immobile</strong></td>
<td>${formatMoney(price, "it")}</td>
</tr>

<tr>
<td><strong>💳 Mutuo</strong></td>
<td>${formatMoney(loan, "it")}</td>
</tr>

<tr>
<td><strong>🏦 DSCR</strong></td>
<td>${dscr.toFixed(2)}</td>
</tr>` : ""}

${!isPropertyUpdatesLead ? `<tr>
<td><strong>🎯 Lead Score</strong></td>
<td>${label}</td>
</tr>` : ""}

<tr>
<td><strong>🌍 Fonte</strong></td>
<td>${htmlSource}</td>
</tr>

<tr>
<td><strong>🧭 Funnel</strong></td>
<td>${htmlFunnel}</td>
</tr>

${bank ? `
<tr>
<td><strong>🏦 Banca</strong></td>
<td>${htmlBank}</td>
</tr>
` : ""}

${rate ? `
<tr>
<td><strong>📉 Tasso</strong></td>
<td>${htmlRate}%</td>
</tr>
` : ""}

${role ? `
<tr>
<td><strong>💼 Ruolo</strong></td>
<td>${htmlRole}</td>
</tr>
` : ""}

${message ? `
<tr>
<td><strong>💬 Messaggio</strong></td>
<td>${htmlMessage}</td>
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
href="mailto:${encodeURIComponent(email)}"
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

<strong>${isOperationalLead ? "✅ Azione consigliata" : "💡 Suggerimento operativo"}</strong><br><br>

${adminSuggestion}

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

  if(err?.code === "RATE_LIMITED"){
    res.setHeader("Retry-After", String(err.retryAfter || 3600));
    res.setHeader("Cache-Control", "no-store");
    return res.status(429).json({
      error:"rate_limited",
      retryAfter: err.retryAfter || 3600
    });
  }

  console.error("send-lead failed");

  return res.status(500).json({
    error:"internal"
  });

}

}
