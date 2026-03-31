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
  apiKey: "AIzaSy...",
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

window.currentUser = null;
window.currentPlan = "free";
window.firebaseReady = false;

// 🔥 UNICA SOURCE OF TRUTH
window.isPro = function(){
  return (
    window.currentPlan === "pro" ||
    window.currentPlan === "investor" ||
    window.currentPlan === "pro_yearly"
  );
};


// ===============================
// REGISTER
// ===============================

async function registerUser(email, password) {

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    email,
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
// LOAD PLAN (CRITICO)
// ===============================

async function loadUserPlan(uid) {

  try{

    const docSnap = await getDoc(doc(db, "users", uid));

    if (docSnap.exists()) {
      window.currentPlan = docSnap.data().plan || "free";
    } else {
      window.currentPlan = "free";
    }

    console.log("🔥 Piano:", window.currentPlan);

    // 🔥 EVENTO GLOBALE
    document.dispatchEvent(
      new CustomEvent("rb_plan_loaded", {
        detail: { plan: window.currentPlan }
      })
    );

    // 🔥 SBLOCCO DIRETTO
    if(window.isPro()){
      if(typeof unlockProUI === "function"){
        unlockProUI();
      }
    }

  }catch(err){

    console.error("❌ Errore piano:", err);
    window.currentPlan = "free";

  }

}


// ===============================
// AUTH OBSERVER (FIX DEFINITIVO)
// ===============================

onAuthStateChanged(auth, async (user) => {

  window.firebaseReady = false;
  window.currentUser = user;

  if (user) {

    console.log("🔥 Auth OK:", user.uid);

    await loadUserPlan(user.uid);

    // 🔥 QUI DIVENTA READY
    window.firebaseReady = true;

    console.log("✅ Firebase READY:", window.currentPlan);

  } else {

    console.log("👤 Guest");

    window.currentPlan = "free";
    window.firebaseReady = true;

    document.dispatchEvent(new Event("rb_plan_loaded"));

  }

  // 🔥 EVENTO GLOBALE
  document.dispatchEvent(
    new CustomEvent("rb_auth_ready", {
      detail: {
        user,
        plan: window.currentPlan
      }
    })
  );

});


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
    console.error(err);
  }

});


// ===============================
// DOM EVENTS
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  const registerAction = document.getElementById("register-action");
  const loginAction = document.getElementById("login-action");

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
