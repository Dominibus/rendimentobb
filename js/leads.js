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
// 🧠 GLOBAL GUARD (ANTI DUPLICATI)
// ===============================
if(!window.leadLock){
  window.leadLock = {};
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

function getCity(){
  return (
    window.currentCity ||
    document.getElementById("market-city")?.value ||
    "unknown"
  );
}

// ===============================
// 🎯 SCORING ENGINE
// ===============================
function calculateLeadScore(roi){

  if(roi > 60) return { score:"extreme", value:140 };
  if(roi > 40) return { score:"high", value:70 };
  if(roi > 20) return { score:"medium", value:30 };

  return { score:"low", value:0 };
}

// ===============================
// 🔥 CORE SEND
// ===============================
async function sendLead(data){

  try{

    // 🔒 anti spam stesso utente
    const key = data.email + "_" + data.type;

    if(window.leadLock[key]){
      console.warn("⛔ Lead duplicato bloccato");
      return;
    }

    window.leadLock[key] = true;

    console.log("📡 SEND LEAD →", data);

    const res = await fetch("/api/send-lead",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    console.log("✅ Lead API result:", result);

    return result;

  }catch(err){
    console.error("❌ sendLead error:", err);
  }

}

// ===============================
// 🧱 BASE DATA
// ===============================
function baseLead(type, extra){

  return {
    type,
    city: getCity(),
    plan: window.currentPlan || "free",
    lang: window.currentLang || "it",
    sessionId: window.sessionId || (window.sessionId = Date.now()),
    createdAt: serverTimestamp(),
    ...extra
  };

}

// ===============================
// 💰 MUTUI LEAD
// ===============================
export async function saveLeadMutui(data){

  try{

    if(!isValidEmail(data.email)) return;

    const roi = safeNumber(data.roi);
    const { score, value } = calculateLeadScore(roi);

    // ❌ BLOCCO LEAD SCARSI
    if(score === "low"){
      console.log("⛔ Lead mutui scartato (basso valore)");
      return;
    }

    const lead = baseLead("mutui",{
      email: data.email,
      phone: data.phone || null,
      amount: safeNumber(data.amount),
      years: safeNumber(data.years),
      roi,
      score,
      value
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

    if(!isValidEmail(data.email)) return;

    const roi = safeNumber(data.roi);
    const { score, value } = calculateLeadScore(roi);

    if(score === "low"){
      console.log("⛔ Lead immobili scartato");
      return;
    }

    const lead = baseLead("immobili",{
      email: data.email,
      city: data.city || getCity(),
      budget: safeNumber(data.budget),
      roi,
      score,
      value
    });

    await addDoc(collection(db,"leads_immobili"), lead);

    await sendLead(lead);

  }catch(err){
    console.error("❌ immobili error:", err);
  }

}

// ===============================
// 🤝 PARTNER (HIGH VALUE ONLY)
// ===============================
export async function savePartnerLead(data){

  try{

    if(!isValidEmail(data.email)) return;

    const lead = baseLead("partner",{
      name: data.name || "",
      email: data.email,
      message: data.message || "",
      score:"high",
      value:100
    });

    await addDoc(collection(db,"leads_partner"), lead);

    await sendLead(lead);

  }catch(err){
    console.error("❌ partner error:", err);
  }

}

// ===============================
// 💼 WORK
// ===============================
export async function saveWorkLead(data){

  try{

    if(!isValidEmail(data.email)) return;

    const lead = baseLead("work",{
      name: data.name || "",
      email: data.email,
      role: data.role || "",
      score:"low",
      value:10
    });

    await addDoc(collection(db,"leads_work"), lead);

    await sendLead(lead);

  }catch(err){
    console.error("❌ work error:", err);
  }

}
