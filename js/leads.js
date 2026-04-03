// ===============================
// LEADS ENGINE – RENDIMENTOBB
// ===============================

import { db } from "/js/firebase-init.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ===============================
// MUTUI LEAD
// ===============================

export async function saveLeadMutui(data){

  try{

    await addDoc(collection(db,"leads_mutui"),{
      email: data.email || "",
      phone: data.phone || "",
      amount: data.amount || "",
      years: data.years || "",
      created: serverTimestamp(),
      status: "new",
      source: "mutui"
    });

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

    await addDoc(collection(db,"leads_immobili"),{
      email: data.email || "",
      city: data.city || "",
      budget: data.budget || "",
      created: serverTimestamp(),
      status: "new",
      source: "immobili"
    });

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

    await addDoc(collection(db,"leads_partner"),{
      name: data.name || "",
      email: data.email || "",
      message: data.message || "",
      created: serverTimestamp(),
      status: "new",
      source: "partner"
    });

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

    await addDoc(collection(db,"leads_work"),{
      name: data.name || "",
      email: data.email || "",
      role: data.role || "",
      created: serverTimestamp(),
      status: "new",
      source: "work"
    });

    console.log("✅ Lead WORK salvato");

  }catch(err){
    console.error("❌ Errore lead work:", err);
  }

}
