/* =====================================
🔥 RENDIMENTOBB HEADER – ULTRA PRODUCTION (FINAL)
===================================== */

import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const GA_MEASUREMENT_ID = "G-749B8PW4ST";
const RB_CONSENT_KEY = "rb_analytics_consent_v1";

window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){
  window.dataLayer.push(arguments);
};

window.gtag("consent", "default", {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied"
});

function loadGoogleAnalytics(){
  if(window.__rbGA4Initialized) return;

  window.__rbGA4Initialized = true;

  if(!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)){
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);
}

function getAnalyticsConsent(){
  try{
    return localStorage.getItem(RB_CONSENT_KEY);
  }catch(error){
    return null;
  }
}

function setAnalyticsConsent(value){
  try{
    localStorage.setItem(RB_CONSENT_KEY, value);
  }catch(error){
    // The preference still applies for the current page if storage is unavailable.
  }

  window.gtag("consent", "update", {
    analytics_storage: value === "granted" ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });

  if(value === "granted") loadGoogleAnalytics();
}

if(getAnalyticsConsent() === "granted"){
  setAnalyticsConsent("granted");
}

function initializeConsentUI(){
  if(document.getElementById("rb-consent-style")) return;

  const style = document.createElement("style");
  style.id = "rb-consent-style";
  style.textContent = `
    .rb-consent{position:fixed;inset:auto 20px 20px 20px;z-index:2147483000;display:flex;align-items:center;gap:22px;max-width:980px;margin:auto;padding:20px 22px;border:1px solid #dbe7e4;border-radius:18px;background:#fff;color:#0b1730;box-shadow:0 18px 55px rgba(2,18,38,.2);font:500 14px/1.5 Inter,system-ui,sans-serif}
    .rb-consent[hidden]{display:none}.rb-consent__copy{flex:1}.rb-consent__copy strong{display:block;margin-bottom:4px;font-size:17px}.rb-consent__copy p{margin:0;color:#516078}.rb-consent__copy a{color:#008f67;font-weight:700}
    .rb-consent__actions{display:flex;gap:10px;flex-wrap:wrap}.rb-consent button{min-height:44px;padding:0 18px;border:1px solid #cfdcd9;border-radius:12px;background:#fff;color:#0b1730;font:700 14px Inter,system-ui,sans-serif;cursor:pointer}.rb-consent button[data-choice="granted"]{border-color:#08b782;background:#08b782;color:#fff}
    .rb-consent-settings{position:fixed;left:16px;bottom:16px;z-index:2147482999;padding:9px 13px;border:1px solid #dbe7e4;border-radius:999px;background:#fff;color:#30425d;box-shadow:0 8px 24px rgba(2,18,38,.14);font:700 12px Inter,system-ui,sans-serif;cursor:pointer}.rb-consent-settings[hidden]{display:none}
    @media(max-width:720px){.rb-consent{inset:auto 12px 12px 12px;display:block;padding:18px}.rb-consent__actions{margin-top:15px}.rb-consent button{flex:1;padding:0 12px}.rb-consent-settings{left:10px;bottom:10px}}
  `;
  document.head.appendChild(style);

  const banner = document.createElement("section");
  banner.id = "rb-consent";
  banner.className = "rb-consent";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-modal", "true");
  banner.setAttribute("aria-labelledby", "rb-consent-title");

  const settings = document.createElement("button");
  settings.type = "button";
  settings.className = "rb-consent-settings";
  settings.hidden = true;

  function renderConsentLanguage(){
    const english = (localStorage.getItem("rb_lang") || "it") === "en";
    banner.innerHTML = english ? `
      <div class="rb-consent__copy"><strong id="rb-consent-title">Your privacy, your choice</strong><p>We use essential storage to operate the site. With your permission, Google Analytics helps us understand aggregated usage. Advertising storage remains disabled. <a href="/privacy.html">Privacy policy</a></p></div>
      <div class="rb-consent__actions"><button type="button" data-choice="denied">Reject analytics</button><button type="button" data-choice="granted">Accept analytics</button></div>` : `
      <div class="rb-consent__copy"><strong id="rb-consent-title">La tua privacy, la tua scelta</strong><p>Usiamo l’archiviazione essenziale per il funzionamento del sito. Con il tuo consenso, Google Analytics ci aiuta a capire l’utilizzo in forma aggregata. La pubblicità resta disattivata. <a href="/privacy.html">Privacy policy</a></p></div>
      <div class="rb-consent__actions"><button type="button" data-choice="denied">Rifiuta analytics</button><button type="button" data-choice="granted">Accetta analytics</button></div>`;
    settings.textContent = english ? "Cookie settings" : "Preferenze cookie";
  }

  function showBanner(){
    settings.hidden = true;
    banner.hidden = false;
  }

  banner.addEventListener("click", event => {
    const choice = event.target.closest("[data-choice]")?.dataset.choice;
    if(!choice) return;
    setAnalyticsConsent(choice);
    banner.hidden = true;
    settings.hidden = false;
  });
  settings.addEventListener("click", showBanner);
  document.addEventListener("rb_language_changed", renderConsentLanguage);

  renderConsentLanguage();
  document.body.append(banner, settings);

  if(getAnalyticsConsent()){
    banner.hidden = true;
    settings.hidden = false;
  }
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", initializeConsentUI, { once: true });
}else{
  initializeConsentUI();
}

