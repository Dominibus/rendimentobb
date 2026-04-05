// ===============================
// LEADS ENGINE – RENDIMENTOBB PRO
// ===============================

import { db } from "/js/firebase-init.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ===============================
// HELPER – INVIO AUTOMATICO API
// ===============================

async function sendLead(type, data){

  try{

    const response = await fetch("/api/send-lead",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        type,
        ...data,
        plan: window.currentPlan || "free" // 🔥 SUPER IMPORTANT
      })
    });

    if(!response.ok){
      const text = await response.text();
      console.error("❌ API Lead error:", text);
      return;
    }

    console.log("📤 Lead inviato API:", type);

  }catch(err){
    console.error("❌ Errore invio lead:", err);
  }

}

// ===============================
// VALIDAZIONE BASE
// ===============================

function isValidEmail(email){
  return typeof email === "string" && email.includes("@");
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
      amount: Number(data.amount || 0),
      years: Number(data.years || 0),
      createdAt: serverTimestamp(),
      status: "new",
      source: "mutui",
      value: 30
    };

    await addDoc(collection(db,"leads_mutui"), leadData);

    await sendLead("mutui", leadData);

    console.log("✅ Lead MUTUI salvato");

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
      budget: Number(data.budget || 0),
      createdAt: serverTimestamp(),
      status: "new",
      source: "immobili",
      value: 50
    };

    await addDoc(collection(db,"leads_immobili"), leadData);

    await sendLead("immobili", leadData);

    console.log("✅ Lead IMMOBILI salvato");

  }catch(err){
    console.error("❌ Errore lead immobili:", err);
  }

}

// ===============================
// PARTNER LEAD
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
      createdAt: serverTimestamp(),
      status: "new",
      source: "partner",
      value: 100
    };

    await addDoc(collection(db,"leads_partner"), leadData);

    await sendLead("partner", leadData);

    console.log("✅ Lead PARTNER salvato");

  }catch(err){
    console.error("❌ Errore lead partner:", err);
  }

}

// ===============================
// WORK LEAD
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
      createdAt: serverTimestamp(),
      status: "new",
      source: "work",
      value: 10
    };

    await addDoc(collection(db,"leads_work"), leadData);

    await sendLead("work", leadData);

    console.log("✅ Lead WORK salvato");

  }catch(err){
    console.error("❌ Errore lead work:", err);
  }

}
