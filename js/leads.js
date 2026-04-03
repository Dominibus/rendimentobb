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
// HELPER – INVIO AUTOMATICO
// ===============================

async function sendLead(type, data){

  try{

    await fetch("/api/send-lead",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        type,
        ...data
      })
    });

    console.log("📤 Lead inviato:", type);

  }catch(err){
    console.error("❌ Errore invio lead:", err);
  }

}


// ===============================
// MUTUI LEAD
// ===============================

export async function saveLeadMutui(data){

  try{

    const leadData = {
      email: data.email || "",
      phone: data.phone || "",
      amount: data.amount || "",
      years: data.years || "",
      created: serverTimestamp(),
      status: "new",
      source: "mutui",
      value: 30 // 💰 valore lead (tracking)
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

    const leadData = {
      email: data.email || "",
      city: data.city || "",
      budget: data.budget || "",
      created: serverTimestamp(),
      status: "new",
      source: "immobili",
      value: 50 // 💰 più alto → vale di più
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

    const leadData = {
      name: data.name || "",
      email: data.email || "",
      message: data.message || "",
      created: serverTimestamp(),
      status: "new",
      source: "partner"
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

    const leadData = {
      name: data.name || "",
      email: data.email || "",
      role: data.role || "",
      created: serverTimestamp(),
      status: "new",
      source: "work"
    };

    await addDoc(collection(db,"leads_work"), leadData);

    await sendLead("work", leadData); // ✅ CORRETTO

    console.log("✅ Lead WORK salvato");

  }catch(err){
    console.error("❌ Errore lead work:", err);
  }

}
