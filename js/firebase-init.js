// ===============================
// FIREBASE INIT – RENDIMENTOBB
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

// 🔐 CONFIGURAZIONE
const firebaseConfig = {
  apiKey: "TUO_API_KEY",
  authDomain: "TUO_AUTH_DOMAIN",
  projectId: "TUO_PROJECT_ID",
  storageBucket: "TUO_STORAGE_BUCKET",
  messagingSenderId: "TUO_MESSAGING_ID",
  appId: "TUO_APP_ID"
};

// 🚀 INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===============================
// REGISTRAZIONE
// ===============================

export async function registerUser(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Creiamo documento utente in Firestore
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

export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// ===============================
// LOGOUT
// ===============================

export async function logoutUser() {
  await signOut(auth);
}

// ===============================
// GET USER PLAN
// ===============================

export async function getUserPlan(uid) {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().plan;
  } else {
    return "free";
  }
}

// ===============================
// AUTH STATE LISTENER
// ===============================

export function observeAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}
