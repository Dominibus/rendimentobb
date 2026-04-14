/* =====================================
🔥 RENDIMENTOBB HEADER – ULTRA PRODUCTION (FINAL)
===================================== */

import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

/* =====================
🎨 HERO BG
===================== */

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

/* =====================
🚀 INIT HEADER
===================== */

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
        <a href="/tool/" data-it="Simulatore" data-en="Simulator">Simulatore</a>
        <a href="/aprire-bnb-conviene/" data-it="Aprire un B&B" data-en="Start a B&B">Aprire un B&B</a>
        <a href="/mutui/" data-it="Mutui" data-en="Mortgages">Mutui</a>
        <a href="/immobili/" data-it="Immobili" data-en="Properties">Immobili</a>
        <a href="/academy/" data-it="Academy" data-en="Academy">Academy</a>
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
    <nav id="rb-mobile-nav">
      <a href="/tool/">Simulatore</a>
      <a href="/aprire-bnb-conviene/">Aprire un B&B</a>
      <a href="/mutui/">Mutui</a>
      <a href="/immobili/">Immobili</a>
      <a href="/academy/">Academy</a>
    </nav>
  </div>

  <!-- 🔥 MODAL PRO -->
  <div id="rb-pro-modal" class="rb-modal">
  <div class="rb-modal-box">

    <h3
      data-it="🚀 Sblocca analisi completa"
      data-en="🚀 Unlock full analysis">
      🚀 Sblocca analisi completa
    </h3>

    <p
      data-it="Stai analizzando un investimento reale. Senza dati completi rischi di perdere migliaia di euro."
      data-en="You are analyzing a real investment. Without full data you risk losing thousands.">
    </p>

    <ul>
      <li data-it="✔ ROI reale avanzato" data-en="✔ Advanced real ROI"></li>
      <li data-it="✔ Analisi mutuo completa" data-en="✔ Full mortgage analysis"></li>
      <li data-it="✔ Scenario rischio" data-en="✔ Risk scenarios"></li>
      <li data-it="✔ Report professionale" data-en="✔ Professional report"></li>
    </ul>

    <button id="rb-upgrade-btn" class="rb-btn primary"
      data-it="🔥 Sblocca ora – €29"
      data-en="🔥 Unlock now – €29">
    </button>

    <span class="continue-free"
      id="rb-close-modal"
      data-it="Continua senza"
      data-en="Continue free">
    </span>

  </div>
