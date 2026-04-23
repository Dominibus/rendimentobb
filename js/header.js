/* =====================================
🔥 RENDIMENTOBB HEADER – FINAL FIXED
===================================== */

import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// ===============================
// 🔧 GLOBAL UNLOCK
// ===============================
window.unlockUI = function(){

  document.querySelectorAll(".pro-blur, .locked, .blur").forEach(el=>{
    el.style.filter = "none";
    el.style.pointerEvents = "auto";
    el.style.opacity = "1";
  });

  document.querySelectorAll(".locked-overlay, .results-overlay").forEach(el=>{
    el.remove();
  });

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
        <a href="/"><img src="/img/logo-main.png" class="rb-logo"></a>
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
  `;

  if(typeof applyStaticTranslations === "function"){
    applyStaticTranslations();
  }

  window.applyCityBackground();
  initHeaderInteractions();

  // =====================
  // 🔐 AUTH
  // =====================
  onAuthStateChanged(auth, (user) => {

    window.currentUser = user;

    // 🔥 render immediato
    renderUser(user);

    // 🔥 quando RB_USER è pronto
    document.addEventListener("rb_plan_loaded", () => {

      console.log("🔥 HEADER SYNC PLAN");

      renderUser(window.currentUser);

      // 🔥 FIX DEFINITIVO INVESTOR
      setTimeout(()=>{
        const RB = window.RB_USER;
        if(RB && (RB.isInvestor || RB.isPro || RB.isAdmin)){
          renderUser(window.currentUser);
        }
      },200);

    });

  });

});

// =====================
// 📱 MENU
// =====================
function initHeaderInteractions(){

  const burger = document.getElementById("rb-burger");
  const mobile = document.getElementById("rb-mobile");
  const overlay = document.getElementById("rb-mobile-overlay");

  if(!burger) return;

  burger.onclick = ()=>{
    document.body.classList.toggle("menu-open");
  };

}

// =====================
// 👤 USER AREA
// =====================
function renderUser(user){

  const el = document.getElementById("user-area");
  if(!el) return;

  // 🔓 GUEST
  if(!user){
    el.innerHTML = `<a href="/login/" class="rb-login">Accedi</a>`;
    return;
  }

  const RB = window.RB_USER || {};

  // 🔥 UNICA FONTE VERITÀ
  const isAdmin = RB.isAdmin || user.email === "rendimentobb@gmail.com";
  const isPro = RB.isPro;
  const isInvestor = RB.isInvestor;

  const isPaid = isAdmin || isPro || isInvestor;

  let badge = "FREE";
  if(isAdmin) badge = "ADMIN";
  else if(isPro) badge = "PRO";
  else if(isInvestor) badge = "INVESTOR";

  el.innerHTML = `
    <div class="rb-user">
      <a href="${isPaid ? "/dashboard/" : "#"}" 
         class="rb-btn ${isPaid ? "primary" : "locked"}"
         id="dashboard-link">
        Dashboard <span class="badge-pro">${badge}</span>
      </a>

      <button id="logout" class="rb-btn red">Logout</button>
    </div>
  `;

  // 🔒 BLOCCO FREE
  if(!isPaid){
    document.getElementById("dashboard-link").onclick = (e)=>{
      e.preventDefault();
      openProModal();
    };
  }

  document.getElementById("logout").onclick = async ()=>{
    await signOut(auth);
    location.reload();
  };

}

// =====================
// 🔒 MODAL
// =====================
window.openProModal = function(){
  alert("Passa a PRO");
};
