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
const db = getFirestore(app);

// rende Firebase Auth globale per tutto il sito
window.firebaseAuth = auth;


// ===============================
// GLOBAL STATE
// ===============================

let currentUser = null;
let currentPlan = "free";

window.currentUser = null;
window.currentPlan = "free";
window.firebaseReady = false;

window.isProUser = () =>
window.currentPlan === "pro" ||
window.currentPlan === "investor";

// ===============================
// REQUIRE PLAN (BLOCCO FEATURE)
// ===============================

window.requirePlan = function(required){

const plan = window.currentPlan;

// INVESTOR access
if(required === "investor"){
if(plan === "investor" || plan === "pro" || plan === "pro_yearly"){
return true;
}
}

// PRO access
if(required === "pro"){
if(plan === "pro" || plan === "pro_yearly"){
return true;
}
}

// ❌ BLOCCO
alert(
getCurrentLang() === "it"
? "Sblocca la versione PRO per usare questa funzione"
: "Upgrade to PRO to use this feature"
);

// scroll pricing (UX migliore)
window.location.href = "/#pricing";

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
  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    email: email,
    plan: "free",
    createdAt: new Date()
  });

  return user;
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
// CARICA PIANO UTENTE
// ===============================

async function loadUserPlan(uid) {

  try{

    console.log("🔥 Carico piano per:", uid);

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
  currentPlan = docSnap.data().plan || "free";
} else {
  console.warn("⚠️ Documento NON trovato → NON sovrascrivo");

  // 🔥 NON toccare il piano se già caricato
  if(!window.currentPlan){
    currentPlan = "free";
  }
}

    window.currentPlan = currentPlan;

    console.log("🔥 Piano finale:", currentPlan);

    document.dispatchEvent(
      new CustomEvent("rb_plan_loaded", {
        detail: { plan: currentPlan }
      })
    );

    updateProVisibility();

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
          ${currentPlan !== "free"
          ? `<span style="color:#00c896; font-weight:bold;"> ${currentPlan.toUpperCase()}</span>`
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
// PRO BUTTON
// ===============================

function updateProVisibility() {

  const proBtn = document.getElementById("pro-btn");
  if (!proBtn) return;

  if (currentPlan === "pro") {

    proBtn.textContent = "PRO Attivo";
    proBtn.disabled = true;
    proBtn.style.opacity = 0.6;
  }
}


// ===============================
// AUTH OBSERVER
// ===============================

onAuthStateChanged(auth, async (user) => {

  window.currentUser = user;
  window.firebaseReady = false;

  if (user) {

    console.log("🔥 Auth OK:", user.uid);

    // 🔥 carica piano
    await loadUserPlan(user.uid);

    // 🔥 ora Firebase è pronto
    window.firebaseReady = true;
    console.log("✅ Firebase READY con piano:", window.currentPlan);

    // 🔥 aggiorna UI
    updateUserUI(user);

  } else {

    console.log("👤 Utente non loggato");

    window.currentPlan = "free";
    window.firebaseReady = true; // ✅ MANCAVA QUESTO

    updateUserUI(null);

    document.dispatchEvent(new Event("rb_plan_loaded"));

  }

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
