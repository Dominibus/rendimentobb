// ===============================
// 🚀 LEADS ENGINE – RENDIMENTOBB ULTRA (FINAL)
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
// HELPERS
// ===============================
function isValidEmail(email){
  return typeof email === "string" && email.includes("@");
}

function safeNumber(v){
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function getCity(data){
  return (
    data.city ||
    window.currentCity ||
    document.getElementById("market-city")?.value ||
    "unknown"
  );
}

// ===============================
// 🎯 SCORING ENGINE
// ===============================
function calculateScore(roi){

  if(roi > 60) return { score:"extreme", value:140 };
  if(roi > 40) return { score:"high", value:70 };
  if(roi > 20) return { score:"medium", value:30 };

  return { score:"low", value:0 };
}

// ===============================
// 🌐 BASE LEAD
// ===============================
function buildBaseLead(type, data){

  const roi = safeNumber(data.roi);
  const { score, value } = calculateScore(roi);

  return {
    type,
    email: data.email,
    phone: data.phone || null,
    city: getCity(data),

    roi,
    score,
    value,

    plan: window.currentPlan || "free",
    lang: window.currentLang || "it",

    createdAt: serverTimestamp(),
    sessionId: window.sessionId || (window.sessionId = Date.now())
  };
}

// ===============================
// 📡 SEND CORE (UNICO ENDPOINT)
// ===============================
async function sendLead(data){

  try{

    const key = data.email + "_" + data.type;

    // 🔒 anti doppio invio
    if(window.__leadLock[key]){
      console.warn("⛔ Lead duplicato bloccato:", key);
      return;
    }

    window.__leadLock[key] = true;

    console.log("📡 SEND LEAD →", data);

    const response = await fetch("/api/send-lead",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        ...data,
        ts: Date.now()
      })
    });

    if(!response.ok){
      const txt = await response.text();
      console.error("❌ API error:", txt);
      return false;
    }

    const result = await response.json();

    console.log("✅ Lead inviato:", result);

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
      console.warn("⛔ Email non valida");
      return;
    }

    const lead = buildBaseLead("mutui",{
      ...data,
      amount: safeNumber(data.amount),
      years: safeNumber(data.years)
    });

    // 🔥 BLOCCO LEAD INUTILI
    if(lead.score === "low"){
      console.log("⛔ Lead mutui scartato (low)");
      return;
    }

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
      console.warn("⛔ Email non valida");
      return;
    }

    const lead = buildBaseLead("immobili",{
      ...data,
      budget: safeNumber(data.budget)
    });

    if(lead.score === "low"){
      console.log("⛔ Lead immobili scartato");
      return;
    }

    await addDoc(collection(db,"leads_immobili"), lead);

    await sendLead(lead);

  }catch(err){
    console.error("❌ immobili error:", err);
  }

}

// ===============================
// 🤝 PARTNER LEAD (HIGH ONLY)
// ===============================
export async function savePartnerLead(data){

  try{

    if(!isValidEmail(data.email)){
      console.warn("⛔ Email non valida");
      return;
    }

    const lead = {
      ...buildBaseLead("partner", data),
      name: data.name || "",
      message: data.message || "",
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
      console.warn("⛔ Email non valida");
      return;
    }

    const lead = {
      ...buildBaseLead("work", data),
      name: data.name || "",
      role: data.role || "",
      priority: "LOW",
      value: 10
    };

    await addDoc(collection(db,"leads_work"), lead);

    await sendLead(lead);

  }catch(err){
    console.error("❌ work error:", err);
  }

}
