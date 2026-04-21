/* =====================================
🔥 RENDIMENTOBB HEADER – FINAL CLEAN (STABLE)
===================================== */

import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// ===============================
// 🔧 GLOBAL UNLOCK (FIX DEFINITIVO)
// ===============================

window.unlockUI = function(){

  console.log("🔓 unlockUI GLOBAL");

  // reset elementi bloccati
  document.querySelectorAll(`
    .pro-blur,
    .locked,
    .blur,
    .locked-section
  `).forEach(el=>{
    el.classList.remove("is-locked");
    el.style.filter = "none";
    el.style.pointerEvents = "auto";
    el.style.opacity = "1";
  });

  // 🔥 FIX CRITICO → rimuove TUTTI overlay
  document.querySelectorAll(`
    .locked-overlay,
    .results-overlay,
    .home-blur-overlay,
    .upgrade-overlay,
    .lock-overlay
  `).forEach(el=> el.remove());

};

// =====================
// 🎨 HERO BG
// =====================

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
  else if(path.includes("roma")) city = "rome";

  hero.classList.add(city);
};

// =====================
// 🚀 INIT HEADER
// =====================

document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("global-header");
  if(!container) return;

  container.innerHTML = `

  <header class="rb-header">
    <div class="rb-inner">

      <div class="rb-left">
        <a href="/">
          <img src="/img/logo-main.png" class="rb-logo">
        </a>
      </div>

      <nav class="rb-center">
        <a href="/tool/">Simulatore</a>
        <a href="/aprire-bnb-conviene/">Aprire un B&B</a>
        <a href="/mutui/">Mutui</a>
        <a href="/immobili/">Immobili</a>
        <a href="/academy/">Academy</a>
      </nav>

      <div class="rb-right">
        <div class="rb-lang">
          <button data-lang="it">IT</button>
          <button data-lang="en">EN</button>
        </div>

        <div id="user-area"></div>

        <button id="rb-burger">☰</button>
      </div>

    </div>
  </header>

  <div id="rb-mobile-overlay" class="rb-menu-overlay"></div>

  <div id="rb-mobile" class="rb-mobile-menu">
    <nav id="rb-mobile-nav"></nav>
  </div>

  `;

  applyCityBackground();
  initHeaderInteractions();

  onAuthStateChanged(auth, (user) => {
    waitPlanAndRender(user);
  });

});

// =====================
// ⏳ WAIT PLAN (FIX REALE)
// =====================

function waitPlanAndRender(user){

  let attempts = 0;

  const interval = setInterval(()=>{

    attempts++;

    let access = null;

    if(typeof window.getUserAccess === "function"){
      access = window.getUserAccess();
    }

    const ready =
      access &&
      typeof access.isInvestor !== "undefined";

    if(ready || attempts > 20){

      clearInterval(interval);

      console.log("🎯 HEADER READY:", access);

      renderUser(user);

      document.dispatchEvent(new Event("rb_auth_ready"));

      setTimeout(()=>{

        const isAdmin =
          (window.userRole || "").toLowerCase() === "admin" ||
          user?.email === "rendimentobb@gmail.com";

        const isPro = isAdmin || (access && access.isPro);
        const isInvestor = access && access.isInvestor;

        // 🔥 RESET CLASSI BODY
        document.body.classList.remove(
          "is-free",
          "is-investor",
          "is-pro",
          "is-admin"
        );

        if(isAdmin) document.body.classList.add("is-admin");
        else if(isPro) document.body.classList.add("is-pro");
        else if(isInvestor) document.body.classList.add("is-investor");
        else document.body.classList.add("is-free");

        // 🔥 RESET UI COMPLETO
        unlockUI();

        console.log("✅ UI FIX COMPLETATO");

      },120);

    }

  },120);

}

// =====================
// 📱 MENU
// =====================

function initHeaderInteractions(){

  const burger = document.getElementById("rb-burger");
  const mobile = document.getElementById("rb-mobile");
  const overlay = document.getElementById("rb-mobile-overlay");

  burger.onclick = () => {
    mobile.classList.toggle("open");
    overlay.classList.toggle("open");
  };

  overlay.onclick = () => {
    mobile.classList.remove("open");
    overlay.classList.remove("open");
  };

}

// =====================
// 👤 USER AREA
// =====================

function renderUser(user){

  const el = document.getElementById("user-area");
  if(!el) return;

  const access = window.getUserAccess ? window.getUserAccess() : {};

  const isAdmin =
    user?.email === "rendimentobb@gmail.com";

  const isPaid = isAdmin || access.isInvestor || access.isPro;

  if(user){

    let badge = "FREE";

    if(isAdmin) badge = "ADMIN";
    else if(access.isPro) badge = "PRO";
    else if(access.isInvestor) badge = "INVESTOR";

    el.innerHTML = `
      <div class="rb-user">
        <a href="${isPaid ? "/dashboard/" : "#"}" class="rb-btn primary">
          Dashboard <span class="badge-pro">${badge}</span>
        </a>
        <button id="logout" class="rb-btn red">Logout</button>
      </div>
    `;

    document.getElementById("logout").onclick = async ()=>{
      await signOut(auth);
      location.reload();
    };

  } else {

    el.innerHTML = `
      <a href="/login/" class="rb-login">Accedi</a>
    `;

  }

}

window.renderUser = renderUser;
