/* ===================== */
/* RENDIMENTOBB HEADER ULTRA SAAS */
/* ===================== */

import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

/* ===================== */
/* HERO BG */
/* ===================== */

window.applyCityBackground = function(){

  const hero =
    document.querySelector(".hero-bg") ||
    document.querySelector(".hero");

  if(!hero) return;

  hero.classList.remove("rome","naples","milan","florence");

  const path = window.location.pathname.toLowerCase();

  let city = "rome";

  if(path.includes("milano")) city = "milan";
  else if(path.includes("napoli")) city = "naples";
  else if(path.includes("firenze")) city = "florence";

  hero.classList.add(city);
};


/* ===================== */
/* INIT HEADER */
/* ===================== */

document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("global-header");
  if(!container) return;

  container.innerHTML = `
  <header class="rb-header">

    <div class="rb-inner">

      <!-- LEFT -->
      <div class="rb-left">
        <a href="/">
          <img src="/img/logo-main.png" class="rb-logo">
        </a>
      </div>

      <!-- CENTER -->
      <nav class="rb-center">

        <a href="/tool/"
        data-it="Simulatore"
        data-en="Simulator">Simulatore</a>

        <a href="/aprire-bnb-conviene/"
        data-it="Aprire un B&B"
        data-en="Start a B&B">Aprire un B&B</a>

        <a href="/mutui/"
        data-it="Mutui"
        data-en="Mortgages">Mutui</a>

        <a href="/immobili/"
        data-it="Immobili"
        data-en="Properties">Immobili</a>

        <a href="/academy/"
        data-it="Academy"
        data-en="Academy">Academy</a>

      </nav>

      <!-- RIGHT -->
      <div class="rb-right">

        <!-- LANGUAGE -->
        <div class="rb-lang">
          <button data-lang="it">IT</button>
          <button data-lang="en">EN</button>
        </div>

        <div id="user-area"></div>

        <button id="rb-burger">☰</button>

      </div>

    </div>

    <!-- MOBILE MENU -->
    <div class="rb-mobile" id="rb-mobile">

      <div id="mobile-user-area"></div>

      <a href="/tool/" data-it="Simulatore" data-en="Simulator">Simulatore</a>
      <a href="/aprire-bnb-conviene/" data-it="Aprire un B&B" data-en="Start a B&B">Aprire un B&B</a>
      <a href="/mutui/" data-it="Mutui" data-en="Mortgages">Mutui</a>
      <a href="/immobili/" data-it="Immobili" data-en="Properties">Immobili</a>
      <a href="/academy/" data-it="Academy" data-en="Academy">Academy</a>
      <a href="/contact.html" data-it="Contatti" data-en="Contact">Contatti</a>

    </div>

  </header>
  `;

  window.applyCityBackground();

  initHeaderInteractions();
  initUser();

  window.addEventListener("rb_plan_ready", () => {

  console.log("🔥 HEADER FORCE RENDER (plan ready)");

  // 🔥 aspetta che isPro sia stabile
  setTimeout(()=>{

    if(window.currentUser){
      renderUser(window.currentUser);
    }

  }, 200);

});

  // 🔥 APPLY LANG SUBITO
  if(window.setLang){
    window.setLang(localStorage.getItem("rb_lang") || "it");
  }

});

// 🔥 FIX HARD → quando Firebase è pronto
document.addEventListener("rb_auth_ready", () => {

  console.log("🔥 HEADER SYNC AUTH READY");

  setTimeout(()=>{

    if(window.currentUser){
      renderUser(window.currentUser);
    }

  }, 300);

});


/* ===================== */
/* INTERACTIONS */
/* ===================== */

function initHeaderInteractions(){

  const burger = document.getElementById("rb-burger");
  const mobile = document.getElementById("rb-mobile");

  if(burger && mobile){

    burger.onclick = (e)=>{
      e.stopPropagation();
      mobile.classList.toggle("open");
    };

    document.addEventListener("click",(e)=>{
      if(!mobile.contains(e.target) && !burger.contains(e.target)){
        mobile.classList.remove("open");
      }
    });
  }

  // LANGUAGE
  document.querySelectorAll(".rb-lang button").forEach(btn=>{

    btn.onclick = ()=>{

      const lang = btn.dataset.lang;

      localStorage.setItem("rb_lang", lang);

      if(window.setLang){
        window.setLang(lang);
      }

      updateLangButtons(lang);

    };

  });

  updateLangButtons(localStorage.getItem("rb_lang") || "it");

}