// ===============================
// 🔧 GLOBAL UNLOCK FALLBACK (FIX ERROR)
// ===============================

window.unlockUI = function(){


  // rimuove blur globale
  document.querySelectorAll(".pro-blur, .locked, .blur").forEach(el=>{
    el.style.filter = "none";
    el.style.pointerEvents = "auto";
    el.style.opacity = "1";
  });

  // rimuove eventuali overlay
  document.querySelectorAll(".locked-overlay, .results-overlay").forEach(el=>{
    el.remove();
  });

};

// ===============================
// 🔥 GLOBAL PRO MODAL (FIX)
// ===============================
window.openProModal = function(){


  const modal = document.getElementById("rb-pro-modal");
  if(!modal) return;

  // 🔥 OPEN
  modal.classList.add("open");
  document.body.classList.add("rb-ui-modal-open");

  // 🔥 CLOSE HANDLER
  function closeModal(){
    modal.classList.remove("open");
    document.body.classList.remove("rb-ui-modal-open");
    
  }

  // chiusura click
  const close = document.getElementById("rb-close-modal");
  if(close){
    close.onclick = closeModal;
  }

  // click fuori (overlay)
  modal.onclick = (e)=>{
    if(e.target === modal){
      closeModal();
    }
  };

  // upgrade
  const btn = document.getElementById("rb-upgrade-btn");
  if(btn){
    btn.onclick = () => {
      closeModal();
      window.startPlanPurchase?.("pro");
    };
  }

};

// 💣 SAFETY RESET (ANTI-GHOST MODAL)
document.addEventListener("rb_plan_loaded", ()=>{
  document.body.classList.remove("rb-ui-modal-open");

  const modal = document.getElementById("rb-pro-modal");
  if(modal){
    modal.classList.remove("open");
  }

  });

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

// 🔥 FIX MARKET GENERALE (CRITICO)
if(path === "/market/" || path === "/market"){
  city = "rome"; // fallback elegante
}
else if(path.includes("milano")) city = "milan";
else if(path.includes("napoli")) city = "naples";
else if(path.includes("firenze")) city = "florence";
else if(path.includes("roma")) city = "rome";

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
  <a href="/tool/"
data-it="Analizza"
data-en="Analyze">

Analizza

</a>

  <a href="/aprire-bnb-conviene/" data-it="Aprire un B&B" data-en="Start a B&B">
    Aprire un B&B
  </a>

  <a href="/mutui/" data-it="Mutui" data-en="Mortgages">
    Mutui
  </a>

  <a href="/market/" data-it="Mercato" data-en="Market">
    Mercato
  </a>

<a href="/immobili/"
data-it="Trova immobili"
data-en="Find Properties">

Trova immobili

</a>

<a href="/academy/"
data-it="Guide"
data-en="Guides">

Guide

</a>

  <a href="/about/" data-it="Chi siamo" data-en="About">
    Chi siamo
  </a>
</nav>

      <div class="rb-right">

        <div class="rb-lang">
          <button data-lang="it">IT</button>
          <button data-lang="en">EN</button>
        </div>

        <button
        id="rb-header-ai-btn"
        class="rb-header-ai-btn">
          <span
          class="rb-assistant-label-desktop"
          data-it="Assistente"
          data-en="Assistant">Assistente</span>
          <span
          class="rb-assistant-label-mobile"
          data-it="Aiuto"
          data-en="Help">Aiuto</span>
        </button>

        <div id="user-area"></div>

        <button id="rb-burger">☰</button>

      </div>

    </div>

  </header>

