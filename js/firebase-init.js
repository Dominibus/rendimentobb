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

  const plan = window.currentPlan;

  // 🔓 INVESTOR access
  if(required === "investor"){
    if(
      plan === "investor" ||
      plan === "pro" ||
      plan === "pro_yearly"
    ){
      return true;
    }
  }

  // 🔓 PRO access
  if(required === "pro"){
    if(
      plan === "pro" ||
      plan === "pro_yearly"
    ){
      return true;
    }
  }

  // ===============================
  // UX BLOCCO (NO BREAK APP)
  // ===============================

  if(typeof showUpgradeModal === "function"){

    showUpgradeModal(12);

    setTimeout(()=>{
      alert(
        (window.getCurrentLang && getCurrentLang() === "it")
        ? "⚠️ Stai prendendo decisioni senza vedere i dati reali"
        : "⚠️ You are making decisions without real data"
      );
    }, 300);

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

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    let plan = "free";

    if (docSnap.exists()) {
      plan = docSnap.data().plan || "free";
    } else {
      console.warn("⚠️ Documento NON trovato");
    }

    // 🔥 SET GLOBALE
    window.currentPlan = plan;
    window.plan = plan;

    console.log("🔥 Piano finale:", window.currentPlan);

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

    window.currentPlan = "free";

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
// AUTH OBSSERVER (FIX DEFINITIVO)
// ===============================

onAuthStateChanged(auth, async (user) => {

  window.currentUser = user;
  window.firebaseReady = false;

  if (user) {

    console.log("🔥 Auth OK:", user.uid);

   // ===============================
// 🔥 AUTO CREATE USER (FIX CRITICO)
// ===============================

const userRef = doc(db, "users", user.uid);
const snap = await getDoc(userRef);

// 👉 se NON esiste → lo creo
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
// 🔥 RICARICO DATI (FIX CRITICO)
// ===============================

const freshSnap = await getDoc(userRef);
const userData = freshSnap.data();

// ===============================
// 🔥 ADMIN CHECK (CORRETTO)
// ===============================

window.isAdmin = function(){
  return userData?.role === "admin";
};

// ===============================
// 🔥 GLOBAL USER DATA (UTILISSIMO)
// ===============================

window.getUserData = function(){
  return {
    user: window.currentUser,
    plan: window.currentPlan,
    isAdmin: window.isAdmin()
  };
};

    // ===============================
    // 🔥 CARICA PIANO
    // ===============================

    await loadUserPlan(user.uid);

    // ===============================
    // 🔥 FIREBASE READY
    // ===============================

    window.firebaseReady = true;

    console.log("✅ Firebase READY con piano:", window.currentPlan);

    // ===============================
    // 🔥 ADMIN CHECK
    // ===============================

    window.isAdmin = function(){
  return userData?.role === "admin";
};

    // ===============================
    // 🔥 UPDATE UI
    // ===============================

    updateUserUI(user);

// ===============================
// 🔥 PRO UNLOCK (FIX DEFINITIVO VERO)
// ===============================

if(!window.firebaseReady){
  console.log("⏳ Firebase non pronto → skip UI logic");
  return;
}

// 🔥 aspetta utente
if(!window.currentUser){
  console.log("⏳ Utente non ancora disponibile → skip");
  return;
}

// 🔥 PRO CHECK UNICO
if(window.isPro?.()){

  console.log("💰 Utente PRO → sblocco totale UI");

  document.body.classList.add("pro-user");

  if(typeof unlockProUI === "function"){
    unlockProUI();
  }

} else {

  console.log("👀 Utente FREE → attivo funnel");

  setTimeout(()=>{
    console.log("📊 Questo investimento potrebbe nascondere rischi non visibili");
  },1500);

}
    // ===============================
    // 🔴 UTENTE NON LOGGATO
    // ===============================

    console.log("👤 Utente non loggato");

    window.currentPlan = "free";
    window.firebaseReady = true;

    updateUserUI(null);

    document.dispatchEvent(new Event("rb_plan_loaded"));

    setTimeout(()=>{
      console.log("📊 +1.247 utenti stanno analizzando investimenti ora");
    },2000);

  }

  // ===============================
  // 🔥 EVENTO GLOBALE (NON TOCCARE)
  // ===============================

  document.dispatchEvent(
    new CustomEvent("rb_auth_ready", {
      detail: {
        user: user,
        plan: window.currentPlan
      }
    })
  );

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
