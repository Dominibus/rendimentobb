// ===============================
// FIREBASE INIT – RENDIMENTOBB
// VERSIONE SAAS MULTI PAGINA STABILE
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ===============================
// CONFIG
// ===============================

const firebaseConfig = {
  apiKey: "AIzaSyCGg0ffpwnD0VXkxFgXxyj0ZrAoVZJHdKU",
  authDomain: "rendimento-bb.firebaseapp.com",
  projectId: "rendimento-bb",
  storageBucket: "rendimento-bb.firebasestorage.app",
  messagingSenderId: "144452546362",
  appId: "1:144452546362:web:829e08d7b1703137b16a03",
  measurementId: "G-749B8PW4ST"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// rende Firebase Auth globale per tutto il sito
window.firebaseAuth = auth;


// ===============================
// GLOBAL STATE
// ===============================

window.currentUser = null;
window.currentPlan = "free";
window.firebaseReady = false;

// ===============================
// PRO CHECK (FIX DEFINITIVO)
// ===============================

window.isPro = function(){
  return (
    window.currentPlan === "pro" ||
    window.currentPlan === "pro_yearly" ||
    window.currentPlan === "investor"
  );
};

// compatibilità vecchio codice
window.isProUser = window.isPro;

// ===============================
// REQUIRE PLAN (BLOCCO FEATURE)
// ===============================

window.requirePlan = function(required){

  // 🔥 CONTROLLO REALE (CORE)
  if(window.hasPlan && window.hasPlan(required)){
    return true;
  }

  // ===============================
  // UX BLOCCO
  // ===============================

  if(typeof showUpgradeModal === "function"){

    showUpgradeModal(12);

    setTimeout(()=>{
      alert(
        getCurrentLang()==="it"
        ? "⚠️ Stai prendendo decisioni senza vedere i dati reali"
        : "⚠️ You are making decisions without real data"
      );
    },300);

  }else{
    window.location.href = "/pricing/";
  }

  return false;
};

// ===============================
// HELPER – CURRENT LANGUAGE
// ===============================

function getCurrentLang(){

  if(window.currentLang) return window.currentLang;

  const saved = localStorage.getItem("rb_lang");
  if(saved) return saved;

  return "it";

}


// ===============================
// REGISTRAZIONE
// ===============================

async function registerUser(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}


// ===============================
// LOGIN
// ===============================

async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}


// ===============================
// LOGOUT
// ===============================

async function logoutUser() {
  await signOut(auth);
}


// ===============================
// CARICA PIANO UTENTE (FIX DEFINITIVO STABILE)
// ===============================