<div id="rb-mobile-overlay" class="rb-menu-overlay"></div>

<div id="rb-mobile" class="rb-mobile-menu">
  <nav id="rb-mobile-nav">

    <a href="/tool/" 
    data-it="Analizza" 
    data-en="Analyze">
    Analizza
    </a>

    <a href="/aprire-bnb-conviene/" 
    data-it="Aprire un B&B" 
    data-en="Start a B&B">
    Aprire un B&B
    </a>

    <a href="/mutui/" 
    data-it="Mutui" 
    data-en="Mortgages">
    Mutui
    </a>

    <a href="/market/" 
    data-it="Mercato" 
    data-en="Market">
    Mercato
    </a>

    <a href="/immobili/" 
    data-it="Trova immobili" 
    data-en="Find Properties">
    Trova immobili
    </a>

    <a href="/academy/" 
    data-it="Guide" 
    data-en="Guides">
    Guide
    </a>

    <a href="/about/" 
    data-it="Chi siamo" 
    data-en="About">
    Chi siamo
    </a>

  </nav>

    <div class="rb-mobile-lang">

  <span
    data-it="Lingua"
    data-en="Language">
    Lingua
  </span>

  <div class="rb-mobile-lang-buttons">

    <button type="button" data-lang="it">
      🇮🇹 IT
    </button>

    <button type="button" data-lang="en">
      🇬🇧 EN
    </button>

  </div>

</div>
  
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

  window.currentUser = user;

  // 👻 GUEST → render immediato
  if(!user){
  // 🔥 aspetta comunque RB_USER fallback
  setTimeout(()=>{
    renderUser(null);
  }, 100);
  return;
}

  // 🔥 utente loggato → aspetta RB_USER
  let attempts = 0;

  const interval = setInterval(()=>{

    attempts++;

    const RB = window.RB_USER;

    if(!window.getUserAccess){
  return;
}

    // 🔥 WAIT REAL ACCESS CLASS
const hasRealAccess =
  RB &&
  typeof RB.isFree === "boolean" &&
  typeof RB.isInvestor === "boolean" &&
  typeof RB.isPro === "boolean" &&
  typeof RB.isAdmin === "boolean";

if(hasRealAccess){

  
  clearInterval(interval);

  renderUser(user);

      // ===============================
      // 🔥 INVESTOR CLEAN (TEASER MODE)
      // ===============================
     if(RB.isInvestor && !RB.isPro){


  // rimuove SOLO hard lock
  document.querySelectorAll(".locked-overlay, .hard-lock").forEach(el=>{
    el.remove();
  });

  // ❌ NON applicare blur qui (lo gestisce app.js)
}

      // ===============================
      // 🔥 ACCESS CONTROL UI
      // ===============================

      // 🟢 PRO / ADMIN → FULL
      if(RB.isPro || RB.isAdmin){
        
        unlockUI();
      }

     else if(RB.isInvestor){


  // 💣 NON toccare UI → gestita da app.js (PRO-LIKE)

  // pulizia SOLO sicurezza (no override logica)
  document.querySelectorAll(`
    .locked-overlay,
    .hard-lock
  `).forEach(el=>{
    el.remove();
  });

}

      // 🔴 FREE → BLOCCATO
      else{
        
      }

      return;
    }

    if(attempts > 40){
      console.warn("⚠️ HEADER fallback");

      clearInterval(interval);

      renderUser(user);
    }

  }, 120);

});

  });