</div>

  `;

  // 🔥 TRADUZIONE IMMEDIATA HEADER + MODAL
if(typeof applyStaticTranslations === "function"){
  applyStaticTranslations();
}

  window.applyCityBackground();
  initHeaderInteractions();

  // 🔥 SYNC TRADUZIONE DINAMICA (HEADER + MODAL)
document.addEventListener("rb_language_changed", () => {
  if(typeof applyStaticTranslations === "function"){
    applyStaticTranslations();
  }
});

  onAuthStateChanged(auth, (user) => {
  waitPlanAndRender(user);

  // 🔥 FORCE UPDATE MENU MOBILE
  setTimeout(()=>{
    renderUser(auth.currentUser);
  }, 200);
});

});

/* =====================
⏳ WAIT PLAN
===================== */

function waitPlanAndRender(user){

  let attempts = 0;

  window.headerRendered = false;

  const interval = setInterval(()=>{

    attempts++;

    const access = window.getUserAccess();

const ready =
  access !== undefined &&
  typeof access === "object";

    if(ready || attempts > 20){

  clearInterval(interval);

  // 🔥 PRIMO RENDER
  renderUser(user);

// 🔒 SBLOCCA SOLO SE PRO
const access = window.getUserAccess();

const isAdmin =
  (window.userRole || "").toLowerCase() === "admin" ||
  window.currentUser?.email === "rendimentobb@gmail.com";

const isPro = isAdmin || access.hasPlan;

if(isPro){
  unlockUI();
}

  // 🔥 SICUREZZA: re-render dopo micro delay (fix flicker Firebase)
  setTimeout(()=>{
    renderUser(auth.currentUser || null);
  }, 50);

}

  },120);

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

  burger.onclick = (e)=>{
    e.stopPropagation();
    mobile.classList.contains("open") ? closeMenu() : openMenu();
  };

  overlay.onclick = closeMenu;

  document.querySelectorAll(".rb-lang button").forEach(btn=>{
    btn.onclick = ()=>{
      const lang = btn.dataset.lang;
      localStorage.setItem("rb_lang", lang);
      if(window.setLang) window.setLang(lang);
      updateLangButtons(lang);
      renderUser(auth.currentUser || null);
    };
  });

  updateLangButtons(localStorage.getItem("rb_lang") || "it");

 
  // 🔥 SYNC IMMEDIATO QUANDO CAMBIA PIANO
window.addEventListener("rb_plan_ready", ()=>{
  renderUser(auth.currentUser || null);
});

  // 🔥 HEADER SCROLL EFFECT
window.addEventListener("scroll", () => {

  const header = document.querySelector(".rb-header");
  if(!header) return;

  if(window.scrollY > 20){
    header.style.background = "rgba(255,255,255,0.95)";
    header.style.boxShadow = "0 10px 30px rgba(2,6,23,0.08)";
  } else {
    header.style.background = "rgba(255,255,255,0.7)";
    header.style.boxShadow = "none";
  }

});
}

/* =====================
🌐 LANG
===================== */

function updateLangButtons(lang){
  document.querySelectorAll(".rb-lang button").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

/* =====================
👤 USER AREA
===================== */

function renderUser(user){

  const el = document.getElementById("user-area");

  const clean = (v)=>String(v || "").toLowerCase().trim();

 const access = window.getUserAccess();

const isAdmin =
  user?.email === "rendimentobb@gmail.com" ||
  clean(window.userRole) === "admin";

const isInvestor = access.isInvestor;
const isPro = access.isPro;
const isPaid = access.hasPlan;

  if(user){

    let html = `<div class="rb-user">`;

    // 🔥 DASHBOARD (ANTI BYPASS)
    html += `
      <a href="${isPaid ? "/dashboard/" : "#"}" 
         class="rb-btn ${isPaid ? "primary" : "locked"}"
         id="dashboard-link">
         Dashboard

         ${isInvestor ? `<span class="badge-pro">INVESTOR</span>` : ""}
         ${isPro ? `<span class="badge-pro">PRO</span>` : ""}
         ${(!isPaid) ? `<span class="badge-pro">LOCK</span>` : ""}
      </a>
    `;

    // LEADS
    if(isAdmin){
  html += `<a href="/dashboard-leads/" class="rb-btn secondary">Leads</a>`;
}

    html += `<button id="logout" class="rb-btn red">Logout</button>`;
    html += `</div>`;

    el.innerHTML = html;

    // =====================
    // 📱 MOBILE MENU DINAMICO (ANTI BYPASS)
    // =====================

    const mobileNav = document.getElementById("rb-mobile-nav");

    if(mobileNav){

      let mobileHTML = `
        <a href="/tool/">Simulatore</a>
        <a href="/aprire-bnb-conviene/">Aprire un B&B</a>
        <a href="/mutui/">Mutui</a>
        <a href="/immobili/">Immobili</a>
        <a href="/academy/">Academy</a>
      `;

      if(user){

        mobileHTML += `<hr>`;

        // 🔥 DASHBOARD MOBILE BLOCCATA SE FREE
        mobileHTML += `
          <a href="${isPaid ? "/dashboard/" : "#"}" id="mobile-dashboard">
            Dashboard
          </a>
        `;

        if(isAdmin){
          mobileHTML += `<a href="/dashboard-leads/">Leads</a>`;
        }

        mobileHTML += `<a href="#" id="mobile-logout">Logout</a>`;

      } else {

        mobileHTML += `
          <hr>
          <a href="/login/">Login</a>
        `;
      }

      mobileNav.innerHTML = mobileHTML;

      // 🔥 LOGOUT MOBILE
      const mobileLogout = document.getElementById("mobile-logout");

      if(mobileLogout){
        mobileLogout.onclick = async (e)=>{
          e.preventDefault();
          await signOut(auth);
          location.reload();
        };
      }

      // 🔥 BLOCCO HARD DASHBOARD MOBILE
      if(!isPaid){
        const mobileDash = document.getElementById("mobile-dashboard");
        if(mobileDash){
          mobileDash.onclick = (e)=>{
            e.preventDefault();
            e.stopPropagation();
            openProModal();
          };
        }
      }
    }

    // =====================
    // 🔥 BLOCCO HARD UNIVERSALE
    // =====================

    if(!isPaid){

      // DESKTOP BUTTON
      const dashBtn = document.getElementById("dashboard-link");
      if(dashBtn){
        dashBtn.onclick = (e)=>{
          e.preventDefault();
          e.stopPropagation();
          openProModal();
        };
      }

      // QUALSIASI LINK DASHBOARD (ANTI SCRIPT ESTERNI)
      document.querySelectorAll('a[href="/dashboard/"]').forEach(link=>{
        link.addEventListener("click", (e)=>{
          e.preventDefault();
          e.stopPropagation();
          openProModal();
        });
      });

    }

      // LOGOUT DESKTOP
    document.getElementById("logout").onclick = async ()=>{
      await signOut(auth);
      location.reload();
    };

  } else {

    el.innerHTML = `
     <a href="/login/" class="rb-login"
     data-it="Accedi"
     data-en="Login">
     Accedi
     </a>`;

  }

}

// 🔥 EXPORT GLOBALE
window.renderUser = renderUser;

/* =====================
🔒 MODAL PRO (FIX DEFINITIVO)
===================== */

window.openProModal = function(){
  const modal = document.getElementById("rb-pro-modal");
  if(modal){
    modal.classList.add("open");
  }
};

window.closeProModal = function(){
  const modal = document.getElementById("rb-pro-modal");
  if(modal){
    modal.classList.remove("open");
  }
};

// INIT BUTTONS (dopo che il DOM è pronto)
document.addEventListener("click", (e)=>{

  if(e.target && e.target.id === "rb-close-modal"){
    closeProModal();
  }

  if(e.target && e.target.id === "rb-upgrade-btn"){
    window.location.href = "/pricing/";
  }

});
