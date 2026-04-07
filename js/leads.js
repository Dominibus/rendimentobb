// ===============================
// LEADS ENGINE – RENDIMENTOBB PRO (FINAL)
// ===============================

import { db } from "/js/firebase-init.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ===============================
// HELPER – VALIDAZIONE EMAIL
// ===============================
function isValidEmail(email){
  return typeof email === "string" && email.includes("@");
}

// ===============================
// HELPER – SAFE NUMBER
// ===============================
function safeNumber(v){
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

// ===============================
// HELPER – INVIO AUTOMATICO API
// ===============================
async function sendLead(type, data){

  try{

    console.log("📡 SEND LEAD →", type, data);

    const response = await fetch("/api/send-lead",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        type,
        ...data,
        plan: window.currentPlan || "free",
        lang: window.currentLang || "it",
        ts: Date.now()
      })
    });

    if(!response.ok){
      const text = await response.text();
      console.error("❌ API Lead error:", text);
      return false;
    }

    const result = await response.json();

    console.log("📤 Lead inviato API:", type, result);

    return true;

  }catch(err){
    console.error("❌ Errore invio lead:", err);
    return false;
  }

}

// ===============================
// BASE TRACK DATA
// ===============================
function buildBaseLead(source, value){

  return {
    createdAt: serverTimestamp(),
    status: "new",
    source,
    value,
    plan: window.currentPlan || "free",
    lang: window.currentLang || "it",
    sessionId: window.sessionId || (window.sessionId = Date.now())
  };

}

// ===============================
// MUTUI LEAD
// ===============================
export async function saveLeadMutui(data){

  try{

    if(!isValidEmail(data.email)){
      console.warn("⛔ Email non valida → skip mutui");
      return;
    }

    const leadData = {
      email: data.email,
      phone: data.phone || null,
      amount: safeNumber(data.amount),
      years: safeNumber(data.years),
      ...buildBaseLead("mutui", 30)
    };

    await addDoc(collection(db,"leads_mutui"), leadData);

    const sent = await sendLead("mutui", leadData);

    console.log("✅ Lead MUTUI salvato", { sent });

  }catch(err){
    console.error("❌ Errore lead mutui:", err);
  }

}

// ===============================
// IMMOBILI LEAD
// ===============================
export async function saveLeadImmobili(data){

  try{

    if(!isValidEmail(data.email)){
      console.warn("⛔ Email non valida → skip immobili");
      return;
    }

    const leadData = {
      email: data.email,
      city: data.city || window.currentCity || null,
      budget: safeNumber(data.budget),
      ...buildBaseLead("immobili", 50)
    };

    await addDoc(collection(db,"leads_immobili"), leadData);

    const sent = await sendLead("immobili", leadData);

    console.log("✅ Lead IMMOBILI salvato", { sent });

  }catch(err){
    console.error("❌ Errore lead immobili:", err);
  }

}

// ===============================
// PARTNER LEAD (🔥 HIGH VALUE)
// ===============================
export async function savePartnerLead(data){

  try{

    if(!isValidEmail(data.email)){
      console.warn("⛔ Email non valida → skip partner");
      return;
    }

    const leadData = {
      name: data.name || "",
      email: data.email,
      message: data.message || "",
      priority: "HIGH",
      ...buildBaseLead("partner", 100)
    };

    await addDoc(collection(db,"leads_partner"), leadData);

    const sent = await sendLead("partner", leadData);

    console.log("✅ Lead PARTNER salvato", { sent });

  }catch(err){
    console.error("❌ Errore lead partner:", err);
  }

}

// ===============================
// WORK LEAD (💼 TALENT)
// ===============================
export async function saveWorkLead(data){

  try{

    if(!isValidEmail(data.email)){
      console.warn("⛔ Email non valida → skip work");
      return;
    }

    const leadData = {
      name: data.name || "",
      email: data.email,
      role: data.role || "",
      priority: "NORMAL",
      ...buildBaseLead("work", 10)
    };

    await addDoc(collection(db,"leads_work"), leadData);

    const sent = await sendLead("work", leadData);

    console.log("✅ Lead WORK salvato", { sent });

  }catch(err){
    console.error("❌ Errore lead work:", err);
  }

}