/* =====================
📱 MENU + LANG
===================== */
function initHeaderInteractions(){

  const burger = document.getElementById("rb-burger");
  const mobile = document.getElementById("rb-mobile");
  const overlay = document.getElementById("rb-mobile-overlay");

  if(!burger || !mobile || !overlay) return;

  // 💣 FIX CRITICO OVERLAY BLOCCATO
  if(overlay){
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    overlay.classList.remove("open");
  }

  function openMenu(){
    mobile.classList.add("open");

    overlay.classList.add("open");
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";

    document.body.classList.add("menu-open");
  }

  function closeMenu(){
    mobile.classList.remove("open");

    overlay.classList.remove("open");
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";

    document.body.classList.remove("menu-open");
  }

  burger.onclick = (e)=>{
    e.stopPropagation();
    mobile.classList.contains("open") ? closeMenu() : openMenu();
  };

  overlay.onclick = closeMenu;

  document.querySelectorAll(
  ".rb-lang button, .rb-mobile-lang button"
).forEach(btn=>{
    btn.onclick = ()=>{
      const lang = btn.dataset.lang;
      localStorage.setItem("rb_lang", lang);
      if(window.setLang) window.setLang(lang);
      updateLangButtons(lang);
      renderUser(auth.currentUser || null);
    };
  });

  updateLangButtons(localStorage.getItem("rb_lang") || "it");

  // 🔥 SYNC PLAN
  window.addEventListener("rb_plan_ready", ()=>{
    renderUser(auth.currentUser || null);
  });

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

  // 🔥 HARD SAFETY RESET (CORRETTO)
  setTimeout(()=>{
    if(overlay && !mobile.classList.contains("open")){
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
    }
  }, 800);

// =====================================
// 🤖 HEADER AI BUTTON
// =====================================

const aiBtn =
  document.getElementById(
    "rb-header-ai-btn"
  );

if(aiBtn){

  aiBtn.onclick = ()=>{


    // aspetta chatbot render
    setTimeout(()=>{

      const chatbot =
        document.getElementById(
          "rb-chatbot-window"
        );

      if(!chatbot){

        console.warn(
          "❌ chatbot window missing"
        );

        return;

      }

      chatbot.classList.toggle("open");


    }, 50);

  };

}

}  
/* =====================
🌐 LANG
===================== */

