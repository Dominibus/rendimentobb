// ===============================
// FIREBASE INIT – RENDIMENTOBB (FIX DEFINITIVO)
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

window.firebaseAuth = auth;


// ===============================
// GLOBAL STATE
// ===============================

let currentPlan = "free";

window.currentUser = null;
window.currentPlan = "free";
window.firebaseReady = false;

window.isProUser = () =>
  window.currentPlan === "pro" ||
  window.currentPlan === "investor" ||
  window.currentPlan === "pro_yearly";


// ===============================
// HELPER – LANGUAGE
// ===============================

function getCurrentLang(){
  if(window.currentLang) return window.currentLang;
  return localStorage.getItem("rb_lang") || "it";
}


// ===============================
// REGISTER
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
// 🔥 LOAD USER PLAN (FIX + DEBUG)
// ===============================

async function loadUserPlan(uid) {

  try{

    console.log("🔥 Carico piano per:", uid);

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    console.log("🔥 Snapshot exists:", docSnap.exists());

    if (docSnap.exists()) {
      console.log("🔥 Data:", docSnap.data());
      currentPlan = docSnap.data().plan || "free";
    } else {
      console.warn("⚠️ Documento utente NON trovato");
      currentPlan = "free";
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
// UPDATE PLAN
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
// USER UI
// ===============================

function updateUserUI(user) {

  const userArea = document.getElementById("user-area");
  if (!userArea) return;

  const lang = getCurrentLang();

  const welcomeText = lang === "en" ? "Welcome" : "Benvenuto";
  const loginText = lang === "en" ? "Login" : "Accedi";

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

    document.getElementById("logout-btn")?.addEventListener("click", async () => {
      await logoutUser();
      window.location.reload();
    });

  } else {

    userArea.innerHTML = `
      <button onclick="window.location.href='/login/'" 
        class="btn btn-secondary">
        ${loginText}
      </button>
    `;
  }
}


// ===============================
// PRO UI
// ===============================

function updateProVisibility() {

  const proBtn = document.getElementById("pro-btn");
  if (!proBtn) return;

  if (window.currentPlan === "pro") {
    proBtn.textContent = "PRO Attivo";
    proBtn.disabled = true;
    proBtn.style.opacity = 0.6;
  }
}


// ===============================
// 🔥 AUTH OBSERVER (FIX TIMING)
// ===============================

onAuthStateChanged(auth, async (user) => {

  window.currentUser = user;

  if (user) {

    console.log("🔥 Auth OK:", user.uid);

    // 🔥 carico piano
    await loadUserPlan(user.uid);

    // 🔥 ora Firebase è pronto
    window.firebaseReady = true;

    updateUserUI(user);

  } else {

    console.log("👤 Utente non loggato");

    window.currentPlan = "free";
    window.firebaseReady = true;

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
// 🔥 FAILSAFE (ANTI BUG)
// ===============================

setTimeout(()=>{
  if(window.currentUser && window.currentUser.uid){
    console.log("⚡ Fallback loadUserPlan");
    loadUserPlan(window.currentUser.uid);
  }
},1000);


// ===============================
// STRIPE RETURN
// ===============================

document.addEventListener("rb_stripe_return", async (e)=>{

if(!window.currentUser) return;

try{

await updateDoc(doc(db,"users",window.currentUser.uid),{
plan:"investor",
updatedAt:new Date()
});

await loadUserPlan(window.currentUser.uid);

alert("Pagamento completato!");

}catch(err){
console.error("Errore Stripe:",err);
}

});


// ===============================
// DOM READY
// ===============================

document.addEventListener("DOMContentLoaded", () => {

const params = new URLSearchParams(window.location.search);
const stripeSession = params.get("session_id");

if(stripeSession){

document.dispatchEvent(
  new CustomEvent("rb_stripe_return",{
    detail:{ session: stripeSession }
  })
);

params.delete("session_id");
history.replaceState({}, document.title, window.location.pathname);

}

});
