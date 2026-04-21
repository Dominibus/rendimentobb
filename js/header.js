/* =====================================
🔥 RENDIMENTOBB HEADER – FINAL FIXED
===================================== */

import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// ===============================
// 🔧 GLOBAL UNLOCK (REALE)
// ===============================

window.unlockUI = function(){

  console.log("🔓 unlockUI HARD RESET");

  // 🔥 reset classi blur REALI
  document.querySelectorAll(".locked-section").forEach(el=>{
    el.classList.remove("is-locked");
    el.style.filter = "none";
    el.style.pointerEvents = "auto";
    el.style.opacity = "1";
  });

  // 🔥 vecchi sistemi
  document.querySelectorAll(".pro-blur, .locked, .blur").forEach(el=>{
    el.style.filter = "none";
    el.style.pointerEvents = "auto";
    el.style.opacity = "1";
  });

  // 🔥 overlay
  document.querySelectorAll(`
    .locked-overlay,
    .results-overlay,
    .home-blur-overlay,
    .upgrade-overlay
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

  <div id="rb-pro-modal" class="rb-modal">
    <div class="rb-modal-box">
      <h3>🚀 Sblocca analisi completa</h3>
      <p>Senza dati completi rischi di perdere migliaia di euro.</p>
      <button id="rb-upgrade-btn" class="rb-btn primary">🔥 Sblocca ora</button>
      <span id="rb-close-modal">Continua senza</span>
    </div>
  </div>
  `;

  applyCityBackground();
  initHeaderInteractions();

  onAuthStateChanged(auth, (user) => {
    waitPlanAndRender(user);
  });

});

// =====================
// ⏳ WAIT PLAN (FIX TIMING BUG DEFINITIVO)
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

      // 🔥 render utente
      renderUser(user);

      // 🔥 FIX CRITICO → RESET DOPO PLAN (ANTI BLUR BUG)
      setTimeout(()=>{

        const isAdmin =
          (window.userRole || "").toLowerCase() === "admin" ||
          window.currentUser?.email === "rendimentobb@gmail.com";

        const isPro = isAdmin || access.isPro;
        const isInvestor = access.isInvestor;

        console.log("🔓 FORCE UI STATE:", {
          isPro,
          isInvestor
        });

        // ===============================
        // 💣 RESET CLASSI BODY
        // ===============================
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

        // ===============================
        // 💣 RESET UI TOTALE (BLUR FIX)
        // ===============================
        document.querySelectorAll(".locked-section").forEach(el=>{
          el.classList.remove("is-locked");
          el.style.filter = "none";
          el.style.opacity = "1";
          el.style.pointerEvents = "auto";
        });

        // vecchi sistemi
        document.querySelectorAll(`
          .pro-blur,
          .locked,
          .blur
        `).forEach(el=>{
          el.style.filter = "none";
          el.style.pointerEvents = "auto";
          el.style.opacity = "1";
        });

        // overlay
        document.querySelectorAll(`
          .locked-overlay,
          .results-overlay,
          .home-blur-overlay,
          .upgrade-overlay
        `).forEach(el=> el.remove());

        // fallback globale
        if(typeof unlockUI === "function"){
          unlockUI();
        }

        console.log("✅ UI RESET COMPLETATO");

      },120);

    }

  },120);

}
// =====================
// 📱 INTERAZIONI
// =====================