function updateLangButtons(lang){
  document.querySelectorAll(
  ".rb-lang button, .rb-mobile-lang button"
).forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

/* =====================
👤 USER AREA (FIXED + SaaS LOGIC)
===================== */

function renderUser(user){

  const el = document.getElementById("user-area");
  if(!el) return;

  const access = window.getUserAccess?.() || {
  isLogged: !!user,
  isFree: true,
  isPro: false,
  isInvestor: false,
  isAdmin: false
};

  // ⏳ EVITA FREE DURANTE LOAD
if(
  user &&
  (
    window.currentPlan === null ||
    window.currentPlan === undefined
  )
){
  
  return;
}
  if(window.RB_DEBUG === true){


}

  const isAdmin = access.isAdmin;

  const isInvestor = access.isInvestor;
  const isPro = access.isPro;
  const isPaid = isAdmin || access?.isInvestor || access?.isPro;

  const isProOnly = isPro && !isInvestor;

  if(user){

    let html = `<div class="rb-user">`;

    // =====================
    // 🎯 BADGE LOGIC (CLEAN)
    // =====================
    let badge = "";

if(isAdmin){
  badge = `<span class="badge-pro">ADMIN</span>`;
}
else if(access.isPro){
  badge = `<span class="badge-pro">PRO</span>`;
}
else if(access.isInvestor){
  badge = `<span class="badge-pro">INVESTOR</span>`;
}
else{
  badge = `<span class="badge-pro">FREE</span>`;
}

// =====================
// 🔥 DASHBOARD BUTTON
// =====================

const isMobile =
  window.innerWidth <= 768;

if(!isMobile){

  html += `

    <a href="/dashboard/"
       class="rb-btn primary"
       id="dashboard-link">

       <span
class="dashboard-label">

📊 Dashboard

</span>

    </a>

    ${badge}

  `;

}

    // ADMIN ONLY
    if(isAdmin){
      html += `<a href="/dashboard-leads/" class="rb-btn secondary">Leads</a>`;
    }

    html += `<button id="logout" class="rb-btn red">Logout</button>`;
    html += `</div>`;

    el.innerHTML = html;

    // =====================
    // 📱 MOBILE MENU
    // =====================

    const mobileNav = document.getElementById("rb-mobile-nav");

    if(mobileNav){

      let mobileHTML = `
  <a href="/tool/" data-it="Analizza" data-en="Simulator">Analizza</a>
  <a href="/aprire-bnb-conviene/" data-it="Aprire un B&B" data-en="Start a B&B">Aprire un B&B</a>
  <a href="/mutui/" data-it="Mutui" data-en="Mortgages">Mutui</a>
  <a href="/market/" data-it="Mercato" data-en="Market">Mercato</a>
  <a href="/immobili/" data-it="Immobili" data-en="Properties">Immobili</a>
  <a href="/academy/" data-it="Guide" data-en="Guides">Guide</a>
  <a href="/about/" data-it="Chi siamo" data-en="About">Chi siamo</a>
  <a href="#"
  id="mobile-ai-btn"
class="mobile-cta"
data-it="Assistente RendimentoBB"
data-en="RendimentoBB Assistant">
Assistente RendimentoBB
</a>

  <hr>

  <a href="/tool/" class="mobile-cta">
    🚀 <span data-it="Analizza un investimento" data-en="Analyze an investment">Analizza un investimento</span>
  </a>
`;

      if(user){

        mobileHTML += `<hr>`;

        mobileHTML += `
  <a href="/dashboard/"
     id="mobile-dashboard">
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

    <a
      href="/dashboard/"
      data-it="📊 Live Demo"
      data-en="📊 Live Demo">
      📊 Live Demo
    </a>

    <a
      href="/login/"
      data-it="Accedi"
      data-en="Login">
      Accedi
    </a>

  `;
}

      mobileNav.innerHTML = mobileHTML;

      if(typeof applyStaticTranslations === "function"){
  applyStaticTranslations();
}

      // LOGOUT MOBILE
      const mobileLogout = document.getElementById("mobile-logout");
      if(mobileLogout){
        mobileLogout.onclick = async (e)=>{
          e.preventDefault();
          await signOut(auth);
          location.reload();
        };
      }

      // BLOCCO MOBILE DASHBOARD
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
    // 🔒 HARD BLOCK (FREE)
    // =====================
    /*
    if(!isPaid){

      const dashBtn = document.getElementById("dashboard-link");

      if(dashBtn){
        dashBtn.onclick = (e)=>{
          e.preventDefault();
          e.stopPropagation();
          openProModal();
        };
      }

      document.querySelectorAll('a[href="/dashboard/"]').forEach(link=>{
        link.addEventListener("click", (e)=>{
          e.preventDefault();
          e.stopPropagation();
          openProModal();
        });
      });

    }
    */

   // LOGOUT
document.getElementById("logout").onclick = async ()=>{
  await signOut(auth);
  location.reload();
};

}

  else {

  const isMobile =
    window.innerWidth <= 768;

  if(isMobile){

    el.innerHTML = "";

    const mobileNav =
      document.getElementById(
        "rb-mobile-nav"
      );

    if(mobileNav){

     mobileNav.innerHTML = `

  <a
    href="/tool/"
    data-it="Analizza"
    data-en="Analyze">
    Analizza
  </a>

  <a
    href="/aprire-bnb-conviene/"
    data-it="Aprire un B&B"
    data-en="Start a B&B">
    Aprire un B&B
  </a>

  <a
    href="/mutui/"
    data-it="Mutui"
    data-en="Mortgages">
    Mutui
  </a>

  <a
    href="/market/"
    data-it="Mercato"
    data-en="Market">
    Mercato
  </a>

  <a
    href="/immobili/"
    data-it="Trova immobili"
    data-en="Find properties">
    Trova immobili
  </a>

  <a
    href="/academy/"
    data-it="Guide"
    data-en="Guides">
    Guide
  </a>

  <a
    href="/about/"
    data-it="Chi siamo"
    data-en="About">
    Chi siamo
  </a>

  <hr>

  <a
    href="#"
    id="mobile-ai-btn"
    class="mobile-cta"
    data-it="Assistente RendimentoBB"
    data-en="RendimentoBB Assistant">
    Assistente RendimentoBB
  </a>

  <hr>

  <a
    href="/tool/"
    class="mobile-cta"
    data-it="🚀 Analizza un investimento"
    data-en="🚀 Analyze an investment">
    🚀 Analizza un investimento
  </a>

  <hr>

  <a
    href="/dashboard/"
    class="mobile-cta"
    data-it="📊 Live Demo"
    data-en="📊 Live Demo">
    📊 Live Demo
  </a>

  <a
    href="/login/"
    class="mobile-cta"
    data-it="🔐 Accedi"
    data-en="🔐 Login">
    🔐 Accedi
  </a>

`;

if(typeof applyStaticTranslations === "function"){
  applyStaticTranslations();
}
    }

  }else{

    el.innerHTML = `

      <a
      href="/dashboard/"
      class="rb-btn primary">

      📊 Live Demo

      </a>

      <a
href="/login/"
class="rb-login">

<span
data-it="Accedi"
data-en="Login">

Accedi

</span>

</a>

    `;

  }

}

}  