async function loadUserPlan(uid) {

  try{

    console.log("🔥 Carico piano per:", uid);
  console.log("🧠 USER STATE", {
  plan: window.currentPlan,
  role: window.userRole,
  isAdmin: window.isAdmin ? window.isAdmin() : false,
  isPro: window.isPro()
});

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

   let plan = "free";
let role = "user";

if (docSnap.exists()) {
  const data = docSnap.data();

  plan = data.plan || "free";
  role = data.role || "user";
} else {
      console.warn("⚠️ Documento NON trovato");
    }

// ===============================
// 🔥 SINGLE SOURCE OF TRUTH (FIX DEFINITIVO)
// ===============================

const clean = (v)=>String(v || "")
  .replace(/"/g,"")
  .trim()
  .toLowerCase();

// 👉 SET GLOBALE REALE
window.currentPlan = clean(plan);
window.userRole = clean(role);

// 👉 COMPATIBILITÀ (se usi PLAN)
if(window.PLAN && typeof window.PLAN.set === "function"){
  window.PLAN.set(window.currentPlan, window.userRole);
}

console.log("🔥 Piano finale CLEAN:", window.currentPlan, "| ruolo:", window.userRole);


// 🔥 EVENTO GLOBALE (SINGLE SOURCE OF TRUTH)
window.dispatchEvent(new Event("rb_plan_ready"));

    // 🔥 SYNC IMMEDIATO HEADER/UI
setTimeout(()=>{
  document.dispatchEvent(new Event("rb_plan_loaded"));
}, 50);

    // ===============================
    // 🔥 SBLOCCO UI
    // ===============================

    if(window.isPro()){

      document.body.classList.add("pro-user");

      if(typeof unlockProUI === "function"){
        unlockProUI();
      }

      // 🔥 FORCE UNLOCK VISIVO
      setTimeout(()=>{

        document.querySelectorAll(".pro-only, .pro-blur").forEach(el=>{
          el.classList.remove("pro-only","pro-blur");
          el.style.filter = "none";
          el.style.opacity = "1";
          el.style.pointerEvents = "auto";
        });

        document.querySelectorAll(".locked-overlay, .results-overlay").forEach(el=>{
          el.remove();
        });

      },300);

    }

    // ===============================
// ROLE SYSTEM (🔥 CORE SAAS)
// ===============================

window.isAdmin = function(){
  return window.userRole === "admin";
};

window.hasPlan = function(required){

  const plan = window.currentPlan;
  const role = window.userRole;

  // 🔥 ADMIN SEMPRE ACCESSO
  if(role === "admin") return true;

  if(required === "investor"){
    return (
      plan === "investor" ||
      plan === "pro" ||
      plan === "pro_yearly"
    );
  }

  if(required === "pro"){
    return (
      plan === "pro" ||
      plan === "pro_yearly"
    );
  }

  return false;
};

    // ===============================
    // 🔥 EVENTI GLOBALI
    // ===============================

    document.dispatchEvent(
      new CustomEvent("rb_plan_loaded", {
        detail: { plan: window.currentPlan }
      })
    );

    if(window.isPro()){
      setTimeout(()=>{
        document.dispatchEvent(new Event("rb_force_ui_refresh"));
      },200);
    }

  }catch(err){

    console.error("❌ ERRORE loadUserPlan:", err);

    if(!window.currentPlan){
  window.currentPlan = "free";
}

  }

}
// ===============================
// AGGIORNA PIANO UTENTE
// ===============================

export async function upgradeToPro(uid){

await updateDoc(doc(db,"users",uid),{
plan:"pro",
updatedAt:new Date()
});

await loadUserPlan(uid);

}

export async function upgradeToInvestor(uid){

await updateDoc(doc(db,"users",uid),{
plan:"investor",
updatedAt:new Date()
});

await loadUserPlan(uid);

}

// ===============================
// UI USER NAVBAR
// ===============================

function updateUserUI(user) {

  const userArea = document.getElementById("user-area");
  if (!userArea) return;

  const lang = getCurrentLang();

  const welcomeText =
    lang === "en"
      ? "Welcome"
      : "Benvenuto";

  const loginText =
    lang === "en"
      ? "Login"
      : "Accedi";

  if (user) {

    const name = user.email.split("@")[0];

    userArea.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:13px;">
          👤 ${welcomeText} <strong>${name}</strong>
          ${window.currentPlan !== "free"
          ? `<span style="color:#00c896; font-weight:bold;"> ${window.currentPlan.toUpperCase()}</span>`
          : ''}
        </span>

        <button id="logout-btn" class="btn btn-secondary" style="padding:6px 12px; font-size:12px;">
          Logout
        </button>
      </div>
    `;

    const logoutBtn = document.getElementById("logout-btn");

    if(logoutBtn){
      logoutBtn.addEventListener("click", async () => {
        await logoutUser();
        window.location.reload();
      });
    }

  } else {

    userArea.innerHTML = `
      <button onclick="window.location.href='/login/'" 
        class="btn btn-secondary" 
        style="padding:8px 18px; font-size:13px;">
        ${loginText}
      </button>
    `;
  }
}


// ===============================
// AUTH OBSERVER (FIX DEFINITIVO STABILE)
// ===============================

onAuthStateChanged(auth, async (user) => {

  window.currentUser = user;
  window.firebaseReady = false;
  window.userReady = false;

  // ===============================
  // 🔴 UTENTE NON LOGGATO
  // ===============================
  if (!user) {

    console.log("👤 Utente non loggato");

    window.currentUser = null;
    window.currentPlan = "free";
    window.userReady = false;
    window.firebaseReady = true;

    updateUserUI(null);

    document.dispatchEvent(new Event("rb_plan_loaded"));

    document.dispatchEvent(
      new CustomEvent("rb_auth_ready", {
        detail: {
          user: null,
          plan: "free"
        }
      })
    );

    return; // 🔥 CRITICO → STOP QUI
  }

  // ===============================
  // 🟢 UTENTE LOGGATO
  // ===============================

  console.log("🔥 Auth OK:", user.uid);

  window.userReady = true;

  try {

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    // ===============================
    // 🔥 AUTO CREATE USER
    // ===============================
    if (!snap.exists()) {

      console.log("🔥 Creo utente Firestore automatico");

      await setDoc(userRef, {
        email: user.email,
        plan: user.email === "rendimentobb@gmail.com" ? "pro" : "free",
        role: user.email === "rendimentobb@gmail.com" ? "admin" : "user",
        createdAt: new Date()
      });

    } else {
      console.log("✔ Utente già presente in Firestore");
    }

    // ===============================
    // 🔥 DATI UTENTE
    // ===============================

    const freshSnap = await getDoc(userRef);
    const userData = freshSnap.data();

    window.isAdmin = () => userData?.role === "admin";

    window.getUserData = () => ({
      user: window.currentUser,
      plan: window.currentPlan,
      isAdmin: window.isAdmin()
    });

    // ===============================
    // 🔥 CARICA PIANO (UNICA VERITÀ)
    // ===============================

    await loadUserPlan(user.uid);

    // ===============================
    // 🔥 FIREBASE READY
    // ===============================

    window.firebaseReady = true;

    console.log("✅ Firebase READY con piano:", window.currentPlan);

    // ===============================
    // 🔥 UPDATE UI
    // ===============================

    updateUserUI(user);

    // ===============================
    // 🔥 EVENTI GLOBALI (UNICO PUNTO)
    // ===============================

    document.dispatchEvent(new Event("rb_plan_loaded"));

    document.dispatchEvent(
      new CustomEvent("rb_auth_ready", {
        detail: {
          user: user,
          plan: window.currentPlan
        }
      })
    );

  } catch (err) {

    console.error("❌ Errore init utente:", err);

    window.currentPlan = "free";
    window.firebaseReady = true;

    document.dispatchEvent(new Event("rb_plan_loaded"));
  }

});
// ===============================
// STRIPE PLAN ACTIVATION
// ===============================

document.addEventListener("rb_stripe_return", async (e)=>{

if(!window.currentUser) return;

try{

await updateDoc(doc(db,"users",window.currentUser.uid),{
plan:"investor",
stripeSession:e.detail.session,
updatedAt:new Date()
});

await loadUserPlan(window.currentUser.uid);

alert(
getCurrentLang()==="it"
? "Pagamento completato! Piano Investor attivo."
: "Payment successful! Investor plan activated."
);

}catch(err){

console.error("Errore attivazione piano:",err);

}

});

document.addEventListener("rb_language_changed", () => {

  updateUserUI(currentUser);

});


// ===============================
// DOM EVENTS
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  // ===============================
// STRIPE RETURN CHECK
// ===============================

const params = new URLSearchParams(window.location.search);
const stripeSession = params.get("session_id");

if(stripeSession){

console.log("Stripe session rilevata:", stripeSession);

document.dispatchEvent(
  new CustomEvent("rb_stripe_return",{
    detail:{ session: stripeSession }
  })
);

  params.delete("session_id");
  history.replaceState({}, document.title, window.location.pathname);  

}

  const registerAction = document.getElementById("register-action");
  const loginAction = document.getElementById("login-action");
  const proBtn = document.getElementById("pro-btn");

  if (registerAction) {

    registerAction.addEventListener("click", async () => {

      const email = document.getElementById("auth-email").value;
      const password = document.getElementById("auth-password").value;

      try {

        await registerUser(email, password);

      } catch (err) {

        alert(err.message);

      }

    });

  }

  if (loginAction) {

    loginAction.addEventListener("click", async () => {

      const email = document.getElementById("auth-email").value;
      const password = document.getElementById("auth-password").value;

      try {

        await loginUser(email, password);

      } catch (err) {

        alert(err.message);

      }

    });

  }

});