function initHeaderInteractions(){

  const burger = document.getElementById("rb-burger");
  const mobile = document.getElementById("rb-mobile");
  const overlay = document.getElementById("rb-mobile-overlay");

  burger.onclick = ()=>{
    mobile.classList.toggle("open");
    overlay.classList.toggle("open");
  };

  overlay.onclick = ()=>{
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

  const access = window.getUserAccess?.() || {};

  if(user){

    const badge =
      access.isPro ? "PRO" :
      access.isInvestor ? "INVESTOR" :
      "FREE";

    el.innerHTML = `
      <a href="/dashboard/" class="rb-btn primary">
        Dashboard <span class="badge-pro">${badge}</span>
      </a>
      <button id="logout" class="rb-btn red">Logout</button>
    `;

    document.getElementById("logout").onclick = async ()=>{
      await signOut(auth);
      location.reload();
    };

  } else {
    el.innerHTML = `<a href="/login/">Accedi</a>`;
  }

}

/* =====================
📱 MENU + LANG
===================== */

function initHeaderInteractions(){

  const burger = document.getElementById("rb-burger");
  const mobile = document.getElementById("rb-mobile");
  const overlay = document.getElementById("rb-mobile-overlay");

  function openMenu(){
    mobile.classList.add("open");
    overlay.classList.add("open");
    document.body.classList.add("menu-open");
  }

  function closeMenu(){
    mobile.classList.remove("open");
    overlay.classList.remove("open");
    document.body.classList.remove("menu-open");
  }

  if(burger){
    burger.onclick = (e)=>{
      e.stopPropagation();
      mobile.classList.contains("open") ? closeMenu() : openMenu();
    };
  }

  if(overlay){
    overlay.onclick = closeMenu;
  }

  // 🌐 LANG
  document.querySelectorAll(".rb-lang button").forEach(btn=>{
    btn.onclick = ()=>{
      const lang = btn.dataset.lang;
      localStorage.setItem("rb_lang", lang);

      if(window.setLang) window.setLang(lang);

      updateLangButtons(lang);

      // 🔥 re-render safe
      if(typeof renderUser === "function"){
        renderUser(window.currentUser || null);
      }
    };
  });

  updateLangButtons(localStorage.getItem("rb_lang") || "it");

  // 🔥 HEADER SCROLL UX
  window.addEventListener("scroll", () => {

    const header = document.querySelector(".rb-header");
    if(!header) return;

    if(window.scrollY > 20){
      header.style.background = "rgba(255,255,255,0.96)";
      header.style.boxShadow = "0 12px 40px rgba(2,6,23,0.08)";
      header.style.backdropFilter = "blur(10px)";
    } else {
      header.style.background = "rgba(255,255,255,0.7)";
      header.style.boxShadow = "none";
      header.style.backdropFilter = "blur(6px)";
    }

  });

}

/* =====================
🌐 LANG BUTTON STATE
===================== */

function updateLangButtons(lang){
  document.querySelectorAll(".rb-lang button").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

/* =====================
👤 USER AREA (FIXED)
===================== */

function renderUser(user){

  const el = document.getElementById("user-area");
  if(!el) return;

  const access = window.getUserAccess?.() || {};

  const isAdmin =
    user?.email === "rendimentobb@gmail.com" ||
    (window.userRole || "").toLowerCase() === "admin";

  const isPro = isAdmin || access.isPro;
  const isInvestor = access.isInvestor;
  const isPaid = isPro || isInvestor;

  if(user){

    let badge = "FREE";

    if(isAdmin) badge = "ADMIN";
    else if(isPro) badge = "PRO";
    else if(isInvestor) badge = "INVESTOR";

    el.innerHTML = `
      <div class="rb-user">

        <a href="${isPaid ? "/dashboard/" : "#"}" 
           class="rb-btn ${isPaid ? "primary" : "locked"}"
           id="dashboard-link">

          Dashboard
          <span class="badge-pro">${badge}</span>

        </a>

        ${isAdmin ? `<a href="/dashboard-leads/" class="rb-btn secondary">Leads</a>` : ""}

        <button id="logout" class="rb-btn red">Logout</button>

      </div>
    `;

    // =====================
    // 🔒 FREE BLOCK
    // =====================
    if(!isPaid){

      const dashBtn = document.getElementById("dashboard-link");

      if(dashBtn){
        dashBtn.onclick = (e)=>{
          e.preventDefault();
          openProModal();
        };
      }

    }

    // =====================
    // 📱 MOBILE NAV
    // =====================

    const mobileNav = document.getElementById("rb-mobile-nav");

    if(mobileNav){

      mobileNav.innerHTML = `
        <a href="/tool/">Simulatore</a>
        <a href="/aprire-bnb-conviene/">Aprire un B&B</a>
        <a href="/mutui/">Mutui</a>
        <a href="/immobili/">Immobili</a>
        <a href="/academy/">Academy</a>
        <hr>
        <a href="${isPaid ? "/dashboard/" : "#"}" id="mobile-dashboard">Dashboard</a>
        ${isAdmin ? `<a href="/dashboard-leads/">Leads</a>` : ""}
        <a href="#" id="mobile-logout">Logout</a>
      `;

      const mobileLogout = document.getElementById("mobile-logout");

      if(mobileLogout){
        mobileLogout.onclick = async (e)=>{
          e.preventDefault();
          await signOut(auth);
          location.reload();
        };
      }

      if(!isPaid){
        const mobileDash = document.getElementById("mobile-dashboard");
        if(mobileDash){
          mobileDash.onclick = (e)=>{
            e.preventDefault();
            openProModal();
          };
        }
      }

    }

    // =====================
    // 🔓 LOGOUT
    // =====================

    const logoutBtn = document.getElementById("logout");

    if(logoutBtn){
      logoutBtn.onclick = async ()=>{
        await signOut(auth);
        location.reload();
      };
    }

  } else {

    el.innerHTML = `
      <a href="/login/" class="rb-login">Accedi</a>
    `;
  }

}

window.renderUser = renderUser;

/* =====================
🔒 MODAL PRO
===================== */

window.openProModal = function(){
  const modal = document.getElementById("rb-pro-modal");
  if(modal) modal.classList.add("open");
};

window.closeProModal = function(){
  const modal = document.getElementById("rb-pro-modal");
  if(modal) modal.classList.remove("open");
};

// EVENTI GLOBALI
document.addEventListener("click", (e)=>{

  if(e.target?.id === "rb-close-modal"){
    closeProModal();
  }

  if(e.target?.id === "rb-upgrade-btn"){
    window.location.href = "/#pricing";
  }

});