function updateLangButtons(lang){

  document.querySelectorAll(".rb-lang button").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

}


/* ===================== */
/* USER AREA */
/* ===================== */

function initUser(){

  let attempts = 0;

  const waitFirebase = setInterval(()=>{

    attempts++;

    if(!window.firebaseReady && attempts < 20) return;

    clearInterval(waitFirebase);

    try{

      onAuthStateChanged(auth, (user)=>{

        // aspetta che il piano sia pronto
        let tries = 0;

        const waitPlan = setInterval(()=>{

          tries++;

          const isReady =
  window.currentPlan &&
  window.currentPlan !== "free";

const isAdmin =
  window.userRole === "admin" ||
  window.currentUser?.email === "rendimentobb@gmail.com";

if(
  isReady ||
  isAdmin ||
  tries > 20
){
            clearInterval(waitPlan);
            renderUser(user);
          }

        },100);

      });

    }catch(e){
      renderUser(null);
    }

  },100);

}


/* ===================== */
/* RENDER USER */
/* ===================== */

function renderUser(user){

  const el = document.getElementById("user-area");
  const mobileEl = document.getElementById("mobile-user-area");

  if(!el) return;

  const lang = localStorage.getItem("rb_lang") || "it";

  // ===============================
  // 🔥 NORMALIZZAZIONE DATI (CRITICA)
  // ===============================

  const clean = (v) => {
    return String(v || "")
      .replace(/"/g, "")
      .trim()
      .toLowerCase();
  };

  const plan = clean(window.currentPlan || window.userPlan);
  const role = clean(window.userRole);

  // ===============================
  // 🔥 ADMIN + PRO LOGIC (UNICA VERITÀ)
  // ===============================

  const ADMIN_EMAILS = ["rendimentobb@gmail.com"];

  const isAdmin =
    ADMIN_EMAILS.includes(user?.email) ||
    role === "admin";

  const isPro =
    isAdmin ||
    plan === "pro" ||
    plan === "investor" ||
    plan === "pro_yearly";

  console.log("HEADER DEBUG CLEAN →", {
    email: user?.email,
    plan,
    role,
    isAdmin,
    isPro
  });

  // ===============================
  // USER LOGGATO
  // ===============================

  if(user){

    const email = user.email || "";

    let html = `<div class="rb-user">`;

    html += `<span class="rb-email">${email}</span>`;

    // 🔥 DASHBOARD
    if(isPro){
      html += `<a href="/dashboard/" class="rb-btn"
      data-it="Dashboard"
      data-en="Dashboard">Dashboard</a>`;
    }

    // 🔥 ADMIN
    if(isAdmin){
      html += `<a href="/dashboard-leads/" class="rb-btn"
      data-it="Leads"
      data-en="Leads">Leads</a>`;
    }

    // 🔥 LOGOUT
    html += `<button id="logout" class="rb-btn red"
    data-it="Logout"
    data-en="Logout">Logout</button>`;

    html += `</div>`;

    el.innerHTML = html;

    // ===============================
    // MOBILE
    // ===============================

    if(mobileEl){

      let mobileHTML = `
      <div class="rb-mobile-user">
        <div class="rb-email">${email}</div>
      `;

      if(isPro){
        mobileHTML += `<a href="/dashboard/" class="rb-btn"
        data-it="Dashboard"
        data-en="Dashboard">Dashboard</a>`;
      }

      if(isAdmin){
        mobileHTML += `<a href="/dashboard-leads/" class="rb-btn"
        data-it="Leads"
        data-en="Leads">Leads</a>`;
      }

      mobileHTML += `<button id="logout-mobile" class="rb-btn red"
      data-it="Logout"
      data-en="Logout">Logout</button></div>`;

      mobileEl.innerHTML = mobileHTML;
    }

    // ===============================
    // LOGOUT
    // ===============================

    document.querySelectorAll("#logout, #logout-mobile").forEach(btn=>{
      btn.onclick = async ()=>{
        await signOut(auth);
        location.reload();
      };
    });

  } else {

    el.innerHTML = `
      <a href="/login/" class="rb-login"
      data-it="Accedi"
      data-en="Login">Accedi</a>
    `;

  }

  // ===============================
  // 🔥 RE-APPLY LANG
  // ===============================

  if(window.setLang){
    window.setLang(lang);
  }

}
