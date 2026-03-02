// ===============================
// FIREBASE INIT – RENDIMENTOBB
// VERSIONE COMPLETA OPERATIVA
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
  getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// 🔐 CONFIGURAZIONE REALE
const firebaseConfig = {
  apiKey: "AIzaSyDu-2G2FHB8VCdCJ9P0m07bD5JShRGScc",
  authDomain: "rendimento-bb.firebaseapp.com",
  projectId: "rendimento-bb",
  storageBucket: "rendimento-bb.firebasestorage.app",
  messagingSenderId: "14445254362",
  appId: "1:14445254362:web:829e08d7b1703137b16a03",
  measurementId: "G-749B8PW4ST"
};

// 🚀 INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let currentPlan = "free";

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

  updateProVisibility();
}

// ===============================
// UI NAVBAR
// ===============================

function updateUserUI(user) {
  const userArea = document.getElementById("user-area");
  if (!userArea) return;

  if (user) {
    userArea.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:13px;">${user.email}</span>
        <button id="logout-btn" class="btn btn-secondary" style="padding:6px 12px; font-size:12px;">
          Logout
        </button>
      </div>
    `;

    document.getElementById("logout-btn").addEventListener("click", logoutUser);

  } else {
    userArea.innerHTML = `
      <button id="login-btn" class="btn btn-secondary" style="padding:8px 18px; font-size:13px;">
        Accedi
      </button>
    `;

    document.getElementById("login-btn").addEventListener("click", openAuthModal);
  }
}

// ===============================
// PRO VISIBILITY
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
// MODAL
// ===============================

function openAuthModal() {
  document.getElementById("auth-modal").classList.remove("hidden");
}

function closeAuthModal() {
  document.getElementById("auth-modal").classList.add("hidden");
}

// ===============================
// EVENTI DOM
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  const closeBtn = document.getElementById("close-auth");
  const registerAction = document.getElementById("register-action");
  const loginAction = document.getElementById("login-action");
  const proBtn = document.getElementById("pro-btn");

  if (closeBtn) closeBtn.addEventListener("click", closeAuthModal);

  if (registerAction) {
    registerAction.addEventListener("click", async () => {
      const email = document.getElementById("auth-email").value;
      const password = document.getElementById("auth-password").value;

      try {
        await registerUser(email, password);
        closeAuthModal();
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
        closeAuthModal();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  if (proBtn) {
    proBtn.addEventListener("click", () => {
      if (!currentUser) {
        openAuthModal();
        return;
      }

      window.location.href = "https://buy.stripe.com/test_dRmeVcdNBefv7Njf6w8N200?pro=paid";
    });
  }
});

// ===============================
// AUTH OBSERVER
// ===============================

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  updateUserUI(user);

  if (user) {
    await loadUserPlan(user.uid);
  }
});
