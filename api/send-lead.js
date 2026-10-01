// ===============================
// 🚀 SEND LEAD – RENDIMENTOBB CORE SYSTEM (SILICON FINAL)
// ===============================

import { Resend } from "resend";
import admin from "firebase-admin";
import crypto from "node:crypto";
import { buildBrandedEmail, sendCheckedEmail } from "../lib/email-templates.js";

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
    useGrouping: true,
    minimumFractionDigits: 2,
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

  if(type === "mutui"){
    return { score:"mortgage_request", value:0, label:"🏦 MORTGAGE REQUEST" };
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
      noi,
      capRate,
      dscr,
      annualDebtService,
      type,
      lang,
      source,
      funnel,

      phone,
      bank,
      rate,
      years,
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
    noi = clamp(noi, -100000000, 100000000);
    capRate = clamp(capRate, -1000, 1000);
    dscr = clamp(dscr, 0, 1000);
    annualDebtService = clamp(annualDebtService, 0, 100000000);
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
    years = clamp(years, 0, 50);
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
        return res.status(200).json({ success:true, duplicate:true, leadSaved:true, emailDelivery:repeatedRequest.docs[0].data().emailDelivery || {} });
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

    // NOI, Cap Rate and DSCR are calculated by the canonical ROI engine.
    // The lead endpoint stores them but never invents a different formula.
    const canonicalCapRate =
      price > 0 && capRate === 0 && noi !== 0
        ? (noi / price) * 100
        : capRate;

    const canonicalDSCR =
      annualDebtService > 0 && dscr === 0 && noi !== 0
        ? noi / annualDebtService
        : dscr;

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
years,
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

  noi,
  capRate: Number(canonicalCapRate.toFixed(2)),
  annualDebtService,
  dscr: Number(canonicalDSCR.toFixed(2)),

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
  delete leadPayload.status;

  await db
  .collection("leads")
  .doc(leadId)
  .update(leadPayload);

}else{

  const savedLead = await db.collection("leads").add({

    ...leadPayload,

    createdAt:
    admin.firestore.FieldValue.serverTimestamp()

  });
  leadId = savedLead.id;

}

// ================= EMAIL FUNNEL =================

