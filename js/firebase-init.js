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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// ===============================
// GLOBAL STATE
// ===============================

let currentUser = null;
let currentPlan = "free";

window.currentUser = null;
window.currentPlan = "free";
window.isProUser = () => window.currentPlan === "pro";


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

  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    currentPlan = docSnap.data().plan || "free";
  } else {
    currentPlan = "free";
  }

  window.currentPlan = currentPlan;

  document.dispatchEvent(
    new CustomEvent("rb_plan_loaded", {
      detail: { plan: currentPlan }
    })
  );

  updateProVisibility();
}


// ===============================
// AGGIORNA PRO (TEST)
// ===============================

export async function upgradeToPro(uid) {

  await updateDoc(doc(db, "users", uid), {
    plan: "pro"
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
          ${currentPlan === "pro" ? '<span style="color:#00c896; font-weight:bold;"> PRO</span>' : ''}
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

  currentUser = user;
  window.currentUser = user;

  if (user) {
    await loadUserPlan(user.uid);
  }

  updateUserUI(user);

});


// ===============================
// LANGUAGE CHANGE LISTENER
// ===============================

document.addEventListener("rb_language_changed", () => {

  updateUserUI(currentUser);

});


// ===============================
// DOM EVENTS
// ===============================

document.addEventListener("DOMContentLoaded", () => {

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

   if (proBtn) {

      proBtn.addEventListener("click", async () => {

   if (!currentUser) {

      window.location.href = "/login/";
      return;

    }

    const uid = currentUser.uid;

    window.location.href =
      "https://checkout.stripe.com/c/pay/YOUR_STRIPE_LINK?client_reference_id=" + uid;

  });

}

});
