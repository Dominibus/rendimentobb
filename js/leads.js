// ===============================
// 🚀 LEADS ENGINE – RENDIMENTOBB (SILICON FINAL)
// ===============================

import { db } from "/js/firebase-init.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ===============================
// 🧠 GLOBAL LOCK (ANTI DUPLICATI)
// ===============================
if(!window.__leadLock){
  window.__leadLock = {};
}

// ===============================
// 🌍 HELPERS
// ===============================
function isValidEmail(email){
  return typeof email === "string" && email.includes("@");
}

function safeNumber(v){
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function clean(v){
  return String(v || "").trim();
}

function getCity(data){
  return clean(
    data.city ||
    window.currentCity ||
    document.getElementById("market-city")?.value ||
    data.type || 
    "unknown"
  );
}

function getLang(){
  return window.currentLang || "it";
}

function getPlan(){
  return window.currentPlan || "free";
}

// ===============================
// 🎯 SCORE ALLINEATO BACKEND
// ===============================
function calculateScore({roi, type}){

  if(type === "partner" || type === "work"){
    return { score:"lead", value:20 };
  }

  if(type === "immobili"){
    return { score:"property_updates", value:0 };
  }

  if(roi >= 20) return { score:"extreme", value:150 };
  if(roi >= 15) return { score:"hot", value:100 };
  if(roi >= 10) return { score:"warm", value:60 };

  return { score:"cold", value:20 };
}

// ===============================
// 🌐 BASE LEAD STRUCTURE
// ===============================
function buildBaseLead(type, data){

  const roi = safeNumber(
    data.roi ?? window.lastROI ?? 0
  );

  const { score, value } = calculateScore({ roi, type });

  return {
    type,
    email: clean(data.email),
    phone: clean(data.phone),

    city: getCity({ ...data, type }),

    roi,
    score,
    value,

    plan: getPlan(),
    lang: getLang(),

    // 🔥 TRACKING PRO
    source: window.location.pathname,
    funnel: getPlan(),

    createdAt: serverTimestamp(),
    sessionId: window.sessionId || (window.sessionId = Date.now())
  };
}

// ===============================
// 📡 SEND CORE (API VERCEL)
// ===============================
async function sendLead(data){

  try{

    const key = [
  data.email,
  data.type,
  Math.round(data.roi || 0),
  window.location.pathname
].join("_");

    setTimeout(()=>{
  delete window.__leadLock[key];
}, 10000);

    // 🔒 ANTI DUPLICATO
    if(window.__leadLock[key]){
      console.warn("⛔ Duplicate lead blocked:", key);
      return;
    }

    window.__leadLock[key] = true;

    console.log("📡 SEND LEAD →", data);

    const response = await fetch("/api/send-lead",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        ...data,
        timestamp: Date.now()
      })
    });

    if(!response.ok){
      const txt = await response.text();
      console.error("❌ API error:", txt);
      return false;
    }

    const result = await response.json();

    console.log("✅ Lead sent:", result);

    return result;

  }catch(err){
    console.error("❌ sendLead error:", err);
    return false;
  }
}

// ===============================
// 💰 MUTUI LEAD
// ===============================
export async function saveLeadMutui(data){

  try{

    if(!isValidEmail(data.email)){
      console.warn("⛔ Invalid email");
      return;
    }

    const lead = buildBaseLead("mutui",{
      ...data,
      amount: safeNumber(data.amount),
      years: safeNumber(data.years)
    });

    await addDoc(collection(db,"leads_mutui"), lead);
    await sendLead(lead);

  }catch(err){
    console.error("❌ mutui error:", err);
  }
}

// ===============================
// 🏠 IMMOBILI LEAD
// ===============================
export async function saveLeadImmobili(data){

  try{

    if(!isValidEmail(data.email)){
      console.warn("⛔ Invalid email");
      return;
    }

    const lead = buildBaseLead("immobili",{
      ...data,
      budget: safeNumber(data.budget)
    });

    await addDoc(collection(db,"leads_immobili"), lead);
    await sendLead(lead);

  }catch(err){
    console.error("❌ immobili error:", err);
  }
}

// ===============================
// 🤝 PARTNER LEAD
// ===============================
export async function savePartnerLead(data){

  try{

    if(!isValidEmail(data.email)){
      console.warn("⛔ Invalid email");
      return;
    }

    const lead = {
      ...buildBaseLead("partner", data),
      name: clean(data.name),
      message: clean(data.message),
      priority: "HIGH"
    };

    await addDoc(collection(db,"leads_partner"), lead);
    await sendLead(lead);

  }catch(err){
    console.error("❌ partner error:", err);
  }
}

// ===============================
// 💼 WORK LEAD
// ===============================
export async function saveWorkLead(data){

  try{

    if(!isValidEmail(data.email)){
      console.warn("⛔ Invalid email");
      return;
    }

    const lead = {
      ...buildBaseLead("work", data),
      name: clean(data.name),
      role: clean(data.role),
      priority: "LOW",
      value: 10
    };

    await addDoc(collection(db,"leads_work"), lead);
    await sendLead(lead);

  }catch(err){
    console.error("❌ work error:", err);
  }
}