// Property-update requests have their own confirmation email and must not enter
// the generic investment-analysis reminder sequence.
if(!["immobili", "mutui", "partner", "work", "auth"].includes(type)){
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
const showInvestmentResults = !["immobili", "mutui", "partner", "work", "auth"].includes(type);

if(type === "mutui"){
  cta = "https://rendimentobb.it/mutui/";
  ctaLabel = t(detectedLang, "Rivedi la simulazione", "Review simulation");
  userHeading = t(detectedLang, "🏦 Richiesta mutuo ricevuta", "🏦 Mortgage request received");
  userDescription = t(
    detectedLang,
    "Abbiamo registrato la tua richiesta di approfondimento. I risultati della simulazione sono indicativi: condizioni, costi e approvazione dipendono dall'intermediario finanziario scelto.",
    "We received your follow-up request. Simulation results are indicative: terms, costs and approval depend on the selected financial intermediary."
  );
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

const submitted = req.body || {};
const provided = key => submitted[key] !== null && submitted[key] !== undefined && submitted[key] !== "";
const userRows = [[t(detectedLang,"Email","Email"),email]];
if(name) userRows.push([t(detectedLang,"Nome / azienda","Name / company"),name]);
if(phone) userRows.push([t(detectedLang,"Telefono","Phone"),phone]);
if(city !== "N/A" && !["partner","work","auth"].includes(type)) userRows.push([t(detectedLang,"Città","City"),displayCity]);
if(role) userRows.push([t(detectedLang,"Profilo / ruolo","Profile / role"),role]);
if(message) userRows.push([t(detectedLang,"Messaggio inviato","Submitted message"),message]);
if(type === "mutui"){
  if(provided("price")) userRows.push([t(detectedLang,"Importo simulato","Modeled amount"),formatMoney(price,detectedLang)]);
  if(years) userRows.push([t(detectedLang,"Durata","Term"),`${years} ${t(detectedLang,"anni","years")}`]);
  if(rate) userRows.push([t(detectedLang,"Tasso ipotizzato","Assumed rate"),`${rate}%`]);
  if(bank) userRows.push([t(detectedLang,"Banca indicata","Selected bank"),bank]);
}
if(showInvestmentResults){
  for(const [key,label,enLabel,val] of [
    ["price","Prezzo immobile","Property price",formatMoney(price,detectedLang)],
    ["equity","Capitale proprio","Equity",formatMoney(equity,detectedLang)],
    ["roi","ROI stimato","Estimated ROI",`${formatNumber(roiRounded,detectedLang,1)}%`],
    ["profit","Cashflow / profitto annuo simulato","Modeled annual cash flow / profit",formatMoney(profit, detectedLang)],
    ["noi","Reddito operativo netto simulato","Modeled net operating income",formatMoney(noi,detectedLang)],
    ["annualDebtService","Rate annue simulate","Modeled annual debt service",formatMoney(annualDebtService,detectedLang)],
    ["dscr","DSCR simulato","Modeled DSCR",formatNumber(canonicalDSCR,detectedLang,2)]
  ]) if(provided(key)) userRows.push([t(detectedLang,label,enLabel),val]);
}
const userMail = buildBrandedEmail({lang:detectedLang,title:userHeading,intro:userDescription.replaceAll(htmlCity,displayCity),rows:userRows,
  note:showInvestmentResults?t(detectedLang,"Dati di simulazione, non risultati operativi verificati. Controlla costi, occupazione e debito prima di decidere.","Simulation figures, not verified operating results. Review costs, occupancy and debt before deciding."):t(detectedLang,"Conserva questo riepilogo della richiesta. Puoi rispondere a questa email per aggiungere informazioni; non implica approvazione o accettazione della proposta.","Keep this request summary. Reply to this email to add information; it does not imply approval or acceptance."),
  ctaLabel,ctaURL:cta,eyebrow:t(detectedLang,"Conferma richiesta","Request confirmation")});

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

const delivery = {};
async function deliver(audience,payload){
  try {
    const providerId=await sendCheckedEmail(resend,payload,{idempotencyKey:`rb-lead-${hashRateKey(`${requestId || leadId}:${audience}:${requestId ? "" : Date.now()}`)}`});
    delivery[audience]={status:"accepted",providerId};
  } catch(error) {
    delivery[audience]={status:"failed",reason:clean(error?.message,200)};
  }
  await db.collection("leads").doc(leadId).update({[`emailDelivery.${audience}`]:{...delivery[audience],updatedAt:admin.firestore.FieldValue.serverTimestamp()}});
}
await deliver("user",{from:"RendimentoBB <analisi@rendimentobb.it>",to:[email],replyTo:"rendimentobb@gmail.com",subject,html:userMail.html,text:userMail.text});

// ================= ADMIN EMAIL =================

if(!isExistingLead){

const isPartnerLead = type === "partner";
const isWorkLead = type === "work";
const isAuthLead = type === "auth";
const isPropertyUpdatesLead = type === "immobili";
const isMortgageLead = type === "mutui";
const isOperationalLead = isPartnerLead || isWorkLead || isAuthLead || isPropertyUpdatesLead || isMortgageLead;

const leadColor =
isPartnerLead
? "#0f766e"

: isWorkLead
? "#2563eb"

: isAuthLead
? "#7c3aed"

: isPropertyUpdatesLead
? "#059669"

: isMortgageLead
? "#0369a1"

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

: isMortgageLead
? "🏦 RICHIESTA MUTUO"

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
      : isMortgageLead
        ? `🏦 RICHIESTA MUTUO | ${price > 0 ? formatMoney(price, "it") : "IMPORTO NON INDICATO"} | ${email}`
    : `${leadTitle} | ${displayCity} | ROI ${formatNumber(roiRounded, "it", 1)}% | €${value} | ${type.toUpperCase()}`;

const adminSuggestion = isPartnerLead
  ? "Valutare la proposta commerciale e ricontattare il referente entro un giorno lavorativo."
  : isWorkLead
    ? "Esaminare il profilo e l'esperienza indicata; ricontattare il candidato se coerente con le posizioni disponibili."
    : isAuthLead
      ? "Nuovo account creato. Monitorare l'attivazione del simulatore e le successive interazioni nel funnel."
    : isPropertyUpdatesLead
      ? "Richiesta informativa registrata. Inviare esclusivamente aggiornamenti pertinenti alla città indicata e mantenere chiaramente distinti dati indicativi e offerte reali."
    : isMortgageLead
      ? "Richiesta di approfondimento registrata. Verificare i dati inseriti senza presentare la simulazione come preventivo, offerta o approvazione del finanziamento."
    : score === "extreme"
      ? "🔥 Lead ad altissima priorità. Contattare entro 30 minuti. Probabilità di conversione molto elevata."
      : score === "hot"
        ? "🚀 Lead molto interessante. Contattare entro oggi per massimizzare le possibilità di conversione."
        : score === "warm"
          ? "⚡ Lead qualificato. Inviare una mail personalizzata e pianificare un follow-up entro 24 ore."
          : "❄️ Lead a bassa priorità. Inserire nel funnel automatico e monitorare eventuali nuove interazioni.";

const adminRows = [["Email",email],["Tipo richiesta",type.toUpperCase()],["Nome / azienda",name||"Non indicato"],["Telefono",phone||"Non indicato"],["Città",["partner","work","auth"].includes(type)?"Non indicata":displayCity],["Provenienza",source],["Funnel",funnel === "unknown"?"Non indicato":funnel],["Lingua utente",detectedLang.toUpperCase()],["Profilo / ruolo",role||"Non indicato"],["Messaggio",message||"Non indicato"]];
if(!isOperationalLead){
  adminRows.push(["ROI",`ROI ${formatNumber(roiRounded, "it", 1)}%`],["Prezzo immobile",provided("price")?formatMoney(price,"it"):"Non indicato"],["Capitale proprio",provided("equity")?formatMoney(equity,"it"):"Non indicato"],["Cashflow / profitto annuo simulato",provided("profit")?formatMoney(profit, "it"):"Non indicato"],["NOI simulato",provided("noi")?formatMoney(noi,"it"):"Non indicato"],["Rate annue simulate",provided("annualDebtService")?formatMoney(annualDebtService,"it"):"Non indicato"],["DSCR",provided("dscr")?formatNumber(canonicalDSCR, "it", 2):"Non indicato"],["Priorità",score.toUpperCase()],["Valore lead convenzionale",`${formatMoney(value,"it")} · indice interno, non ricavo`]);
}
if(isMortgageLead)adminRows.push(["Importo simulato",formatMoney(price,"it")],["Durata",`${years} anni`],["Tasso ipotizzato",rate?`${rate}%`:"Non indicato"],["Banca",bank||"Non indicato"]);
const adminMail=buildBrandedEmail({lang:"it",title:leadTitle,intro:"Nuovo lead acquisito da RendimentoBB",rows:adminRows,note:`Suggerimento operativo: ${adminSuggestion}`,ctaLabel:"Apri Dashboard",ctaURL:"https://rendimentobb.it/dashboard-leads/",secondaryLabel:"Contatta Lead",secondaryURL:`mailto:${encodeURIComponent(email)}`,eyebrow:"Centro gestione lead · Admin"});
await deliver("admin",{from:"RendimentoBB Lead <lead@rendimentobb.it>",to:["rendimentobb@gmail.com"],replyTo:email,subject:adminSubject,html:adminMail.html,text:adminMail.text});

}

return res.status(200).json({
  success: true,
  leadSaved: true,
  emailDelivery: delivery,
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
